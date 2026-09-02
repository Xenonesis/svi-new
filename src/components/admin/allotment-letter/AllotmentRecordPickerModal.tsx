'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  FileText,
  Calendar,
  Building,
  Hash,
  Check,
  ArrowRight,
  User,
} from 'lucide-react';
import { formatINR } from '@/src/lib/quotation/format';

interface AllotmentRecordPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: any[];
  selectedRecordId: string;
  onSelectRecord: (record: any) => void;
  loading: boolean;
}

export function AllotmentRecordPickerModal({
  isOpen,
  onClose,
  records,
  selectedRecordId,
  onSelectRecord,
  loading,
}: AllotmentRecordPickerModalProps) {
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');

  // Extract unique projects for filtering
  const availableProjects = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      const proj = r.form_data?.projectName;
      if (proj) set.add(proj);
    });
    return Array.from(set);
  }, [records]);

  // Filter records based on search and project
  const filteredRecords = useMemo(() => {
    const q = search.toLowerCase().trim();
    return records.filter((r) => {
      const fd = r.form_data || {};
      const name = (fd.clientName || fd.name || '').toLowerCase();
      const ticket = (fd.ticketId || '').toLowerCase();
      const proj = (fd.projectName || '').toLowerCase();
      const unit = (fd.unitNumber || '').toLowerCase();
      const aadhar = (fd.aadharNumber || '').toLowerCase();

      const matchesSearch =
        !q ||
        name.includes(q) ||
        ticket.includes(q) ||
        proj.includes(q) ||
        unit.includes(q) ||
        aadhar.includes(q);

      const matchesProject =
        projectFilter === 'all' ||
        (fd.projectName && fd.projectName.toLowerCase() === projectFilter.toLowerCase());

      return matchesSearch && matchesProject;
    });
  }, [records, search, projectFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm dark:bg-black/80"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        className="dark:bg-brand-dark-surface relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-white/8">
          <div className="flex items-center gap-3">
            <div className="bg-brand-gold/10 text-brand-gold flex h-10 w-10 items-center justify-center rounded-xl">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Load Allotment from Records
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select any previously saved allotment letter to auto-populate the generator form.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-white/5 dark:hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search and Filters Bar */}
        <div className="border-b border-gray-100 bg-gray-50/50 p-4 dark:border-white/5 dark:bg-white/2">
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by client name, ticket ID, unit no..."
                autoFocus
                className="focus:border-brand-gold focus:ring-brand-gold/50 w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-8 pl-10 text-xs text-gray-900 placeholder-gray-400 transition-all focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Project Filter Select */}
            {availableProjects.length > 0 && (
              <div className="sm:w-48">
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="focus:border-brand-gold focus:ring-brand-gold/50 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-900 transition-all focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
                >
                  <option value="all">All Projects ({records.length})</option>
                  {availableProjects.map((proj) => (
                    <option key={proj} value={proj}>
                      {proj}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
            <span>
              Showing <strong>{filteredRecords.length}</strong> of <strong>{records.length}</strong>{' '}
              records
            </span>
            {selectedRecordId && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Check className="h-3.5 w-3.5" /> 1 record currently active in form
              </span>
            )}
          </div>
        </div>

        {/* Record List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="py-16 text-center">
              <div className="border-brand-gold mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-t-transparent" />
              <p className="text-xs text-gray-500">Loading allotment records...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-white/5">
                <FileText className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {search ? 'No matching records found' : 'No saved allotment records available'}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {search
                  ? 'Try clearing your search query or filter'
                  : 'Generate an allotment letter first to see it here.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {filteredRecords.map((r: any) => {
                const fd = r.form_data || {};
                const isSelected = r.id === selectedRecordId;
                const clientName = fd.clientName || fd.name || 'Unnamed Client';
                const projectName = fd.projectName || 'Shyam Aangan';
                const ticketId = fd.ticketId || 'No Ticket ID';
                const unitNo = fd.unitNumber || 'TBD';
                const area = fd.area ? `${fd.area} Sq. Yds.` : '';
                const dateCreated = new Date(r.created_at).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      onSelectRecord(r);
                      onClose();
                    }}
                    className={`group relative flex cursor-pointer flex-col justify-between rounded-xl border p-3.5 transition-all hover:scale-[1.01] hover:shadow-md ${
                      isSelected
                        ? 'border-brand-gold bg-brand-gold/5 dark:border-brand-gold/60 dark:bg-brand-gold/10 shadow-sm'
                        : 'hover:border-brand-gold/40 border-gray-200/80 bg-white hover:bg-gray-50/80 dark:border-white/8 dark:bg-[#111118]/80 dark:hover:border-white/20'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[10px] font-bold text-gray-700 dark:bg-white/8 dark:text-gray-300">
                          <Hash className="h-3 w-3 text-gray-400" />
                          {ticketId}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {dateCreated}
                        </span>
                      </div>

                      {/* Client Name */}
                      <h4 className="group-hover:text-brand-gold text-sm font-bold text-gray-900 transition-colors dark:text-white">
                        {fd.salutation ? `${fd.salutation} ` : ''}
                        {clientName}
                      </h4>

                      {/* Project & Unit info */}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                          <Building className="text-brand-gold h-3 w-3" />
                          {projectName}
                        </span>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span>
                          Unit: <strong>{unitNo}</strong>
                        </span>
                        {area && (
                          <>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span>{area}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Bottom action row */}
                    <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-xs dark:border-white/5">
                      <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                        {fd.paymentPlan ? `${fd.paymentPlan}M Plan` : 'Standard Plan'}
                      </span>
                      <button
                        type="button"
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-brand-gold/15 text-brand-gold group-hover:bg-brand-gold group-hover:text-brand-navy'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="h-3 w-3" /> Active
                          </>
                        ) : (
                          <>
                            Load <ArrowRight className="h-3 w-3" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3.5 text-xs dark:border-white/8">
          <span className="text-gray-500 dark:text-gray-400">
            Click any record to load into the allotment generator.
          </span>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
