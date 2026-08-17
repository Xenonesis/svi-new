'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Search, Loader2, Check, Users } from 'lucide-react';
import { getToken } from '../helpers';
import type { Contact } from '../types';

interface ContactPickerProps {
  open: boolean;
  onClose: () => void;
  selectedEmails: Set<string>;
  onToggle: (contact: Contact) => void;
  onSelectAll: () => void;
  title?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
  'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const ROLE_BADGE: Record<string, { label: string; classes: string }> = {
  employee: {
    label: 'Emp',
    classes: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  },
  admin: {
    label: 'Admin',
    classes: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',
  },
  client: {
    label: 'Client',
    classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  },
};

export function ContactPicker({
  open,
  onClose,
  selectedEmails,
  onToggle,
  onSelectAll,
  title = 'Select Contacts',
}: ContactPickerProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const cached = useRef<Contact[] | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
      // Short timeout to let the dialog render
      const id = setTimeout(() => searchInputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.real_email && c.real_email.toLowerCase().includes(q))
    );
  }, [contacts, search]);

  const selectedCount = filtered.filter((c) => selectedEmails.has(c.email)).length;

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
    <Dialog.Root open={open} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="dark:bg-brand-dark-surface fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl dark:border-gray-700/60">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
            <Dialog.Title className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <Users className="text-brand-gold h-4 w-4" />
              {title}
            </Dialog.Title>
            <Dialog.Close className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* Search */}
          <div className="border-b border-gray-100 px-5 py-3 dark:border-gray-800">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search contacts..."
                className="focus:border-brand-gold/50 dark:focus:border-brand-gold/50 w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 text-sm text-gray-900 transition-colors outline-none focus:bg-white dark:border-gray-700/60 dark:bg-black/20 dark:text-white"
              />
            </div>
          </div>

          {/* Contact list */}
          <div className="max-h-[320px] overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="text-brand-gold h-6 w-6 animate-spin" />
              </div>
            )}

            {error && (
              <div className="px-5 py-8 text-center">
                <p className="mb-3 text-sm text-red-500">{error}</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 rounded-lg px-4 py-2 text-xs font-medium transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
            {!loading && !error && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                <Users className="mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {search ? 'No contacts match your search.' : 'No contacts available.'}
                </p>
              </div>
            )}

            {!loading &&
              !error &&
              filtered.map((contact) => {
                const checked = selectedEmails.has(contact.email);
                const displayEmail = contact.real_email || contact.email;
                return (
                  <label
                    key={contact.id}
                    className={`flex cursor-pointer items-center gap-3 border-b border-gray-50 px-5 py-3 transition-colors last:border-0 hover:bg-gray-50 dark:border-gray-800/50 dark:hover:bg-white/[0.02] ${
                      checked ? 'bg-brand-gold/5 dark:bg-brand-gold/5' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(contact)}
                      className="text-brand-gold focus:ring-brand-gold h-4 w-4 rounded border-gray-300 dark:border-gray-600 dark:bg-black/20"
                    />
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${getAvatarColor(contact.id)}`}
                    >
                      {getInitials(contact.full_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {contact.full_name}
                        </span>
                        <span
                          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${(ROLE_BADGE[contact.role] || ROLE_BADGE.client).classes}`}
                        >
                          {(ROLE_BADGE[contact.role] || ROLE_BADGE.client).label}
                        </span>
                      </div>
                      <span className="block truncate text-xs text-gray-400">{displayEmail}</span>
                    </div>
                    {checked && <Check className="text-brand-gold h-4 w-4 shrink-0" />}
                  </label>
                );
              })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 dark:border-gray-800">
            <button
              type="button"
              onClick={() => {
                if (contacts.length > 0) {
                  onSelectAll();
                }
              }}
              disabled={contacts.length === 0}
              className="text-brand-gold text-xs font-medium transition-colors hover:opacity-80 disabled:opacity-50"
            >
              {contacts.length > 0
                ? `Add all contacts (${contacts.length})`
                : 'No contacts available'}
            </button>
            <div className="flex items-center gap-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <Dialog.Close asChild>
                <button
                  type="button"
                  disabled={selectedCount === 0}
                  className="bg-brand-gold text-brand-navy glow-gold rounded-xl px-5 py-2.5 text-xs font-bold transition-all hover:opacity-95 disabled:opacity-50"
                >
                  Add Selected ({selectedCount})
                </button>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
