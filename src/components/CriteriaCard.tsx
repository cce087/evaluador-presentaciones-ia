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
  const Icon = ICON_MAP[criteria.name] ?? Layout;

  return (
    <div
      className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center text-primary-500 shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 pt-2.5">
          {criteria.name}
        </h4>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        {criteria.feedback}
      </p>
    </div>
  );
}
