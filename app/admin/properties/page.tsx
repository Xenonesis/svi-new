'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

import { PropertiesTab } from '@/src/components/admin/settings/PropertiesTab';
import { supabase } from '@/src/lib/supabase/client';

const GRID_STYLE = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(212, 175, 55, 0.05) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};

function PropertiesContent() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Auth verification check
  useEffect(() => {
    const controller = new AbortController();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (controller.signal.aborted) return;
      if (!user) {
        router.replace('/admin');
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      // Verify admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (controller.signal.aborted) return;
      if (profile?.role !== 'admin') {
        router.replace('/admin');
        return;
      }

      setToken(session.access_token);
      setLoading(false);
    });
    return () => controller.abort();
  }, [router]);

  if (loading || !token) {
    return (
      <div className="relative z-10 mx-auto w-full max-w-7xl animate-pulse font-sans">
        <div className="dark:bg-brand-dark-surface/65 rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8 dark:border-white/8">
          {/* Header Skeleton */}
          <div className="mb-6 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-7 w-48 rounded bg-gray-200 dark:bg-white/5" />
              <div className="h-4 w-72 rounded bg-gray-200 dark:bg-white/5" />
            </div>
            <div className="h-10 w-32 rounded-lg bg-gray-200 dark:bg-white/5" />
          </div>
          {/* Search & Actions Bar Skeleton */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="h-10 w-64 rounded-lg bg-gray-200 dark:bg-white/5" />
            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-white/5" />
          </div>
          {/* Table Skeleton */}
          <div className="border-gray-150 h-60 overflow-hidden rounded-xl border bg-white/40 dark:border-white/5 dark:bg-black/20" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full font-sans">
      {/* Ambient background decoration */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="bg-brand-navy-light/10 absolute top-0 right-0 h-[450px] w-[450px] rounded-full blur-[120px]" />
        <div className="bg-brand-gold/5 absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-80" style={GRID_STYLE} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="dark:bg-brand-dark-surface/65 rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8 dark:border-white/8">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />

          <PropertiesTab token={token} isCompact={false} showToast={showToast} />
        </div>
      </div>

      {/* Floating status toasts */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-xl border px-5 py-3.5 font-sans text-sm font-semibold shadow-2xl ${
              toast.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-950/95 dark:text-emerald-300'
                : 'border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-950/95 dark:text-red-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400" />
            )}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="relative z-10 mx-auto w-full max-w-7xl animate-pulse font-sans">
          <div className="dark:bg-brand-dark-surface/65 rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8 dark:border-white/8">
            {/* Header Skeleton */}
            <div className="mb-6 flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-7 w-48 rounded bg-gray-200 dark:bg-white/5" />
                <div className="h-4 w-72 rounded bg-gray-200 dark:bg-white/5" />
              </div>
              <div className="h-10 w-32 rounded-lg bg-gray-200 dark:bg-white/5" />
            </div>
            {/* Search & Actions Bar Skeleton */}
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="h-10 w-64 rounded-lg bg-gray-200 dark:bg-white/5" />
              <div className="h-4 w-24 rounded bg-gray-200 dark:bg-white/5" />
            </div>
            {/* Table Skeleton */}
            <div className="border-gray-150 h-60 overflow-hidden rounded-xl border bg-white/40 dark:border-white/5 dark:bg-black/20" />
          </div>
        </div>
      }
    >
      <PropertiesContent />
    </Suspense>
  );
}
