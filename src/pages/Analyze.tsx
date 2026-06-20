import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageLayout } from '../components/shared/PageLayout';
import { DropZone } from '../components/upload/DropZone';
import { LanguageToggle } from '../components/upload/LanguageToggle';
import { ProcessingState } from '../components/analysis/ProcessingState';
import { useApp } from '../contexts/AppContext';
import { useUser } from '../hooks/useUser';
import { analyzeDocument, getAnalysis } from '../api/client';
import type { LanguageMode, CreateUserRequest } from '../types';

const BUSINESS_TYPES = ['Sole Trader', 'SME', 'Startup', 'Freelancer', 'Other'];
const INDUSTRIES = ['Retail/Trading', 'Technology', 'Real Estate', 'Services', 'Manufacturing', 'Other'];
const RISK_TOLERANCES = ['low', 'medium', 'high'] as const;
const TYPICAL_CONTRACTS = ['lease', 'supplier agreement', 'employment contract', 'service agreement', 'NDA', 'partnership agreement'];

const PHONE_REGEX = /^\+[1-9]\d{6,14}$/;
const isValidPhone = (phone: string): boolean =>
  phone === '' || PHONE_REGEX.test(phone);

export const Analyze: React.FC = () => {
  const { userId, analysisRequestId, setAnalysisRequestId } = useApp();
  const { createProfile, isCreating } = useUser();
  const navigate = useNavigate();

  // Onboarding state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [industry, setIndustry] = useState('');
  const [riskTolerance, setRiskTolerance] = useState<'low' | 'medium' | 'high'>('medium');
  const [typicalContracts, setTypicalContracts] = useState<string[]>([]);

  // Analysis state
  const [file, setFile] = useState<File | null>(null);
  const [languageMode, setLanguageMode] = useState<LanguageMode>('english');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessType || !industry) {
      toast.error('Please fill in required fields.');
      return;
    }
    if (phoneNumber && !isValidPhone(phoneNumber)) {
      toast.error('Phone number must be in E.164 format (e.g. +2348012345678).');
      return;
    }
    try {
      const payload: CreateUserRequest = {
        phone_number: phoneNumber || '+2340000000000',
        business_type: businessType,
        industry: industry,
        risk_tolerance: riskTolerance,
        typical_contracts: typicalContracts.length > 0 ? typicalContracts : undefined,
      };
      await createProfile(payload);
      toast.success('Profile created!');
    } catch (err) {
      console.error('[NaijaLex] Profile creation failed:', err);
      toast.error('Failed to create profile.');
    }
  };

  const handleAnalyze = async () => {
    if (!file || !userId) return;
    setIsUploading(true);
    try {
      const res = await analyzeDocument(file, userId, languageMode);
      setAnalysisRequestId(res.analysis_id);
      setIsProcessing(true);
      setIsUploading(false);
      toast.success(`Analysis started! Estimated: ${res.estimated_seconds}s`);
    } catch (err) {
      console.error('[NaijaLex] Document upload failed:', err);
      toast.error('Failed to upload document. Please try again.');
      setIsUploading(false);
    }
  };

  const toggleContract = (contract: string) => {
    setTypicalContracts((prev) =>
      prev.includes(contract) ? prev.filter((c) => c !== contract) : [...prev, contract]
    );
  };

  if (isProcessing && analysisRequestId) {
    return (
      <PageLayout showFooter={false}>
        <div className="pt-20 max-w-3xl mx-auto px-4">
          <ProcessingStateWithPolling
            analysisId={analysisRequestId}
            onComplete={(id) => navigate(`/analysis/${id}`)}
          />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
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
                    Tell us about your business to personalize your analysis.
                  </p>
                </div>
                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-brand-textPrimary mb-1.5">
                      Phone Number <span className="text-brand-textSecondary">(optional)</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-textSecondary" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+2348012345678"
                        className="w-full pl-10 pr-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-brand-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-textPrimary mb-1.5">
                      Business Type <span className="text-danger">*</span>
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
                      Industry <span className="text-danger">*</span>
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

                  <div>
                    <label className="block text-sm font-medium text-brand-textPrimary mb-1.5">
                      Risk Tolerance
                    </label>
                    <div className="flex gap-2">
                      {RISK_TOLERANCES.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRiskTolerance(r)}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                            riskTolerance === r
                              ? 'bg-primary text-white border-primary'
                              : 'bg-brand-bg border-brand-border text-brand-textSecondary hover:border-primary/50'
                          }`}
                        >
                          {r ? r.charAt(0).toUpperCase() + r.slice(1) : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-textPrimary mb-1.5">
                      Typical Contracts <span className="text-brand-textSecondary">(optional)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {TYPICAL_CONTRACTS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleContract(c)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            typicalContracts.includes(c)
                              ? 'bg-primary-50 border-primary text-primary'
                              : 'bg-brand-bg border-brand-border text-brand-textSecondary hover:border-primary/50'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </PageLayout>
  );
};

// Inline component to handle polling + navigation
const ProcessingStateWithPolling: React.FC<{
  analysisId: string;
  onComplete: (id: string) => void;
}> = ({ analysisId, onComplete }) => {
  const [isComplete, setIsComplete] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let count = 0;

    const poll = async () => {
      try {
        const result = await getAnalysis(analysisId);
        count++;
        if (result.status === 'complete') {
          setIsComplete(true);
          setCurrentAnalysisId(result.id);
          clearInterval(interval);
          setTimeout(() => onComplete(result.id), 800);
        } else if (result.status === 'failed') {
          clearInterval(interval);
          toast.error('Analysis failed. Please try again.');
        } else if (count >= 40) {
          clearInterval(interval);
          toast.error('Analysis timed out. Please try again.');
        }
      } catch (err) {
        console.error('[NaijaLex] Polling error in ProcessingStateWithPolling:', err);
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
      {currentAnalysisId && (
        <p className="text-center text-sm text-brand-textSecondary mt-4">
          Analysis ID: {currentAnalysisId}
        </p>
      )}
    </div>
  );
};
