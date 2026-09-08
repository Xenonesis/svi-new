'use client';

import { supabase } from '@/src/lib/supabase/client';
import { DashboardPanel } from './DashboardPanel';
import { HistoryTable } from './HistoryTable';
import { PublicBroadcastCard } from './PublicBroadcastCard';
import { CreateLotteryWizard } from './CreateLotteryWizard';
import type { UseLotteryDataReturn } from './hooks/useLotteryData';
import type { UseParticipantManagementReturn } from './hooks/useParticipantManagement';
import type { UseLotteryWizardReturn } from './hooks/useLotteryWizard';
import type { UseLotteryModalsReturn } from './hooks/useLotteryModals';

interface LotteryViewsContainerProps {
  activeTab: 'dashboard' | 'create';
  token?: string | null;
  lotteryData: UseLotteryDataReturn;
  participantMgmt: UseParticipantManagementReturn;
  wizard: UseLotteryWizardReturn;
  modals: UseLotteryModalsReturn;
  onTabChange: (tab: 'dashboard' | 'create') => void;
  isPending?: boolean;
  onStatusChange?: (
    lotteryId: string,
    newStatus: 'active' | 'completed' | 'inactive'
  ) => Promise<void>;
}

export function LotteryViewsContainer({
  activeTab,
  token,
  lotteryData,
  participantMgmt,
  wizard,
  modals,
  onTabChange,
  isPending,
  onStatusChange,
}: LotteryViewsContainerProps) {
  const pending = isPending ?? lotteryData.isPending;

  const handleStatusChange = async (
    lotteryId: string,
    newStatus: 'active' | 'completed' | 'inactive'
  ) => {
    if (onStatusChange) {
      return onStatusChange(lotteryId, newStatus);
    }
    try {
      lotteryData.setErrorMessage(null);
      lotteryData.setSuccessMessage(null);
      const { error } = await supabase
        .from('lotteries')
        .update({ status: newStatus })
        .eq('id', lotteryId);
      if (error) throw error;
      lotteryData.setSuccessMessage(
        `Campaign status successfully updated to ${newStatus.toUpperCase()}.`
      );
      lotteryData.fetchLotteries();
    } catch (err: unknown) {
      lotteryData.setErrorMessage(
        err instanceof Error ? err.message : 'Failed to update campaign status.'
      );
    }
  };

  if (activeTab === 'create') {
    return (
      <CreateLotteryWizard
        wizardStep={wizard.wizardStep}
        title={wizard.title}
        description={wizard.description}
        participants={participantMgmt.participants}
        searchTerm={participantMgmt.searchTerm}
        currentPage={participantMgmt.currentPage}
        itemsPerPage={participantMgmt.itemsPerPage}
        entryMethod={participantMgmt.entryMethod}
        dragOver={participantMgmt.dragOver}
        manualName={participantMgmt.manualName}
        manualPhone={participantMgmt.manualPhone}
        manualEmail={participantMgmt.manualEmail}
        manualTicket={participantMgmt.manualTicket}
        totalPages={participantMgmt.totalPages}
        fileInputRef={participantMgmt.fileInputRef}
        isPending={pending}
        paginatedParticipants={participantMgmt.paginatedParticipants}
        onTitleChange={wizard.setTitle}
        onDescriptionChange={wizard.setDescription}
        onSearchTermChange={participantMgmt.setSearchTerm}
        onCurrentPageChange={participantMgmt.setCurrentPage}
        onEntryMethodChange={participantMgmt.setEntryMethod}
        onManualNameChange={participantMgmt.setManualName}
        onManualPhoneChange={participantMgmt.setManualPhone}
        onManualEmailChange={participantMgmt.setManualEmail}
        onManualTicketChange={participantMgmt.setManualTicket}
        onDragOverChange={participantMgmt.setDragOver}
        onFileUpload={(file) =>
          participantMgmt.handleFileUpload(
            file,
            lotteryData.setErrorMessage,
            lotteryData.setSuccessMessage
          )
        }
        onManualAdd={() =>
          participantMgmt.handleManualAdd(
            lotteryData.setErrorMessage,
            lotteryData.setSuccessMessage
          )
        }
        onRemoveParticipant={participantMgmt.removeParticipant}
        onSetErrorMessage={lotteryData.setErrorMessage}
        onSetSuccessMessage={lotteryData.setSuccessMessage}
        onPrevStep={wizard.prevStep}
        onNextStep={wizard.nextStep}
        onSubmit={wizard.saveLotteryToDB}
      />
    );
  }

  return (
    <div className="space-y-8">
      <PublicBroadcastCard
        lotteryVisible={lotteryData.lotteryVisible}
        visibilityLoading={lotteryData.visibilityLoading}
        visibilityPending={lotteryData.visibilityPending}
        onToggleVisibility={lotteryData.toggleLotteryVisibility}
      />

      <DashboardPanel
        activeLottery={lotteryData.activeLottery}
        activeParticipantsCount={lotteryData.activeParticipantsCount}
        activeWinners={lotteryData.activeWinners}
        drawMethod={wizard.drawMethod}
        isPending={pending}
        dbParticipants={wizard.dbParticipants}
        dbParticipantsSearch={wizard.dbParticipantsSearch}
        dbParticipantsLoading={wizard.dbParticipantsLoading}
        selectedPredeterminedWinners={wizard.selectedPredeterminedWinners}
        onDrawMethodChange={wizard.setDrawMethod}
        onExecuteDraw={() =>
          lotteryData.drawWinner(
            token!,
            lotteryData.activeLottery!.id,
            wizard.drawMethod === 'manual'
              ? wizard.selectedPredeterminedWinners.map((w) => w.id)
              : undefined
          )
        }
        onResetDraw={() =>
          lotteryData.activeLottery && lotteryData.resetDraw(lotteryData.activeLottery.id)
        }
        onDbParticipantsSearchChange={wizard.setDbParticipantsSearch}
        onSelectPredeterminedWinner={wizard.handleSelectPredeterminedWinner}
        onRemovePredeterminedWinner={wizard.handleRemovePredeterminedWinner}
        onClearPredeterminedWinners={wizard.handleClearPredeterminedWinners}
        onCreateNew={() => {
          onTabChange('create');
          wizard.setWizardStep(1);
        }}
      />

      <HistoryTable
        lotteries={lotteryData.lotteries}
        isPending={pending}
        onViewParticipants={modals.openView}
        onEditCampaign={modals.openEdit}
        onEmailParticipants={modals.openEmail}
        onResetDraw={(id) => lotteryData.resetDraw(id)}
        onDelete={(id) => modals.openDelete(id)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
