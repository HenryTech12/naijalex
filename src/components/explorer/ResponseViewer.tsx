import React from 'react';
import { Copy, Check, AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import { useClipboard } from '../../hooks/useClipboard';

interface ResponseViewerProps {
  response: { status: number; headers: Record<string, string>; data: unknown } | null;
  error: string | null;
}

export const ResponseViewer: React.FC<ResponseViewerProps> = ({ response, error }) => {
  const { copied, copy: copyResponse } = useClipboard({ successMessage: 'Response copied!' });
  const { copied: copiedError, copy: copyError } = useClipboard({ successMessage: 'Error copied!' });

  if (!response && !error) {
    return (
      <div className="flex items-center justify-center h-full bg-brand-bg text-brand-textSecondary text-sm px-4">
        <div className="text-center max-w-xs">
          <div className="w-12 h-12 rounded-2xl bg-white border border-brand-border flex items-center justify-center mx-auto mb-3 shadow-sm">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <p className="font-medium">No response yet</p>
          <p className="text-xs mt-1">Execute a request to see the response</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-3 border-b border-red-200 bg-red-50 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-danger" />
          <span className="text-sm font-medium text-danger">Error</span>
          <div className="flex-1" />
          <button
            onClick={() => { if (error) copyError(error); }}
            className="flex items-center gap-1 text-xs text-danger hover:underline"
          >
            {copiedError ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedError ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <pre className="text-sm font-mono text-danger whitespace-pre-wrap bg-red-50 border border-red-100 rounded-lg p-3 leading-relaxed">
            {error}
          </pre>
        </div>
      </div>
    );
  }

  const isSuccess = response!.status >= 200 && response!.status < 300;

  return (
    <div className="h-full flex flex-col">
      {/* Status bar */}
      <div
        className={clsx(
          'p-3 border-b flex items-center gap-3',
          isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        )}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-4 h-4 text-primary" />
        ) : (
          <AlertCircle className="w-4 h-4 text-danger" />
        )}
        <span
          className={clsx(
            'text-sm font-bold',
            isSuccess ? 'text-primary' : 'text-danger'
          )}
        >
          Status: {response!.status}
        </span>
        <div className="flex-1" />
        <button
          onClick={() => { if (response?.data) copyResponse(JSON.stringify(response.data, null, 2)); }}
          className="flex items-center gap-1 text-xs text-brand-textSecondary hover:text-brand-textPrimary transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="px-4 py-2 border-b border-brand-border bg-white text-xs text-brand-textSecondary flex flex-wrap items-center gap-3">
        <span className="font-medium text-brand-textPrimary">Headers</span>
        {(() => {
          const headers = response?.headers ?? {};
          const entries = Object.entries(headers);
          return entries.length > 0 ? (
            entries.slice(0, 4).map(([key, value]) => (
              <span key={key} className="rounded-full bg-brand-bg border border-brand-border px-2 py-0.5 font-mono">
                {key}: {value}
              </span>
            ))
          ) : (
            <span>Not available for mock responses</span>
          );
        })()}
      </div>

      {/* Response body */}
      <div className="flex-1 overflow-auto p-4 bg-brand-textPrimary">
        <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap">
          {JSON.stringify(response!.data, null, 2)}
        </pre>
      </div>
    </div>
  );
};
