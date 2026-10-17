'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Award, Ticket, Trophy } from 'lucide-react';

interface HallOfFameProps {
  historicalWinners: any[];
  visibleCount: number;
  onSetVisibleCount: (v: number | ((prev: number) => number)) => void;
}

export function HallOfFame({
  historicalWinners,
  visibleCount,
  onSetVisibleCount,
}: HallOfFameProps) {
  const t = useTranslations('pages.lottery');

  // Sort participants alphabetically by name
  const sortedWinners = [...historicalWinners].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })
  );

  return (
    <div className="relative flex flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl backdrop-blur-xl transition-colors duration-500 dark:border-[#D4AF37]/10 dark:bg-gradient-to-b dark:from-[#0B1120] dark:to-[#0d1526] dark:shadow-[0_0_40px_rgba(212,175,55,0.04)]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-3 font-serif text-2xl text-slate-900 dark:text-white">
          <Award className="h-6 w-6 text-[#D4AF37]" />
          {t('hallOfFame')}
        </h3>
        <span className="rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-3 py-1 text-[10px] font-bold tracking-widest text-[#B38728] uppercase dark:text-[#D4AF37]">
          {historicalWinners.length}
        </span>
      </div>

      {historicalWinners.length > 10 && visibleCount > 10 && (
        <div className="mb-3 text-center">
          <button
            onClick={() => onSetVisibleCount(10)}
            className="group/scroll mx-auto flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-[10px] font-medium tracking-wider text-slate-500 transition-all hover:border-[#D4AF37]/30 hover:text-[#B38728] dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:text-[#D4AF37]"
          >
            <svg
              className="h-3 w-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
            {t('scrollToTop')}
          </button>
        </div>
      )}

      <div className="custom-scrollbar max-h-[480px] space-y-3 overflow-y-auto pr-2">
        {sortedWinners.slice(0, visibleCount).map((hw: any, idx: number) => {
          const isWinner = hw.is_winner;
          return (
            <motion.div
              key={idx}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.04 }}
              className={`group relative flex items-center gap-4 rounded-2xl border p-4 transition-all ${
                isWinner
                  ? 'border-[#D4AF37]/30 bg-gradient-to-r from-[#D4AF37]/5 to-transparent hover:from-[#D4AF37]/10 dark:border-[#D4AF37]/15 dark:from-[#D4AF37]/8 dark:hover:from-[#D4AF37]/12'
                  : 'border-slate-100 bg-slate-50 hover:bg-slate-100 dark:border-white/5 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm shadow-sm">
                {isWinner ? (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/15 text-[#B38728] ring-1 ring-amber-500/30 dark:bg-amber-500/10 dark:text-[#D4AF37]">
                    <Award className="h-5 w-5" />
                  </span>
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500">
                    <Ticket className="h-4 w-4" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className={`truncate text-sm font-medium ${
                    isWinner
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {hw.name}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  {isWinner ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-700 uppercase dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      Allotted
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-100/80 px-2 py-0.5 text-[9.5px] font-medium tracking-normal text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                      Not alloted — Better luck next time
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`font-mono text-[10px] font-medium ${
                    isWinner
                      ? 'text-[#B38728] dark:text-[#D4AF37]'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {hw.ticket_number}
                </div>
              </div>
            </motion.div>
          );
        })}
        {historicalWinners.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-500 dark:border-[#D4AF37]/10">
            <Trophy className="mb-3 h-6 w-6 opacity-40" />
            <div className="text-[10px] font-medium tracking-widest uppercase">
              {t('noParticipants')}
            </div>
          </div>
        )}
      </div>

      {historicalWinners.length > 10 && (
        <div className="mt-4 border-t border-slate-100 pt-4 text-center dark:border-white/5">
          <button
            onClick={() =>
              onSetVisibleCount((prev: number) =>
                prev >= historicalWinners.length
                  ? 10
                  : Math.min(prev + 10, historicalWinners.length)
              )
            }
            className="group/btn inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-5 py-2 text-[10px] font-semibold tracking-widest text-[#B38728] uppercase transition-all hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] dark:border-[#D4AF37]/15 dark:bg-[#D4AF37]/8 dark:text-[#D4AF37] dark:hover:border-[#D4AF37]/30 dark:hover:bg-[#D4AF37]/15"
          >
            {visibleCount >= historicalWinners.length ? (
              <>
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="18 15 12 9 6 15" />
                </svg>
                {t('showLess')}
              </>
            ) : (
              <>
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                {t('showMore', {
                  count: Math.min(10, historicalWinners.length - visibleCount),
                  total: historicalWinners.length - visibleCount,
                })}
              </>
            )}
          </button>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(100, 100, 100, 0.06);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(212, 175, 55, 0.3), rgba(178, 134, 34, 0.3));
          border-radius: 10px;
          border: 1px solid rgba(212, 175, 55, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(212, 175, 55, 0.5), rgba(178, 134, 34, 0.5));
        }
        @media (prefers-color-scheme: dark) {
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.03);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, rgba(212, 175, 55, 0.2), rgba(178, 134, 34, 0.2));
            border: 1px solid rgba(212, 175, 55, 0.08);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, rgba(212, 175, 55, 0.4), rgba(178, 134, 34, 0.4));
          }
        }
      `}</style>
    </div>
  );
}
