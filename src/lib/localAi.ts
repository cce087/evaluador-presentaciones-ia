import type { EvaluationResult, ProcessedSlide, EvaluationContext } from '../types';

export async function evaluateWithLocalAi(
  baseUrl: string,
  modelName: string,
  slides: ProcessedSlide[],
  context: EvaluationContext
): Promise<EvaluationResult> {
  const cleanUrl = baseUrl.replace(/\/+$/, '');
  const endpoint = cleanUrl.endsWith('/v1') ? `${cleanUrl}/chat/completions` : `${cleanUrl}/v1/chat/completions`;

  // 1. Incluir Rúbrica si está disponible
  const rubricText = context.rubric?.text
    ? `\nCRITERIOS / RÚBRICA ESPECÍFICA A SEGUIR (Fuente: ${context.rubric.source}):\n${context.rubric.text}\n`
    : '';

  const prompt = `Eres un experto evaluador de presentaciones académicas y profesionales. 
Analiza detalladamente las imágenes de las diapositivas proporcionadas.${rubricText}

Debes responder ÚNICAMENTE con un objeto JSON válido (sin texto antes o después, ni comillas markdown como \`\`\`json) siguiendo esta estructura:

{
  "overallAssessment": "Correcto",
  "summary": "Resumen ejecutivo del análisis general.",
  "criteria": [
    {
      "name": "Diseño Visual y Legibilidad",
      "score": 8,
      "maxScore": 10,
      "feedback": "Comentario detallado."
    }
  ],
  "slides": [
    {
      "slideNumber": 1,
      "title": "Título de la diapositiva",
      "score": 8,
      "maxScore": 10,
      "strengths": ["Punto fuerte 1"],
      "improvements": ["Área de mejora 1"]
    }
  ]
}

IMPORTANTE para overallAssessment: Debe ser EXACTAMENTE uno de estos tres valores:
- "Correcto" - si la presentación en general está bien (cumple expectativas, buen nivel)
- "Mejorable" - si la presentación es suficiente pero tiene áreas claras de mejora
- "Incompleta" - si la presentación es insuficiente, tiene carencias importantes o no cumple el mínimo

NO des una nota numérica global.`;

  const contentParts: any[] = [{ type: 'text', text: prompt }];

  // 2. Incluir Ejemplos de Referencia si existen
  if (context.examples && context.examples.length > 0) {
    contentParts.push({
      type: 'text',
      text: `\n--- PRESENTACIONES DE REFERENCIA / EJEMPLOS DE AÑOS ANTERIORES (USAR SOLO COMO GUÍA Y NIVEL DE COMPARACIÓN, NO EVALUAR ESTAS) ---`,
    });

    context.examples.forEach((example) => {
      contentParts.push({
        type: 'text',
        text: `Ejemplo de referencia "${example.name}":`,
      });

      example.slides.forEach((refSlide) => {
        contentParts.push({
          type: 'image_url',
          image_url: {
            url: `data:${refSlide.mimeType};base64,${refSlide.base64}`,
          },
        });
      });
    });
  }

  // 3. Incluir las diapositivas de la presentación actual a evaluar
  contentParts.push({
    type: 'text',
    text: `\n--- PRESENTACIÓN OBJETIVO A EVALUAR AHORA ---`,
  });

  slides.forEach((slide) => {
    contentParts.push({
      type: 'image_url',
      image_url: {
        url: `data:${slide.mimeType};base64,${slide.base64}`,
      },
    });
  });

  // 4. Petición al servidor local
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: modelName,
      messages: [{ role: 'user', content: contentParts }],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Error local (${response.status}): ${errText || response.statusText}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new Error('El servidor local no devolvió contenido.');
  }

  // Limpieza y parsing del JSON retornado por el modelo
  const cleanJson = rawContent
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const parsedResult = JSON.parse(cleanJson);
  parsedResult.model = `Local (${modelName})`;

  return parsedResult as EvaluationResult;
}