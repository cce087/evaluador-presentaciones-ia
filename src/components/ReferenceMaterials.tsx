import { useState } from 'react';
import {
  FileText,
  ChevronDown,
  Upload,
  Plus,
  Trash2,
  Presentation,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { processFile } from '../lib/fileProcessor';
import type { EvaluationContext, ReferenceExample } from '../types';

interface ReferenceMaterialsProps {
  context: EvaluationContext;
  onChange: (context: EvaluationContext) => void;
}

export function ReferenceMaterials({ context, onChange }: ReferenceMaterialsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isProcessingRubric, setIsProcessingRubric] = useState(false);
  const [processingExampleId, setProcessingExampleId] = useState<string | null>(null);

  // Actualizar texto escrito manualmente en la Rúbrica
  const handleRubricTextChange = (text: string) => {
    if (!text.trim()) {
      onChange({ ...context, rubric: null });
      return;
    }
    onChange({
      ...context,
      rubric: {
        text,
        source: context.rubric?.source || 'Manual',
      },
    });
  };

  // Subir archivo a la Rúbrica procesando el contenido
  const handleRubricFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingRubric(true);
    try {
      if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const text = await file.text();
        onChange({
          ...context,
          rubric: { text, source: file.name },
        });
      } else {
        // Extrae imágenes/páginas limpias con fileProcessor en lugar de leer raw text
        const slides = await processFile(file);
        
        onChange({
          ...context,
          rubric: {
            text: `Rúbrica importada desde "${file.name}" (${slides.length} páginas analizadas).`,
            source: file.name,
          },
        });
      }
    } catch (err) {
      console.error('Error al procesar la rúbrica:', err);
      alert('No se pudo procesar el archivo de rúbrica.');
    } finally {
      setIsProcessingRubric(false);
      e.target.value = '';
    }
  };

  // Añadir un nuevo contenedor de Ejemplo
  const handleAddExample = () => {
    const newExample: ReferenceExample = {
      id: Date.now().toString(),
      name: `Ejemplo ${context.examples.length + 1}`,
      label: 'Criterio o nota de referencia',
      slides: [],
    };
    onChange({
      ...context,
      examples: [...context.examples, newExample],
    });
  };

  const handleRemoveExample = (id: string) => {
    onChange({
      ...context,
      examples: context.examples.filter((ex) => ex.id !== id),
    });
  };

  const handleExampleChange = (
    id: string,
    field: 'name' | 'label',
    value: string
  ) => {
    onChange({
      ...context,
      examples: context.examples.map((ex) =>
        ex.id === id ? { ...ex, [field]: value } : ex
      ),
    });
  };

  // Subir PDF o PPTX a una Presentación de Ejemplo
  const handleExampleFileUpload = async (id: string, file: File) => {
    setProcessingExampleId(id);
    try {
      const slides = await processFile(file);
      onChange({
        ...context,
        examples: context.examples.map((ex) =>
          ex.id === id
            ? {
                ...ex,
                name: file.name,
                slides,
              }
            : ex
        ),
      });
    } catch (err) {
      console.error('Error al procesar archivo de ejemplo:', err);
      alert('Error al procesar la presentación de ejemplo.');
    } finally {
      setProcessingExampleId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary-500" />
          <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
            Materiales de Referencia
          </span>
          <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
            Opcional
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="p-3.5 pt-1 space-y-4 border-t border-gray-100 dark:border-gray-800">
          
          {/* Seccion: Rúbrica */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Rúbrica de Evaluación
              </label>
              <label className="flex items-center gap-1 text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer">
                {isProcessingRubric ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Upload className="w-3 h-3" />
                )}
                <span>Subir PDF/TXT</span>
                <input
                  type="file"
                  accept=".txt,.pdf,.md"
                  onChange={handleRubricFileUpload}
                  disabled={isProcessingRubric}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              value={context.rubric?.text || ''}
              onChange={(e) => handleRubricTextChange(e.target.value)}
              placeholder="Pega aquí los criterios de evaluación o sube un archivo..."
              rows={3}
              className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-y max-h-36"
            />
            {context.rubric?.source && (
              <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                Fuente: <span className="font-medium">{context.rubric.source}</span>
              </p>
            )}
          </div>

          {/* Sección: Presentaciones de Ejemplo */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Presentation className="w-3.5 h-3.5 text-gray-400" />
                Presentaciones de Ejemplo
              </label>
            </div>

            <div className="space-y-3">
              {context.examples.map((example) => (
                <div
                  key={example.id}
                  className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={example.name}
                      onChange={(e) =>
                        handleExampleChange(example.id, 'name', e.target.value)
                      }
                      placeholder="Nombre del ejemplo"
                      className="flex-1 bg-transparent text-xs font-bold text-gray-900 dark:text-gray-100 focus:outline-none"
                    />
                    <button
                      onClick={() => handleRemoveExample(example.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Eliminar ejemplo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Cargar PDF o PPTX del ejemplo */}
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                    <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300 truncate">
                      {example.slides && example.slides.length > 0 ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {example.slides.length} diapositivas listas
                        </span>
                      ) : (
                        'Adjuntar PDF / PPTX'
                      )}
                    </span>

                    <label className="px-2 py-1 rounded-md bg-primary-50 dark:bg-primary-950/50 hover:bg-primary-100 text-primary-700 dark:text-primary-300 text-[10px] font-bold cursor-pointer transition-colors shrink-0">
                      {processingExampleId === example.id ? (
                        <span className="flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Cargando...
                        </span>
                      ) : (
                        'Seleccionar'
                      )}
                      <input
                        type="file"
                        accept=".pdf,.pptx"
                        disabled={processingExampleId === example.id}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleExampleFileUpload(example.id, file);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <textarea
                    value={example.label}
                    onChange={(e) =>
                      handleExampleChange(example.id, 'label', e.target.value)
                    }
                    placeholder="Notas o etiqueta para la IA sobre este ejemplo..."
                    rows={2}
                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-gray-200 focus:outline-none"
                  />
                </div>
              ))}

              <button
                onClick={handleAddExample}
                className="w-full py-2 px-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir presentación de ejemplo
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}