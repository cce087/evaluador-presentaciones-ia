import { useState } from 'react';
import {
  Sun,
  Moon,
  Sparkles,
  ChevronDown,
  Info,
} from 'lucide-react';
import { ApiKeyInput } from './ApiKeyInput';
import { ModelSelector } from './ModelSelector';
import { ReferenceMaterials } from './ReferenceMaterials';
import type { Theme, GeminiModel, EvaluationContext } from '../types';

interface SidebarProps {
  theme: Theme;
  onToggleTheme: () => void;
  apiKey: string;
  isEditingKey: boolean;
  onSaveKey: (key: string) => void;
  onRemoveKey: () => void;
  onCancelKey: () => void;
  model: GeminiModel;
  onModelChange: (model: GeminiModel) => void;
  context: EvaluationContext;
  onContextChange: (context: EvaluationContext) => void;
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
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(true);

  return (
    <aside className="w-full md:w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-auto md:h-screen md:sticky md:top-0 transition-colors">
      
      {/* Cabecera / Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-gray-100 text-base leading-tight">
              SlideJudge
            </h1>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Evaluador con IA
            </p>
          </div>
        </div>

        {/* Botón cambiar tema */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Contenido con SCROLL (overflow-y-auto) para que todo quepa en pantalla */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        
        {/* Clave API */}
        <ApiKeyInput
          apiKey={apiKey}
          isEditing={isEditingKey}
          onSave={onSaveKey}
          onRemove={onRemoveKey}
          onCancel={onCancelKey}
        />

        {/* Modelo Gemini */}
        <ModelSelector model={model} onChange={onModelChange} />

        {/* Materiales de Referencia (Rúbrica + Ejemplos) */}
        <ReferenceMaterials context={context} onChange={onContextChange} />

        {/* ¿Cómo funciona? */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40 overflow-hidden">
          <button
            onClick={() => setIsHowItWorksOpen(!isHowItWorksOpen)}
            className="w-full flex items-center justify-between p-3 text-left font-bold text-gray-800 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-primary-500" />
              <span>¿Cómo funciona?</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                isHowItWorksOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isHowItWorksOpen && (
            <ol className="p-3 pt-0 space-y-1.5 text-gray-600 dark:text-gray-400 font-medium leading-relaxed border-t border-gray-200/50 dark:border-gray-800/50">
              <li>1. Introduce tu API key de Gemini</li>
              <li>2. Elige el modelo y materiales (opcional)</li>
              <li>3. Sube tu presentación (PDF o PPTX)</li>
              <li>4. Recibe puntuaciones y recomendaciones</li>
            </ol>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 text-[11px] font-semibold text-gray-400 text-center shrink-0">
        Procesamiento 100% local · Sin servidores
      </div>
    </aside>
  );
}