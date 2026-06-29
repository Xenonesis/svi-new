'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Ticket, Sparkles, Star } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  ticket_number: string;
  is_winner: boolean;
}

interface WinnerCarouselProps {
  winners: Participant[];
  activeWinnerIndex: number;
  winnerSwipeDir: number;
  onNavigate: (idx: number, dir: number) => void;
}

export function WinnerCarousel({
  winners,
  activeWinnerIndex,
  winnerSwipeDir,
  onNavigate,
}: WinnerCarouselProps) {
  const t = useTranslations('pages.lottery');

  if (winners.length === 0) return null;

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="pointer-events-none absolute inset-0 -m-4 rounded-3xl bg-[#D4AF37]/5 blur-2xl dark:bg-[#D4AF37]/8" />

      <div className="relative overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={
              winners[activeWinnerIndex]?.id ||
              winners[activeWinnerIndex]?.ticket_number ||
              'fallback'
            }
            initial={{
              opacity: 0,
              x: winnerSwipeDir > 0 ? 120 : -120,
              scale: 0.9,
              rotateY: winnerSwipeDir > 0 ? 8 : -8,
            }}
            animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
            exit={{
              opacity: 0,
              x: winnerSwipeDir > 0 ? -120 : 120,
              scale: 0.9,
              rotateY: winnerSwipeDir > 0 ? -8 : 8,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 25, mass: 0.8 }}
            className="group/card relative overflow-hidden rounded-2xl border border-[#D4AF37]/25 bg-gradient-to-br from-white via-white to-slate-50 p-8 text-center shadow-xl shadow-[#D4AF37]/5 transition-all dark:border-[#D4AF37]/20 dark:from-[#D4AF37]/8 dark:via-[#D4AF37]/4 dark:to-transparent dark:shadow-[#D4AF37]/10"
          >
            {/* Animated sparkle particles */}
            <motion.div
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0 }}
              className="pointer-events-none absolute top-6 left-8 text-[#D4AF37]"
            >
              <Sparkles className="h-4 w-4" />
            </motion.div>
            <motion.div
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.7 }}
              className="pointer-events-none absolute top-10 right-10 text-[#D4AF37]/60"
            >
              <Sparkles className="h-3 w-3" />
            </motion.div>
            <motion.div
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, delay: 1.3 }}
              className="pointer-events-none absolute bottom-8 left-12 text-[#D4AF37]/50"
            >
              <Star className="h-3 w-3 fill-[#D4AF37]" />
            </motion.div>
            <motion.div
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.4 }}
              className="pointer-events-none absolute right-8 bottom-12 text-[#D4AF37]/40"
            >
              <Star className="h-2.5 w-2.5 fill-[#D4AF37]" />
            </motion.div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#D4AF37]/5 to-transparent opacity-0 transition-opacity group-hover/card:opacity-100 dark:from-[#D4AF37]/10" />

            {winners.length > 1 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
                className="relative mb-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#D4AF37]/15 to-[#D4AF37]/5 px-4 py-1.5 text-[10px] font-bold tracking-widest text-[#B38728] uppercase dark:from-[#D4AF37]/20 dark:to-[#D4AF37]/10 dark:text-[#D4AF37]"
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]"
                />
                {t('winnerNumber', { index: activeWinnerIndex + 1, total: winners.length })}
              </motion.div>
            )}

            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
              className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#D4AF37]/10 text-[#D4AF37]"
            >
              <Crown className="h-7 w-7" />
            </motion.div>

            <motion.h4
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.15 }}
              className="relative font-serif text-4xl text-slate-900 md:text-5xl dark:text-white"
            >
              {winners[activeWinnerIndex]?.name ?? ''}
            </motion.h4>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="relative mt-4 inline-flex items-center gap-3 rounded-full border border-[#D4AF37]/25 bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 px-6 py-2.5"
            >
              <Ticket className="h-4 w-4 text-[#D4AF37]" />
              <span className="font-mono text-lg tracking-widest text-[#B38728] dark:text-[#D4AF37]">
                {winners[activeWinnerIndex]?.ticket_number ?? ''}
              </span>
            </motion.div>

            <div className="pointer-events-none absolute top-0 right-0 h-20 w-20 bg-gradient-to-bl from-[#D4AF37]/10 to-transparent" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-20 w-20 bg-gradient-to-tr from-[#D4AF37]/5 to-transparent" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination dots */}
      {winners.length > 1 && (
        <div className="relative mt-6 flex items-center justify-center gap-2.5">
          {winners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(idx, idx > activeWinnerIndex ? 1 : -1)}
              className={`cursor-pointer rounded-full transition-all duration-300 ${
                idx === activeWinnerIndex
                  ? 'h-2.5 w-8 bg-[#D4AF37] shadow-lg shadow-[#D4AF37]/30'
                  : 'h-2.5 w-2.5 bg-slate-300 hover:bg-[#D4AF37]/50 dark:bg-slate-600 dark:hover:bg-[#D4AF37]/40'
              }`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {winners.length > 1 && (
        <div className="relative mt-3 h-0.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <motion.div
            key={activeWinnerIndex}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 3.5, ease: 'linear' }}
            className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B38728]"
          />
        </div>
      )}

      {/* All winners mini strip */}
      {winners.length > 1 && (
        <div className="relative mt-6 flex flex-wrap items-center justify-center gap-2">
          {winners.filter(Boolean).map((w, idx) => (
            <button
              key={w.id}
              onClick={() => onNavigate(idx, idx > activeWinnerIndex ? 1 : -1)}
              className={`cursor-pointer rounded-full border px-3 py-1 text-[10px] font-medium tracking-wide transition-all ${
                idx === activeWinnerIndex
                  ? 'border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#B38728] dark:text-[#D4AF37]'
                  : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-[#D4AF37]/20 hover:text-[#B38728] dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:text-[#D4AF37]'
              }`}
            >
              {w.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
