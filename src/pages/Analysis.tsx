import { useParams, Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Download, RefreshCw, FileText, Loader2, AlertCircle, ExternalLink, Copy, Check, Eye, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { RiskBadge } from '../components/analysis/RiskBadge';
import { RiskSummaryCard } from '../components/analysis/RiskSummaryCard';
import { ClauseList } from '../components/analysis/ClauseList';
import { ActionsList } from '../components/analysis/ActionsList';
import { NegotiationPackage } from '../components/analysis/NegotiationPackage';
import { ProcessingState } from '../components/analysis/ProcessingState';
import { TextToSpeech } from '../components/analysis/TextToSpeech';
import { DocumentChat } from '../components/analysis/DocumentChat';
import { useAnalysis } from '../hooks/useAnalysis';
import { useApp } from '../contexts/AppContext';
import { getRiskCard, getRiskCardUrl } from '../api/client';
import type { RiskCardResponse } from '../types';

export const Analysis: React.FC = () => {
  const { analysisId, userId } = useParams<{ analysisId: string; userId?: string }>();
  const { addAnalysis, setAnalysisId, setRiskCardUrl } = useApp();
  const chatSectionRef = useRef<HTMLDivElement | null>(null);
  const { analysis, isLoading, isComplete, error } = useAnalysis(analysisId ?? null, userId ?? null);

  // Risk card state
  const [riskCardData, setRiskCardData] = useState<RiskCardResponse | null>(null);
  const [isLoadingRiskCard, setIsLoadingRiskCard] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [riskCardRefresh, setRiskCardRefresh] = useState(false);
  const [riskCardRedirect, setRiskCardRedirect] = useState(false);

  useEffect(() => {
    if (analysis && isComplete) {
      addAnalysis(analysis);
      setAnalysisId(analysis.id);

      // Auto-fetch risk card if URL already exists
      if (analysis.risk_card_url) {
        setRiskCardData({
          analysis_id: analysis.id,
          risk_card_url: analysis.risk_card_url,
        });
        setRiskCardUrl(analysis.risk_card_url);
      }
    }
  }, [analysis, isComplete, addAnalysis, setAnalysisId, setRiskCardUrl]);

  const fetchRiskCard = async (refresh = false, redirect = false) => {
    if (!analysisId) return;
    setIsLoadingRiskCard(true);
    try {
      if (redirect) {
        const redirectUrl = getRiskCardUrl(analysisId, { refresh, redirect: true });
        window.open(redirectUrl, '_blank');
        toast.success('Opened via redirect=true');
        return;
      }

      const data = await getRiskCard(analysisId, { refresh });
      setRiskCardData(data);
      if (data.risk_card_url) {
        setRiskCardUrl(data.risk_card_url);
      }
      toast.success(refresh ? 'Risk card regenerated!' : 'Risk card loaded!');
    } catch (err) {
      toast.error('Failed to fetch risk card. Try refresh=true to regenerate.');
    } finally {
      setIsLoadingRiskCard(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(true);
      toast.success('URL copied!');
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      toast.error('Failed to copy.');
    }
  };

  const openPdf = () => {
    if (analysisId && riskCardRedirect) {
      const redirectUrl = getRiskCardUrl(analysisId, {
        refresh: riskCardRefresh,
        redirect: true,
      });
      window.open(redirectUrl, '_blank');
      return;
    }

    if (riskCardData?.risk_card_url) {
      window.open(riskCardData.risk_card_url, '_blank');
    }
  };

  const jumpToChat = () => {
    chatSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
                  <TextToSpeech
                    text={`Overall risk: ${analysis.overall_risk}. ${analysis.summary}. Top actions: ${analysis.top_3_actions.join('. ')}`}
                    label="Listen to Summary"
                    size="sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {analysis.risk_card_url && !riskCardData && (
                <button
                  onClick={() => fetchRiskCard(riskCardRefresh, riskCardRedirect)}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-primary border border-primary/30 bg-primary-50 hover:bg-primary-100 px-3 py-2 rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Load Risk Card
                </button>
              )}
              <Link
                to="/analyze"
                className="flex items-center gap-1.5 text-xs font-medium bg-primary hover:bg-primary-600 text-white px-3 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Analyze Another</span>
                <span className="sm:hidden">New</span>
              </Link>
              <button
                onClick={jumpToChat}
                className="flex items-center gap-1.5 text-xs font-medium text-brand-textPrimary border border-brand-border bg-white hover:bg-brand-bg px-3 py-2 rounded-lg transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ask about this</span>
                <span className="sm:hidden">Chat</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column: summary + actions + risk card */}
            <div className="lg:col-span-1 space-y-6">
              <RiskSummaryCard
                clauses={analysis.clauses}
                overallRisk={analysis.overall_risk}
                summary={analysis.summary}
                processingTimeMs={analysis.processing_time_ms}
              />

              {/* Risk Card Panel */}
              <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-brand-border bg-gradient-to-r from-primary-50 to-transparent">
                  <h3 className="font-semibold text-brand-textPrimary flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Risk Card PDF
                  </h3>
                  <p className="text-xs text-brand-textSecondary mt-1">
                    Downloadable summary of your contract analysis
                  </p>
                </div>
                <div className="p-4">
                  {riskCardData ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-brand-textSecondary">
                        <span className="font-medium">Analysis ID:</span>
                        <code className="bg-brand-bg px-2 py-0.5 rounded font-mono">
                          {(riskCardData.analysis_id ?? '').slice(0, 8)}...
                        </code>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={openPdf}
                          className="flex items-center gap-1.5 text-xs font-medium bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open PDF
                        </button>
                        {riskCardData.risk_card_url && (
                          <button
                            onClick={() => copyToClipboard(riskCardData.risk_card_url!)}
                            className="flex items-center gap-1.5 text-xs font-medium text-brand-textSecondary border border-brand-border bg-white hover:bg-brand-bg px-3 py-2 rounded-lg transition-colors"
                          >
                            {copiedUrl ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedUrl ? 'Copied!' : 'Copy URL'}
                          </button>
                        )}
                        <button
                          onClick={() => fetchRiskCard(true, riskCardRedirect)}
                          disabled={isLoadingRiskCard}
                          className="flex items-center gap-1.5 text-xs font-medium text-warning border border-warning/30 bg-warning-50 hover:bg-amber-100 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRiskCard ? 'animate-spin' : ''}`} />
                          Refresh
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-1">
                        <label className="flex items-center gap-1.5 text-xs text-brand-textSecondary cursor-pointer">
                          <input
                            type="checkbox"
                            checked={riskCardRefresh}
                            onChange={(e) => setRiskCardRefresh(e.target.checked)}
                            className="accent-primary"
                          />
                          refresh=true
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-brand-textSecondary cursor-pointer">
                          <input
                            type="checkbox"
                            checked={riskCardRedirect}
                            onChange={(e) => setRiskCardRedirect(e.target.checked)}
                            className="accent-primary"
                          />
                          redirect=true
                        </label>
                      </div>

                      <button
                        onClick={() => setShowPdfViewer(!showPdfViewer)}
                        className="text-xs text-primary hover:underline"
                      >
                        {showPdfViewer ? 'Hide PDF viewer' : 'Show PDF viewer'}
                      </button>

                      {showPdfViewer && riskCardData.risk_card_url && (
                        <div className="mt-3 border border-brand-border rounded-lg overflow-hidden">
                          <iframe
                            src={riskCardData.risk_card_url}
                            className="w-full h-64"
                            title="Risk Card PDF"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-brand-textSecondary">
                        {analysis.risk_card_url
                          ? 'A risk card URL is available. Click below to load it.'
                          : 'No risk card generated yet. Click below to generate one.'}
                      </p>
                      <button
                        onClick={() => fetchRiskCard(!!analysis.risk_card_url || riskCardRefresh, riskCardRedirect)}
                        disabled={isLoadingRiskCard}
                        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-600 disabled:bg-primary/50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        {isLoadingRiskCard ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        {isLoadingRiskCard ? 'Loading...' : analysis.risk_card_url ? 'Load Risk Card' : 'Generate Risk Card'}
                      </button>
                      {!analysis.risk_card_url && (
                        <p className="text-xs text-brand-textSecondary text-center">
                          This may take a few seconds to generate
                        </p>
                      )}

                      <div className="flex flex-wrap justify-center gap-3 pt-1">
                        <label className="flex items-center gap-1.5 text-xs text-brand-textSecondary cursor-pointer">
                          <input
                            type="checkbox"
                            checked={riskCardRefresh}
                            onChange={(e) => setRiskCardRefresh(e.target.checked)}
                            className="accent-primary"
                          />
                          refresh=true
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-brand-textSecondary cursor-pointer">
                          <input
                            type="checkbox"
                            checked={riskCardRedirect}
                            onChange={(e) => setRiskCardRedirect(e.target.checked)}
                            className="accent-primary"
                          />
                          redirect=true
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {analysis.top_3_actions && analysis.top_3_actions.length > 0 && (
                <ActionsList actions={analysis.top_3_actions} />
              )}
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

              {analysis && isComplete && (
                <div ref={chatSectionRef} id="analysis-chat">
                  <DocumentChat
                    analysisId={analysis.id}
                    languageMode={analysis.language_mode}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
