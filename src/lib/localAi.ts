import type { EvaluationResult, ProcessedSlide, EvaluationContext } from '../types';

export async function evaluateWithLocalAi(
  baseUrl: string,
  modelName: string,
  slides: ProcessedSlide[],
  context: EvaluationContext
): Promise<EvaluationResult> {
  const cleanUrl = baseUrl.replace(/\/+$/, '');
  const endpoint = cleanUrl.endsWith('/v1') ? `${cleanUrl}/chat/completions` : `${cleanUrl}/v1/chat/completions`;

  const rubricText = context.rubric?.text
    ? `\nCRITERIOS / RÚBRICA ESPECÍFICA A SEGUIR:\n${context.rubric.text}\n`
    : '';

  const prompt = `Eres un experto evaluador de presentaciones académicas y profesionales. 
Analiza detalladamente estas imágenes de las diapositivas de la presentación.${rubricText}

Debes responder ÚNICAMENTE con un objeto JSON válido (sin texto antes o después, ni comillas markdown como \`\`\`json) siguiendo esta estructura:

{
  "overallScore": 8.5,
  "maxScore": 10,
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
}`;

  const contentParts: any[] = [{ type: 'text', text: prompt }];

  slides.forEach((slide) => {
    contentParts.push({
      type: 'image_url',
      image_url: {
        url: `data:${slide.mimeType};base64,${slide.base64}`,
      },
    });
  });

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

  const cleanJson = rawContent
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const parsedResult = JSON.parse(cleanJson);
  parsedResult.model = `Local (${modelName})`;

  return parsedResult as EvaluationResult;
}