'use client';

import { Mail, RefreshCw, Send, Settings, ShieldAlert, Sparkles, User } from 'lucide-react';
import { motion } from 'motion/react';
import { getSettingsDensity, getSettingsInputClass, SETTINGS_LABEL_CLASS } from './helpers';

interface EmailSettings {
  admin_email: string;
  send_user_copy: boolean;
  sender_name: string;
  sender_email: string;
  notify_on_registration: boolean;
  notify_on_contact: boolean;
  notify_on_grievance: boolean;
  bcc_advisor: boolean;
  retry_attempts: number;
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
  // EmailTab uses slightly different compact padding (py-2 vs py-1.5)
  const densityPadding = isCompact ? 'py-2 px-3' : 'py-2.5 px-4';
  const { densityGridGap, densitySecSpacing } = getSettingsDensity(isCompact);

  const cardClass =
    'bg-white dark:bg-[#0c0c12]/60 border border-gray-100 dark:border-white/5 rounded-xl p-5 md:p-6 shadow-sm';
  const inputClass = getSettingsInputClass(densityPadding);
  const labelClass = SETTINGS_LABEL_CLASS;

  return (
    <form onSubmit={handleSaveEmailSettings} className={densitySecSpacing}>
      {/* Title & Introduction */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-brand-navy mb-1 flex items-center gap-2 font-sans font-serif text-xl font-bold dark:text-white">
          <Settings className="text-brand-gold h-5 w-5" />
          Email System Settings
        </h2>
        <p className="font-sans text-xs text-gray-500 dark:text-gray-400">
          Supercharge your automated communications. Configure brand senders, target recipients,
          automated alerts, and routing retry tolerances.
        </p>
      </motion.div>

      {/* Grid of Sections */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${densityGridGap}`}>
        {/* Card 1: Sender Brand Profile */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className={`${cardClass} space-y-4`}
        >
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 dark:border-white/5">
            <Sparkles className="text-brand-gold h-4 w-4" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Sender Brand Profile
            </h3>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className={labelClass}>Sender Display Name</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  value={emailSettings.sender_name || ''}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, sender_name: e.target.value })
                  }
                  placeholder="SVI Infra"
                  className={`${inputClass} pl-10`}
                  required
                />
              </div>
              <p className="mt-1 text-[9px] text-gray-400 dark:text-gray-500">
                The friendly sender name display shown in client mailboxes.
              </p>
            </div>

            <div>
              <label className={labelClass}>Sender Email Address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Send className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="email"
                  value={emailSettings.sender_email || ''}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, sender_email: e.target.value })
                  }
                  placeholder="noreply@sviiinfrasolutions.com"
                  className={`${inputClass} pl-10`}
                  required
                />
              </div>
              <p className="mt-1 text-[9px] text-gray-400 dark:text-gray-500">
                Domain-verified address (requires Resend API domain configuration).
              </p>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Core Admin Recipient */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`${cardClass} flex flex-col justify-between space-y-4`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 dark:border-white/5">
              <ShieldAlert className="text-brand-gold h-4 w-4" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Admin Target Recipient
              </h3>
            </div>

            <div className="space-y-2.5">
              <label className={labelClass}>Admin Notification Email</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="email"
                  value={emailSettings.admin_email || ''}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, admin_email: e.target.value })
                  }
                  placeholder="admin@sviinfra.com"
                  className={`${inputClass} pl-10`}
                  required
                />
              </div>
              <p className="text-[10px] leading-relaxed text-gray-400 dark:text-gray-500">
                All auto-generated registrations, contact submissions, and client grievances will
                forward administrative copies to this designated address.
              </p>
            </div>
          </div>

          {/* Card 4 Inline: Dispatch Tolerances / Retries */}
          <div className="mt-4 border-t border-gray-100 pt-4 dark:border-white/5">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  Email Dispatch Retry Attempts
                </h4>
                <p className="text-[9px] text-gray-400 dark:text-gray-500">
                  Backoff retry allowance for transient SMTP/API outages.
                </p>
              </div>
              <select
                value={emailSettings.retry_attempts || 3}
                onChange={(e) =>
                  setEmailSettings({ ...emailSettings, retry_attempts: parseInt(e.target.value) })
                }
                className="focus:border-brand-gold rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 font-sans text-xs text-gray-900 outline-none focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
              >
                {[1, 2, 3, 4, 5].map((val) => (
                  <option key={val} value={val}>
                    {val} {val === 1 ? 'Attempt' : 'Attempts'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Alert Orchestration Toggles (Full Width) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className={`${cardClass} space-y-4 md:col-span-2`}
        >
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 dark:border-white/5">
            <Mail className="text-brand-gold h-4 w-4" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Email Notification Rules & Automation
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
            {/* Toggle 1: Send copy to applicant */}
            <div className="flex items-center justify-between gap-4 border-b border-gray-50 py-2 dark:border-white/[0.02]">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  Send Copy to Applicant
                </h4>
                <p className="max-w-sm text-[10px] text-gray-400 dark:text-gray-500">
                  Dispatch an automatic acknowledgment copy to registering clients immediately.
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
                className={`relative flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 ${
                  emailSettings.send_user_copy ? 'bg-brand-gold' : 'bg-gray-200 dark:bg-white/10'
                }`}
              >
                <span
                  className={`absolute left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                    emailSettings.send_user_copy ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: BCC Advisor */}
            <div className="flex items-center justify-between gap-4 border-b border-gray-50 py-2 dark:border-white/[0.02]">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  BCC Assigned Property Advisor
                </h4>
                <p className="max-w-sm text-[10px] text-gray-400 dark:text-gray-500">
                  Include the assigned client advisor as a blind carbon copy for transparency.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEmailSettings({ ...emailSettings, bcc_advisor: !emailSettings.bcc_advisor })
                }
                className={`relative flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 ${
                  emailSettings.bcc_advisor ? 'bg-brand-gold' : 'bg-gray-200 dark:bg-white/10'
                }`}
              >
                <span
                  className={`absolute left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                    emailSettings.bcc_advisor ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3: Registration Alert */}
            <div className="flex items-center justify-between gap-4 border-b border-gray-50 py-2 md:border-b-0 dark:border-white/[0.02]">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  Property Registration Alerts
                </h4>
                <p className="max-w-sm text-[10px] text-gray-400 dark:text-gray-500">
                  Trigger dynamic admin email notifications on new property submissions.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEmailSettings({
                    ...emailSettings,
                    notify_on_registration: !emailSettings.notify_on_registration,
                  })
                }
                className={`relative flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 ${
                  emailSettings.notify_on_registration
                    ? 'bg-brand-gold'
                    : 'bg-gray-200 dark:bg-white/10'
                }`}
              >
                <span
                  className={`absolute left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                    emailSettings.notify_on_registration ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 4: Contact Form Alert */}
            <div className="flex items-center justify-between gap-4 border-b border-gray-50 py-2 md:border-b-0 dark:border-white/[0.02]">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  Contact Form Alerts
                </h4>
                <p className="max-w-sm text-[10px] text-gray-400 dark:text-gray-500">
                  Trigger dynamic admin email notifications on new public inquiries.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEmailSettings({
                    ...emailSettings,
                    notify_on_contact: !emailSettings.notify_on_contact,
                  })
                }
                className={`relative flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 ${
                  emailSettings.notify_on_contact ? 'bg-brand-gold' : 'bg-gray-200 dark:bg-white/10'
                }`}
              >
                <span
                  className={`absolute left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                    emailSettings.notify_on_contact ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 5: Grievance Alert */}
            <div className="flex items-center justify-between gap-4 py-2 md:col-span-2">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  Grievance Ticket Alerts
                </h4>
                <p className="max-w-sm text-[10px] text-gray-400 dark:text-gray-500">
                  Trigger dynamic admin email notifications on new client grievance tickets.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEmailSettings({
                    ...emailSettings,
                    notify_on_grievance: !emailSettings.notify_on_grievance,
                  })
                }
                className={`relative flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 ${
                  emailSettings.notify_on_grievance
                    ? 'bg-brand-gold'
                    : 'bg-gray-200 dark:bg-white/10'
                }`}
              >
                <span
                  className={`absolute left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                    emailSettings.notify_on_grievance ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Save Button Row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex justify-end pt-2"
      >
        <motion.button
          type="submit"
          disabled={saveLoading}
          whileHover={{ scale: 1.012 }}
          whileTap={{ scale: 0.988 }}
          className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex cursor-pointer items-center justify-center gap-2 rounded-lg px-6 py-3 font-sans text-xs font-bold tracking-widest uppercase shadow-md transition-all disabled:opacity-60"
        >
          {saveLoading ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            'Save Email Configuration'
          )}
        </motion.button>
      </motion.div>
    </form>
  );
}
