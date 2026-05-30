'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  const [winner, setWinner] = useState<Participant | null>(null);

  // Animation & UI States
  const [isDrawArenaOpen, setIsDrawArenaOpen] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffledNames, setShuffledNames] = useState<string[]>([]);
  const [revealedWinner, setRevealedWinner] = useState<Participant | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [historicalWinners, setHistoricalWinners] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const shuffleContainerRef = useRef<HTMLDivElement>(null);
  const shuffleTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchActiveLottery();
    fetchPastWinners();
  }, []);

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

        const dbWinner = participantsData?.find((p) => p.is_winner);
        if (dbWinner) {
          setWinner(dbWinner);
        }
      }
    } catch (err: any) {
      console.error('Error loading homepage lottery:', err);
      setError(
        err.message || 'Failed to connect to the database. Please check connection and try again.'
      );
    }
  };

  const fetchPastWinners = async () => {
    try {
      const { data, error } = await supabase
        .from('lottery_participants')
        .select(
          `
          name, 
          ticket_number, 
          created_at,
          lotteries (title)
        `
        )
        .eq('is_winner', true)
        .order('created_at', { ascending: false })
        .limit(5); // Increased to 5 for a better list

      if (!error && data) {
        setHistoricalWinners(data);
      }
    } catch (err: any) {
      console.error('Error fetching past winners:', err);
    }
  };

  // Sound generator
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

  const playSuccessSound = () => {
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

      // Elegant Corporate Chime
      playTone(523.25, now, 0.4, 'sine'); // C5
      playTone(659.25, now + 0.2, 0.4, 'sine'); // E5
      playTone(783.99, now + 0.4, 0.4, 'sine'); // G5
      playTone(1046.5, now + 0.6, 1.2, 'sine'); // C6
    } catch (e) {
      console.warn('Success sound failed:', e);
    }
  };

  // Elegant Confetti (Silver & Gold)
  const triggerConfetti = () => {
    const duration = 6 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 25, spread: 360, ticks: 100, zIndex: 100 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 40 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.4), y: Math.random() - 0.2 },
        colors: ['#D4AF37', '#F3E5AB', '#FFFFFF', '#C0C0C0', '#E5E4E2'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.6, 0.9), y: Math.random() - 0.2 },
        colors: ['#D4AF37', '#F3E5AB', '#FFFFFF', '#C0C0C0', '#E5E4E2'],
      });
    }, 250);

    // Initial burst
    confetti({
      particleCount: 150,
      spread: 120,
      origin: { y: 0.5 },
      colors: ['#D4AF37', '#F3E5AB', '#FFFFFF', '#C0C0C0'],
    });
  };

  const startShuffleAnimation = () => {
    if (participants.length === 0 || isShuffling) return;

    let drawWinner = winner;
    if (!drawWinner) {
      const dbWinners = participants.filter((p) => p.is_winner);
      if (dbWinners.length > 0) {
        drawWinner = dbWinners[0];
      } else {
        drawWinner = participants[Math.floor(Math.random() * participants.length)];
      }
    }

    setIsShuffling(true);
    setRevealedWinner(null);

    const namePool: string[] = [];
    const scrollRounds = 4;

    for (let r = 0; r < scrollRounds; r++) {
      const shuffledChunk = [...participants].map((p) => p.name).sort(() => Math.random() - 0.5);
      namePool.push(...shuffledChunk);
    }

    namePool.push(drawWinner.name);
    setShuffledNames(namePool);

    let currentIndex = 0;
    let delay = 40;

    const tick = () => {
      currentIndex++;
      playTickSound();

      if (shuffleContainerRef.current) {
        const itemHeight = 80; // Adjusted for new sleek font size
        shuffleContainerRef.current.style.transform = `translateY(-${currentIndex * itemHeight}px)`;
      }

      const remaining = namePool.length - 1 - currentIndex;

      if (remaining <= 0) {
        setIsShuffling(false);
        setRevealedWinner(drawWinner);
        playSuccessSound();
        triggerConfetti();

        setWinner(drawWinner);
        fetchPastWinners();
      } else {
        if (remaining < 10) {
          delay += 40;
        } else if (remaining < 25) {
          delay += 20;
        }
        shuffleTimerRef.current = setTimeout(tick, delay);
      }
    };

    shuffleTimerRef.current = setTimeout(tick, delay);
  };

  useEffect(() => {
    return () => {
      if (shuffleTimerRef.current) clearTimeout(shuffleTimerRef.current);
    };
  }, []);

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
                fetchPastWinners();
              }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold tracking-wider text-white uppercase transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              🔄 Reconnect
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!activeLottery) return null;

  return (
    <section className="relative overflow-hidden bg-slate-50 py-24 text-slate-800 transition-colors duration-500 dark:bg-[#020617] dark:text-slate-200">
      {/* Refined corporate background */}
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay dark:opacity-[0.05]" />
      <div className="pointer-events-none absolute -top-[500px] left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#D4AF37]/10 to-transparent blur-3xl dark:from-[#D4AF37]/5" />

      <div className="relative z-10 container mx-auto max-w-7xl px-4">
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

        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          {/* Main Drawing Showcase */}
          <div className="flex flex-col lg:col-span-7 xl:col-span-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl backdrop-blur-xl transition-colors duration-500 md:p-12 dark:border-white/5 dark:bg-white/[0.02] dark:shadow-2xl"
            >
              <div className="relative space-y-8">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6 transition-colors duration-500 dark:border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#AA8222] text-white shadow-lg dark:text-[#020617]">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl text-slate-900 dark:text-white">
                        Grand Prize Draw
                      </h3>
                      <div className="mt-1 text-[11px] font-medium tracking-widest text-[#B38728] uppercase dark:text-[#D4AF37]">
                        Session Active
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:text-white"
                    title={soundEnabled ? 'Mute audio' : 'Unmute audio'}
                  >
                    {soundEnabled ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-red-500 dark:text-red-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <div className="flex flex-col">
                    <span className="text-3xl font-light text-slate-900 dark:text-white">
                      {participants.length}
                    </span>
                    <span className="mt-1 text-[10px] tracking-widest text-slate-400 uppercase dark:text-slate-500">
                      Total Entries
                    </span>
                  </div>
                  <div className="h-12 w-px bg-slate-200 dark:bg-white/10" />
                  <div className="flex flex-col">
                    <span className="flex items-center gap-2 text-lg font-light text-slate-900 dark:text-white">
                      <ShieldCheck className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />{' '}
                      Secure
                    </span>
                    <span className="mt-1 text-[10px] tracking-widest text-slate-400 uppercase dark:text-slate-500">
                      Database Verified
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative mt-12 flex flex-col items-center pt-8">
                {winner ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full space-y-6 text-center"
                  >
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#B38728] dark:text-[#D4AF37]">
                      <Award className="h-10 w-10" />
                    </div>
                    <div>
                      <div className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-[#B38728] uppercase dark:text-[#D4AF37]">
                        Official Winner
                      </div>
                      <h4 className="font-serif text-4xl text-slate-900 md:text-5xl dark:text-white">
                        {winner.name}
                      </h4>
                      <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-6 py-2.5 font-mono text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                        <Ticket className="h-4 w-4 text-[#B38728] dark:text-[#D4AF37]" />{' '}
                        {winner.ticket_number}
                      </div>
                    </div>
                  </motion.div>
                ) : participants.length === 0 ? (
                  <div className="w-full rounded-2xl border border-rose-500/20 bg-rose-50 p-8 text-center dark:bg-rose-500/5">
                    <AlertCircle className="mx-auto mb-4 h-8 w-8 text-rose-500 dark:text-rose-400" />
                    <div className="text-sm font-medium text-rose-600 dark:text-rose-400">
                      Waiting for Data
                    </div>
                    <div className="mx-auto mt-2 text-xs text-slate-500">
                      The admin has not uploaded the participant pool yet. Please wait.
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-8 text-center">
                    <div className="relative flex flex-col items-center justify-center py-4">
                      <Gift className="mb-4 h-12 w-12 text-[#D4AF37] opacity-80" />
                      <div className="text-xl font-light text-slate-900 dark:text-white">
                        Winner Pre-computed
                      </div>
                      <div className="mt-1 text-[10px] font-medium tracking-widest text-slate-500 uppercase dark:text-slate-400">
                        Ready for reveal
                      </div>
                    </div>
                    <button
                      onClick={() => setIsDrawArenaOpen(true)}
                      className="group relative mx-auto w-full max-w-sm cursor-pointer overflow-hidden rounded-full bg-slate-900 px-8 py-4 text-xs font-semibold tracking-[0.15em] text-white uppercase transition-all duration-300 hover:bg-slate-800 hover:shadow-lg dark:bg-white dark:text-slate-900 dark:hover:bg-gray-100"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Enter Live Arena <Sparkles className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Elegant Winners List */}
          <div className="flex flex-col lg:col-span-5 xl:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl backdrop-blur-xl transition-colors duration-500 dark:border-white/5 dark:bg-white/[0.01] dark:shadow-none"
            >
              <h3 className="mb-8 flex items-center gap-3 font-serif text-2xl text-slate-900 dark:text-white">
                Hall of Fame
              </h3>

              <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto pr-2">
                {historicalWinners.map((hw, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group relative flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:bg-slate-100 dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-serif text-sm shadow-sm ${idx === 0 ? 'bg-[#D4AF37] text-white dark:text-black' : idx === 1 ? 'bg-slate-300 text-slate-800 dark:text-slate-900' : 'bg-[#CD7F32] text-white'}`}
                    >
                      #{idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-slate-900 dark:text-white">
                        {hw.name}
                      </div>
                      <div className="mt-1 truncate text-[10px] tracking-wider text-slate-500 uppercase">
                        {hw.lotteries?.title || 'SVI Lucky Draw'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[10px] font-medium text-[#B38728] dark:text-[#D4AF37]">
                        {hw.ticket_number}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {historicalWinners.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-500 dark:border-white/10">
                    <Trophy className="mb-3 h-6 w-6 opacity-40" />
                    <div className="text-[10px] font-medium tracking-widest uppercase">
                      No Champions Yet
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* SLEEK DRAWING ARENA MODAL */}
      <AnimatePresence>
        {isDrawArenaOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 p-4 transition-colors duration-500 dark:bg-[#020617]/90"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 p-10 text-center shadow-2xl transition-colors duration-500 md:p-16 dark:border-white/10 dark:bg-[#0B1120]"
            >
              {!isShuffling && (
                <button
                  onClick={() => setIsDrawArenaOpen(false)}
                  className="absolute top-6 right-6 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  ✕
                </button>
              )}

              <div className="mx-auto max-w-xl space-y-10">
                <div>
                  <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-4 py-1.5 text-[10px] font-medium tracking-[0.2em] text-[#B38728] uppercase dark:text-[#D4AF37]">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D4AF37]" /> SECURE
                    ARENA
                  </div>
                  <h3 className="font-serif text-3xl font-light text-slate-900 md:text-5xl dark:text-white">
                    {activeLottery.title}
                  </h3>
                </div>

                {/* Sleek Mechanical Shuffling Cylinder */}
                <div className="relative mx-auto my-12 h-40 w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-inner transition-colors duration-500 dark:border-white/5 dark:bg-[#020617]">
                  {/* Glass highlight overlay */}
                  <div
                    className="pointer-events-none absolute inset-0 z-20 rounded-2xl border border-slate-200 dark:border-white/5"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 20%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.05) 100%)',
                    }}
                  />

                  {/* Selector Line */}
                  <div className="pointer-events-none absolute top-1/2 right-4 left-4 z-20 h-px -translate-y-1/2 bg-[#D4AF37]/50" />

                  {/* Inner fade shadows */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-white to-transparent transition-colors duration-500 dark:from-[#020617]" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-white to-transparent transition-colors duration-500 dark:from-[#020617]" />

                  {/* Scrolling Content */}
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
                            className={`block truncate ${idx === shuffledNames.length - 1 ? 'scale-110 font-serif text-3xl font-medium text-[#B38728] transition-all duration-500 dark:text-[#D4AF37]' : 'text-2xl font-light text-slate-400 dark:text-white/30'}`}
                          >
                            {name}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="flex h-[80px] items-center justify-center text-xs font-medium tracking-widest text-slate-400 uppercase dark:text-slate-600">
                        Awaiting Command
                      </div>
                    )}
                  </div>
                </div>

                {/* Draw Results Details */}
                {revealedWinner ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                  >
                    <h4 className="font-serif text-4xl text-slate-900 md:text-5xl dark:text-white">
                      {revealedWinner.name}
                    </h4>
                    <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-6 py-2">
                      <Ticket className="h-4 w-4 text-[#B38728] dark:text-[#D4AF37]" />
                      <span className="font-mono text-lg tracking-widest text-[#B38728] dark:text-[#D4AF37]">
                        {revealedWinner.ticket_number}
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <p className="mx-auto max-w-sm text-xs leading-relaxed font-medium tracking-widest text-slate-500 uppercase">
                    Verify {participants.length} entries and initiate cryptographically secure
                    shuffle
                  </p>
                )}

                <div className="pt-8">
                  {revealedWinner ? (
                    <button
                      onClick={() => setIsDrawArenaOpen(false)}
                      className="mx-auto block w-full max-w-sm cursor-pointer rounded-full bg-slate-900 px-8 py-4 text-xs font-semibold tracking-[0.15em] text-white uppercase transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-gray-100"
                    >
                      Acknowledge Winner
                    </button>
                  ) : (
                    <button
                      disabled={isShuffling || participants.length === 0}
                      onClick={startShuffleAnimation}
                      className="group relative mx-auto block w-full max-w-sm cursor-pointer overflow-hidden rounded-full bg-[#D4AF37] px-8 py-4 text-xs font-semibold tracking-[0.15em] text-white uppercase transition-all duration-300 hover:bg-[#B38728] disabled:bg-slate-200 disabled:text-slate-400 dark:text-slate-900 dark:hover:bg-[#E5C158] dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isShuffling ? 'Encrypting & Shuffling...' : 'Initiate Sequence'}{' '}
                        <Play className="h-3.5 w-3.5 fill-white dark:fill-slate-900" />
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
          background: rgba(100, 100, 100, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 100, 100, 0.3);
        }
        @media (prefers-color-scheme: dark) {
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.02);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
          }
        }
      `}</style>
    </section>
  );
}
