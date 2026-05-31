import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Lightbulb, CheckCircle2 } from 'lucide-react';
import { Scale } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Reading Document', icon: FileText, completeAt: 8000 },
  { id: 2, label: 'Analyzing Clauses', icon: Search, completeAt: 20000 },
  { id: 3, label: 'Building Advice', icon: Lightbulb, completeAt: Infinity },
];

interface ProcessingStateProps {
  isComplete: boolean;
}

export const ProcessingState: React.FC<ProcessingStateProps> = ({ isComplete }) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    const timers = STEPS.map((step) => {
      if (step.completeAt === Infinity) return null;
      return setTimeout(() => {
        setCompletedSteps((prev) => [...prev, step.id]);
      }, step.completeAt);
    });

    return () => {
      timers.forEach((t) => t && clearTimeout(t));
    };
  }, []);

  useEffect(() => {
    if (isComplete) {
      setCompletedSteps([1, 2, 3]);
    }
  }, [isComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg mb-8"
      >
        <Scale className="w-10 h-10 text-white" />
      </motion.div>

      <h2 className="text-2xl font-bold text-brand-textPrimary mb-2">Analyzing your contract...</h2>
      <p className="text-brand-textSecondary mb-10">This takes about 30 seconds</p>

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-0 w-full max-w-lg">
        {STEPS.map((step, index) => {
          const isStepComplete = completedSteps.includes(step.id);
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex sm:flex-1 flex-col items-center sm:flex-row w-full">
              <div className="flex flex-col items-center flex-1">
                <motion.div
                  animate={
                    isStepComplete
                      ? { backgroundColor: '#1D9E75', borderColor: '#1D9E75' }
                      : { backgroundColor: '#F8F7F4', borderColor: '#E5E4E0' }
                  }
                  transition={{ duration: 0.4 }}
                  className="w-12 h-12 rounded-full border-2 flex items-center justify-center mb-2"
                >
                  {isStepComplete ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={
                        !isStepComplete && index === completedSteps.length
                          ? { opacity: [0.5, 1, 0.5] }
                          : { opacity: 0.4 }
                      }
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Icon className="w-5 h-5 text-brand-textSecondary" />
                    </motion.div>
                  )}
                </motion.div>
                <p
                  className={`text-xs font-medium text-center ${
                    isStepComplete ? 'text-primary' : 'text-brand-textSecondary'
                  }`}
                >
                  {step.label}
                </p>
              </div>

              {index < STEPS.length - 1 && (
                <motion.div
                  animate={{
                    backgroundColor: isStepComplete ? '#1D9E75' : '#E5E4E0',
                  }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="hidden sm:block h-0.5 flex-1 mx-2 mb-5 rounded-full"
                />
              )}
            </div>
          );
        })}
      </div>

      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-8 flex items-center gap-2"
      >
        <div className="w-2 h-2 bg-primary rounded-full" />
        <div className="w-2 h-2 bg-primary/60 rounded-full" />
        <div className="w-2 h-2 bg-primary/30 rounded-full" />
      </motion.div>
    </div>
  );
};
