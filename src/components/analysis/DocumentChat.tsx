import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageCircle, ChevronDown, ChevronUp, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { askQuestion, type ChatMessage } from '../../api/chat';
import type { LanguageMode } from '../../types';
import { ChatMessageBubble } from './ChatMessageBubble';

interface DocumentChatProps {
  analysisId: string;
  languageMode: LanguageMode;
}

const STARTER_QUESTIONS_EN = [
  'Which clause is most dangerous?',
  'Can I negotiate the penalty clause?',
  'What happens if I sign as-is?',
  'Which clauses should I remove?',
];

const STARTER_QUESTIONS_PIDGIN = [
  'Which clause be the most dangerous?',
  'Wetin go happen if I sign like dis?',
  'Which clause I fit negotiate?',
  'How e go affect my business?',
];

export const DocumentChat: React.FC<DocumentChatProps> = ({
  analysisId,
  languageMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const CHAT_STORAGE_KEY = `naijalex_chat_${analysisId}`;
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Array<{
          role: 'user' | 'assistant';
          content: string;
          timestamp: string;
        }>;
        return parsed.map((message) => ({
          ...message,
          timestamp: new Date(message.timestamp),
        }));
      }
    } catch {}

    return [
      {
        role: 'assistant',
        content:
          languageMode === 'pidgin'
            ? 'Hello! I don analyze your contract. Ask me anything about am — I dey here to help! 💬'
            : "Hello! I've analyzed your contract. Ask me anything about it — I'm here to help! 💬",
        timestamp: new Date(),
      },
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const starters =
    languageMode === 'pidgin' ? STARTER_QUESTIONS_PIDGIN : STARTER_QUESTIONS_EN;

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, messages]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Array<{
          role: 'user' | 'assistant';
          content: string;
          timestamp: string;
        }>;
        setMessages(
          parsed.map((message) => ({
            ...message,
            timestamp: new Date(message.timestamp),
          }))
        );
        return;
      }
    } catch {}

    setMessages([
      {
        role: 'assistant',
        content:
          languageMode === 'pidgin'
            ? 'Hello! I don analyze your contract. Ask me anything about am — I dey here to help! 💬'
            : "Hello! I've analyzed your contract. Ask me anything about it — I'm here to help! 💬",
        timestamp: new Date(),
      },
    ]);
  }, [CHAT_STORAGE_KEY, languageMode]);

  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages, CHAT_STORAGE_KEY]);

  const sendMessage = async (question: string) => {
    if (!question.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: question.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await askQuestion(analysisId, question.trim(), languageMode);
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: res.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      toast.error('Failed to get response. Please try again.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            languageMode === 'pidgin'
              ? 'Sorry, something go wrong. Abeg try again! 🙏'
              : 'Sorry, something went wrong. Please try again! 🙏',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
      {/* Header — always visible, toggles chat open/closed */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-brand-bg transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-brand-textPrimary text-sm">
              Ask NaijaLex about this contract
            </h3>
            <p className="text-xs text-brand-textSecondary">
              {languageMode === 'pidgin'
                ? 'I fit answer any question for Pidgin'
                : 'Ask anything about the clauses or risks'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-medium">
              {messages.length - 1}
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-brand-textSecondary" />
          ) : (
            <ChevronDown className="w-4 h-4 text-brand-textSecondary" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-brand-border">
              {/* Message thread */}
              <div className="h-72 overflow-y-auto p-4 space-y-3 bg-brand-bg/30">
                {messages.map((msg, i) => (
                  <ChatMessageBubble
                    key={i}
                    role={msg.role}
                    content={msg.content}
                    timestamp={msg.timestamp.toISOString()}
                  />
                ))}

                {isLoading && (
                  <div className="flex gap-2 items-end">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-white border border-brand-border px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                      <div className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Starter questions — only show if only 1 message (the welcome) */}
              {messages.length === 1 && (
                <div className="px-4 py-3 border-t border-brand-border bg-white">
                  <p className="text-xs text-brand-textSecondary mb-2 font-medium">
                    Suggested questions:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {starters.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="text-xs px-3 py-1.5 bg-primary-50 text-primary border border-primary/20 rounded-full hover:bg-primary-100 transition-colors font-medium"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-brand-border bg-white">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      languageMode === 'pidgin'
                        ? 'Ask anything about dis contract...'
                        : 'Ask anything about this contract...'
                    }
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 text-sm bg-brand-bg border border-brand-border rounded-xl text-brand-textPrimary placeholder:text-brand-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50"
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isLoading}
                    className="w-10 h-10 flex items-center justify-center bg-primary hover:bg-primary-600 disabled:bg-primary/40 disabled:cursor-not-allowed text-white rounded-xl transition-colors shrink-0"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-brand-textSecondary mt-2 text-center">
                  Press Enter to send • Powered by GPT-4o
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
