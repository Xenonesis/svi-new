'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Crown, Play, Star, Ticket } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  ticket_number: string;
  is_winner: boolean;
}

interface DrawArenaModalProps {
  open: boolean;
  isShuffling: boolean;
  shuffledNames: string[];
  drawWinnerCount: number;
  revealedWinners: Participant[];
  participants: Participant[];
  title: string;
  shuffleContainerRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onStartShuffle: () => void;
  onCelebrate: () => void;
}

export function DrawArenaModal({
  open,
  isShuffling,
  shuffledNames,
  drawWinnerCount,
  revealedWinners,
  participants,
  title,
  shuffleContainerRef,
  onClose,
  onStartShuffle,
  onCelebrate,
}: DrawArenaModalProps) {
  const t = useTranslations('pages.lottery');

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#020617]/95 p-4 sm:items-center"
        >
          <motion.div
            initial={{ scale: 0.92, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 30, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-[#D4AF37]/15 bg-gradient-to-b from-[#0B1120] to-[#060a14] p-6 text-center shadow-[0_0_100px_rgba(212,175,55,0.08)] sm:p-10 md:p-16"
          >
            <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#D4AF37]/5 blur-[100px]" />

            {!isShuffling && revealedWinners.length === 0 && (
              <button
                onClick={onClose}
                className="absolute top-6 right-6 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            )}

            <div className="relative mx-auto max-w-xl space-y-6 sm:space-y-10">
              <div>
                <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-4 py-1.5 text-[10px] font-medium tracking-[0.2em] text-[#B38728] uppercase dark:text-[#D4AF37]">
                  <Zap className="h-3 w-3 fill-[#D4AF37]" /> {t('secureArena')}
                </div>
                <h3 className="font-serif text-2xl font-light text-white sm:text-3xl md:text-5xl">
                  {title}
                </h3>
              </div>

              {/* Shuffle Cylinder */}
              <div className="relative mx-auto my-6 h-40 w-full max-w-sm overflow-hidden rounded-2xl border border-[#D4AF37]/15 bg-[#020617] shadow-[inset_0_0_40px_rgba(212,175,55,0.04)] sm:my-10 md:my-12">
                <div
                  className="pointer-events-none absolute inset-0 z-20 rounded-2xl border border-[#D4AF37]/10"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(212,175,55,0.03) 0%, rgba(255,255,255,0) 20%, rgba(255,255,255,0) 80%, rgba(212,175,55,0.03) 100%)',
                  }}
                />
                <div className="pointer-events-none absolute top-1/2 right-4 left-4 z-20 h-px -translate-y-1/2 bg-[#D4AF37]/40" />
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-[#020617] to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-[#020617] to-transparent" />

                <div
                  ref={shuffleContainerRef}
                  className="flex flex-col pt-10 transition-transform duration-75 ease-linear"
                >
                  {shuffledNames.length > 0 ? (
                    shuffledNames.map((name, idx) => (
                      <div
                        key={idx}
                        className="flex h-[80px] items-center justify-center px-6 text-center"
                      >
                        <span
                          className={`block truncate ${
                            drawWinnerCount > 0 && idx >= shuffledNames.length - drawWinnerCount
                              ? 'scale-110 font-serif text-2xl font-medium text-[#D4AF37] transition-all duration-500 sm:text-3xl'
                              : 'text-lg font-light text-white/20 sm:text-xl md:text-2xl'
                          }`}
                        >
                          {name}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-[80px] items-center justify-center text-xs font-medium tracking-widest text-slate-600 uppercase">
                      {t('awaitingCommand')}
                    </div>
                  )}
                </div>
              </div>

              {/* Revealed Winners */}
              {revealedWinners.length > 0 ? (
                <div className="custom-scrollbar max-h-[280px] space-y-6 overflow-y-auto pr-2 sm:max-h-[380px]">
                  <AnimatePresence>
                    {revealedWinners.filter(Boolean).map((w, idx) => (
                      <motion.div
                        key={w.id}
                        initial={{ opacity: 0, scale: 0.5, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 150, damping: 18, delay: 0.1 }}
                        className="relative"
                      >
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2, duration: 0.6 }}
                          className="pointer-events-none absolute inset-0 mx-auto w-full max-w-xs rounded-full bg-[#D4AF37]/5 blur-2xl"
                        />

                        {revealedWinners.length > 1 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mb-2 flex items-center justify-center gap-2"
                          >
                            <Star className="h-3 w-3 fill-[#D4AF37] text-[#D4AF37]" />
                            <span className="text-[10px] font-semibold tracking-[0.2em] text-[#B38728] uppercase dark:text-[#D4AF37]">
                              {t('winnerIndex', {
                                defaultValue: 'Winner #{index}',
                                index: idx + 1,
                              })}
                            </span>
                            <Star className="h-3 w-3 fill-[#D4AF37] text-[#D4AF37]" />
                          </motion.div>
                        )}

                        <motion.h4
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
                          className="relative font-serif text-2xl text-white sm:text-4xl md:text-5xl"
                        >
                          {w.name}
                        </motion.h4>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="relative mx-auto mt-3 inline-flex items-center gap-3 rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-6 py-2"
                        >
                          <Ticket className="h-4 w-4 text-[#D4AF37]" />
                          <span className="font-mono text-lg tracking-widest text-[#D4AF37]">
                            {w.ticket_number}
                          </span>
                        </motion.div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <p className="mx-auto max-w-sm text-xs leading-relaxed font-medium tracking-widest text-slate-500 uppercase">
                  {isShuffling
                    ? t('shufflingProgress')
                    : t('initiateShuffle', {
                        count: participants.filter((p) => p.is_winner).length,
                      })}
                </p>
              )}

              {/* Action Buttons */}
              <div className="pt-8">
                {revealedWinners.length > 0 && !isShuffling ? (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    onClick={onCelebrate}
                    className="mx-auto block w-full max-w-sm cursor-pointer rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B38728] px-8 py-4 text-xs font-semibold tracking-[0.15em] text-[#020617] uppercase transition-all hover:from-[#E5C158] hover:to-[#D4AF37] hover:shadow-lg hover:shadow-[#D4AF37]/20"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Crown className="h-4 w-4" />
                      {t('celebrateWinners')}
                    </span>
                  </motion.button>
                ) : (
                  <button
                    disabled={isShuffling || participants.filter((p) => p.is_winner).length === 0}
                    onClick={onStartShuffle}
                    className="group relative mx-auto block w-full max-w-sm cursor-pointer overflow-hidden rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B38728] px-8 py-4 text-xs font-semibold tracking-[0.15em] text-[#020617] uppercase transition-all duration-300 hover:from-[#E5C158] hover:to-[#D4AF37] hover:shadow-lg hover:shadow-[#D4AF37]/20 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isShuffling ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="inline-block"
                          >
                            <Zap className="h-3.5 w-3.5" />
                          </motion.span>
                          {t('shufflingText')}
                        </>
                      ) : (
                        <>
                          {t('initiateSequence')} <Play className="h-3.5 w-3.5 fill-[#020617]" />
                        </>
                      )}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(212, 175, 55, 0.2), rgba(178, 134, 34, 0.2));
          border-radius: 10px;
          border: 1px solid rgba(212, 175, 55, 0.08);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(212, 175, 55, 0.4), rgba(178, 134, 34, 0.4));
        }
      `}</style>
    </AnimatePresence>
  );
}
