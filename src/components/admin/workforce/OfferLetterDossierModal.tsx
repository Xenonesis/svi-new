'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  X,
  FileText,
  Briefcase,
  Calendar,
  DollarSign,
  Target,
  ExternalLink,
  Eye,
  RefreshCw,
  Clock,
  MapPin,
  UserCheck,
  CheckCircle2,
  FileQuestion,
  AlertCircle,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';

import type { Employee } from '@/src/components/admin/employees/EmployeeCard';
import type {
  SavedOfferLetter,
  OfferLetterFormData,
} from '@/src/components/admin/OfferLetter/types';
import type { CompanyInfo } from '@/src/lib/constants/companyInfo';
import { DEFAULT_COMPANY_INFO } from '@/src/lib/constants/companyInfo';
import { useAuthStore } from '@/src/stores/authStore';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';
import { OfferLetterPreviewModal } from '@/src/components/admin/offer-letter-records/OfferLetterPreviewModal';
import type { OfferLetterDossierModalProps, EmployeeOfferMatch } from './types';

function cleanPhone(phone?: string | null): string {
  return (phone || '').replace(/\D/g, '').slice(-10);
}

function cleanName(name?: string | null): string {
  return (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function OfferLetterDossierModal({
  employee,
  isOpen,
  onClose,
  token: tokenProp,
}: OfferLetterDossierModalProps) {
  const storeToken = useAuthStore((s) => s.token);
  const token = tokenProp !== undefined ? tokenProp : storeToken;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchedOffers, setMatchedOffers] = useState<EmployeeOfferMatch[]>([]);
  const [selectedMatchIndex, setSelectedMatchIndex] = useState(0);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(DEFAULT_COMPANY_INFO);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const fetchOffersAndMatch = useCallback(async () => {
    if (!employee) return;
    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch('/api/admin/documents?type=offer_letter&limit=1000', {
        headers,
      });

      if (!res.ok) {
        throw new Error(`Failed to load documents (${res.status})`);
      }

      const data = (await res.json()) as { documents?: unknown[] };
      const docs = Array.isArray(data.documents) ? data.documents : [];

      const targetWorkEmail = (employee.email || '').toLowerCase().trim();
      const targetRealEmail = (employee.real_email || '').toLowerCase().trim();
      const targetPhone = cleanPhone(employee.phone);
      const targetName = cleanName(employee.full_name);

      const matches: EmployeeOfferMatch[] = [];

      for (const item of docs) {
        if (!item || typeof item !== 'object') continue;
        const doc = item as SavedOfferLetter & { user_id?: string };
        const fd = (doc.form_data || {}) as Partial<OfferLetterFormData> & Record<string, unknown>;

        const docEmail = String(fd.emailId || fd.email || '')
          .toLowerCase()
          .trim();
        const docPhone = cleanPhone(String(fd.mobileNo || fd.phone || fd.alternativeNo || ''));
        const docName = cleanName(String(fd.name || ''));

        let matched = false;
        let matchReason = '';
        let score = 0;

        if (doc.user_id && doc.user_id === employee.id) {
          matched = true;
          matchReason = `User ID (${employee.id})`;
          score = 100;
        } else if (targetWorkEmail && docEmail && targetWorkEmail === docEmail) {
          matched = true;
          matchReason = `Work Email (${targetWorkEmail})`;
          score = 95;
        } else if (targetRealEmail && docEmail && targetRealEmail === docEmail) {
          matched = true;
          matchReason = `Personal Email (${targetRealEmail})`;
          score = 90;
        } else if (targetPhone && docPhone && targetPhone === docPhone) {
          matched = true;
          matchReason = `Phone Number (${employee.phone || targetPhone})`;
          score = 85;
        } else if (targetName && docName && targetName === docName) {
          matched = true;
          matchReason = 'Full Name Match';
          score = 75;
        } else if (
          targetName.length >= 4 &&
          docName.length >= 4 &&
          (targetName.includes(docName) || docName.includes(targetName))
        ) {
          matched = true;
          matchReason = `Partial Name Match (${String(fd.name || '')})`;
          score = 60;
        }

        if (matched) {
          matches.push({
            offer: doc,
            matchReason,
            score,
          });
        }
      }

      // Sort matches: highest score first, then newest created_at first
      matches.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const timeA = new Date(a.offer.created_at || 0).getTime();
        const timeB = new Date(b.offer.created_at || 0).getTime();
        return timeB - timeA;
      });

      setMatchedOffers(matches);
      setSelectedMatchIndex(0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch offer letters';
      setError(msg);
      console.error('Error fetching employee offer letters:', err);
    } finally {
      setLoading(false);
    }
  }, [employee, token]);

  useEffect(() => {
    if (isOpen && employee) {
      fetchOffersAndMatch();
    } else {
      setMatchedOffers([]);
      setSelectedMatchIndex(0);
      setShowLivePreview(false);
      setError(null);
    }
  }, [isOpen, employee, fetchOffersAndMatch]);

  // Fetch company info if available
  useEffect(() => {
    if (!isOpen || !token) return;
    fetch('/api/admin/settings?key=company_info', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) return null;
        return res.json() as Promise<{ value?: Partial<CompanyInfo> }>;
      })
      .then((data) => {
        if (data?.value) {
          setCompanyInfo((prev) => ({ ...prev, ...data.value }));
        }
      })
      .catch(() => {});
  }, [isOpen, token]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !showLivePreview) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, showLivePreview]);

  const activeMatch = useMemo(() => {
    if (matchedOffers.length === 0) return null;
    return matchedOffers[selectedMatchIndex] || matchedOffers[0];
  }, [matchedOffers, selectedMatchIndex]);

  const activeOffer = activeMatch?.offer;
  const formData = (activeOffer?.form_data || {}) as Partial<OfferLetterFormData>;

  const handleDownloadPDF = async () => {
    if (!activeOffer) return;
    setPdfLoading(true);
    try {
      const candidateName = formData.name || employee?.full_name || 'Candidate';
      const filename = `Offer_Letter_${candidateName.replace(/\s+/g, '_')}.pdf`;
      await exportToPDF({
        elementId: 'modalOfferPreview',
        filename,
      });
      toast.success('Offer letter PDF downloaded');
    } catch (err: unknown) {
      console.error('Error generating PDF:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!activeOffer) return;
    setImageLoading(true);
    try {
      const candidateName = formData.name || employee?.full_name || 'Candidate';
      const filename = `Offer_Letter_${candidateName.replace(/\s+/g, '_')}.png`;
      await exportToImage({
        elementId: 'modalOfferPreview',
        filename,
      });
      toast.success('Offer letter image downloaded');
    } catch (err: unknown) {
      console.error('Error generating image:', err);
      toast.error('Failed to generate image');
    } finally {
      setImageLoading(false);
    }
  };

  if (!isOpen || !employee) return null;

  const candidateName = formData.name || employee.full_name;
  const designation = formData.designation || 'Staff';
  const department = formData.department || employee.department || 'Operations';
  const joiningDate = formData.appointmentDate || formData.date || 'Immediate';
  const salaryCtc = formData.salaryCtc || '0';
  const numericCtc = parseFloat(salaryCtc) || 0;
  const annualCtc = numericCtc * 12;
  const salaryType = formData.salaryType || 'CTC';
  const target = formData.target || '';
  const targetUnit = formData.targetUnit || 'Sq. Yd.';

  return (
    <>
      <AnimatePresence>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="offer-letter-dossier-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18 }}
            className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#111118]"
          >
            {/* Top Gold Accent Bar */}
            <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="bg-brand-gold/10 text-brand-gold flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-serif text-lg font-bold">
                  <FileText size={20} />
                </div>
                <div>
                  <h3
                    id="offer-letter-dossier-title"
                    className="font-serif text-base font-bold text-gray-900 sm:text-lg dark:text-white"
                  >
                    Offer Letter Dossier
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Official compensation & employment contract records for {employee.full_name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="rounded-xl p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {loading ? (
                <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-center">
                  <RefreshCw className="text-brand-gold h-7 w-7 animate-spin" />
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Scanning documents archive for {employee.full_name}...
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Matching across corporate email, personal contact, and phone records.
                  </p>
                </div>
              ) : error ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50/50 p-6 text-center dark:border-red-900/30 dark:bg-red-950/20">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                  <h4 className="font-semibold text-red-800 dark:text-red-300">
                    Unable to load offer letter
                  </h4>
                  <p className="max-w-md text-xs text-red-600 dark:text-red-400">{error}</p>
                  <button
                    type="button"
                    onClick={fetchOffersAndMatch}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 shadow-2xs hover:bg-red-50 dark:border-red-800 dark:bg-red-900/40 dark:text-red-200"
                  >
                    <RefreshCw size={13} />
                    <span>Try Again</span>
                  </button>
                </div>
              ) : matchedOffers.length === 0 ? (
                /* Fallback State when no offer letter exists */
                <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 p-8 text-center dark:border-white/10">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                    <FileQuestion size={28} />
                  </div>
                  <h4 className="font-serif text-base font-bold text-gray-900 dark:text-white">
                    No Offer Letter Linked
                  </h4>
                  <p className="mt-1.5 max-w-md text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                    No generated offer letter document was found matching{' '}
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {employee.full_name}
                    </span>{' '}
                    ({employee.email || employee.phone || 'No contact on file'}).
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                    <Link
                      href={`/admin/offer-letter?name=${encodeURIComponent(
                        employee.full_name
                      )}&email=${encodeURIComponent(employee.email)}&phone=${encodeURIComponent(
                        employee.phone || ''
                      )}`}
                      className="bg-brand-gold hover:bg-brand-gold/90 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-black shadow-md transition-all active:scale-95"
                    >
                      <Briefcase size={14} />
                      <span>Generate Offer Letter</span>
                    </Link>
                    <button
                      type="button"
                      onClick={fetchOffersAndMatch}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 shadow-2xs transition-all hover:bg-gray-50 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                    >
                      <RefreshCw size={13} />
                      <span>Check Again</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Found Offer Letter Details */
                <div className="space-y-5">
                  {/* Match Banner & Version Selector */}
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
                      <span className="font-medium">
                        Matched via{' '}
                        <strong className="font-bold">{activeMatch?.matchReason}</strong>
                      </span>
                    </div>

                    {matchedOffers.length > 1 && (
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-gray-500 dark:text-gray-400">Revisions:</span>
                        <div className="flex gap-1">
                          {matchedOffers.map((m, idx) => (
                            <button
                              key={m.offer.id}
                              type="button"
                              onClick={() => setSelectedMatchIndex(idx)}
                              className={`rounded-md px-2 py-0.5 font-bold transition-all ${
                                idx === selectedMatchIndex
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-emerald-500/20 text-emerald-800 hover:bg-emerald-500/30 dark:text-emerald-200'
                              }`}
                            >
                              v{matchedOffers.length - idx}
                              {idx === 0 ? ' (Latest)' : ''}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Top Key Metrics Banner */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 dark:border-white/5 dark:bg-white/[0.03]">
                      <p className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Monthly CTC
                      </p>
                      <p className="text-brand-gold mt-1 font-serif text-lg font-bold sm:text-xl">
                        ₹{numericCtc.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-gray-400 capitalize">{salaryType}</p>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 dark:border-white/5 dark:bg-white/[0.03]">
                      <p className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Annual CTC
                      </p>
                      <p className="mt-1 font-serif text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
                        ₹{annualCtc.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-gray-400">12 Months</p>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 dark:border-white/5 dark:bg-white/[0.03]">
                      <p className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Sales Target
                      </p>
                      <p className="mt-1 text-sm font-bold text-blue-600 sm:text-base dark:text-blue-400">
                        {target ? `${target} ${targetUnit}` : 'No Target'}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {formData.offerSlab || 'Standard Slab'}
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 dark:border-white/5 dark:bg-white/[0.03]">
                      <p className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Joining Date
                      </p>
                      <p className="mt-1 text-sm font-bold text-gray-900 sm:text-base dark:text-white">
                        {joiningDate}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {formData.probationPeriod || '6 Mo. Probation'}
                      </p>
                    </div>
                  </div>

                  {/* 2-Column Dossier Information */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Role & Deployment */}
                    <div className="space-y-3 rounded-xl border border-gray-200/80 bg-white p-4 shadow-2xs dark:border-white/10 dark:bg-[#161622]">
                      <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5 text-xs font-bold text-gray-900 dark:border-white/5 dark:text-white">
                        <Briefcase size={14} className="text-amber-500" />
                        <span>Role & Deployment</span>
                      </div>
                      <dl className="space-y-2 text-xs">
                        <div className="flex justify-between gap-2">
                          <dt className="text-gray-500 dark:text-gray-400">Candidate Name:</dt>
                          <dd className="text-right font-semibold text-gray-900 dark:text-white">
                            {candidateName}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-gray-500 dark:text-gray-400">Designation:</dt>
                          <dd className="text-right font-semibold text-gray-900 dark:text-white">
                            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                              {designation}
                            </span>
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-gray-500 dark:text-gray-400">Department:</dt>
                          <dd className="text-right font-semibold text-gray-900 dark:text-white">
                            {department}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-gray-500 dark:text-gray-400">Reporting To:</dt>
                          <dd className="text-right font-medium text-gray-700 dark:text-gray-300">
                            {formData.reportingTo || 'Management'}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-gray-500 dark:text-gray-400">Work Location:</dt>
                          <dd className="text-right font-medium text-gray-700 dark:text-gray-300">
                            {formData.location || 'Noida HQ'}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {/* Terms & Working Schedule */}
                    <div className="space-y-3 rounded-xl border border-gray-200/80 bg-white p-4 shadow-2xs dark:border-white/10 dark:bg-[#161622]">
                      <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5 text-xs font-bold text-gray-900 dark:border-white/5 dark:text-white">
                        <Clock size={14} className="text-blue-500" />
                        <span>Work Terms & Schedule</span>
                      </div>
                      <dl className="space-y-2 text-xs">
                        <div className="flex justify-between gap-2">
                          <dt className="text-gray-500 dark:text-gray-400">Working Hours:</dt>
                          <dd className="text-right font-medium text-gray-700 dark:text-gray-300">
                            {formData.workingHoursStart || '09:30 AM'} -{' '}
                            {formData.workingHoursEnd || '06:30 PM'}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-gray-500 dark:text-gray-400">Working Days:</dt>
                          <dd className="text-right font-medium text-gray-700 dark:text-gray-300">
                            {formData.workingDays || 'Monday - Saturday'}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-gray-500 dark:text-gray-400">Weekly Off:</dt>
                          <dd className="text-right font-medium text-gray-700 dark:text-gray-300">
                            {formData.weeklyOffDays || 'Sunday'}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-gray-500 dark:text-gray-400">Salary Rule:</dt>
                          <dd className="text-right font-semibold text-gray-900 dark:text-white">
                            {formData.isFixedSalary ? 'Fixed CTC' : 'Performance Linked'}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-gray-500 dark:text-gray-400">Contract Status:</dt>
                          <dd className="text-right font-semibold text-emerald-600 capitalize dark:text-emerald-400">
                            {activeOffer?.status || 'Active'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  {/* Document Record Metadata */}
                  {activeOffer?.created_at && (
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-50 px-3 py-2 text-[11px] text-gray-500 dark:bg-white/5 dark:text-gray-400">
                      <span>Doc ID: {activeOffer.id}</span>
                      <span>
                        Generated on{' '}
                        {format(new Date(activeOffer.created_at), 'dd MMM yyyy, hh:mm a')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/80 px-5 py-3.5 dark:border-white/10 dark:bg-[#161622]/80">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
              >
                Close
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {activeOffer ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowLivePreview(true)}
                      className="border-brand-gold/30 bg-brand-gold/15 text-brand-gold hover:bg-brand-gold/25 inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all active:scale-95"
                    >
                      <Eye size={14} />
                      <span>View Live Preview</span>
                    </button>

                    <Link
                      href={`/admin/offer-letter?id=${activeOffer.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                      title="Edit this offer letter in generator"
                    >
                      <ExternalLink size={13} />
                      <span>Edit Offer</span>
                    </Link>
                  </>
                ) : (
                  <Link
                    href={`/admin/offer-letter?name=${encodeURIComponent(
                      employee.full_name
                    )}&email=${encodeURIComponent(employee.email)}&phone=${encodeURIComponent(
                      employee.phone || ''
                    )}`}
                    className="bg-brand-gold hover:bg-brand-gold/90 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-black shadow-sm transition-all active:scale-95"
                  >
                    <Briefcase size={14} />
                    <span>Create Offer Letter</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Live Preview Modal Popup */}
      {showLivePreview && activeOffer && (
        <OfferLetterPreviewModal
          offer={activeOffer}
          companyInfo={companyInfo}
          onClose={() => setShowLivePreview(false)}
          onDownloadPDF={handleDownloadPDF}
          onDownloadImage={handleDownloadImage}
          pdfLoading={pdfLoading}
          imageLoading={imageLoading}
        />
      )}
    </>
  );
}
