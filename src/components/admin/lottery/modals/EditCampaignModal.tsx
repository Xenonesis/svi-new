'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Trophy, Users, RefreshCw, Edit2, Award, Search } from 'lucide-react';
import { supabase } from '@/src/lib/supabase/client';
import { syncLinkedCampaignTitle } from '@/src/lib/lottery/campaignHelpers';
import type { Lottery, DbParticipant } from '../types';

interface EditCampaignModalProps {
  open: boolean;
  lottery: Lottery | null;
  onClose: () => void;
  onSaved: () => void;
  onError: (msg: string | null) => void;
  onSuccess: (msg: string | null) => void;
}

export function EditCampaignModal({
  open,
  lottery,
  onClose,
  onSaved,
  onError,
  onSuccess,
}: EditCampaignModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'completed' | 'inactive'>('active');
  const [winnerName, setWinnerName] = useState('');
  const [winnerTicket, setWinnerTicket] = useState('');
  const [winnerPhone, setWinnerPhone] = useState('');
  const [winnerEmail, setWinnerEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'details' | 'winner' | 'participants'>('details');
  const [participants, setParticipants] = useState<DbParticipant[]>([]);
  const [partsLoading, setPartsLoading] = useState(false);
  const [partsSearch, setPartsSearch] = useState('');

  // Add participant
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addTicket, setAddTicket] = useState('');
  const [addSaving, setAddSaving] = useState(false);

  // Edit participant inline
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTicket, setEditTicket] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const loadParticipants = async (l: Lottery) => {
    setPartsLoading(true);
    const { data } = await supabase
      .from('lottery_participants')
      .select('id, name, ticket_number, phone, email, is_winner')
      .eq('lottery_id', l.id)
      .order('is_winner', { ascending: false })
      .order('name');
    setParticipants(data || []);
    setPartsLoading(false);
  };

  // Initialize state when lottery changes
  if (lottery && !saving && !partsLoading && title !== lottery.title) {
    setTitle(lottery.title);
    setDescription(lottery.description || '');
    setStatus(lottery.status);
    setWinnerName(lottery.winner?.name || '');
    setWinnerTicket(lottery.winner?.ticket_number || '');
    setWinnerPhone(lottery.winner?.phone || '');
    setWinnerEmail(lottery.winner?.email || '');
    setTab('details');
    setPartsSearch('');
    setEditId(null);
    setEditName('');
    setEditTicket('');
    setEditPhone('');
    setEditEmail('');
    loadParticipants(lottery);
  }

  const handleSave = async () => {
    if (!lottery || !title.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('lotteries')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          status,
        })
        .eq('id', lottery.id);
      if (error) throw error;
      await syncLinkedCampaignTitle(supabase, lottery.id, title.trim());
      onSuccess('Campaign updated successfully.');
      onClose();
      onSaved();
    } catch (err: any) {
      onError(err.message || 'Failed to update campaign.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddParticipant = async () => {
    if (!lottery || !addName.trim() || !addTicket.trim()) return;
    setAddSaving(true);
    try {
      const { data, error } = await supabase
        .from('lottery_participants')
        .insert({
          lottery_id: lottery.id,
          name: addName.trim(),
          ticket_number: addTicket.trim(),
          phone: addPhone.trim() || null,
          email: addEmail.trim() || null,
          is_winner: false,
        })
        .select('id, name, ticket_number, phone, email, is_winner')
        .single();
      if (error) throw error;
      setParticipants((prev) => [...prev, data]);
      setAddName('');
      setAddTicket('');
      setAddPhone('');
      setAddEmail('');
    } catch (err: any) {
      onError(err.message);
    } finally {
      setAddSaving(false);
    }
  };

  const handleStartEdit = (p: DbParticipant) => {
    setEditId(p.id);
    setEditName(p.name || '');
    setEditTicket(p.ticket_number || '');
    setEditPhone(p.phone || '');
    setEditEmail(p.email || '');
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditName('');
    setEditTicket('');
    setEditPhone('');
    setEditEmail('');
  };

  const handleSaveEdit = async () => {
    if (!lottery || !editId) return;
    if (!editName.trim() || !editTicket.trim()) return;
    setEditSaving(true);
    try {
      const { error } = await supabase
        .from('lottery_participants')
        .update({
          name: editName.trim(),
          ticket_number: editTicket.trim(),
          phone: editPhone.trim() || null,
          email: editEmail.trim() || null,
        })
        .eq('id', editId);
      if (error) throw error;
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === editId
            ? {
                ...p,
                name: editName.trim(),
                ticket_number: editTicket.trim(),
                phone: editPhone.trim() || null,
                email: editEmail.trim() || null,
              }
            : p
        )
      );
      onSuccess('Participant updated.');
      handleCancelEdit();
    } catch (err: any) {
      onError(err.message || 'Failed to update participant.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    try {
      await supabase.from('lottery_participants').delete().eq('id', participantId);
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
    } catch (err: any) {
      onError(err.message);
    }
  };

  const handleToggleWinner = async (participantId: string, current: boolean) => {
    try {
      await supabase
        .from('lottery_participants')
        .update({ is_winner: !current })
        .eq('id', participantId);
      setParticipants((prev) =>
        prev.map((p) => (p.id === participantId ? { ...p, is_winner: !current } : p))
      );
    } catch (err: any) {
      onError(err.message);
    }
  };

  const filteredParticipants = participants.filter(
    (p) =>
      p.name.toLowerCase().includes(partsSearch.toLowerCase()) ||
      p.ticket_number.toLowerCase().includes(partsSearch.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(partsSearch.toLowerCase()))
  );

  return (
    <AnimatePresence>
      {open && lottery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="dark:bg-brand-dark-bg flex w-full max-w-2xl flex-col rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700"
            style={{ maxHeight: '90vh' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-200 p-6 dark:border-gray-700">
              <div>
                <h3 className="text-brand-navy font-serif text-2xl font-bold dark:text-gray-100">
                  Edit Campaign
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Full control — details, status, winner & participants.
                </p>
              </div>
              <button
                onClick={onClose}
                className="hover:text-brand-navy cursor-pointer rounded-md border border-gray-200 p-2 text-gray-400 transition-colors dark:border-gray-700 dark:hover:text-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {(['details', 'winner', 'participants'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 cursor-pointer py-3 text-xs font-bold tracking-wider uppercase transition-colors ${
                    tab === t
                      ? 'border-brand-gold text-brand-navy dark:text-brand-gold border-b-2'
                      : 'hover:text-brand-navy text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  {t === 'details' && (
                    <span className="inline-flex items-center justify-center gap-2">
                      <FileText className="h-3.5 w-3.5" /> Details
                    </span>
                  )}
                  {t === 'winner' && (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Trophy className="h-3.5 w-3.5" /> Winner
                    </span>
                  )}
                  {t === 'participants' && (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Users className="h-3.5 w-3.5" /> Participants ({participants.length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Details Tab */}
              {tab === 'details' && (
                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-gray-400">
                      Campaign Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-gray-400">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-gray-400">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value as 'active' | 'completed' | 'inactive')
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-white/10">
                    <button
                      onClick={onClose}
                      className="cursor-pointer rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || !title.trim()}
                      className="bg-brand-gold text-brand-navy inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all hover:opacity-90 disabled:opacity-50"
                    >
                      {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {/* Winner Tab */}
              {tab === 'winner' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-gray-400">
                        Winner Name
                      </label>
                      <input
                        type="text"
                        value={winnerName}
                        onChange={(e) => setWinnerName(e.target.value)}
                        placeholder="Participant's name"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-gray-400">
                        Ticket Number
                      </label>
                      <input
                        type="text"
                        value={winnerTicket}
                        onChange={(e) => setWinnerTicket(e.target.value)}
                        placeholder="e.g., SVI-1001"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-gray-400">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={winnerPhone}
                        onChange={(e) => setWinnerPhone(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-gray-400">
                        Email
                      </label>
                      <input
                        type="text"
                        value={winnerEmail}
                        onChange={(e) => setWinnerEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>
                  </div>

                  {winnerName && (
                    <div className="border-brand-gold/30 rounded-2xl border bg-amber-50 p-5 dark:bg-amber-500/10">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
                          <Trophy className="text-brand-gold h-7 w-7" />
                        </div>
                        <div>
                          <div className="text-xs font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
                            Winner Preview
                          </div>
                          <div className="font-serif text-xl font-bold text-slate-900 dark:text-white">
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
                    Leave winner name blank to clear existing winner records. Use "Toggle Winner" in
                    the Participants tab for granular control.
                  </p>

                  {/* Current Winners List */}
                  <div className="border-t border-slate-200 pt-4 dark:border-white/10">
                    <h4 className="mb-3 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-gray-400">
                      Current Winners
                    </h4>
                    {participants.filter((p) => p.is_winner).length === 0 ? (
                      <p className="text-xs text-slate-400 italic dark:text-gray-500">
                        No winners marked yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {participants
                          .filter((p) => p.is_winner)
                          .map((wp) => (
                            <div
                              key={wp.id}
                              className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 dark:border-amber-500/30 dark:bg-amber-500/10"
                            >
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {wp.name}
                                </span>
                                <span className="ml-2 font-mono text-xs text-slate-500 dark:text-gray-400">
                                  {wp.ticket_number}
                                </span>
                              </div>
                              <button
                                onClick={() => handleToggleWinner(wp.id, true)}
                                className="cursor-pointer text-xs text-slate-400 hover:text-red-500"
                              >
                                Remove Winner
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Participants Tab */}
              {tab === 'participants' && (
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
                                {p.is_winner && (
                                  <Award className="text-brand-gold h-4 w-4 shrink-0" />
                                )}
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
                          {partsSearch
                            ? 'No participants match your search.'
                            : 'No participants yet.'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
