'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { RecipientInput } from './RecipientInput';
import type { Recipient } from '../types';

interface ComposeFieldsProps {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  fromName: string;
  replyTo: string;
  adminEmail: string;
  scheduledAt?: string | null;
  forwardData?: any;
  replyData?: any;
  onToChange: (value: string) => void;
  onCcChange: (value: string) => void;
  onBccChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onFromNameChange: (value: string) => void;
  onReplyToChange: (value: string) => void;
  onScheduledAtChange?: (value: string | null) => void;
  toRecipients?: Recipient[];
  onToRecipientsChange?: (recipients: Recipient[]) => void;
  onOpenContactPicker?: () => void;
  ccRecipients?: Recipient[];
  onCcRecipientsChange?: (recipients: Recipient[]) => void;
  onOpenCcContactPicker?: () => void;
  bccRecipients?: Recipient[];
  onBccRecipientsChange?: (recipients: Recipient[]) => void;
  onOpenBccContactPicker?: () => void;
}

export function ComposeFields({
  to,
  cc,
  bcc,
  subject,
  fromName,
  replyTo,
  adminEmail,
  scheduledAt,
  forwardData,
  replyData,
  onToChange,
  onCcChange,
  onBccChange,
  onSubjectChange,
  onFromNameChange,
  onReplyToChange,
  onScheduledAtChange,
  toRecipients,
  onToRecipientsChange,
  onOpenContactPicker,
  ccRecipients,
  onCcRecipientsChange,
  onOpenCcContactPicker,
  bccRecipients,
  onBccRecipientsChange,
  onOpenBccContactPicker,
}: ComposeFieldsProps) {
  const [showCcField, setShowCcField] = useState(false);
  const [showBccField, setShowBccField] = useState(false);
  const cleanReply = replyTo.trim();
  const isDefaultReply =
    !cleanReply ||
    cleanReply === `info@sviinfrasolutions.com, ${adminEmail}` ||
    cleanReply === `info@sviiinfrasolutions.com, ${adminEmail}` ||
    cleanReply === `info@sviinfrasolutions.com, hr.sviinfrasolutions@gmail.com` ||
    cleanReply === `info@sviiinfrasolutions.com, hr.sviinfrasolutions@gmail.com` ||
    cleanReply === 'info@sviinfrasolutions.com' ||
    cleanReply === 'info@sviiinfrasolutions.com' ||
    cleanReply === adminEmail;
  const hasCustomReply = Boolean(cleanReply && !isDefaultReply);

  const [showSenderOptions, setShowSenderOptions] = useState(
    Boolean(hasCustomReply || (fromName && fromName !== 'SVI Infra'))
  );
  const [showScheduleOptions, setShowScheduleOptions] = useState(!!scheduledAt);

  // Auto-show CC/BCC when they have values (from reply/forward/contacts)
  const showCc = showCcField || !!cc || (ccRecipients && ccRecipients.length > 0);
  const showBcc = showBccField || !!bcc || (bccRecipients && bccRecipients.length > 0);

  // Synchronize internal visibility states with external prop updates (e.g. template loading, replies, forwards)
  useEffect(() => {
    if (hasCustomReply || (fromName && fromName !== 'SVI Infra')) {
      setShowSenderOptions(true);
    }
  }, [replyTo, fromName, adminEmail]);

  useEffect(() => {
    if (scheduledAt) setShowScheduleOptions(true);
  }, [scheduledAt]);

  return (
    <div>
      {/* To */}
      <div className="flex flex-col border-b border-gray-100 px-4 pt-2 pb-2 sm:flex-row sm:items-start sm:px-6 dark:border-gray-800">
        <div className="flex w-full min-w-0 flex-1 items-start">
          <label className="mt-2 w-12 shrink-0 text-xs font-semibold tracking-wide text-gray-400 uppercase">
            To
          </label>
          <div className="min-w-0 flex-1">
            {toRecipients !== undefined && onToRecipientsChange ? (
              <RecipientInput
                recipients={toRecipients}
                onChange={onToRecipientsChange}
                placeholder="Add recipients (email, or press Enter to add)"
                onOpenContactPicker={onOpenContactPicker}
              />
            ) : (
              <input
                type="text"
                value={to}
                onChange={(e) => onToChange(e.target.value)}
                placeholder="recipient@example.com"
                className="w-full bg-transparent py-3.5 text-sm text-gray-900 placeholder-gray-400/60 outline-none dark:text-white"
              />
            )}
          </div>
        </div>
        <div className="mt-2 flex shrink-0 flex-wrap items-center gap-1.5 self-start pl-12 sm:mt-2 sm:ml-2 sm:self-auto sm:pl-0">
          {!showCc && (
            <button
              type="button"
              onClick={() => setShowCcField(true)}
              className="rounded-md border border-blue-200/60 bg-blue-50/80 px-2 py-0.5 text-[10px] font-bold tracking-wide text-blue-600 transition-all hover:border-blue-300 hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400"
            >
              +CC
            </button>
          )}
          {!showBcc && (
            <button
              type="button"
              onClick={() => setShowBccField(true)}
              className="rounded-md border border-violet-200/60 bg-violet-50/80 px-2 py-0.5 text-[10px] font-bold tracking-wide text-violet-600 transition-all hover:border-violet-300 hover:bg-violet-100 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400"
            >
              +BCC
            </button>
          )}
          {!showSenderOptions && (
            <button
              type="button"
              onClick={() => setShowSenderOptions(true)}
              className="rounded-md border border-emerald-200/60 bg-emerald-50/80 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-600 transition-all hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
            >
              +Sender
            </button>
          )}
          {!showScheduleOptions && (
            <button
              type="button"
              onClick={() => setShowScheduleOptions(true)}
              className="rounded-md border border-orange-200/60 bg-orange-50/80 px-2 py-0.5 text-[10px] font-bold tracking-wide text-orange-600 transition-all hover:border-orange-300 hover:bg-orange-100 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400"
            >
              +Schedule
            </button>
          )}
        </div>
      </div>

      {/* CC Field Row */}
      <AnimatePresence>
        {showCc && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 140, damping: 20 }}
            className="overflow-hidden"
          >
            <div className="flex items-start border-b border-gray-100 px-4 py-1 sm:px-6 dark:border-gray-800">
              <label className="mt-2.5 w-12 shrink-0 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                CC
              </label>
              <div className="min-w-0 flex-1">
                {ccRecipients !== undefined && onCcRecipientsChange ? (
                  <RecipientInput
                    recipients={ccRecipients}
                    onChange={onCcRecipientsChange}
                    placeholder="Add CC recipients"
                    onOpenContactPicker={onOpenCcContactPicker}
                  />
                ) : (
                  <input
                    id="cc-input"
                    type="text"
                    value={cc}
                    onChange={(e) => onCcChange(e.target.value)}
                    placeholder="cc@example.com"
                    className="w-full bg-transparent py-3 text-sm text-gray-900 placeholder-gray-400/60 outline-none dark:text-white"
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  onCcChange('');
                  if (onCcRecipientsChange) onCcRecipientsChange([]);
                  setShowCcField(false);
                }}
                className="mt-2.5 ml-2 text-gray-400 hover:text-red-400"
                title="Remove CC field"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BCC Field Row */}
      <AnimatePresence>
        {showBcc && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 140, damping: 20 }}
            className="overflow-hidden"
          >
            <div className="flex items-start border-b border-gray-100 px-4 py-1 sm:px-6 dark:border-gray-800">
              <label className="mt-2.5 w-12 shrink-0 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                BCC
              </label>
              <div className="min-w-0 flex-1">
                {bccRecipients !== undefined && onBccRecipientsChange ? (
                  <RecipientInput
                    recipients={bccRecipients}
                    onChange={onBccRecipientsChange}
                    placeholder="Add BCC recipients"
                    onOpenContactPicker={onOpenBccContactPicker}
                  />
                ) : (
                  <input
                    id="bcc-input"
                    type="text"
                    value={bcc}
                    onChange={(e) => onBccChange(e.target.value)}
                    placeholder="bcc@example.com"
                    className="w-full bg-transparent py-3 text-sm text-gray-900 placeholder-gray-400/60 outline-none dark:text-white"
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  onBccChange('');
                  if (onBccRecipientsChange) onBccRecipientsChange([]);
                  setShowBccField(false);
                }}
                className="mt-2.5 ml-2 text-gray-400 hover:text-red-400"
                title="Remove BCC field"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sender Options Row */}
      <AnimatePresence>
        {showSenderOptions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 140, damping: 20 }}
            className="overflow-hidden"
          >
            {/* From Name */}
            <div className="flex flex-wrap items-center border-b border-gray-100 px-4 py-2 sm:flex-nowrap sm:px-6 sm:py-0 dark:border-gray-800">
              <label className="w-12 shrink-0 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                From
              </label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => onFromNameChange(e.target.value)}
                placeholder="Sender Name"
                className="w-full bg-transparent py-1 text-sm text-gray-900 placeholder-gray-400/60 outline-none sm:w-40 sm:py-3 dark:text-white"
              />
              <span className="mt-1 flex-1 truncate pr-2 font-mono text-xs text-gray-400/70 sm:mt-0">
                {'<noreply@sviiinfrasolutions.com>'}
              </span>
              <button
                type="button"
                onClick={() => {
                  onReplyToChange('');
                  onFromNameChange('SVI Infra');
                  setShowSenderOptions(false);
                }}
                className="ml-2 shrink-0 text-gray-400 hover:text-red-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            {/* Reply-To */}
            <div className="flex items-center border-b border-gray-100 px-4 sm:px-6 dark:border-gray-800">
              <label className="w-16 shrink-0 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Reply-To
              </label>
              <input
                type="text"
                value={replyTo}
                onChange={(e) => onReplyToChange(e.target.value)}
                placeholder={adminEmail || 'reply@example.com'}
                className="min-w-0 flex-1 bg-transparent py-3 text-sm text-gray-900 placeholder-gray-400/60 outline-none dark:text-white"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Row */}
      <AnimatePresence>
        {showScheduleOptions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 140, damping: 20 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center border-b border-gray-100 px-4 py-2 sm:flex-nowrap sm:px-6 sm:py-0 dark:border-gray-800">
              <label className="w-12 shrink-0 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Send At
              </label>
              <input
                type="datetime-local"
                value={scheduledAt || ''}
                onChange={(e) => onScheduledAtChange?.(e.target.value || null)}
                className="mt-1 w-full bg-transparent py-1 text-sm text-gray-900 outline-none sm:mt-0 sm:w-auto sm:py-3 dark:text-white"
              />
              <span className="mt-1 ml-0 flex-1 text-xs text-gray-400/70 sm:mt-0 sm:ml-3">
                (Leave empty to send immediately)
              </span>
              <button
                type="button"
                onClick={() => {
                  onScheduledAtChange?.(null);
                  setShowScheduleOptions(false);
                }}
                className="ml-2 shrink-0 text-gray-400 hover:text-red-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subject */}
      <div className="flex items-center border-b border-gray-100 px-4 py-0 sm:px-6 dark:border-gray-800">
        <label className="w-12 shrink-0 text-xs font-semibold tracking-wide text-gray-400 uppercase">
          Subj
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="Email subject..."
          className="min-w-0 flex-1 bg-transparent py-2.5 text-sm font-semibold text-gray-900 placeholder-gray-400/60 outline-none sm:py-3.5 dark:text-white"
        />
      </div>
    </div>
  );
}
