'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  Gift,
  Sparkles,
  Volume2,
  VolumeX,
  ShieldCheck,
  Ticket,
  AlertCircle,
  Trophy,
  Star,
  Play,
  Clock,
  Crown,
  Zap,
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase/client';
import confetti from 'canvas-confetti';

interface Participant {
  id: string;
  name: string;
  ticket_number: string;
  is_winner: boolean;
}

interface ActiveLottery {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
}

export default function LotteryDrawSection() {
  const [activeLottery, setActiveLottery] = useState<ActiveLottery | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<Participant[]>([]);

  // Animation & UI States
  const [isDrawArenaOpen, setIsDrawArenaOpen] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffledNames, setShuffledNames] = useState<string[]>([]);
  const [revealedWinners, setRevealedWinners] = useState<Participant[]>([]);
  const [currentRevealIndex, setCurrentRevealIndex] = useState(-1);
  const [drawWinnerCount, setDrawWinnerCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [historicalWinners, setHistoricalWinners] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Countdown state
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [countdownStr, setCountdownStr] = useState<string | null>(null);

  const shuffleContainerRef = useRef<HTMLDivElement>(null);
  const shuffleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const revealTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchActiveLottery();
    fetchHallOfFame();
    fetchScheduleCountdown();
    const pollInterval = setInterval(fetchScheduleCountdown, 30_000);
    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (!scheduledAt) {
      setCountdownStr(null);
      return;
    }
    const tick = () => {
      const diff = scheduledAt.getTime() - Date.now();
      if (diff <= 0) {
        setCountdownStr(null);
        setScheduledAt(null);
        return;
      }
      const totalSec = Math.floor(diff / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      const pad = (n: number) => String(n).padStart(2, '0');
      setCountdownStr(h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`);
    };
    tick();
    countdownIntervalRef.current = setInterval(tick, 1_000);
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [scheduledAt]);

  useEffect(() => {
    return () => {
      if (shuffleTimerRef.current) clearTimeout(shuffleTimerRef.current);
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    };
  }, []);

  const fetchScheduleCountdown = async () => {
    try {
      const res = await fetch('/api/lottery/schedule');
      const json = await res.json();
      if (json.scheduled?.scheduled_at) {
        setScheduledAt(new Date(json.scheduled.scheduled_at));
      } else {
        setScheduledAt(null);
      }
    } catch {
      // ignore
    }
  };

  const fetchActiveLottery = async () => {
    try {
      setError(null);
      const { data: lotteryData, error: lError } = await supabase
        .from('lotteries')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (lError) throw lError;

      if (lotteryData && lotteryData.length > 0) {
        const active = lotteryData[0];
        setActiveLottery(active);

        const { data: participantsData, error: pError } = await supabase
          .from('lottery_participants')
          .select('id, name, ticket_number, is_winner')
          .eq('lottery_id', active.id);

        if (pError) throw pError;
        setParticipants(participantsData || []);

        const dbWinners = participantsData?.filter((p) => p.is_winner) || [];
        if (dbWinners.length > 0) {
          setWinners(dbWinners);
        }
      }
    } catch (err: any) {
      console.error('Error loading homepage lottery:', err);
      setError(
        err.message || 'Failed to connect to the database. Please check connection and try again.'
      );
    }
  };

  const fetchHallOfFame = async () => {
    try {
      const { data: lotteryData } = await supabase
        .from('lotteries')
        .select('id, title')
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (!lotteryData || lotteryData.length === 0) return;

      const { data, error } = await supabase
        .from('lottery_participants')
        .select('name, ticket_number, is_winner, created_at')
        .eq('lottery_id', lotteryData[0].id)
        .order('is_winner', { ascending: false })
        .order('created_at', { ascending: true });

      if (!error && data) {
        setHistoricalWinners(data);
      }
    } catch (err: any) {
      console.error('Error fetching hall of fame:', err);
    }
  };

  // ── Sound Effects ──────────────────────────────────────────────────────
  const playTickSound = () => {
    if (!soundEnabled) return;
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);
      osc.frequency.setValueAtTime(600 + Math.random() * 200, context.currentTime);
      gain.gain.setValueAtTime(0.02, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.05);
      osc.start();
      osc.stop(context.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  };

  const playRevealSound = () => {
    if (!soundEnabled) return;
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = context.currentTime;
      const playTone = (
        freq: number,
        start: number,
        duration: number,
        type: OscillatorType = 'sine'
      ) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.connect(gain);
        gain.connect(context.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.1, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.start(start);
        osc.stop(start + duration);
      };

      // Dramatic reveal chime — ascending fanfare
      playTone(392, now, 0.3, 'sine'); // G4
      playTone(523.25, now + 0.15, 0.3, 'sine'); // C5
      playTone(659.25, now + 0.3, 0.3, 'sine'); // E5
      playTone(783.99, now + 0.45, 0.5, 'sine'); // G5
      playTone(1046.5, now + 0.6, 1.0, 'sine'); // C6
    } catch (e) {
      console.warn('Reveal sound failed:', e);
    }
  };

  const playFanfareSound = () => {
    if (!soundEnabled) return;
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = context.currentTime;
      const playTone = (
        freq: number,
        start: number,
        duration: number,
        type: OscillatorType = 'sine'
      ) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.connect(gain);
        gain.connect(context.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.start(start);
        osc.stop(start + duration);
      };

      // Grand fanfare
      playTone(523.25, now, 0.4, 'sine'); // C5
      playTone(659.25, now + 0.2, 0.4, 'sine'); // E5
      playTone(783.99, now + 0.4, 0.4, 'sine'); // G5
      playTone(1046.5, now + 0.6, 1.2, 'sine'); // C6
      playTone(783.99, now + 1.0, 0.3, 'sine'); // G5
      playTone(1046.5, now + 1.3, 1.5, 'sine'); // C6
    } catch (e) {
      console.warn('Fanfare sound failed:', e);
    }
  };

  // ── Confetti Effects ───────────────────────────────────────────────────
  const triggerWinnerConfetti = useCallback(() => {
    confetti({
      particleCount: 80,
      spread: 100,
      startVelocity: 35,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#D4AF37', '#F3E5AB', '#FFFFFF', '#C0C0C0', '#FFD700'],
      zIndex: 200,
    });

    setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        startVelocity: 40,
        origin: { x: 0, y: 0.6 },
        colors: ['#D4AF37', '#F3E5AB', '#FFD700'],
        zIndex: 200,
      });
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 55,
        startVelocity: 40,
        origin: { x: 1, y: 0.6 },
        colors: ['#D4AF37', '#F3E5AB', '#FFD700'],
        zIndex: 200,
      });
    }, 150);
  }, []);

  const triggerGrandFinale = useCallback(() => {
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 80, zIndex: 200 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#D4AF37', '#F3E5AB', '#FFFFFF', '#C0C0C0', '#E5E4E2', '#FFD700'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#D4AF37', '#F3E5AB', '#FFFFFF', '#C0C0C0', '#E5E4E2', '#FFD700'],
      });
    }, 200);

    confetti({
      particleCount: 200,
      spread: 140,
      startVelocity: 40,
      origin: { y: 0.5 },
      colors: ['#D4AF37', '#F3E5AB', '#FFFFFF', '#C0C0C0', '#FFD700'],
      zIndex: 200,
    });
  }, []);

  // ── Sequential Winner Reveal ───────────────────────────────────────────
  const revealWinnersSequentially = useCallback(
    (drawWinners: Participant[]) => {
      setCurrentRevealIndex(-1);
      setRevealedWinners([]);

      let idx = 0;
      const revealNext = () => {
        if (idx >= drawWinners.length) {
          // All winners revealed — grand finale
          playFanfareSound();
          triggerGrandFinale();
          setWinners(drawWinners);
          fetchHallOfFame();
          return;
        }

        setCurrentRevealIndex(idx);
        setRevealedWinners((prev) => [...prev, drawWinners[idx]]);
        playRevealSound();
        triggerWinnerConfetti();
        idx++;

        // Delay between each winner reveal
        revealTimerRef.current = setTimeout(revealNext, idx >= drawWinners.length ? 800 : 1800);
      };

      revealTimerRef.current = setTimeout(revealNext, 400);
    },
    [playRevealSound, playFanfareSound, triggerWinnerConfetti, triggerGrandFinale, fetchHallOfFame]
  );

  // ── Shuffle Animation ──────────────────────────────────────────────────
  const startShuffleAnimation = () => {
    if (participants.length === 0 || isShuffling) return;

    let drawWinners = winners.length > 0 ? winners : participants.filter((p) => p.is_winner);
    if (drawWinners.length === 0) {
      drawWinners = [participants[Math.floor(Math.random() * participants.length)]];
    }

    setIsShuffling(true);
    setRevealedWinners([]);
    setCurrentRevealIndex(-1);

    const namePool: string[] = [];
    const scrollRounds = 4;

    for (let r = 0; r < scrollRounds; r++) {
      const shuffledChunk = [...participants].map((p) => p.name).sort(() => Math.random() - 0.5);
      namePool.push(...shuffledChunk);
    }

    // End with all winners' names
    drawWinners.forEach((w) => namePool.push(w.name));
    setShuffledNames(namePool);
    setDrawWinnerCount(drawWinners.length);

    let currentIndex = 0;
    let delay = 40;
    const totalNames = namePool.length;

    const tick = () => {
      currentIndex++;
      playTickSound();

      if (shuffleContainerRef.current) {
        const itemHeight = 80;
        shuffleContainerRef.current.style.transform = `translateY(-${currentIndex * itemHeight}px)`;
      }

      const remaining = totalNames - 1 - currentIndex;

      if (remaining <= 0) {
        setIsShuffling(false);
        // Begin sequential reveal
        revealWinnersSequentially(drawWinners);
      } else {
        const namesFromEnd = remaining;
        if (namesFromEnd <= drawWinners.length + 2) {
          delay += 50;
        } else if (namesFromEnd < 10) {
          delay += 40;
        } else if (namesFromEnd < 25) {
          delay += 20;
        }
        shuffleTimerRef.current = setTimeout(tick, delay);
      }
    };

    shuffleTimerRef.current = setTimeout(tick, delay);
  };

  // ── Error State ────────────────────────────────────────────────────────
  if (error) {
    return (
      <section className="relative overflow-hidden bg-slate-50 py-24 dark:bg-slate-950">
        <div className="relative z-10 container mx-auto max-w-md px-4 text-center">
          <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-xl dark:border-red-900/50 dark:bg-slate-900">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="mb-2 font-serif text-xl font-bold text-slate-900 dark:text-white">
              System Offline
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {error}
            </p>
            <button
              onClick={() => {
                setError(null);
                fetchActiveLottery();
                fetchHallOfFame();
              }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold tracking-wider text-white uppercase transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              Reconnect
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!activeLottery) return null;

  // ── Main Render ────────────────────────────────────────────────────────
  return (
    <section className="relative overflow-hidden bg-slate-50 py-24 text-slate-800 transition-colors duration-500 dark:bg-[#020617] dark:text-slate-200">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay dark:opacity-[0.05]" />
      <div className="pointer-events-none absolute -top-[500px] left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#D4AF37]/10 to-transparent blur-3xl dark:from-[#D4AF37]/5" />
      <div className="pointer-events-none absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-[#D4AF37]/5 to-transparent blur-3xl" />

      <div className="relative z-10 container mx-auto max-w-7xl px-4">
        {/* ── Live Countdown Banner ──────────────────────────────────────── */}
        <AnimatePresence>
          {countdownStr && scheduledAt && (
            <motion.div
              key="countdown-banner"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="mb-10 overflow-hidden rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] p-px shadow-[0_0_40px_rgba(201,168,76,0.15)]"
            >
              <div className="flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-r from-[#0e0e18] via-[#14142a] to-[#0e0e18] px-8 py-6 sm:flex-row sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/20 text-[#D4AF37]">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase">
                      Live Draw Countdown
                    </div>
                    <div className="mt-0.5 text-sm text-slate-300">
                      Draw scheduled for{' '}
                      <span className="font-semibold text-white">
                        {scheduledAt.toLocaleString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}{' '}
                        IST
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {countdownStr.split(':').map((seg, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <span className="text-2xl font-bold text-[#D4AF37]/60">:</span>}
                      <div className="flex min-w-[3rem] flex-col items-center justify-center rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-3 py-2">
                        <span className="font-mono text-3xl font-bold text-white tabular-nums">
                          {seg}
                        </span>
                        <span className="mt-0.5 text-[9px] tracking-widest text-slate-400 uppercase">
                          {i === 0 && countdownStr.split(':').length === 3
                            ? 'hrs'
                            : i === (countdownStr.split(':').length === 3 ? 1 : 0)
                              ? 'min'
                              : 'sec'}
                        </span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-5 py-2 text-xs font-semibold tracking-widest text-[#B38728] uppercase backdrop-blur-sm dark:text-[#D4AF37]"
          >
            <Sparkles className="h-3.5 w-3.5" /> Official Live Event
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
            {activeLottery.description ||
              'The ultimate giveaway for our premium clients. Winners are selected through a provably fair, cryptographically secure algorithm.'}
          </motion.p>
        </div>

        {/* ── Main Grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          {/* ── Grand Prize Draw Card ────────────────────────────────────── */}
          <div className="flex flex-col lg:col-span-7 xl:col-span-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl backdrop-blur-xl transition-colors duration-500 md:p-12 dark:border-[#D4AF37]/10 dark:bg-gradient-to-br dark:from-[#0B1120] dark:via-[#0d1526] dark:to-[#0B1120] dark:shadow-[0_0_80px_rgba(212,175,55,0.06)]"
            >
              {/* Gold glow accent */}
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
                        Grand Prize Draw
                      </h3>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium tracking-widest text-[#B38728] uppercase dark:text-[#D4AF37]">
                        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                        Session Active
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 dark:border-[#D4AF37]/10 dark:bg-[#D4AF37]/5 dark:hover:bg-[#D4AF37]/10 dark:hover:text-[#D4AF37]"
                    title={soundEnabled ? 'Mute audio' : 'Unmute audio'}
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
                      Clients
                    </span>
                  </div>
                  <div className="h-12 w-px bg-slate-200 dark:bg-[#D4AF37]/10" />
                  <div className="flex flex-col">
                    <span className="flex items-center gap-2 text-lg font-light text-slate-900 dark:text-white">
                      <ShieldCheck className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />{' '}
                      Secure
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
                          Winners
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
                      {/* Trophy icon */}
                      <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                        className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 text-[#B38728] shadow-lg shadow-[#D4AF37]/10 dark:text-[#D4AF37]"
                      >
                        <Trophy className="h-9 w-9" />
                      </motion.div>

                      {/* Winner count badge */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-8 text-center"
                      >
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-5 py-2 text-[10px] font-semibold tracking-[0.2em] text-[#B38728] uppercase dark:text-[#D4AF37]">
                          <Crown className="h-3.5 w-3.5" />
                          {winners.length === 1
                            ? 'Official Winner'
                            : `${winners.length} Official Winners`}
                        </span>
                      </motion.div>

                      {/* Winners grid — staggered reveal */}
                      <div
                        className={`grid gap-5 ${
                          winners.length === 1
                            ? 'mx-auto max-w-md grid-cols-1'
                            : winners.length === 2
                              ? 'mx-auto max-w-2xl grid-cols-1 sm:grid-cols-2'
                              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                        }`}
                      >
                        {winners.map((w, idx) => (
                          <motion.div
                            key={w.id}
                            initial={{ opacity: 0, scale: 0.8, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{
                              type: 'spring',
                              stiffness: 180,
                              damping: 20,
                              delay: 0.4 + idx * 0.15,
                            }}
                            className="group/card relative overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-gradient-to-br from-white to-slate-50 p-6 text-center shadow-lg transition-all hover:shadow-xl hover:shadow-[#D4AF37]/10 dark:border-[#D4AF37]/15 dark:from-[#D4AF37]/5 dark:to-transparent dark:hover:border-[#D4AF37]/30"
                          >
                            {/* Card glow */}
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#D4AF37]/5 to-transparent opacity-0 transition-opacity group-hover/card:opacity-100 dark:from-[#D4AF37]/10" />

                            {/* Winner number badge */}
                            {winners.length > 1 && (
                              <div className="relative mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37]/10 px-3 py-1 text-[9px] font-bold tracking-widest text-[#B38728] uppercase dark:bg-[#D4AF37]/15 dark:text-[#D4AF37]">
                                <Star className="h-2.5 w-2.5 fill-[#D4AF37]" />
                                Winner #{idx + 1}
                              </div>
                            )}

                            {/* Winner name */}
                            <h4 className="relative font-serif text-2xl text-slate-900 md:text-3xl dark:text-white">
                              {w.name}
                            </h4>

                            {/* Ticket number */}
                            <div className="relative mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 font-mono text-xs text-slate-600 dark:border-[#D4AF37]/15 dark:bg-[#D4AF37]/5 dark:text-[#D4AF37]">
                              <Ticket className="h-3 w-3 text-[#B38728] dark:text-[#D4AF37]" />
                              {w.ticket_number}
                            </div>

                            {/* Decorative corner */}
                            <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-[#D4AF37]/10 to-transparent" />
                          </motion.div>
                        ))}
                      </div>
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
                        Waiting for Data
                      </div>
                      <div className="mx-auto mt-2 text-xs text-slate-500">
                        The admin has not uploaded the participant pool yet. Please wait.
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
                          Winner Pre-computed
                        </div>
                        <div className="mt-1 text-[10px] font-medium tracking-widest text-slate-500 uppercase dark:text-slate-400">
                          Ready for reveal
                        </div>
                      </div>
                      <button
                        onClick={() => setIsDrawArenaOpen(true)}
                        className="group relative mx-auto w-full max-w-sm cursor-pointer overflow-hidden rounded-full bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-4 text-xs font-semibold tracking-[0.15em] text-white uppercase transition-all duration-300 hover:from-slate-800 hover:to-slate-700 hover:shadow-lg dark:from-[#D4AF37] dark:to-[#B38728] dark:text-[#020617] dark:hover:from-[#E5C158] dark:hover:to-[#D4AF37]"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          Enter Live Arena <Sparkles className="h-3.5 w-3.5" />
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
              className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl backdrop-blur-xl transition-colors duration-500 dark:border-[#D4AF37]/10 dark:bg-gradient-to-b dark:from-[#0B1120] dark:to-[#0d1526] dark:shadow-[0_0_40px_rgba(212,175,55,0.04)]"
            >
              <h3 className="mb-8 flex items-center gap-3 font-serif text-2xl text-slate-900 dark:text-white">
                <Award className="h-6 w-6 text-[#D4AF37]" />
                Winners of{' '}
                {new Date().toLocaleDateString('en-IN', {
                  month: 'long',
                  year: 'numeric',
                  day: 'numeric',
                })}
              </h3>

              <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto pr-2">
                {historicalWinners.map((hw, idx) => {
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
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm shadow-sm ${
                          isWinner
                            ? 'bg-gradient-to-br from-[#D4AF37] to-[#AA8222] font-serif text-white shadow-[#D4AF37]/20 dark:text-[#020617]'
                            : 'bg-slate-200 text-slate-400 dark:bg-white/10 dark:text-slate-500'
                        }`}
                      >
                        {isWinner ? <Award className="h-5 w-5" /> : <Ticket className="h-4 w-4" />}
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
                        <div
                          className={`mt-0.5 text-[10px] font-semibold tracking-widest uppercase ${
                            isWinner
                              ? 'text-[#B38728] dark:text-[#D4AF37]'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {isWinner ? 'Winner' : 'Better luck next time'}
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
                      No Participants Yet
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Drawing Arena Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {isDrawArenaOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/95 p-4"
          >
            <motion.div
              initial={{ scale: 0.92, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 30, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-[#D4AF37]/15 bg-gradient-to-b from-[#0B1120] to-[#060a14] p-10 text-center shadow-[0_0_100px_rgba(212,175,55,0.08)] md:p-16"
            >
              {/* Background glow */}
              <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#D4AF37]/5 blur-[100px]" />

              {!isShuffling && revealedWinners.length === 0 && (
                <button
                  onClick={() => setIsDrawArenaOpen(false)}
                  className="absolute top-6 right-6 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              )}

              <div className="relative mx-auto max-w-xl space-y-10">
                {/* Arena header */}
                <div>
                  <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-4 py-1.5 text-[10px] font-medium tracking-[0.2em] text-[#B38728] uppercase dark:text-[#D4AF37]">
                    <Zap className="h-3 w-3 fill-[#D4AF37]" /> SECURE ARENA
                  </div>
                  <h3 className="font-serif text-3xl font-light text-white md:text-5xl">
                    {activeLottery.title}
                  </h3>
                </div>

                {/* Shuffle Cylinder */}
                <div className="relative mx-auto my-12 h-40 w-full max-w-sm overflow-hidden rounded-2xl border border-[#D4AF37]/15 bg-[#020617] shadow-[inset_0_0_40px_rgba(212,175,55,0.04)]">
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
                                ? 'scale-110 font-serif text-3xl font-medium text-[#D4AF37] transition-all duration-500'
                                : 'text-2xl font-light text-white/20'
                            }`}
                          >
                            {name}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="flex h-[80px] items-center justify-center text-xs font-medium tracking-widest text-slate-600 uppercase">
                        Awaiting Command
                      </div>
                    )}
                  </div>
                </div>

                {/* Revealed Winners — shown one by one */}
                {revealedWinners.length > 0 ? (
                  <div className="space-y-6">
                    <AnimatePresence>
                      {revealedWinners.map((w, idx) => (
                        <motion.div
                          key={w.id}
                          initial={{ opacity: 0, scale: 0.5, y: 40 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{
                            type: 'spring',
                            stiffness: 150,
                            damping: 18,
                            delay: 0.1,
                          }}
                          className="relative"
                        >
                          {/* Glow ring behind winner */}
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
                                Winner #{idx + 1}
                              </span>
                              <Star className="h-3 w-3 fill-[#D4AF37] text-[#D4AF37]" />
                            </motion.div>
                          )}

                          <motion.h4
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
                            className="relative font-serif text-4xl text-white md:text-5xl"
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
                      ? 'Cryptographic shuffle in progress...'
                      : `Verify ${participants.length} entries and initiate secure shuffle`}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="pt-8">
                  {revealedWinners.length > 0 && !isShuffling ? (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      onClick={() => {
                        setIsDrawArenaOpen(false);
                        setCurrentRevealIndex(-1);
                      }}
                      className="mx-auto block w-full max-w-sm cursor-pointer rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B38728] px-8 py-4 text-xs font-semibold tracking-[0.15em] text-[#020617] uppercase transition-all hover:from-[#E5C158] hover:to-[#D4AF37] hover:shadow-lg hover:shadow-[#D4AF37]/20"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Crown className="h-4 w-4" />
                        Celebrate Winners
                      </span>
                    </motion.button>
                  ) : (
                    <button
                      disabled={isShuffling || participants.length === 0}
                      onClick={startShuffleAnimation}
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
                            Encrypting & Shuffling...
                          </>
                        ) : (
                          <>
                            Initiate Sequence <Play className="h-3.5 w-3.5 fill-[#020617]" />
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
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(100, 100, 100, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.35);
        }
        @media (prefers-color-scheme: dark) {
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.02);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(212, 175, 55, 0.15);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(212, 175, 55, 0.3);
          }
        }
      `}</style>
    </section>
  );
}
