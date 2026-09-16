import { useState } from 'react';
import { toast } from 'sonner';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';
import type { UserProfile } from '@/src/lib/supabase/types';

export function useDashboardUserActions(
  token: string | null,
  onRefresh: () => void,
  currentAdminId?: string
) {
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState<Record<string, boolean>>({});
  const [activeLoading, setActiveLoading] = useState<Record<string, boolean>>({});

  const handleDelete = async (target?: UserProfile | null, onClose?: () => void) => {
    if (!target) return;
    setDeleteLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(`/api/admin/users/${target.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(extractApiErrorMessage(data, 'Failed to delete user'));
      }
      onRefresh();
      toast.success(`${target.full_name || 'User'} has been deleted.`);
      onClose?.();
    } catch (err: unknown) {
      const isAbort = err instanceof Error && err.name === 'AbortError';
      toast.error(
        isAbort
          ? 'Request timed out while deleting user. Please check your connection and try again.'
          : extractApiErrorMessage(err, 'Failed to delete user')
      );
    } finally {
      clearTimeout(timeoutId);
      setDeleteLoading(false);
    }
  };

  const handleRoleChange = async (user: UserProfile, newRole: string) => {
    if (user.role === newRole) return;

    if (currentAdminId && user.id === currentAdminId && newRole !== 'admin') {
      toast.error('You cannot remove your own admin role.');
      return;
    }

    setRoleLoading((prev) => ({ ...prev, [user.id]: true }));
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(extractApiErrorMessage(j, 'Failed to update user role'));
      }
      onRefresh();
      toast.success(`${user.full_name}'s role updated to ${newRole}.`);
    } catch (err: unknown) {
      toast.error(extractApiErrorMessage(err, 'Update failed'));
    } finally {
      setRoleLoading((prev) => ({ ...prev, [user.id]: false }));
    }
  };

  const handleToggleActive = async (user: UserProfile) => {
    if (currentAdminId && user.id === currentAdminId && (user.is_active ?? true)) {
      toast.error('You cannot deactivate your own account.');
      return;
    }

    const nextStatus = !(user.is_active ?? true);
    setActiveLoading((prev) => ({ ...prev, [user.id]: true }));

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: nextStatus }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(
          extractApiErrorMessage(j, `Failed to ${nextStatus ? 'activate' : 'deactivate'} account`)
        );
      }
      onRefresh();
      toast.success(
        `${user.full_name}'s account has been ${nextStatus ? 'activated' : 'deactivated'}.`
      );
    } catch (err: unknown) {
      toast.error(extractApiErrorMessage(err, 'Status update failed'));
    } finally {
      setActiveLoading((prev) => ({ ...prev, [user.id]: false }));
    }
  };

  return {
    deleteLoading,
    roleLoading,
    activeLoading,
    handleDelete,
    handleRoleChange,
    handleToggleActive,
  };
}
