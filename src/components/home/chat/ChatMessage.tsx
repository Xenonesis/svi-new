'use client';

import { User, Bot, CheckCircle2 } from 'lucide-react';
import type { UIMessage } from '@ai-sdk/react';
import FormattedText from '@/src/components/home/FormattedText';
import QuickActions from '@/src/components/home/QuickActions';
import ChatFeedback from './ChatFeedback';

interface ChatMessageProps {
  message: UIMessage;
  conversationCount: number;
  feedback: Record<string, 'up' | 'down' | null>;
  onFeedback: (messageId: string, type: 'up' | 'down') => void;
}

export default function ChatMessage({
  message,
  conversationCount,
  feedback,
  onFeedback,
}: ChatMessageProps) {
  const isUser = message.role === 'user';
  const textContent = message.parts
    .filter((p) => p.type === 'text')
    .map((p: any) => (p as any).text || '')
    .join(' ');

  const toolInvocations = message.parts.filter((p: any) => p.type === 'tool-invocation') as any[];
  const hasLeadQualified = toolInvocations.some(
    (t: any) => t.toolInvocation?.toolName === 'qualifyLead'
  );

  return (
    <div className="mb-4">
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`flex max-w-[85%] items-start gap-2 ${
            isUser ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          {/* Avatar */}
          <div
            className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
              isUser ? 'bg-brand-navy dark:bg-brand-gold' : 'bg-brand-gold/15'
            }`}
          >
            {isUser ? (
              <User className="dark:text-brand-navy h-3.5 w-3.5 text-white" />
            ) : (
              <Bot className="text-brand-gold h-3.5 w-3.5" />
            )}
          </div>

          {/* Bubble */}
          <div>
            <div
              className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                isUser
                  ? 'bg-brand-navy dark:bg-brand-gold dark:text-brand-navy rounded-tr-md text-white'
                  : 'rounded-tl-md bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              }`}
            >
              {isUser ? textContent : <FormattedText text={textContent} />}
            </div>

            {/* Tool Invocation UI */}
            {hasLeadQualified && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle2 size={12} />
                Lead captured!
              </div>
            )}

            {/* Quick Actions + Feedback (only on AI messages) */}
            {!isUser && (
              <>
                {conversationCount > 0 && <QuickActions />}
                <ChatFeedback
                  messageId={message.id}
                  value={feedback[message.id] ?? null}
                  onChange={onFeedback}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
