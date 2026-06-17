'use client';

import { Award, Clock, Plus, Play, RefreshCw, Users, Trophy, Search, XCircle } from 'lucide-react';
import type { Lottery, DbParticipant } from './types';

interface DashboardPanelProps {
  activeLottery: Lottery | null;
  activeParticipantsCount: number;
  activeWinners: DbParticipant[];
  drawMethod: 'random' | 'manual';
  isPending: boolean;
  dbParticipants: DbParticipant[];
  dbParticipantsSearch: string;
  dbParticipantsLoading: boolean;
  selectedPredeterminedWinners: DbParticipant[];
  onDrawMethodChange: (method: 'random' | 'manual') => void;
  onExecuteDraw: () => void;
  onResetDraw: () => void;
  onDbParticipantsSearchChange: (value: string) => void;
  onSelectPredeterminedWinner: (participant: DbParticipant) => void;
  onRemovePredeterminedWinner: (id: string) => void;
  onClearPredeterminedWinners: () => void;
  onCreateNew: () => void;
}

export function DashboardPanel({
  activeLottery,
  activeParticipantsCount,
  activeWinners,
  drawMethod,
  isPending,
  dbParticipants,
  dbParticipantsSearch,
  dbParticipantsLoading,
  selectedPredeterminedWinners,
  onDrawMethodChange,
  onExecuteDraw,
  onResetDraw,
  onDbParticipantsSearchChange,
  onSelectPredeterminedWinner,
  onRemovePredeterminedWinner,
  onClearPredeterminedWinners,
  onCreateNew,
}: DashboardPanelProps) {
  if (!activeLottery) {
    return (
      <div className="dark:bg-brand-dark-surface/30 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-16 text-center dark:border-white/20">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-gray-600">
          <Award className="h-10 w-10" />
        </div>
        <h3 className="mb-2 font-serif text-2xl font-bold text-slate-900 dark:text-white">
          No Active Campaigns
        </h3>
        <p className="mb-8 max-w-md text-sm text-slate-500 dark:text-gray-400">
          You don't have any active lotteries running. Start a new campaign to thrill your
          participants and award prizes.
        </p>
        <button
          onClick={onCreateNew}
          className="bg-brand-gold text-brand-navy hover:shadow-[0_10px_20px_rgba(212, 175, 55,0.2)] flex cursor-pointer items-center gap-2 rounded-xl px-8 py-3.5 text-xs font-bold tracking-wider uppercase transition-transform hover:-translate-y-1"
        >
          <Plus className="h-4 w-4" /> Start New Campaign
        </button>
      </div>
    );
  }

  return (
    <div className="border-brand-gold/30 shadow-[0_0_40px_rgba(212, 175, 55,0.15)] relative rounded-3xl border bg-white p-8 dark:bg-[#0a0a0f]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
        <div className="bg-brand-gold/10 absolute -top-32 -right-32 h-96 w-96 rounded-full blur-[100px]" />
        <div className="bg-brand-gold/5 absolute -bottom-32 -left-32 h-96 w-96 rounded-full blur-[100px]" />
      </div>
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1 space-y-4">
          <div className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold tracking-widest uppercase backdrop-blur-md">
            <span className="bg-brand-gold h-2 w-2 animate-pulse rounded-full" /> Ready for Draw
          </div>
          <h2 className="font-serif text-4xl font-bold text-slate-900 dark:text-white">
            {activeLottery.title}
          </h2>
          <p className="max-w-2xl text-base text-slate-600 dark:text-gray-400">
            {activeLottery.description || 'No description provided.'}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-sm font-medium text-slate-600 dark:text-gray-400">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/5 dark:bg-white/5">
              <div className="bg-brand-gold/20 text-brand-gold flex h-10 w-10 items-center justify-center rounded-xl">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                  {activeParticipantsCount}
                </div>
                <div className="text-[10px] tracking-wider text-slate-500 uppercase dark:text-gray-500">
                  Participants
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/5 dark:bg-white/5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-white">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                  {new Date(activeLottery.created_at).toLocaleDateString()}
                </div>
                <div className="text-[10px] tracking-wider text-slate-500 uppercase dark:text-gray-500">
                  Creation Date
                </div>
              </div>
            </div>
          </div>

          {activeWinners.length === 0 && (
            <div className="mt-6 max-w-lg space-y-4 border-t border-slate-100 pt-6 dark:border-white/5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-gray-500">
                  Choose Drawing Method
                </label>
                <div className="inline-flex w-full rounded-xl bg-slate-100 p-1 dark:bg-white/5">
                  <button
                    type="button"
                    onClick={() => onDrawMethodChange('random')}
                    className={`flex-1 cursor-pointer rounded-lg py-2.5 text-xs font-bold transition-all ${
                      drawMethod === 'random'
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white'
                        : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    Random Draw
                  </button>
                  <button
                    type="button"
                    onClick={() => onDrawMethodChange('manual')}
                    className={`flex-1 cursor-pointer rounded-lg py-2.5 text-xs font-bold transition-all ${
                      drawMethod === 'manual'
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white'
                        : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    Predetermined Winner
                  </button>
                </div>
              </div>
              {drawMethod === 'manual' && (
                <div className="space-y-3">
                  <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-gray-500">
                    Search & Select Predetermined Winner
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Search className="h-4 w-4 text-slate-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="text"
                      value={dbParticipantsSearch}
                      onChange={(e) => onDbParticipantsSearchChange(e.target.value)}
                      placeholder="Search by name or ticket number..."
                      className="focus:border-brand-gold/50 focus:ring-brand-gold/50 w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm transition-all outline-none placeholder:text-slate-400 focus:ring-1 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                    {dbParticipantsLoading && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
                      </div>
                    )}
                  </div>
                  {dbParticipantsSearch.trim() && dbParticipants.length > 0 && (
                    <div className="relative">
                      <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-[#0c0c12]">
                        {dbParticipants.map((participant: any) => (
                          <button
                            key={participant.id}
                            type="button"
                            onClick={() => onSelectPredeterminedWinner(participant)}
                            className="flex w-full cursor-pointer items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                          >
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {participant.name}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-gray-400">
                                {participant.email || participant.phone || 'No contact info'}
                              </div>
                            </div>
                            <div className="border-brand-gold/30 text-brand-gold bg-brand-gold/5 rounded-md border px-2 py-0.5 font-mono text-xs font-bold">
                              {participant.ticket_number}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {dbParticipantsSearch.trim() &&
                    dbParticipants.length === 0 &&
                    !dbParticipantsLoading && (
                      <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 dark:border-white/10 dark:text-gray-500">
                        No participants matched your search.
                      </div>
                    )}
                  {selectedPredeterminedWinners.length > 0 && (
                    <div className="border-brand-gold/30 bg-brand-gold/5 space-y-2 rounded-xl border p-4 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-brand-gold/20 text-brand-gold flex h-8 w-8 items-center justify-center rounded-lg">
                            <Trophy className="h-4 w-4" />
                          </div>
                          <div className="text-xs text-slate-500 dark:text-gray-400">
                            {selectedPredeterminedWinners.length} Selected Winner
                            {selectedPredeterminedWinners.length > 1 ? 's' : ''}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={onClearPredeterminedWinners}
                          className="cursor-pointer text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                      {selectedPredeterminedWinners.map((sw: any) => (
                        <div key={sw.id} className="flex items-center justify-between pl-11">
                          <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {sw.name}{' '}
                            <span className="font-mono text-xs font-semibold text-slate-400">
                              ({sw.ticket_number})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemovePredeterminedWinner(sw.id)}
                            className="cursor-pointer text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-4 self-center lg:mt-16 lg:self-start">
          {activeWinners.length > 0 ? (
            <div className="border-brand-gold/30 flex flex-col items-center justify-center gap-4 rounded-3xl border bg-gradient-to-b from-slate-50 to-white p-8 shadow-2xl dark:from-[#1a1a24] dark:to-[#0a0a0f]">
              <div className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold shadow-[0_0_20px_rgba(212, 175, 55,0.3)] flex h-16 w-16 items-center justify-center rounded-full border">
                <Trophy className="h-8 w-8" />
              </div>
              <div className="text-center">
                <div className="text-brand-gold mb-1 text-[10px] font-bold tracking-widest uppercase">
                  {activeWinners.length === 1
                    ? 'Winner Declared'
                    : `${activeWinners.length} Winners Declared`}
                </div>
                {activeWinners.map((w: any, idx: number) => (
                  <div key={w.id}>
                    {activeWinners.length > 1 && (
                      <div className="mb-0.5 text-[9px] font-medium tracking-widest text-slate-400 uppercase dark:text-slate-500">
                        Winner #{idx + 1}
                      </div>
                    )}
                    <div className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                      {w.name}
                    </div>
                    <div className="mt-1 inline-block rounded bg-slate-100 px-3 py-1 font-mono text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-gray-300">
                      {w.ticket_number}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={onResetDraw}
                disabled={isPending}
                className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-6 py-2.5 text-xs font-bold tracking-wider text-slate-600 uppercase transition-all hover:bg-slate-200 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} /> Reset Draw
              </button>
            </div>
          ) : (
            <button
              onClick={onExecuteDraw}
              disabled={
                isPending || (drawMethod === 'manual' && selectedPredeterminedWinners.length === 0)
              }
              className="group bg-brand-gold text-brand-navy hover:shadow-[0_0_40px_rgba(212, 175, 55,0.6)] relative flex cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-2xl px-10 py-6 text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              <div className="absolute inset-0 flex h-full w-full [transform:skew(-12deg)_translateX(-100%)] justify-center group-hover:[transform:skew(-12deg)_translateX(100%)] group-hover:duration-1000">
                <div className="relative h-full w-8 bg-white/30" />
              </div>
              <Play className="fill-brand-navy h-6 w-6" />{' '}
              {drawMethod === 'manual' ? 'Execute Preset Draw' : 'Execute Live Draw'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
