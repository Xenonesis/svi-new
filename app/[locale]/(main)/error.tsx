'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Home, AlertTriangle, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MainError({ error, reset }: ErrorProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.error('[Page Error]', error);
  }, [error]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount((c) => c + 1);
    await new Promise((r) => setTimeout(r, 600));
    reset();
    setIsRetrying(false);
  };

  const errorCode = error.digest
    ? `ERR-${error.digest.slice(0, 8).toUpperCase()}`
    : `ERR-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-gray-50 px-4 py-24 dark:bg-[#0C0C0C]">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(26,39,68,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26,39,68,1) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Error glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 50% 40%, rgba(239,68,68,0.04) 0%, transparent 60%)',
        }}
      />

      {/* Pulse rings */}
      {mounted && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {[180, 280, 380].map((size, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-red-500/10"
              style={{
                width: size,
                height: size,
                animation: `pulse-gold ${2.5 + i * 0.5}s ease-out ${i * 0.5}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      <div
        className="relative z-10 mx-auto w-full max-w-lg text-center"
        style={{ animation: 'slide-in-bottom 0.6s cubic-bezier(0.22,1,0.36,1) both' }}
      >
        {/* Error icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-red-400/20 bg-red-50 dark:bg-red-500/10">
            <AlertTriangle size={36} className="text-red-400" />
          </div>
        </div>

        {/* Divider */}
        <div className="mx-auto mb-5 flex items-center justify-center gap-3">
          <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#c9a84c]/50" />
          <div className="h-1.5 w-1.5 rotate-45 bg-[#c9a84c]/70" />
          <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#c9a84c]/50" />
        </div>

        <p className="mb-2 text-[10px] font-semibold tracking-[0.25em] text-red-400 uppercase">
          Something Went Wrong
        </p>

        <h1 className="text-brand-navy mb-3 font-serif text-3xl md:text-4xl dark:text-gray-100">
          Page Error <span className="text-[#c9a84c] italic">Occurred</span>
        </h1>

        <p className="mx-auto mb-6 max-w-sm text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          An unexpected error occurred while loading this page. This has been logged. Please try
          again — it usually resolves on retry.
        </p>

        {/* Error badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
          <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
            {errorCode}
          </span>
          {retryCount > 0 && (
            <span className="ml-1 rounded-full bg-[#c9a84c]/20 px-2 py-0.5 text-[10px] font-semibold text-[#c9a84c]">
              Attempt #{retryCount + 1}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="mb-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="bg-brand-gold text-brand-navy group flex items-center gap-2.5 px-7 py-3.5 text-[11px] font-bold tracking-widest uppercase shadow-lg transition-all hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={14}
              className={`transition-transform ${isRetrying ? 'animate-spin' : 'group-hover:rotate-180'}`}
            />
            {isRetrying ? 'Retrying…' : 'Try Again'}
          </button>
          <Link
            href="/"
            className="text-brand-navy border-brand-navy flex items-center gap-2.5 border px-7 py-3.5 text-[11px] font-bold tracking-widest uppercase transition-all hover:border-[#c9a84c] hover:text-[#c9a84c] dark:border-gray-500 dark:text-gray-300"
          >
            <Home size={14} />
            Go Home
          </Link>
        </div>

        {/* Back link */}
        <button
          onClick={() => window.history.back()}
          className="mb-6 flex items-center justify-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ArrowLeft size={12} />
          Go back to previous page
        </button>

        {/* Collapsible details */}
        {error.message && (
          <div className="border border-gray-200 bg-white text-left shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <button
              onClick={() => setShowDetails((v) => !v)}
              className="flex w-full items-center justify-between px-5 py-3 text-[11px] font-semibold tracking-wider text-gray-400 uppercase transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            >
              <span>Technical Details</span>
              {showDetails ? (
                <ChevronUp size={14} className="text-gray-400" />
              ) : (
                <ChevronDown size={14} className="text-gray-400" />
              )}
            </button>
            {showDetails && (
              <div className="border-t border-gray-200 px-5 py-4 dark:border-gray-700">
                <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed break-all whitespace-pre-wrap text-red-400">
                  {error.message}
                  {error.stack &&
                    `\n\nStack trace:\n${error.stack.split('\n').slice(0, 5).join('\n')}`}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
