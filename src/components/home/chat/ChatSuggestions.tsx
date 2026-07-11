'use client';

import { useTranslations } from 'next-intl';

interface ChatSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (text: string) => void;
}

export default function ChatSuggestions({ suggestions, onSuggestionClick }: ChatSuggestionsProps) {
  const t = useTranslations('chatbot');

  if (suggestions.length === 0) return null;

  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-medium text-gray-400">{t('suggestedFollowups')}</p>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSuggestionClick(suggestion)}
            className="border-brand-gold/20 bg-brand-gold/5 text-brand-navy hover:border-brand-gold/40 hover:bg-brand-gold/10 dark:border-brand-gold/10 dark:hover:border-brand-gold/30 dark:hover:bg-brand-gold/5 rounded-full border px-3 py-1.5 text-xs transition-all dark:text-gray-300"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
