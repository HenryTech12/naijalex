import type { LanguageMode } from '../../types';

interface LanguageToggleProps {
  value: LanguageMode;
  onChange: (mode: LanguageMode) => void;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-brand-textSecondary">Analysis Language</label>
      <div className="flex items-center gap-1 p-1 bg-brand-bg border border-brand-border rounded-xl w-fit">
        <button
          onClick={() => onChange('english')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            value === 'english'
              ? 'bg-white text-brand-textPrimary shadow-sm border border-brand-border'
              : 'text-brand-textSecondary hover:text-brand-textPrimary'
          }`}
        >
          English
        </button>
        <button
          onClick={() => onChange('pidgin')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            value === 'pidgin'
              ? 'bg-primary text-white shadow-sm'
              : 'text-brand-textSecondary hover:text-brand-textPrimary'
          }`}
        >
          Pidgin
        </button>
      </div>
      {value === 'pidgin' && (
        <p className="text-sm text-primary font-medium flex items-center gap-1">
          Analysis will be in Lagos Pidgin
          <span role="img" aria-label="Nigeria flag">🇳🇬</span>
        </p>
      )}
    </div>
  );
};
