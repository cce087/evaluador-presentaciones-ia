import { Download, RefreshCw, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import type { EvaluationResult, ProcessedSlide } from '../types';

interface ResultsPanelProps {
  result: EvaluationResult;
  slides: ProcessedSlide[];
  fileName: string;
  onReset: () => void;
}

export function ResultsPanel({ result, slides, fileName, onReset }: ResultsPanelProps) {
  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Barra superior de acciones responsiva */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">{fileName}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Evaluado con {result.model}
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-sm transition-all shrink-0"
          >
            <Download className="w-4 h-4"/>
            <span>Descargar PDF</span>
          </button>
          <button
            onClick={onReset}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 transition-all shrink-0"
          >
            <RefreshCw className="w-4 h-4"/>
            <span>Evaluar otra</span>
          </button>
        </div>
      </div>

      {/* Resumen de Evaluación Global */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="flex flex-col items-center justify-center p-4 rounded-xl min-w-[160px]"
          style={{
            backgroundColor: result.overallAssessment === 'Correcto' ? '#ecfdf5' : result.overallAssessment === 'Mejorable' ? '#fffbeb' : '#fef2f2',
            borderColor: result.overallAssessment === 'Correcto' ? '#a7f3d0' : result.overallAssessment === 'Mejorable' ? '#fde68a' : '#fecaca',
          }}
        >
          <span className="text-2xl font-black" style={{
            color: result.overallAssessment === 'Correcto' ? '#065f46' : result.overallAssessment === 'Mejorable' ? '#92400e' : '#991b1b'
          }}>
            {result.overallAssessment}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider mt-1" style={{
            color: result.overallAssessment === 'Correcto' ? '#065f46' : result.overallAssessment === 'Mejorable' ? '#92400e' : '#991b1b'
          }}>
            Evaluación Global
          </span>
        </div>
        <div className="flex-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Resumen Ejecutivo</h4>
          <p>{result.summary}</p>
        </div>
      </div>

      {/* Desglose por Criterios */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
          Criterios de Evaluación
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.criteria.map((c, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{c.name}</span>
                <span className="text-xs font-extrabold text-primary-600 dark:text-primary-400">
                  {c.score}/{c.maxScore}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-normal">{c.feedback}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Análisis Diapositiva por Diapositiva */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
          Análisis Diapositiva por Diapositiva
        </h4>
        <div className="space-y-6">
          {result.slides.map((slide) => {
            const matchingImage = slides.find((s) => s.pageNumber === slide.slideNumber);

            return (
              <div
                key={slide.slideNumber}
                className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-6 print:break-inside-avoid"
              >
                {/* Vista Previa de la imagen */}
                <div className="w-full md:w-64 shrink-0 rounded-xl overflow-hidden bg-gray-950 border border-gray-800 flex items-center justify-center min-h-[160px] relative">
                  {matchingImage ? (
                    <img
                      src={`data:${matchingImage.mimeType};base64,${matchingImage.base64}`}
                      alt={`Diapositiva ${slide.slideNumber}`}
                      className="w-full h-auto max-h-48 object-contain"
                    />
                  ) : (
                    <div className="text-center p-4 text-gray-500">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50"/>
                      <span className="text-xs">Sin imagen</span>
                    </div>
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-bold text-white">
                    Diapositiva {slide.slideNumber}
                  </span>
                </div>

                {/* Comentarios de la diapositiva */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <h5 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {slide.title || `Diapositiva ${slide.slideNumber}`}
                    </h5>
                    <span className="text-xs font-black text-primary-600 dark:text-primary-400">
                      {slide.score}/{slide.maxScore}
                    </span>
                  </div>

                  {slide.strengths && slide.strengths.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1">
                        <CheckCircle className="w-3.5 h-3.5"/> Puntos Fuertes
                      </span>
                      <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                        {slide.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {slide.improvements && slide.improvements.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5"/> Áreas de Mejora
                      </span>
                      <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                        {slide.improvements.map((imp, i) => (
                          <li key={i}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
