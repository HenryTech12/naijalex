import { ArrowRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RiskBadge } from '../analysis/RiskBadge';
import type { DocumentHistoryItem } from '../../types';

interface HistoryRowProps {
  item: DocumentHistoryItem;
  to: string;
}

export const HistoryRow: React.FC<HistoryRowProps> = ({ item, to }) => {
  return (
    <div className="rounded-xl border border-brand-border bg-white p-4 hover:shadow-sm transition-shadow">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-brand-textPrimary truncate">{item.filename}</p>
            <RiskBadge risk={item.overall_risk} size="sm" />
            <span className="text-xs rounded-full bg-brand-bg border border-brand-border px-2 py-0.5 text-brand-textSecondary">
              {item.language_mode === 'pidgin' ? 'Pidgin' : 'English'}
            </span>
          </div>
          <p className="text-sm text-brand-textSecondary line-clamp-2">{item.summary}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-brand-textSecondary">
            <span className="flex items-center gap-1.5">
              <Clock3 className="w-3.5 h-3.5" />
              {new Date(item.created_at).toLocaleString()}
            </span>
            <span className="capitalize">Status: {item.status}</span>
            <span>{(item.processing_time_ms / 1000).toFixed(1)}s</span>
          </div>
        </div>
        <Link
          to={to}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600"
        >
          Open
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};