import { RefreshCw, Trophy, Search } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import type { DbParticipant } from '../../types';

export interface WinnerTabProps {
  participants: DbParticipant[];
  winnerSearch: string;
  setWinnerSearch: Dispatch<SetStateAction<string>>;
  showDropdown: boolean;
  setShowDropdown: Dispatch<SetStateAction<boolean>>;
  winnerName: string;
  setWinnerName: Dispatch<SetStateAction<string>>;
  winnerTicket: string;
  setWinnerTicket: Dispatch<SetStateAction<string>>;
  winnerPhone: string;
  setWinnerPhone: Dispatch<SetStateAction<string>>;
  winnerEmail: string;
  setWinnerEmail: Dispatch<SetStateAction<string>>;
  addingWinner: boolean;
  handleAddWinner: () => void;
  handleToggleWinner: (participantId: string, current: boolean) => void;
}

export function WinnerTab({
  participants,
  winnerSearch,
  setWinnerSearch,
  showDropdown,
  setShowDropdown,
  winnerName,
  setWinnerName,
  winnerTicket,
  setWinnerTicket,
  winnerPhone,
  setWinnerPhone,
  winnerEmail,
  setWinnerEmail,
  addingWinner,
  handleAddWinner,
  handleToggleWinner,
}: WinnerTabProps) {
  return (
    <div className="space-y-5">
      {/* Search Autocomplete */}
      <div>
        <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-gray-400">
          ⚡ Quick Select Existing Participant
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            value={winnerSearch}
            onChange={(e) => {
              setWinnerSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder="Type participant name or ticket to auto-fill details..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm transition-all focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
          {winnerSearch && (
            <button
              onClick={() => {
                setWinnerSearch('');
                setShowDropdown(false);
              }}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:text-gray-500"
            >
              ✕
            </button>
          )}

          {showDropdown && (
            <div className="custom-scrollbar absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-white/10 dark:bg-[#0c0c12]">
              {participants
                .filter(
                  (p) =>
                    !p.is_winner &&
                    (p.name.toLowerCase().includes(winnerSearch.toLowerCase()) ||
                      p.ticket_number.toLowerCase().includes(winnerSearch.toLowerCase()))
                )
                .slice(0, 5)
                .map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setWinnerName(p.name);
                      setWinnerTicket(p.ticket_number);
                      setWinnerPhone(p.phone || '');
                      setWinnerEmail(p.email || '');
                      setWinnerSearch(p.name);
                      setShowDropdown(false);
                    }}
                    className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{p.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-gray-400">
                        {p.email || p.phone || 'No contact info'}
                      </div>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600 dark:border-white/5 dark:bg-white/5">
                      {p.ticket_number}
                    </div>
                  </button>
                ))}
              {participants.filter(
                (p) =>
                  !p.is_winner &&
                  (p.name.toLowerCase().includes(winnerSearch.toLowerCase()) ||
                    p.ticket_number.toLowerCase().includes(winnerSearch.toLowerCase()))
              ).length === 0 && (
                <div className="py-2 text-center text-xs text-slate-400 italic">
                  No matching participants.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Form Container */}
      <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-white/5 dark:bg-white/3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-white/5">
          <h5 className="text-xs font-bold text-slate-500 uppercase dark:text-gray-400">
            Create / Designate Winner
          </h5>
          {(winnerName || winnerTicket) && (
            <button
              onClick={() => {
                setWinnerName('');
                setWinnerTicket('');
                setWinnerPhone('');
                setWinnerEmail('');
                setWinnerSearch('');
              }}
              className="text-[10px] font-bold text-red-500 transition-colors hover:text-red-600"
            >
              Clear Fields
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Winner Name *
            </label>
            <input
              type="text"
              value={winnerName}
              onChange={(e) => setWinnerName(e.target.value)}
              placeholder="Participant's name"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-black/20 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Ticket Number *
            </label>
            <input
              type="text"
              value={winnerTicket}
              onChange={(e) => setWinnerTicket(e.target.value)}
              placeholder="e.g., SVI-1001"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-black/20 dark:text-white"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Phone
            </label>
            <input
              type="text"
              value={winnerPhone}
              onChange={(e) => setWinnerPhone(e.target.value)}
              placeholder="e.g., +91..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-black/20 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Email
            </label>
            <input
              type="text"
              value={winnerEmail}
              onChange={(e) => setWinnerEmail(e.target.value)}
              placeholder="e.g., mail@example.com"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-black/20 dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleAddWinner}
            disabled={addingWinner || !winnerName.trim() || !winnerTicket.trim()}
            className="bg-brand-gold text-brand-navy flex cursor-pointer items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold transition-all hover:opacity-90 disabled:opacity-50"
          >
            {addingWinner ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trophy className="h-4 w-4" />
            )}
            Add Winner
          </button>
        </div>
      </div>

      {winnerName && (
        <div className="border-brand-gold/30 rounded-2xl border bg-amber-50 p-5 dark:bg-amber-500/10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
              <Trophy className="text-brand-gold h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
                Winner Preview
              </div>
              <div className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                {winnerName}
              </div>
              <div className="font-mono text-xs text-slate-500 dark:text-gray-400">
                {winnerTicket || 'No ticket number'}
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="text-[10px] text-slate-400 italic dark:text-gray-500">
        Use "Add Winner" to designate a participant as a winner. You can also toggle winners in the
        Participants tab.
      </p>

      {/* Current Winners List */}
      <div className="border-t border-slate-200 pt-4 dark:border-white/10">
        <h4 className="mb-3 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-gray-400">
          Current Winners
        </h4>
        {participants.filter((p) => p.is_winner).length === 0 ? (
          <p className="text-xs text-slate-400 italic dark:text-gray-500">No winners marked yet.</p>
        ) : (
          <div className="custom-scrollbar max-h-[220px] space-y-2 overflow-y-auto pr-1">
            {participants
              .filter((p) => p.is_winner)
              .map((wp) => (
                <div
                  key={wp.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/40 p-3 transition-all hover:bg-amber-50/70 dark:border-amber-500/25 dark:bg-amber-500/5 dark:hover:bg-amber-500/10"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="text-brand-gold flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
                      <Trophy className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="truncate font-serif text-sm font-bold text-slate-900 dark:text-white">
                        {wp.name}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500 dark:text-gray-400">
                        <span className="py-0.2 rounded bg-amber-100/50 px-1.5 font-mono font-semibold text-slate-600 dark:bg-amber-500/10 dark:text-gray-300">
                          Ticket: {wp.ticket_number}
                        </span>
                        {wp.email && <span className="truncate">{wp.email}</span>}
                        {wp.id && (
                          <span className="font-mono opacity-60">
                            ID: {wp.id.substring(0, 8)}...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleWinner(wp.id, true)}
                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-red-50 text-red-500 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                    title="Remove Winner Status"
                  >
                    ✕
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
