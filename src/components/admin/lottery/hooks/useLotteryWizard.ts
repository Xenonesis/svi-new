'use client';

import { useState, useEffect, useCallback, type Dispatch, type SetStateAction } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import { createLotteryCampaign } from '@/src/lib/lottery/campaignHelpers';
import type { Lottery, Participant, DbParticipant } from '../types';

export interface UseLotteryWizardOptions {
  activeLottery?: Lottery | null;
  token?: string | null;
  participants?: Participant[];
  setParticipants?: (participants: Participant[]) => void;
  setActiveTab?: (tab: 'dashboard' | 'create') => void;
  fetchLotteries?: () => void | Promise<void>;
  setErrorMessage?: (msg: string | null) => void;
  setSuccessMessage?: (msg: string | null) => void;
  startTransition?: (callback: () => void | Promise<void>) => void;
}

export interface UseLotteryWizardReturn {
  wizardStep: number;
  setWizardStep: Dispatch<SetStateAction<number>>;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  drawMethod: 'random' | 'manual';
  setDrawMethod: (method: 'random' | 'manual') => void;
  selectedPredeterminedWinners: DbParticipant[];
  setSelectedPredeterminedWinners: Dispatch<SetStateAction<DbParticipant[]>>;
  dbParticipants: DbParticipant[];
  setDbParticipants: Dispatch<SetStateAction<DbParticipant[]>>;
  dbParticipantsSearch: string;
  setDbParticipantsSearch: (q: string) => void;
  dbParticipantsLoading: boolean;
  setDbParticipantsLoading: (loading: boolean) => void;
  nextStep: () => boolean;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetWizard: () => void;
  handleSelectPredeterminedWinner: (p: DbParticipant) => void;
  handleRemovePredeterminedWinner: (id: string) => void;
  handleClearPredeterminedWinners: () => void;
  saveLotteryToDB: () => Promise<void>;
  handleCreateCampaign: () => Promise<void>;
}

