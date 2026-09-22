import { useCallback, useRef, useState } from 'react';
import { UploadCloud, FileText, MonitorPlay, X, AlertCircle } from 'lucide-react';
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
              : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800/30'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          p-8 text-center
        `}
      >
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
                  ? 'bg-primary-500 text-white scale-110'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
              }
            `}
          >
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isDragging ? 'Suelta el archivo aquí' : 'Arrastra tu presentación o haz clic'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Formatos: PDF, PPTX · Máx. 30 diapositivas</p>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">
              <FileText className="w-3.5 h-3.5" /> PDF
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">
              <MonitorPlay className="w-3.5 h-3.5" /> PPTX
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-error-50 dark:bg-error-900/20 text-error-600 dark:text-error-400 text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {selectedFile && !error && (
        <div className="mt-3 flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-400 text-sm animate-fade-in">
          <div className="flex items-center gap-2 min-w-0">
            {selectedFile.name.toLowerCase().endsWith('.pdf') ? (
              <FileText className="w-4 h-4 shrink-0" />
            ) : (
              <MonitorPlay className="w-4 h-4 shrink-0" />
            )}
            <span className="truncate font-medium">{selectedFile.name}</span>
            <span className="text-xs opacity-60 shrink-0">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearFile();
            }}
            className="p-1 rounded hover:bg-accent-100 dark:hover:bg-accent-900/40 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
