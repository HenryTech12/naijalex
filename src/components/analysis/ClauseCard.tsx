import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { RiskBadge } from './RiskBadge';
import type { ClauseAnalysis, LanguageMode } from '../../types';

interface ClauseCardProps {
  clause: ClauseAnalysis;
  defaultLanguage: LanguageMode;
}

const formatNaira = (amount: number): string =>
  `₦${amount.toLocaleString('en-NG')}`;

export const ClauseCard: React.FC<ClauseCardProps> = ({ clause, defaultLanguage }) => {
  const [activeLanguage, setActiveLanguage] = useState<LanguageMode>(defaultLanguage);
  const [showOriginal, setShowOriginal] = useState(false);
  const [copiedCounter, setCopiedCounter] = useState(false);

  const severityBg: Record<string, string> = {
    Critical: 'border-l-danger',
    Caution: 'border-l-warning',
    Standard: 'border-l-primary',
  };

  const copyToClipboard = async (text: string, type: 'counter' | 'package') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'counter') setCopiedCounter(true);
      toast.success('Copied! ✓');
      setTimeout(() => {
        if (type === 'counter') setCopiedCounter(false);
      }, 2000);
    } catch {
      toast.error('Could not copy to clipboard.');
    }
  };

  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-brand-border shadow-sm border-l-4 overflow-hidden hover:shadow-md transition-shadow duration-200',
        severityBg[clause.severity]
      )}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className="font-semibold text-brand-textPrimary">{clause.title}</h3>
              {clause.page_number && (
                <span className="text-xs text-brand-textSecondary">p.{clause.page_number}</span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <RiskBadge severity={clause.severity} />
              <RiskBadge action={clause.action} />
              <span className="text-xs text-brand-textSecondary bg-brand-bg border border-brand-border px-2 py-0.5 rounded-full">
                {clause.risk_type}
              </span>
            </div>
          </div>
        </div>

        {clause.legal_reference && (
          <p className="text-xs italic text-brand-textSecondary mt-2">{clause.legal_reference}</p>
        )}

        {clause.financial_exposure !== undefined && clause.financial_exposure > 0 && (
          <div className="flex items-center gap-2 mt-3 p-2 bg-red-50 border border-red-100 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
            <p className="text-sm text-danger font-medium">
              Estimated exposure: {formatNaira(clause.financial_exposure)}
            </p>
          </div>
        )}

        <div className="mt-4">
          <div className="flex items-center gap-1 p-0.5 bg-brand-bg border border-brand-border rounded-lg w-fit mb-3">
            <button
              onClick={() => setActiveLanguage('english')}
              className={clsx(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200',
                activeLanguage === 'english'
                  ? 'bg-white text-brand-textPrimary shadow-sm border border-brand-border'
                  : 'text-brand-textSecondary hover:text-brand-textPrimary'
              )}
            >
              Plain English
            </button>
            <button
              onClick={() => setActiveLanguage('pidgin')}
              className={clsx(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200',
                activeLanguage === 'pidgin'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-brand-textSecondary hover:text-brand-textPrimary'
              )}
            >
              Pidgin
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={activeLanguage}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="text-sm text-brand-textSecondary leading-relaxed"
            >
              {activeLanguage === 'english' ? clause.plain_english : clause.pidgin_explanation}
            </motion.p>
          </AnimatePresence>
        </div>

        <button
          onClick={() => setShowOriginal(!showOriginal)}
          className="flex items-center gap-1 text-xs text-brand-textSecondary hover:text-brand-textPrimary mt-3 transition-colors"
        >
          {showOriginal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          Original Clause
        </button>

        <AnimatePresence>
          {showOriginal && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <pre className="mt-2 p-3 bg-brand-bg border border-brand-border rounded-lg text-xs text-brand-textSecondary font-mono whitespace-pre-wrap leading-relaxed">
                {clause.original_text}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        {(clause.action === 'Negotiate' || clause.action === 'Remove') &&
          clause.replacement_language && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                  Suggested Counter-Language
                </p>
                <button
                  onClick={() => copyToClipboard(clause.replacement_language!, 'counter')}
                  className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-700 font-medium transition-colors bg-white border border-green-200 px-2.5 py-1 rounded-lg hover:bg-green-50"
                >
                  {copiedCounter ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  {copiedCounter ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-sm text-brand-textPrimary font-mono leading-relaxed">
                {clause.replacement_language}
              </p>
            </div>
          )}
      </div>
    </div>
  );
};
