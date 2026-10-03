import { useCallback, useState } from 'react';
import {
  AlertCircle,
  ShieldCheck,
  Cpu,
  ClipboardList,
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
import { GEMINI_MODELS } from './types';
import type { EvaluationContext, EvaluationResult, ProcessedSlide } from './types';

type AppState = 'idle' | 'processing' | 'analyzing' | 'results' | 'error';

const EMPTY_CONTEXT: EvaluationContext = { rubric: null, examples: [] };
const FALLBACK_MODEL_CHAIN = ['gemini-2.0-flash', 'gemini-1.5-flash'];

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { apiKey, isEditing: isEditingKey, setApiKey, removeApiKey, setIsEditing: setIsEditingKey } = useApiKey();
  const { model, setModel } = useModel();

  const [context, setContext] = useState<EvaluationContext>(EMPTY_CONTEXT);
  const [state, setState] = useState<AppState>('idle');
  const [fileName, setFileName] = useState('');
  const [rawSlides, setRawSlides] = useState<ProcessedSlide[]>([]);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      // Validación previa - solo Gemini
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
          throw new Error('No se pudieron extraer diapositivas válidas del archivo.');
        }

        setRawSlides(slides);
        setState('analyzing');

        let evalResult: EvaluationResult | null = null;

        // Evaluación con Gemini
        const modelsToTry = Array.from(new Set([model, ...FALLBACK_MODEL_CHAIN]));
        let lastError: Error | null = null;

        for (const targetModel of modelsToTry) {
          try {
            evalResult = await evaluatePresentation(apiKey, slides, targetModel, context);
            if (evalResult) break;
          } catch (err) {
            lastError = err instanceof Error ? err : new Error('Error de conexión con Gemini');
          }
        }

        if (!evalResult) {
          throw lastError || new Error('No se pudo evaluar con Gemini.');
        }

        setResult(evalResult);
        setState('results');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al procesar el archivo.';
        setError(message);
        setState('error');
      }
    },
    [apiKey, model, context]
  );

  const handleReset = () => {
    setState('idle');
    setResult(null);
    setRawSlides([]);
    setError(null);
    setFileName('');
  };

  const modelLabel = GEMINI_MODELS.find((m) => m.id === model)?.label ?? model;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="print:hidden">
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
      </div>

      <main className="flex-1 p-6 md:p-10 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 hidden md:block print:hidden">
            <h2 className="text-2xl font-bold mb-1">Evaluador de Presentaciones</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sube tu presentación y recibe feedback detallado con IA en tiempo real
            </p>
          </div>

          {(state === 'idle' || state === 'error') && (
            <div className="space-y-6 animate-fade-in print:hidden">
              <DropZone
                onFileSelected={handleFile}
                disabled={!apiKey}
              />

              {!apiKey && (
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"/>
                  <div className="text-sm text-amber-950 dark:text-amber-200">
                    <p className="font-bold mb-1 text-amber-900 dark:text-amber-300">Se requiere API Key</p>
                    <p className="font-medium text-amber-800 dark:text-amber-200/90 leading-relaxed">
                      Introduce tu API key de Gemini en el menú lateral.
                    </p>
                  </div>
                </div>
              )}

              {state === 'error' && error && (
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800/60 shadow-sm">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5"/>
                  <div className="text-sm text-red-950 dark:text-red-200">
                    <p className="font-bold mb-1 text-red-900 dark:text-red-300">Error durante el procesamiento</p>
                    <p className="font-medium text-red-800 dark:text-red-200/90 leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2.5 p-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 mr-1">Proveedor activo:</span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/50 text-xs font-bold text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                  <Cpu className="w-3.5 h-3.5"/>
                  {modelLabel}
                </span>
                {context.rubric && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <ClipboardList className="w-3.5 h-3.5"/>
                    Rúbrica activa
                  </span>
                )}
              </div>
            </div>
          )}

          {(state === 'processing' || state === 'analyzing') && (
            <LoadingState
              stage={state}
              fileName={fileName}
              model={modelLabel}
              context={context}
            />
          )}

          {state === 'results' && result && (
            <ResultsPanel
              result={result}
              slides={rawSlides}
              fileName={fileName}
              onReset={handleReset}
            />
          )}
        </div>
      </main>
    </div>
  );
}