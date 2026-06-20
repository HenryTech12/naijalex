import React from 'react';
import { Zap, Settings } from 'lucide-react';

interface ModeToggleProps {
  mode: 'live' | 'demo';
  onModeChange: (mode: 'live' | 'demo') => void;
  variant?: 'default' | 'compact';
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onModeChange, variant = 'default' }) => {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-brand-border bg-brand-bg p-1">
        <button
          onClick={() => onModeChange('live')}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === 'live' ? 'bg-white text-brand-textPrimary shadow-sm' : 'text-brand-textSecondary'
          }`}
        >
          Live API
        </button>
        <button
          onClick={() => onModeChange('demo')}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === 'demo' ? 'bg-primary-50 text-primary' : 'text-brand-textSecondary'
          }`}
        >
          Demo
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 p-0.5 bg-brand-bg border border-brand-border rounded-lg">
      <button
        onClick={() => onModeChange('live')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
          mode === 'live'
            ? 'bg-white text-brand-textPrimary shadow-sm border border-brand-border'
            : 'text-brand-textSecondary hover:text-brand-textPrimary'
        }`}
      >
        <Zap className="w-3 h-3" />
        Live API
      </button>
      <button
        onClick={() => onModeChange('demo')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
          mode === 'demo'
            ? 'bg-amber-100 text-warning border border-amber-200'
            : 'text-brand-textSecondary hover:text-brand-textPrimary'
        }`}
      >
        <Settings className="w-3 h-3" />
        Demo
      </button>
    </div>
  );
};