export function useLotteryWizard({
  activeLottery,
  token,
  participants = [],
  setParticipants,
  setActiveTab,
  fetchLotteries,
  setErrorMessage,
  setSuccessMessage,
  startTransition,
}: UseLotteryWizardOptions = {}): UseLotteryWizardReturn {
  const [wizardStep, setWizardStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [drawMethod, setDrawMethod] = useState<'random' | 'manual'>('manual');
  const [selectedPredeterminedWinners, setSelectedPredeterminedWinners] = useState<DbParticipant[]>(
    []
  );
  const [dbParticipants, setDbParticipants] = useState<DbParticipant[]>([]);
  const [dbParticipantsSearch, setDbParticipantsSearch] = useState('');
  const [dbParticipantsLoading, setDbParticipantsLoading] = useState(false);

  // ── Live DB Participant Search with 300ms Debounce ──────────────────────────
  useEffect(() => {
    if (!activeLottery || drawMethod !== 'manual') {
      setDbParticipants([]);
      return;
    }
    const timer = setTimeout(async () => {
      setDbParticipantsLoading(true);
      try {
        let query = supabase
          .from('lottery_participants')
          .select('id, name, ticket_number, phone, email')
          .eq('lottery_id', activeLottery.id);
        if (dbParticipantsSearch.trim()) {
          query = query.or(
            `name.ilike.%${dbParticipantsSearch.trim()}%,ticket_number.ilike.%${dbParticipantsSearch.trim()}%`
          );
        }
        const { data, error } = await query.limit(10);
        if (error) throw error;
        setDbParticipants(data || []);
      } catch (err) {
        console.error('Error fetching participants for search:', err);
      } finally {
        setDbParticipantsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [activeLottery?.id, drawMethod, dbParticipantsSearch]);

  // Reset selected winners and search when active lottery or draw method changes
  useEffect(() => {
    setSelectedPredeterminedWinners([]);
    setDbParticipantsSearch('');
  }, [activeLottery?.id, drawMethod]);

  // ── Navigation & Selection Helpers ──────────────────────────────────────────
  const nextStep = useCallback(() => {
    if (wizardStep === 1 && !title.trim()) {
      setErrorMessage?.('Title is required to proceed.');
      return false;
    }
    setErrorMessage?.(null);
    setWizardStep((s) => Math.min(s + 1, 3));
    return true;
  }, [wizardStep, title, setErrorMessage]);

  const prevStep = useCallback(() => {
    setWizardStep((s) => Math.max(s - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setWizardStep(Math.max(1, Math.min(step, 3)));
  }, []);

  const resetWizard = useCallback(() => {
    setTitle('');
    setDescription('');
    setParticipants?.([]);
    setWizardStep(1);
    setSelectedPredeterminedWinners([]);
    setDbParticipantsSearch('');
  }, [setParticipants]);

  const handleSelectPredeterminedWinner = useCallback((p: DbParticipant) => {
    setSelectedPredeterminedWinners((prev) =>
      prev.find((w) => w.id === p.id) ? prev.filter((w) => w.id !== p.id) : [...prev, p]
    );
    setDbParticipantsSearch('');
  }, []);

  const handleRemovePredeterminedWinner = useCallback((id: string) => {
    setSelectedPredeterminedWinners((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const handleClearPredeterminedWinners = useCallback(() => {
    setSelectedPredeterminedWinners([]);
  }, []);

  // ── Save Lottery To DB & Create Campaign ──────────────────────────────────
  const saveLotteryToDB = async () => {
    if (!title.trim()) {
      setErrorMessage?.('Please enter a title for the lottery.');
      return;
    }
    if (!participants || participants.length === 0) {
      setErrorMessage?.('Please upload a spreadsheet with participants first.');
      return;
    }

    const execute = async () => {
      try {
        setErrorMessage?.(null);
        setSuccessMessage?.(null);

        if (activeLottery) {
          const { error: deactErr } = await supabase
            .from('lotteries')
            .update({ status: 'inactive' })
            .eq('id', activeLottery.id);
          if (deactErr) throw deactErr;
        }

        const { data: newLottery, error: createErr } = await supabase
          .from('lotteries')
          .insert({
            title: title.trim(),
            description: description.trim() || null,
            status: 'active',
          })
          .select()
          .single();
        if (createErr) throw createErr;

        const participantsData = participants.map((p) => ({
          lottery_id: newLottery.id,
          name: p.name,
          phone: p.phone || null,
          email: p.email || null,
          ticket_number: p.ticketNumber,
          is_winner: false,
        }));

        const chunkSize = 100;
        for (let i = 0; i < participantsData.length; i += chunkSize) {
          const { error: insertErr } = await supabase
            .from('lottery_participants')
            .insert(participantsData.slice(i, i + chunkSize));
          if (insertErr) throw insertErr;
        }

        resetWizard();
        setSuccessMessage?.('New active lottery created successfully! Live drawing is ready.');
        setActiveTab?.('dashboard');
        fetchLotteries?.();

        createLotteryCampaign(newLottery, token || null)
          .then((ok) => {
            if (!ok) {
              setErrorMessage?.(
                'Lottery created, but linked email campaign failed. Use "Sync to EmailCenter" to retry.'
              );
            }
          })
          .catch(() => {
            setErrorMessage?.(
              'Lottery created, but linked email campaign failed. Use "Sync to EmailCenter" to retry.'
            );
          });
      } catch (error: unknown) {
        console.error('Error saving lottery:', error);
        setErrorMessage?.(
          error instanceof Error ? error.message : 'Failed to save the lottery draw.'
        );
      }
    };

    if (startTransition) {
      startTransition(execute);
    } else {
      await execute();
    }
  };

  const handleCreateCampaign = async () => {
    await saveLotteryToDB();
  };

  return {
    wizardStep,
    setWizardStep,
    title,
    setTitle,
    description,
    setDescription,
    drawMethod,
    setDrawMethod,
    selectedPredeterminedWinners,
    setSelectedPredeterminedWinners,
    dbParticipants,
    setDbParticipants,
    dbParticipantsSearch,
    setDbParticipantsSearch,
    dbParticipantsLoading,
    setDbParticipantsLoading,
    nextStep,
    prevStep,
    goToStep,
    resetWizard,
    handleSelectPredeterminedWinner,
    handleRemovePredeterminedWinner,
    handleClearPredeterminedWinners,
    saveLotteryToDB,
    handleCreateCampaign,
  };
}
