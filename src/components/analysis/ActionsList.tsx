import { CheckSquare } from 'lucide-react';

interface ActionsListProps {
  actions: string[];
}

export const ActionsList: React.FC<ActionsListProps> = ({ actions }) => {
  return (
    <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-primary-50 border-b border-primary/20">
        <h2 className="text-lg font-bold text-brand-textPrimary flex items-center gap-2">
          <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <CheckSquare className="w-4 h-4 text-white" />
          </span>
          What You Should Do Now
        </h2>
        <p className="text-sm text-brand-textSecondary mt-1">
          These are your most urgent next steps based on this contract analysis.
        </p>
      </div>
      <div className="p-6">
        <ol className="space-y-3">
          {actions.map((action, i) => (
            <li
              key={i}
              className="flex items-start gap-4 p-4 bg-brand-bg rounded-xl border border-brand-border hover:border-primary/30 transition-colors"
            >
              <span className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                {i + 1}
              </span>
              <p className="text-sm text-brand-textPrimary leading-relaxed pt-0.5">{action}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
