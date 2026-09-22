import { useCallback, useState } from 'react';
import {
  AlertCircle,
  Presentation,
  Sparkles,
  ShieldCheck,
  Cpu,
  ClipboardList,
  Library,
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { DropZone } from './components/DropZone';
import { ResultsPanel } from './components/ResultsPanel';
import { LoadingState } from './components/LoadingState';
import { useTheme } from './hooks/useTheme';
import { useApiKey } from './hooks/useApiKey';
import { useModel } from './hooks/useModel';
import { processFile } from './lib/fileProcessor';
import { evaluatePresentation } from './lib/gemini';
import { GEMINI_MODELS, DEFAULT_MODEL } from './types';
import type { EvaluationContext, EvaluationResult } from './types';

type AppState = 'idle' | 'processing' | 'analyzing' | 'results' | 'error';

const EMPTY_CONTEXT: EvaluationContext = { rubric: null, examples: [] };

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { apiKey, isEditing: isEditingKey, setApiKey, removeApiKey, setIsEditing: setIsEditingKey } = useApiKey();
  const { model, setModel } = useModel();
  const [context, setContext] = useState<EvaluationContext>(EMPTY_CONTEXT);
  const [state, setState] = useState<AppState>('idle');
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!apiKey) {
        setError('Primero introduce tu API key de Gemini en la barra lateral.');
        setState('error');
        return;
      }

      setFileName(file.name);
      setError(null);
      setState('processing');

      try {
        const slides = await processFile(file);

        if (slides.length === 0) {
          throw new Error(
            'No se pudieron extraer imágenes del archivo. Si es un PPTX, asegúrate de que contiene imágenes en las diapositivas.'
          );
        }

        setState('analyzing');
        const evalResult = await evaluatePresentation(apiKey, slides, model, context);
        setResult(evalResult);
        setState('results');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Ocurrió un error inesperado';
        setError(message);
        setState('error');
      }
    },
    [apiKey, model, context]
  );

  const handleReset = () => {
    setState('idle');
    setResult(null);
    setError(null);
    setFileName('');
  };

  const modelLabel = GEMINI_MODELS.find((m) => m.id === model)?.label ?? model;
  const hasRubric = !!context.rubric;
  const hasExamples = context.examples.length > 0;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-950">
      <Sidebar
        theme={theme}
        onToggleTheme={toggleTheme}
        apiKey={apiKey}
        isEditingKey={isEditingKey}
        onSaveKey={setApiKey}
        onRemoveKey={removeApiKey}
        onCancelKey={() => setIsEditingKey(false)}
        model={model}
        onModelChange={setModel}
        context={context}
        onContextChange={setContext}
      />

      <main className="flex-1 p-6 md:p-10 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 hidden md:block">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
              Evaluador de Presentaciones
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sube tu presentación y recibe feedback detallado con IA
            </p>
          </div>

          {/* Content */}
          {(state === 'idle' || state === 'error') && (
            <div className="space-y-6 animate-fade-in">
              <DropZone onFileSelected={handleFile} disabled={!apiKey} />

              {!apiKey && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800/50">
                  <ShieldCheck className="w-5 h-5 text-warning-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-warning-700 dark:text-warning-400">
                    <p className="font-semibold mb-1">Se requiere API key</p>
                    <p>
                      Introduce tu API key de Gemini en la barra lateral para empezar a evaluar
                      presentaciones. Tu clave se guarda solo en tu navegador.
                    </p>
                  </div>
                </div>
              )}

              {state === 'error' && error && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800/50">
                  <AlertCircle className="w-5 h-5 text-error-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-error-700 dark:text-error-400">
                    <p className="font-semibold mb-1">Error</p>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {/* Status badges */}
              {apiKey && (
                <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <span className="text-xs font-medium text-gray-400 mr-1">Configuración:</span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-xs text-primary-600 dark:text-primary-400">
                    <Cpu className="w-3 h-3" />
                    {modelLabel}
                  </span>
                  {hasRubric && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-50 dark:bg-accent-900/20 text-xs text-accent-600 dark:text-accent-400">
                      <ClipboardList className="w-3 h-3" />
                      Rúbrica cargada
                    </span>
                  )}
                  {hasExamples && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-50 dark:bg-accent-900/20 text-xs text-accent-600 dark:text-accent-400">
                      <Library className="w-3 h-3" />
                      {context.examples.length} {context.examples.length === 1 ? 'ejemplo' : 'ejemplos'}
                    </span>
                  )}
                  {!hasRubric && !hasExamples && (
                    <span className="text-xs text-gray-400">
                      Sin rúbrica ni ejemplos (evaluación por criterios generales)
                    </span>
                  )}
                </div>
              )}

              {/* Feature highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                <FeatureCard
                  icon={Presentation}
                  title="Análisis visual"
                  description="Cada diapositiva se convierte en imagen y se evalúa individualmente"
                />
                <FeatureCard
                  icon={Sparkles}
                  title="4 criterios clave"
                  description="Estructura, diseño, claridad y dominio del tema"
                />
                <FeatureCard
                  icon={ShieldCheck}
                  title="Privado y local"
                  description="Tu API key y archivos nunca salen de tu navegador"
                />
              </div>
            </div>
          )}

          {(state === 'processing' || state === 'analyzing') && (
            <LoadingState fileName={fileName} stage={state} model={modelLabel} context={context} />
          )}

          {state === 'results' && result && (
            <ResultsPanel result={result} fileName={fileName} onReset={handleReset} />
          )}
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Presentation;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg transition-shadow">
      <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center text-primary-500 mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{title}</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
