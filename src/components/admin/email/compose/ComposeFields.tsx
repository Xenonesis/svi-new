'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

interface ComposeFieldsProps {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  fromName: string;
  replyTo: string;
  adminEmail: string;
  forwardData?: any;
  replyData?: any;
  onToChange: (value: string) => void;
  onCcChange: (value: string) => void;
  onBccChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onFromNameChange: (value: string) => void;
  onReplyToChange: (value: string) => void;
}

export function ComposeFields({
  to,
  cc,
  bcc,
  subject,
  fromName,
  replyTo,
  adminEmail,
  forwardData,
  replyData,
  onToChange,
  onCcChange,
  onBccChange,
  onSubjectChange,
  onFromNameChange,
  onReplyToChange,
}: ComposeFieldsProps) {
  const [showAdvanced, setShowAdvanced] = useState(!!replyData);

  return (
    <div>
      {/* To */}
      <div className="flex items-center border-b border-gray-100 px-6 dark:border-gray-800">
        <label className="w-12 shrink-0 text-xs font-semibold tracking-wide text-gray-400 uppercase">
          To
        </label>
        <input
          type="text"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          placeholder="recipient@example.com"
          className="flex-1 bg-transparent py-3.5 text-sm text-gray-900 placeholder-gray-400/60 outline-none dark:text-white"
        />
        {!showAdvanced && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowAdvanced(true)}
              className="rounded-md border border-dashed border-gray-300 px-2 py-0.5 text-[10px] font-bold tracking-wide text-gray-400 transition-all hover:border-blue-400 hover:text-blue-500 dark:border-gray-700 dark:hover:border-blue-500"
            >
              +CC
            </button>
            <button
              onClick={() => setShowAdvanced(true)}
              className="rounded-md border border-dashed border-gray-300 px-2 py-0.5 text-[10px] font-bold tracking-wide text-gray-400 transition-all hover:border-violet-400 hover:text-violet-500 dark:border-gray-700 dark:hover:border-violet-500"
            >
              +BCC
            </button>
          </div>
        )}
      </div>

      {/* CC / BCC / From / Reply-To */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 140, damping: 20 }}
            className="overflow-hidden"
          >
            {[
              {
                id: 'cc-input',
                label: 'CC',
                value: cc,
                setter: onCcChange,
                placeholder: 'cc@example.com',
              },
              {
                id: 'bcc-input',
                label: 'BCC',
                value: bcc,
                setter: onBccChange,
                placeholder: 'bcc@example.com',
              },
            ].map((field) => (
              <div
                key={field.label}
                className="flex items-center border-b border-gray-100 px-6 dark:border-gray-800"
              >
                <label className="w-12 shrink-0 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  {field.label}
                </label>
                <input
                  id={field.id}
                  type="text"
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  placeholder={field.placeholder}
                  className="flex-1 bg-transparent py-3 text-sm text-gray-900 placeholder-gray-400/60 outline-none dark:text-white"
                />
                {field.value && (
                  <button
                    onClick={() => field.setter('')}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
            {/* From Name */}
            <div className="flex items-center border-b border-gray-100 px-6 dark:border-gray-800">
              <label className="w-12 shrink-0 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                From
              </label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => onFromNameChange(e.target.value)}
                placeholder="Sender Name"
                className="w-40 bg-transparent py-3 text-sm text-gray-900 placeholder-gray-400/60 outline-none dark:text-white"
              />
              <span className="font-mono text-xs text-gray-400/70">
                {'<noreply@sviiinfrasolutions.com>'}
              </span>
            </div>
            {/* Reply-To */}
            <div className="flex items-center border-b border-gray-100 px-6 dark:border-gray-800">
              <label className="w-12 shrink-0 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Reply
              </label>
              <input
                type="text"
                value={replyTo}
                onChange={(e) => onReplyToChange(e.target.value)}
                placeholder={adminEmail || 'reply@example.com'}
                className="flex-1 bg-transparent py-3 text-sm text-gray-900 placeholder-gray-400/60 outline-none dark:text-white"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subject */}
      <div className="flex items-center border-b border-gray-100 px-6 dark:border-gray-800">
        <label className="w-12 shrink-0 text-xs font-semibold tracking-wide text-gray-400 uppercase">
          Subj
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="Email subject..."
          className="flex-1 bg-transparent py-3.5 text-sm font-semibold text-gray-900 placeholder-gray-400/60 outline-none dark:text-white"
        />
      </div>
    </div>
  );
}
