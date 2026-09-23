import React, { useRef, useState } from 'react';
import {
  Sun,
  Moon,
  Key,
  Cpu,
  Server,
  Zap,
  FileText,
  Upload,
  Trash2,
  HelpCircle,
  Plus,
  BookOpen,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { processFile } from '../lib/fileProcessor';
import { GEMINI_MODELS } from '../types';
import type {
  EvaluationContext,
  LocalConfig,
  ProviderType,
  ReferenceExample,
} from '../types';

// Configuración del worker de PDF.js para extracción de texto limpio
if (typeof window !== 'undefined' && 'GlobalWorkerOptions' in pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

interface SidebarProps {
  theme: 'light' | 'dark';
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

export const Sidebar: React.FC<SidebarProps> = ({
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
}) => {
  const [tempKey, setTempKey] = useState(apiKey);
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem('groq_api_key') || '');
  const [isEditingGroqKey, setIsEditingGroqKey] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const rubricInputRef = useRef<HTMLInputElement>(null);
  const exampleInputRef = useRef<HTMLInputElement>(null);

  const handleSaveGroqKey = (key: string) => {
    const trimmed = key.trim();
    setGroqKey(trimmed);
    localStorage.setItem('groq_api_key', trimmed);
    setIsEditingGroqKey(false);
  };

  const handleRemoveGroqKey = () => {
    setGroqKey('');
    localStorage.removeItem('groq_api_key');
    setIsEditingGroqKey(false);
  };

  // Extrae texto legible de archivos TXT o PDF para la rúbrica
  const handleRubricFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      let text = '';
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        text = await file.text();
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const tokenized = await page.getTextContent();
          const pageText = tokenized.items.map((item: any) => item.str).join(' ');
          fullText += `[Página ${i}]\n${pageText}\n\n`;
        }
        text = fullText.trim();
      } else {
        throw new Error('Formato no soportado para la rúbrica. Usa TXT o PDF.');
      }

      onContextChange({
        ...context,
        rubric: {
          text: text,
          source: file.name,
        },
      });
    } catch (err) {
      alert('Error al leer el archivo de rúbrica: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsProcessing(false);
      if (rubricInputRef.current) rubricInputRef.current.value = '';
    }
  };

  // Carga presentaciones de ejemplo procesando sus diapositivas
  const handleExampleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const slides = await processFile(file);

      const newExample: ReferenceExample = {
        id: Date.now().toString(),
        name: file.name,
        label: file.name.replace(/\.[^/.]+$/, ''),
        slides: slides,
      };

      onContextChange({
        ...context,
        examples: [...(context.examples || []), newExample],
      });
    } catch (err) {
      alert('Error al procesar la presentación de referencia: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsProcessing(false);
      if (exampleInputRef.current) exampleInputRef.current.value = '';
    }
  };

  const removeExample = (id: string) => {
    onContextChange({
      ...context,
      examples: (context.examples || []).filter((ex) => ex.id !== id),
    });
  };

  return (
    <aside className="w-full md:w-80 bg-gray-900 border-r border-gray-800 text-gray-200 flex flex-col h-full min-h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
            S
          </div>
          <div>
            <h1 className="font-bold text-sm text-white">SlideJudge</h1>
            <p className="text-xs text-gray-400">Evaluador con IA</p>
          </div>
        </div>

        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-colors"
          title="Cambiar tema"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="p-4 space-y-6 flex-1 overflow-y-auto">
        {/* PROVEEDOR DE IA */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            Proveedor de IA
          </label>
          <div className="grid grid-cols-3 gap-1 p-1 bg-gray-950 rounded-xl border border-gray-800">
            <button
              onClick={() => onProviderChange('gemini')}
              className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-lg text-xs font-medium transition-all ${
                provider === 'gemini'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Gemini
            </button>
            <button
              onClick={() => onProviderChange('groq')}
              className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-lg text-xs font-medium transition-all ${
                provider === 'groq'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-orange-300" />
              Groq
            </button>
            <button
              onClick={() => onProviderChange('local')}
              className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-lg text-xs font-medium transition-all ${
                provider === 'local'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              Local
            </button>
          </div>
        </div>

        {/* CONFIGURACIÓN SEGÚN PROVEEDOR */}
        {provider === 'gemini' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-gray-950/60 border border-gray-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-400" /> Gemini API Key
                </span>
                {apiKey && !isEditingKey && (
                  <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                    Configurada
                  </span>
                )}
              </div>

              {!apiKey || isEditingKey ? (
                <div className="space-y-2">
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSaveKey(tempKey)}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs py-1.5 rounded-lg font-medium transition-colors"
                    >
                      Guardar
                    </button>
                    {apiKey && (
                      <button
                        onClick={onCancelKey}
                        className="px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs py-1.5 rounded-lg font-medium transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-gray-400 font-mono">••••••••••••</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onSaveKey('')}
                      className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded"
                    >
                      Editar
                    </button>
                    <button
                      onClick={onRemoveKey}
                      className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded"
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300">Modelo de Gemini</label>
              <select
                value={model}
                onChange={(e) => onModelChange(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
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

        {provider === 'groq' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-gray-950/60 border border-gray-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-orange-400" /> Groq API Key
                </span>
                {groqKey && !isEditingGroqKey && (
                  <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                    Configurada
                  </span>
                )}
              </div>

              {!groqKey || isEditingGroqKey ? (
                <div className="space-y-2">
                  <input
                    type="password"
                    placeholder="gsk_..."
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveGroqKey(groqKey)}
                      className="flex-1 bg-orange-600 hover:bg-orange-500 text-white text-xs py-1.5 rounded-lg font-medium transition-colors"
                    >
                      Guardar
                    </button>
                    {groqKey && (
                      <button
                        onClick={() => setIsEditingGroqKey(false)}
                        className="px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs py-1.5 rounded-lg font-medium transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-gray-400 font-mono">••••••••••••</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setIsEditingGroqKey(true)}
                      className="text-xs text-orange-400 hover:text-orange-300 px-2 py-1 rounded"
                    >
                      Editar
                    </button>
                    <button
                      onClick={handleRemoveGroqKey}
                      className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded"
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800/80 text-xs text-gray-400">
              Modelo vision activo: <strong className="text-white block mt-0.5">qwen/qwen3.8-27b</strong>
            </div>
          </div>
        )}

        {provider === 'local' && (
          <div className="space-y-3 p-3.5 rounded-xl bg-gray-950/60 border border-gray-800/80">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300">URL Servidor Local (Ollama)</label>
              <input
                type="text"
                value={localConfig.baseUrl}
                onChange={(e) => onLocalConfigChange({ ...localConfig, baseUrl: e.target.value })}
                placeholder="http://localhost:11434"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300">Nombre del Modelo</label>
              <input
                type="text"
                value={localConfig.modelName}
                onChange={(e) => onLocalConfigChange({ ...localConfig, modelName: e.target.value })}
                placeholder="qwen2-vl / llama3"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>
        )}

        {/* MATERIALES DE REFERENCIA */}
        <div className="space-y-4 pt-2 border-t border-gray-800">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            Materiales de Referencia
          </label>

          {/* 1) RÚBRICA DE EVALUACIÓN */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" /> Rúbrica de evaluación
              </span>
              <button
                onClick={() => rubricInputRef.current?.click()}
                disabled={isProcessing}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium disabled:opacity-50"
              >
                <Upload className="w-3 h-3" />
                {isProcessing ? 'Procesando...' : 'Subir archivo'}
              </button>
              <input
                ref={rubricInputRef}
                type="file"
                accept=".txt,.pdf"
                onChange={handleRubricFileUpload}
                className="hidden"
              />
            </div>

            <textarea
              rows={4}
              value={context.rubric?.text || ''}
              onChange={(e) =>
                onContextChange({
                  ...context,
                  rubric: {
                    text: e.target.value,
                    source: context.rubric?.source || 'Manual',
                  },
                })
              }
              placeholder="Pega la rúbrica aquí o sube un archivo (PDF/TXT)..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 font-sans"
            />

            {context.rubric?.text && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-400 truncate max-w-[180px]">
                  Fuente: {context.rubric.source}
                </span>
                <button
                  onClick={() => onContextChange({ ...context, rubric: null })}
                  className="text-red-400 hover:text-red-300 flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3 h-3" /> Borrar
                </button>
              </div>
            )}
          </div>

          {/* 2) PRESENTACIONES DE REFERENCIA DE AÑOS ANTERIORES */}
          <div className="space-y-2 pt-2 border-t border-gray-800/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> Ejemplos de referencia
              </span>
              <button
                onClick={() => exampleInputRef.current?.click()}
                disabled={isProcessing}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
                Añadir ejemplo
              </button>
              <input
                ref={exampleInputRef}
                type="file"
                accept=".pdf,.pptx"
                onChange={handleExampleFileUpload}
                className="hidden"
              />
            </div>

            <p className="text-[11px] text-gray-500">
              Sube presentaciones de años anteriores para usarlas como nivel de referencia comparativo.
            </p>

            {context.examples && context.examples.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {context.examples.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-950 border border-gray-800 text-xs text-gray-300"
                  >
                    <div className="truncate pr-2">
                      <p className="font-medium truncate">{ex.name}</p>
                      <p className="text-[10px] text-gray-500">{ex.slides.length} diapositivas</p>
                    </div>
                    <button
                      onClick={() => removeExample(ex.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors p-1"
                      title="Eliminar ejemplo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-dashed border-gray-800 bg-gray-950/40 text-center">
                <span className="text-xs text-gray-500">Sin presentaciones de referencia</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-800 text-xs text-gray-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" /> ¿Cómo funciona?
        </span>
        <span>v1.0</span>
      </div>
    </aside>
  );
};