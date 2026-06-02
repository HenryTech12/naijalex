import { Bot, User } from 'lucide-react';
import { clsx } from 'clsx';

interface ChatMessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ role, content, timestamp }) => {
  return (
    <div className={clsx('flex gap-3', role === 'user' ? 'justify-end' : 'justify-start')}>
      {role === 'assistant' && (
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div
        className={clsx(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
          role === 'user'
            ? 'bg-primary text-white rounded-br-sm'
            : 'bg-white border border-brand-border text-brand-textPrimary rounded-bl-sm'
        )}
      >
        <div className="flex items-center gap-2 mb-1 text-[11px] uppercase tracking-wide opacity-70">
          {role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
          <span>{role === 'user' ? 'You' : 'NaijaLex'}</span>
          {timestamp ? <span>• {new Date(timestamp).toLocaleTimeString()}</span> : null}
        </div>
        <p>{content}</p>
      </div>
    </div>
  );
};