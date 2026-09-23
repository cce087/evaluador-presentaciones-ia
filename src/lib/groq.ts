import type { EvaluationContext, EvaluationResult, ProcessedSlide } from '../types';

export async function evaluateWithGroq(
  apiKey: string,
  slides: ProcessedSlide[],
  modelName: string = 'llama-3.2-11b-vision-preview',
  context: EvaluationContext
): Promise<EvaluationResult> {
  const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

  const rubricText = context.rubric?.text
    ? `\nCRITERIOS / RÚBRICA ESPECÍFICA A SEGUIR (Fuente: ${context.rubric.source}):\n${context.rubric.text}\n`
    : '';

  const prompt = `Eres un experto evaluador de presentaciones académicas y profesionales. 
Analiza detalladamente las imágenes de las diapositivas proporcionadas.${rubricText}

Debes responder ÚNICAMENTE con un objeto JSON válido siguiendo esta estructura:

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

  if (context.examples && context.examples.length > 0) {
    contentParts.push({
      type: 'text',
      text: `\n--- PRESENTACIONES DE REFERENCIA ---`,
    });

    context.examples.forEach((example) => {
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

  contentParts.push({
    type: 'text',
    text: `\n--- PRESENTACIÓN OBJETIVO A EVALUAR ---`,
  });

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
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelName,
      messages: [{ role: 'user', content: contentParts }],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Error Groq (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new Error('Groq no devolvió ningún contenido.');
  }

  const start = rawContent.indexOf('{');
  const end = rawContent.lastIndexOf('}');
  const cleanJson = rawContent.substring(start, end + 1);

  const parsedResult = JSON.parse(cleanJson);
  parsedResult.model = `Groq (${modelName})`;

  return parsedResult as EvaluationResult;
}