import { useState, useEffect, useRef } from 'react';
import { Volume2, Square } from 'lucide-react';
import { clsx } from 'clsx';

interface TextToSpeechProps {
  text: string;
  label?: string;
  size?: 'sm' | 'md';
}

export const TextToSpeech: React.FC<TextToSpeechProps> = ({
  text,
  label = 'Listen',
  size = 'md',
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
    return () => {
      if (utteranceRef.current) window.speechSynthesis.cancel();
    };
  }, []);

  if (!isSupported) return null;

  const speak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <button
      onClick={speak}
      title={isSpeaking ? 'Stop reading' : label}
      className={clsx(
        'flex items-center gap-1.5 font-medium transition-all duration-200 rounded-lg border',
        size === 'sm'
          ? 'text-xs px-2 py-1'
          : 'text-sm px-3 py-1.5',
        isSpeaking
          ? 'bg-primary text-white border-primary'
          : 'text-brand-textSecondary border-brand-border bg-white hover:border-primary/50 hover:text-primary'
      )}
    >
      {isSpeaking ? (
        <>
          <Square className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Stop
        </>
      ) : (
        <>
          <Volume2 className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          {label}
        </>
      )}
    </button>
  );
};
