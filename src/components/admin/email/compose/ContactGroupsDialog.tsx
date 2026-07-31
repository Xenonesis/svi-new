'use client';

import { useState, useEffect, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Users, Loader2, Plus, Trash2, Check, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { getToken } from '../helpers';
import type { ContactGroup } from '../types';

interface ContactGroupsDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectGroup: (emails: string[]) => void;
}

export function ContactGroupsDialog({ open, onClose, onSelectGroup }: ContactGroupsDialogProps) {
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ContactGroup | null>(null);
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/contact-groups', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGroups(data.groups || []);
    } catch {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchGroups();
  }, [open, fetchGroups]);

  const loadMembers = useCallback(async (group: ContactGroup) => {
    setSelectedGroup(group);
    setMembersLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/contact-groups/${group.id}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGroupMembers((data.members || []).map((m: any) => m.contact_email));
    } catch {
      toast.error('Failed to load members');
    } finally {
      setMembersLoading(false);
    }
  }, []);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    setCreating(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/contact-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newGroupName.trim() }),
      });
      if (!res.ok) throw new Error();
      toast.success('Group created');
      setNewGroupName('');
      await fetchGroups();
    } catch {
      toast.error('Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/contact-groups/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      toast.success('Group deleted');
      setSelectedGroup(null);
      setGroupMembers([]);
      await fetchGroups();
    } catch {
      toast.error('Failed to delete group');
    }
  };

  const handleAddGroupRecipients = async (group: ContactGroup) => {
    // Load fresh members from API
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/contact-groups/${group.id}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const emails = (data.members || []).map((m: any) => m.contact_email);
      if (emails.length === 0) {
        toast.info('Group has no members');
        return;
      }
      onSelectGroup(emails);
      toast.success(`Added ${emails.length} recipient${emails.length !== 1 ? 's' : ''}`);
      onClose();
    } catch {
      toast.error('Failed to load group members');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="dark:bg-brand-dark-surface fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl dark:border-gray-700/60">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
            <Dialog.Title className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <Users className="text-brand-gold h-4 w-4" />
              Contact Groups
            </Dialog.Title>
            <Dialog.Close className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* Create group */}
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3 dark:border-gray-800">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
              placeholder="New group name..."
              className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-blue-300 dark:border-gray-700 dark:bg-black/20 dark:text-white"
            />
            <button
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim() || creating}
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Plus className="h-3 w-3" />
              )}
              Create
            </button>
          </div>

          {/* Group list */}
          <div className="max-h-[280px] overflow-y-auto">
            {loading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            )}

            {!loading && groups.length === 0 && (
              <div className="py-8 text-center">
                <Users className="mx-auto mb-2 h-6 w-6 text-gray-300 dark:text-gray-600" />
                <p className="text-xs text-gray-500">No groups yet</p>
              </div>
            )}

            {!loading &&
              groups.map((group) => (
                <div key={group.id}>
                  <div
                    className={`flex cursor-pointer items-center gap-3 border-b border-gray-50 px-5 py-3 transition-colors hover:bg-gray-50 dark:border-gray-800/50 dark:hover:bg-white/[0.02] ${
                      selectedGroup?.id === group.id ? 'bg-blue-50 dark:bg-blue-500/5' : ''
                    }`}
                    onClick={() => {
                      if (selectedGroup?.id === group.id) {
                        setSelectedGroup(null);
                        setGroupMembers([]);
                      } else {
                        loadMembers(group);
                      }
                    }}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-gray-900 dark:text-white">
                        {group.name}
                      </span>
                      <span className="block text-xs text-gray-400">
                        {group.member_count ?? 0} member
                        {group.member_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddGroupRecipients(group);
                      }}
                      className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700 uppercase transition-all hover:bg-emerald-100 dark:border-emerald-800/30 dark:bg-emerald-900/20 dark:text-emerald-400"
                      title="Add all group members as recipients"
                    >
                      <UserPlus className="h-3 w-3" />
                      Add All
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGroup(group.id);
                      }}
                      className="rounded p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Expanded members */}
                  {selectedGroup?.id === group.id && (
                    <div className="border-b border-gray-50 bg-gray-50/50 px-5 py-2 dark:border-gray-800/50 dark:bg-white/[0.01]">
                      {membersLoading ? (
                        <div className="flex justify-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        </div>
                      ) : groupMembers.length === 0 ? (
                        <p className="py-2 text-center text-[11px] text-gray-400">
                          No members in this group
                        </p>
                      ) : (
                        <div className="max-h-[140px] space-y-1 overflow-y-auto">
                          {groupMembers.map((email) => (
                            <div
                              key={email}
                              className="flex items-center gap-2 rounded px-2 py-1 text-xs text-gray-600 dark:text-gray-400"
                            >
                              <Check className="h-3 w-3 shrink-0 text-emerald-500" />
                              <span className="truncate">{email}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end border-t border-gray-100 px-5 py-3 dark:border-gray-800">
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5"
              >
                Close
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
