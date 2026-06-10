'use client';

import { Share2, Link as LinkIcon, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonsProps {
  title: string;
}

export default function ShareButtons({ title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback */
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: window.location.href });
      } catch {
        /* user cancelled */
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
        <Share2 size={13} />
        Share this article
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleShare}
          className="bg-brand-navy dark:bg-brand-gold dark:text-brand-navy inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-semibold text-white transition-all hover:shadow-lg"
        >
          <Share2 size={12} />
          Share
        </button>
        <button
          onClick={handleCopyLink}
          className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[11px] font-semibold transition-all ${
            copied
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'hover:border-brand-gold hover:text-brand-gold border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          {copied ? (
            <>
              <Check size={12} />
              Copied!
            </>
          ) : (
            <>
              <LinkIcon size={12} />
              Copy Link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
