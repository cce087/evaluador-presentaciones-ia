import { useCallback, useRef, useState } from 'react';
import { UploadCloud, FileText, MonitorPlay, X, AlertCircle, HelpCircle } from 'lucide-react';
import { isSupportedFile } from '@/lib/fileProcessor';

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export function DropZone({ onFileSelected, disabled }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!isSupportedFile(file)) {
        setError('Formato no compatible. Sube un archivo .pdf o .pptx');
        setSelectedFile(null);
        return;
      }
      setError(null);
      setSelectedFile(file);
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (disabled) return;
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles, disabled]
  );

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`
          relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
          ${
            isDragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 scale-[1.01]'
              : 'border-gray-300 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-gray-50/80 dark:hover:bg-gray-800/30 bg-white dark:bg-gray-900'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          p-8 text-center group
        `}
      >
        {/* Tooltip de ayuda y privacidad */}
        <div 
          className="absolute top-3 right-3 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative group/tooltip flex items-center">
            <button
              type="button"
              className="p-1 rounded-full text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
              aria-label="Información de privacidad"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-7 w-64 p-2.5 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-xl shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20 text-left font-normal border border-gray-700">
              🔒 <strong>Privacidad local:</strong> Tu presentación se procesa 100% en tu navegador. No se guarda ni envía a ningún servidor externo.
            </div>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.pptx"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-3">
          <div
            className={`
              w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
              ${
                isDragging
                  ? 'bg-primary-500 text-white scale-110 shadow-lg shadow-primary-500/30'
                  : 'bg-primary-50 dark:bg-gray-800 text-primary-600 dark:text-primary-400'
              }
            `}
          >
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {isDragging ? 'Suelta el archivo aquí' : 'Arrastra tu presentación o haz clic para seleccionar'}
            </p>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1">
              Formatos: PDF, PPTX · Máx. 100 diapositivas
            </p>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
              <FileText className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" /> PDF
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
              <MonitorPlay className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" /> PPTX
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-sm font-semibold animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
          {error}
        </div>
      )}

      {selectedFile && !error && (
        <div className="mt-3 flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/50 text-primary-900 dark:text-primary-200 text-sm animate-fade-in shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            {selectedFile.name.toLowerCase().endsWith('.pdf') ? (
              <FileText className="w-4 h-4 shrink-0 text-primary-600 dark:text-primary-400" />
            ) : (
              <MonitorPlay className="w-4 h-4 shrink-0 text-primary-600 dark:text-primary-400" />
            )}
            <span className="truncate font-semibold text-gray-900 dark:text-gray-100">{selectedFile.name}</span>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 shrink-0">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearFile();
            }}
            className="p-1 rounded hover:bg-primary-100 dark:hover:bg-primary-900/50 text-gray-600 dark:text-gray-300 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}