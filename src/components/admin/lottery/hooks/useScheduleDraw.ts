'use client';

import { useState, useEffect, useCallback } from 'react';

interface Schedule {
  id: string;
  lottery_id: string;
  scheduled_at: string;
  pre_notify_minutes: number;
  show_countdown: boolean;
  include_countdown_in_email: boolean;
}

interface UseScheduleDrawReturn {
  existingSchedule: Schedule | null;
  scheduleLoading: boolean;
  scheduleInputIST: string;
  preNotifyMinutes: number;
  showCountdown: boolean;
  includeCountdownInEmail: boolean;
  scheduleSaving: boolean;
  setScheduleInputIST: React.Dispatch<React.SetStateAction<string>>;
  setPreNotifyMinutes: React.Dispatch<React.SetStateAction<number>>;
  setShowCountdown: React.Dispatch<React.SetStateAction<boolean>>;
  setIncludeCountdownInEmail: React.Dispatch<React.SetStateAction<boolean>>;
  fetchSchedule: (lotteryId: string, token: string) => Promise<void>;
  handleSaveSchedule: (
    lotteryId: string,
    token: string,
    onError: (msg: string | null) => void,
    onSuccess: (msg: string | null) => void
  ) => Promise<void>;
  handleCancelSchedule: (
    lotteryId: string,
    token: string,
    onError: (msg: string | null) => void,
    onSuccess: (msg: string | null) => void
  ) => Promise<void>;
  getISTString: (date: Date) => string;
  resetScheduleState: () => void;
}

export function useScheduleDraw(): UseScheduleDrawReturn {
  const [existingSchedule, setExistingSchedule] = useState<Schedule | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleInputIST, setScheduleInputIST] = useState('');
  const [preNotifyMinutes, setPreNotifyMinutes] = useState(60);
  const [showCountdown, setShowCountdown] = useState(true);
  const [includeCountdownInEmail, setIncludeCountdownInEmail] = useState(true);
  const [scheduleSaving, setScheduleSaving] = useState(false);

  const resetScheduleState = useCallback(() => {
    setExistingSchedule(null);
    setScheduleInputIST('');
    setPreNotifyMinutes(60);
    setShowCountdown(true);
    setIncludeCountdownInEmail(true);
  }, []);

  const istInputToUTC = (istLocal: string): string => {
    const [datePart, timePart] = istLocal.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day, hour - 5, minute - 30));
    return utcDate.toISOString();
  };

  const getISTString = (date: Date): string => {
    const istOffset = 330 * 60 * 1000;
    const ist = new Date(date.getTime() + istOffset);
    return ist.toISOString().slice(0, 16);
  };

  const fetchSchedule = useCallback(
    async (lotteryId: string, token: string) => {
      setScheduleLoading(true);
      try {
        const res = await fetch(`/api/admin/lottery/schedule?lotteryId=${lotteryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        setExistingSchedule(json.schedule || null);
        if (json.schedule) {
          const utcDate = new Date(json.schedule.scheduled_at);
          const istOffset = 330 * 60 * 1000;
          const istDate = new Date(utcDate.getTime() + istOffset);
          const iso = istDate.toISOString().slice(0, 16);
          setScheduleInputIST(iso);
          setPreNotifyMinutes(json.schedule.pre_notify_minutes ?? 60);
          setShowCountdown(json.schedule.show_countdown ?? true);
          setIncludeCountdownInEmail(json.schedule.include_countdown_in_email ?? true);
        } else {
          resetScheduleState();
        }
      } catch {
        // ignore
      } finally {
        setScheduleLoading(false);
      }
    },
    [resetScheduleState]
  );

  const handleSaveSchedule = useCallback(
    async (
      lotteryId: string,
      token: string,
      onError: (msg: string | null) => void,
      onSuccess: (msg: string | null) => void
    ) => {
      if (!scheduleInputIST) {
        onError('Please select a date and time for the draw.');
        return;
      }
      const scheduledAtUTC = istInputToUTC(scheduleInputIST);
      if (new Date(scheduledAtUTC) <= new Date()) {
        onError('Scheduled time must be in the future.');
        return;
      }
      setScheduleSaving(true);
      try {
        const res = await fetch('/api/admin/lottery/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            lotteryId,
            scheduled_at: scheduledAtUTC,
            pre_notify_minutes: preNotifyMinutes,
            show_countdown: showCountdown,
            include_countdown_in_email: includeCountdownInEmail,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to schedule draw');
        onSuccess(
          `Draw scheduled for ${new Date(scheduledAtUTC).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST.`
        );
        setExistingSchedule(json.schedule);
      } catch (err: any) {
        onError(err.message);
      } finally {
        setScheduleSaving(false);
      }
    },
    [scheduleInputIST, preNotifyMinutes, showCountdown, includeCountdownInEmail]
  );

  const handleCancelSchedule = useCallback(
    async (
      lotteryId: string,
      token: string,
      onError: (msg: string | null) => void,
      onSuccess: (msg: string | null) => void
    ) => {
      if (!existingSchedule) return;
      if (!confirm('Are you sure you want to cancel the scheduled draw?')) return;
      setScheduleSaving(true);
      try {
        const res = await fetch('/api/admin/lottery/schedule', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ lotteryId }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to cancel schedule');
        onSuccess('Scheduled draw has been cancelled.');
        resetScheduleState();
      } catch (err: any) {
        onError(err.message);
      } finally {
        setScheduleSaving(false);
      }
    },
    [existingSchedule, resetScheduleState]
  );

  return {
    existingSchedule,
    scheduleLoading,
    scheduleInputIST,
    preNotifyMinutes,
    showCountdown,
    includeCountdownInEmail,
    scheduleSaving,
    setScheduleInputIST,
    setPreNotifyMinutes,
    setShowCountdown,
    setIncludeCountdownInEmail,
    fetchSchedule,
    handleSaveSchedule,
    handleCancelSchedule,
    getISTString,
    resetScheduleState,
  };
}
