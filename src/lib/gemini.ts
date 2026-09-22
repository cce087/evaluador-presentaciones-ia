import { GoogleGenAI, Type } from '@google/genai';
import type { EvaluationContext, EvaluationResult, ProcessedSlide } from '../types';

const EVALUATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER, description: 'Puntuación general de 0 a 10' },
    maxScore: { type: Type.NUMBER, description: 'Puntuación máxima posible (10)' },
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
  required: ['overallScore', 'maxScore', 'summary', 'criteria', 'slides'],
};

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
- overallScore: La puntuación general ponderada de 0 a 10
- summary: Un resumen general de 2-3 frases sobre la calidad de la presentación

Responde en español.`;

  if (ctx.rubric?.text) {
    prompt += `

## RÚBRICA DE EVALUACIÓN

Debes evaluar la presentación comparándola explícitamente con la siguiente rúbrica. Ajusta tus puntuaciones y feedback a los criterios y estándares definidos en ella:

${ctx.rubric.text}`;
  }

  if (ctx.examples.length > 0) {
    prompt += `

## PRESENTACIONES DE REFERENCIA

A continuación se proporcionan ${ctx.examples.length} ${ctx.examples.length === 1 ? 'presentación de referencia' : 'presentaciones de referencia'} (de años anteriores o ejemplos). Úsalas como estándar de comparación al evaluar la presentación del usuario. Cada conjunto de imágenes etiquetado como "REFERENCIA" es un ejemplo contra el que debes comparar.`;
    for (const ex of ctx.examples) {
      prompt += `\n- "${ex.label}" (${ex.name}): ${ex.slides.length} diapositivas de referencia.`;
    }
    prompt += `

Compara explícitamente la presentación del usuario con estas referencias en tu feedback, destacando diferencias en calidad, diseño y profundidad.`;
  }

  return prompt;
}

export async function evaluatePresentation(
  apiKey: string,
  slides: ProcessedSlide[],
  model: string,
  context: EvaluationContext
): Promise<EvaluationResult> {
  const genAI = new GoogleGenAI({ apiKey });
  const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [
    { text: buildPrompt(context) },
  ];

  // Append reference example slides with a label before each set
  for (const example of context.examples) {
    parts.push({ text: `\n--- PRESENTACIÓN DE REFERENCIA: "${example.label}" (${example.name}) ---` });
    for (const slide of example.slides) {
      parts.push({
        inlineData: { data: slide.base64, mimeType: slide.mimeType },
      });
    }
  }

  // Append the user's presentation slides
  parts.push({ text: '\n--- PRESENTACIÓN A EVALUAR ---' });
  for (const slide of slides) {
    parts.push({
      inlineData: { data: slide.base64, mimeType: slide.mimeType },
    });
  }

  const response = await genAI.models.generateContent({
    model,
    contents: [{ role: 'user', parts }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: EVALUATION_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) throw new Error('La IA no devolvió respuesta');

  const parsed = JSON.parse(text) as EvaluationResult;
  parsed.model = model;
  return parsed;
}
