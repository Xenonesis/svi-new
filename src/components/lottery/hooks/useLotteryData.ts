'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase/client';

export interface Participant {
  id: string;
  name: string;
  ticket_number: string;
  is_winner: boolean;
}

export interface ActiveLottery {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
}

export interface UseLotteryDataReturn {
  activeLottery: ActiveLottery | null;
  participants: Participant[];
  historicalWinners: any[];
  error: string | null;
  scheduledAt: Date | null;
  countdownStr: string | null;
  fetchActiveLottery: () => Promise<void>;
  fetchHallOfFame: () => Promise<void>;
}

export function useLotteryData(): UseLotteryDataReturn {
  const [activeLottery, setActiveLottery] = useState<ActiveLottery | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [historicalWinners, setHistoricalWinners] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [countdownStr, setCountdownStr] = useState<string | null>(null);

  const fetchActiveLottery = async () => {
    try {
      setError(null);
      const { data: lotteryData, error: lError } = await supabase
        .from('lotteries')
        .select('*')
        .in('status', ['active', 'completed'])
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

  useEffect(() => {
    fetchActiveLottery();
    fetchHallOfFame();
    fetchScheduleCountdown();
    const pollInterval = setInterval(fetchScheduleCountdown, 30_000);
    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
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
    const interval = setInterval(tick, 1_000);
    return () => clearInterval(interval);
  }, [scheduledAt]);

  return {
    activeLottery,
    participants,
    historicalWinners,
    error,
    scheduledAt,
    countdownStr,
    fetchActiveLottery,
    fetchHallOfFame,
  };
}
