'use client';

import { useState, useEffect, useTransition } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import { createLotteryCampaign } from '@/src/lib/lottery/campaignHelpers';
import { useAuthStore } from '@/src/stores/authStore';
import { useLotteryData } from '@/src/components/admin/lottery/hooks/useLotteryData';
import { useParticipantManagement } from '@/src/components/admin/lottery/hooks/useParticipantManagement';
import { useScheduleDraw } from '@/src/components/admin/lottery/hooks/useScheduleDraw';
import { LotteryHeader } from '@/src/components/admin/lottery/LotteryHeader';
import { LotteryStatusBanners } from '@/src/components/admin/lottery/LotteryStatusBanners';
import { LotteryModalsContainer } from '@/src/components/admin/lottery/LotteryModalsContainer';
import { DashboardPanel } from '@/src/components/admin/lottery/DashboardPanel';
import { HistoryTable } from '@/src/components/admin/lottery/HistoryTable';
import { PublicBroadcastCard } from '@/src/components/admin/lottery/PublicBroadcastCard';
import { CreateLotteryWizard } from '@/src/components/admin/lottery/CreateLotteryWizard';
import type { Lottery, DbParticipant } from '@/src/components/admin/lottery/types';

export default function AdminLotteryPage() {
  const { token } = useAuthStore();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create'>('dashboard');

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

  // ── Wizard & Winner Selection State ─────────────────────────────────────
  const [wizardStep, setWizardStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [drawMethod, setDrawMethod] = useState<'random' | 'manual'>('manual');
  const [selectedPredeterminedWinners, setSelectedPredeterminedWinners] = useState<DbParticipant[]>(
    []
  );
  const [dbParticipants, setDbParticipants] = useState<DbParticipant[]>([]);
  const [dbParticipantsSearch, setDbParticipantsSearch] = useState('');
  const [dbParticipantsLoading, setDbParticipantsLoading] = useState(false);

  // ── Modal State ─────────────────────────────────────────────────────────
  const [editingLottery, setEditingLottery] = useState<Lottery | null>(null);
  const [viewingLottery, setViewingLottery] = useState<Lottery | null>(null);
  const [emailModalLottery, setEmailModalLottery] = useState<Lottery | null>(null);
  const [deletingLotteryId, setDeletingLotteryId] = useState<string | null>(null);

  // ── Effects ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeLottery && token) fetchSchedule(activeLottery.id, token);
    else resetScheduleState();
  }, [activeLottery, token, fetchSchedule, resetScheduleState]);

  useEffect(() => {
    if (!activeLottery || drawMethod !== 'manual') {
      setDbParticipants([]);
      return;
    }
    const timer = setTimeout(async () => {
      setDbParticipantsLoading(true);
      try {
        let query = supabase
          .from('lottery_participants')
          .select('id, name, ticket_number, phone, email')
          .eq('lottery_id', activeLottery.id);
        if (dbParticipantsSearch.trim()) {
          query = query.or(
            `name.ilike.%${dbParticipantsSearch.trim()}%,ticket_number.ilike.%${dbParticipantsSearch.trim()}%`
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
    }, 300);
    return () => clearTimeout(timer);
  }, [activeLottery, drawMethod, dbParticipantsSearch]);

  useEffect(() => {
    setSelectedPredeterminedWinners([]);
    setDbParticipantsSearch('');
  }, [activeLottery, drawMethod]);

  // ── Actions ─────────────────────────────────────────────────────────────
  const saveLotteryToDB = async () => {
    if (!title.trim()) return setErrorMessage('Please enter a title for the lottery.');
    if (participants.length === 0)
      return setErrorMessage('Please upload a spreadsheet with participants first.');

    startTransition(async () => {
      try {
        setErrorMessage(null);
        setSuccessMessage(null);
        if (activeLottery) {
          const { error: deactErr } = await supabase
            .from('lotteries')
            .update({ status: 'inactive' })
            .eq('id', activeLottery.id);
          if (deactErr) throw deactErr;
        }
        const { data: newLottery, error: createErr } = await supabase
          .from('lotteries')
          .insert({
            title: title.trim(),
            description: description.trim() || null,
            status: 'active',
          })
          .select()
          .single();
        if (createErr) throw createErr;

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
          const { error: insertErr } = await supabase
            .from('lottery_participants')
            .insert(participantsData.slice(i, i + chunkSize));
          if (insertErr) throw insertErr;
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
            if (!ok)
              setErrorMessage(
                'Lottery created, but linked email campaign failed. Use "Sync to EmailCenter" to retry.'
              );
          })
          .catch(() => {
            setErrorMessage(
              'Lottery created, but linked email campaign failed. Use "Sync to EmailCenter" to retry.'
            );
          });
      } catch (error: unknown) {
        console.error('Error saving lottery:', error);
        setErrorMessage(
          error instanceof Error ? error.message : 'Failed to save the lottery draw.'
        );
      }
    });
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
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update campaign status.');
    }
  };

  return (
    <>
      <div className="space-y-8 pb-12 text-slate-900 transition-colors duration-300 dark:text-slate-100">
        <LotteryHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onNewLottery={() => {
            setActiveTab('create');
            setWizardStep(1);
          }}
          onSyncExisting={() => token && handleSyncExisting(token)}
          syncing={syncing}
          canSync={!!token}
        />

        <LotteryStatusBanners
          errorMessage={errorMessage}
          successMessage={successMessage}
          onDismissError={() => setErrorMessage(null)}
          onDismissSuccess={() => setSuccessMessage(null)}
        />

        <PublicBroadcastCard
          lotteryVisible={lotteryVisible}
          visibilityLoading={visibilityLoading}
          visibilityPending={visibilityPending}
          onToggleVisibility={toggleLotteryVisibility}
        />

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
              onExecuteDraw={() =>
                drawWinner(
                  token!,
                  activeLottery!.id,
                  drawMethod === 'manual'
                    ? selectedPredeterminedWinners.map((w) => w.id)
                    : undefined
                )
              }
              onResetDraw={() => activeLottery && resetDraw(activeLottery.id)}
              onDbParticipantsSearchChange={setDbParticipantsSearch}
              onSelectPredeterminedWinner={(p) => {
                setSelectedPredeterminedWinners((prev) =>
                  prev.find((w) => w.id === p.id) ? prev.filter((w) => w.id !== p.id) : [...prev, p]
                );
                setDbParticipantsSearch('');
              }}
              onRemovePredeterminedWinner={(id) =>
                setSelectedPredeterminedWinners((prev) => prev.filter((w) => w.id !== id))
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
            onPrevStep={() => setWizardStep((s) => Math.max(s - 1, 1))}
            onNextStep={() => {
              if (wizardStep === 1 && !title.trim())
                return setErrorMessage('Title is required to proceed.');
              setErrorMessage(null);
              setWizardStep((s) => Math.min(s + 1, 3));
            }}
            onSubmit={saveLotteryToDB}
          />
        )}
      </div>

      <LotteryModalsContainer
        token={token}
        editingLottery={editingLottery}
        viewingLottery={viewingLottery}
        emailModalLottery={emailModalLottery}
        deletingLotteryId={deletingLotteryId}
        onCloseEdit={() => setEditingLottery(null)}
        onCloseView={() => setViewingLottery(null)}
        onCloseEmail={() => setEmailModalLottery(null)}
        onCloseDelete={() => setDeletingLotteryId(null)}
        onOpenEmailFromView={(l) => {
          setViewingLottery(null);
          setEmailModalLottery(l);
        }}
        onLotteriesChanged={fetchLotteries}
        onError={setErrorMessage}
        onSuccess={setSuccessMessage}
      />
    </>
  );
}
