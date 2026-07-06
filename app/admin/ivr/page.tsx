'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/stores/authStore';
import {
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Play,
  Pause,
  Search,
  RefreshCw,
  FileText,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  AlertCircle,
  Volume2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CallRecord {
  uid: string;
  virtual_number: string;
  virtual_number_id?: string;
  nick_name?: string;
  from_number: string;
  to_number: string;
  user?: string;
  start: string;
  answer?: string;
  end?: string;
  duration: string;
  billsec: string;
  pulse?: string;
  status: string; // "1" for answered, "0" for missed
  play: string;
}

const GRID_STYLE = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(212, 175, 55, 0.05) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};

export default function IvrManagerPage() {
  const router = useRouter();
  const { token, isAdmin, loading: authLoading } = useAuthStore();

  // Tab State
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing' | 'dialer' | 'docs'>(
    'incoming'
  );

  // Call History State
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [statics, setStatics] = useState({ total: 0, answered: 0, missed: 0 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 8;

  // Real data state trackers
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filter States
  const [virtualNumber, setVirtualNumber] = useState('');
  const [toNumber, setToNumber] = useState('');
  const [fromNumber, setFromNumber] = useState('');
  const [status, setStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Audio Player State
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Dialer State
  const [dialerFrom, setDialerFrom] = useState('');
  const [dialerTo, setDialerTo] = useState('');
  const [dialing, setDialing] = useState(false);
  const [dialResult, setDialResult] = useState<{ success: boolean; msg: string } | null>(null);

  // Clipboard feedback state
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Protect Route
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace('/admin');
    }
  }, [isAdmin, authLoading, router]);

  // Fetch History
  const fetchHistory = async (targetPage = page) => {
    if (!token) return;
    setLoading(true);
    setFetchError(null);
    try {
      // Pause any active audio
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingCallId(null);
      }

      const offset = (targetPage - 1) * limit;
      const apiAction = activeTab === 'outgoing' ? 'outgoing-history' : 'history';

      const queryParams = new URLSearchParams({
        action: apiAction,
        offset: String(offset),
        limit: String(limit),
      });

      if (virtualNumber) queryParams.append('virtual_number', virtualNumber);
      if (toNumber) queryParams.append('to_number', toNumber);
      if (fromNumber) queryParams.append('from_number', fromNumber);
      if (status !== 'all') queryParams.append('status', status.toUpperCase()); // "ANSWERED" or "MISSED"
      if (startDate) queryParams.append('start_date', startDate);
      if (endDate) queryParams.append('end_date', endDate);

      const res = await fetch(`/api/admin/ivr?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();

      if (!res.ok) {
        setFetchError(json.status?.message || `Gateway returned error ${res.status}`);
        setCalls([]);
        setTotalCount(0);
        return;
      }

      setCalls(json.data || []);
      setTotalCount(json.statics?.total || 0);
      setStatics({
        total: json.statics?.total || 0,
        answered: json.statics?.answered || 0,
        missed: json.statics?.missed || 0,
      });
    } catch (err: any) {
      console.error(err);
      setFetchError(err.message || 'An error occurred while connecting to the proxy service.');
      setCalls([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when tab changes or filters update
  useEffect(() => {
    if (activeTab === 'incoming' || activeTab === 'outgoing') {
      setPage(1);
      fetchHistory(1);
    }
  }, [activeTab, token]);

  // Handle Playback
  const togglePlay = (callId: string, recordUrl: string) => {
    if (!recordUrl) return;

    if (playingCallId === callId) {
      audioRef.current?.pause();
      setPlayingCallId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(recordUrl);
      audioRef.current = audio;
      setPlayingCallId(callId);

      audio.play().catch((err) => {
        console.error('Audio playback failed:', err);
        setPlayingCallId(null);
      });

      audio.onended = () => {
        setPlayingCallId(null);
      };
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Handle Outgoing Call Trigger
  const handleDial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !dialerFrom || !dialerTo) return;

    setDialing(true);
    setDialResult(null);

    try {
      const res = await fetch('/api/admin/ivr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          from_number: dialerFrom,
          to_number: dialerTo,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status?.code === 200) {
        setDialResult({
          success: true,
          msg: 'Live Call triggered successfully! Telephony gateway is bridging the connections.',
        });
        setDialerTo('');
      } else {
        throw new Error(data.status?.message || 'Failed to place call');
      }
    } catch (err: any) {
      setDialResult({
        success: false,
        msg: err.message || 'Call failed to initiate. Please check connection.',
      });
    } finally {
      setDialing(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const formatDuration = (secStr: string) => {
    const sec = parseInt(secStr) || 0;
    if (sec <= 0) return '0s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchHistory(newPage);
  };

  const clearFilters = () => {
    setVirtualNumber('');
    setToNumber('');
    setFromNumber('');
    setStatus('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
    setTimeout(() => fetchHistory(1), 50);
  };

  if (authLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="border-t-brand-gold h-10 w-10 animate-spin rounded-full border-4 border-gray-200" />
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="relative w-full font-sans">
      {/* Background ambient lighting effects */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="bg-brand-navy-light/10 absolute top-0 right-0 h-[450px] w-[450px] rounded-full blur-[120px]" />
        <div className="bg-brand-gold/5 absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-80" style={GRID_STYLE} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-brand-navy mb-1.5 font-serif text-4xl tracking-tight dark:text-white">
              IVR{' '}
              <span
                className="text-gradient-gold animate-bg-pan inline-block italic"
                style={{
                  backgroundSize: '200% 200%',
                  backgroundImage:
                    'linear-gradient(135deg, #d4af37, #f0d080, #b08f36, #dec070, #d4af37)',
                }}
              >
                Telephony Manager
              </span>
            </h1>
            <p className="text-xs tracking-wide text-gray-600 dark:text-gray-400">
              Manage incoming/outgoing voice traffic, play call recordings, and dial out to
              customers.
            </p>
          </div>
        </div>

        {/* Fetch Error Display */}
        {fetchError && (
          <div className="mb-6 flex gap-2.5 rounded-lg border border-red-500/25 bg-red-950/20 p-4 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-semibold">Telephony Gateway Error</p>
              <p className="mt-0.5">{fetchError}</p>
              <button
                onClick={() => fetchHistory()}
                className="text-brand-gold mt-2 font-bold underline"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Overview Stats Cards */}
        {(activeTab === 'incoming' || activeTab === 'outgoing') && !fetchError && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                label: 'Total Logs Found',
                value: statics.total,
                color: 'text-brand-gold',
                bg: 'bg-brand-gold/5',
              },
              {
                label: 'Answered Calls',
                value: statics.answered,
                color: 'text-emerald-500',
                bg: 'bg-emerald-500/5',
              },
              {
                label: 'Missed Calls',
                value: statics.missed,
                color: 'text-red-500',
                bg: 'bg-red-500/5',
              },
            ].map((stat, sidx) => (
              <div
                key={sidx}
                className={`dark:bg-brand-dark-surface/65 rounded-xl border border-gray-200 bg-white/80 p-4 shadow-sm backdrop-blur-md dark:border-white/8 ${stat.bg}`}
              >
                <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                  {stat.label}
                </p>
                <p className={`mt-1.5 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab switchers */}
        <div className="mb-8 flex border-b border-gray-200 dark:border-white/10">
          {[
            { id: 'incoming', label: 'Incoming Call History', icon: PhoneIncoming },
            { id: 'outgoing', label: 'Outgoing Call History', icon: PhoneOutgoing },
            { id: 'dialer', label: 'Manual Dialout', icon: PhoneCall },
            { id: 'docs', label: 'IVR API Reference', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group relative flex items-center gap-2 px-6 py-4.5 text-xs font-bold tracking-widest uppercase transition-all ${
                  isActive
                    ? 'text-brand-gold'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${isActive ? 'text-brand-gold' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'}`}
                />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="active-ivr-tab"
                    className="bg-brand-gold absolute right-0 bottom-0 left-0 h-0.5"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Main Contents */}
        <div className="space-y-6">
          {/* Filters - only visible for History tabs */}
          {(activeTab === 'incoming' || activeTab === 'outgoing') && !fetchError && (
            <div className="dark:bg-brand-dark-surface/65 relative rounded-xl border border-gray-200 bg-white/80 p-5 shadow-lg backdrop-blur-md dark:border-white/8">
              <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-white/5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Filter Voice Logs
                </h3>
                <button
                  onClick={clearFilters}
                  className="hover:text-brand-gold text-[10px] font-bold tracking-wider text-gray-400 uppercase transition-colors"
                >
                  Reset Filters
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                <div>
                  <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                    Virtual Number
                  </label>
                  <input
                    type="text"
                    value={virtualNumber}
                    onChange={(e) => setVirtualNumber(e.target.value)}
                    placeholder="Virtual No."
                    className="focus:border-brand-gold focus:ring-brand-gold/15 dark:bg-brand-dark-surface/85 w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 transition-all dark:border-white/10 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                    Executive (to_number)
                  </label>
                  <input
                    type="text"
                    value={toNumber}
                    onChange={(e) => setToNumber(e.target.value)}
                    placeholder="Executive phone"
                    className="focus:border-brand-gold focus:ring-brand-gold/15 dark:bg-brand-dark-surface/85 w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 transition-all dark:border-white/10 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                    Client (from_number)
                  </label>
                  <input
                    type="text"
                    value={fromNumber}
                    onChange={(e) => setFromNumber(e.target.value)}
                    placeholder="Client phone"
                    className="focus:border-brand-gold focus:ring-brand-gold/15 dark:bg-brand-dark-surface/85 w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 transition-all dark:border-white/10 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="focus:border-brand-gold focus:ring-brand-gold/15 dark:bg-brand-dark-surface/85 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-900 transition-all dark:border-white/10 dark:text-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="answered">Answered</option>
                    <option value="missed">Missed</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="focus:border-brand-gold focus:ring-brand-gold/15 dark:bg-brand-dark-surface/85 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 transition-all dark:border-white/10 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="focus:border-brand-gold focus:ring-brand-gold/15 dark:bg-brand-dark-surface/85 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 transition-all dark:border-white/10 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => fetchHistory(1)}
                  className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex cursor-pointer items-center gap-2 rounded-lg px-6 py-2.5 text-[10px] font-bold tracking-widest uppercase shadow-md transition-all"
                >
                  <Search className="h-3.5 w-3.5" /> Apply Filter
                </button>
              </div>
            </div>
          )}

          {/* Tab 1 & 2: Call History Logs */}
          {(activeTab === 'incoming' || activeTab === 'outgoing') && !fetchError && (
            <div className="dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-white/8">
              {/* Gold line decoration */}
              <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />

              <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-white/5">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  {activeTab === 'incoming'
                    ? 'Incoming Voice Record Logs'
                    : 'Outgoing Voice Record Logs'}
                </h2>
                <button
                  onClick={() => fetchHistory()}
                  disabled={loading}
                  className="dark:bg-brand-dark-surface/85 flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[10px] font-bold tracking-wider text-gray-700 uppercase transition-all hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {loading ? (
                /* Loading State */
                <div className="py-24 text-center">
                  <div className="border-t-brand-gold mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200" />
                  <p className="mt-4 text-xs font-semibold text-gray-500">
                    Querying telephony gateway records...
                  </p>
                </div>
              ) : calls.length === 0 ? (
                /* Empty State */
                <div className="py-24 text-center">
                  <Phone className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-700" />
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    No voice call logs match the selected parameters.
                  </p>
                </div>
              ) : (
                /* Calls Logs Table */
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/50 text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:border-white/5 dark:bg-white/5 dark:text-gray-400">
                        <th className="px-6 py-4">UID</th>
                        <th className="px-6 py-4">Virtual Number</th>
                        <th className="px-6 py-4">
                          {activeTab === 'incoming' ? 'Caller (Client)' : 'Destination (Client)'}
                        </th>
                        <th className="px-6 py-4">
                          {activeTab === 'incoming'
                            ? 'Executive (to_number)'
                            : 'Executive (from_number)'}
                        </th>
                        <th className="px-6 py-4">Date & Time</th>
                        <th className="px-6 py-4">Duration</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Audio Record</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                      {calls.map((call, idx) => (
                        <motion.tr
                          key={call.uid || idx}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02, duration: 0.25 }}
                          className="group transition-colors hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
                        >
                          {/* UID */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                                  call.status === '1'
                                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                    : 'border-red-500/20 bg-red-500/10 text-red-400'
                                }`}
                              >
                                {activeTab === 'incoming' ? (
                                  <PhoneIncoming className="h-4 w-4" />
                                ) : (
                                  <PhoneOutgoing className="h-4 w-4" />
                                )}
                              </div>
                              <span
                                className="block max-w-[100px] overflow-hidden font-mono text-xs font-semibold text-ellipsis text-gray-500"
                                title={call.uid}
                              >
                                {call.uid.split('.')[0]}
                              </span>
                            </div>
                          </td>

                          {/* Virtual Number */}
                          <td className="px-6 py-4">
                            <span
                              className="bg-brand-gold/10 text-brand-gold inline-flex items-center rounded-md px-2 py-0.5 font-mono text-xs font-bold tracking-wider"
                              title={call.nick_name}
                            >
                              {call.virtual_number}
                            </span>
                          </td>

                          {/* Client Number */}
                          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                            {activeTab === 'incoming' ? call.from_number : call.to_number}
                          </td>

                          {/* Executive Number */}
                          <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                            <div>
                              <span>
                                {activeTab === 'incoming' ? call.to_number : call.from_number}
                              </span>
                              {call.user && (
                                <span className="block text-[9px] text-gray-400">
                                  ({call.user})
                                </span>
                              )}
                            </div>
                          </td>

                          {/* DateTime */}
                          <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                            {call.start}
                          </td>

                          {/* Duration */}
                          <td className="px-6 py-4 text-xs font-medium text-gray-700 dark:text-gray-300">
                            {formatDuration(call.duration)}
                            {call.billsec && parseInt(call.billsec) > 0 && (
                              <span className="block text-[9px] text-gray-400">
                                Billed: {formatDuration(call.billsec)}
                              </span>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase ${
                                call.status === '1'
                                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
                                  : 'border-red-500/20 bg-red-500/10 text-red-500'
                              }`}
                            >
                              {call.status === '1' ? 'ANSWERED' : 'MISSED'}
                            </span>
                          </td>

                          {/* Audio Record Player */}
                          <td className="px-6 py-4 text-center">
                            {call.play ? (
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => togglePlay(call.uid, call.play)}
                                  className={`flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-all ${
                                    playingCallId === call.uid
                                      ? 'border-brand-gold bg-brand-gold text-brand-navy scale-105'
                                      : 'border-gray-200 bg-white text-gray-700 hover:scale-105 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
                                  }`}
                                  title={playingCallId === call.uid ? 'Pause' : 'Play'}
                                >
                                  {playingCallId === call.uid ? (
                                    <Pause className="h-3.5 w-3.5 fill-current" />
                                  ) : (
                                    <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
                                  )}
                                </button>
                                {playingCallId === call.uid && (
                                  <div className="flex items-center gap-0.5">
                                    <div
                                      className="bg-brand-gold h-3 w-0.5 animate-pulse"
                                      style={{ animationDelay: '0s' }}
                                    />
                                    <div
                                      className="bg-brand-gold h-4.5 w-0.5 animate-pulse"
                                      style={{ animationDelay: '0.15s' }}
                                    />
                                    <div
                                      className="bg-brand-gold h-2.5 w-0.5 animate-pulse"
                                      style={{ animationDelay: '0.3s' }}
                                    />
                                    <div
                                      className="bg-brand-gold h-4 w-0.5 animate-pulse"
                                      style={{ animationDelay: '0.45s' }}
                                    />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-400 dark:text-gray-600">
                                No Record
                              </span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination footer */}
              {!loading && totalCount > 0 && !fetchError && (
                <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 bg-gray-50/50 px-6 py-4 sm:flex-row dark:border-white/5 dark:bg-transparent">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Showing{' '}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {(page - 1) * limit + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {Math.min(page * limit, totalCount)}
                    </span>{' '}
                    of <span className="font-bold text-gray-900 dark:text-white">{totalCount}</span>{' '}
                    calls
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
                      className="hover:border-brand-gold hover:text-brand-gold dark:hover:border-brand-gold dark:hover:text-brand-gold flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <div className="flex h-8 min-w-[2rem] items-center justify-center rounded-lg bg-gray-100 px-2.5 text-xs font-bold text-gray-900 dark:bg-white/10 dark:text-white">
                      {page} / {totalPages}
                    </div>
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages}
                      className="hover:border-brand-gold hover:text-brand-gold dark:hover:border-brand-gold dark:hover:text-brand-gold flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Manual Dialout */}
          {activeTab === 'dialer' && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Dial out form */}
              <div className="dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8">
                <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

                <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-white/5">
                  <div className="bg-brand-gold/10 border-brand-gold/20 flex h-9 w-9 items-center justify-center rounded-lg border">
                    <PhoneCall className="text-brand-gold h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">
                      Initiate Outgoing Call Bridge
                    </h2>
                    <p className="text-[10px] tracking-wider text-gray-500 uppercase">
                      Dial client from executive numbers
                    </p>
                  </div>
                </div>

                <form onSubmit={handleDial} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                      Executive Number (from_number)
                    </label>
                    <input
                      type="text"
                      required
                      value={dialerFrom}
                      onChange={(e) => setDialerFrom(e.target.value)}
                      placeholder="e.g. 9999988888"
                      className="focus:border-brand-gold focus:ring-brand-gold/15 dark:bg-brand-dark-surface/85 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition-all dark:border-white/10 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                      Customer Number (to_number)
                    </label>
                    <input
                      type="text"
                      required
                      value={dialerTo}
                      onChange={(e) => setDialerTo(e.target.value)}
                      placeholder="e.g. 9885123456"
                      className="focus:border-brand-gold focus:ring-brand-gold/15 dark:bg-brand-dark-surface/85 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition-all dark:border-white/10 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={dialing}
                    className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-4 text-xs font-bold tracking-widest uppercase shadow-xl transition-all disabled:opacity-60"
                  >
                    {dialing ? (
                      <>
                        <div className="border-brand-navy/30 border-t-brand-navy h-4 w-4 animate-spin rounded-full border-2" />
                        Initiating Bridge...
                      </>
                    ) : (
                      <>
                        <PhoneCall className="h-4 w-4" /> Dial Out
                      </>
                    )}
                  </button>
                </form>

                {dialResult && (
                  <div
                    className={`mt-5 flex gap-2.5 rounded-lg border p-4 text-xs ${
                      dialResult.success
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-950/20 dark:text-emerald-400'
                        : 'border-red-200 bg-red-50 text-red-600 dark:border-red-500/25 dark:bg-red-950/20 dark:text-red-400'
                    }`}
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">
                        {dialResult.success ? 'Call Bridge Started' : 'Call Failed'}
                      </p>
                      <p className="mt-0.5">{dialResult.msg}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Dialer Guidelines */}
              <div className="dark:bg-brand-dark-surface/65 relative flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8">
                <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

                <div>
                  <h3 className="mb-4 text-base font-bold text-gray-900 dark:text-white">
                    Call Bridging Guidelines
                  </h3>
                  <ul className="space-y-3.5 text-xs text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2.5">
                      <span className="bg-brand-gold/10 text-brand-gold mt-0.5 flex h-4.5 w-4.5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                        1
                      </span>
                      <span>
                        The Call Bridge connects the **Executive (From)** and the **Customer (To)**
                        via the cloud telephony gateway.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="bg-brand-gold/10 text-brand-gold mt-0.5 flex h-4.5 w-4.5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                        2
                      </span>
                      <span>
                        The telephony server first dials the **Executive Number**. Once the
                        executive answers, the system initiates the call to the **Customer**.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="bg-brand-gold/10 text-brand-gold mt-0.5 flex h-4.5 w-4.5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                        3
                      </span>
                      <span>
                        Recording is automatically enabled on all call bridges and will appear in
                        the History logs as soon as the call finishes.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="border-brand-gold/20 bg-brand-gold/5 mt-8 flex items-center gap-3.5 rounded-lg border p-4 text-xs">
                  <Volume2 className="text-brand-gold h-5 w-5 flex-shrink-0" />
                  <span className="text-brand-navy-light dark:text-gray-300">
                    Make sure the executive phone is active and ready to receive the incoming bridge
                    dial.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: API Docs tab */}
          {activeTab === 'docs' && (
            <div className="space-y-6">
              {/* Documentations */}
              {[
                {
                  title: 'Fetch Call History',
                  endpoint: 'GET / POST  http://49.50.106.182/api/calls?token={token}',
                  desc: 'Fetch lists of incoming calls, virtual numbers, and call logs with recording links.',
                  params: [
                    { name: 'offset', type: 'int', desc: 'Offset of Call History data' },
                    { name: 'limit', type: 'int', desc: 'Limit of Call History data' },
                    { name: 'virtual_number', type: 'int', desc: 'Virtual Number.' },
                    { name: 'to_number', type: 'int', desc: 'User/Executive (Receiver) Number.' },
                    { name: 'key', type: 'int', desc: 'DTMF Option' },
                    { name: 'from_number', type: 'int', desc: 'Caller Number' },
                    { name: 'duration', type: 'int', desc: 'Total Duration in second' },
                    { name: 'aduration', type: 'int', desc: 'Answer duration in second' },
                    {
                      name: 'start_date',
                      type: 'UNIX DATE TIME Y-m-d H:i:s',
                      desc: 'Start Date of Call History. Example : 2017-12-04 00:00:00',
                    },
                    {
                      name: 'end_date',
                      type: 'UNIX DATE TIME Y-m-d H:i:s',
                      desc: 'End Date of Call History. Example: 2017-12-04 23:59:59',
                    },
                    {
                      name: 'status',
                      type: 'string (ANSWERED or MISSED)',
                      desc: 'Call Status Value',
                    },
                  ],
                  response: `{
    "status": {
        "code": 200,
        "message": "OK"
    },
    "data": [
        {
            "uid": "1512331083.83",
            "virtual_number_id": "123",
            "virtual_number": "9999XXXXXX",
            "nick_name": "myself",
            "from_number": "9999XXXXXX",
            "key": "1",
            "to_number": "9999XXXXXX",
            "user": "User Name",
            "start": "2017-12-04 01:28:03",
            "answer": "2017-12-04 01:28:08",
            "end": "2017-12-04 01:28:11",
            "duration": "8",
            "billsec": "3",
            "pulse": "1",
            "status": "1",
            "play": "http://49.50.106.182/recordings/answered/XXXXXXXX_2017-12-04 01:28:08.wav"
        }
    ],
    "page": {
        "offset": 0,
        "limit": "1"
    },
    "statics": {
        "total": 19,
        "answered": 12,
        "missed": 7
    }
}`,
                },
                {
                  title: 'Create Outgoing Call',
                  endpoint: 'POST  http://49.50.106.182/api/createCall?token={token}',
                  desc: 'Triggers a Call Bridge between the Executive and the Destination user.',
                  params: [
                    { name: 'from_number', type: 'int', desc: 'User/Executive (Receiver) Number.' },
                    { name: 'to_number', type: 'int', desc: 'Destination Customer Number.' },
                  ],
                  response: `{
    "status": {
        "code": 200,
        "message": "OK"
    }
}`,
                },
                {
                  title: 'Fetch Outgoing Call History',
                  endpoint: 'GET / POST  http://49.50.106.182/api/outcalls?token={token}',
                  desc: 'Fetch outgoing logs placed by executives.',
                  params: [
                    { name: 'offset', type: 'int', desc: 'Offset of Call History data' },
                    { name: 'limit', type: 'int', desc: 'Limit of Call History data' },
                    { name: 'virtual_number', type: 'int', desc: 'Virtual Number.' },
                    { name: 'to_number', type: 'int', desc: 'User/Executive (Receiver) Number.' },
                    { name: 'from_number', type: 'int', desc: 'Caller Number' },
                    { name: 'duration', type: 'int', desc: 'Total Duration in second' },
                    { name: 'aduration', type: 'int', desc: 'Answer duration in second' },
                    {
                      name: 'start_date',
                      type: 'UNIX DATE TIME Y-m-d H:i:s',
                      desc: 'Start Date of Call History. Example : 2017-12-04 00:00:00',
                    },
                    {
                      name: 'end_date',
                      type: 'UNIX DATE TIME Y-m-d H:i:s',
                      desc: 'End Date of Call History. Example: 2017-12-04 23:59:59',
                    },
                    {
                      name: 'status',
                      type: 'string (ANSWERED or MISSED)',
                      desc: 'Call Status Value',
                    },
                  ],
                  response: `{
    "status": {
        "code": 200,
        "message": "OK"
    },
    "data": [
        {
            "uid": "1512331083.83",
            "virtual_number": "9999XXXXXX",
            "nick_name": "myself",
            "from_number": "9999XXXXXX",
            "to_number": "9999XXXXXX",
            "user": "User Name",
            "start": "2017-12-04 01:28:03",
            "answer": "2017-12-04 01:28:08",
            "end": "2017-12-04 01:28:11",
            "duration": "8",
            "billsec": "3",
            "pulse": "1",
            "status": "1",
            "play": "http://49.50.106.182/recordings/answered/XXXXXXXX_2017-12-04 01:28:08.wav"
        }
    ],
    "page": {
        "offset": 0,
        "limit": "1"
    },
    "statics": {
        "total": 19,
        "answered": 12,
        "missed": 7
    }
}`,
                },
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8"
                >
                  <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

                  <h3 className="text-base font-bold text-gray-900 dark:text-white">{doc.title}</h3>
                  <p className="mt-1 text-xs text-gray-500">{doc.desc}</p>

                  <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 font-mono text-xs text-gray-700 dark:bg-black/40 dark:text-gray-300">
                    <span className="text-brand-navy-light dark:text-brand-gold font-semibold">
                      {doc.endpoint}
                    </span>
                    <button
                      onClick={() => handleCopy(doc.endpoint, `${idx}-endpoint`)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                      title="Copy Endpoint"
                    >
                      {copiedText === `${idx}-endpoint` ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <div className="mt-6">
                    <h4 className="mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                      Parameters
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-100 text-gray-500 dark:border-white/5 dark:bg-white/5">
                            <th className="px-4 py-2 font-bold">Parameter</th>
                            <th className="px-4 py-2 font-bold">Type</th>
                            <th className="px-4 py-2 font-bold">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                          {doc.params.map((p, pIdx) => (
                            <tr key={pIdx}>
                              <td className="text-brand-gold px-4 py-2.5 font-mono font-semibold">
                                {p.name}
                              </td>
                              <td className="px-4 py-2.5 font-mono text-gray-500">{p.type}</td>
                              <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">
                                {p.desc}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                        JSON Output Result
                      </h4>
                      <button
                        onClick={() => handleCopy(doc.response, `${idx}-res`)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                        title="Copy JSON Response"
                      >
                        {copiedText === `${idx}-res` ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <pre className="max-h-60 scrollbar-thin scrollbar-thumb-white/10 overflow-y-auto rounded-lg bg-black/60 p-4 font-mono text-xs text-gray-300">
                      {doc.response}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
