'use client';

import { motion } from 'motion/react';
import {
  Users,
  Search,
  X,
  RefreshCw,
  Briefcase,
  Plus,
  FileText,
  Phone,
  Mail,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { UserProfile } from '@/src/lib/supabase/types';
import { RoleSwitcher } from '@/src/components/admin/helpers/RoleSwitcher';
import { renderPropertyInterestTags } from '@/src/components/admin/helpers/PropertyInterestTags';

interface DashboardUsersTableProps {
  users: UserProfile[];
  loading: boolean;
  search: string;
  setSearch: (val: string) => void;
  properties: Array<{ name: string; slug: string }>;
  roleLoading: Record<string, boolean>;
  currentAdminId: string;
  onRefresh: () => void;
  onAddEmployee: () => void;
  onManageTeam: () => void;
  onAddUser: () => void;
  onEditUser: (user: UserProfile) => void;
  onDeleteUser: (user: UserProfile) => void;
  onRoleChange: (user: UserProfile, newRole: string) => void;
}

export function DashboardUsersTable({
  users,
  loading,
  search,
  setSearch,
  properties,
  roleLoading,
  currentAdminId,
  onRefresh,
  onAddEmployee,
  onManageTeam,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onRoleChange,
}: DashboardUsersTableProps) {
  const filtered = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.real_email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
  );

  return (
    <>
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 font-sans sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-brand-gold absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="focus:border-brand-gold focus:ring-brand-gold/15 dark:bg-brand-dark-surface/85 w-full rounded-lg border border-gray-200 bg-white py-3 pr-10 pl-10 text-sm text-gray-900 placeholder-gray-400 transition-all focus:ring-2 focus:outline-none dark:border-white/10 dark:text-white dark:placeholder-gray-600"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="hover:text-brand-gold absolute top-1/2 right-3.5 -translate-y-1/2 cursor-pointer text-gray-500"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          onClick={onRefresh}
          className="dark:bg-brand-dark-surface/85 flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-xs font-bold tracking-widest text-gray-700 uppercase transition-all hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
        <button
          onClick={onAddEmployee}
          className="dark:bg-brand-dark-surface/85 flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-xs font-bold tracking-widest text-gray-700 uppercase transition-all hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
        >
          <Briefcase className="h-3.5 w-3.5" /> Add Employee
        </button>
        <button
          onClick={onManageTeam}
          className="dark:bg-brand-dark-surface/85 flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-xs font-bold tracking-widest text-gray-700 uppercase transition-all hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
        >
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <Briefcase className="h-3.5 w-3.5" />
          </div>
          Manage Public Team
        </button>
        <button
          onClick={onAddUser}
          className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex cursor-pointer items-center gap-2 rounded-lg px-6 py-3 text-xs font-bold tracking-widest uppercase shadow-lg transition-all"
        >
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 shadow-2xl backdrop-blur-xl transition-colors duration-300 dark:border-white/8">
        <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />

        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full animate-pulse font-sans text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 dark:border-white/5 dark:bg-white/5">
                  {[
                    'User Profile',
                    'Contact Info',
                    'Property Interests',
                    'Joined Date',
                    'Actions',
                  ].map((h, idx) => (
                    <th
                      key={h}
                      className={`px-6 py-5 text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase ${idx === 4 ? 'text-right' : 'text-left'}`}
                    >
                      <div
                        className={`h-3 rounded bg-gray-200 dark:bg-white/5 ${idx === 4 ? 'ml-auto w-16' : 'w-24'}`}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-gray-150 divide-y dark:divide-white/5">
                {[...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-200 dark:bg-white/5" />
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="h-4 w-32 rounded bg-gray-200 dark:bg-white/5" />
                          <div className="h-3 w-16 rounded bg-gray-200 dark:bg-white/5" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-40 rounded bg-gray-200 dark:bg-white/5" />
                        <div className="h-3 w-28 rounded bg-gray-200 dark:bg-white/5" />
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-32 rounded bg-gray-200 dark:bg-white/5" />
                        <div className="h-3 w-24 rounded bg-gray-200 dark:bg-white/5" />
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="h-4 w-20 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <div className="h-8 w-16 rounded-lg bg-gray-200 dark:bg-white/5" />
                        <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-white/5" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center font-sans">
            <Users className="mx-auto mb-4 h-12 w-12 text-gray-400 transition-colors duration-300 dark:text-gray-700" />
            <p className="text-sm font-medium text-gray-500 transition-colors duration-300 dark:text-gray-400">
              {search ? 'No matches found.' : 'No users created yet. Add one!'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full font-sans text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 backdrop-blur-md transition-colors duration-300 dark:border-white/5 dark:bg-white/5">
                  {[
                    'User Profile',
                    'Contact Info',
                    'Property Interests',
                    'Joined Date',
                    'Actions',
                  ].map((h, idx) => (
                    <th
                      key={h}
                      className={`px-6 py-5 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase transition-colors duration-300 dark:text-gray-400 ${idx === 4 ? 'text-right' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filtered.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.3, ease: 'easeOut' }}
                    className="group transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
                  >
                    {/* User Profile */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-sm font-semibold text-gray-600 dark:border-white/10 dark:bg-white/10 dark:text-gray-300">
                          {u.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {u.full_name}
                            </span>
                            {roleLoading[u.id] ? (
                              <span className="border-brand-gold h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                            ) : (
                              <RoleSwitcher
                                role={u.role}
                                onRoleChange={(newRole) => onRoleChange(u, newRole)}
                                disabled={u.id === currentAdminId}
                              />
                            )}
                          </div>
                          <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            {u.email}
                          </div>
                          {u.notes && (
                            <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
                              <FileText className="mt-0.5 h-3 w-3 flex-shrink-0" />
                              <span className="max-w-[200px] truncate" title={u.notes}>
                                {u.notes}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                        {u.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            {u.phone}
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-600">—</span>
                        )}
                        {u.real_email ? (
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            <span className="max-w-[160px] truncate" title={u.real_email}>
                              {u.real_email}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </td>

                    {/* Property Interests */}
                    <td className="w-[300px] px-6 py-4">
                      {u.property_interest ? (
                        renderPropertyInterestTags(u.property_interest, properties)
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-600">—</span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-400">
                      {new Date(u.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEditUser(u)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-gray-300"
                          title="Edit User Profile"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {u.id !== currentAdminId && (
                          <button
                            onClick={() => onDeleteUser(u)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
