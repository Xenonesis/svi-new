'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { AnimatePresence, motion } from 'motion/react';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import LeadCapture from '@/src/components/home/LeadCapture';
import { useTranslations } from 'next-intl';

import ChatHeader from './chat/ChatHeader';
import ChatWelcome from './chat/ChatWelcome';
import ChatMessage from './chat/ChatMessage';
import ChatSuggestions from './chat/ChatSuggestions';
import ChatTypingIndicator from './chat/ChatTypingIndicator';
import ChatInput from './chat/ChatInput';

const STORAGE_KEY = 'svi-chat-history';

function getSuggestionPool(t: ReturnType<typeof useTranslations>): Record<string, string[]> {
  return {
    default: [t('suggestions.default1'), t('suggestions.default2'), t('suggestions.default3')],
    jaipur: [t('suggestions.jaipur1'), t('suggestions.jaipur2')],
    khatuShyam: [t('suggestions.khatuShyam1'), t('suggestions.khatuShyam2')],
    phulera: [t('suggestions.phulera1'), t('suggestions.phulera2')],
    price: [t('suggestions.price1'), t('suggestions.price2')],
    commercial: [t('suggestions.commercial1'), t('suggestions.commercial2')],
    residential: [t('suggestions.residential1'), t('suggestions.residential2')],
    contact: [t('suggestions.contact1'), t('suggestions.contact2')],
  };
}

function getSuggestions(lastMessage: string, pools: Record<string, string[]>): string[] {
  const lower = lastMessage.toLowerCase();
  const matchedPools: string[] = [];

  if (lower.includes('jaipur') || lower.includes('jodhpur')) matchedPools.push('jaipur');
  if (lower.includes('khatu') || lower.includes('shyam')) matchedPools.push('khatuShyam');
  if (lower.includes('phulera')) matchedPools.push('phulera');
  if (lower.includes('price') || lower.includes('cost') || lower.includes('₹'))
    matchedPools.push('price');
  if (lower.includes('commercial') || lower.includes('office') || lower.includes('shop'))
    matchedPools.push('commercial');
  if (lower.includes('flat') || lower.includes('apartment') || lower.includes('resi'))
    matchedPools.push('residential');
  if (
    lower.includes('contact') ||
    lower.includes('address') ||
    lower.includes('visit') ||
    lower.includes('call')
  )
    matchedPools.push('contact');

  if (matchedPools.length === 0) matchedPools.push('default');

  const suggestions = matchedPools.flatMap((key) => pools[key] || []);
  const shuffled = [...new Set(suggestions)].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

function generateSessionId(): string {
  return `svi_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function ChatBot({ onClose }: { onClose: () => void }) {
  const t = useTranslations('chatbot');
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadDismissed, setLeadDismissed] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down' | null>>({});
  const [sessionId] = useState(generateSessionId);
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const logSaveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { messages, sendMessage, status, stop, error, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // ─── Auto-scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── localStorage: Restore on mount ────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, [setMessages]);

  // ─── localStorage: Save on messages change ─────────────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch {
        // ignore
      }
    }
  }, [messages]);

  // ─── Save log to server periodically & on close ────────────────────────
  const saveLog = useCallback(() => {
    const msgs = messagesRef.current;
    if (msgs.length === 0) return;
    fetch('/api/chat/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        messages: msgs.slice(-50),
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {});
  }, [sessionId]);

  useEffect(() => {
    logSaveTimerRef.current = setInterval(saveLog, 30000);
    return () => {
      clearInterval(logSaveTimerRef.current);
      saveLog();
    };
  }, [saveLog]);

  useEffect(() => {
    return () => {
      saveLog();
    };
  }, [saveLog]);

  // ─── Lead capture: Show after 3rd AI message ───────────────────────────
  useEffect(() => {
    if (messages.length >= 5 && !leadSubmitted && !leadDismissed && !showLeadCapture) {
      const aiCount = messages.filter((m) => m.role === 'assistant').length;
      if (aiCount >= 2) setShowLeadCapture(true);
    }
  }, [messages, leadSubmitted, leadDismissed, showLeadCapture]);

  useEffect(() => {
    if (status === 'ready') setShowSuggestions(true);
  }, [status]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && status === 'ready') {
      sendMessage({ text: input });
      setInput('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    sendMessage({ text });
    setShowSuggestions(false);
  };

  const isStreaming = status === 'submitted' || status === 'streaming';

  // ─── Compute suggestions from last assistant message ───────────────────
  const lastAiMessage = useMemo(() => {
    const last = [...messages].reverse().find((m) => m.role === 'assistant');
    if (!last) return null;
    return last.parts
      .filter((p) => p.type === 'text')
      .map((p) => (p as any).text || '')
      .join(' ');
  }, [messages]);

  const suggestionPools = useMemo(() => getSuggestionPool(t), [t]);
  const contextualSuggestions = useMemo(() => {
    if (!lastAiMessage) return [];
    return getSuggestions(lastAiMessage, suggestionPools);
  }, [lastAiMessage, suggestionPools]);

  // ─── Feedback ──────────────────────────────────────────────────────────
  const handleFeedback = useCallback((messageId: string, type: 'up' | 'down') => {
    setFeedback((prev) => ({
      ...prev,
      [messageId]: prev[messageId] === type ? null : type,
    }));
  }, []);

  const conversationCount = messages.filter((m) => m.role === 'assistant').length;
  const isInputDisabled = status !== 'ready' && status !== 'error';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed bottom-4 left-4 z-50 flex h-[min(580px,80vh)] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl max-sm:inset-0 max-sm:h-full max-sm:w-full max-sm:rounded-none max-sm:border-0 md:bottom-8 md:left-8 dark:border-gray-700 dark:bg-gray-900"
      >
        <ChatHeader isStreaming={isStreaming} onMinimize={onClose} onClose={onClose} />

        <div className="scrollbar-gold flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <ChatWelcome
              defaultSuggestions={suggestionPools.default || []}
              onSuggestionClick={handleSuggestionClick}
            />
          )}

          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              conversationCount={conversationCount}
              feedback={feedback}
              onFeedback={handleFeedback}
            />
          ))}

          {showSuggestions &&
            messages.length > 0 &&
            contextualSuggestions.length > 0 &&
            status === 'ready' && (
              <ChatSuggestions
                suggestions={contextualSuggestions}
                onSuggestionClick={handleSuggestionClick}
              />
            )}

          {status === 'submitted' && <ChatTypingIndicator />}

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
              {t('error')}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {showLeadCapture && (
          <LeadCapture
            onClose={() => {
              setShowLeadCapture(false);
              setLeadDismissed(true);
            }}
            onSubmitted={() => setLeadSubmitted(true)}
          />
        )}

        <ChatInput
          input={input}
          setInput={setInput}
          onSubmit={handleSubmit}
          onStop={stop}
          isStreaming={isStreaming}
          disabled={isInputDisabled}
          placeholder={t('placeholder')}
          footerText={t('footer')}
        />
      </motion.div>
    </AnimatePresence>
  );
}
