'use client';

import { useState, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/src/lib/supabase/client';
import { createLotteryCampaign } from '@/src/lib/lottery/campaignHelpers';
import { useAuthStore } from '@/src/stores/authStore';
import { useLotteryData } from '@/src/components/admin/lottery/hooks/useLotteryData';
import { useParticipantManagement } from '@/src/components/admin/lottery/hooks/useParticipantManagement';
import { useScheduleDraw } from '@/src/components/admin/lottery/hooks/useScheduleDraw';
import { EditCampaignModal } from '@/src/components/admin/lottery/modals/EditCampaignModal';
import { ViewParticipantsModal } from '@/src/components/admin/lottery/modals/ViewParticipantsModal';
import { BulkEmailModal } from '@/src/components/admin/lottery/modals/BulkEmailModal';
import { DeleteConfirmModal } from '@/src/components/admin/lottery/modals/DeleteConfirmModal';
import { DashboardPanel } from '@/src/components/admin/lottery/DashboardPanel';
import { HistoryTable } from '@/src/components/admin/lottery/HistoryTable';
import { PublicBroadcastCard } from '@/src/components/admin/lottery/PublicBroadcastCard';
import { CreateLotteryWizard } from '@/src/components/admin/lottery/CreateLotteryWizard';

export default function AdminLotteryPage() {
  const { token } = useAuthStore();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create'>('dashboard');

  // ── Extracted Hooks ─────────────────────────────────────────────────────
  const {
    lotteries,
    activeLottery,
    activeParticipantsCount,
    activeWinners,
    lotteryVisible,
    visibilityLoading,
    visibilityPending,
    syncing,
    errorMessage,
    successMessage,
    fetchLotteries,
    toggleLotteryVisibility,
    handleSyncExisting,
    drawWinner,
    resetDraw,
    setErrorMessage,
    setSuccessMessage,
  } = useLotteryData();

  const {
    participants,
    dragOver,
    searchTerm,
    currentPage,
    itemsPerPage,
    entryMethod,
    manualName,
    manualPhone,
    manualEmail,
    manualTicket,
    setDragOver,
    setSearchTerm,
    setCurrentPage,
    setEntryMethod,
    setManualName,
    setManualPhone,
    setManualEmail,
    setManualTicket,
    setParticipants,
    handleFileUpload,
    handleManualAdd,
    removeParticipant,
    paginatedParticipants,
    totalPages,
    fileInputRef,
  } = useParticipantManagement();

  const { fetchSchedule, resetScheduleState } = useScheduleDraw();

  // ── Wizard State ────────────────────────────────────────────────────────
  const [wizardStep, setWizardStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // ── Predetermined Winner Selection ──────────────────────────────────────
  const [drawMethod, setDrawMethod] = useState<'random' | 'manual'>('manual');
  const [selectedPredeterminedWinners, setSelectedPredeterminedWinners] = useState<any[]>([]);
  const [dbParticipants, setDbParticipants] = useState<any[]>([]);
  const [dbParticipantsSearch, setDbParticipantsSearch] = useState('');
  const [dbParticipantsLoading, setDbParticipantsLoading] = useState(false);

  // ── Modal Triggers ──────────────────────────────────────────────────────
  const [editingLottery, setEditingLottery] = useState<any>(null);
  const [viewingLottery, setViewingLottery] = useState<any>(null);
  const [emailModalLottery, setEmailModalLottery] = useState<any>(null);
  const [deletingLotteryId, setDeletingLotteryId] = useState<string | null>(null);

  // ── Effects ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeLottery && token) {
      fetchSchedule(activeLottery.id, token);
    } else {
      resetScheduleState();
    }
  }, [activeLottery, token, fetchSchedule, resetScheduleState]);

  const fetchDbParticipants = async (searchQuery: string = '') => {
    if (!activeLottery) return;
    setDbParticipantsLoading(true);
    try {
      let query = supabase
        .from('lottery_participants')
        .select('id, name, ticket_number, phone, email')
        .eq('lottery_id', activeLottery.id);
      if (searchQuery.trim()) {
        query = query.or(
          `name.ilike.%${searchQuery.trim()}%,ticket_number.ilike.%${searchQuery.trim()}%`
        );
      }
      const { data, error } = await query.limit(10);
      if (error) throw error;
      setDbParticipants(data || []);
    } catch (err) {
      console.error('Error fetching participants for search:', err);
    } finally {
      setDbParticipantsLoading(false);
    }
  };

  useEffect(() => {
    if (!activeLottery || drawMethod !== 'manual') {
      setDbParticipants([]);
      return;
    }
    const timer = setTimeout(() => fetchDbParticipants(dbParticipantsSearch), 300);
    return () => clearTimeout(timer);
  }, [activeLottery, drawMethod, dbParticipantsSearch]);

  useEffect(() => {
    setSelectedPredeterminedWinners([]);
    setDbParticipantsSearch('');
  }, [activeLottery, drawMethod]);

  // ── Save Lottery to DB ──────────────────────────────────────────────────
  const saveLotteryToDB = async () => {
    if (!title.trim()) {
      setErrorMessage('Please enter a title for the lottery.');
      return;
    }
    if (participants.length === 0) {
      setErrorMessage('Please upload a spreadsheet with participants first.');
      return;
    }

    startTransition(async () => {
      try {
        setErrorMessage(null);
        setSuccessMessage(null);
        if (activeLottery) {
          const { error: deactivateError } = await supabase
            .from('lotteries')
            .update({ status: 'inactive' })
            .eq('id', activeLottery.id);
          if (deactivateError) throw deactivateError;
        }
        const { data: newLottery, error: createError } = await supabase
          .from('lotteries')
          .insert({
            title: title.trim(),
            description: description.trim() || null,
            status: 'active',
          })
          .select()
          .single();
        if (createError) throw createError;

        const participantsData = participants.map((p) => ({
          lottery_id: newLottery.id,
          name: p.name,
          phone: p.phone || null,
          email: p.email || null,
          ticket_number: p.ticketNumber,
          is_winner: false,
        }));
        const chunkSize = 100;
        for (let i = 0; i < participantsData.length; i += chunkSize) {
          const { error: insertError } = await supabase
            .from('lottery_participants')
            .insert(participantsData.slice(i, i + chunkSize));
          if (insertError) throw insertError;
        }
        setTitle('');
        setDescription('');
        setParticipants([]);
        setWizardStep(1);
        setSuccessMessage('New active lottery created successfully! Live drawing is ready.');
        setActiveTab('dashboard');
        fetchLotteries();

        createLotteryCampaign(newLottery, token)
          .then((ok) => {
            if (!ok) {
              setErrorMessage(
                'Lottery created, but linked email campaign failed. Use "Sync to EmailCenter" to retry.'
              );
            }
          })
          .catch(() => {
            setErrorMessage(
              'Lottery created, but linked email campaign failed. Use "Sync to EmailCenter" to retry.'
            );
          });
      } catch (error: any) {
        console.error('Error saving lottery:', error);
        setErrorMessage(error.message || 'Failed to save the lottery draw.');
      }
    });
  };

  // ── Wizard Navigation ───────────────────────────────────────────────────
  const handleNextWizardStep = () => {
    if (wizardStep === 1 && !title.trim()) {
      setErrorMessage('Title is required to proceed.');
      return;
    }
    setErrorMessage(null);
    setWizardStep((s) => Math.min(s + 1, 3));
  };
  const handlePrevWizardStep = () => setWizardStep((s) => Math.max(s - 1, 1));

  // ── Execute Draw ────────────────────────────────────────────────────────
  const handleDrawWinner = () => {
    drawWinner(
      token!,
      activeLottery!.id,
      drawMethod === 'manual' ? selectedPredeterminedWinners.map((w) => w.id) : undefined
    );
  };

  const handleStatusChange = async (
    lotteryId: string,
    newStatus: 'active' | 'completed' | 'inactive'
  ) => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      const { error } = await supabase
        .from('lotteries')
        .update({ status: newStatus })
        .eq('id', lotteryId);

      if (error) throw error;
      setSuccessMessage(`Campaign status successfully updated to ${newStatus.toUpperCase()}.`);
      fetchLotteries();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update campaign status.');
    }
  };

  return (
    <>
      <div className="space-y-8 pb-12 text-slate-900 transition-colors duration-300 dark:text-slate-100">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end dark:border-white/5">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Command Center: <span className="text-brand-gold italic">Lottery</span>
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
              Launch massive lucky draws, manage high-stakes prizes, and broadcast live winner
              reveals.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`cursor-pointer rounded-xl border px-5 py-2.5 text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                activeTab === 'dashboard'
                  ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/30 shadow-[0_0_15px_rgba(212, 175, 55,0.1)]'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:border-white/5 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab('create');
                setWizardStep(1);
              }}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-5 py-2.5 text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                activeTab === 'create'
                  ? 'bg-brand-gold text-brand-navy border-brand-gold shadow-[0_0_20px_rgba(212, 175, 55,0.3)]'
                  : 'bg-brand-gold/10 text-brand-gold border-brand-gold/20 hover:bg-brand-gold/20'
              }`}
            >
              <Plus className="h-4 w-4" /> New Lottery
            </button>
            <button
              onClick={() => token && handleSyncExisting(token)}
              disabled={syncing || !token}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-blue-300 bg-blue-50 px-5 py-2.5 text-xs font-bold tracking-wider text-blue-700 uppercase transition-all duration-300 hover:bg-blue-100 disabled:opacity-50 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
            >
              {syncing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" /> Sync to EmailCenter
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Messages */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              key="error-banner"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 shadow-lg backdrop-blur-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMessage}</span>
              <button
                onClick={() => setErrorMessage(null)}
                aria-label="Dismiss error"
                className="ml-auto text-red-400 hover:text-red-600 dark:hover:text-white"
              >
                ✕
              </button>
            </motion.div>
          )}
          {successMessage && (
            <motion.div
              key="success-banner"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700 shadow-lg backdrop-blur-sm dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>{successMessage}</span>
              </div>
              {successMessage.toLowerCase().includes('created') && (
                <a
                  href="/lottery"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-100 px-4 py-2 text-xs font-bold tracking-wide text-green-800 transition-all hover:bg-green-200 dark:border-green-500/40 dark:bg-green-500/20 dark:text-green-300 dark:hover:bg-green-500/30"
                >
                  Launch Arena ↗
                </a>
              )}
              <button
                onClick={() => setSuccessMessage(null)}
                aria-label="Dismiss success message"
                className="ml-4 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-white"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Public Live Broadcast Control */}
        <PublicBroadcastCard
          lotteryVisible={lotteryVisible}
          visibilityLoading={visibilityLoading}
          visibilityPending={visibilityPending}
          onToggleVisibility={toggleLotteryVisibility}
        />

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <DashboardPanel
              activeLottery={activeLottery}
              activeParticipantsCount={activeParticipantsCount}
              activeWinners={activeWinners}
              drawMethod={drawMethod}
              isPending={isPending}
              dbParticipants={dbParticipants}
              dbParticipantsSearch={dbParticipantsSearch}
              dbParticipantsLoading={dbParticipantsLoading}
              selectedPredeterminedWinners={selectedPredeterminedWinners}
              onDrawMethodChange={setDrawMethod}
              onExecuteDraw={handleDrawWinner}
              onResetDraw={() => activeLottery && resetDraw(activeLottery.id)}
              onDbParticipantsSearchChange={setDbParticipantsSearch}
              onSelectPredeterminedWinner={(participant) => {
                setSelectedPredeterminedWinners((prev) => {
                  const exists = prev.find((w) => w.id === participant.id);
                  return exists
                    ? prev.filter((w: any) => w.id !== participant.id)
                    : [...prev, participant];
                });
                setDbParticipantsSearch('');
              }}
              onRemovePredeterminedWinner={(id) =>
                setSelectedPredeterminedWinners((prev) => prev.filter((w: any) => w.id !== id))
              }
              onClearPredeterminedWinners={() => setSelectedPredeterminedWinners([])}
              onCreateNew={() => {
                setActiveTab('create');
                setWizardStep(1);
              }}
            />

            <HistoryTable
              lotteries={lotteries}
              isPending={isPending}
              onViewParticipants={setViewingLottery}
              onEditCampaign={setEditingLottery}
              onEmailParticipants={setEmailModalLottery}
              onResetDraw={(id) => resetDraw(id)}
              onDelete={(id) => setDeletingLotteryId(id)}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <CreateLotteryWizard
            wizardStep={wizardStep}
            title={title}
            description={description}
            participants={participants}
            searchTerm={searchTerm}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            entryMethod={entryMethod}
            dragOver={dragOver}
            manualName={manualName}
            manualPhone={manualPhone}
            manualEmail={manualEmail}
            manualTicket={manualTicket}
            totalPages={totalPages}
            fileInputRef={fileInputRef}
            isPending={isPending}
            paginatedParticipants={paginatedParticipants}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onSearchTermChange={setSearchTerm}
            onCurrentPageChange={setCurrentPage}
            onEntryMethodChange={setEntryMethod}
            onManualNameChange={setManualName}
            onManualPhoneChange={setManualPhone}
            onManualEmailChange={setManualEmail}
            onManualTicketChange={setManualTicket}
            onDragOverChange={setDragOver}
            onFileUpload={(file) => handleFileUpload(file, setErrorMessage, setSuccessMessage)}
            onManualAdd={() => handleManualAdd(setErrorMessage, setSuccessMessage)}
            onRemoveParticipant={removeParticipant}
            onSetErrorMessage={setErrorMessage}
            onSetSuccessMessage={setSuccessMessage}
            onPrevStep={handlePrevWizardStep}
            onNextStep={handleNextWizardStep}
            onSubmit={saveLotteryToDB}
          />
        )}
      </div>

      {/* Modals */}
      <EditCampaignModal
        open={!!editingLottery}
        lottery={editingLottery}
        onClose={() => setEditingLottery(null)}
        onSaved={fetchLotteries}
        onError={setErrorMessage}
        onSuccess={setSuccessMessage}
      />
      <ViewParticipantsModal
        open={!!viewingLottery}
        lottery={viewingLottery}
        onClose={() => setViewingLottery(null)}
        onOpenEmail={(l) => {
          setViewingLottery(null);
          setEmailModalLottery(l);
        }}
      />
      <BulkEmailModal
        open={!!emailModalLottery}
        lottery={emailModalLottery}
        onClose={() => setEmailModalLottery(null)}
        token={token!}
        onSuccess={setSuccessMessage}
        onError={setErrorMessage}
      />
      <DeleteConfirmModal
        open={!!deletingLotteryId}
        lotteryId={deletingLotteryId}
        onClose={() => setDeletingLotteryId(null)}
        token={token!}
        onSuccess={setSuccessMessage}
        onError={setErrorMessage}
        onDeleted={fetchLotteries}
      />
    </>
  );
}
