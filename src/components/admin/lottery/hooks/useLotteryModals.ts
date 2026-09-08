'use client';

import { useState, useCallback, type Dispatch, type SetStateAction } from 'react';
import type { Lottery } from '../types';

export interface UseLotteryModalsReturn {
  editingLottery: Lottery | null;
  setEditingLottery: Dispatch<SetStateAction<Lottery | null>>;
  viewingLottery: Lottery | null;
  setViewingLottery: Dispatch<SetStateAction<Lottery | null>>;
  emailModalLottery: Lottery | null;
  setEmailModalLottery: Dispatch<SetStateAction<Lottery | null>>;
  deletingLotteryId: string | null;
  setDeletingLotteryId: Dispatch<SetStateAction<string | null>>;
  openEdit: (lottery: Lottery) => void;
  closeEdit: () => void;
  openView: (lottery: Lottery) => void;
  closeView: () => void;
  openEmail: (lottery: Lottery) => void;
  closeEmail: () => void;
  openDelete: (id: string) => void;
  closeDelete: () => void;
  openEmailFromView: (lottery: Lottery) => void;
}

export function useLotteryModals(): UseLotteryModalsReturn {
  const [editingLottery, setEditingLottery] = useState<Lottery | null>(null);
  const [viewingLottery, setViewingLottery] = useState<Lottery | null>(null);
  const [emailModalLottery, setEmailModalLottery] = useState<Lottery | null>(null);
  const [deletingLotteryId, setDeletingLotteryId] = useState<string | null>(null);

  const openEdit = useCallback((lottery: Lottery) => {
    setEditingLottery(lottery);
  }, []);

  const closeEdit = useCallback(() => {
    setEditingLottery(null);
  }, []);

  const openView = useCallback((lottery: Lottery) => {
    setViewingLottery(lottery);
  }, []);

  const closeView = useCallback(() => {
    setViewingLottery(null);
  }, []);

  const openEmail = useCallback((lottery: Lottery) => {
    setEmailModalLottery(lottery);
  }, []);

  const closeEmail = useCallback(() => {
    setEmailModalLottery(null);
  }, []);

  const openDelete = useCallback((id: string) => {
    setDeletingLotteryId(id);
  }, []);

  const closeDelete = useCallback(() => {
    setDeletingLotteryId(null);
  }, []);

  const openEmailFromView = useCallback((lottery: Lottery) => {
    setViewingLottery(null);
    setEmailModalLottery(lottery);
  }, []);

  return {
    editingLottery,
    setEditingLottery,
    viewingLottery,
    setViewingLottery,
    emailModalLottery,
    setEmailModalLottery,
    deletingLotteryId,
    setDeletingLotteryId,
    openEdit,
    closeEdit,
    openView,
    closeView,
    openEmail,
    closeEmail,
    openDelete,
    closeDelete,
    openEmailFromView,
  };
}
