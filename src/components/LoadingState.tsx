import { FileText, Sparkles, Cpu, ClipboardList, Library } from 'lucide-react';
import type { EvaluationContext } from '../types';

interface LoadingStateProps {
  fileName: string;
  stage: 'processing' | 'analyzing';
  model: string;
  context: EvaluationContext;
}

const PROCESSING_STEPS = [
  'Leyendo archivo',
  'Extrayendo diapositivas',
  'Convirtiendo a imágenes',
];

const ANALYZING_STEPS = [
  'Enviando a Gemini',
  'Analizando contenido visual',
  'Comparando con rúbrica y ejemplos',
  'Evaluando criterios',
  'Generando recomendaciones',
];

export function LoadingState({ fileName, stage, model, context }: LoadingStateProps) {
  const steps = stage === 'processing' ? PROCESSING_STEPS : ANALYZING_STEPS;
  const totalExampleSlides = context.examples.reduce((sum, e) => sum + e.slides.length, 0);

  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-xl shadow-primary-500/30">
          {stage === 'processing' ? (
            <FileText className="w-10 h-10 text-white animate-pulse-slow" />
          ) : (
            <Sparkles className="w-10 h-10 text-white animate-bounce-subtle" />
          )}
        </div>
        <div className="absolute -inset-4 rounded-3xl border-2 border-primary-500/20 animate-pulse" />
      </div>

      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
        {stage === 'processing' ? 'Procesando presentación' : 'La IA está analizando'}
      </h3>
      <p className="text-sm text-gray-400 mb-2 truncate max-w-xs">{fileName}</p>

      {/* Config badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-xs text-primary-600 dark:text-primary-400">
          <Cpu className="w-3 h-3" />
          {model}
        </span>
        {context.rubric && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-50 dark:bg-accent-900/20 text-xs text-accent-600 dark:text-accent-400">
            <ClipboardList className="w-3 h-3" />
            Rúbrica
          </span>
        )}
        {context.examples.length > 0 && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-50 dark:bg-accent-900/20 text-xs text-accent-600 dark:text-accent-400">
            <Library className="w-3 h-3" />
            {totalExampleSlides} diapositivas de referencia
          </span>
        )}
      </div>

      <div className="w-full max-w-xs space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3 animate-slide-up" style={{ animationDelay: `${i * 200}ms` }}>
            <div className="flex items-center gap-2 flex-1">
              <div className="relative w-5 h-5 shrink-0">
                <div className="absolute inset-0 rounded-full border-2 border-primary-500/20" />
                <div
                  className="absolute inset-0 rounded-full border-2 border-primary-500 border-t-transparent animate-spin-slow"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{step}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs text-gray-400 animate-pulse">
        {stage === 'analyzing' ? 'Esto puede tardar 15-60 segundos según el número de diapositivas y materiales de referencia…' : ''}
      </p>
    </div>
  );
}
