'use client';

import type { ReactElement } from 'react';
import { AnimatePresence } from 'motion/react';
import type { Registration } from './types';
import { DetailModal } from './DetailModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { ReassignAdvisorModal } from './ReassignAdvisorModal';
import { AdvisorSettingsModal } from '@/src/components/admin/modals/AdvisorSettingsModal';

interface RegistrationsModalsProps {
  selectedReg: Registration | null;
  deleteTarget: Registration | null;
  reassignTargets: Registration[] | null;
  showAdvisorSettings: boolean;
  availableAdvisors: string[];
  token: string | null;
  deleteLoading: boolean;
  reassignLoading: boolean;
  onCloseDetail: () => void;
  onStatusChange: (id: string, status: string) => void;
  onDeleteFromDetail: (reg: Registration) => void;
  onAdvisorChange?: (id: string, advisorName: string) => Promise<void>;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onConfirmReassign: (advisorName: string) => Promise<void>;
  onCancelReassign: () => void;
  onCloseAdvisorSettings: () => void;
  showToast: (type: 'success' | 'error', text: string) => void;
}

export function RegistrationsModals({
  selectedReg,
  deleteTarget,
  reassignTargets,
  showAdvisorSettings,
  availableAdvisors,
  token,
  deleteLoading,
  reassignLoading,
  onCloseDetail,
  onStatusChange,
  onDeleteFromDetail,
  onAdvisorChange,
  onConfirmDelete,
  onCancelDelete,
  onConfirmReassign,
  onCancelReassign,
  onCloseAdvisorSettings,
  showToast,
}: RegistrationsModalsProps): ReactElement {
  return (
    <AnimatePresence>
      {selectedReg && (
        <DetailModal
          reg={selectedReg}
          onClose={onCloseDetail}
          onStatusChange={onStatusChange}
          onDelete={onDeleteFromDetail}
          advisors={availableAdvisors}
          onAdvisorChange={onAdvisorChange}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          reg={deleteTarget}
          onConfirm={onConfirmDelete}
          onCancel={onCancelDelete}
          loading={deleteLoading}
        />
      )}
      {reassignTargets && (
        <ReassignAdvisorModal
          targets={reassignTargets}
          advisors={availableAdvisors}
          onConfirm={onConfirmReassign}
          onCancel={onCancelReassign}
          loading={reassignLoading}
        />
      )}
      {showAdvisorSettings && token && (
        <AdvisorSettingsModal
          token={token}
          showToast={showToast}
          onClose={onCloseAdvisorSettings}
        />
      )}
    </AnimatePresence>
  );
}
