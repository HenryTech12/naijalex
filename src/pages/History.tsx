import { useParams, Link } from 'react-router-dom';
import { ArrowRight, History as HistoryIcon, Loader2, Sparkles } from 'lucide-react';
import { PageLayout } from '../components/shared/PageLayout';
import { GridBackground } from '../components/shared/GridBackground';
import { HistoryRow } from '../components/history/HistoryRow';
import { useApp } from '../contexts/AppContext';
import { useAnalysisHistory } from '../hooks/useAnalysisHistory';

export const History: React.FC = () => {
  const params = useParams<{ userId?: string }>();
  const { userId: currentUserId, businessLabel, mode } = useApp();
  const userId = params.userId || currentUserId;
  const { items, isLoading, error, refresh } = useAnalysisHistory(userId);

  return (
    <PageLayout>
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <section className="rounded-3xl bg-brand-textPrimary p-8 text-white shadow-sm overflow-hidden relative">
            <GridBackground />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/80">
                  <HistoryIcon className="w-4 h-4" />
                  Analysis history
                </div>
                <h1 className="mt-4 text-3xl sm:text-4xl font-bold leading-tight">
                  Reopen past contract reviews and continue the conversation.
                </h1>
                <p className="mt-3 text-white/72 leading-relaxed">
                  Saved analyses stay tied to the selected user, so you can jump from review to chat without rebuilding context.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/analyze"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white transition-colors hover:bg-primary-600"
                >
                  <Sparkles className="w-4 h-4" />
                  New analysis
                </Link>
                <button
                  onClick={() => void refresh()}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 font-medium text-white transition-colors hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    'Refresh'
                  )}
                </button>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-brand-textSecondary">Active user</p>
              <p className="mt-2 text-lg font-semibold text-brand-textPrimary">{businessLabel || userId || 'No user selected'}</p>
              <p className="mt-2 text-sm text-brand-textSecondary">
                {mode === 'demo'
                  ? 'Demo Mode is serving mock history.'
                  : 'Live Mode is querying the backend history endpoint.'}
              </p>
            </div>
            <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-brand-textSecondary">Saved analyses</p>
              <p className="mt-2 text-lg font-semibold text-brand-textPrimary">{items.length}</p>
              <p className="mt-2 text-sm text-brand-textSecondary">Open any row to inspect clauses, summary, actions, and risk card links.</p>
            </div>
            <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-brand-textSecondary">Chat follow-up</p>
              <p className="mt-2 text-lg font-semibold text-brand-textPrimary">Tied to each analysis</p>
              <p className="mt-2 text-sm text-brand-textSecondary">Use the detail page to ask about specific clauses in English or Pidgin.</p>
            </div>
          </section>

          <section className="rounded-2xl border border-brand-border bg-white shadow-sm overflow-hidden">
            <div className="border-b border-brand-border px-6 py-4 bg-brand-bg flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-brand-textPrimary">Recent analyses</h2>
                <p className="text-sm text-brand-textSecondary">{isLoading ? 'Loading history...' : 'Sorted by most recent first'}</p>
              </div>
              {error && <span className="text-sm text-danger">{error}</span>}
            </div>

            <div className="p-4 space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-brand-textSecondary">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Loading history
                </div>
              ) : items.length > 0 ? (
                items.map((item) => (
                  <HistoryRow key={item.analysis_id} item={item} to={`/history/${item.user_id}/${item.analysis_id}`} />
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-brand-border bg-brand-bg p-10 text-center">
                  <p className="font-medium text-brand-textPrimary">No analyses found</p>
                  <p className="mt-2 text-sm text-brand-textSecondary">
                    Run an analysis to populate this history list. Demo Mode can show sample data right away.
                  </p>
                  <Link
                    to="/explorer"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                  >
                    Open explorer
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </PageLayout>
  );
};
