'use client';

import type React from 'react';
import { AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

import dynamic from 'next/dynamic';
import type { UserProfile } from '@/src/lib/supabase/types';

const CreateUserModal = dynamic(
  () => import('@/src/components/admin/modals/CreateUserModal').then((m) => m.CreateUserModal),
  { ssr: false }
);
const EditUserModal = dynamic(
  () => import('@/src/components/admin/modals/EditUserModal').then((m) => m.EditUserModal),
  { ssr: false }
);
const DeleteConfirm = dynamic(
  () => import('@/src/components/admin/modals/DeleteConfirm').then((m) => m.DeleteConfirm),
  { ssr: false }
);
const AdvisorSettingsModal = dynamic(
  () =>
    import('@/src/components/admin/modals/AdvisorSettingsModal').then(
      (m) => m.AdvisorSettingsModal
    ),
  { ssr: false }
);
const AddEmployeeModal = dynamic(
  () => import('@/src/components/admin/modals/AddEmployeeModal').then((m) => m.AddEmployeeModal),
  { ssr: false }
);
export interface DashboardModalsContainerProps {
  token: string | null;
  properties: Array<{ name: string; slug: string }>;
  showCreate: boolean;
  setShowCreate: (val: boolean) => void;
  showAddEmployee: boolean;
  setShowAddEmployee: (val: boolean) => void;
  showAdvisorSettings: boolean;
  setShowAdvisorSettings: (val: boolean) => void;
  editTarget: UserProfile | null;
  setEditTarget: (user: UserProfile | null) => void;
  deleteTarget: UserProfile | null;
  setDeleteTarget: (user: UserProfile | null) => void;
  deleteLoading: boolean;
  onDelete: () => void | Promise<void>;
  onRefresh: () => void;
}

export function DashboardModalsContainer({
  token,
  properties,
  showCreate,
  setShowCreate,
  showAddEmployee,
  setShowAddEmployee,
  showAdvisorSettings,
  setShowAdvisorSettings,
  editTarget,
  setEditTarget,
  deleteTarget,
  setDeleteTarget,
  deleteLoading,
  onDelete,
  onRefresh,
}: DashboardModalsContainerProps): React.JSX.Element {
  const showToast = (type: 'success' | 'error', msg: string) => {
    if (type === 'success') {
      toast.success(msg);
    } else {
      toast.error(msg);
    }
  };

  return (
    <AnimatePresence>
      {showCreate && (
        <CreateUserModal
          token={token ?? ''}
          properties={properties}
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            onRefresh();
            toast.success('User created successfully!');
          }}
        />
      )}
      {editTarget && (
        <EditUserModal
          user={editTarget}
          token={token ?? ''}
          properties={properties}
          onClose={() => setEditTarget(null)}
          onSuccess={() => {
            onRefresh();
            toast.success('User updated successfully!');
          }}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={onDelete}
          loading={deleteLoading}
        />
      )}
      {showAddEmployee && (
        <AddEmployeeModal
          token={token ?? ''}
          onClose={() => setShowAddEmployee(false)}
          onSuccess={() => {
            setShowAddEmployee(false);
            onRefresh();
            toast.success('Employee created successfully!');
          }}
        />
      )}
      {showAdvisorSettings && (
        <AdvisorSettingsModal
          onClose={() => setShowAdvisorSettings(false)}
          token={token ?? ''}
          showToast={showToast}
        />
      )}
    </AnimatePresence>
  );
}
