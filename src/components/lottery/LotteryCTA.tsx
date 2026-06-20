'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Clock, ArrowRight, Trophy } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/src/lib/supabase/client';
import { useLotteryVisibility } from '@/src/lib/hooks/useLotteryVisibility';

interface ActiveLottery {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  draw_date: string | null;
}

function useCountdown(targetDate: string | null) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!targetDate) return;

    const target = new Date(targetDate).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return { timeLeft, expired };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="text-brand-gold block min-w-[2.5ch] text-center font-mono text-2xl font-black tabular-nums md:text-3xl"
          >
            {String(value).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-1 text-[8px] font-bold tracking-[0.2em] text-white/50 uppercase">
        {label}
      </span>
    </div>
  );
}

export default function LotteryCTA() {
  const t = useTranslations('pages.lottery');
  const [lottery, setLottery] = useState<ActiveLottery | null>(null);
  const [loading, setLoading] = useState(true);
  const { visible, loading: visLoading } = useLotteryVisibility();

  useEffect(() => {
    const fetchActiveLottery = async () => {
      try {
        const { data, error } = await supabase
          .from('lotteries')
          .select('id, title, description, status, created_at, draw_date')
          .in('status', ['active', 'completed'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setLottery(data);
        }
      } catch {
        // Silently skip — CTA simply won't show
      } finally {
        setLoading(false);
      }
    };

    fetchActiveLottery();
  }, []);

  const drawDate = lottery?.draw_date ?? null;
  const { timeLeft, expired } = useCountdown(drawDate);

  // Don't render anything if loading, invisible, or no active lottery
  if (loading || visLoading || !visible || !lottery) return null;

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden bg-gradient-to-br from-[#07070b] via-[#0e0e18] to-[#07070b] py-16 md:py-20"
        role="region"
        aria-label={t('title')}
      >
        {/* Dot grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(#d4af37 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />

        {/* Glow orbs */}
        <motion.div
          className="bg-brand-gold/10 pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="bg-brand-gold/8 pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 flex justify-center"
            >
              <span className="bg-brand-gold/10 text-brand-gold border-brand-gold/30 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-bold tracking-[0.25em] uppercase backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                {t('liveEvent')} • {lottery.title}
              </span>
            </motion.div>

            <div className="flex flex-col items-center gap-10 lg:flex-row lg:justify-between lg:gap-16">
              {/* Left — Text */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center lg:text-left"
              >
                <h2 className="mb-4 font-serif text-3xl font-bold text-white md:text-4xl">
                  {t.rich('megaGiveawayIsLive', {
                    gold: (chunks) => (
                      <span
                        className="italic"
                        style={{
                          backgroundImage:
                            'linear-gradient(135deg, #d4af37, #f0d080, #b08f36, #dec070)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {chunks}
                      </span>
                    ),
                  })}
                </h2>
                <p className="max-w-md text-sm leading-relaxed text-gray-400">
                  {lottery.description ?? t('description')}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <Link
                    href="/lottery"
                    className="bg-brand-gold text-brand-navy group inline-flex items-center justify-center gap-2 px-7 py-3.5 text-xs font-bold tracking-widest uppercase shadow-xl transition-all hover:brightness-110"
                  >
                    <Trophy className="h-4 w-4" />
                    {t('title')}
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.span>
                  </Link>
                </div>
              </motion.div>

              {/* Right — Countdown */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">
                  <Clock className="text-brand-gold h-3.5 w-3.5" />
                  {lottery.status === 'completed'
                    ? 'Draw Completed'
                    : expired
                      ? t('shufflingProgress')
                      : drawDate
                        ? t('liveCountdown')
                        : t('sessionActive')}
                </div>

                {lottery.status === 'completed' ? (
                  <div className="bg-brand-gold/10 border-brand-gold/30 rounded-2xl border px-8 py-4 text-center">
                    <div className="text-brand-gold inline-flex items-center gap-2 text-lg font-black tracking-widest uppercase">
                      <Trophy className="h-4 w-4" />
                      Winners Declared!
                    </div>
                    <div className="mt-1 text-xs text-gray-500">Click to see who won</div>
                  </div>
                ) : drawDate && !expired ? (
                  <div className="flex items-end gap-3">
                    <CountdownUnit
                      value={timeLeft.days}
                      label={t('days', { defaultValue: 'Days' })}
                    />
                    <span className="text-brand-gold mb-4 text-2xl font-black">:</span>
                    <CountdownUnit value={timeLeft.hours} label={t('hrs')} />
                    <span className="text-brand-gold mb-4 text-2xl font-black">:</span>
                    <CountdownUnit value={timeLeft.minutes} label={t('min')} />
                    <span className="text-brand-gold mb-4 text-2xl font-black">:</span>
                    <CountdownUnit value={timeLeft.seconds} label={t('sec')} />
                  </div>
                ) : (
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="bg-brand-gold/10 border-brand-gold/30 rounded-2xl border px-8 py-4 text-center"
                  >
                    <div className="text-brand-gold inline-flex items-center gap-2 text-lg font-black tracking-widest uppercase">
                      <Trophy className="h-4 w-4" />
                      {t('shufflingText')}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {t('liveRevealInProgress', { defaultValue: 'Live reveal in progress' })}
                    </div>
                  </motion.div>
                )}

                <p className="text-[10px] text-gray-600 italic">
                  {t('auditedViaSupabase', {
                    defaultValue: 'All draws are verified and audited via Supabase',
                  })}
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}
