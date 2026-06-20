'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import {
  Gift,
  Sparkles,
  Volume2,
  VolumeX,
  ShieldCheck,
  AlertCircle,
  Trophy,
  Crown,
  Clock,
} from 'lucide-react';
import { useLotteryDraw } from './hooks/useLotteryDraw';
import { CountdownBanner } from './sections/CountdownBanner';
import { WinnerCarousel } from './sections/WinnerCarousel';
import { HallOfFame } from './sections/HallOfFame';
import { DrawArenaModal } from './sections/DrawArenaModal';

export default function LotteryDrawSection() {
  const t = useTranslations('pages.lottery');
  const {
    activeLottery,
    participants,
    winners,
    revealedWinners,
    isDrawArenaOpen,
    isShuffling,
    shuffledNames,
    drawWinnerCount,
    activeWinnerIndex,
    winnerSwipeDir,
    soundEnabled,
    historicalWinners,
    visibleCount,
    error,
    scheduledAt,
    countdownStr,
    shuffleContainerRef,

    setIsDrawArenaOpen,
    setSoundEnabled,
    setVisibleCount,

    handleCarouselNavigate,
    startShuffleAnimation,
    fetchActiveLottery,
    fetchHallOfFame,
  } = useLotteryDraw();

  const handleCelebrate = () => {
    setIsDrawArenaOpen(false);
  };

  // ── Error State ────────────────────────────────────────────────────────
  if (error) {
    return (
      <section className="bg-brand-bg relative overflow-hidden py-24 dark:bg-gray-900">
        <div className="relative z-10 container mx-auto max-w-md px-4 text-center">
          <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-xl dark:border-red-900/50 dark:bg-slate-900">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="mb-2 font-serif text-xl font-bold text-slate-900 dark:text-white">
              {t('systemOffline')}
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {error}
            </p>
            <button
              onClick={() => {
                fetchActiveLottery();
                fetchHallOfFame();
              }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold tracking-wider text-white uppercase transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              {t('reconnect')}
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!activeLottery) return null;

  // ── Main Render ────────────────────────────────────────────────────────
  return (
    <section className="bg-brand-bg relative overflow-hidden py-24 text-slate-800 transition-colors duration-500 dark:bg-gray-900 dark:text-slate-200">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay dark:opacity-[0.05]" />
      <div className="pointer-events-none absolute -top-[500px] left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#D4AF37]/10 to-transparent blur-3xl dark:from-[#D4AF37]/5" />
      <div className="pointer-events-none absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-[#D4AF37]/5 to-transparent blur-3xl" />

      <div className="relative z-10 container mx-auto max-w-7xl px-4">
        {/* ── Live Countdown Banner ──────────────────────────────────────── */}
        <CountdownBanner countdownStr={countdownStr} scheduledAt={scheduledAt} />

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-5 py-2 text-xs font-semibold tracking-widest text-[#B38728] uppercase backdrop-blur-sm dark:text-[#D4AF37]"
          >
            <Sparkles className="h-3.5 w-3.5" /> {t('liveEvent')}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl font-light tracking-tight text-slate-900 md:text-5xl lg:text-6xl dark:text-white"
          >
            {activeLottery.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400"
          >
            {activeLottery.description || t('description')}
          </motion.p>
        </div>

        {/* ── Main Grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* ── Grand Prize Draw Card ────────────────────────────────────── */}
          <div className="flex flex-col lg:col-span-7 xl:col-span-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl backdrop-blur-xl transition-colors duration-500 md:p-12 dark:border-[#D4AF37]/10 dark:bg-gradient-to-br dark:from-[#0B1120] dark:via-[#0d1526] dark:to-[#0B1120] dark:shadow-[0_0_80px_rgba(212,175,55,0.06)]"
            >
              <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-[#D4AF37]/5 blur-3xl dark:bg-[#D4AF37]/8" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-[#D4AF37]/3 blur-3xl dark:bg-[#D4AF37]/5" />

              <div className="relative space-y-8">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6 transition-colors duration-500 dark:border-[#D4AF37]/10">
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#AA8222] text-white shadow-lg shadow-[#D4AF37]/20 dark:text-[#020617]">
                      <Trophy className="h-6 w-6" />
                      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl text-slate-900 dark:text-white">
                        {t('grandDraw')}
                      </h3>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium tracking-widest text-[#B38728] uppercase dark:text-[#D4AF37]">
                        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                        {t('sessionActive')}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 dark:border-[#D4AF37]/10 dark:bg-[#D4AF37]/5 dark:hover:bg-[#D4AF37]/10 dark:hover:text-[#D4AF37]"
                    title={
                      soundEnabled
                        ? t('muteAudio', { defaultValue: 'Mute audio' })
                        : t('unmuteAudio', { defaultValue: 'Unmute audio' })
                    }
                  >
                    {soundEnabled ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-red-500 dark:text-red-400" />
                    )}
                  </button>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <div className="flex flex-col">
                    <span className="text-3xl font-light text-slate-900 dark:text-white">
                      {participants.length}
                    </span>
                    <span className="mt-1 text-[10px] tracking-widest text-slate-400 uppercase dark:text-slate-500">
                      {t('clients')}
                    </span>
                  </div>
                  <div className="h-12 w-px bg-slate-200 dark:bg-[#D4AF37]/10" />
                  <div className="flex flex-col">
                    <span className="flex items-center gap-2 text-lg font-light text-slate-900 dark:text-white">
                      <ShieldCheck className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />{' '}
                      {t('secure')}
                    </span>
                  </div>
                  {winners.length > 0 && (
                    <>
                      <div className="h-12 w-px bg-slate-200 dark:bg-[#D4AF37]/10" />
                      <div className="flex flex-col">
                        <span className="flex items-center gap-2 text-lg font-light text-[#B38728] dark:text-[#D4AF37]">
                          <Crown className="h-5 w-5" /> {winners.length}
                        </span>
                        <span className="mt-1 text-[10px] tracking-widest text-slate-400 uppercase dark:text-slate-500">
                          {t('winners')}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ── Winner Display Area ──────────────────────────────────── */}
              <div className="relative mt-12 flex flex-col items-center pt-8">
                <AnimatePresence mode="wait">
                  {winners.length > 0 ? (
                    <motion.div
                      key="winners-grid"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full"
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                        className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 text-[#B38728] shadow-lg shadow-[#D4AF37]/10 dark:text-[#D4AF37]"
                      >
                        <Trophy className="h-9 w-9" />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-8 text-center"
                      >
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-5 py-2 text-[10px] font-semibold tracking-[0.2em] text-[#B38728] uppercase dark:text-[#D4AF37]">
                          <Crown className="h-3.5 w-3.5" />
                          {winners.length === 1
                            ? t('officialWinner')
                            : t('officialWinners', { count: winners.length })}
                        </span>
                      </motion.div>

                      <WinnerCarousel
                        winners={winners}
                        activeWinnerIndex={activeWinnerIndex}
                        winnerSwipeDir={winnerSwipeDir}
                        onNavigate={handleCarouselNavigate}
                      />
                    </motion.div>
                  ) : participants.length === 0 ? (
                    <motion.div
                      key="no-data"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full rounded-2xl border border-rose-500/20 bg-rose-50 p-8 text-center dark:bg-rose-500/5"
                    >
                      <AlertCircle className="mx-auto mb-4 h-8 w-8 text-rose-500 dark:text-rose-400" />
                      <div className="text-sm font-medium text-rose-600 dark:text-rose-400">
                        {t('waitingData')}
                      </div>
                      <div className="mx-auto mt-2 text-xs text-slate-500">
                        {t('noParticipantsDesc')}
                      </div>
                    </motion.div>
                  ) : !participants.some((p) => p.is_winner) ? (
                    <motion.div
                      key="awaiting-draw"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full rounded-2xl border border-blue-500/20 bg-blue-50 p-8 text-center dark:border-blue-900/30 dark:bg-blue-950/10"
                    >
                      <Clock className="mx-auto mb-4 h-8 w-8 text-blue-500 dark:text-blue-400" />
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Awaiting Live Draw
                      </div>
                      <div className="mx-auto mt-2 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                        The participant pool is locked. Stay tuned as the host conducts the lucky
                        draw and reveals the winners shortly!
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="ready"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full space-y-8 text-center"
                    >
                      <div className="relative flex flex-col items-center justify-center py-4">
                        <motion.div
                          animate={{ y: [0, -6, 0] }}
                          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                        >
                          <Gift className="mb-4 h-14 w-14 text-[#D4AF37] opacity-80" />
                        </motion.div>
                        <div className="text-xl font-light text-slate-900 dark:text-white">
                          {t('winnerPrecomputed')}
                        </div>
                        <div className="mt-1 text-[10px] font-medium tracking-widest text-slate-500 uppercase dark:text-slate-400">
                          {t('readyReveal')}
                        </div>
                      </div>
                      <button
                        onClick={() => setIsDrawArenaOpen(true)}
                        className="group relative mx-auto w-full max-w-sm cursor-pointer overflow-hidden rounded-full bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-4 text-xs font-semibold tracking-[0.15em] text-white uppercase transition-all duration-300 hover:from-slate-800 hover:to-slate-700 hover:shadow-lg dark:from-[#D4AF37] dark:to-[#B38728] dark:text-[#020617] dark:hover:from-[#E5C158] dark:hover:to-[#D4AF37]"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {t('enterArena')} <Sparkles className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* ── Right Sidebar — Hall of Fame ─────────────────────────────── */}
          <div className="flex flex-col lg:col-span-5 xl:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <HallOfFame
                historicalWinners={historicalWinners}
                visibleCount={visibleCount}
                onSetVisibleCount={setVisibleCount}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Drawing Arena Modal ──────────────────────────────────────────── */}
      <DrawArenaModal
        open={isDrawArenaOpen}
        isShuffling={isShuffling}
        shuffledNames={shuffledNames}
        drawWinnerCount={drawWinnerCount}
        revealedWinners={revealedWinners}
        participants={participants}
        title={activeLottery.title}
        shuffleContainerRef={shuffleContainerRef}
        onClose={() => setIsDrawArenaOpen(false)}
        onStartShuffle={startShuffleAnimation}
        onCelebrate={handleCelebrate}
      />
    </section>
  );
}
