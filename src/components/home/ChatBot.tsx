'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { AnimatePresence, motion } from 'motion/react';
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Bot,
  User,
  Loader2,
  Square,
  Mic,
  MicOff,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
} from 'lucide-react';
import { useState, useRef, useEffect, type FormEvent, useCallback, useMemo } from 'react';
import FormattedText from '@/src/components/home/FormattedText';
import QuickActions from '@/src/components/home/QuickActions';
import LeadCapture from '@/src/components/home/LeadCapture';

const STORAGE_KEY = 'svi-chat-history';
const SUGGESTION_POOLS: Record<string, string[]> = {
  default: [
    'What projects do you have in Jaipur?',
    'Tell me about Phulera Smart City',
    'What commercial properties are available?',
  ],
  jaipur: ['What is the price range in Jaipur?', 'Are there ready-to-move flats in Jaipur?'],
  noida: ['Which commercial projects are in Noida?', 'What is the rental yield in Noida?'],
  phulera: ['What is Phulera Smart City?', 'What are the payment plans in Phulera?'],
  price: ['What is the starting price?', 'What payment plans do you offer?'],
  commercial: ['Tell me about commercial properties', 'What is the ROI on commercial?'],
  residential: ['Tell me about residential flats', 'What sizes are available?'],
  contact: ['What is your office address?', 'I want to schedule a site visit'],
};

