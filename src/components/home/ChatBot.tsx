'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { AnimatePresence, motion } from 'motion/react';
import { MessageCircle, Send, X, Minimize2, Bot, User, Loader2, Square } from 'lucide-react';
import { useState, useRef, useEffect, type FormEvent } from 'react';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status, stop, error, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && status === 'ready') {
      sendMessage({ text: input });
      setInput('');
    }
  };

  const isStreaming = status === 'submitted' || status === 'streaming';

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
            {/* Pulse ring */}
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
            className="fixed bottom-4 left-4 z-50 flex h-[min(580px,80vh)] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl md:bottom-8 md:left-8 dark:border-gray-700 dark:bg-gray-900"
          >
            {/* Header */}
            <div className="bg-brand-navy dark:bg-brand-navy-light flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="bg-brand-gold/20 flex h-9 w-9 items-center justify-center rounded-full">
                  <Bot className="text-brand-gold h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">SVI Assistant</h3>
                  <p className="text-xs text-gray-300">
                    {isStreaming ? 'Typing...' : 'Ask about our properties'}
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
                    <Bot className="text-brand-gold h-8 w-8" />
                  </div>
                  <h4 className="text-brand-navy mb-2 font-serif text-lg font-semibold dark:text-white">
                    Welcome to SVI Infra!
                  </h4>
                  <p className="mb-6 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                    I&apos;m your real estate assistant. Ask me about our projects in Jaipur, Noida,
                    or Phulera Smart City.
                  </p>
                  <div className="flex w-full flex-col gap-2">
                    {[
                      'What projects do you have in Jaipur?',
                      'Tell me about Phulera Smart City',
                      'What commercial properties are available?',
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          sendMessage({ text: suggestion });
                        }}
                        className="border-brand-gold/20 bg-brand-gold/5 text-brand-navy hover:border-brand-gold/40 hover:bg-brand-gold/10 dark:border-brand-gold/10 dark:hover:border-brand-gold/30 dark:hover:bg-brand-gold/5 w-full rounded-xl border px-4 py-2.5 text-left text-sm transition-all dark:text-gray-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message List */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex max-w-[85%] items-start gap-2 ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        message.role === 'user'
                          ? 'bg-brand-navy dark:bg-brand-gold'
                          : 'bg-brand-gold/15'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="dark:text-brand-navy h-3.5 w-3.5 text-white" />
                      ) : (
                        <Bot className="text-brand-gold h-3.5 w-3.5" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        message.role === 'user'
                          ? 'bg-brand-navy dark:bg-brand-gold dark:text-brand-navy rounded-tr-md text-white'
                          : 'rounded-tl-md bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {message.parts.map((part, index) =>
                        part.type === 'text' ? (
                          <span key={index} className="whitespace-pre-wrap">
                            {part.text}
                          </span>
                        ) : null
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Streaming indicator */}
              {status === 'submitted' && (
                <div className="mb-4 flex justify-start">
                  <div className="flex items-start gap-2">
                    <div className="bg-brand-gold/15 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                      <Bot className="text-brand-gold h-3.5 w-3.5" />
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl rounded-tl-md bg-gray-100 px-4 py-3 dark:bg-gray-800">
                      <Loader2 className="text-brand-gold h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
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

            {/* Input Area */}
            <form
              onSubmit={handleSubmit}
              className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="flex items-center gap-2">
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
