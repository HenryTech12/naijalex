import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { DropZone } from '../components/upload/DropZone';
import { LanguageToggle } from '../components/upload/LanguageToggle';
import WhatsAppMode from '../components/upload/WhatsAppMode';
import { ProcessingState } from '../components/analysis/ProcessingState';
import { useApp } from '../contexts/AppContext';
import { useUser } from '../hooks/useUser';
import { analyzeDocument, getAnalysis } from '../api/client';
import type { LanguageMode } from '../types';

const BUSINESS_TYPES = ['Sole Trader', 'SME', 'Startup', 'Freelancer', 'Other'];
const INDUSTRIES = ['Retail/Trading', 'Technology', 'Real Estate', 'Services', 'Manufacturing', 'Other'];

export const Analyze: React.FC = () => {
  const { userId } = useApp();
  const { createProfile, isCreating } = useUser();
  const navigate = useNavigate();

  const [businessType, setBusinessType] = useState('');
  const [industry, setIndustry] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [languageMode, setLanguageMode] = useState<LanguageMode>('english');
  const [useWhatsApp, setUseWhatsApp] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessType || !industry) {
      toast.error('Please fill in all fields.');
      return;
    }
    try {
      await createProfile({ business_type: businessType, industry });
      toast.success('Profile created!');
    } catch {
      // error handled in hook
    }
  };

  const handleAnalyze = async () => {
    if (!file || !userId) return;
    setIsUploading(true);
    try {
      const res = await analyzeDocument(file, userId, languageMode);
      setAnalysisId(res.analysis_id);
      setIsProcessing(true);
      setIsUploading(false);
    } catch {
      toast.error('Failed to upload document. Please try again.');
      setIsUploading(false);
    }
  };

  if (isProcessing && analysisId) {
    return (
      <div className="min-h-screen bg-brand-bg">
        <Navbar />
        <div className="pt-20 max-w-3xl mx-auto px-4">
          <ProcessingStateWithPolling
            analysisId={analysisId}
            onComplete={(id) => navigate(`/analysis/${id}`)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {!userId ? (
              <motion.div
                key="onboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl border border-brand-border shadow-sm p-8"
              >
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-brand-textPrimary">Welcome to NaijaLex</h1>
                  <p className="text-brand-textSecondary mt-2">
                    Tell us a little about your business to personalize your analysis.
                  </p>
                </div>
                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-brand-textPrimary mb-1.5">
                      What type of business do you run?
                    </label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-brand-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    >
                      <option value="">Select business type...</option>
                      {BUSINESS_TYPES.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-textPrimary mb-1.5">
                      What industry?
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-brand-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    >
                      <option value="">Select industry...</option>
                      {INDUSTRIES.map((i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={isCreating || !businessType || !industry}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-600 disabled:bg-primary/50 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-sm"
                  >
                    {isCreating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <h1 className="text-2xl font-bold text-brand-textPrimary">Analyze a Contract</h1>
                  <p className="text-brand-textSecondary mt-1">
                    Upload your document and get a full risk analysis in seconds.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-brand-border shadow-sm p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setUseWhatsApp(false)}
                      className={`px-4 py-2 rounded-md font-medium ${
                        !useWhatsApp
                          ? 'bg-primary text-white'
                          : 'bg-brand-bg text-brand-textSecondary border border-brand-border'
                      }`}
                    >
                      Upload
                    </button>
                    <button
                      onClick={() => setUseWhatsApp(true)}
                      className={`px-4 py-2 rounded-md font-medium ${
                        useWhatsApp
                          ? 'bg-primary text-white'
                          : 'bg-brand-bg text-brand-textSecondary border border-brand-border'
                      }`}
                    >
                      WhatsApp
                    </button>
                  </div>

                  {!useWhatsApp ? (
                    <>
                      <DropZone
                        file={file}
                        onFileSelect={setFile}
                        onFileClear={() => setFile(null)}
                      />
                      <LanguageToggle value={languageMode} onChange={setLanguageMode} />
                      <button
                        onClick={handleAnalyze}
                        disabled={!file || isUploading}
                        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-600 disabled:bg-primary/40 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-semibold text-base transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            Analyze Contract
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    // Lazy load to avoid adding new import at top-level changes
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <WhatsAppMode />
                    </React.Suspense>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Inline component to handle polling + navigation
const ProcessingStateWithPolling: React.FC<{
  analysisId: string;
  onComplete: (id: string) => void;
}> = ({ analysisId, onComplete }) => {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let count = 0;

    const poll = async () => {
      try {
        const result = await getAnalysis(analysisId);
        count++;
        if (result.status === 'complete') {
          setIsComplete(true);
          clearInterval(interval);
          setTimeout(() => onComplete(analysisId), 800);
        } else if (count >= 40) {
          clearInterval(interval);
          toast.error('Analysis timed out. Please try again.');
        }
      } catch {
        clearInterval(interval);
        toast.error('Connection error during analysis.');
      }
    };

    poll();
    interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [analysisId, onComplete]);

  return (
    <div className="pt-8">
      <ProcessingState isComplete={isComplete} />
    </div>
  );
};
