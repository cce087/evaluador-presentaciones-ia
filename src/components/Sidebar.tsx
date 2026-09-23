import { useState } from 'react';
import {
  Key,
  Cpu,
  Moon,
  Sun,
  Server,
  Upload,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { GEMINI_MODELS } from '../types';
import type { ProviderType, LocalConfig, EvaluationContext } from '../types';

interface SidebarProps {
  theme: string;
  onToggleTheme: () => void;
  apiKey: string;
  isEditingKey: boolean;
  onSaveKey: (key: string) => void;
  onRemoveKey: () => void;
  onCancelKey: () => void;
  model: string;
  onModelChange: (model: string) => void;
  provider: ProviderType;
  onProviderChange: (provider: ProviderType) => void;
  localConfig: LocalConfig;
  onLocalConfigChange: (config: LocalConfig) => void;
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
  provider,
  onProviderChange,
  localConfig,
  onLocalConfigChange,
  context,
  onContextChange,
}: SidebarProps) {
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKey(tempApiKey.trim());
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onContextChange({
        ...context,
        rubric: { text: content, source: file.name },
      });
    };
    reader.readAsText(file);
  };

  return (
    <aside className="w-full md:w-80 bg-slate-900 text-slate-100 p-5 flex flex-col justify-between shrink-0 min-h-screen border-r border-slate-800">
      <div className="space-y-6">
        {/* Cabecera */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center font-black text-white shadow-md">
              S
            </div>
            <div>
              <h1 className="text-base font-bold leading-none">SlideJudge</h1>
              <span className="text-[11px] text-slate-400 font-medium">Evaluador con IA</span>
            </div>
          </div>
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            title="Cambiar tema"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
          </button>
        </div>

        {/* Pestañas de Selector de Proveedor */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Proveedor de IA
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => onProviderChange('gemini')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                provider === 'gemini'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Cpu className="w-3.5 h-3.5"/>
              Gemini API
            </button>
            <button
              onClick={() => onProviderChange('local')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                provider === 'local'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Server className="w-3.5 h-3.5"/>
              Servidor Local
            </button>
          </div>
        </div>

        {/* Configuración Gemini API */}
        {provider === 'gemini' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-primary-400"/>
                  Gemini API Key
                </span>
                {apiKey && !isEditingKey && (
                  <button
                    onClick={onRemoveKey}
                    className="text-[10px] text-red-400 hover:underline font-semibold"
                  >
                    Eliminar
                  </button>
                )}
              </div>

              {isEditingKey || !apiKey ? (
                <form onSubmit={handleSaveKey} className="space-y-2">
                  <input
                    type="password"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={!tempApiKey.trim()}
                      className="flex-1 py-1.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                    >
                      Guardar
                    </button>
                    {apiKey && (
                      <button
                        type="button"
                        onClick={onCancelKey}
                        className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-700"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 text-xs text-slate-300 border border-slate-800">
                  <span>••••••••••••••••</span>
                  <button
                    onClick={() => onCancelKey()}
                    className="text-primary-400 hover:underline text-[11px] font-semibold"
                  >
                    Editar
                  </button>
                </div>
              )}

              <a
                href="[https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary-400 hover:underline font-semibold"
              >
                Obtén tu API key en Google AI Studio <ExternalLink className="w-3 h-3"/>
              </a>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400">Modelo de Gemini</label>
              <select
                value={model}
                onChange={(e) => onModelChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-primary-500"
              >
                {GEMINI_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Configuración Servidor Local */}
        {provider === 'local' && (
          <div className="space-y-4 animate-fade-in p-3.5 rounded-xl bg-slate-800/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-2">
              <Server className="w-4 h-4 text-primary-400"/>
              Configuración de IA Local
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Presets Rápidos</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    onLocalConfigChange({
                      baseUrl: 'http://localhost:11434',
                      modelName: 'qwen2-vl',
                    })
                  }
                  className="py-1 px-2 rounded bg-slate-900 border border-slate-700 hover:border-primary-500 text-[11px] text-slate-300 font-semibold text-center"
                >
                  Ollama (11434)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onLocalConfigChange({
                      baseUrl: 'http://localhost:1234',
                      modelName: 'qwen2-vl',
                    })
                  }
                  className="py-1 px-2 rounded bg-slate-900 border border-slate-700 hover:border-primary-500 text-[11px] text-slate-300 font-semibold text-center"
                >
                  LM Studio (1234)
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">URL del Servidor</label>
              <input
                type="text"
                value={localConfig.baseUrl}
                onChange={(e) => onLocalConfigChange({ ...localConfig, baseUrl: e.target.value })}
                placeholder="http://localhost:11434"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Modelo Multimodal</label>
              <input
                type="text"
                value={localConfig.modelName}
                onChange={(e) => onLocalConfigChange({ ...localConfig, modelName: e.target.value })}
                placeholder="qwen2-vl, llama3.2-vision, llava..."
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
        )}

        {/* Rúbrica de referencia */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Materiales de Referencia
          </label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Rúbrica de evaluación</span>
              <label className="text-[11px] text-primary-400 hover:underline cursor-pointer flex items-center gap-1 font-semibold">
                <Upload className="w-3 h-3"/> Subir archivo
                <input type="file" accept=".txt,.pdf,.md" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <textarea
              value={context.rubric?.text || ''}
              onChange={(e) =>
                onContextChange({
                  ...context,
                  rubric: e.target.value ? { text: e.target.value, source: 'manual' } : null,
                })
              }
              placeholder="Pega aquí los criterios de evaluación o sube un archivo..."
              className="w-full h-24 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-primary-500 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 space-y-2">
        <button
          onClick={() => setShowHowItWorks(!showHowItWorks)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-all font-semibold"
        >
          <HelpCircle className="w-4 h-4"/> ¿Cómo funciona?
        </button>
        {showHowItWorks && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed space-y-1 animate-fade-in">
            <p>1. Selecciona <strong>Gemini API</strong> o <strong>Servidor Local</strong>.</p>
            <p>2. Sube tu archivo PDF o PPTX.</p>
            <p>3. Obtén tu evaluación y expórtala en PDF.</p>
          </div>
        )}
      </div>
    </aside>
  );
}