'use client';

import { Sparkles, Minimize2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ChatHeaderProps {
  isStreaming: boolean;
  onMinimize: () => void;
  onClose: () => void;
}

export default function ChatHeader({ isStreaming, onMinimize, onClose }: ChatHeaderProps) {
  const t = useTranslations('chatbot');

  return (
    <div className="bg-brand-navy dark:bg-brand-navy-light flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="bg-brand-gold/20 flex h-9 w-9 items-center justify-center rounded-full">
          <Sparkles className="text-brand-gold h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{t('assistant')}</h3>
          <p className="text-xs text-gray-300">{isStreaming ? t('typing') : t('poweredByAI')}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onMinimize}
          className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Minimize chat"
        >
          <Minimize2 className="h-4 w-4" />
        </button>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
