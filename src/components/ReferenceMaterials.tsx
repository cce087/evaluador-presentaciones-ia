import { useRef, useState } from 'react';
import {
  ClipboardList,
  FileText,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  MonitorPlay,
  Library,
} from 'lucide-react';
import type { EvaluationContext, ReferenceExample } from '../types';
import { processFile, extractTextFromFile } from '@/lib/fileProcessor';

interface ReferenceMaterialsProps {
  context: EvaluationContext;
  onContextChange: (ctx: EvaluationContext) => void;
}

export function ReferenceMaterials({ context, onContextChange }: ReferenceMaterialsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rubricText, setRubricText] = useState(context.rubric?.text ?? '');
  const [rubricFileName, setRubricFileName] = useState(context.rubric?.source ?? '');
  const [isProcessingRubric, setIsProcessingRubric] = useState(false);
  const [isAddingExample, setIsAddingExample] = useState(false);
  const [newExampleName, setNewExampleName] = useState('');
  const [newExampleLabel, setNewExampleLabel] = useState('');
  const [isProcessingExample, setIsProcessingExample] = useState(false);
  const rubricFileRef = useRef<HTMLInputElement>(null);
  const exampleFileRef = useRef<HTMLInputElement>(null);

  const hasRubric = !!context.rubric;
  const hasExamples = context.examples.length > 0;
  const isActive = hasRubric || hasExamples;

  const saveRubricText = () => {
    const trimmed = rubricText.trim();
    if (trimmed) {
      onContextChange({
        ...context,
        rubric: { text: trimmed, source: rubricFileName || 'Texto pegado manualmente' },
      });
    } else {
      onContextChange({ ...context, rubric: null });
    }
  };

  const handleRubricFile = async (file: File) => {
    setIsProcessingRubric(true);
    try {
      const text = await extractTextFromFile(file);
      setRubricText(text);
      setRubricFileName(file.name);
      onContextChange({
        ...context,
        rubric: { text, source: file.name },
      });
    } catch {
      setRubricText('No se pudo extraer texto del archivo.');
    }
    setIsProcessingRubric(false);
  };

  const clearRubric = () => {
    setRubricText('');
    setRubricFileName('');
    onContextChange({ ...context, rubric: null });
    if (rubricFileRef.current) rubricFileRef.current.value = '';
  };

  const handleExampleFile = async (file: File) => {
    setIsProcessingExample(true);
    try {
      const slides = await processFile(file);
      const example: ReferenceExample = {
        id: `ex-${Date.now()}`,
        name: file.name,
        label: newExampleLabel.trim() || file.name,
        slides,
      };
      onContextChange({ ...context, examples: [...context.examples, example] });
      setNewExampleName('');
      setNewExampleLabel('');
      setIsAddingExample(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al procesar el archivo';
      alert(msg);
    }
    setIsProcessingExample(false);
  };

  const removeExample = (id: string) => {
    onContextChange({ ...context, examples: context.examples.filter((e) => e.id !== id) });
  };

  const startAddingExample = () => {
    setIsAddingExample(true);
    setNewExampleName('');
    setNewExampleLabel('');
  };

  const totalExampleSlides = context.examples.reduce((sum, e) => sum + e.slides.length, 0);

  return (
    <div className="rounded-xl bg-gray-100/80 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 p-3 hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Library className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          <span className="text-xs font-bold text-gray-900 dark:text-gray-200">
            Materiales de Referencia
          </span>
          {isActive && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300">
              {hasRubric && 'RÚBRICA'}
              {hasRubric && hasExamples && ' + '}
              {hasExamples && `${context.examples.length} EJ.`}
            </span>
          )}
          <span className="text-[10px] text-gray-700 dark:text-gray-400 font-medium">Opcional</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
      </button>

      {isOpen && (
        <div className="p-3 pt-1 space-y-4">
          {/* Rubric section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
              <h4 className="text-xs font-bold text-gray-800 dark:text-gray-300 uppercase tracking-wide">
                Rúbrica de evaluación
              </h4>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <input
                ref={rubricFileRef}
                type="file"
                accept=".pdf,.txt"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleRubricFile(e.target.files[0])}
              />
              <button
                onClick={() => rubricFileRef.current?.click()}
                disabled={isProcessingRubric}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-xs font-semibold text-gray-800 dark:text-gray-200 hover:border-primary-500 transition-all shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                {isProcessingRubric ? 'Procesando…' : 'Subir PDF/TXT'}
              </button>
              {hasRubric && (
                <button
                  onClick={clearRubric}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                  Limpiar
                </button>
              )}
            </div>

            {rubricFileName && (
              <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-primary-700 dark:text-primary-300">
                <FileText className="w-3 h-3" />
                <span className="truncate">{rubricFileName}</span>
              </div>
            )}

            <textarea
              value={rubricText}
              onChange={(e) => setRubricText(e.target.value)}
              onBlur={saveRubricText}
              placeholder="Pega aquí los criterios de evaluación, o sube un archivo PDF/TXT con la rúbrica…"
              className="w-full h-24 px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-xs font-medium text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
            />
          </div>

          {/* Example presentations */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MonitorPlay className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
              <h4 className="text-xs font-bold text-gray-800 dark:text-gray-300 uppercase tracking-wide">
                Presentaciones de ejemplo
              </h4>
            </div>

            {context.examples.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {context.examples.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-gray-900 dark:text-gray-200 truncate block">
                        {ex.label}
                      </span>
                      <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
                        {ex.name} · {ex.slides.length} diapositivas
                      </span>
                    </div>
                    <button
                      onClick={() => removeExample(ex.id)}
                      className="p-1 rounded text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {isAddingExample ? (
              <div className="space-y-2 p-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <input
                  type="text"
                  value={newExampleLabel}
                  onChange={(e) => setNewExampleLabel(e.target.value)}
                  placeholder="Etiqueta (ej: 'Ejemplo Sobresaliente')"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-xs font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  ref={exampleFileRef}
                  type="file"
                  accept=".pdf,.pptx"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleExampleFile(e.target.files[0])}
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exampleFileRef.current?.click()}
                    disabled={isProcessingExample}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {isProcessingExample ? 'Procesando…' : 'Subir PDF/PPTX'}
                  </button>
                  <button
                    onClick={() => setIsAddingExample(false)}
                    className="px-2.5 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={startAddingExample}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-dashed border-gray-400 dark:border-gray-600 text-xs font-bold text-gray-800 dark:text-gray-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 bg-white/50 dark:bg-gray-900/50 transition-all w-full justify-center"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir presentación de ejemplo
              </button>
            )}

            {hasExamples && (
              <p className="text-[10px] text-gray-600 dark:text-gray-400 font-medium mt-1.5">
                {totalExampleSlides} diapositivas de referencia en total
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}