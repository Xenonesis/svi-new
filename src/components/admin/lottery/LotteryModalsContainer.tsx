'use client';

import { EditCampaignModal } from './modals/EditCampaignModal';
import { ViewParticipantsModal } from './modals/ViewParticipantsModal';
import { BulkEmailModal } from './modals/BulkEmailModal';
import { DeleteConfirmModal } from './modals/DeleteConfirmModal';
import type { Lottery } from './types';

interface LotteryModalsContainerProps {
  token?: string | null;
  editingLottery: Lottery | null;
  viewingLottery: Lottery | null;
  emailModalLottery: Lottery | null;
  deletingLotteryId: string | null;
  onCloseEdit: () => void;
  onCloseView: () => void;
  onCloseEmail: () => void;
  onCloseDelete: () => void;
  onOpenEmailFromView: (lottery: Lottery) => void;
  onLotteriesChanged: () => void;
  onError: (msg: string | null) => void;
  onSuccess: (msg: string | null) => void;
}

export function LotteryModalsContainer({
  token,
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
  return (
    <>
      <EditCampaignModal
        open={!!editingLottery}
        lottery={editingLottery}
        onClose={onCloseEdit}
        onSaved={onLotteriesChanged}
        onError={onError}
        onSuccess={onSuccess}
      />
      <ViewParticipantsModal
        open={!!viewingLottery}
        lottery={viewingLottery}
        onClose={onCloseView}
        onOpenEmail={onOpenEmailFromView}
      />
      <BulkEmailModal
        open={!!emailModalLottery}
        lottery={emailModalLottery}
        onClose={onCloseEmail}
        token={token || ''}
        onSuccess={onSuccess}
        onError={onError}
      />
      <DeleteConfirmModal
        open={!!deletingLotteryId}
        lotteryId={deletingLotteryId}
        onClose={onCloseDelete}
        token={token || ''}
        onSuccess={onSuccess}
        onError={onError}
        onDeleted={onLotteriesChanged}
      />
    </>
  );
}
