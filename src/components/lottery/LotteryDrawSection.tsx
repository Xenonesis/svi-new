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
        .limit(3);

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
      // High pitched click
      osc.frequency.setValueAtTime(800 + Math.random() * 400, context.currentTime);
      gain.gain.setValueAtTime(0.05, context.currentTime);
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
        gain.gain.setValueAtTime(0.1, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.start(start);
        osc.stop(start + duration);
      };

      // Grand Fanfare
      playTone(523.25, now, 0.2, 'square'); // C5
      playTone(659.25, now + 0.15, 0.2, 'square'); // E5
      playTone(783.99, now + 0.3, 0.2, 'square'); // G5
      playTone(1046.5, now + 0.45, 0.8, 'square'); // C6

      // Sparkling overlay
      playTone(1046.5, now + 0.45, 0.6, 'sine');
      playTone(1318.51, now + 0.55, 0.6, 'sine');
      playTone(1567.98, now + 0.65, 0.8, 'sine');
    } catch (e) {
      console.warn('Success sound failed:', e);
    }
  };

  // Intense Canvas Confetti
  const triggerConfetti = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#c9a84c', '#f0d080', '#ffffff', '#ffd700', '#ffeb3b'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#c9a84c', '#f0d080', '#ffffff', '#ffd700', '#ffeb3b'],
      });
    }, 250);

    // Initial massive burst
    confetti({
      particleCount: 200,
      spread: 160,
      origin: { y: 0.6 },
      colors: ['#c9a84c', '#f0d080', '#ffffff', '#ffd700', '#ffeb3b'],
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
    let delay = 35;

    const tick = () => {
      currentIndex++;
      playTickSound();

      if (shuffleContainerRef.current) {
        const itemHeight = 72; // Adjusted for larger font
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
        if (remaining < 15) {
          delay += 35;
        } else if (remaining < 30) {
          delay += 15;
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
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a0a0f] to-[#12121a] py-24 text-white">
        <div className="relative z-10 container mx-auto max-w-md px-4 text-center">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 shadow-[0_0_40px_rgba(239,68,68,0.2)] backdrop-blur-md">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="mb-2 font-serif text-xl font-bold text-white">Lucky Draw Offline</h3>
            <p className="mb-6 text-sm leading-relaxed text-gray-400">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchActiveLottery();
                fetchPastWinners();
              }}
              className="bg-brand-gold hover:bg-brand-gold/90 text-brand-navy inline-flex cursor-pointer items-center gap-2 rounded-xl px-6 py-3 text-xs font-bold tracking-wider uppercase transition-all"
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
    <section className="relative overflow-hidden bg-[#0a0a0f] py-24 text-white">
      {/* Absolute grid background with golden glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(#c9a84c 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-[#c9a84c]/5 to-transparent blur-3xl" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold mb-6 inline-flex items-center gap-2 rounded-full border px-6 py-2 text-xs font-bold tracking-[0.25em] uppercase shadow-[0_0_20px_rgba(201,168,76,0.2)] backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4 animate-pulse" /> Official Live Event
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl font-bold tracking-tight text-white md:text-6xl"
          >
            {activeLottery.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-400"
          >
            {activeLottery.description ||
              'The ultimate giveaway for our premium clients. Winners are selected through a provably fair, database-verified cryptographically secure algorithm.'}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-5">
          {/* Main Drawing Showcase */}
          <div className="flex flex-col lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="group border-brand-gold/30 relative flex h-full flex-col justify-between overflow-hidden rounded-[2.5rem] border bg-gradient-to-b from-[#12121a] to-[#0a0a0f] p-10 shadow-[0_0_60px_rgba(201,168,76,0.15)] backdrop-blur-xl transition-all duration-500 hover:shadow-[0_0_80px_rgba(201,168,76,0.25)]"
            >
              {/* Dynamic light orb */}
              <div className="bg-brand-gold/15 group-hover:bg-brand-gold/25 absolute -top-32 -left-32 h-64 w-64 rounded-full blur-[100px] transition-all duration-1000" />
              <div className="absolute -right-32 -bottom-32 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px]" />

              <div className="relative space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-brand-gold/10 text-brand-gold flex h-12 w-12 items-center justify-center rounded-2xl shadow-[0_0_15px_rgba(201,168,76,0.3)]">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-white">Grand Prize Draw</h3>
                      <div className="text-brand-gold text-[10px] font-bold tracking-widest uppercase">
                        Session Active
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-all hover:bg-white/10 hover:text-white"
                    title={soundEnabled ? 'Mute audio' : 'Unmute audio'}
                  >
                    {soundEnabled ? (
                      <Volume2 className="h-5 w-5" />
                    ) : (
                      <VolumeX className="h-5 w-5 text-red-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-6 rounded-2xl border border-white/5 bg-black/40 p-4 text-sm font-semibold text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="text-brand-gold text-2xl font-bold">
                      {participants.length}
                    </span>
                    <span className="text-xs tracking-wider text-gray-500 uppercase">Tickets</span>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-green-400" />
                    <span className="text-xs tracking-wider text-gray-500 uppercase">
                      DB Verified
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative mt-8 flex flex-col items-center pt-8">
                {winner ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full space-y-6 text-center"
                  >
                    <div className="border-brand-gold bg-brand-gold/10 text-brand-gold mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 shadow-[0_0_40px_rgba(201,168,76,0.5)]">
                      <Award className="h-12 w-12" />
                    </div>
                    <div>
                      <div className="text-brand-gold mb-2 animate-pulse text-[10px] font-bold tracking-[0.3em] uppercase">
                        WINNER SECURED
                      </div>
                      <h4 className="font-serif text-4xl font-bold tracking-wide text-white md:text-5xl">
                        {winner.name}
                      </h4>
                      <div className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold mt-4 inline-flex items-center gap-2 rounded-xl border px-6 py-2.5 font-mono text-sm font-bold shadow-[0_0_15px_rgba(201,168,76,0.2)]">
                        <Ticket className="h-4 w-4" /> {winner.ticket_number}
                      </div>
                    </div>
                  </motion.div>
                ) : participants.length === 0 ? (
                  <div className="w-full rounded-3xl border border-red-500/30 bg-red-500/5 p-8 text-center backdrop-blur-md">
                    <AlertCircle className="mx-auto mb-4 h-10 w-10 animate-pulse text-red-400" />
                    <div className="text-sm font-bold text-red-400">Waiting for Data</div>
                    <div className="mx-auto mt-2 text-xs text-gray-500">
                      The admin has not uploaded the participant pool yet. Please wait.
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-8 text-center">
                    <div className="relative flex flex-col items-center justify-center py-4">
                      <div className="animate-spin-slow from-brand-gold/0 via-brand-gold/20 to-brand-gold/0 absolute inset-0 rounded-full bg-gradient-to-tr blur-xl" />
                      <Gift className="text-brand-gold relative z-10 mb-4 h-16 w-16 animate-bounce drop-shadow-[0_0_15px_rgba(201,168,76,0.8)]" />
                      <div className="text-xl font-bold text-white">Winner Pre-computed</div>
                      <div className="mt-1 text-xs tracking-wider text-gray-400 uppercase">
                        Ready for reveal
                      </div>
                    </div>
                    <button
                      onClick={() => setIsDrawArenaOpen(true)}
                      className="group bg-brand-gold text-brand-navy relative w-full cursor-pointer overflow-hidden rounded-2xl py-5 text-sm font-bold tracking-[0.2em] uppercase shadow-[0_0_30px_rgba(201,168,76,0.4)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(201,168,76,0.6)]"
                    >
                      <div className="absolute inset-0 flex h-full w-full [transform:skew(-12deg)_translateX(-100%)] justify-center group-hover:[transform:skew(-12deg)_translateX(100%)] group-hover:duration-1000">
                        <div className="relative h-full w-12 bg-white/40" />
                      </div>
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Enter Live Arena <Sparkles className="h-4 w-4" />
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Past Winners Leaderboard */}
          <div className="flex flex-col lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative flex h-full flex-col justify-between overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0e0e14]/80 p-8 shadow-2xl backdrop-blur-xl"
            >
              <div>
                <h3 className="mb-8 flex items-center gap-3 font-serif text-2xl font-bold text-white">
                  <Star className="text-brand-gold fill-brand-gold h-6 w-6" /> Hall of Fame
                </h3>

                <div className="space-y-4">
                  {historicalWinners.map((hw, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="group hover:border-brand-gold/30 relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-5 transition-all hover:bg-white/10"
                    >
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-serif text-xl font-bold shadow-inner ${idx === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-black' : idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' : 'bg-gradient-to-br from-orange-300 to-orange-700 text-black'}`}
                      >
                        #{idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="group-hover:text-brand-gold truncate text-sm font-bold text-white transition-colors">
                          {hw.name}
                        </div>
                        <div className="mt-0.5 truncate text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                          {hw.lotteries?.title || 'SVI Lucky Draw'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="border-brand-gold/20 bg-brand-gold/10 text-brand-gold inline-block rounded-md border px-2 py-1 font-mono text-[10px] font-bold">
                          {hw.ticket_number}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {historicalWinners.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-12 text-center text-gray-500">
                      <Trophy className="mb-2 h-8 w-8 opacity-20" />
                      <div className="text-xs tracking-widest uppercase">No Champions Yet</div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* MASSIVE DRAWING ARENA MODAL */}
      <AnimatePresence>
        {isDrawArenaOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          >
            {/* Dramatic background lighting */}
            {isShuffling && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0.2, 0.8, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="bg-brand-gold/5 pointer-events-none absolute inset-0"
              />
            )}

            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="border-brand-gold/40 relative w-full max-w-3xl overflow-hidden rounded-[3rem] border bg-gradient-to-b from-[#12121a] to-[#0a0a0f] p-10 text-center shadow-[0_0_100px_rgba(201,168,76,0.3)] md:p-16"
            >
              {!isShuffling && (
                <button
                  onClick={() => setIsDrawArenaOpen(false)}
                  className="absolute top-8 right-8 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              )}

              <div className="mx-auto max-w-lg space-y-8">
                <div>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold mx-auto mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1 text-[10px] font-bold tracking-[0.3em] uppercase"
                  >
                    <div className="bg-brand-gold h-1.5 w-1.5 animate-ping rounded-full" /> SECURE
                    ARENA
                  </motion.div>
                  <h3 className="font-serif text-3xl font-bold text-white drop-shadow-lg md:text-5xl">
                    {activeLottery.title}
                  </h3>
                </div>

                {/* Hyper-styled Shuffling Cylinder */}
                <div className="border-brand-gold/50 relative mx-auto my-12 h-36 w-full max-w-xs overflow-hidden rounded-3xl border-2 bg-[#050508] shadow-[inset_0_0_40px_rgba(0,0,0,1),0_0_30px_rgba(201,168,76,0.2)]">
                  {/* Neon targeting brackets */}
                  <div className="border-brand-gold/60 bg-brand-gold/10 pointer-events-none absolute top-1/2 right-0 left-0 z-20 h-20 -translate-y-1/2 border-y-4 shadow-[0_0_20px_rgba(201,168,76,0.4)]" />

                  {/* Inner fade shadows */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-[#050508] to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-[#050508] to-transparent" />

                  {/* Scrolling Content */}
                  <div
                    ref={shuffleContainerRef}
                    className="flex flex-col pt-8 transition-transform duration-75 ease-linear"
                  >
                    {shuffledNames.length > 0 ? (
                      shuffledNames.map((name, idx) => (
                        <div
                          key={idx}
                          className="flex h-[72px] items-center justify-center px-4 text-center"
                        >
                          <span
                            className={`block truncate ${idx === shuffledNames.length - 1 ? 'text-brand-gold scale-125 font-serif text-3xl font-bold drop-shadow-[0_0_15px_rgba(201,168,76,0.8)] transition-all duration-500' : 'text-2xl font-bold text-white/30'}`}
                          >
                            {name}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="flex h-[72px] items-center justify-center text-sm font-bold tracking-widest text-gray-500 uppercase">
                        Awaiting Command
                      </div>
                    )}
                  </div>
                </div>

                {/* Draw Results Details */}
                {revealedWinner ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    className="space-y-6"
                  >
                    <h4 className="font-serif text-5xl font-bold tracking-tight text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                      {revealedWinner.name}
                    </h4>
                    <div className="border-brand-gold/40 bg-brand-gold/15 mx-auto inline-flex items-center gap-3 rounded-2xl border px-6 py-3 shadow-[0_0_20px_rgba(201,168,76,0.2)]">
                      <Ticket className="text-brand-gold h-6 w-6" />
                      <span className="text-brand-gold font-mono text-xl font-bold tracking-widest">
                        {revealedWinner.ticket_number}
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <p className="mx-auto max-w-xs text-xs leading-relaxed font-semibold tracking-wider text-gray-400 uppercase">
                    Verify {participants.length} entries and initiate cryptographically secure
                    shuffle
                  </p>
                )}

                <div className="pt-6">
                  {revealedWinner ? (
                    <button
                      onClick={() => setIsDrawArenaOpen(false)}
                      className="w-full cursor-pointer rounded-2xl bg-white px-8 py-4 text-sm font-bold tracking-[0.2em] text-black uppercase transition-all hover:bg-gray-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                    >
                      Acknowledge Winner
                    </button>
                  ) : (
                    <button
                      disabled={isShuffling || participants.length === 0}
                      onClick={startShuffleAnimation}
                      className="group bg-brand-gold relative w-full cursor-pointer overflow-hidden rounded-2xl py-5 text-sm font-bold tracking-[0.2em] text-black uppercase shadow-[0_0_40px_rgba(201,168,76,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(201,168,76,0.6)] disabled:scale-100 disabled:bg-gray-800 disabled:text-gray-500 disabled:shadow-none"
                    >
                      <div className="absolute inset-0 flex h-full w-full [transform:skew(-12deg)_translateX(-100%)] justify-center group-hover:[transform:skew(-12deg)_translateX(100%)] group-hover:duration-1000">
                        <div className="relative h-full w-12 bg-white/40" />
                      </div>
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isShuffling ? 'Encrypting & Shuffling...' : 'Initiate Sequence'}{' '}
                        <Play className="h-4 w-4 fill-black" />
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
