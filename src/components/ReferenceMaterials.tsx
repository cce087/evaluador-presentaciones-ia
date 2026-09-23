import { useState } from 'react';
import {
  FileText,
  ChevronDown,
  Upload,
  Plus,
  Trash2,
  Presentation,
} from 'lucide-react';
import type { EvaluationContext, ExamplePresentation } from '../types';

interface ReferenceMaterialsProps {
  context: EvaluationContext;
  onChange: (context: EvaluationContext) => void;
}

export function ReferenceMaterials({ context, onChange }: ReferenceMaterialsProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleRubricChange = (text: string) => {
    onChange({
      ...context,
      rubric: text.trim() ? text : null,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleRubricChange(content);
      }
    };
    reader.readAsText(file);
  };

  const handleAddExample = () => {
    const newExample: ExamplePresentation = {
      id: Date.now().toString(),
      title: `Ejemplo ${context.examples.length + 1}`,
      notes: '',
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

  const handleExampleChange = (id: string, field: 'title' | 'notes', value: string) => {
    onChange({
      ...context,
      examples: context.examples.map((ex) =>
        ex.id === id ? { ...ex, [field]: value } : ex
      ),
    });
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
        <div className="p-3.5 pt-1 space-y-3.5 border-t border-gray-100 dark:border-gray-800">
          
          {/* Rúbrica */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Rúbrica de Evaluación
              </label>
              <label className="flex items-center gap-1 text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer">
                <Upload className="w-3 h-3" />
                <span>Subir PDF/TXT</span>
                <input
                  type="file"
                  accept=".txt,.pdf,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              value={context.rubric || ''}
              onChange={(e) => handleRubricChange(e.target.value)}
              placeholder="Pega aquí los criterios de evaluación, o sube un archivo PDF/TXT con la rúbrica..."
              rows={3}
              className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-y max-h-32"
            />
          </div>

          {/* Presentaciones de Ejemplo */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Presentation className="w-3.5 h-3.5 text-gray-400" />
                Presentaciones de Ejemplo
              </label>
            </div>

            <div className="space-y-2">
              {context.examples.map((example) => (
                <div
                  key={example.id}
                  className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={example.title}
                      onChange={(e) =>
                        handleExampleChange(example.id, 'title', e.target.value)
                      }
                      placeholder="Título del ejemplo"
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
                  <textarea
                    value={example.notes}
                    onChange={(e) =>
                      handleExampleChange(example.id, 'notes', e.target.value)
                    }
                    placeholder="Notas o criterios del ejemplo..."
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