'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useLotteryData, type Participant } from './useLotteryData';

export interface UseLotteryDrawReturn {
  activeLottery: import('./useLotteryData').ActiveLottery | null;
  participants: Participant[];
  winners: Participant[];
  revealedWinners: Participant[];
  isDrawArenaOpen: boolean;
  isShuffling: boolean;
  shuffledNames: string[];
  currentRevealIndex: number;
  drawWinnerCount: number;
  activeWinnerIndex: number;
  winnerSwipeDir: number;
  soundEnabled: boolean;
  historicalWinners: any[];
  visibleCount: number;
  error: string | null;
  scheduledAt: Date | null;
  countdownStr: string | null;
  shuffleContainerRef: React.RefObject<HTMLDivElement | null>;

  setIsDrawArenaOpen: (v: boolean) => void;
  setSoundEnabled: (v: boolean) => void;
  setVisibleCount: (v: number | ((prev: number) => number)) => void;
  setActiveWinnerIndex: (v: number | ((prev: number) => number)) => void;
  setWinnerSwipeDir: (v: number) => void;

  handleCarouselNavigate: (idx: number, dir: number) => void;
  startShuffleAnimation: () => void;
  fetchHallOfFame: () => Promise<void>;
  fetchActiveLottery: () => Promise<void>;
}

export function useLotteryDraw(): UseLotteryDrawReturn {
  const {
    activeLottery,
    participants,
    historicalWinners,
    error,
    scheduledAt,
    countdownStr,
    fetchActiveLottery: fetchData,
    fetchHallOfFame,
  } = useLotteryData();

  const [winners, setWinners] = useState<Participant[]>([]);

  const [isDrawArenaOpen, setIsDrawArenaOpen] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffledNames, setShuffledNames] = useState<string[]>([]);
  const [revealedWinners, setRevealedWinners] = useState<Participant[]>([]);
  const [currentRevealIndex, setCurrentRevealIndex] = useState(-1);
  const [drawWinnerCount, setDrawWinnerCount] = useState(0);
  const [activeWinnerIndex, setActiveWinnerIndex] = useState(0);
  const [winnerSwipeDir, setWinnerSwipeDir] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);

  const shuffleContainerRef = useRef<HTMLDivElement>(null);
  const shuffleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const revealTimerRef = useRef<NodeJS.Timeout | null>(null);
  const carouselTimerRef = useRef<NodeJS.Timeout | null>(null);

  const initialSyncRef = useRef(false);

  useEffect(() => {
    if (participants.length > 0 && !initialSyncRef.current) {
      initialSyncRef.current = true;
      const dbWinners = participants.filter((p) => p.is_winner);
      if (dbWinners.length > 0 && activeLottery?.id) {
        const isRevealed = localStorage.getItem(`lottery_revealed_${activeLottery.id}`);
        if (isRevealed === 'true') {
          setWinners(dbWinners);
        }
      }
    }
  }, [participants, activeLottery]);

  const fetchActiveLottery = useCallback(async () => {
    initialSyncRef.current = false;
    setWinners([]);
    await fetchData();
  }, [fetchData]);

  // Auto-rotate winners carousel
  useEffect(() => {
    if (carouselTimerRef.current) clearInterval(carouselTimerRef.current);
    if (winners.length <= 1) return;

    carouselTimerRef.current = setInterval(() => {
      setWinnerSwipeDir(1);
      setActiveWinnerIndex((prev) => (prev + 1) % winners.length);
      triggerMiniConfetti();
    }, 3500);

    return () => {
      if (carouselTimerRef.current) clearInterval(carouselTimerRef.current);
    };
  }, [winners.length]);

  useEffect(() => {
    return () => {
      if (shuffleTimerRef.current) clearTimeout(shuffleTimerRef.current);
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      if (carouselTimerRef.current) clearInterval(carouselTimerRef.current);
    };
  }, []);

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

      playTone(392, now, 0.3, 'sine');
      playTone(523.25, now + 0.15, 0.3, 'sine');
      playTone(659.25, now + 0.3, 0.3, 'sine');
      playTone(783.99, now + 0.45, 0.5, 'sine');
      playTone(1046.5, now + 0.6, 1.0, 'sine');
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

      playTone(523.25, now, 0.4, 'sine');
      playTone(659.25, now + 0.2, 0.4, 'sine');
      playTone(783.99, now + 0.4, 0.4, 'sine');
      playTone(1046.5, now + 0.6, 1.2, 'sine');
      playTone(783.99, now + 1.0, 0.3, 'sine');
      playTone(1046.5, now + 1.3, 1.5, 'sine');
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

  const triggerMiniConfetti = useCallback(() => {
    confetti({
      particleCount: 30,
      spread: 70,
      startVelocity: 25,
      origin: { x: 0.5, y: 0.45 },
      colors: ['#D4AF37', '#F3E5AB', '#FFD700', '#FFFFFF'],
      zIndex: 200,
    });
    setTimeout(() => {
      confetti({
        particleCount: 15,
        angle: 60,
        spread: 40,
        startVelocity: 20,
        origin: { x: 0.1, y: 0.5 },
        colors: ['#D4AF37', '#FFD700'],
        zIndex: 200,
      });
      confetti({
        particleCount: 15,
        angle: 120,
        spread: 40,
        startVelocity: 20,
        origin: { x: 0.9, y: 0.5 },
        colors: ['#D4AF37', '#FFD700'],
        zIndex: 200,
      });
    }, 100);
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
          playFanfareSound();
          triggerGrandFinale();
          setWinners(drawWinners);
          if (activeLottery?.id) {
            localStorage.setItem(`lottery_revealed_${activeLottery.id}`, 'true');
          }
          fetchHallOfFame();
          return;
        }

        setCurrentRevealIndex(idx);
        setRevealedWinners((prev) => [...prev, drawWinners[idx]]);
        playRevealSound();
        triggerWinnerConfetti();
        idx++;

        revealTimerRef.current = setTimeout(revealNext, idx >= drawWinners.length ? 800 : 1800);
      };

      revealTimerRef.current = setTimeout(revealNext, 400);
    },
    [playFanfareSound, triggerGrandFinale, triggerWinnerConfetti, fetchHallOfFame]
  );

  // ── Shuffle Animation ──────────────────────────────────────────────────
  const startShuffleAnimation = () => {
    if (participants.length === 0 || isShuffling) return;

    const drawWinners = winners.length > 0 ? winners : participants.filter((p) => p.is_winner);
    if (drawWinners.length === 0) {
      return;
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

  const handleCarouselNavigate = useCallback(
    (idx: number, dir: number) => {
      setWinnerSwipeDir(dir);
      setActiveWinnerIndex(idx);
      if (carouselTimerRef.current) clearInterval(carouselTimerRef.current);
      if (winners.length > 1) {
        carouselTimerRef.current = setInterval(() => {
          setWinnerSwipeDir(1);
          setActiveWinnerIndex((prev) => (prev + 1) % winners.length);
          triggerMiniConfetti();
        }, 3500);
      }
    },
    [winners.length, triggerMiniConfetti]
  );

  return {
    activeLottery,
    participants,
    winners,
    revealedWinners,
    isDrawArenaOpen,
    isShuffling,
    shuffledNames,
    currentRevealIndex,
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
    setActiveWinnerIndex,
    setWinnerSwipeDir,

    handleCarouselNavigate,
    startShuffleAnimation,
    fetchHallOfFame,
    fetchActiveLottery,
  };
}
