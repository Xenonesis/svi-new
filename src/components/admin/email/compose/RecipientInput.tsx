'use client';

import {
  useRef,
  useState,
  useCallback,
  type KeyboardEvent,
  type FocusEvent,
  type ClipboardEvent,
} from 'react';
import {
  X,
  AlertCircle,
  CheckCircle,
  Users,
  Sparkles,
  Trophy,
  Building2,
  Briefcase,
  Flame,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchContacts } from '../helpers';
import { isValidEmail, detectEmailTypo } from '@/src/lib/utils/emailValidation';
import type { Recipient, Contact } from '../types';
interface RecipientInputProps {
  recipients: Recipient[];
  onChange: (recipients: Recipient[]) => void;
  placeholder?: string;
  disabled?: boolean;
  onOpenContactPicker?: () => void;
}

export function RecipientInput({
  recipients,
  onChange,
  placeholder = 'Add recipients',
  disabled = false,
  onOpenContactPicker,
}: RecipientInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [loadingSegment, setLoadingSegment] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInjectSegment = useCallback(
    async (segmentKey: 'winners' | 'allottees' | 'team' | 'hot_leads', label: string) => {
      if (disabled) return;
      setLoadingSegment(segmentKey);
      try {
        const allContacts = await fetchContacts();
        let matched: Contact[] = [];

        if (segmentKey === 'winners') {
          matched = allContacts.filter((c) => c.segments?.includes('lucky_draw_winners'));
        } else if (segmentKey === 'allottees') {
          matched = allContacts.filter((c) => c.segments?.includes('allotment_done'));
        } else if (segmentKey === 'team') {
          matched = allContacts.filter((c) => c.role === 'employee' || c.role === 'admin');
        } else if (segmentKey === 'hot_leads') {
          matched = allContacts.filter(
            (c) => c.segments?.includes('hot_calling_leads') || c.metadata?.temperature === 'hot'
          );
        }

        if (matched.length === 0) {
          toast.info(`No contacts found for segment: ${label}`);
          return;
        }

        const existingEmails = new Set(recipients.map((r) => r.email.trim().toLowerCase()));
        const newOnes: Recipient[] = [];

        for (const c of matched) {
          const primaryEmail = (c.real_email || c.email).trim();
          const primaryLower = primaryEmail.toLowerCase();
          if (primaryEmail && !existingEmails.has(primaryLower)) {
            existingEmails.add(primaryLower);
            newOnes.push({
              email: primaryEmail,
              name: c.full_name,
              type: c.role as Recipient['type'],
              valid: isValidEmail(primaryEmail),
            });
          }
        }

        if (newOnes.length === 0) {
          toast.info(`All ${matched.length} ${label} contacts are already in recipients`);
          return;
        }

        onChange([...recipients, ...newOnes]);
        toast.success(`Injected ${newOnes.length} ${label} to recipients`);
      } catch (err) {
        console.error('Failed to inject segment:', err);
        toast.error(`Failed to load ${label}`);
      } finally {
        setLoadingSegment(null);
      }
    },
    [recipients, onChange, disabled]
  );
  const addRecipient = useCallback(
    (raw: string) => {
      const email = raw.trim().replace(/,$/, '').trim();
      if (!email) return;

      // Dedup by normalized email
      const normalized = email.toLowerCase();
      if (recipients.some((r) => r.email.toLowerCase() === normalized)) return;

      const valid = isValidEmail(email);
      onChange([...recipients, { email: email, type: 'manual', valid }]);
    },
    [recipients, onChange]
  );

  const removeRecipient = useCallback(
    (index: number) => {
      onChange(recipients.filter((_, i) => i !== index));
    },
    [recipients, onChange]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addRecipient(inputValue);
        setInputValue('');
      }
      return;
    }

    if (e.key === 'Backspace' && !inputValue && recipients.length > 0) {
      removeRecipient(recipients.length - 1);
      return;
    }

    if (e.key === 'ArrowLeft' && !inputValue && recipients.length > 0) {
      setFocusedIndex(recipients.length - 1);
      return;
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    // Only add if the blur wasn't caused by clicking a chip's remove button
    if (inputValue.trim() && !e.relatedTarget?.closest('[data-recipient-remove]')) {
      addRecipient(inputValue);
      setInputValue('');
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (text.includes(',') || text.includes(';') || text.includes('\n')) {
      e.preventDefault();
      const emails = text
        .split(/[,;\n]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const updated = [...recipients];
      for (const raw of emails) {
        const email = raw.trim();
        if (!email) continue;
        const normalized = email.toLowerCase();
        if (updated.some((r) => r.email.toLowerCase() === normalized)) continue;
        const valid = isValidEmail(email);
        updated.push({ email, type: 'manual' as const, valid });
      }
      onChange(updated);
    }
  };

  const invalidCount = recipients.filter((r) => !r.valid).length;

  // Detect any common domain typos across active recipients
  const typoSuggestions = recipients
    .map((r, idx) => ({ ...detectEmailTypo(r.email), index: idx }))
    .filter(
      (
        s
      ): s is {
        original: string;
        suggested: string;
        domain: string;
        suggestedDomain: string;
        index: number;
      } => Boolean(s && s.suggested)
    );

  const handleFixTypo = (index: number, suggested: string) => {
    const updated = [...recipients];
    updated[index] = { ...updated[index], email: suggested, valid: isValidEmail(suggested) };
    onChange(updated);
  };

  return (
    <div className="flex-1">
      <div
        className={`flex flex-wrap items-center gap-1.5 py-2 ${disabled ? 'opacity-50' : ''}`}
        onClick={() => inputRef.current?.focus()}
      >
        {recipients.map((recipient, i) => (
          <span
            key={`${recipient.email}-${i}`}
            data-focused={focusedIndex === i ? true : undefined}
            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-medium transition-all ${
              !recipient.valid
                ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400'
                : recipient.type !== 'manual'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                  : 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
            } ${focusedIndex === i ? 'ring-brand-gold/50 ring-2' : ''}`}
          >
            {recipient.valid ? (
              <CheckCircle className="h-3 w-3 shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="h-3 w-3 shrink-0 text-red-500" />
            )}
            <span
              className="break-all"
              title={recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email}
            >
              {recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email}
            </span>
            <button
              type="button"
              data-recipient-remove
              onClick={(e) => {
                e.stopPropagation();
                removeRecipient(i);
              }}
              className="ml-0.5 rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onPaste={handlePaste}
          placeholder={recipients.length === 0 ? placeholder : ''}
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="min-w-[140px] flex-1 bg-transparent py-0.5 text-sm font-medium text-gray-900 placeholder-gray-400/60 outline-none focus:outline-none focus-visible:shadow-none focus-visible:ring-0 focus-visible:outline-none dark:text-gray-100"
        />
        {onOpenContactPicker && (
          <button
            type="button"
            onClick={onOpenContactPicker}
            className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold hover:border-brand-gold/50 hover:bg-brand-gold/20 dark:border-brand-gold/20 dark:bg-brand-gold/10 ml-1 flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase transition-all"
            title="Add Contacts"
          >
            <Users className="h-3 w-3" />
            <span>+Contacts</span>
          </button>
        )}
      </div>
      {/* Quick ERP Segment Injection Pills */}
      <div className="mt-1 flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
          Quick Segments:
        </span>
        {[
          {
            key: 'winners' as const,
            label: 'Winners',
            icon: Trophy,
            color:
              'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20',
          },
          {
            key: 'allottees' as const,
            label: 'Allottees',
            icon: Building2,
            color:
              'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20',
          },
          {
            key: 'team' as const,
            label: 'Team',
            icon: Briefcase,
            color:
              'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20',
          },
          {
            key: 'hot_leads' as const,
            label: 'Hot Leads',
            icon: Flame,
            color:
              'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20',
          },
        ].map((seg) => {
          const Icon = seg.icon;
          const isLoading = loadingSegment === seg.key;
          return (
            <button
              key={seg.key}
              type="button"
              disabled={disabled || Boolean(loadingSegment)}
              onClick={() => handleInjectSegment(seg.key, seg.label)}
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-all disabled:opacity-50 ${seg.color}`}
              title={`Quick inject ${seg.label} into recipients`}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Icon className="h-3 w-3 shrink-0" />
              )}
              <span>+ {seg.label}</span>
            </button>
          );
        })}
      </div>
      {invalidCount > 0 && (
        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-red-500">
          <AlertCircle className="h-3 w-3" />
          <span>
            {invalidCount} invalid {invalidCount === 1 ? 'address' : 'addresses'}
          </span>
        </div>
      )}
      {typoSuggestions.length > 0 && (
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {typoSuggestions.map((t) => (
            <div
              key={t.original}
              className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
            >
              <span>
                Did you mean <strong>{t.suggestedDomain}</strong> instead of {t.domain}?
              </span>
              <button
                type="button"
                onClick={() => handleFixTypo(t.index, t.suggested)}
                className="inline-flex items-center gap-1 rounded bg-amber-600 px-1.5 py-0.5 font-bold text-white transition-colors hover:bg-amber-700 dark:bg-amber-500 dark:text-black dark:hover:bg-amber-400"
              >
                <Sparkles className="h-2.5 w-2.5" />
                Fix
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
