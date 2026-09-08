'use client';

import { EditCampaignModal } from './modals/EditCampaignModal';
import { ViewParticipantsModal } from './modals/ViewParticipantsModal';
import { BulkEmailModal } from './modals/BulkEmailModal';
import { DeleteConfirmModal } from './modals/DeleteConfirmModal';
import type { Lottery } from './types';
import type { UseLotteryModalsReturn } from './hooks/useLotteryModals';

interface LotteryModalsContainerProps {
  token?: string | null;
  modals?: UseLotteryModalsReturn;
  editingLottery?: Lottery | null;
  viewingLottery?: Lottery | null;
  emailModalLottery?: Lottery | null;
  deletingLotteryId?: string | null;
  onCloseEdit?: () => void;
  onCloseView?: () => void;
  onCloseEmail?: () => void;
  onCloseDelete?: () => void;
  onOpenEmailFromView?: (lottery: Lottery) => void;
  onLotteriesChanged: () => void;
  onError: (msg: string | null) => void;
  onSuccess: (msg: string | null) => void;
}

export function LotteryModalsContainer({
  token,
  modals,
  editingLottery,
  viewingLottery,
  emailModalLottery,
  deletingLotteryId,
  onCloseEdit,
  onCloseView,
  onCloseEmail,
  onCloseDelete,
  onOpenEmailFromView,
  onLotteriesChanged,
  onError,
  onSuccess,
}: LotteryModalsContainerProps) {
  const activeEditing = modals ? modals.editingLottery : (editingLottery ?? null);
  const activeViewing = modals ? modals.viewingLottery : (viewingLottery ?? null);
  const activeEmail = modals ? modals.emailModalLottery : (emailModalLottery ?? null);
  const activeDeleteId = modals ? modals.deletingLotteryId : (deletingLotteryId ?? null);

  const handleCloseEdit = modals ? modals.closeEdit : onCloseEdit || (() => {});
  const handleCloseView = modals ? modals.closeView : onCloseView || (() => {});
  const handleCloseEmail = modals ? modals.closeEmail : onCloseEmail || (() => {});
  const handleCloseDelete = modals ? modals.closeDelete : onCloseDelete || (() => {});
  const handleOpenEmailFromView = modals
    ? modals.openEmailFromView
    : onOpenEmailFromView || (() => {});

  return (
    <>
      <EditCampaignModal
        open={!!activeEditing}
        lottery={activeEditing}
        onClose={handleCloseEdit}
        onSaved={onLotteriesChanged}
        onError={onError}
        onSuccess={onSuccess}
      />
      <ViewParticipantsModal
        open={!!activeViewing}
        lottery={activeViewing}
        onClose={handleCloseView}
        onOpenEmail={handleOpenEmailFromView}
      />
      <BulkEmailModal
        open={!!activeEmail}
        lottery={activeEmail}
        onClose={handleCloseEmail}
        token={token || ''}
        onSuccess={onSuccess}
        onError={onError}
      />
      <DeleteConfirmModal
        open={!!activeDeleteId}
        lotteryId={activeDeleteId}
        onClose={handleCloseDelete}
        token={token || ''}
        onSuccess={onSuccess}
        onError={onError}
        onDeleted={onLotteriesChanged}
      />
    </>
  );
}
