import { useState } from 'react';
import { ChevronDown, ThumbsUp, Wrench, FileText } from 'lucide-react';
import type { SlideFeedback as SlideFeedbackType } from '../types';

interface SlideFeedbackProps {
  slide: SlideFeedbackType;
  index: number;
}

export function SlideFeedback({ slide, index }: SlideFeedbackProps) {
  const [isOpen, setIsOpen] = useState(index === 0);

  const percentage = (slide.score / slide.maxScore) * 100;

  const getBadgeColor = (pct: number) => {
    if (pct >= 80) return 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400';
    if (pct >= 60) return 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400';
    if (pct >= 40) return 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400';
    return 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400';
  };

  return (
    <div
      className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 animate-slide-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-500 dark:text-gray-400 shrink-0">
            {slide.slideNumber}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
              {slide.title}
            </h4>
            <p className="text-xs text-gray-400">Diapositiva {slide.slideNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getBadgeColor(percentage)}`}>
            {slide.score.toFixed(1)}/{slide.maxScore}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 pt-2 border-t border-gray-100 dark:border-gray-800 space-y-4">
          {slide.strengths.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ThumbsUp className="w-4 h-4 text-accent-500" />
                <h5 className="text-xs font-semibold text-accent-600 dark:text-accent-400 uppercase tracking-wide">
                  Puntos fuertes
                </h5>
              </div>
              <ul className="space-y-1.5">
                {slide.strengths.map((strength, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-1.5 shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {slide.improvements.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="w-4 h-4 text-warning-500" />
                <h5 className="text-xs font-semibold text-warning-600 dark:text-warning-400 uppercase tracking-wide">
                  Recomendaciones
                </h5>
              </div>
              <ul className="space-y-1.5">
                {slide.improvements.map((improvement, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-warning-500 mt-1.5 shrink-0" />
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {slide.strengths.length === 0 && slide.improvements.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <FileText className="w-4 h-4" />
              Sin comentarios adicionales.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
