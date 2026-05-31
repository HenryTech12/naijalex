import React from 'react';
import { Copy, Check, X, User, FileText, FileCheck, ExternalLink } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useState } from 'react';
import toast from 'react-hot-toast';

export const FlowStatePanel: React.FC = () => {
  const { userId, analysisRequestId, analysisId, riskCardUrl, clearFlow } = useApp();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyField = async (field: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      toast.success('Copied!');
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Failed to copy.');
    }
  };

  const fields = [
    {
      id: 'userId',
      label: 'User ID',
      value: userId,
      icon: User,
      description: 'From Create User',
    },
    {
      id: 'analysisRequestId',
      label: 'Analysis Request ID',
      value: analysisRequestId,
      icon: FileText,
      description: 'From Analyze Document',
    },
    {
      id: 'analysisId',
      label: 'Analysis ID',
      value: analysisId,
      icon: FileCheck,
      description: 'From Get Analysis (for Risk Card)',
    },
    {
      id: 'riskCardUrl',
      label: 'Risk Card URL',
      value: riskCardUrl,
      icon: ExternalLink,
      description: 'From Get Risk Card',
      isUrl: true,
    },
  ];

  return (
    <div className="bg-white border-l border-brand-border h-full flex flex-col">
      <div className="p-4 border-b border-brand-border bg-gradient-to-r from-primary-50 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-brand-textPrimary">Flow State</h3>
            <p className="text-xs text-brand-textSecondary mt-0.5">
              Saved IDs from successful calls
            </p>
          </div>
          <button
            onClick={clearFlow}
            className="text-xs text-danger hover:bg-red-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {fields.map((field) => {
          const Icon = field.icon;
          const hasValue = !!field.value;

          return (
            <div
              key={field.id}
              className={`p-3 rounded-lg border ${
                hasValue
                  ? 'bg-primary-50 border-primary/20'
                  : 'bg-brand-bg border-brand-border'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-3.5 h-3.5 ${hasValue ? 'text-primary' : 'text-brand-textSecondary'}`} />
                <span className="text-xs font-medium text-brand-textPrimary">{field.label}</span>
                {hasValue && (
                  <button
                    onClick={() => copyField(field.id, field.value!)}
                    className="ml-auto"
                  >
                    {copiedField === field.id ? (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-brand-textSecondary hover:text-primary" />
                    )}
                  </button>
                )}
              </div>
              {hasValue ? (
                field.isUrl ? (
                  <a
                    href={field.value!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline font-mono break-all line-clamp-2"
                  >
                    {field.value}
                  </a>
                ) : (
                  <p className="text-xs font-mono text-brand-textPrimary break-all line-clamp-2">
                    {field.value}
                  </p>
                )
              ) : (
                <p className="text-xs text-brand-textSecondary">{field.description}</p>
              )}
            </div>
          );
        })}

        {/* Tips */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-700 font-medium">Tip:</p>
          <p className="text-xs text-amber-600 mt-1 leading-relaxed">
            These IDs are auto-filled into endpoint form fields. Run endpoints in sequence to complete the full flow:
            Create User → Analyze Document → Get Analysis → Get Risk Card.
          </p>
        </div>
      </div>
    </div>
  );
};
