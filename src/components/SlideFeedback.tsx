import { useState } from 'react';
import { ChevronDown, ThumbsUp, Wrench, FileText, ZoomIn, X, Image as ImageIcon } from 'lucide-react';
import type { SlideFeedback as SlideFeedbackType } from '../types';

interface SlideFeedbackProps {
  slide: SlideFeedbackType & { imageUrl?: string; image?: string; dataUrl?: string };
  index: number;
}

export function SlideFeedback({ slide, index }: SlideFeedbackProps) {
  const [isOpen, setIsOpen] = useState(index === 0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Obtener la imagen de la diapositiva (admite diferentes nombres de propiedad)
  const slideImageUrl = slide.imageUrl || slide.image || slide.dataUrl;

  const percentage = (slide.score / slide.maxScore) * 100;

  const getBadgeColor = (pct: number) => {
    if (pct >= 80) return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
    if (pct >= 60) return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800';
    if (pct >= 40) return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
    return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800';
  };

  return (
    <>
      <div
        className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 shadow-sm"
        style={{ animationDelay: `${index * 80}ms` }}
      >
        {/* Cabecera desplegable */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-sm font-bold text-gray-800 dark:text-gray-200 shrink-0">
              {slide.slideNumber}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                {slide.title || `Diapositiva ${slide.slideNumber}`}
              </h4>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                Diapositiva {slide.slideNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getBadgeColor(percentage)}`}>
              {slide.score.toFixed(1)} / {slide.maxScore}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {/* Contenido desplegable con diseño en dos columnas (Split View) */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            isOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="p-4 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* Columna Izquierda: Vista previa de la diapositiva */}
              <div className="md:col-span-5 flex flex-col items-center justify-center">
                {slideImageUrl ? (
                  <div
                    onClick={() => setIsModalOpen(true)}
                    className="relative group w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-950 cursor-pointer shadow-sm hover:shadow-md transition-all"
                  >
                    <img
                      src={slideImageUrl}
                      alt={`Diapositiva ${slide.slideNumber}`}
                      className="w-full h-auto max-h-60 object-contain mx-auto transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-semibold text-xs">
                      <ZoomIn className="w-4 h-4" /> Ampliar vista
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-40 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center text-gray-400 gap-2 p-4 text-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Vista previa no disponible
                    </span>
                  </div>
                )}
              </div>

              {/* Columna Derecha: Puntos fuertes y recomendaciones */}
              <div className="md:col-span-7 space-y-4">
                {/* Puntos Fuertes */}
                {slide.strengths && slide.strengths.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ThumbsUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                        Puntos fuertes
                      </h5>
                    </div>
                    <ul className="space-y-1.5">
                      {slide.strengths.map((strength, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recomendaciones */}
                {slide.improvements && slide.improvements.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <h5 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                        Recomendaciones
                      </h5>
                    </div>
                    <ul className="space-y-1.5">
                      {slide.improvements.map((improvement, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sin comentarios */}
                {(!slide.strengths || slide.strengths.length === 0) &&
                  (!slide.improvements || slide.improvements.length === 0) && (
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 py-2">
                      <FileText className="w-4 h-4" />
                      Sin comentarios adicionales para esta diapositiva.
                    </div>
                  )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Modal a Pantalla Completa para ver la diapositiva ampliada */}
      {isModalOpen && slideImageUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="relative max-w-5xl w-full bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Diapositiva {slide.slideNumber}: {slide.title || 'Vista ampliada'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full max-h-[80vh] flex items-center justify-center overflow-auto rounded-xl bg-gray-950 p-2">
              <img
                src={slideImageUrl}
                alt={`Diapositiva ${slide.slideNumber} ampliada`}
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
