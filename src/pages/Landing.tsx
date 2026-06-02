import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  FileText,
  History,
  MessageCircle,
  Scale,
  Shield,
  Sparkles,
  Terminal,
  Upload,
  Zap,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { HistoryRow } from '../components/history/HistoryRow';
import { useApp } from '../contexts/AppContext';
import { useAnalysisHistory } from '../hooks/useAnalysisHistory';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  show: { transition: { staggerChildren: 0.1 } },
};

export const Landing: React.FC = () => {
  const { userId, mode, setMode } = useApp();
  const { items: historyItems } = useAnalysisHistory(userId);
  const recentItems = historyItems.slice(0, 3);
  const latestItem = historyItems[0];

  const summaryCards = [
    {
      label: 'Runtime mode',
      value: mode === 'demo' ? 'Demo Mode' : 'Live API',
      hint: mode === 'demo' ? 'Mock data is active' : 'Calling the Render backend',
      icon: mode === 'demo' ? Sparkles : Zap,
    },
    {
      label: 'Saved analyses',
      value: String(historyItems.length),
      hint: userId ? `Linked to ${userId}` : 'Create a profile to save history',
      icon: History,
    },
    {
      label: 'Quick action',
      value: 'Upload & analyze',
      hint: 'Start a new document review',
      icon: Upload,
    },
    {
      label: 'Explorer',
      value: 'All endpoints',
      hint: 'Live/demo testing dashboard',
      icon: Terminal,
    },
  ];

  return (
    <div className="bg-brand-bg min-h-screen flex flex-col">
      <Navbar />

      <section className="relative overflow-hidden bg-brand-textPrimary pt-28 pb-20">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(29,158,117,1) 1px, transparent 1px), linear-gradient(90deg, rgba(29,158,117,1) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-textPrimary via-brand-textPrimary to-primary-900/40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-8">
            <motion.div variants={fadeUp} className="max-w-3xl space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-4 py-1.5 text-sm font-medium text-primary-200">
                <Shield className="w-4 h-4" />
                NaijaLex dashboard
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight">
                Review contracts, reopen past analyses, and keep the follow-up chat in one place.
              </h1>
              <p className="max-w-2xl text-lg sm:text-xl text-white/72 leading-relaxed">
                Switch between live backend calls and demo data, explore every endpoint, and move from upload to analysis to negotiation without losing context.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/analyze"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-lg transition-all hover:bg-primary-600 hover:shadow-primary/30"
              >
                <FileText className="w-4 h-4" />
                Analyze a document
              </Link>
              <Link
                to={userId ? `/history/${userId}` : '/explorer'}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 font-medium text-white transition-colors hover:border-white/40 hover:bg-white/5"
              >
                <History className="w-4 h-4" />
                {userId ? 'View history' : 'Open API explorer'}
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 text-sm text-white/65">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <Scale className="w-4 h-4 text-primary-300" />
                Legal-tech workflow
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <MessageCircle className="w-4 h-4 text-primary-300" />
                Chat tied to saved analyses
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <Terminal className="w-4 h-4 text-primary-300" />
                Demo mode works offline
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <main className="flex-1 -mt-8 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="bg-white rounded-2xl border border-brand-border shadow-sm p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-brand-textSecondary">{card.label}</p>
                      <p className="mt-2 text-xl font-bold text-brand-textPrimary">{card.value}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary/15 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-brand-textSecondary">{card.hint}</p>
                </div>
              );
            })}
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-brand-border shadow-sm p-6">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-brand-textSecondary">Quick actions</p>
                    <h2 className="text-lg font-bold text-brand-textPrimary mt-1">Start from the next step</h2>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-brand-border bg-brand-bg p-1">
                    <button
                      onClick={() => setMode('live')}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        mode === 'live' ? 'bg-white text-brand-textPrimary shadow-sm' : 'text-brand-textSecondary'
                      }`}
                    >
                      Live API
                    </button>
                    <button
                      onClick={() => setMode('demo')}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        mode === 'demo' ? 'bg-primary-50 text-primary' : 'text-brand-textSecondary'
                      }`}
                    >
                      Demo
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      icon: FileText,
                      title: 'Upload a contract',
                      desc: 'Run document analysis with user_id and language mode.',
                      to: '/analyze',
                    },
                    {
                      icon: History,
                      title: 'View analysis history',
                      desc: 'Reopen any previous analysis from the saved list.',
                      to: userId ? `/history/${userId}` : '/analyze',
                    },
                    {
                      icon: Terminal,
                      title: 'API explorer',
                      desc: 'Inspect payloads, responses, and endpoint contracts.',
                      to: '/explorer',
                    },
                    {
                      icon: MessageCircle,
                      title: 'Follow up in chat',
                      desc: 'Ask what to change after opening a saved analysis.',
                      to: latestItem && userId ? `/history/${userId}/${latestItem.analysis_id}` : '/analyze',
                    },
                  ].map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link
                        key={action.title}
                        to={action.to}
                        className="group rounded-2xl border border-brand-border bg-brand-bg p-4 transition-all hover:border-primary/30 hover:bg-primary-50"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white border border-brand-border flex items-center justify-center mb-3 shadow-sm">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="font-semibold text-brand-textPrimary">{action.title}</h3>
                        <p className="mt-1 text-sm text-brand-textSecondary">{action.desc}</p>
                        <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                          Open
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-brand-border bg-gradient-to-r from-primary-50 to-transparent">
                  <h2 className="text-lg font-bold text-brand-textPrimary flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    Recent analysis history
                  </h2>
                  <p className="text-sm text-brand-textSecondary mt-1">
                    Reopen a saved analysis or jump back into chat.
                  </p>
                </div>
                <div className="p-4 space-y-3">
                  {recentItems.length > 0 ? (
                    recentItems.map((item) => (
                      <HistoryRow key={item.analysis_id} item={item} to={`/history/${item.user_id}/${item.analysis_id}`} />
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-brand-border bg-brand-bg p-8 text-center">
                      <p className="font-medium text-brand-textPrimary">No saved analyses yet</p>
                      <p className="mt-2 text-sm text-brand-textSecondary">
                        Upload a document or switch to Demo Mode to see example history.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="bg-white rounded-2xl border border-brand-border shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary/15 flex items-center justify-center">
                    <Terminal className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-brand-textSecondary">API explorer</p>
                    <h2 className="font-bold text-brand-textPrimary">Test every endpoint</h2>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-brand-textSecondary">
                  <p>Health, user creation, document analysis, history, chat, risk cards, and WhatsApp webhook testing are all wired in one place.</p>
                  <p>Use Live mode for the Render backend or Demo mode to exercise the UI without the backend.</p>
                </div>

                <Link
                  to="/explorer"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-textPrimary px-4 py-3 font-semibold text-white transition-colors hover:bg-brand-textPrimary/90"
                >
                  Open API Explorer
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-white rounded-2xl border border-brand-border shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary/15 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-brand-textSecondary">Mode</p>
                    <h2 className="font-bold text-brand-textPrimary">{mode === 'demo' ? 'Demo workflow' : 'Live workflow'}</h2>
                  </div>
                </div>
                <p className="text-sm text-brand-textSecondary leading-relaxed">
                  {mode === 'demo'
                    ? 'Mock responses are active, so the dashboard, analysis, history, and chat work without the backend.'
                    : 'Requests go straight to the configured API base URL, including saved analyses and chat follow-ups.'}
                </p>
              </div>

              <div className="bg-brand-textPrimary rounded-2xl p-6 text-white shadow-sm">
                <p className="text-xs uppercase tracking-wide text-white/55">Last saved analysis</p>
                {latestItem ? (
                  <>
                    <h3 className="mt-2 text-lg font-bold">{latestItem.filename}</h3>
                    <p className="mt-2 text-sm text-white/72 leading-relaxed">{latestItem.summary}</p>
                    <Link
                      to={`/history/${latestItem.user_id}/${latestItem.analysis_id}`}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-textPrimary transition-colors hover:bg-primary-50"
                    >
                      Reopen analysis
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </>
                ) : (
                  <>
                    <h3 className="mt-2 text-lg font-bold">Nothing saved yet</h3>
                    <p className="mt-2 text-sm text-white/72 leading-relaxed">Create a user profile and upload your first contract to populate the history panel.</p>
                  </>
                )}
              </div>
            </aside>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};