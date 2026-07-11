'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLotteryVisibility } from '@/src/lib/hooks/useLotteryVisibility';
import dynamic from 'next/dynamic';

const LotteryDrawSection = dynamic(() => import('@/src/components/lottery/LotteryDrawSection'), {
  ssr: false,
});

export default function LotteryClientSection() {
  const router = useRouter();
  const { visible, loading } = useLotteryVisibility();

  useEffect(() => {
    if (!loading && !visible) {
      router.replace('/');
    }
  }, [visible, loading, router]);

  // While checking, show a minimal theme-responsive loading screen (matches section bg)
  if (loading) {
    return (
      <div className="bg-brand-bg dark:bg-brand-dark-bg flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="border-brand-gold h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
            Loading…
          </p>
        </div>
      </div>
    );
  }

  // If not visible, redirect is already triggered above — return null to avoid flash
  if (!visible) return null;

  return <LotteryDrawSection />;
}
