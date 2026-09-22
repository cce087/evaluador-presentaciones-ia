import { Presentation, Sun, Moon, Info } from 'lucide-react';
import { ApiKeyInput } from './ApiKeyInput';
import { ModelSelector } from './ModelSelector';
import { ReferenceMaterials } from './ReferenceMaterials';
import type { AppTheme, EvaluationContext } from '../types';

interface SidebarProps {
  theme: AppTheme;
  onToggleTheme: () => void;
  apiKey: string;
  isEditingKey: boolean;
  onSaveKey: (key: string) => void;
  onRemoveKey: () => void;
  onCancelKey: () => void;
  model: string;
  onModelChange: (model: string) => void;
  context: EvaluationContext;
  onContextChange: (ctx: EvaluationContext) => void;
}

export function Sidebar({
  theme,
  onToggleTheme,
  apiKey,
  isEditingKey,
  onSaveKey,
  onRemoveKey,
  onCancelKey,
  model,
  onModelChange,
  context,
  onContextChange,
}: SidebarProps) {
  return (
    <aside className="w-full md:w-80 md:min-h-screen flex flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 p-5 gap-5 md:sticky md:top-0 md:h-screen overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
          <Presentation className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-800 dark:text-gray-100 leading-tight">
            SlideJudge
          </h1>
          <p className="text-xs text-gray-400">Evaluador con IA</p>
        </div>
      </div>

      {/* Theme toggle */}
      <div className="flex items-center justify-between rounded-xl bg-gray-100 dark:bg-gray-800/60 p-1.5">
        <button
          onClick={() => theme !== 'light' && onToggleTheme()}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-1 ${
            theme === 'light' ? 'bg-white shadow text-gray-700' : 'text-gray-400'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          Claro
        </button>
        <button
          onClick={() => theme !== 'dark' && onToggleTheme()}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-1 ${
            theme === 'dark' ? 'bg-gray-900 shadow text-gray-100' : 'text-gray-400'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          Oscuro
        </button>
      </div>

      {/* API Key */}
      <ApiKeyInput
        apiKey={apiKey}
        isEditing={isEditingKey}
        onSave={onSaveKey}
        onRemove={onRemoveKey}
        onCancel={onCancelKey}
      />

      {/* Model selector */}
      <ModelSelector model={model} onChange={onModelChange} />

      {/* Reference materials */}
      <ReferenceMaterials context={context} onContextChange={onContextChange} />

      {/* Info card */}
      <div className="rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950/40 dark:to-primary-900/20 border border-primary-200 dark:border-primary-800/50 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-primary-500" />
          <h3 className="text-xs font-semibold text-primary-700 dark:text-primary-400">
            ¿Cómo funciona?
          </h3>
        </div>
        <ol className="space-y-1.5 text-xs text-primary-600 dark:text-primary-300/80">
          <li className="flex gap-2">
            <span className="font-bold">1.</span>
            <span>Introduce tu API key de Gemini</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">2.</span>
            <span>Elige el modelo y materiales de referencia (opcional)</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">3.</span>
            <span>Sube tu presentación (PDF o PPTX)</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">4.</span>
            <span>Recibe puntuaciones y recomendaciones</span>
          </li>
        </ol>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
        <p className="text-xs text-gray-400 text-center">
          Procesamiento 100% local · Sin servidores
        </p>
      </div>
    </aside>
  );
}
