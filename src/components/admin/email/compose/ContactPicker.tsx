'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Search, Loader2, Check, Users, UserCheck, Shield, Briefcase, User } from 'lucide-react';
import { getToken } from '../helpers';
import type { Contact } from '../types';

interface ContactPickerProps {
  open: boolean;
  onClose: () => void;
  selectedEmails: Set<string>;
  onToggle: (contact: Contact) => void;
  onSelectAll: () => void;
  onSelectFiltered?: (contacts: Contact[]) => void;
  onClearAll?: () => void;
  title?: string;
}

type FilterTab = 'all' | 'employee' | 'client' | 'admin' | 'selected';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (name.slice(0, 2) || 'U').toUpperCase();
}

const AVATAR_COLORS = [
  'bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30',
  'bg-violet-500/20 text-violet-600 dark:text-violet-300 border border-violet-500/30',
  'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30',
  'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30',
  'bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30',
  'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30',
  'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30',
];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (const ch of id || 'default') hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const ROLE_BADGE: Record<string, { label: string; classes: string; icon: typeof User }> = {
  admin: {
    label: 'ADMIN',
    classes: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30',
    icon: Shield,
  },
  employee: {
    label: 'EMP',
    classes: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30',
    icon: Briefcase,
  },
  client: {
    label: 'CLIENT',
    classes:
      'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
    icon: User,
  },
};

