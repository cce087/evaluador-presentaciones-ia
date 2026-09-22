import { useState } from 'react';
import { Eye, EyeOff, Key, Check, X, Lightbulb, ExternalLink } from 'lucide-react';

interface ApiKeyInputProps {
  apiKey: string;
  isEditing: boolean;
  onSave: (key: string) => void;
  onRemove: () => void;
  onCancel: () => void;
}

export function ApiKeyInput({ apiKey, isEditing, onSave, onRemove, onCancel }: ApiKeyInputProps) {
  const [value, setValue] = useState(apiKey);
  const [show, setShow] = useState(false);

  if (!isEditing && apiKey) {
    return (
      <div className="rounded-xl bg-gray-100 dark:bg-gray-800/60 p-3 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Key className="w-4 h-4 text-primary-500" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Gemini API Key
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <code className="text-sm text-gray-700 dark:text-gray-300 font-mono truncate">
            {apiKey.slice(0, 4)}••••••••••••{apiKey.slice(-4)}
          </code>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => {
                setValue(apiKey);
                onSave(apiKey);
              }}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-primary-500 transition-colors"
              title="Guardada"
            >
              <Check className="w-4 h-4 text-accent-500" />
            </button>
            <button
              onClick={onRemove}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-error-500 transition-colors"
              title="Eliminar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gray-100 dark:bg-gray-800/60 p-3 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <Key className="w-4 h-4 text-primary-500" />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Gemini API Key
        </span>
      </div>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="AIza..."
          className="w-full px-3 py-2 pr-10 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.trim()) onSave(value.trim());
          }}
        />
        <button
          onClick={() => setShow(!show)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={() => value.trim() && onSave(value.trim())}
          disabled={!value.trim()}
          className="flex-1 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-xs font-medium transition-all"
        >
          Guardar
        </button>
        {apiKey && (
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs font-medium transition-all"
          >
            Cancelar
          </button>
        )}
      </div>
      <a
        href="https://aistudio.google.com/apikey"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 mt-2 text-xs text-primary-500 hover:text-primary-600 transition-colors"
      >
        <Lightbulb className="w-3 h-3" />
        Obtén tu API key en Google AI Studio
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}
