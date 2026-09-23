import type { EvaluationResult, ProcessedSlide, EvaluationContext } from '../types';

export async function evaluateWithLocalAi(
  baseUrl: string, // Por ejemplo: "http://localhost:11434/v1" (Ollama) o "http://localhost:1234/v1" (LM Studio)
  modelName: string, // Por ejemplo: "qwen2-vl" o "llama3.2-vision"
  slides: ProcessedSlide[],
  context: EvaluationContext
): Promise<EvaluationResult> {
  const prompt = `Analiza estas diapositivas y devuelve UNICAMENTE un JSON válido con esta estructura exacta:
  {
    "overallScore": number (0-10),
    "maxScore": 10,
    "summary": "string",
    "criteria": [{"name": "string", "score": number, "maxScore": number, "feedback": "string"}],
    "slides": [{"slideNumber": number, "title": "string", "score": number, "maxScore": number, "strengths": ["string"], "improvements": ["string"]}]
  }`;

  // Formato multimodal estándar de OpenAI / Ollama / LM Studio
  const contentParts: any[] = [{ type: 'text', text: prompt }];

  slides.forEach((slide) => {
    contentParts.push({
      type: 'image_url',
      image_url: {
        url: `data:${slide.mimeType};base64,${slide.base64}`,
      },
    });
  });

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: modelName,
      messages: [{ role: 'user', content: contentParts }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error en servidor local (${response.statusText}). Asegúrate de que Ollama/LM Studio está activo.`);
  }

  const data = await response.json();
  const rawText = data.choices[0].message.content;
  return JSON.parse(rawText) as EvaluationResult;
}