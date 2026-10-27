'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    console.error('[Admin Error Boundary Caught]', error);
  }, [error]);

  const digest = error.digest ? `ID: ${error.digest.slice(0, 10).toUpperCase()}` : null;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50/50 p-6 shadow-sm dark:border-red-900/40 dark:bg-red-950/20">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
          <AlertCircle className="h-6 w-6" />
        </div>

        <h2 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
          Admin Section Error
        </h2>

        <p className="mb-4 text-xs text-gray-600 dark:text-gray-300">
          {error.message || 'An unexpected error occurred while loading this admin view.'}
        </p>

        {digest && (
          <p className="mb-5 font-mono text-[11px] text-gray-400 dark:text-gray-500">{digest}</p>
        )}

        <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reload Section
          </button>

          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
