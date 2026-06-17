'use client';

import {
  AlertCircle,
  Edit3,
  Plus,
  RefreshCw,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

import DynamicSkeleton from '@/src/components/ui/DynamicSkeleton';
import type { Team, TeamMember, UserProfile } from '@/src/lib/supabase/types';

interface TeamsManagerProps {
  token: string;
  showToast: (type: 'success' | 'error', msg: string) => void;
  teams: (Team & { member_count: number })[];
  teamsLoading: boolean;
  onTeamsChange: () => void;
}

const inputCls =
  'w-full bg-white dark:bg-[#111118] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 transition-all font-sans';
const labelCls =
  'text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mb-1.5 block transition-colors duration-300';

function TeamModal({
  team,
  onClose,
  onSuccess,
  token,
}: {
  team?: Team | null;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}) {
  const [name, setName] = useState(team?.name || '');
  const [description, setDescription] = useState(team?.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Team name is required.');
      return;
    }
    setLoading(true);
    try {
      const url = team ? `/api/admin/attendance/teams/${team.id}` : '/api/admin/attendance/teams';
      const res = await fetch(url, {
        method: team ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save team');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-md dark:bg-black/85">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="dark:border-brand-gold/20 dark:bg-brand-dark-surface relative w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
      >
        <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-white/8">
          <div className="flex items-center gap-3">
            <div className="bg-brand-gold/10 border-brand-gold/20 flex h-8 w-8 items-center justify-center rounded-lg border">
              <Plus className="text-brand-gold h-4 w-4" />
            </div>
            <h2 className="text-brand-navy font-serif text-lg font-semibold tracking-tight dark:text-white">
              {team ? 'Edit Team' : 'Create Team'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="hover:text-brand-gold cursor-pointer text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6 font-sans">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
          <div>
            <label className={labelCls}>Team Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Sales Team"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Optional team description..."
              className={`${inputCls} resize-none`}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer rounded-lg border border-gray-200 bg-gray-100 py-3.5 text-xs font-bold tracking-widest text-gray-700 uppercase transition-all hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-3.5 text-xs font-bold tracking-widest uppercase shadow-lg transition-all disabled:opacity-60"
            >
              {loading ? (
                <span className="border-brand-navy/45 border-t-brand-navy h-4 w-4 animate-spin rounded-full border-2" />
              ) : (
                <>{team ? 'Save Changes' : 'Create Team'}</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function DeleteConfirm({
  teamName,
  onConfirm,
  onClose,
  loading,
}: {
  teamName: string;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-md dark:bg-black/85">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="dark:border-brand-gold/20 dark:bg-brand-dark-surface relative w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-2xl"
      >
        <div className="absolute top-0 right-0 left-0 h-[2px] bg-red-500/50" />
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
          <Trash2 className="h-5 w-5 text-red-400" />
        </div>
        <h3 className="text-brand-navy mb-2 font-serif text-lg tracking-tight dark:text-white">
          Delete Team?
        </h3>
        <p className="mb-6 font-sans text-sm text-gray-500 dark:text-gray-400">
          This will permanently delete{' '}
          <span className="text-brand-navy font-medium dark:text-white">{teamName}</span> and all
          associated attendance data. This action is irreversible.
        </p>
        <div className="flex gap-3 font-sans">
          <button
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-lg border border-gray-200 bg-gray-100 py-3 text-xs font-bold tracking-widest text-gray-700 uppercase transition-all hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-600 py-3 text-xs font-bold tracking-widest text-white uppercase shadow-lg transition-all hover:bg-red-500"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function TeamsManager({
  token,
  showToast,
  teams,
  teamsLoading,
  onTeamsChange,
}: TeamsManagerProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [members, setMembers] = useState<Record<string, TeamMember[]>>({});
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [addMemberLoading, setAddMemberLoading] = useState(false);

  const fetchMembers = async (teamId: string) => {
    try {
      const res = await fetch(`/api/admin/attendance/teams/${teamId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch team members');
      setMembers((prev) => ({ ...prev, [teamId]: json.members }));
    } catch (err: any) {
      console.error('Error fetching team members:', err);
      showToast('error', err.message || 'Failed to fetch team members.');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch user profiles');
      setUsers(json.users.filter((u: UserProfile) => u.role === 'client'));
    } catch (err: any) {
      console.error('Error loading users list:', err);
      showToast('error', err.message || 'Failed to load user rosters.');
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const toggleExpand = (teamId: string) => {
    if (expandedTeam === teamId) {
      setExpandedTeam(null);
    } else {
      setExpandedTeam(teamId);
      if (!members[teamId]) {
        fetchMembers(teamId);
      }
    }
  };

  const handleAddMember = async (teamId: string, userId: string) => {
    setAddMemberLoading(true);
    try {
      const res = await fetch(`/api/admin/attendance/teams/${teamId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      await fetchMembers(teamId);
      onTeamsChange();
      showToast('success', 'Member added to team.');
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setAddMemberLoading(false);
    }
  };

  const handleRemoveMember = async (teamId: string, userId: string, name: string) => {
    try {
      const res = await fetch(`/api/admin/attendance/teams/${teamId}/members/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error);
      }
      await fetchMembers(teamId);
      onTeamsChange();
      showToast('success', `${name} removed from team.`);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/attendance/teams/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error);
      }
      onTeamsChange();
      showToast('success', `${deleteTarget.name} has been deleted.`);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const getAvailableUsers = (teamId: string) => {
    const teamMemberIds = (members[teamId] || []).map((m) => m.user_id);
    return users.filter((u) => !teamMemberIds.includes(u.id));
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-brand-navy font-serif text-xl font-semibold tracking-tight dark:text-white">
            Teams
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Create and manage teams for attendance tracking
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onTeamsChange}
            className="dark:bg-brand-dark-surface/85 flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold tracking-widest text-gray-700 uppercase transition-all hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex cursor-pointer items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold tracking-widest uppercase shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" /> New Team
          </button>
        </div>
      </div>

      {teamsLoading ? (
        <DynamicSkeleton type="chat-log" count={3} />
      ) : teams.length === 0 ? (
        <div className="py-16 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-700" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            No teams created yet. Create one to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {teams.map((team) => (
            <div
              key={team.id}
              className="dark:bg-brand-dark-surface/65 overflow-hidden rounded-xl border border-gray-200 bg-white/80 shadow-lg backdrop-blur-xl dark:border-white/8"
            >
              <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />
              <div
                className="flex cursor-pointer items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                onClick={() => toggleExpand(team.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-brand-gold/10 border-brand-gold/20 flex h-10 w-10 items-center justify-center rounded-lg border">
                    <Users className="text-brand-gold h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-brand-navy font-semibold tracking-wide dark:text-white">
                      {team.name}
                    </h3>
                    {team.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{team.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-brand-gold/10 text-brand-gold rounded-full px-3 py-1 text-xs font-bold">
                    {team.member_count} member{team.member_count !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditTeam(team);
                    }}
                    className="hover:text-brand-gold cursor-pointer rounded-lg border border-gray-200 p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(team);
                    }}
                    className="cursor-pointer rounded-lg border border-red-500/20 p-2 text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {expandedTeam === team.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-100 px-6 py-4 dark:border-white/5">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                          Team Members
                        </h4>
                        {getAvailableUsers(team.id).length > 0 && (
                          <div className="flex items-center gap-2">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAddMember(team.id, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              disabled={addMemberLoading}
                              className="focus:border-brand-gold rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
                            >
                              <option value="">Add member...</option>
                              {getAvailableUsers(team.id).map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.full_name} ({u.email})
                                </option>
                              ))}
                            </select>
                            <UserPlus className="text-brand-gold h-3.5 w-3.5" />
                          </div>
                        )}
                      </div>
                      {!members[team.id] || members[team.id].length === 0 ? (
                        <p className="text-xs text-gray-400 italic dark:text-gray-600">
                          No members yet. Add users to this team.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {members[team.id].map((m) => (
                            <div
                              key={m.id}
                              className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-2.5 dark:border-white/5 dark:bg-white/2"
                            >
                              <div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {m.full_name}
                                </span>
                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                  {m.email}
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  handleRemoveMember(team.id, m.user_id, m.full_name || '')
                                }
                                className="cursor-pointer rounded p-1.5 text-red-400 transition-colors hover:bg-red-500/10"
                                title="Remove member"
                              >
                                <UserMinus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <TeamModal
            token={token}
            onClose={() => setShowCreate(false)}
            onSuccess={() => {
              onTeamsChange();
              showToast('success', 'Team created successfully!');
            }}
          />
        )}
        {editTeam && (
          <TeamModal
            team={editTeam}
            token={token}
            onClose={() => setEditTeam(null)}
            onSuccess={() => {
              onTeamsChange();
              showToast('success', 'Team updated successfully!');
            }}
          />
        )}
        {deleteTarget && (
          <DeleteConfirm
            teamName={deleteTarget.name}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
            loading={deleteLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
