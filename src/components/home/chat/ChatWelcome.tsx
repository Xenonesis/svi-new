'use client';

import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ChatWelcomeProps {
  defaultSuggestions: string[];
  onSuggestionClick: (text: string) => void;
}

export default function ChatWelcome({ defaultSuggestions, onSuggestionClick }: ChatWelcomeProps) {
  const t = useTranslations('chatbot');

  return (
    <div className="flex flex-col items-center px-4 py-6 text-center">
      <div className="bg-brand-gold/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
        <Sparkles className="text-brand-gold h-8 w-8" />
      </div>
      <h4 className="text-brand-gold mb-2 font-serif text-lg font-semibold">{t('welcomeTitle')}</h4>
      <p className="mb-6 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        {t('welcomeDesc')}
      </p>
      <div className="flex w-full flex-col gap-2">
        {defaultSuggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSuggestionClick(suggestion)}
            className="border-brand-gold/20 bg-brand-gold/5 text-brand-navy hover:border-brand-gold/40 hover:bg-brand-gold/10 dark:border-brand-gold/10 dark:hover:border-brand-gold/30 dark:hover:bg-brand-gold/5 w-full rounded-xl border px-4 py-2.5 text-left text-sm transition-all dark:text-gray-200"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
