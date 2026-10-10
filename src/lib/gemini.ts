import { GoogleGenAI, Type } from '@google/genai';
import type { EvaluationContext, EvaluationResult, ProcessedSlide } from '../types';

const EVALUATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overallAssessment: { 
      type: Type.STRING, 
      description: 'Evaluación general: "Correcto" (presentación bien), "Mejorable" (presentación suficiente), "Incompleta" (presentación insuficiente)' 
    },
    summary: { type: Type.STRING, description: 'Resumen general de la presentación en 2-3 frases' },
    criteria: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          score: { type: Type.NUMBER },
          maxScore: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
        },
        required: ['name', 'score', 'maxScore', 'feedback'],
      },
    },
    slides: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          slideNumber: { type: Type.NUMBER },
          title: { type: Type.STRING },
          score: { type: Type.NUMBER },
          maxScore: { type: Type.NUMBER },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['slideNumber', 'title', 'score', 'maxScore', 'strengths', 'improvements'],
      },
    },
  },
  required: ['overallAssessment', 'summary', 'criteria', 'slides'],
};

// Función auxiliar para reintentar peticiones en caso de saturación (503/429)
async function callWithRetry<T>(
  fn: () => Promise<T>,
  retries = 4,
  delay = 2000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error?.message || error?.toString() || '';
    const isTransientError =
      error?.status === 503 ||
      error?.code === 503 ||
      errorMsg.includes('503') ||
      errorMsg.includes('high demand') ||
      errorMsg.includes('UNAVAILABLE') ||
      error?.status === 429 ||
      error?.code === 429;

    if (retries > 0 && isTransientError) {
      console.warn(
        `Saturación en servidores de Gemini (503/429). Reintentando en ${delay / 1000}s... (Quedan ${retries} intentos)`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

function buildPrompt(ctx: EvaluationContext): string {
  let prompt = `Eres un experto en evaluación de presentaciones académicas y profesionales. Analiza cada diapositiva de la presentación proporcionada como imágenes y evalúa la presentación completa.

Cada imagen corresponde a una diapositiva en orden secuencial (diapositiva 1, 2, 3, etc.).

Evalúa los siguientes 4 criterios principales:
1. "Estructura" (0-10): Organización lógica del contenido, flujo de ideas, introducción, desarrollo y conclusión.
2. "Diseño visual" (0-10): Uso de colores, tipografía, imágenes, consistencia visual, legibilidad y aprovechamiento del espacio.
3. "Claridad del texto" (0-10): Concisión, redacción clara, ausencia de texto excesivo, uso efectivo de viñetas y títulos.
4. "Dominio del tema" (0-10): Profundidad del contenido, precisión, relevancia y calidad de la información presentada.

Para cada diapositiva individual, proporciona:
- Un título descriptivo
- Una puntuación de 0 a 10
- 1-3 puntos fuertes (strengths)
- 1-3 recomendaciones de mejora (improvements)

Proporciona también:
- overallAssessment: Una evaluación general cualitativa con EXACTAMENTE uno de estos tres valores:
  * "Correcto" - si la presentación en general está bien (cumple expectativas, buen nivel)
  * "Mejorable" - si la presentación es suficiente pero tiene áreas claras de mejora
  * "Incompleta" - si la presentación es insuficiente, tiene carencias importantes o no cumple el mínimo
- summary: Un resumen general de 2-3 frases sobre la calidad de la presentación

IMPORTANTE: No des una nota numérica global. La evaluación global debe ser SOLO una de las tres categorías textuales arriba indicadas. Esto es para no condicionar al profesor que pueda tener otros criterios de calificación.

Responde en español.`;

  if (ctx.rubric?.text) {
    prompt += `\n\n## RÚBRICA DE EVALUACIÓN (Fuente: ${ctx.rubric.source || 'Manual'})\n\nDebes evaluar la presentación comparándola explícitamente con la siguiente rúbrica. Ajusta tus puntuaciones y feedback a los criterios y estándares definidos en ella:\n\n${ctx.rubric.text}`;
  }

  if (ctx.examples && ctx.examples.length > 0) {
    prompt += `\n\n## PRESENTACIONES DE REFERENCIA\n\nA continuación se proporcionan ${ctx.examples.length} ${ctx.examples.length === 1 ? 'presentación de referencia' : 'presentaciones de referencia'} (de años anteriores o ejemplos). Úsalas como estándar de comparación al evaluar la presentación del usuario. Cada conjunto de imágenes etiquetado como "REFERENCIA" es un ejemplo contra el que debes comparar.`;
    for (const ex of ctx.examples) {
      prompt += `\n- "${ex.label || ex.name}" (${ex.name}): ${ex.slides.length} diapositivas de referencia.`;
    }
    prompt += `\n\nCompara explícitamente la presentación del usuario con estas referencias en tu feedback, destacando diferencias en calidad, diseño y profundidad.`;
  }

  return prompt;
}

export async function evaluatePresentation(
  apiKey: string,
  slides: ProcessedSlide[],
  model: string,
  context: EvaluationContext
): Promise<EvaluationResult> {
  // Modelos Gemini 3.x válidos para este contexto
  const validModels = [
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
  ];

  // Si el modelo viene vacío o es de versiones 1.x/2.x antiguas, se asigna automáticamente gemini-3.8-flash
  const targetModel = validModels.includes(model) ? model : 'gemini-3.8-flash';

  const genAI = new GoogleGenAI({ apiKey });
  const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [
    { text: buildPrompt(context) },
  ];

  // Añadir diapositivas de presentaciones de referencia si existen
  if (context.examples && context.examples.length > 0) {
    for (const example of context.examples) {
      parts.push({ text: `\n--- PRESENTACIÓN DE REFERENCIA: "${example.label || example.name}" (${example.name}) ---` });
      for (const slide of example.slides) {
        parts.push({
          inlineData: { data: slide.base64, mimeType: slide.mimeType },
        });
      }
    }
  }

  // Añadir diapositivas de la presentación a evaluar
  parts.push({ text: '\n--- PRESENTACIÓN A EVALUAR ---' });
  for (const slide of slides) {
    parts.push({
      inlineData: { data: slide.base64, mimeType: slide.mimeType },
    });
  }

  // Petición a la API envuelta en la estrategia de reintentos
  const response = await callWithRetry(async () => {
    return await genAI.models.generateContent({
      model: targetModel,
      contents: [{ role: 'user', parts }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: EVALUATION_SCHEMA,
      },
    });
  });

  const text = response.text;
  if (!text) throw new Error('La IA no devolvió respuesta');

  const parsed = JSON.parse(text) as EvaluationResult;
  parsed.model = targetModel;
  return parsed;
}