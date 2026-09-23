import { useState } from 'react';
import { Eye, EyeOff, Key, Check, X, Lightbulb, ExternalLink, HelpCircle } from 'lucide-react';

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
      <div className="rounded-xl bg-gray-100/80 dark:bg-gray-900/80 p-3.5 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Gemini API Key
            </span>
          </div>
          <div className="relative group/tooltip flex items-center">
            <button type="button" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors">
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
            <div className="absolute right-0 top-6 w-56 p-2.5 bg-gray-900 dark:bg-gray-800 text-white text-[11px] rounded-xl shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-30 font-normal border border-gray-700 text-left">
              🔑 <strong>Privacidad:</strong> Tu API Key solo se almacena en tu navegador local (<code>localStorage</code>) y no se comparte.
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <code className="text-sm text-gray-900 dark:text-gray-100 font-mono font-semibold truncate">
            {apiKey.slice(0, 4)}••••••••••••{apiKey.slice(-4)}
          </code>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => {
                setValue(apiKey);
                onSave(apiKey);
              }}
              className="p-1.5 rounded-lg bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400 transition-colors"
              title="Guardada activamente"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={onRemove}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 dark:hover:border-red-800/50 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
              title="Eliminar clave"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gray-100/80 dark:bg-gray-900/80 p-3.5 border border-gray-200 dark:border-gray-800 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
            Gemini API Key
          </span>
        </div>
        <div className="relative group/tooltip flex items-center">
          <button type="button" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors">
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
          <div className="absolute right-0 top-6 w-56 p-2.5 bg-gray-900 dark:bg-gray-800 text-white text-[11px] rounded-xl shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-30 font-normal border border-gray-700 text-left">
            🔑 <strong>Privacidad:</strong> Tu API Key solo se almacena en tu navegador local (<code>localStorage</code>) y no se envía a ningún servidor.
          </div>
        </div>
      </div>

      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="AIza..."
          className="w-full px-3 py-2 pr-10 rounded-lg bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.trim()) onSave(value.trim());
          }}
        />
        <button
          onClick={() => setShow(!show)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => value.trim() && onSave(value.trim())}
          disabled={!value.trim()}
          className="flex-1 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 text-white text-xs font-bold transition-all shadow-sm"
        >
          Guardar
        </button>
        {apiKey && (
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold transition-all"
          >
            Cancelar
          </button>
        )}
      </div>

      <a
        href="https://aistudio.google.com/apikey"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline transition-colors pt-0.5"
      >
        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        Obtén tu API key en Google AI Studio
        <ExternalLink className="w-3 h-3 shrink-0" />
      </a>
    </div>
  );
}