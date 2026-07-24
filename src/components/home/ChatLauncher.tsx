'use client';

import { useState, lazy, Suspense } from 'react';
import { MessageCircle } from 'lucide-react';

const ChatBotDialog = lazy(() => import('./ChatBot'));

export default function ChatLauncher() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button — always visible, tiny, no heavy deps */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-brand-navy dark:bg-brand-gold dark:text-brand-navy fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl md:bottom-8 md:left-8 md:h-16 md:w-16"
          aria-label="Open chat assistant"
        >
          <MessageCircle className="h-6 w-6 md:h-7 md:w-7" />
          <span className="bg-brand-gold dark:bg-brand-navy absolute inline-flex h-full w-full animate-ping rounded-full opacity-20" />
        </button>
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
