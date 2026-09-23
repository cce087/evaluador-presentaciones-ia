import type { EvaluationContext, EvaluationResult, ProcessedSlide } from '../types';

export async function evaluateWithGroq(
  apiKey: string,
  slides: ProcessedSlide[],
  modelName: string = 'qwen/qwen3.8-27b',
  context: EvaluationContext
): Promise<EvaluationResult> {
  // Aseguramos que el ID del modelo sea el correcto para la API de Groq
  let targetModel = modelName;
  if (!targetModel || targetModel.includes('llama-3.2') || targetModel.includes('Vision')) {
    targetModel = 'qwen/qwen3.8-27b';
  }

  const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

  const rubricText = context.rubric?.text
    ? `\nCRITERIOS / RÚBRICA ESPECÍFICA A SEGUIR (Fuente: ${context.rubric.source}):\n${context.rubric.text}\n`
    : '';

  const prompt = `Eres un experto evaluador de presentaciones académicas y profesionales. 
Analiza las imágenes de las diapositivas proporcionadas.${rubricText}

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

  // Control de límite de 3 imágenes para la API de Groq
  const MAX_GROQ_IMAGES = 3;
  let imagesSent = 0;

  contentParts.push({
    type: 'text',
    text: `\n--- PRESENTACIÓN OBJETIVO A EVALUAR (Total de diapositivas en el documento: ${slides.length}) ---`,
  });

  // Tomamos hasta un máximo de 3 diapositivas para no exceder la cuota de Groq
  const slidesToProcess = slides.slice(0, MAX_GROQ_IMAGES);

  slidesToProcess.forEach((slide) => {
    if (imagesSent < MAX_GROQ_IMAGES) {
      contentParts.push({
        type: 'image_url',
        image_url: {
          url: `data:${slide.mimeType};base64,${slide.base64}`,
        },
      });
      imagesSent++;
    }
  });

  if (slides.length > MAX_GROQ_IMAGES) {
    contentParts.push({
      type: 'text',
      text: `\nNota: Se han enviado las primeras ${MAX_GROQ_IMAGES} diapositivas debido al límite de 3 imágenes por consulta de la API de Groq. Genera tu evaluación basándote en esta muestra visual.`,
    });
  }

  // Si aún queda cupo de imágenes (< 3) y hay ejemplos de referencia, los añadimos
  if (context.examples && context.examples.length > 0 && imagesSent < MAX_GROQ_IMAGES) {
    contentParts.push({
      type: 'text',
      text: `\n--- PRESENTACIONES DE REFERENCIA ---`,
    });

    for (const example of context.examples) {
      for (const refSlide of example.slides) {
        if (imagesSent < MAX_GROQ_IMAGES) {
          contentParts.push({
            type: 'image_url',
            image_url: {
              url: `data:${refSlide.mimeType};base64,${refSlide.base64}`,
            },
          });
          imagesSent++;
        }
      }
    }
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: targetModel,
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
  parsedResult.model = `Groq (${targetModel})`;

  return parsedResult as EvaluationResult;
}