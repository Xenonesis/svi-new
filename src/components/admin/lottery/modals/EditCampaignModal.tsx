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
  const [addingWinner, setAddingWinner] = useState(false);
  const [winnerSearch, setWinnerSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
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
    setWinnerName('');
    setWinnerTicket('');
    setWinnerPhone('');
    setWinnerEmail('');
    setWinnerSearch('');
    setShowDropdown(false);
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

  const handleAddWinner = async () => {
    if (!lottery || !winnerName.trim() || !winnerTicket.trim()) return;
    setAddingWinner(true);
    try {
      // Check if ticket number matches existing participant (case-insensitive)
      const existingPart = participants.find(
        (p) => p.ticket_number.toLowerCase() === winnerTicket.trim().toLowerCase()
      );

      if (existingPart) {
        // Update existing participant to winner
        const { error } = await supabase
          .from('lottery_participants')
          .update({
            is_winner: true,
            name: winnerName.trim(),
            phone: winnerPhone.trim() || existingPart.phone || null,
            email: winnerEmail.trim() || existingPart.email || null,
          })
          .eq('id', existingPart.id);

        if (error) throw error;

        setParticipants((prev) =>
          prev.map((p) =>
            p.id === existingPart.id
              ? {
                  ...p,
                  is_winner: true,
                  name: winnerName.trim(),
                  phone: winnerPhone.trim() || existingPart.phone || null,
                  email: winnerEmail.trim() || existingPart.email || null,
                }
              : p
          )
        );
        onSuccess('Existing participant updated and marked as winner!');
      } else {
        // Create new participant with is_winner: true
        const { data, error } = await supabase
          .from('lottery_participants')
          .insert({
            lottery_id: lottery.id,
            name: winnerName.trim(),
            ticket_number: winnerTicket.trim(),
            phone: winnerPhone.trim() || null,
            email: winnerEmail.trim() || null,
            is_winner: true,
          })
          .select('id, name, ticket_number, phone, email, is_winner')
          .single();

        if (error) throw error;

        setParticipants((prev) => [...prev, data]);
        onSuccess('Winner created successfully!');
      }

      // Reset inputs
      setWinnerName('');
      setWinnerTicket('');
      setWinnerPhone('');
      setWinnerEmail('');
    } catch (err: any) {
      onError(err.message || 'Failed to add winner.');
    } finally {
      setAddingWinner(false);
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
            <div className="flex gap-2 border-b border-gray-200 bg-slate-50/50 p-2 dark:border-gray-700 dark:bg-black/20">
              {(['details', 'winner', 'participants'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 cursor-pointer rounded-lg py-2.5 text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                    tab === t
                      ? 'bg-brand-gold text-brand-navy dark:text-brand-navy dark:bg-brand-gold font-extrabold shadow-sm'
                      : 'text-gray-400 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
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
                                  p.ticket_number
                                    .toLowerCase()
                                    .includes(winnerSearch.toLowerCase()))
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
                                  <div className="font-semibold text-slate-900 dark:text-white">
                                    {p.name}
                                  </div>
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
                    Use "Add Winner" to designate a participant as a winner. You can also toggle
                    winners in the Participants tab.
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

            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.02);
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(212, 175, 55, 0.25);
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(212, 175, 55, 0.45);
              }
            `}</style>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
