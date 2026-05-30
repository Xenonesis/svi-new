'use client';

import { Mail, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface EmailSettings {
  admin_email: string;
  send_user_copy: boolean;
}

interface EmailTabProps {
  emailSettings: EmailSettings;
  setEmailSettings: React.Dispatch<React.SetStateAction<EmailSettings>>;
  saveLoading: boolean;
  handleSaveEmailSettings: (e: React.FormEvent) => Promise<void>;
  isCompact: boolean;
}

export function EmailTab({
  emailSettings,
  setEmailSettings,
  saveLoading,
  handleSaveEmailSettings,
  isCompact,
}: EmailTabProps) {
  const densityPadding = isCompact ? 'py-1.5 px-3' : 'py-2.5 px-4';
  const densityGridGap = isCompact ? 'gap-3.5' : 'gap-5';
  const densitySecSpacing = isCompact ? 'space-y-6' : 'space-y-8';

  const inputClass = `w-full bg-white dark:bg-[#111118] border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 transition-all outline-none font-sans ${densityPadding}`;
  const labelClass =
    'mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase font-sans';

  return (
    <form onSubmit={handleSaveEmailSettings} className={densitySecSpacing}>
      {/* Dynamic Intro Block */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-brand-navy mb-1 font-sans font-serif text-xl font-bold dark:text-white">
          Email Settings
        </h2>
        <p className="font-sans text-xs text-gray-500 dark:text-gray-400">
          Configure administrative notification recipients and applicant automated auto-responses.
        </p>
      </motion.div>

      {/* Inputs block */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className={`grid ${densityGridGap}`}
      >
        {/* Row 1: Admin Recipient Email */}
        <div className="space-y-1.5">
          <label className={labelClass}>Admin Recipient Email Address</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="email"
              value={emailSettings.admin_email}
              onChange={(e) => setEmailSettings({ ...emailSettings, admin_email: e.target.value })}
              placeholder="admin@sviinfra.com"
              className={`${inputClass} pl-10`}
              required
            />
          </div>
          <p className="font-sans text-[10px] text-gray-400 dark:text-gray-500">
            This email address will receive notification alerts for new property registrations,
            contact forms, and grievance tickets.
          </p>
        </div>

        {/* Row 2: Send User Copy Toggle */}
        <div className="border-t border-gray-100 pt-6 dark:border-white/5">
          <div className="flex items-center justify-between gap-6 py-1">
            <div className="space-y-0.5 font-sans">
              <h3 className="font-sans text-sm font-bold text-gray-900 dark:text-white">
                Send Confirmation Copy to Applicant
              </h3>
              <p className="max-w-lg font-sans text-xs text-gray-500 dark:text-gray-400">
                When enabled, registering applicants will automatically receive a beautifully
                branded email copy of their registration form details immediately after submission.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setEmailSettings({
                  ...emailSettings,
                  send_user_copy: !emailSettings.send_user_copy,
                })
              }
              className={`relative flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors duration-300 ${
                emailSettings.send_user_copy ? 'bg-brand-gold' : 'bg-gray-200 dark:bg-white/10'
              }`}
            >
              <span
                className={`absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                  emailSettings.send_user_copy ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Actions row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex justify-end pt-4"
      >
        <motion.button
          type="submit"
          disabled={saveLoading}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex cursor-pointer items-center justify-center gap-2 rounded-lg px-6 py-3.5 font-sans text-xs font-bold tracking-widest uppercase shadow-md transition-all disabled:opacity-60"
        >
          {saveLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Save Email Settings'}
        </motion.button>
      </motion.div>
    </form>
  );
}
