'use client';

import { useState, lazy, Suspense } from 'react';
import { MessageCircle } from 'lucide-react';

const ChatBotDialog = lazy(() => import('./ChatBot'));

export default function ChatLauncher() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button — always visible with hover tooltip */}
      {!isOpen && (
        <div className="group fixed bottom-6 left-6 z-40 flex items-center gap-3 md:bottom-8 md:left-8">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-brand-navy dark:bg-brand-gold dark:text-brand-navy border-brand-gold/30 relative flex h-14 w-14 items-center justify-center rounded-full border text-white shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl md:h-16 md:w-16"
            aria-label="Open AI chat assistant"
          >
            <MessageCircle className="h-6 w-6 md:h-7 md:w-7" />
            <span className="bg-brand-gold dark:bg-brand-navy absolute inline-flex h-full w-full animate-ping rounded-full opacity-20" />
          </button>
          <span className="bg-brand-navy/90 text-brand-gold border-brand-gold/30 hidden rounded-lg border px-3 py-1.5 text-xs font-semibold whitespace-nowrap opacity-0 shadow-lg backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100 md:inline-block">
            Ask AI Assistant
          </span>
        </div>
      )}

      {/* Full dialog — loaded lazily only when user clicks */}
      {isOpen && (
        <Suspense fallback={null}>
          <ChatBotDialog onClose={() => setIsOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
