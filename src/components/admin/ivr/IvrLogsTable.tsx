import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Play,
  Pause,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export interface CallRecord {
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

interface IvrLogsTableProps {
  activeTab: 'incoming' | 'outgoing' | 'dialer' | 'docs';
  loading: boolean;
  calls: CallRecord[];
  fetchHistory: (page?: number) => void;
  totalCount: number;
  page: number;
  limit: number;
  handlePageChange: (newPage: number) => void;
}

export function IvrLogsTable({
  activeTab,
  loading,
  calls,
  fetchHistory,
  totalCount,
  page,
  limit,
  handlePageChange,
}: IvrLogsTableProps) {
  // Audio Player State
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const formatDuration = (secStr: string) => {
    const sec = parseInt(secStr) || 0;
    if (sec <= 0) return '0s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-white/8">
      {/* Gold line decoration */}
      <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />

      <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-white/5">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">
          {activeTab === 'incoming' ? 'Incoming Voice Record Logs' : 'Outgoing Voice Record Logs'}
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
                  {activeTab === 'incoming' ? 'Executive (to_number)' : 'Executive (from_number)'}
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
                      <span>{activeTab === 'incoming' ? call.to_number : call.from_number}</span>
                      {call.user && (
                        <span className="block text-[9px] text-gray-400">({call.user})</span>
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
      {!loading && totalCount > 0 && (
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
            of <span className="font-bold text-gray-900 dark:text-white">{totalCount}</span> calls
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
  );
}
