'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Home, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.error('[Root Error]', error);
  }, [error]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount((c) => c + 1);
    await new Promise((r) => setTimeout(r, 800));
    reset();
    setIsRetrying(false);
  };

  const errorCode = error.digest ? `ERR-${error.digest.slice(0, 8).toUpperCase()}` : 'ERR-UNKNOWN';

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-4 py-20 dark:bg-[#0e1628]">
      {/* Background grid — light mode: navy lines, dark mode: gold lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(26,39,68,0.9) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26,39,68,0.9) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 hidden opacity-[0.04] dark:block"
        style={{
          backgroundImage: `linear-gradient(rgba(212, 175, 55,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 175, 55,0.8) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial glow — red + gold tint */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(220,60,60,0.04) 0%, rgba(212, 175, 55,0.02) 50%, transparent 80%)',
        }}
      />

      {/* Pulsing alert rings */}
      {mounted && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute rounded-full border border-red-400/10 dark:border-red-500/10"
              style={{
                width: `${i * 200}px`,
                height: `${i * 200}px`,
                animation: `pulse-gold ${2 + i * 0.5}s ease-out ${i * 0.4}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      <div
        className="relative z-10 mx-auto w-full max-w-lg text-center"
        style={{ animation: 'slide-in-bottom 0.6s cubic-bezier(0.22,1,0.36,1) both' }}
      >
        {/* Warning icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-red-300/40 bg-red-50 dark:border-red-400/20 dark:bg-red-500/10">
            <AlertTriangle size={36} className="text-red-500 dark:text-red-400" />
            <div
              className="absolute inset-0 rounded-full border border-red-300/30 dark:border-red-400/20"
              style={{ animation: 'pulse-gold 2s ease-out infinite' }}
            />
          </div>
        </div>

        {/* Gold divider */}
        <div className="mx-auto mb-5 flex items-center justify-center gap-3">
          <div className="to-brand-gold/60 h-px w-8 bg-gradient-to-r from-transparent" />
          <div className="bg-brand-gold/80 h-1.5 w-1.5 rotate-45" />
          <div className="to-brand-gold/60 h-px w-8 bg-gradient-to-l from-transparent" />
        </div>

        <p className="mb-2 text-[10px] font-semibold tracking-[0.25em] text-red-500/90 uppercase dark:text-red-400/80">
          Something went wrong
        </p>

        <h1 className="text-brand-navy mb-3 font-serif text-3xl md:text-4xl dark:text-white">
          An Unexpected <span className="text-brand-gold italic">Error Occurred</span>
        </h1>

        <p className="mx-auto mb-6 max-w-sm text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          We&apos;re sorry — something went wrong on our end. Our team has been notified. Please try
          again or return to the homepage.
        </p>

        {/* Error code badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 dark:bg-red-400" />
          <span className="font-mono text-[11px] text-gray-400 dark:text-gray-500">
            {errorCode}
          </span>
          {retryCount > 0 && (
            <span className="bg-brand-gold/20 text-brand-gold ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold">
              Retry #{retryCount}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="mb-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="group bg-brand-gold text-brand-navy hover:bg-brand-gold-light hover:shadow-[0_0_24px_rgba(212, 175, 55,0.3)] flex items-center gap-2.5 px-7 py-3.5 text-[11px] font-bold tracking-widest uppercase shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={14}
              className={`transition-transform ${isRetrying ? 'animate-spin' : 'group-hover:rotate-180'}`}
            />
            {isRetrying ? 'Retrying…' : 'Try Again'}
          </button>
          <Link
            href="/"
            className="border-brand-navy/30 text-brand-navy hover:border-brand-gold hover:text-brand-gold dark:hover:border-brand-gold/50 flex items-center gap-2.5 border px-7 py-3.5 text-[11px] font-bold tracking-widest uppercase transition-all dark:border-white/20 dark:text-white/80 dark:hover:text-white"
          >
            <Home size={14} />
            Go Home
          </Link>
        </div>

        {/* Collapsible error details */}
        {error.message && (
          <div className="border border-gray-200 bg-gray-50 text-left dark:border-white/10 dark:bg-white/5">
            <button
              onClick={() => setShowDetails((v) => !v)}
              className="flex w-full items-center justify-between px-5 py-3 text-[11px] font-semibold tracking-wider text-gray-400 uppercase transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <span>Technical Details</span>
              {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showDetails && (
              <div className="border-t border-gray-200 px-5 py-4 dark:border-white/10">
                <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed break-all whitespace-pre-wrap text-red-500 dark:text-red-400/80">
                  {error.message}
                  {error.stack && `\n\nStack:\n${error.stack.split('\n').slice(0, 6).join('\n')}`}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
