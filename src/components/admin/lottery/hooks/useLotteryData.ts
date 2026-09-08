'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import { createLotteryCampaign } from '@/src/lib/lottery/campaignHelpers';
import type { Lottery, DbParticipant } from '../types';

export interface UseLotteryDataReturn {
  lotteries: Lottery[];
  activeLottery: Lottery | null;
  activeParticipantsCount: number;
  activeWinners: DbParticipant[];
  lotteryVisible: boolean;
  visibilityLoading: boolean;
  visibilityPending: boolean;
  syncing: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  isPending: boolean;
  fetchLotteries: () => Promise<void>;
  toggleLotteryVisibility: (newValue: boolean) => Promise<void>;
  handleSyncExisting: (token: string) => Promise<void>;
  drawWinner: (token: string, lotteryId: string, winnerIds?: string[]) => Promise<void>;
  resetDraw: (lotteryId: string) => Promise<void>;
  setErrorMessage: (msg: string | null) => void;
  setSuccessMessage: (msg: string | null) => void;
}

export function useLotteryData(): UseLotteryDataReturn {
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [activeLottery, setActiveLottery] = useState<Lottery | null>(null);
  const [activeParticipantsCount, setActiveParticipantsCount] = useState(0);
  const [activeWinners, setActiveWinners] = useState<DbParticipant[]>([]);
  const [lotteryVisible, setLotteryVisible] = useState(false);
  const [visibilityLoading, setVisibilityLoading] = useState(true);
  const [visibilityPending, setVisibilityPending] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchLotteries = useCallback(async () => {
    try {
      const { data: lotteriesData, error: lError } = await supabase
        .from('lotteries')
        .select('*')
        .order('created_at', { ascending: false });

      if (lError) throw lError;

      const { data: participantsData, error: pError } = await supabase
        .from('lottery_participants')
        .select('*')
        .eq('is_winner', true);

      if (pError) throw pError;

      const formattedLotteries: Lottery[] = (lotteriesData || []).map((l) => {
        const campaignWinners = participantsData?.filter((p) => p.lottery_id === l.id) || [];
        const firstWinner = campaignWinners[0];
        return {
          id: l.id,
          title: l.title,
          description: l.description,
          status: l.status,
          created_at: l.created_at,
          winner: firstWinner
            ? {
                id: firstWinner.id,
                name: firstWinner.name,
                ticket_number: firstWinner.ticket_number,
                phone: firstWinner.phone,
                email: firstWinner.email,
              }
            : null,
          winners: campaignWinners.map((w) => ({
            id: w.id,
            name: w.name,
            ticket_number: w.ticket_number,
            phone: w.phone,
            email: w.email,
          })),
        };
      });

      setLotteries(formattedLotteries);

      const active = formattedLotteries.find((l) => l.status === 'active');
      if (active) {
        setActiveLottery(active);
        const { count, error: cError } = await supabase
          .from('lottery_participants')
          .select('*', { count: 'exact', head: true })
          .eq('lottery_id', active.id);

        if (!cError) {
          setActiveParticipantsCount(count || 0);
        }

        const { data: activeWinnersData, error: wError } = await supabase
          .from('lottery_participants')
          .select('*')
          .eq('lottery_id', active.id)
          .eq('is_winner', true);

        if (!wError) {
          setActiveWinners(activeWinnersData || []);
        }
      } else {
        setActiveLottery(null);
        setActiveParticipantsCount(0);
        setActiveWinners([]);
      }
    } catch (error: any) {
      console.error('Error fetching lottery data:', error);
      setErrorMessage(error.message || 'Failed to load lottery data.');
    }
  }, []);

  const fetchLotteryVisibility = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('portal_settings')
        .select('value')
        .eq('key', 'lottery_page_visible')
        .maybeSingle();

      if (!error && data) {
        setLotteryVisible(data.value === true);
      } else {
        setLotteryVisible(false);
      }
    } catch {
      setLotteryVisible(false);
    } finally {
      setVisibilityLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLotteries();
    fetchLotteryVisibility();
  }, [fetchLotteries, fetchLotteryVisibility]);

  const toggleLotteryVisibility = async (newValue: boolean) => {
    setVisibilityPending(true);
    try {
      const { error } = await supabase
        .from('portal_settings')
        .upsert({ key: 'lottery_page_visible', value: newValue }, { onConflict: 'key' });

      if (error) throw error;
      setLotteryVisible(newValue);
      setSuccessMessage(
        newValue
          ? 'Lottery page is now VISIBLE on the public site and navbar.'
          : 'Lottery page is now HIDDEN from the public site and navbar.'
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update lottery visibility.');
    } finally {
      setVisibilityPending(false);
    }
  };

  const handleSyncExisting = async (token: string) => {
    setSyncing(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const { data: allLotteries, error: lotErr } = await supabase
        .from('lotteries')
        .select('id, title, description')
        .order('created_at', { ascending: false });
      if (lotErr) throw lotErr;
      if (!allLotteries || allLotteries.length === 0) {
        setSyncing(false);
        return;
      }

      const { data: linkedCampaigns, error: campErr } = await supabase
        .from('email_campaigns')
        .select('lottery_id')
        .not('lottery_id', 'is', null);
      if (campErr) throw campErr;

      const linkedIds = new Set((linkedCampaigns || []).map((c: any) => c.lottery_id));

      let created = 0;
      let skipped = 0;
      for (const lot of allLotteries) {
        if (linkedIds.has(lot.id)) {
          skipped++;
          continue;
        }
        const ok = await createLotteryCampaign(lot, token);
        if (ok) created++;
      }

      setSuccessMessage(
        `Sync complete! ${created} campaign(s) created, ${skipped} already linked.`
      );
      fetchLotteries();
    } catch (err: any) {
      setErrorMessage(err.message || 'Sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  const drawWinner = async (token: string, lotteryId: string, winnerIds?: string[]) => {
    startTransition(async () => {
      try {
        setErrorMessage(null);
        setSuccessMessage(null);

        const response = await fetch('/api/admin/lottery/draw', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            lotteryId,
            winnerIds: winnerIds && winnerIds.length > 0 ? winnerIds : undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to draw winner.');
        }

        const winners = data.winners;
        const summary = winners.map((w: any) => `${w.name} (${w.ticket_number})`).join(', ');
        setSuccessMessage(
          `Winner${winners.length > 1 ? 's' : ''} Drawn! Congratulations to ${summary}!`
        );
        fetchLotteries();
      } catch (error: any) {
        console.error('Error drawing winner:', error);
        setErrorMessage(error.message || 'Failed to execute drawing.');
      }
    });
  };

  const resetDraw = async (lotteryId: string) => {
    startTransition(async () => {
      try {
        setErrorMessage(null);
        setSuccessMessage(null);

        const { error: pResetError } = await supabase
          .from('lottery_participants')
          .update({ is_winner: false, prize_rank: null })
          .eq('lottery_id', lotteryId);
        if (pResetError) throw pResetError;

        const { error: lResetError } = await supabase
          .from('lotteries')
          .update({ status: 'active' })
          .eq('id', lotteryId);
        if (lResetError) throw lResetError;

        setSuccessMessage('Lottery reset to active state. You can draw again!');
        fetchLotteries();
      } catch (error: any) {
        console.error('Error resetting lottery:', error);
        setErrorMessage(error.message || 'Failed to reset draw.');
      }
    });
  };

  return {
    lotteries,
    activeLottery,
    activeParticipantsCount,
    activeWinners,
    lotteryVisible,
    visibilityLoading,
    visibilityPending,
    syncing,
    errorMessage,
    successMessage,
    isPending,
    fetchLotteries,
    toggleLotteryVisibility,
    handleSyncExisting,
    drawWinner,
    resetDraw,
    setErrorMessage,
    setSuccessMessage,
  };
}
