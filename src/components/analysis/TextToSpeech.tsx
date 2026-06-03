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
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load voices — must wait for onvoiceschanged (async in Chrome)
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    setIsSupported(true);

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) setVoices(available);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Cancel speech when text changes (e.g. language tab switch)
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [text]);

  if (!isSupported) return null;

  const pickNigerianVoice = (): SpeechSynthesisVoice | null => {
    // Priority: en-NG -> en-GB (closest accent) -> any English
    return (
      voices.find((voice) => voice.lang === 'en-NG') ||
      voices.find((voice) => voice.lang === 'en-GB') ||
      voices.find((voice) => voice.lang === 'en-AU') ||
      voices.find((voice) => voice.lang.startsWith('en')) ||
      null
    );
  };

  const speak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickNigerianVoice();
    if (voice) utterance.voice = voice;

    // Nigerian English settings
    utterance.lang = 'en-NG';
    utterance.rate = 0.88;
    utterance.pitch = 1.05;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.warn('[NaijaLex] Speech synthesis error:', event.error);
      setIsSpeaking(false);
    };
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
        size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5',
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
