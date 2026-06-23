'use client';

import { X, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { StatusBadge } from './StatusBadge';
import { STATUS_OPTIONS } from './types';
import type { Registration } from './types';

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return value ? (
    <div className="min-w-0">
      <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase sm:text-[10px]">
        {label}
      </p>
      <p className="truncate text-xs font-medium text-gray-800 sm:text-sm dark:text-gray-200">
        {value}
      </p>
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
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#111118]"
      >
        <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-5 dark:border-white/10 dark:bg-[#15151c]">
          <div>
            <div className="mb-1 flex items-center gap-3">
              <h2 className="text-brand-navy font-serif text-lg font-semibold dark:text-white">
                {reg.name} {reg.last_name || ''}
              </h2>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="focus:ring-brand-gold/50 rounded-full ring-offset-2 ring-offset-white outline-none focus:ring-2 dark:ring-offset-[#111118]">
                    <StatusBadge status={reg.status} />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="animate-in fade-in zoom-in-95 z-[60] min-w-[140px] rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#1a1a24]"
                    sideOffset={8}
                  >
                    <DropdownMenu.Label className="px-2 py-1.5 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
                      Update Status
                    </DropdownMenu.Label>
                    {STATUS_OPTIONS.map((status) => (
                      <DropdownMenu.Item
                        key={status.value}
                        onClick={() => onStatusChange(reg.id, status.value)}
                        className="group relative flex cursor-pointer items-center rounded-md px-2 py-2 text-xs font-medium text-gray-700 outline-none select-none hover:bg-gray-100 hover:text-gray-900 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white dark:data-[highlighted]:bg-white/5 dark:data-[highlighted]:text-white"
                      >
                        <div
                          className={`mr-2 h-2 w-2 rounded-full ${
                            status.value === 'Approved'
                              ? 'bg-emerald-500'
                              : status.value === 'Pending'
                                ? 'bg-amber-500'
                                : status.value === 'Rejected'
                                  ? 'bg-red-500'
                                  : 'bg-gray-400'
                          }`}
                        />
                        {status.label}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
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
            <button
              onClick={() => onDelete(reg)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
              title="Delete registration"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <div className="h-6 w-px bg-gray-200 dark:bg-white/10" />
            <button
              onClick={onClose}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-8 p-6 sm:p-8">
          <div>
            <h3 className="text-brand-gold mb-4 flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
              <span className="bg-brand-gold/20 h-px flex-1" /> Personal Details{' '}
              <span className="bg-brand-gold/20 h-px flex-1" />
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
              <Field label="First Name" value={reg.name} />
              <Field label="Last Name" value={reg.last_name} />
              <Field label="S/O, W/O, D/O" value={reg.so_wo_do} />
              <Field label="Mobile" value={reg.phone} />
              <Field label="Date of Birth" value={reg.preferred_date} />
              <Field label="Submission ID" value={reg.submission_id} />
            </div>
          </div>

          <div>
            <h3 className="text-brand-gold mb-4 flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
              <span className="bg-brand-gold/20 h-px flex-1" /> Documents{' '}
              <span className="bg-brand-gold/20 h-px flex-1" />
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
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
                    className="text-brand-gold hover:text-brand-gold/80 text-sm font-medium underline"
                  >
                    View Document
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
                    className="text-brand-gold hover:text-brand-gold/80 text-sm font-medium underline"
                  >
                    View Document
                  </a>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-brand-gold mb-4 flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
              <span className="bg-brand-gold/20 h-px flex-1" /> Address{' '}
              <span className="bg-brand-gold/20 h-px flex-1" />
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
              <Field label="State" value={reg.state} />
              <Field label="City" value={reg.city} />
              <div className="col-span-2 sm:col-span-1">
                <Field label="Address" value={reg.address} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-brand-gold mb-4 flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
              <span className="bg-brand-gold/20 h-px flex-1" /> Property & Payment{' '}
              <span className="bg-brand-gold/20 h-px flex-1" />
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
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

          {reg.message && (
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5">
              <Field label="Additional Message" value={reg.message} />
            </div>
          )}

          <p className="text-center text-[10px] font-medium tracking-widest text-gray-400 uppercase">
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
