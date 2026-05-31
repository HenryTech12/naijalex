import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  FileText,
  Search,
  Shield,
  AlertTriangle,
  DollarSign,
  Scale,
  CheckCircle2,
  Languages,
  Terminal,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  show: { transition: { staggerChildren: 0.12 } },
};

export const Landing: React.FC = () => {
  return (
    <div className="bg-brand-bg">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-textPrimary">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(29,158,117,1) 1px, transparent 1px), linear-gradient(90deg, rgba(29,158,117,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-textPrimary via-brand-textPrimary to-primary-900/40" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 pb-32">
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="space-y-6"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary-200 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Now available for Nigerian businesses
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight"
            >
              Understand Any Contract
              <br />
              <span className="text-primary-400">Before You Sign</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed"
            >
              NaijaLex reads Nigerian contracts in seconds — flags risky clauses, explains them in plain English or Pidgin, and drafts your negotiation reply.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/analyze"
                className="flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-primary/30 hover:shadow-xl"
              >
                Analyze a Contract Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#how-it-works"
                className="flex items-center gap-2 text-white/80 hover:text-white border border-white/20 hover:border-white/40 px-8 py-4 rounded-xl font-medium text-base transition-all duration-200"
              >
                See How It Works
                <ChevronDown className="w-4 h-4" />
              </a>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center justify-center gap-6 pt-6 text-white/50 text-sm"
            >
              {['PDF', 'Images', 'Word Documents', 'Scanned Contracts'].map((t) => (
                <span key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary/70" />
                  {t}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-white/30" />
        </div>
      </section>

      {/* Problem section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-textPrimary">
              Sound familiar?
            </h2>
            <p className="text-brand-textSecondary mt-3 max-w-xl mx-auto">
              Most Nigerian SMEs sign contracts without fully understanding them. NaijaLex changes that.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: AlertTriangle,
                color: 'text-danger bg-red-50 border-red-100',
                iconColor: 'text-danger',
                title: 'Signed contracts you didn\'t fully understand?',
                desc: 'Dense legal language designed for lawyers, not business owners.',
              },
              {
                icon: DollarSign,
                color: 'text-warning bg-amber-50 border-amber-100',
                iconColor: 'text-warning',
                title: 'Lost money to hidden penalty clauses?',
                desc: 'Auto-renewal traps, liquidated damages, and one-sided exit terms cost SMEs millions.',
              },
              {
                icon: Scale,
                color: 'text-primary bg-primary-50 border-primary/20',
                iconColor: 'text-primary',
                title: 'Paid thousands for basic legal reviews?',
                desc: 'Legal fees that could fund your next hire — just to understand a lease or vendor contract.',
              },
            ].map((card) => (
              <div
                key={card.title}
                className={`p-6 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${card.color}`}>
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <h3 className="font-bold text-brand-textPrimary text-lg leading-snug mb-2">
                  {card.title}
                </h3>
                <p className="text-brand-textSecondary text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-textPrimary">How It Works</h2>
            <p className="text-brand-textSecondary mt-3">Three steps. Thirty seconds.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: FileText,
                title: 'Upload Your Contract',
                desc: 'Drop a PDF, image, or Word doc. We accept scanned documents too.',
              },
              {
                step: '02',
                icon: Search,
                title: 'AI Analyzes Every Clause',
                desc: 'Our model reads every clause, flags risks, and ranks urgency in seconds.',
              },
              {
                step: '03',
                icon: Shield,
                title: 'Get Actionable Advice',
                desc: 'Plain English breakdown + Pidgin explanations + ready-to-send negotiation drafts.',
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-6xl font-black text-brand-bg leading-none select-none">
                  {item.step}
                </div>
                <div className="relative pt-6">
                  <div className="w-14 h-14 bg-primary-50 border-2 border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-brand-textPrimary text-lg mb-2">{item.title}</h3>
                  <p className="text-brand-textSecondary text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Language showcase */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-brand-bg">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary/20 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              <Languages className="w-4 h-4" />
              Language Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-textPrimary">
              Choose Your Language
            </h2>
            <p className="text-brand-textSecondary mt-3">
              The same clause explained two ways — pick what works for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-7 h-7 bg-brand-textPrimary text-white rounded-lg flex items-center justify-center text-xs font-bold">
                  EN
                </span>
                <span className="text-sm font-semibold text-brand-textPrimary">Plain English</span>
              </div>
              <p className="text-brand-textSecondary text-sm leading-relaxed italic border-l-4 border-primary/20 pl-4">
                "This clause automatically renews the agreement for 12 months unless written notice is provided 90 days prior to expiry."
              </p>
              <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                <p className="text-xs text-warning font-medium">Auto-renewal trap — you'll be locked in for another year if you miss the notice window.</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-primary/30 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-7 h-7 bg-primary text-white rounded-lg flex items-center justify-center text-xs font-bold">
                  PG
                </span>
                <span className="text-sm font-semibold text-brand-textPrimary">Lagos Pidgin</span>
                <span className="text-base">🇳🇬</span>
              </div>
              <p className="text-brand-textSecondary text-sm leading-relaxed italic border-l-4 border-primary/40 pl-4">
                "Dis clause mean say if you no write letter 90 days before contract finish, e go renew by itself for another one year."
              </p>
              <div className="mt-4 flex items-start gap-2 p-3 bg-primary-50 rounded-lg border border-primary/20">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-primary font-medium">Make sure say you write letter 90 days before. No forget!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to protect your business?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Join Nigerian SMEs who analyze contracts with confidence — for free.
          </p>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 bg-white text-primary hover:bg-primary-50 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 shadow-lg"
          >
            Analyze Your Contract Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-brand-textPrimary/5 border border-brand-border text-brand-textSecondary text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              <Terminal className="w-4 h-4" />
              For Developers
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-textPrimary">
              API Explorer Dashboard
            </h2>
            <p className="text-brand-textSecondary mt-3">
              Test every endpoint interactively. Build your own integration.
            </p>
          </div>
          <div className="bg-brand-bg rounded-2xl border border-brand-border p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {['Health', 'Users', 'Documents', 'Risk Cards', 'WhatsApp'].map((cat) => (
                <div key={cat} className="bg-white p-3 rounded-lg border border-brand-border text-center">
                  <p className="text-xs font-medium text-brand-textPrimary">{cat}</p>
                </div>
              ))}
            </div>
            <ul className="space-y-2 text-sm text-brand-textSecondary mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Interactive endpoint testing with live responses
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                cURL preview and copy for every request
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Flow state saves IDs for multi-step workflows
              </li>
            </ul>
            <Link
              to="/explorer"
              className="inline-flex items-center gap-2 bg-brand-textPrimary text-white hover:bg-brand-textPrimary/90 px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              <Terminal className="w-5 h-5" />
              Open API Explorer
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
