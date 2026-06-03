import { useState } from 'react';
import { clsx } from 'clsx';
import { ClauseCard } from './ClauseCard';
import type { ClauseAnalysis, LanguageMode, Severity } from '../../types';

interface ClauseListProps {
  clauses: ClauseAnalysis[];
  languageMode: LanguageMode;
}

type Filter = 'All' | Severity;

const FILTERS: Filter[] = ['All', 'Critical', 'Caution', 'Standard'];

const filterBadge: Record<string, string> = {
  Critical: 'bg-red-100 text-red-700',
  Caution: 'bg-amber-100 text-amber-700',
  Standard: 'bg-green-100 text-green-700',
};

export const ClauseList: React.FC<ClauseListProps> = ({ clauses, languageMode }) => {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');

  // ADD THIS LINE — guard against undefined prop
  const safeClauses = clauses ?? [];

  const sorted = [...safeClauses].sort((a, b) => a.urgency_rank - b.urgency_rank);
  const filtered =
    activeFilter === 'All' ? sorted : sorted.filter((c) => c.severity === activeFilter);

  const count = (f: Filter) =>
    f === 'All' ? safeClauses.length : safeClauses.filter((c) => c.severity === f).length;

  // rest unchanged...
  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border',
              activeFilter === f
                ? f === 'All'
                  ? 'bg-brand-textPrimary text-white border-brand-textPrimary'
                  : `${filterBadge[f]} border-current`
                : 'bg-white text-brand-textSecondary border-brand-border hover:border-brand-textSecondary'
            )}
          >
            {f}
            <span
              className={clsx(
                'text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold',
                activeFilter === f ? 'bg-white/20' : 'bg-brand-bg'
              )}
            >
              {count(f)}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-brand-textSecondary">
          <p className="text-lg font-medium">No clauses found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((clause) => (
            <ClauseCard key={clause.clause_id} clause={clause} defaultLanguage={languageMode} />
          ))}
        </div>
      )}
    </div>
  );
};