function getSuggestions(lastMessage: string): string[] {
  const lower = lastMessage.toLowerCase();
  const pools: string[] = [];

  if (lower.includes('jaipur') || lower.includes('jodhpur')) pools.push('jaipur');
  if (lower.includes('noida')) pools.push('noida');
  if (lower.includes('phulera')) pools.push('phulera');
  if (lower.includes('price') || lower.includes('cost') || lower.includes('₹')) pools.push('price');
  if (lower.includes('commercial') || lower.includes('office') || lower.includes('shop'))
    pools.push('commercial');
  if (lower.includes('flat') || lower.includes('apartment') || lower.includes('resi'))
    pools.push('residential');
  if (
    lower.includes('contact') ||
    lower.includes('address') ||
    lower.includes('visit') ||
    lower.includes('call')
  )
    pools.push('contact');

  if (pools.length === 0) pools.push('default');

  const suggestions = pools.flatMap((key) => SUGGESTION_POOLS[key] || []);
  // Shuffle & take 2-3 unique
  const shuffled = [...new Set(suggestions)].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

function generateSessionId(): string {
  return `svi_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadDismissed, setLeadDismissed] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down' | null>>({});
  const [sessionId] = useState(generateSessionId);
  const [isListening, setIsListening] = useState(false);
  const [typingDots, setTypingDots] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const logSaveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { messages, sendMessage, status, stop, error, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // ─── Typing dots animation ──────────────────────────────────────────────
  useEffect(() => {
    if (status === 'submitted') {
      const interval = setInterval(() => {
        setTypingDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [status]);

  // ─── Auto-scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Focus input when chat opens ────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

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

  // Periodic save every 30s while chat is open + save on close
  useEffect(() => {
    if (!isOpen) return;
    logSaveTimerRef.current = setInterval(saveLog, 30000);
    return () => {
      clearInterval(logSaveTimerRef.current);
      saveLog();
    };
  }, [isOpen, saveLog]);

  // Save on unmount (page navigation)
  useEffect(() => {
    return () => {
      saveLog();
    };
  }, [saveLog]);

  // ─── Lead capture: Show after 3rd AI message ───────────────────────────
  useEffect(() => {
    if (messages.length >= 5 && !leadSubmitted && !leadDismissed && !showLeadCapture) {
      const aiCount = messages.filter((m) => m.role === 'assistant').length;
      if (aiCount >= 2) {
        setShowLeadCapture(true);
      }
    }
  }, [messages, leadSubmitted, leadDismissed, showLeadCapture]);

  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  const handleSubmit = (e: FormEvent) => {
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
    const text = last.parts
      .filter((p) => p.type === 'text')
      .map((p) => (p as any).text || '')
      .join(' ');
    return text;
  }, [messages]);

  const contextualSuggestions = useMemo(() => {
    if (!lastAiMessage) return [];
    return getSuggestions(lastAiMessage);
  }, [lastAiMessage]);

  // ─── Voice Input ───────────────────────────────────────────────────────
  const toggleVoice = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  // ─── Feedback ──────────────────────────────────────────────────────────
  const handleFeedback = useCallback((messageId: string, type: 'up' | 'down') => {
    setFeedback((prev) => ({
      ...prev,
      [messageId]: prev[messageId] === type ? null : type,
    }));
  }, []);

  const conversationCount = messages.filter((m) => m.role === 'assistant').length;

  return (
    <>
      {/* Floating Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="bg-brand-navy dark:bg-brand-gold dark:text-brand-navy fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl md:bottom-8 md:left-8 md:h-16 md:w-16"
            aria-label="Open chat assistant"
          >
            <MessageCircle className="h-6 w-6 md:h-7 md:w-7" />
            <span className="bg-brand-gold dark:bg-brand-navy absolute inline-flex h-full w-full animate-ping rounded-full opacity-20" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-4 left-4 z-50 flex h-[min(580px,80vh)] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl max-sm:inset-0 max-sm:h-full max-sm:w-full max-sm:rounded-none max-sm:border-0 md:bottom-8 md:left-8 dark:border-gray-700 dark:bg-gray-900"
          >
            {/* Header */}
            <div className="bg-brand-navy dark:bg-brand-navy-light flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="bg-brand-gold/20 flex h-9 w-9 items-center justify-center rounded-full">
                  <Sparkles className="text-brand-gold h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">SVI Assistant</h3>
                  <p className="text-xs text-gray-300">
                    {isStreaming ? 'Typing...' : 'Powered by AI'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Minimize chat"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="scrollbar-gold flex-1 overflow-y-auto px-4 py-4">
              {/* Welcome Message */}
              {messages.length === 0 && (
                <div className="flex flex-col items-center px-4 py-6 text-center">
                  <div className="bg-brand-gold/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <Sparkles className="text-brand-gold h-8 w-8" />
                  </div>
                  <h4 className="text-brand-navy mb-2 font-serif text-lg font-semibold dark:text-white">
                    Welcome to SVI Infra!
                  </h4>
                  <p className="mb-6 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                    I&apos;m your AI real estate assistant. Ask me anything about our projects in
                    Jaipur, Noida, or Phulera Smart City.
                  </p>
                  <div className="flex w-full flex-col gap-2">
                    {(SUGGESTION_POOLS.default || []).map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="border-brand-gold/20 bg-brand-gold/5 text-brand-navy hover:border-brand-gold/40 hover:bg-brand-gold/10 dark:border-brand-gold/10 dark:hover:border-brand-gold/30 dark:hover:bg-brand-gold/5 w-full rounded-xl border px-4 py-2.5 text-left text-sm transition-all dark:text-gray-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((message) => {
                const isUser = message.role === 'user';
                const textContent = message.parts
                  .filter((p) => p.type === 'text')
                  .map((p) => (p as any).text || '')
                  .join(' ');

                return (
                  <div key={message.id} className="mb-4">
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

                          {/* Quick Actions (only on AI messages) */}
                          {!isUser && conversationCount > 0 && <QuickActions />}

                          {/* Feedback (only on AI messages) */}
                          {!isUser && (
                            <div className="mt-1 flex items-center gap-1.5 pl-1">
                              <button
                                onClick={() => handleFeedback(message.id, 'up')}
                                className={`rounded-md p-1 transition-colors ${
                                  feedback[message.id] === 'up'
                                    ? 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400'
                                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                                }`}
                                aria-label="Thumbs up"
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleFeedback(message.id, 'down')}
                                className={`rounded-md p-1 transition-colors ${
                                  feedback[message.id] === 'down'
                                    ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                                }`}
                                aria-label="Thumbs down"
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Contextual Suggestions */}
              {showSuggestions &&
                messages.length > 0 &&
                contextualSuggestions.length > 0 &&
                status === 'ready' && (
                  <div className="mb-4">
                    <p className="mb-2 text-xs font-medium text-gray-400">Suggested follow-ups:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {contextualSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="border-brand-gold/20 bg-brand-gold/5 text-brand-navy hover:border-brand-gold/40 hover:bg-brand-gold/10 dark:border-brand-gold/10 dark:hover:border-brand-gold/30 dark:hover:bg-brand-gold/5 rounded-full border px-3 py-1.5 text-xs transition-all dark:text-gray-300"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Streaming indicator */}
              {status === 'submitted' && (
                <div className="mb-4 flex justify-start">
                  <div className="flex items-start gap-2">
                    <div className="bg-brand-gold/15 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                      <Bot className="text-brand-gold h-3.5 w-3.5" />
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl rounded-tl-md bg-gray-100 px-4 py-3 dark:bg-gray-800">
                      <Loader2 className="text-brand-gold h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Thinking{typingDots}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
                  Something went wrong. Please try again.
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Lead Capture */}
            {showLeadCapture && (
              <LeadCapture
                onClose={() => {
                  setShowLeadCapture(false);
                  setLeadDismissed(true);
                }}
                onSubmitted={() => setLeadSubmitted(true)}
              />
            )}

            {/* Input Area */}
            <form
              onSubmit={handleSubmit}
              className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="flex items-center gap-2">
                {/* Voice Input */}
                {'webkitSpeechRecognition' in window || 'SpeechRecognition' in window ? (
                  <button
                    type="button"
                    onClick={toggleVoice}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
                      isListening
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                    }`}
                    aria-label={isListening ? 'Stop recording' : 'Voice input'}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                ) : null}

                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about our properties..."
                  disabled={status !== 'ready' && status !== 'error'}
                  className="focus:border-brand-gold focus:ring-brand-gold/20 dark:focus:border-brand-gold flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 transition-all placeholder:text-gray-400 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder:text-gray-500"
                  aria-label="Type your message"
                />

                {isStreaming ? (
                  <button
                    type="button"
                    onClick={() => stop()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white transition-all hover:bg-red-600"
                    aria-label="Stop generating"
                  >
                    <Square className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim() || status !== 'ready'}
                    className="bg-brand-navy hover:bg-brand-navy-light dark:bg-brand-gold dark:text-brand-navy dark:hover:bg-brand-gold-light flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                )}
              </div>

              <p className="mt-2 text-center text-[10px] text-gray-400 dark:text-gray-500">
                Powered by SVI Infra Solutions &middot; AI responses may vary
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