export function ContactPicker({
  open,
  onClose,
  selectedEmails,
  onToggle,
  onSelectAll,
  onSelectFiltered,
  onClearAll,
  title = 'Select Contacts',
}: ContactPickerProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const cached = useRef<Contact[] | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Helper to test if a contact is currently selected (robust case and alternate email matching)
  const isContactSelected = useMemo(() => {
    return (contact: Contact): boolean => {
      const primaryLower = (contact.real_email || contact.email || '').trim().toLowerCase();
      const altLower = (contact.email || '').trim().toLowerCase();
      return (
        (primaryLower !== '' && selectedEmails.has(primaryLower)) ||
        (altLower !== '' && selectedEmails.has(altLower))
      );
    };
  }, [selectedEmails]);

  // Fetch contacts on mount / re-open
  useEffect(() => {
    if (!open) return;

    if (cached.current) {
      setContacts(cached.current);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getToken()
      .then((token) =>
        fetch('/api/admin/contacts', {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load contacts');
        return res.json();
      })
      .then((data: { contacts: Contact[] }) => {
        if (cancelled) return;
        cached.current = data.contacts;
        setContacts(data.contacts);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  // Auto-focus search on open
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => searchInputRef.current?.focus(), 60);
      return () => clearTimeout(id);
    } else {
      setSearch('');
      setActiveTab('all');
    }
  }, [open]);

  // Category counts
  const totalCount = contacts.length;
  const employeeCount = useMemo(
    () => contacts.filter((c) => c.role === 'employee').length,
    [contacts]
  );
  const clientCount = useMemo(() => contacts.filter((c) => c.role === 'client').length, [contacts]);
  const adminCount = useMemo(() => contacts.filter((c) => c.role === 'admin').length, [contacts]);
  const totalSelectedCount = useMemo(
    () => contacts.filter(isContactSelected).length,
    [contacts, isContactSelected]
  );

  // Filtered contacts based on activeTab and search
  const filtered = useMemo(() => {
    let list = contacts;

    if (activeTab === 'selected') {
      list = list.filter(isContactSelected);
    } else if (activeTab !== 'all') {
      list = list.filter((c) => c.role === activeTab);
    }

    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.real_email && c.real_email.toLowerCase().includes(q))
    );
  }, [contacts, activeTab, search, isContactSelected]);

  const allFilteredSelected = useMemo(() => {
    if (filtered.length === 0) return false;
    return filtered.every(isContactSelected);
  }, [filtered, isContactSelected]);

  const handleToggleAllFiltered = () => {
    if (allFilteredSelected) {
      // Deselect all filtered
      filtered.forEach((c) => {
        if (isContactSelected(c)) {
          onToggle(c);
        }
      });
    } else {
      // Select all filtered
      if (onSelectFiltered) {
        onSelectFiltered(filtered);
      } else {
        filtered.forEach((c) => {
          if (!isContactSelected(c)) {
            onToggle(c);
          }
        });
      }
    }
  };

  const handleRetry = () => {
    cached.current = null;
    setContacts([]);
    setLoading(true);
    setError(null);
    getToken()
      .then((token) =>
        fetch('/api/admin/contacts', {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load contacts');
        return res.json();
      })
      .then((data: { contacts: Contact[] }) => {
        cached.current = data.contacts;
        setContacts(data.contacts);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  };

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md transition-opacity" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl transition-all dark:border-white/10 dark:bg-[#111118]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="bg-brand-gold/15 flex h-8 w-8 items-center justify-center rounded-lg">
                <Users className="text-brand-gold h-4 w-4" />
              </div>
              <div>
                <Dialog.Title className="text-sm font-bold text-gray-900 dark:text-white">
                  {title}
                </Dialog.Title>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Select team members, clients, or administrators
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {totalSelectedCount > 0 && (
                <span className="bg-brand-gold/15 text-brand-gold border-brand-gold/30 flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold">
                  <Check className="h-3 w-3" />
                  {totalSelectedCount} Selected
                </span>
              )}
              <Dialog.Close className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white">
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>
          </div>

          {/* Search Bar */}
          <div className="border-b border-gray-100 px-5 py-3 dark:border-white/10">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email address..."
                className="focus:border-brand-gold focus:ring-brand-gold/30 dark:bg-brand-dark-surface w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-10 pl-10 text-sm text-gray-900 transition-all outline-none focus:bg-white focus:ring-2 dark:border-white/10 dark:text-white dark:focus:bg-black/30"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills / Tabs */}
          <div className="flex scrollbar-none items-center gap-1.5 overflow-x-auto border-b border-gray-100 px-5 py-2.5 dark:border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-brand-gold text-brand-navy shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
              }`}
            >
              All
              <span
                className={`py-0.2 rounded-full px-1.5 text-[10px] ${
                  activeTab === 'all'
                    ? 'text-brand-navy bg-black/20 font-bold'
                    : 'bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-gray-400'
                }`}
              >
                {totalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('employee')}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'employee'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
              }`}
            >
              <Briefcase className="h-3 w-3" />
              Employees
              <span
                className={`py-0.2 rounded-full px-1.5 text-[10px] ${
                  activeTab === 'employee'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-gray-400'
                }`}
              >
                {employeeCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('client')}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'client'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
              }`}
            >
              <User className="h-3 w-3" />
              Clients
              <span
                className={`py-0.2 rounded-full px-1.5 text-[10px] ${
                  activeTab === 'client'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-gray-400'
                }`}
              >
                {clientCount}
              </span>
            </button>

            {adminCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'admin'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
                }`}
              >
                <Shield className="h-3 w-3" />
                Admins
                <span
                  className={`py-0.2 rounded-full px-1.5 text-[10px] ${
                    activeTab === 'admin'
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-gray-400'
                  }`}
                >
                  {adminCount}
                </span>
              </button>
            )}

            {totalSelectedCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('selected')}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'selected'
                    ? 'bg-brand-gold text-brand-navy shadow-xs'
                    : 'bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20'
                }`}
              >
                <UserCheck className="h-3 w-3" />
                Selected Only
                <span
                  className={`py-0.2 rounded-full px-1.5 text-[10px] ${
                    activeTab === 'selected'
                      ? 'text-brand-navy bg-black/20 font-bold'
                      : 'bg-brand-gold/20 text-brand-gold'
                  }`}
                >
                  {totalSelectedCount}
                </span>
              </button>
            )}
          </div>

          {/* Quick Selection Toolbar */}
          {!loading && !error && filtered.length > 0 && (
            <div className="flex items-center justify-between bg-gray-50/60 px-5 py-2 text-[11px] text-gray-500 dark:bg-white/[0.02] dark:text-gray-400">
              <span className="font-medium">
                Showing {filtered.length} contact{filtered.length !== 1 ? 's' : ''}
              </span>
              <button
                type="button"
                onClick={handleToggleAllFiltered}
                className="text-brand-gold hover:text-brand-gold/80 font-semibold transition-colors"
              >
                {allFilteredSelected
                  ? 'Deselect all visible'
                  : `Select all visible (${filtered.length})`}
              </button>
            </div>
          )}

          {/* Contact List */}
          <div className="flex-1 divide-y divide-gray-100 overflow-y-auto p-2 dark:divide-white/5">
            {loading && (
              <div className="flex flex-col items-center justify-center gap-2 py-16">
                <Loader2 className="text-brand-gold h-7 w-7 animate-spin" />
                <p className="text-xs text-gray-400">Loading contacts...</p>
              </div>
            )}

            {error && (
              <div className="px-5 py-12 text-center">
                <p className="mb-3 text-sm text-red-500">{error}</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="bg-brand-gold text-brand-navy rounded-lg px-4 py-2 text-xs font-bold transition-all hover:opacity-95"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
                <Users className="mb-3 h-9 w-9 text-gray-300 dark:text-gray-600" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {search ? 'No contacts match your search' : 'No contacts found'}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {search
                    ? 'Try checking for typos or searching by email address.'
                    : 'Add contacts from employee directory or registrations.'}
                </p>
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="text-brand-gold mt-3 text-xs font-semibold hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}

            {!loading &&
              !error &&
              filtered.map((contact) => {
                const checked = isContactSelected(contact);
                const displayEmail = (contact.real_email || contact.email || '').trim();
                const roleInfo = ROLE_BADGE[contact.role] || ROLE_BADGE.client;

                return (
                  <div
                    key={contact.id}
                    onClick={() => onToggle(contact)}
                    className={`group flex cursor-pointer items-center gap-3.5 rounded-xl px-3.5 py-3 transition-all duration-150 ${
                      checked
                        ? 'border-brand-gold/30 bg-brand-gold/10 dark:border-brand-gold/30 dark:bg-brand-gold/15 shadow-xs'
                        : 'hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    {/* Custom Animated Checkbox */}
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${
                        checked
                          ? 'border-brand-gold bg-brand-gold text-brand-navy ring-brand-gold/30 shadow-xs ring-2'
                          : 'border-gray-300 bg-white group-hover:border-gray-400 dark:border-gray-600 dark:bg-white/5 dark:group-hover:border-gray-500'
                      }`}
                    >
                      {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>

                    {/* Initials Avatar */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-xs ${getAvatarColor(contact.id)}`}
                    >
                      {getInitials(contact.full_name)}
                    </div>

                    {/* Contact Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`truncate text-sm font-semibold transition-colors ${
                            checked
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {contact.full_name}
                        </span>
                        <span
                          className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9.5px] font-bold tracking-wider uppercase ${roleInfo.classes}`}
                        >
                          {roleInfo.label}
                        </span>
                      </div>
                      <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                        {displayEmail}
                      </span>
                    </div>

                    {/* Selected Badge */}
                    {checked && (
                      <div className="bg-brand-gold/20 text-brand-gold border-brand-gold/40 flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold">
                        <Check className="h-3 w-3" />
                        Selected
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/80 px-5 py-3.5 dark:border-white/10 dark:bg-[#111118]">
            <div className="flex items-center gap-2">
              {totalSelectedCount > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onClearAll) {
                      onClearAll();
                    } else {
                      contacts.forEach((c) => {
                        if (isContactSelected(c)) onToggle(c);
                      });
                    }
                  }}
                  className="text-xs font-semibold text-red-600 transition-colors hover:text-red-700 hover:underline dark:text-red-400 dark:hover:text-red-300"
                >
                  Clear Selection ({totalSelectedCount})
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSelectAll}
                  disabled={contacts.length === 0}
                  className="text-brand-gold hover:text-brand-gold/80 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {contacts.length > 0
                    ? `Select all contacts (${contacts.length})`
                    : 'No contacts available'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <Dialog.Close asChild>
                <button
                  type="button"
                  disabled={totalSelectedCount === 0}
                  className="bg-brand-gold text-brand-navy glow-gold rounded-xl px-5 py-2 text-xs font-bold transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add Selected ({totalSelectedCount})
                </button>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
