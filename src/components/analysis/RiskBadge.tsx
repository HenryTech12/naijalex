import clsx from 'clsx';
import type { Severity, ClauseAction, RiskLevel } from '../../types';

interface RiskBadgeProps {
  severity?: Severity;
  risk?: RiskLevel;
  action?: ClauseAction;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ severity, risk, action, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-4 py-1.5 font-semibold',
  };

  if (severity) {
    const styles: Record<Severity, string> = {
      Critical: 'bg-red-100 text-red-700 border border-red-200',
      Caution: 'bg-amber-100 text-amber-700 border border-amber-200',
      Standard: 'bg-green-100 text-green-700 border border-green-200',
    };
    return (
      <span className={clsx('inline-flex items-center rounded-full font-medium', sizeClasses[size], styles[severity])}>
        {severity}
      </span>
    );
  }

  if (risk) {
    const styles: Record<RiskLevel, string> = {
      High: 'bg-red-100 text-red-700 border border-red-200',
      Medium: 'bg-amber-100 text-amber-700 border border-amber-200',
      Low: 'bg-green-100 text-green-700 border border-green-200',
    };
    return (
      <span className={clsx('inline-flex items-center rounded-full font-medium', sizeClasses[size], styles[risk])}>
        {risk} Risk
      </span>
    );
  }

  if (action) {
    const styles: Record<ClauseAction, string> = {
      Accept: 'bg-green-100 text-green-700 border border-green-200',
      Negotiate: 'bg-amber-100 text-amber-700 border border-amber-200',
      Remove: 'bg-red-100 text-red-700 border border-red-200',
      Escalate: 'bg-red-100 text-red-700 border border-red-200',
    };
    return (
      <span className={clsx('inline-flex items-center rounded-full font-medium', sizeClasses[size], styles[action])}>
        {action}
      </span>
    );
  }

  return null;
};
