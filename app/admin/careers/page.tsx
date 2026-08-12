'use client';
import { toast } from 'sonner';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

import { CareersTab } from '@/src/components/admin/careers/CareersTab';
import { supabase } from '@/src/lib/supabase/client';

const GRID_STYLE = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(212, 175, 55, 0.05) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};

function CareersContent() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    if (type === 'success') {
      toast.success(msg);
    } else {
      toast.error(msg);
    }
  }, []);

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
      <div className="relative z-10 mx-auto w-full max-w-5xl animate-pulse font-sans">
        <div className="dark:bg-brand-dark-surface/65 rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8 dark:border-white/8">
          <div className="mb-6 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-7 w-48 rounded bg-gray-200 dark:bg-white/5" />
              <div className="h-4 w-72 rounded bg-gray-200 dark:bg-white/5" />
            </div>
            <div className="h-10 w-32 rounded-lg bg-gray-200 dark:bg-white/5" />
          </div>
          <div className="mb-6 h-10 w-64 rounded-lg bg-gray-200 dark:bg-white/5" />
          <div className="h-60 overflow-hidden rounded-xl border border-gray-100 bg-white/40 dark:border-white/5 dark:bg-black/20" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full font-sans">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="bg-brand-navy-light/10 absolute top-0 right-0 h-[450px] w-[450px] rounded-full blur-[120px]" />
        <div className="bg-brand-gold/5 absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-80" style={GRID_STYLE} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <div className="dark:bg-brand-dark-surface/65 rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8 dark:border-white/8">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />
          <CareersTab token={token} isCompact={false} showToast={showToast} />
        </div>
      </div>

      {/* Floating toasts */}
    </div>
  );
}

export default function AdminCareersPage() {
  return (
    <Suspense
      fallback={
        <div className="relative z-10 mx-auto w-full max-w-5xl animate-pulse font-sans">
          <div className="dark:bg-brand-dark-surface/65 rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8 dark:border-white/8">
            <div className="mb-6 flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-7 w-48 rounded bg-gray-200 dark:bg-white/5" />
                <div className="h-4 w-72 rounded bg-gray-200 dark:bg-white/5" />
              </div>
              <div className="h-10 w-32 rounded-lg bg-gray-200 dark:bg-white/5" />
            </div>
            <div className="mb-6 h-10 w-64 rounded-lg bg-gray-200 dark:bg-white/5" />
            <div className="h-60 overflow-hidden rounded-xl border border-gray-100 bg-white/40 dark:border-white/5 dark:bg-black/20" />
          </div>
        </div>
      }
    >
      <CareersContent />
    </Suspense>
  );
}
