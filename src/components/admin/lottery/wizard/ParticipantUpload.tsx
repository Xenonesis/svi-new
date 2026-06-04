'use client';

import { motion } from 'motion/react';
import {
  FileSpreadsheet,
  FileText,
  Plus,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { RefObject } from 'react';

interface Participant {
  name: string;
  phone?: string;
  email?: string;
  ticketNumber: string;
}

interface ParticipantUploadProps {
  participants: Participant[];
  searchTerm: string;
  currentPage: number;
  itemsPerPage: number;
  entryMethod: 'upload' | 'manual';
  dragOver: boolean;
  manualName: string;
  manualPhone: string;
  manualEmail: string;
  manualTicket: string;
  totalPages: number;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onSearchTermChange: (value: string) => void;
  onCurrentPageChange: (page: number) => void;
  onEntryMethodChange: (method: 'upload' | 'manual') => void;
  onManualNameChange: (value: string) => void;
  onManualPhoneChange: (value: string) => void;
  onManualEmailChange: (value: string) => void;
  onManualTicketChange: (value: string) => void;
  onDragOverChange: (value: boolean) => void;
  onFileUpload: (file: File) => void;
  onManualAdd: () => void;
  onRemoveParticipant: (index: number) => void;
  onSetErrorMessage: (msg: string | null) => void;
  onSetSuccessMessage: (msg: string | null) => void;
  paginatedParticipants: Participant[];
}

export function ParticipantUpload({
  participants,
  searchTerm,
  currentPage,
  itemsPerPage,
  entryMethod,
  dragOver,
  manualName,
  manualPhone,
  manualEmail,
  manualTicket,
  totalPages,
  fileInputRef,
  onSearchTermChange,
  onCurrentPageChange,
  onEntryMethodChange,
  onManualNameChange,
  onManualPhoneChange,
  onManualEmailChange,
  onManualTicketChange,
  onDragOverChange,
  onFileUpload,
  onManualAdd,
  onRemoveParticipant,
  onSetErrorMessage,
  onSetSuccessMessage,
  paginatedParticipants,
}: ParticipantUploadProps) {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h3 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
          Load Participants
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
          Upload your customer spreadsheet or add entries manually.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/5">
            <div className="mb-6 flex gap-2 rounded-xl bg-slate-200 p-1 dark:bg-black/40">
              <button
                type="button"
                onClick={() => onEntryMethodChange('upload')}
                className={`flex-1 rounded-lg py-2.5 text-[10px] font-bold tracking-widest uppercase transition-all ${
                  entryMethod === 'upload'
                    ? 'text-brand-gold bg-white shadow-sm dark:bg-white/10'
                    : 'text-slate-500 hover:text-slate-900 dark:text-gray-500 dark:hover:text-white'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => onEntryMethodChange('manual')}
                className={`flex-1 rounded-lg py-2.5 text-[10px] font-bold tracking-widest uppercase transition-all ${
                  entryMethod === 'manual'
                    ? 'text-brand-gold bg-white shadow-sm dark:bg-white/10'
                    : 'text-slate-500 hover:text-slate-900 dark:text-gray-500 dark:hover:text-white'
                }`}
              >
                Manual
              </button>
            </div>
            {entryMethod === 'upload' ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  onDragOverChange(true);
                }}
                onDragLeave={() => onDragOverChange(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  onDragOverChange(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUploadWrapper(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                  dragOver
                    ? 'border-brand-gold bg-brand-gold/5'
                    : 'border-slate-300 hover:border-slate-400 dark:border-white/20 dark:hover:border-white/40'
                }`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10">
                  <FileSpreadsheet className="h-7 w-7 text-slate-500 dark:text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-gray-300">
                  Drop your file here or click to browse
                </p>
                <p className="text-[10px] text-slate-400 dark:text-gray-500">
                  Supports .csv, .xlsx, .xls — Name, Phone, Email, Ticket# columns
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFileUploadWrapper(e.target.files[0])
                  }
                  className="hidden"
                />
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onManualAdd();
                }}
                className="space-y-3"
              >
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={manualName}
                  onChange={(e) => onManualNameChange(e.target.value)}
                  className="focus:border-brand-gold/50 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Ticket Number (auto if left blank)"
                  value={manualTicket}
                  onChange={(e) => onManualTicketChange(e.target.value)}
                  className="focus:border-brand-gold/50 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={manualPhone}
                  onChange={(e) => onManualPhoneChange(e.target.value)}
                  className="focus:border-brand-gold/50 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Email"
                  value={manualEmail}
                  onChange={(e) => onManualEmailChange(e.target.value)}
                  className="focus:border-brand-gold/50 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white"
                />
                <button
                  type="submit"
                  className="bg-brand-gold text-brand-navy w-full cursor-pointer rounded-xl py-2.5 text-xs font-bold tracking-wider uppercase transition-all hover:opacity-90"
                >
                  <Plus className="mr-1.5 inline h-4 w-4" /> Add Participant
                </button>
              </form>
            )}
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  onSearchTermChange(e.target.value);
                  onCurrentPageChange(1);
                }}
                placeholder="Search loaded participants..."
                className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder-gray-500"
              />
              <span className="text-xs text-slate-500 dark:text-gray-400">
                {participants.length} entries
              </span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {paginatedParticipants.length === 0 ? (
                <div className="flex flex-col items-center gap-4 p-12 text-center">
                  <FileText className="h-10 w-10 text-slate-300 dark:text-gray-600" />
                  <div>
                    <p className="font-bold text-slate-600 dark:text-gray-300">
                      No participants loaded
                    </p>
                    <p className="text-xs text-slate-400 dark:text-gray-500">
                      Upload a file or add manually to see the list.
                    </p>
                  </div>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:border-white/5 dark:text-gray-500">
                      <th className="px-4 py-2.5">#</th>
                      <th className="px-4 py-2.5">Name</th>
                      <th className="px-4 py-2.5">Phone</th>
                      <th className="px-4 py-2.5">Email</th>
                      <th className="px-4 py-2.5">Ticket</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                    {paginatedParticipants.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5">
                        <td className="px-4 py-3 text-slate-400">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                          {p.name}
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-gray-400">
                          {p.phone || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-gray-400">
                          {p.email || '—'}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs font-bold text-violet-700 dark:text-violet-400">
                          {p.ticketNumber}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() =>
                              onRemoveParticipant((currentPage - 1) * itemsPerPage + idx)
                            }
                            className="cursor-pointer text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <span className="text-xs text-slate-500 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => onCurrentPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-30 dark:border-white/10 dark:bg-black/40 dark:text-gray-300 dark:hover:bg-black/60"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onCurrentPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-30 dark:border-white/10 dark:bg-black/40 dark:text-gray-300 dark:hover:bg-black/60"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  function handleFileUploadWrapper(file: File) {
    onFileUpload(file);
  }
}
