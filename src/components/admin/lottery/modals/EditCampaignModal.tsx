'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Trophy, Users } from 'lucide-react';
import { supabase } from '@/src/lib/supabase/client';
import { syncLinkedCampaignTitle } from '@/src/lib/lottery/campaignHelpers';
import { DetailsTab, WinnerTab, ParticipantsTab } from './EditCampaignTabs';
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
                <DetailsTab
                  title={title}
                  setTitle={setTitle}
                  description={description}
                  setDescription={setDescription}
                  status={status}
                  setStatus={setStatus}
                  saving={saving}
                  onClose={onClose}
                  handleSave={handleSave}
                />
              )}
              {tab === 'winner' && (
                <WinnerTab
                  participants={participants}
                  winnerSearch={winnerSearch}
                  setWinnerSearch={setWinnerSearch}
                  showDropdown={showDropdown}
                  setShowDropdown={setShowDropdown}
                  winnerName={winnerName}
                  setWinnerName={setWinnerName}
                  winnerTicket={winnerTicket}
                  setWinnerTicket={setWinnerTicket}
                  winnerPhone={winnerPhone}
                  setWinnerPhone={setWinnerPhone}
                  winnerEmail={winnerEmail}
                  setWinnerEmail={setWinnerEmail}
                  addingWinner={addingWinner}
                  handleAddWinner={handleAddWinner}
                  handleToggleWinner={handleToggleWinner}
                />
              )}
              {tab === 'participants' && (
                <ParticipantsTab
                  participants={participants}
                  partsLoading={partsLoading}
                  partsSearch={partsSearch}
                  setPartsSearch={setPartsSearch}
                  filteredParticipants={filteredParticipants}
                  addName={addName}
                  setAddName={setAddName}
                  addTicket={addTicket}
                  setAddTicket={setAddTicket}
                  addPhone={addPhone}
                  setAddPhone={setAddPhone}
                  addEmail={addEmail}
                  setAddEmail={setAddEmail}
                  addSaving={addSaving}
                  handleAddParticipant={handleAddParticipant}
                  editId={editId}
                  editName={editName}
                  setEditName={setEditName}
                  editTicket={editTicket}
                  setEditTicket={setEditTicket}
                  editSaving={editSaving}
                  handleStartEdit={handleStartEdit}
                  handleSaveEdit={handleSaveEdit}
                  handleCancelEdit={handleCancelEdit}
                  handleToggleWinner={handleToggleWinner}
                  handleRemoveParticipant={handleRemoveParticipant}
                />
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
