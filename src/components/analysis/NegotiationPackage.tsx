import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClipboard } from '../../hooks/useClipboard';

interface NegotiationPackageProps {
  content: string;
}

export const NegotiationPackage: React.FC<NegotiationPackageProps> = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { copied, copy: copyPackage } = useClipboard({ successMessage: 'Copied to clipboard! ✓' });

  return (
    <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-brand-bg transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-brand-textPrimary">Full Negotiation Package</p>
            <p className="text-xs text-brand-textSecondary">
              Complete counter-language and negotiation guidance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyPackage(content);
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-primary border border-primary/30 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Full Package'}
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-brand-textSecondary" />
          ) : (
            <ChevronDown className="w-5 h-5 text-brand-textSecondary" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-brand-border px-6 pb-6 pt-4">
              <div className="relative">
                <textarea
                  readOnly
                  value={content}
                  className="w-full h-64 p-4 bg-brand-bg border border-brand-border rounded-xl text-sm font-mono text-brand-textPrimary leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={() => copyPackage(content)}
                  className="absolute top-3 right-3 flex items-center gap-1.5 text-xs font-medium text-primary bg-white border border-primary/30 hover:bg-primary-50 px-2.5 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
