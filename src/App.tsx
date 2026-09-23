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
import { GEMINI_MODELS } from './types';
import type { EvaluationContext, EvaluationResult } from './types';

type AppState = 'idle' | 'processing' | 'analyzing' | 'results' | 'error';

const EMPTY_CONTEXT: EvaluationContext = { rubric: null, examples: [] };

// Modelos de respaldo verificados que existen en la API oficial de Gemini
const FALLBACK_MODEL_CHAIN = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

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
            'No se pudieron extraer imágenes del archivo. Si es un PPTX, asegúrate de que contiene imágenes o diapositivas válidas.'
          );
        }

        setState('analyzing');

        // Estrategia de Fallback: probar el modelo seleccionado primero y luego los modelos estables de respaldo
        let evalResult: EvaluationResult | null = null;
        const modelsToTry = Array.from(new Set([model, ...FALLBACK_MODEL_CHAIN]));
        let lastError: Error | null = null;

        for (const targetModel of modelsToTry) {
          try {
            evalResult = await evaluatePresentation(apiKey, slides, targetModel, context);
            if (evalResult) break; // Evaluación completada con éxito
          } catch (err) {
            lastError = err instanceof Error ? err : new Error('Error al conectar con la API de Gemini');
            console.warn(`El modelo "${targetModel}" falló o no está disponible con tu API Key. Probrando modelo de respaldo...`, err);
          }
        }

        if (!evalResult) {
          throw lastError || new Error('No se pudo completar el análisis. Verifica que tu API key sea válida y tenga acceso a los modelos.');
        }

        setResult(evalResult);
        setState('results');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Ocurrió un error inesperado al procesar el archivo.';
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Evaluador de Presentaciones
            </h2>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              Sube tu presentación y recibe feedback detallado con IA en tiempo real
            </p>
          </div>

          {/* Estado de Carga / Error / Inicio */}
          {(state === 'idle' || state === 'error') && (
            <div className="space-y-6 animate-fade-in">
              <DropZone onFileSelected={handleFile} disabled={!apiKey} />

              {/* Banner de Aviso: Se requiere API key */}
              {!apiKey && (
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-950 dark:text-amber-200">
                    <p className="font-bold mb-1 text-amber-900 dark:text-amber-300">
                      Se requiere API Key de Gemini
                    </p>
                    <p className="font-medium text-amber-800 dark:text-amber-200/90 leading-relaxed">
                      Introduce tu API key de Gemini en la barra lateral para empezar a evaluar presentaciones. Tu clave no se guarda en ningún servidor externo, permanece 100% segura en tu navegador.
                    </p>
                  </div>
                </div>
              )}

              {/* Banner de Error */}
              {state === 'error' && error && (
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800/60 shadow-sm">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-red-950 dark:text-red-200">
                    <p className="font-bold mb-1 text-red-900 dark:text-red-300">
                      Error durante el procesamiento
                    </p>
                    <p className="font-medium text-red-800 dark:text-red-200/90 leading-relaxed">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* Badges de Configuración Activa */}
              {apiKey && (
                <div className="flex flex-wrap items-center gap-2.5 p-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 mr-1">
                    Configuración activa:
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/50 text-xs font-bold text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                    <Cpu className="w-3.5 h-3.5" />
                    {modelLabel}
                  </span>
                  {hasRubric && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <ClipboardList className="w-3.5 h-3.5" />
                      Rúbrica activa
                    </span>
                  )}
                  {hasExamples && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-xs font-bold text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      <Library className="w-3.5 h-3.5" />
                      {context.examples.length} {context.examples.length === 1 ? 'ejemplo' : 'ejemplos'}
                    </span>
                  )}
                  {!hasRubric && !hasExamples && (
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Evaluación basada en criterios generales
                    </span>
                  )}
                </div>
              )}

              {/* Tarjetas Informativas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                <FeatureCard
                  icon={Presentation}
                  title="Análisis visual diapositiva por diapositiva"
                  description="Cada diapositiva se analiza de manera individual examinando su composición y legibilidad."
                />
                <FeatureCard
                  icon={Sparkles}
                  title="Evaluación multi-criterio"
                  description="Estructura, diseño visual, claridad conceptual y dominio del tema ponderados objetivamente."
                />
                <FeatureCard
                  icon={ShieldCheck}
                  title="Procesamiento 100% privado"
                  description="Tu API key y tus archivos se procesan exclusivamente en tu navegador sin intermediarios."
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
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-all">
      <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-3 border border-primary-100 dark:border-primary-900">
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">{title}</h4>
      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}