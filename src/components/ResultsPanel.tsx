import type { EvaluationResult } from '../types';
import { ScoreCircle } from './ScoreCircle';
import { CriteriaCard } from './CriteriaCard';
import { SlideFeedback } from './SlideFeedback';
import { Award, FileText, Sparkles, RotateCcw } from 'lucide-react';

interface ResultsPanelProps {
  result: EvaluationResult;
  fileName: string;
  onReset: () => void;
}

export function ResultsPanel({ result, fileName, onReset }: ResultsPanelProps) {
  const percentage = (result.overallScore / result.maxScore) * 100;

  const getGrade = (pct: number) => {
    if (pct >= 90) return { label: 'Excelente', color: 'text-accent-600 dark:text-accent-400' };
    if (pct >= 75) return { label: 'Muy bueno', color: 'text-primary-600 dark:text-primary-400' };
    if (pct >= 60) return { label: 'Bueno', color: 'text-primary-600 dark:text-primary-400' };
    if (pct >= 40) return { label: 'Mejorable', color: 'text-warning-600 dark:text-warning-400' };
    return { label: 'Deficiente', color: 'text-error-600 dark:text-error-400' };
  };

  const grade = getGrade(percentage);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with score */}
      <div className="rounded-3xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-800 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <ScoreCircle score={result.overallScore} maxScore={result.maxScore} size={160} />

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
              <Award className={`w-5 h-5 ${grade.color}`} />
              <span className={`text-lg font-bold ${grade.color}`}>{grade.label}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 truncate">
              {fileName}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              {result.summary}
            </p>
            <div className="flex items-center gap-3 mt-3 justify-center md:justify-start">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">
                <Sparkles className="w-3 h-3" />
                {result.model}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">
                <FileText className="w-3 h-3" />
                {result.slides.length} diapositivas
              </span>
            </div>
          </div>

          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Nueva evaluación
          </button>
        </div>
      </div>

      {/* Criteria scores */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4 px-1">
          Evaluación por criterios
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {result.criteria.map((c, i) => (
            <CriteriaCard key={c.name} criteria={c} index={i} />
          ))}
        </div>
      </div>

      {/* Slide-by-slide feedback */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4 px-1">
          Feedback por diapositiva
        </h3>
        <div className="space-y-3">
          {result.slides.map((slide, i) => (
            <SlideFeedback key={slide.slideNumber} slide={slide} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
