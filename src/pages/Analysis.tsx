import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Download, RefreshCw, FileText, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { RiskBadge } from '../components/analysis/RiskBadge';
import { RiskSummaryCard } from '../components/analysis/RiskSummaryCard';
import { ClauseList } from '../components/analysis/ClauseList';
import { ActionsList } from '../components/analysis/ActionsList';
import { NegotiationPackage } from '../components/analysis/NegotiationPackage';
import { ProcessingState } from '../components/analysis/ProcessingState';
import { useAnalysis } from '../hooks/useAnalysis';
import { useApp } from '../contexts/AppContext';
import { getRiskCardUrl } from '../api/client';

export const Analysis: React.FC = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const { addAnalysis } = useApp();
  const navigate = useNavigate();
  const { analysis, isLoading, isComplete, error } = useAnalysis(analysisId ?? null);

  useEffect(() => {
    if (analysis && isComplete) {
      addAnalysis(analysis);
    }
  }, [analysis, isComplete, addAnalysis]);

  const handleDownloadRiskCard = () => {
    if (!analysisId) return;
    window.open(getRiskCardUrl(analysisId), '_blank');
    toast.success('Opening risk card PDF...');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-20 px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-danger" />
            </div>
            <h2 className="text-xl font-bold text-brand-textPrimary mb-2">Analysis Failed</h2>
            <p className="text-brand-textSecondary text-sm mb-6 leading-relaxed">
              {error}
              <br />
              We couldn't extract enough text from this document. Try uploading a clearer image or a text-based PDF.
            </p>
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading && !analysis) {
    return (
      <div className="min-h-screen bg-brand-bg">
        <Navbar />
        <div className="pt-20 max-w-3xl mx-auto px-4">
          <ProcessingState isComplete={false} />
        </div>
      </div>
    );
  }

  if (isLoading && analysis && analysis.status === 'processing') {
    return (
      <div className="min-h-screen bg-brand-bg">
        <Navbar />
        <div className="pt-20 max-w-3xl mx-auto px-4">
          <ProcessingState isComplete={false} />
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const negotiationPackage = analysis.clauses
    .filter((c) => (c.action === 'Negotiate' || c.action === 'Remove') && c.replacement_language)
    .map((c) => `## ${c.title}\n\nOriginal Issue: ${c.risk_type}\n\nSuggested Counter-Language:\n${c.replacement_language}`)
    .join('\n\n---\n\n');

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Navbar />

      {/* Sticky top summary bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-brand-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <RiskBadge risk={analysis.overall_risk} size="md" />
                  <span className="text-xs text-brand-textSecondary hidden sm:block">
                    Analyzed in {(analysis.processing_time_ms / 1000).toFixed(1)}s
                  </span>
                  <span className="text-xs text-brand-textSecondary hidden sm:block">
                    &bull; {analysis.language_mode === 'pidgin' ? 'Lagos Pidgin' : 'English'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleDownloadRiskCard}
                className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-brand-textSecondary hover:text-brand-textPrimary border border-brand-border hover:border-brand-textSecondary px-3 py-2 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Risk Card PDF
              </button>
              <Link
                to="/analyze"
                className="flex items-center gap-1.5 text-xs font-medium bg-primary hover:bg-primary-600 text-white px-3 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Analyze Another</span>
                <span className="sm:hidden">New</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column: summary + actions */}
            <div className="lg:col-span-1 space-y-6">
              <RiskSummaryCard
                clauses={analysis.clauses}
                overallRisk={analysis.overall_risk}
                summary={analysis.summary}
                processingTimeMs={analysis.processing_time_ms}
              />

              {analysis.top_3_actions && analysis.top_3_actions.length > 0 && (
                <ActionsList actions={analysis.top_3_actions} />
              )}

              {/* Mobile: download button */}
              <button
                onClick={handleDownloadRiskCard}
                className="sm:hidden w-full flex items-center justify-center gap-2 text-sm font-medium text-primary border-2 border-primary/20 hover:border-primary/40 bg-primary-50 hover:bg-primary-100 px-4 py-3 rounded-xl transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Risk Card PDF
              </button>
            </div>

            {/* Right column: clauses + negotiation */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-xl font-bold text-brand-textPrimary mb-1">
                  Clause Analysis
                </h2>
                <p className="text-sm text-brand-textSecondary mb-5">
                  {analysis.clauses.length} clauses found — sorted by urgency
                </p>

                {analysis.clauses.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-brand-border p-12 text-center">
                    <div className="w-12 h-12 bg-brand-bg rounded-xl flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-6 h-6 text-brand-textSecondary" />
                    </div>
                    <p className="font-medium text-brand-textPrimary mb-1">No clauses extracted</p>
                    <p className="text-sm text-brand-textSecondary">
                      We couldn't extract enough text from this document. Try uploading a clearer image or a text-based PDF.
                    </p>
                    <Link
                      to="/analyze"
                      onClick={() => navigate('/analyze')}
                      className="inline-flex items-center gap-2 mt-4 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                    >
                      Try Another Document
                    </Link>
                  </div>
                ) : (
                  <ClauseList clauses={analysis.clauses} languageMode={analysis.language_mode} />
                )}
              </div>

              {negotiationPackage && (
                <NegotiationPackage content={negotiationPackage} />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
