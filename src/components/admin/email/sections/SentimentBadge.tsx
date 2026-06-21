'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Loader2, ArrowRight } from 'lucide-react';
import { useAIEmail } from '../hooks/useAIEmail';

interface SentimentResult {
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  score: number;
  summary: string;
  suggestedResponses: Array<{
    label: string;
    tone: string;
    html: string;
  }>;
}

interface SentimentBadgeProps {
  emailHtml?: string;
  emailText?: string;
  onSuggestionSelect?: (html: string) => void;
}

const SENTIMENT_CONFIG = {
  positive: {
    bg: 'bg-emerald-100 dark:bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    label: 'Positive',
    emoji: '😊',
  },
  neutral: {
    bg: 'bg-gray-100 dark:bg-gray-500/15',
    text: 'text-gray-700 dark:text-gray-400',
    dot: 'bg-gray-500',
    label: 'Neutral',
    emoji: '😐',
  },
  negative: {
    bg: 'bg-red-100 dark:bg-red-500/15',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
    label: 'Negative',
    emoji: '😟',
  },
  urgent: {
    bg: 'bg-amber-100 dark:bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
    label: 'Urgent',
    emoji: '⚡',
  },
};

export function SentimentBadge({ emailHtml, emailText, onSuggestionSelect }: SentimentBadgeProps) {
  const [expanded, setExpanded] = useState(false);
  const [result, setResult] = useState<SentimentResult | null>(null);
  const { analyzeSentiment, loading } = useAIEmail();

  const handleAnalyze = async () => {
    if (loading || result) return;
    const data = await analyzeSentiment({ emailHtml, emailText });
    if (data) setResult(data as SentimentResult);
  };

  const config = result ? SENTIMENT_CONFIG[result.sentiment] : null;

  return (
    <div className="relative">
      {/* Badge */}
      <button
        onClick={() => {
          if (!result && !loading) handleAnalyze();
          setExpanded(!expanded);
        }}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all ${
          config
            ? `${config.bg} ${config.text}`
            : 'bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/15'
        }`}
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : config ? (
          <>
            <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
            {config.label}
          </>
        ) : (
          <>
            <Sparkles className="h-3 w-3" />
            Analyze
          </>
        )}
      </button>

      {/* Expanded Panel */}
      <AnimatePresence>
        {expanded && result && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            className="dark:bg-brand-dark-surface absolute top-full left-0 z-50 mt-2 w-[340px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">{config?.emoji}</span>
                <div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Sentiment: {config?.label}
                  </p>
                  <p className="font-mono text-[10px] text-gray-400">
                    Score: {result.score.toFixed(2)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Summary */}
            <div className="px-4 py-3">
              <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                {result.summary}
              </p>
            </div>

            {/* Suggested Responses */}
            {result.suggestedResponses.length > 0 && onSuggestionSelect && (
              <div className="border-t border-gray-100 dark:border-gray-800">
                <p className="px-4 pt-3 pb-2 text-[10px] font-semibold tracking-wide text-gray-500 uppercase">
                  Suggested Replies
                </p>
                <div className="space-y-1 px-2 pb-3">
                  {result.suggestedResponses.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        onSuggestionSelect(suggestion.html);
                        setExpanded(false);
                      }}
                      className="hover:bg-brand-gold/[0.04] flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors dark:hover:bg-white/[0.03]"
                    >
                      <div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {suggestion.label}
                        </p>
                        <p className="text-[10px] text-gray-400 capitalize">{suggestion.tone}</p>
                      </div>
                      <ArrowRight className="text-brand-gold/40 h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
