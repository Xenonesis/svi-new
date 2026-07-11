'use client';

import { Bot, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ChatTypingIndicator() {
  const t = useTranslations('chatbot');
  const [typingDots, setTypingDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setTypingDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-4 flex justify-start">
      <div className="flex items-start gap-2">
        <div className="bg-brand-gold/15 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
          <Bot className="text-brand-gold h-3.5 w-3.5" />
        </div>
        <div className="flex items-center gap-2 rounded-2xl rounded-tl-md bg-gray-100 px-4 py-3 dark:bg-gray-800">
          <Loader2 className="text-brand-gold h-4 w-4 animate-spin" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t('thinking')}
            {typingDots}
          </span>
        </div>
      </div>
    </div>
  );
}
