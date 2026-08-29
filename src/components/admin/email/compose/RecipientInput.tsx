'use client';

import {
  useRef,
  useState,
  useCallback,
  type KeyboardEvent,
  type FocusEvent,
  type ClipboardEvent,
} from 'react';
import { X, AlertCircle, CheckCircle, Users } from 'lucide-react';
import { isValidEmail } from '@/src/lib/utils/emailValidation';
import type { Recipient } from '../types';

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
  const inputRef = useRef<HTMLInputElement>(null);

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
          className="min-w-[120px] flex-1 bg-transparent py-0.5 text-sm text-gray-900 placeholder-gray-400/60 outline-none dark:text-white"
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
      {invalidCount > 0 && (
        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-red-500">
          <AlertCircle className="h-3 w-3" />
          <span>
            {invalidCount} invalid {invalidCount === 1 ? 'address' : 'addresses'}
          </span>
        </div>
      )}
    </div>
  );
}
