'use client';

import { X, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { StatusBadge } from './StatusBadge';
import { STATUS_OPTIONS } from './types';
import type { Registration } from './types';

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return value ? (
    <div>
      <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{label}</p>
      <p className="text-sm text-gray-800 dark:text-gray-200">{value}</p>
    </div>
  ) : null;
}

interface DetailModalProps {
  reg: Registration;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (reg: Registration) => void;
}

export function DetailModal({ reg, onClose, onStatusChange, onDelete }: DetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-md dark:bg-black/85">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="dark:border-brand-gold/20 dark:bg-brand-dark-surface relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl"
      >
        <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-white/8">
          <div>
            <div className="mb-1 flex items-center gap-3">
              <h2 className="text-brand-navy font-serif text-lg font-semibold dark:text-white">
                {reg.name} {reg.last_name || ''}
              </h2>
              <StatusBadge status={reg.status} />
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs text-gray-500">{reg.email}</p>
              {reg.submission_id && (
                <span className="bg-brand-gold/10 text-brand-gold inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider">
                  {reg.submission_id}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={reg.status}
              onChange={(e) => onStatusChange(reg.id, e.target.value)}
              className="focus:border-brand-gold appearance-none rounded border border-gray-200 bg-white px-2 py-1 text-[10px] font-bold text-gray-700 uppercase outline-none dark:border-white/10 dark:bg-[#111118] dark:text-gray-300"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => onDelete(reg)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
              title="Delete registration"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="hover:text-brand-gold cursor-pointer text-gray-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <h3 className="text-brand-gold mb-3 text-xs font-bold tracking-widest uppercase">
              Personal Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Submission ID" value={reg.submission_id} />
              <Field label="First Name" value={reg.name} />
              <Field label="Last Name" value={reg.last_name} />
              <Field label="Mobile" value={reg.phone} />
              <Field label="Email" value={reg.email} />
              <Field label="S/O, W/O, D/O" value={reg.so_wo_do} />
              <Field label="Date of Birth" value={reg.preferred_date} />
            </div>
          </div>

          <div>
            <h3 className="text-brand-gold mb-3 text-xs font-bold tracking-widest uppercase">
              Documents
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Aadhar Number" value={reg.aadhar_number} />
              <Field label="PAN Number" value={reg.pan_number} />
              {reg.photo_url && (
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Photo
                  </p>
                  <a
                    href={reg.photo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-gold text-sm underline"
                  >
                    View Photo
                  </a>
                </div>
              )}
              {reg.pan_card_file_url && (
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    PAN Card
                  </p>
                  <a
                    href={reg.pan_card_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-gold text-sm underline"
                  >
                    View PAN Card
                  </a>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-brand-gold mb-3 text-xs font-bold tracking-widest uppercase">
              Address
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="State" value={reg.state} />
              <Field label="City" value={reg.city} />
              <Field label="Address" value={reg.address} />
            </div>
          </div>

          <div>
            <h3 className="text-brand-gold mb-3 text-xs font-bold tracking-widest uppercase">
              Property & Payment
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Advisor" value={reg.advisor_name} />
              <Field label="Project" value={reg.project} />
              <Field label="Property Size" value={reg.property_size} />
              <Field label="Property Type" value={reg.property_type} />
              <Field label="Plot Preference" value={reg.plot_preference} />
              <Field label="Payment Plan" value={reg.payment_plan} />
              <Field label="Payment Mode" value={reg.payment_mode} />
              <Field label="Scheme Amount" value={reg.scheme_amount} />
            </div>
          </div>

          <Field label="Message" value={reg.message} />

          <p className="border-t border-gray-100 pt-4 text-xs text-gray-400 dark:border-white/8">
            Submitted on{' '}
            {new Date(reg.created_at).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
