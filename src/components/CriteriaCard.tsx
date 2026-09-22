import { useEffect, useState } from 'react';
import type { CriteriaScore } from '../types';
import { Layout, Palette, AlignLeft, BookOpen } from 'lucide-react';

const ICON_MAP: Record<string, typeof Layout> = {
  Estructura: Layout,
  'Diseño visual': Palette,
  'Claridad del texto': AlignLeft,
  'Dominio del tema': BookOpen,
};

interface CriteriaCardProps {
  criteria: CriteriaScore;
  index: number;
}

export function CriteriaCard({ criteria, index }: CriteriaCardProps) {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  const percentage = (criteria.score / criteria.maxScore) * 100;
  const Icon = ICON_MAP[criteria.name] ?? Layout;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedWidth(percentage), 100 + index * 150);
    return () => clearTimeout(timer);
  }, [percentage, index]);

  const getColor = (pct: number) => {
    if (pct >= 80) return 'bg-accent-500';
    if (pct >= 60) return 'bg-primary-500';
    if (pct >= 40) return 'bg-warning-500';
    return 'bg-error-500';
  };

  const getTextColor = (pct: number) => {
    if (pct >= 80) return 'text-accent-600 dark:text-accent-400';
    if (pct >= 60) return 'text-primary-600 dark:text-primary-400';
    if (pct >= 40) return 'text-warning-600 dark:text-warning-400';
    return 'text-error-600 dark:text-error-400';
  };

  return (
    <div
      className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center text-primary-500">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {criteria.name}
            </h4>
            <span className={`text-lg font-bold ${getTextColor(percentage)}`}>
              {criteria.score.toFixed(1)}
              <span className="text-xs text-gray-400 font-normal"> / {criteria.maxScore}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mb-3">
        <div
          className={`h-full rounded-full ${getColor(percentage)} transition-all duration-1000 ease-out`}
          style={{ width: `${animatedWidth}%` }}
        />
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        {criteria.feedback}
      </p>
    </div>
  );
}
