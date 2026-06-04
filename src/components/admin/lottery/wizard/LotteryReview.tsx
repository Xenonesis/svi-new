'use client';

import { motion } from 'motion/react';
import { Sparkles, Users } from 'lucide-react';

interface LotteryReviewProps {
  title: string;
  description: string;
  participantCount: number;
}

export function LotteryReview({ title, description, participantCount }: LotteryReviewProps) {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
          Review & Launch
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
          Double-check the details before the big reveal.
        </p>
      </div>
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 dark:border-white/10 dark:bg-white/5">
          <div className="mb-6 flex items-center gap-4">
            <div className="bg-brand-gold/20 text-brand-gold flex h-14 w-14 items-center justify-center rounded-2xl">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <h4 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                {title}
              </h4>
              <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
                {description || 'No description'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-5 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {participantCount}
                </div>
                <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase dark:text-gray-400">
                  Total Entries
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
