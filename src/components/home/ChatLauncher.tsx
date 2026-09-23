'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { MessageCircle } from 'lucide-react';

const ChatBotDialog = lazy(() => import('./ChatBot'));

export default function ChatLauncher() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-svi-chat', handleOpenChat);
    return () => window.removeEventListener('open-svi-chat', handleOpenChat);
  }, []);

  return (
    <>
      {/* Floating button — visible on desktop (on mobile it is integrated into the floating bottom dock) */}
      {!isOpen && (
        <div className="group fixed bottom-8 left-8 z-40 hidden items-center gap-3 md:flex">
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
