export interface CriteriaScore {
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface SlideFeedback {
  slideNumber: number;
  title: string;
  score: number;
  maxScore: number;
  strengths: string[];
  improvements: string[];
}

export interface EvaluationResult {
  overallScore: number;
  maxScore: number;
  summary: string;
  criteria: CriteriaScore[];
  slides: SlideFeedback[];
  model: string;
}

export interface ProcessedSlide {
  pageNumber: number;
  base64: string;
  mimeType: string;
}

export type AppTheme = 'light' | 'dark';

export interface GeminiModel {
  id: string;
  label: string;
  description: string;
  recommended?: boolean;
}

export const GEMINI_MODELS: GeminiModel[] = [
  { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash', description: 'El más inteligente para tareas complejas', recommended: true },
  { id: 'gemini-3.8-live', label: 'Gemini 3.8 Live', description: 'Respuesta ultra rápida de baja latencia' },
  { id: 'gemini-3.8-live-extended-thinking', label: 'Gemini 3.8 Live Extended Thinking', description: 'Razonamiento profundo en segundo plano' },
  { id: 'gemini-3.7-flash', label: 'Gemini 3.7 Flash', description: 'Ejecución fiable multietapa' },
  { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash', description: 'Equilibrio entre velocidad y capacidades multimodales' },
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', description: 'Rendimiento base estándar' },
  { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite', description: 'Ligero y de alta velocidad' },
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite', description: 'Alta eficiencia' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', description: 'Razonamiento avanzado' },
  ];

export const DEFAULT_MODEL = 'gemini-3.8-flash';

export interface ReferenceExample {
  id: string;
  name: string;
  label: string;
  slides: ProcessedSlide[];
}

export interface RubricContent {
  text: string;
  source: string;
}

export interface EvaluationContext {
  rubric: RubricContent | null;
  examples: ReferenceExample[];
}

// Configuración adicional para soporte de IA Local
export type ProviderType = 'gemini' | 'local' | 'groq';

export interface LocalConfig {
  baseUrl: string;
  modelName: string;
}