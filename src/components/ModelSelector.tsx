import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Cpu, Check } from 'lucide-react';
import { GEMINI_MODELS } from '../types';

interface ModelSelectorProps {
  model: string;
  onChange: (model: string) => void;
}

export function ModelSelector({ model, onChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customModel, setCustomModel] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsCustomMode(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isPreset = GEMINI_MODELS.some((m) => m.id === model);
  const selectedLabel = isPreset
    ? GEMINI_MODELS.find((m) => m.id === model)!.label
    : model;

  const selectModel = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setIsCustomMode(false);
  };

  const applyCustom = () => {
    const trimmed = customModel.trim();
    if (trimmed) {
      onChange(trimmed);
      setIsOpen(false);
      setIsCustomMode(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 mb-2">
        <Cpu className="w-4 h-4 text-primary-500" />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Modelo de Gemini
        </span>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 transition-all"
      >
        <span className="text-sm text-gray-700 dark:text-gray-200 truncate">
          {selectedLabel}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden animate-fade-in max-h-96 overflow-y-auto">
          {GEMINI_MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => selectModel(m.id)}
              className={`w-full flex items-start justify-between gap-2 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 ${
                model === m.id ? 'bg-primary-50 dark:bg-primary-950/30' : ''
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {m.label}
                  </span>
                  {m.recommended && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400 shrink-0">
                      RECOMENDADO
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{m.description}</p>
              </div>
              {model === m.id && <Check className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />}
            </button>
          ))}

          {/* Custom model */}
          <div className="border-t border-gray-200 dark:border-gray-700">
            {isCustomMode ? (
              <div className="p-3 space-y-2">
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="ej: gemini-1.5-pro"
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyDown={(e) => e.key === 'Enter' && applyCustom()}
                  autoFocus
                />
                <button
                  onClick={applyCustom}
                  disabled={!customModel.trim()}
                  className="w-full px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white text-xs font-medium transition-all"
                >
                  Aplicar modelo
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setCustomModel(!isPreset ? model : '');
                  setIsCustomMode(true);
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors ${
                  !isPreset ? 'bg-primary-50 dark:bg-primary-950/30' : ''
                }`}
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Modelo personalizado…
                </span>
                {!isPreset && <Check className="w-4 h-4 text-primary-500 shrink-0" />}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
