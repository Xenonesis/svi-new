'use client';

import { useState, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  RefreshCw,
  Globe,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Send,
} from 'lucide-react';
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
import { WizardProgress } from '@/src/components/admin/lottery/wizard/WizardProgress';
import { LotteryDetailsForm } from '@/src/components/admin/lottery/wizard/LotteryDetailsForm';
import { ParticipantUpload } from '@/src/components/admin/lottery/wizard/ParticipantUpload';
import { LotteryReview } from '@/src/components/admin/lottery/wizard/LotteryReview';
import { ScheduleDrawPanel } from '@/src/components/admin/lottery/ScheduleDrawPanel';
import { DashboardPanel } from '@/src/components/admin/lottery/DashboardPanel';
import { HistoryTable } from '@/src/components/admin/lottery/HistoryTable';

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
    filteredParticipants,
    paginatedParticipants,
    totalPages,
    fileInputRef,
  } = useParticipantManagement();

  const {
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
  } = useScheduleDraw();

  // ── Wizard State ────────────────────────────────────────────────────────
  const [wizardStep, setWizardStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // ── Predetermined Winner Selection ──────────────────────────────────────
  const [drawMethod, setDrawMethod] = useState<'random' | 'manual'>('random');
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
  }, [activeLottery, token]);

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

  return (
    <>
      <div className="space-y-8 pb-12 text-slate-900 transition-colors duration-300 dark:text-slate-100">
        {/* ══ HEADER ═════════════════════════════════════════════════════ */}
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

        {/* ══ MESSAGES ═══════════════════════════════════════════════════ */}
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
                className="ml-4 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-white"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══ VISIBILITY CONTROL ════════════════════════════════════════ */}
        <div
          className={`relative overflow-hidden rounded-3xl border p-6 transition-all duration-500 ${lotteryVisible ? 'border-brand-gold/40 to-brand-gold/5 shadow-[0_0_30px_rgba(212, 175, 55,0.1)] dark:from-brand-dark-surface bg-gradient-to-br from-white' : 'dark:bg-brand-dark-surface/50 border-slate-200 bg-white dark:border-white/10'}`}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-colors ${lotteryVisible ? 'bg-brand-gold/20 text-brand-gold' : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-gray-500'}`}
              >
                <Globe className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                  Public Live Broadcast
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
                  {lotteryVisible
                    ? 'The Lottery Arena is LIVE and broadcasting to all public visitors.'
                    : 'The Arena is offline. Public visitors cannot see the drawing.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:shrink-0">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase ${lotteryVisible ? 'border border-green-200 bg-green-50 text-green-600 dark:border-green-500/30 dark:bg-green-500/15 dark:text-green-400' : 'border border-slate-200 bg-slate-50 text-slate-500 dark:border-white/5 dark:bg-white/5 dark:text-gray-500'}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${lotteryVisible ? 'animate-pulse bg-green-500 shadow-[0_0_10px_#4ade80] dark:bg-green-400' : 'bg-slate-400 dark:bg-gray-500'}`}
                />
                {visibilityLoading
                  ? 'Checking...'
                  : lotteryVisible
                    ? 'Broadcasting Live'
                    : 'Offline'}
              </span>
              <button
                onClick={() => toggleLotteryVisibility(!lotteryVisible)}
                disabled={visibilityLoading || visibilityPending}
                className={`focus-visible:ring-brand-gold relative inline-flex h-9 w-16 shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-300 focus:outline-none focus-visible:ring-2 disabled:opacity-50 ${lotteryVisible ? 'border-brand-gold bg-brand-gold shadow-[0_0_15px_rgba(212, 175, 55,0.5)]' : 'border-slate-300 bg-slate-200 dark:border-white/10 dark:bg-white/5'}`}
              >
                <span
                  className={`inline-block h-6 w-6 rounded-full shadow-md transition-all duration-300 ${lotteryVisible ? 'translate-x-8 bg-white dark:bg-[#0a0a0f]' : 'translate-x-1 bg-white dark:bg-gray-500'}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ══ SCHEDULE DRAW PANEL ═══════════════════════════════════════ */}
        {activeLottery && activeLottery.status === 'active' && activeWinners.length === 0 && (
          <ScheduleDrawPanel
            scheduleInputIST={scheduleInputIST}
            preNotifyMinutes={preNotifyMinutes}
            showCountdown={showCountdown}
            includeCountdownInEmail={includeCountdownInEmail}
            scheduleSaving={scheduleSaving}
            scheduleLoading={scheduleLoading}
            existingSchedule={existingSchedule}
            onScheduleInputChange={setScheduleInputIST}
            onPreNotifyChange={setPreNotifyMinutes}
            onShowCountdownChange={setShowCountdown}
            onIncludeCountdownInEmailChange={setIncludeCountdownInEmail}
            onSaveSchedule={() =>
              activeLottery &&
              token &&
              handleSaveSchedule(activeLottery.id, token, setErrorMessage, setSuccessMessage)
            }
            onCancelSchedule={() =>
              activeLottery &&
              token &&
              handleCancelSchedule(activeLottery.id, token, setErrorMessage, setSuccessMessage)
            }
            onQuickTimeSelect={(_, mins) =>
              setScheduleInputIST(getISTString(new Date(Date.now() + mins * 60000)))
            }
          />
        )}

        {/* ══ DASHBOARD TAB ═════════════════════════════════════════════ */}
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
            />
          </div>
        )}

        {/* ══ CREATE TAB ════════════════════════════════════════════════ */}
        {activeTab === 'create' && (
          <div className="dark:bg-brand-dark-surface/80 mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl backdrop-blur-xl md:p-12 dark:border-white/10 dark:shadow-2xl">
            <WizardProgress currentStep={wizardStep} />

            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {wizardStep === 1 && (
                  <LotteryDetailsForm
                    title={title}
                    description={description}
                    onTitleChange={setTitle}
                    onDescriptionChange={setDescription}
                  />
                )}
                {wizardStep === 2 && (
                  <ParticipantUpload
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
                    onSearchTermChange={setSearchTerm}
                    onCurrentPageChange={setCurrentPage}
                    onEntryMethodChange={setEntryMethod}
                    onManualNameChange={setManualName}
                    onManualPhoneChange={setManualPhone}
                    onManualEmailChange={setManualEmail}
                    onManualTicketChange={setManualTicket}
                    onDragOverChange={setDragOver}
                    onFileUpload={(file) =>
                      handleFileUpload(file, setErrorMessage, setSuccessMessage)
                    }
                    onManualAdd={() => handleManualAdd(setErrorMessage, setSuccessMessage)}
                    onRemoveParticipant={removeParticipant}
                    onSetErrorMessage={setErrorMessage}
                    onSetSuccessMessage={setSuccessMessage}
                    paginatedParticipants={paginatedParticipants}
                  />
                )}
                {wizardStep === 3 && (
                  <LotteryReview
                    title={title}
                    description={description}
                    participantCount={participants.length}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Wizard Navigation Buttons */}
            <div className="mt-10 flex items-center justify-between">
              <button
                onClick={handlePrevWizardStep}
                disabled={wizardStep === 1}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-30 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-gray-500">
                  {[1, 2, 3].map((s) => (
                    <span
                      key={s}
                      className={`h-1.5 w-1.5 rounded-full ${wizardStep >= s ? 'bg-brand-gold' : 'bg-slate-300 dark:bg-gray-600'}`}
                    />
                  ))}
                </div>
                {wizardStep < 3 ? (
                  <button
                    onClick={handleNextWizardStep}
                    className="bg-brand-gold text-brand-navy inline-flex cursor-pointer items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold transition-all hover:opacity-90"
                  >
                    Continue <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={saveLotteryToDB}
                    disabled={isPending}
                    className="bg-brand-gold text-brand-navy inline-flex cursor-pointer items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold tracking-wider uppercase transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    {isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Deploy Campaign
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══ MODALS ═════════════════════════════════════════════════════ */}
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
        onClose={() => {
          setDeletingLotteryId(null);
        }}
        token={token!}
        onSuccess={setSuccessMessage}
        onError={setErrorMessage}
        onDeleted={fetchLotteries}
      />
    </>
  );
}
