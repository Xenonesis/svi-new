import { RefreshCw, Award, Edit2, Trophy, X } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import type { DbParticipant } from '../../types';

export interface ParticipantsTabProps {
  participants: DbParticipant[];
  partsLoading: boolean;
  partsSearch: string;
  setPartsSearch: Dispatch<SetStateAction<string>>;
  filteredParticipants: DbParticipant[];
  addName: string;
  setAddName: Dispatch<SetStateAction<string>>;
  addTicket: string;
  setAddTicket: Dispatch<SetStateAction<string>>;
  addPhone: string;
  setAddPhone: Dispatch<SetStateAction<string>>;
  addEmail: string;
  setAddEmail: Dispatch<SetStateAction<string>>;
  addSaving: boolean;
  handleAddParticipant: () => void;
  editId: string | null;
  editName: string;
  setEditName: Dispatch<SetStateAction<string>>;
  editTicket: string;
  setEditTicket: Dispatch<SetStateAction<string>>;
  editSaving: boolean;
  handleStartEdit: (p: DbParticipant) => void;
  handleSaveEdit: () => void;
  handleCancelEdit: () => void;
  handleToggleWinner: (participantId: string, current: boolean) => void;
  handleRemoveParticipant: (participantId: string) => void;
}

export function ParticipantsTab({
  participants,
  partsLoading,
  partsSearch,
  setPartsSearch,
  filteredParticipants,
  addName,
  setAddName,
  addTicket,
  setAddTicket,
  addPhone,
  setAddPhone,
  addEmail,
  setAddEmail,
  addSaving,
  handleAddParticipant,
  editId,
  editName,
  setEditName,
  editTicket,
  setEditTicket,
  editSaving,
  handleStartEdit,
  handleSaveEdit,
  handleCancelEdit,
  handleToggleWinner,
  handleRemoveParticipant,
}: ParticipantsTabProps) {
  return (
    <div className="space-y-4">
      {/* Add new participant */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
        <p className="mb-3 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-gray-400">
          ➕ Add New Participant
        </p>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Full Name *"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white"
          />
          <input
            type="text"
            placeholder="Ticket # *"
            value={addTicket}
            onChange={(e) => setAddTicket(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white"
          />
          <input
            type="text"
            placeholder="Phone"
            value={addPhone}
            onChange={(e) => setAddPhone(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white"
          />
          <input
            type="text"
            placeholder="Email"
            value={addEmail}
            onChange={(e) => setAddEmail(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white"
          />
        </div>
        <button
          onClick={handleAddParticipant}
          disabled={addSaving || !addName.trim() || !addTicket.trim()}
          className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-violet-700 disabled:opacity-50"
        >
          {addSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
          Add Participant
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search name, ticket, email…"
        value={partsSearch}
        onChange={(e) => setPartsSearch(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500"
      />

      {/* Participant List */}
      {partsLoading ? (
        <div className="flex items-center justify-center py-8 text-slate-400">
          <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="space-y-1">
          {filteredParticipants.map((p) => (
            <div
              key={p.id}
              className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm ${
                p.is_winner
                  ? 'border-amber-200 bg-amber-50/50 dark:border-amber-500/20 dark:bg-amber-500/5'
                  : 'border-slate-100 bg-white dark:border-white/5 dark:bg-transparent'
              }`}
            >
              {editId === p.id ? (
                <div className="flex w-full flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs dark:border-white/10 dark:bg-black/40 dark:text-white"
                  />
                  <input
                    type="text"
                    value={editTicket}
                    onChange={(e) => setEditTicket(e.target.value)}
                    className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs dark:border-white/10 dark:bg-black/40 dark:text-white"
                  />
                  <button
                    onClick={handleSaveEdit}
                    disabled={editSaving}
                    className="cursor-pointer rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div>
                      <span
                        className={`font-semibold ${p.is_winner ? 'text-amber-700 dark:text-amber-300' : 'text-slate-900 dark:text-white'}`}
                      >
                        {p.name}
                      </span>
                      <span className="ml-2 font-mono text-xs text-slate-400">
                        {p.ticket_number}
                      </span>
                      {p.email && (
                        <span className="ml-2 hidden text-xs text-slate-400 sm:inline">
                          {p.email}
                        </span>
                      )}
                    </div>
                    {p.is_winner && <Award className="text-brand-gold h-4 w-4 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(p)}
                      className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-gray-300"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleWinner(p.id, !!p.is_winner)}
                      className={`cursor-pointer rounded-lg p-1.5 transition-colors ${
                        p.is_winner
                          ? 'text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-500/20'
                          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-gray-300'
                      }`}
                    >
                      <Trophy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemoveParticipant(p.id)}
                      className="cursor-pointer rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/20"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {filteredParticipants.length === 0 && (
            <p className="py-8 text-center text-xs text-slate-400 italic dark:text-gray-500">
              {partsSearch ? 'No participants match your search.' : 'No participants yet.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
