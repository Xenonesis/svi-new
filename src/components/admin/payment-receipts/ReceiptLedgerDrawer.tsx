'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Copy,
  Check,
  Eye,
  Download,
  IndianRupee,
  Save,
  BookOpen,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  UserCheck,
  Loader2,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { SavedReceipt } from './ReceiptTypes';
import { calculateLedgerStatement, normalizeRefId } from '@/src/lib/receipt/receiptLedger';
import { downloadReceiptsCsv } from '@/src/lib/receipt/receiptCsvExport';
import { exportStatementExcel, exportStatementPdf } from '@/src/lib/receipt/statementExporter';
import { StatementPdfTemplate } from './StatementPdfTemplate';

// Authoritative client contact directory as per SVI Payment Details.xlsx
const CLIENT_CONTACT_MAP: Record<string, { phone?: string; email?: string; address?: string }> = {
  pl2075: {
    phone: '9716154616',
    email: 'kundanjha2010@gmail.com',
    address:
      'House No. Plot 531/A, No.-7717, Ramesh Nagar, Bawana, District: North West Delhi, 110039',
  },
  pl2077: {
    phone: '7838045231',
    email: 'Shantanujoshi9999@gmail.com',
    address:
      'A-803, Garden Estates Apartments, Plot No-5B, Sector-22, Dwarka, Raj Nagar-II, Delhi-110077',
  },
  pl2076: {
    phone: '7838221323',
    email: 'truemoon.india@gmail.com',
    address: '7 /50, 3rd Floor, Subhash Nagar, West Delhi-110027.',
  },
  pl2050: {
    phone: '9811686535',
    email: 'agarwalgoyalmanish@yahoo.com',
    address: 'A-32, pushpanjali enclave Pitampura',
  },
  pl2066: {
    phone: '9318444582',
    email: 'varun.arora1515@gmail.com',
    address: 'Rohtak',
  },
  pl2065: {
    phone: '9318444582',
    email: 'varun.arora1515@gmail.com',
    address: 'Rohtak',
  },
  pl2080: {
    phone: '7042046477',
    email: 'Rohitca871@gmail.com',
    address: 'KH NO 791 STREET NO 2 ASHOK COLONY KUSHAK NO 2 KADIPUR 110036',
  },
  svi002023: {
    phone: '9810065290',
    email: 'rkjindal@ksprecision.com',
    address: '4/20, sector 2 rajendra nagar ghaziabad',
  },
  svi2023: {
    phone: '9810065290',
    email: 'rkjindal@ksprecision.com',
    address: '4/20, sector 2 rajendra nagar ghaziabad',
  },
  pl2081: {
    phone: '8882559449',
    email: 'kapiltanwar18@gmail.com',
    address: '',
  },
  pl2078: {
    phone: '',
    email: '',
    address: 'i -599 Govindpuram Ghaziabad Uttar Pradesh 201013',
  },
  pl2006: {
    phone: '',
    email: '',
    address: 'Faridpur Simbhavali Hapur Uttar Pradesh - 245207',
  },
  pl2126: {
    phone: '9506394111',
    email: '',
    address: 'Sector- 10A / 10 Chiranjeev vihar Ghaziabad Uttar Pradesh -201002',
  },
  pl2221: {
    phone: '9953630825',
    email: 'SMSHARMA1987@GMAIL.COM',
    address: 'House no. D-110/3, Street no. 12, Gamri extension north east delhi-110053',
  },
  svi002025: {
    phone: '9911300308',
    email: 'kohli.gaurav141@gmail.com',
    address: 'H/N 141-142, nehru vihar west delhi-110054',
  },
  svi2025: {
    phone: '9911300308',
    email: 'kohli.gaurav141@gmail.com',
    address: 'H/N 141-142, nehru vihar west delhi-110054',
  },
  svi002106: {
    phone: '7206075395',
    email: 'bhagwanshiv1982@gmail.com',
    address: 'Ahrod(29)Rewari',
  },
  svi2106: {
    phone: '7206075395',
    email: 'bhagwanshiv1982@gmail.com',
    address: 'Ahrod(29)Rewari',
  },
  pl2181: {
    phone: '9953630825',
    email: 'SMSHARMA1987@GMAIL.COM',
    address: 'House no. D-110/3, Street no. 12, Gamri extension north east delhi-110053',
  },
  svi002050: {
    phone: '9958894058',
    email: '',
    address:
      'A-1004, 10th Floor, Green Valley Society, Kaspate Wasti Road, Wakad, Pune-411057Maharashtra',
  },
  svi2050: {
    phone: '9958894058',
    email: '',
    address:
      'A-1004, 10th Floor, Green Valley Society, Kaspate Wasti Road, Wakad, Pune-411057Maharashtra',
  },
  svi002051: {
    phone: '9958894058',
    email: 'client.svi002051@sviinfra.com',
    address:
      'A-1004, 10th Floor, Green Valley Society, Kaspate Wasti Road, WakadPune-411057Maharashtra',
  },
  svi2051: {
    phone: '9958894058',
    email: 'client.svi002051@sviinfra.com',
    address:
      'A-1004, 10th Floor, Green Valley Society, Kaspate Wasti Road, WakadPune-411057Maharashtra',
  },
  svi002134: {
    phone: '9031439111',
    email: 'abhilashasahayvarma@gmail.com',
    address: 'Arya Kumar Road Rajendra Nagar, Patna, Bihar, 800016',
  },
  svi2134: {
    phone: '9031439111',
    email: 'abhilashasahayvarma@gmail.com',
    address: 'Arya Kumar Road Rajendra Nagar, Patna, Bihar, 800016',
  },
};

interface ReceiptLedgerDrawerProps {
  refId: string | null;
  allReceipts: SavedReceipt[];
  dealValue: number;
  plotArea?: number | string | null;
  advisorName?: string | null;
  onSaveDealValue: (
    normalizedRefId: string,
    newDealValue: number,
    extra?: { area?: number; ratePerSqYd?: number }
  ) => Promise<void> | void;
  onClose: () => void;
  onSelectReceipt?: (receipt: SavedReceipt) => void;
}

export function ReceiptLedgerDrawer({
  refId,
  allReceipts,
  dealValue,
  plotArea,
  advisorName,
  onSaveDealValue,
  onClose,
  onSelectReceipt,
}: ReceiptLedgerDrawerProps) {
  const normalizedKey = refId ? normalizeRefId(refId) : '';
  const ledger = refId ? calculateLedgerStatement(refId, allReceipts, dealValue, plotArea) : null;

  const initialArea = useMemo(() => {
    if (!refId) return 0;
    const raw =
      plotArea ||
      ledger?.plotSize ||
      allReceipts.find((r) => normalizeRefId(r.form_data?.refId) === normalizedKey)?.form_data
        ?.plotSize ||
      '';
    return parseFloat(String(raw).replace(/[^\d.]/g, '')) || 0;
  }, [plotArea, ledger?.plotSize, allReceipts, normalizedKey, refId]);

  const [agreedValueInput, setAgreedValueInput] = useState('');
  const [ratePerSqYdInput, setRatePerSqYdInput] = useState('');
  const [areaInput, setAreaInput] = useState('');
  const [savingDealValue, setSavingDealValue] = useState(false);
  const [copiedReceiptNo, setCopiedReceiptNo] = useState<string | null>(null);

  // Client Contact State (Phone, Email, Address)
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [clientAddress, setClientAddress] = useState<string>('');
  const [copiedContactField, setCopiedContactField] = useState<string | null>(null);

  // Advisor and Export Dropdown state
  const [resolvedAdvisorName, setResolvedAdvisorName] = useState<string>(advisorName || '');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exportingType, setExportingType] = useState<'excel' | 'pdf' | 'csv' | null>(null);

  const isRefundDone = useMemo(() => {
    const norm = (refId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (norm === 'pl2050' || norm === 'pl2081') return true;
    return Boolean(
      ledger?.receipts?.some((r) => {
        const fd = r.form_data as Record<string, any> | undefined;
        return (
          fd?.refundStatus?.toLowerCase().includes('refund') ||
          fd?.notes?.toLowerCase().includes('refund') ||
          fd?.remarks?.toLowerCase().includes('refund')
        );
      })
    );
  }, [refId, ledger?.receipts]);

  useEffect(() => {
    setAgreedValueInput(dealValue > 0 ? String(dealValue) : '');
    setAreaInput(initialArea > 0 ? String(initialArea) : '');
    if (dealValue > 0 && initialArea > 0) {
      const rate = Math.round((dealValue / initialArea) * 100) / 100;
      setRatePerSqYdInput(String(rate));
    } else {
      setRatePerSqYdInput('');
    }
  }, [dealValue, refId, initialArea]);

  // Auto-fetch fresh advisor and allotment details from DB for this refId
  useEffect(() => {
    if (!refId || typeof window === 'undefined') return;
    try {
      const token = localStorage.getItem('token') || '';
      const base = window.location?.origin || '';
      const url = base
        ? `${base}/api/admin/portal-allotments/deal-value?refId=${encodeURIComponent(refId)}`
        : `/api/admin/portal-allotments/deal-value?refId=${encodeURIComponent(refId)}`;
      fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.advisorName) {
            setResolvedAdvisorName(data.advisorName);
          }
          if (data?.area && (!areaInput || areaInput === '0')) {
            setAreaInput(String(data.area));
          }
          if (data?.ratePerSqYd && (!ratePerSqYdInput || ratePerSqYdInput === '0')) {
            setRatePerSqYdInput(String(data.ratePerSqYd));
          }
          if (data?.dealValue && (!agreedValueInput || agreedValueInput === '0')) {
            setAgreedValueInput(String(data.dealValue));
          }
          if (data?.clientPhone) {
            setClientPhone(data.clientPhone);
          }
          if (data?.clientEmail) {
            setClientEmail(data.clientEmail);
          }
          if (data?.clientAddress) {
            setClientAddress(data.clientAddress);
          }
        })
        .catch(() => {});
    } catch {
      // Ignore in test environments without standard URL origins
    }
  }, [refId]);

  if (!refId || !ledger) return null;

  const handleTotalChange = (val: string) => {
    setAgreedValueInput(val);
    const total = parseFloat(val.replace(/,/g, ''));
    const area = parseFloat(areaInput.replace(/,/g, ''));
    if (!isNaN(total) && !isNaN(area) && area > 0) {
      const rate = Math.round((total / area) * 100) / 100;
      setRatePerSqYdInput(String(rate));
    } else {
      setRatePerSqYdInput('');
    }
  };

  const handleRateChange = (val: string) => {
    setRatePerSqYdInput(val);
    const rate = parseFloat(val.replace(/,/g, ''));
    const area = parseFloat(areaInput.replace(/,/g, ''));
    if (!isNaN(rate) && !isNaN(area) && area > 0) {
      const total = Math.round(rate * area);
      setAgreedValueInput(String(total));
    }
  };

  const handleAreaChange = (val: string) => {
    setAreaInput(val);
    const area = parseFloat(val.replace(/,/g, ''));
    const total = parseFloat(agreedValueInput.replace(/,/g, ''));
    if (!isNaN(total) && !isNaN(area) && area > 0) {
      const rate = Math.round((total / area) * 100) / 100;
      setRatePerSqYdInput(String(rate));
    }
  };

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedReceiptNo(text);
    toast.success(`Copied #${text}`);
    setTimeout(() => setCopiedReceiptNo(null), 2000);
  };

  const handleSaveDealValue = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(agreedValueInput.replace(/,/g, ''));
    if (isNaN(num) || num < 0) {
      toast.error('Please enter a valid deal amount');
      return;
    }
    const parsedArea = parseFloat(areaInput.replace(/,/g, '')) || undefined;
    const parsedRate = parseFloat(ratePerSqYdInput.replace(/,/g, '')) || undefined;

    try {
      setSavingDealValue(true);
      await onSaveDealValue(
        normalizedKey,
        num,
        parsedArea || parsedRate ? { area: parsedArea, ratePerSqYd: parsedRate } : undefined
      );
      toast.success(
        parsedRate && parsedArea
          ? `Agreed value saved to DB: ${formatCurrency(num)} (@ ₹${parsedRate}/sq.yd.)`
          : 'Agreed deal value saved to database'
      );
    } catch {
      toast.error('Failed to save agreed deal value to database');
    } finally {
      setSavingDealValue(false);
    }
  };

  const fallbackContact = CLIENT_CONTACT_MAP[normalizedKey] || {};
  const displayPhone = clientPhone || fallbackContact.phone || '';
  const displayEmail = clientEmail || fallbackContact.email || '';
  const displayAddress = clientAddress || fallbackContact.address || '';

  const handleCopyContact = (text: string, field: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedContactField(field);
      toast.success(`Copied ${field} to clipboard`);
      setTimeout(() => setCopiedContactField(null), 2000);
    }
  };

  const handleExportExcel = async () => {
    if (ledger.receipts.length === 0) {
      toast.error('No receipts available to export');
      return;
    }
    setExportingType('excel');
    try {
      await exportStatementExcel({
        ledger,
        advisorName: resolvedAdvisorName || 'Direct / SVI Official',
        area: areaInput || initialArea,
        ratePerSqYd: ratePerSqYdInput || ledger.ratePerSqYd,
        phone: displayPhone,
        email: displayEmail,
        address: displayAddress,
      });
    } finally {
      setExportingType(null);
    }
  };

  const handleExportPdf = async () => {
    if (ledger.receipts.length === 0) {
      toast.error('No receipts available to export');
      return;
    }
    setExportingType('pdf');
    try {
      const cleanRef = ledger.displayRefId.replace(/[^a-zA-Z0-9]/g, '_');
      const cleanClient = ledger.clientName.replace(/[^a-zA-Z0-9]/g, '_');
      await exportStatementPdf({
        elementId: `statement-pdf-${normalizedKey}`,
        filename: `Statement_${cleanClient}_${cleanRef}.pdf`,
      });
    } finally {
      setExportingType(null);
    }
  };

  const handleExportCsv = () => {
    if (ledger.receipts.length === 0) {
      toast.error('No receipts available to export');
      return;
    }
    setExportingType('csv');
    try {
      const cleanRef = ledger.displayRefId.replace(/[^a-zA-Z0-9]/g, '_');
      downloadReceiptsCsv(ledger.receipts, `Ledger_Statement_${cleanRef}.csv`);
      toast.success(`Exported ledger CSV for ${ledger.displayRefId}`);
    } finally {
      setExportingType(null);
    }
  };

  const formatCurrency = (val: number) =>
    val.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: val % 1 === 0 ? 0 : 2,
    });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="dark:bg-brand-dark-surface flex w-screen max-w-2xl flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-white/10"
          >
            {/* Top Accent Strip */}
            <div className="bg-brand-gold h-1 w-full" />

            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 p-6 dark:border-white/10">
              <div className="flex items-start gap-3.5">
                <div className="bg-brand-gold/10 border-brand-gold/20 text-brand-gold flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                      Ref ID: {ledger.displayRefId}
                    </span>
                    {isRefundDone && (
                      <span className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 font-sans text-xs font-extrabold tracking-wide text-rose-600 uppercase dark:border-rose-500/40 dark:bg-rose-950/50 dark:text-rose-400">
                        Refund Done
                      </span>
                    )}
                    {ledger.plotNo && (
                      <span className="rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 font-mono text-xs font-bold text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                        Plot {ledger.plotNo}
                      </span>
                    )}
                    {initialArea > 0 && (
                      <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {initialArea} Sq. Yds.
                      </span>
                    )}
                    {resolvedAdvisorName && (
                      <span className="flex items-center gap-1 rounded-md border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 font-sans text-xs font-bold text-purple-700 dark:text-purple-300">
                        <UserCheck className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                        Advisor: {resolvedAdvisorName}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-1 text-lg font-bold text-gray-900 capitalize dark:text-white">
                    {ledger.clientName}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {ledger.receipts.length} milestone payment record
                    {ledger.receipts.length === 1 ? '' : 's'} recorded
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5 dark:hover:text-white"
                aria-label="Close drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {/* Client Contact & Billing Information Card */}
              <div className="rounded-xl border border-gray-200/80 bg-slate-50/70 p-4 shadow-2xs dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between border-b border-gray-200/60 pb-2.5 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      Client Contact Details
                    </span>
                    <span className="bg-brand-gold/10 text-brand-gold rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold">
                      Official Records
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2.5 text-xs sm:grid-cols-2">
                  {/* Phone */}
                  <div className="flex items-center justify-between rounded-lg border border-gray-200/60 bg-white p-2.5 shadow-2xs dark:border-white/5 dark:bg-gray-800/60">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                        <Phone className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-medium text-gray-400 uppercase">
                          Phone Number
                        </div>
                        {displayPhone ? (
                          <a
                            href={`tel:${displayPhone}`}
                            className="hover:text-brand-gold block truncate font-mono font-bold text-gray-900 dark:text-white"
                          >
                            {displayPhone}
                          </a>
                        ) : (
                          <span className="text-gray-400 italic">Not Available</span>
                        )}
                      </div>
                    </div>
                    {displayPhone && (
                      <button
                        type="button"
                        onClick={() => handleCopyContact(displayPhone, 'Phone Number')}
                        className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
                        title="Copy Phone Number"
                      >
                        {copiedContactField === 'Phone Number' ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between rounded-lg border border-gray-200/60 bg-white p-2.5 shadow-2xs dark:border-white/5 dark:bg-gray-800/60">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
                        <Mail className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-medium text-gray-400 uppercase">
                          Email Address
                        </div>
                        {displayEmail ? (
                          <a
                            href={`mailto:${displayEmail}`}
                            className="hover:text-brand-gold block truncate text-[11px] font-semibold text-gray-900 dark:text-white"
                          >
                            {displayEmail}
                          </a>
                        ) : (
                          <span className="text-gray-400 italic">Not Available</span>
                        )}
                      </div>
                    </div>
                    {displayEmail && (
                      <button
                        type="button"
                        onClick={() => handleCopyContact(displayEmail, 'Email Address')}
                        className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
                        title="Copy Email Address"
                      >
                        {copiedContactField === 'Email Address' ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="mt-2.5 flex items-start justify-between rounded-lg border border-gray-200/60 bg-white p-2.5 text-xs shadow-2xs dark:border-white/5 dark:bg-gray-800/60">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                      <MapPin className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-medium text-gray-400 uppercase">
                        Registered Billing / Postal Address
                      </div>
                      <div className="mt-0.5 text-[11.5px] leading-relaxed font-medium text-gray-800 dark:text-gray-200">
                        {displayAddress || (
                          <span className="text-gray-400 italic">Not Available</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {displayAddress && (
                    <button
                      type="button"
                      onClick={() => handleCopyContact(displayAddress, 'Address')}
                      className="ml-2 shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
                      title="Copy Address"
                    >
                      {copiedContactField === 'Address' ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Refund Notice Banner */}
              {isRefundDone && (
                <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-300">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-xs font-black text-rose-600 dark:text-rose-400">
                    !
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-wider uppercase">
                      Account Status: Refund Done
                    </div>
                    <div className="text-xs opacity-90">
                      This allotment has been processed as Refund Done as per official SVI records.
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Summary Cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* Total Received */}
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 dark:bg-emerald-500/10">
                  <span className="text-[11px] font-semibold text-emerald-600 uppercase dark:text-emerald-400">
                    Total Received
                  </span>
                  <div className="mt-1 font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(ledger.totalPaid)}
                  </div>
                  <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
                    {ledger.receipts.length} transaction{ledger.receipts.length === 1 ? '' : 's'}
                  </span>
                </div>

                {/* Agreed Plot Value */}
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 dark:bg-blue-500/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-blue-600 uppercase dark:text-blue-400">
                      Agreed Plot Value
                    </span>
                    {ledger.ratePerSqYd && ledger.ratePerSqYd > 0 ? (
                      <span className="rounded bg-blue-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-blue-700 dark:text-blue-300">
                        ₹{ledger.ratePerSqYd.toLocaleString('en-IN')}/sq.yd.
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 font-mono text-lg font-bold text-blue-700 dark:text-blue-300">
                    {ledger.agreedDealValue > 0
                      ? formatCurrency(ledger.agreedDealValue)
                      : 'Not Set'}
                  </div>
                  <span className="text-[10px] text-blue-600/80 dark:text-blue-400/80">
                    {ledger.agreedDealValue > 0
                      ? ledger.ratePerSqYd && ledger.ratePerSqYd > 0
                        ? `Confirmed deal cost • ${ledger.plotSize || initialArea} Sq. Yds.`
                        : 'Confirmed deal cost'
                      : 'Set below to track'}
                  </span>
                </div>

                {/* Balance Due */}
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 dark:bg-amber-500/10">
                  <span className="text-[11px] font-semibold text-amber-600 uppercase dark:text-amber-400">
                    Balance Due
                  </span>
                  <div className="mt-1 font-mono text-lg font-bold text-amber-700 dark:text-amber-300">
                    {ledger.agreedDealValue > 0 ? formatCurrency(ledger.balanceDue) : '—'}
                  </div>
                  <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80">
                    {ledger.agreedDealValue > 0
                      ? ledger.balanceDue === 0
                        ? 'Fully Paid'
                        : `${ledger.percentCompleted}% Paid`
                      : 'Requires Agreed Value'}
                  </span>
                </div>
              </div>

              {/* Progress Bar (if agreedDealValue set) */}
              {ledger.agreedDealValue > 0 && (
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Payment Milestone Progress
                    </span>
                    <span className="text-brand-gold font-mono font-bold">
                      {ledger.percentCompleted}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                    <div
                      className="bg-brand-gold h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, ledger.percentCompleted)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Edit Agreed Deal Value Form */}
              <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                      <IndianRupee className="text-brand-gold h-3.5 w-3.5" />
                      Set / Update Agreed Deal Value
                    </h4>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      Save total agreed cost in DB. Rate per sq. yd. is calculated automatically.
                    </p>
                  </div>
                  {initialArea > 0 && (
                    <div className="flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      <span>Area:</span>
                      <strong className="font-mono font-bold">{initialArea}</strong>
                      <span>Sq. Yds.</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSaveDealValue} className="mt-3 space-y-3">
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {/* Total Amount Input */}
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                        Total Deal Amount (₹)
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-gray-400">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="e.g. 2500000"
                          value={agreedValueInput}
                          onChange={(e) => handleTotalChange(e.target.value)}
                          className="focus:border-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-3 pl-7 font-mono text-xs font-semibold text-gray-900 transition-colors focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Per Sq Yard Amount Input */}
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                        Rate per Sq. Yard (₹ / sq. yd.)
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-gray-400">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="e.g. 5500"
                          value={ratePerSqYdInput}
                          onChange={(e) => handleRateChange(e.target.value)}
                          className="focus:border-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-3 pl-7 font-mono text-xs font-semibold text-gray-900 transition-colors focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2 dark:border-white/5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <span>Plot Area:</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Area"
                        value={areaInput}
                        onChange={(e) => handleAreaChange(e.target.value)}
                        className="focus:border-brand-gold w-20 rounded border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-xs font-semibold text-gray-900 transition-colors focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                      <span>Sq. Yds.</span>
                    </div>

                    <button
                      type="submit"
                      disabled={savingDealValue}
                      className="bg-brand-gold text-brand-navy hover:bg-brand-gold/90 flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {savingDealValue ? 'Saving to DB...' : 'Save to DB'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Receipts Chronological Timeline */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                    Payment Statement ({ledger.receipts.length})
                  </h4>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setExportMenuOpen((prev) => !prev)}
                      className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold hover:text-brand-navy flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold shadow-xs transition-colors focus:outline-none"
                    >
                      {exportingType ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      <span>Export Statement</span>
                      <ChevronDown
                        className={`h-3 w-3 transition-transform ${exportMenuOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {exportMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setExportMenuOpen(false)}
                        />
                        <div className="dark:bg-brand-dark-surface absolute top-full right-0 z-40 mt-1.5 w-56 rounded-xl border border-gray-200 bg-white p-1.5 shadow-2xl dark:border-white/10">
                          {/* Option 1: Excel (.xlsx) */}
                          <button
                            type="button"
                            disabled={exportingType !== null}
                            onClick={() => {
                              setExportMenuOpen(false);
                              handleExportExcel();
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50 dark:text-gray-200 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                          >
                            <FileSpreadsheet className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <div className="flex flex-col">
                              <span className="font-bold">Export as Excel (.xlsx)</span>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                Exact Delhi Office Format
                              </span>
                            </div>
                          </button>

                          {/* Option 2: PDF (.pdf) */}
                          <button
                            type="button"
                            disabled={exportingType !== null}
                            onClick={() => {
                              setExportMenuOpen(false);
                              handleExportPdf();
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 transition-colors hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50 dark:text-gray-200 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                          >
                            <FileText className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                            <div className="flex flex-col">
                              <span className="font-bold">Export as PDF (.pdf)</span>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                Official Document with Logo
                              </span>
                            </div>
                          </button>

                          {/* Option 3: CSV (.csv) */}
                          <button
                            type="button"
                            disabled={exportingType !== null}
                            onClick={() => {
                              setExportMenuOpen(false);
                              handleExportCsv();
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-white/5"
                          >
                            <Download className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" />
                            <div className="flex flex-col">
                              <span className="font-semibold">Export as CSV (.csv)</span>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                Raw Tabular Data
                              </span>
                            </div>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {ledger.receipts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-xs text-gray-400 dark:border-white/10">
                    No receipts recorded under this Ref ID yet.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:bg-white/5 dark:text-gray-400">
                        <tr>
                          <th className="px-3.5 py-2.5">Date</th>
                          <th className="px-3.5 py-2.5">Receipt No</th>
                          <th className="px-3.5 py-2.5">Method</th>
                          <th className="px-3.5 py-2.5 text-right">Amount</th>
                          <th className="px-3.5 py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-sans dark:divide-white/5">
                        {ledger.receipts.map((r) => {
                          const amt = parseFloat(r.form_data?.amount || '0') || 0;
                          const rNo = r.form_data?.receiptNo || 'N/A';
                          const isCopied = copiedReceiptNo === rNo;

                          return (
                            <tr
                              key={r.id}
                              className="transition-colors hover:bg-gray-50/70 dark:hover:bg-white/[0.03]"
                            >
                              <td className="px-3.5 py-2.5 font-mono text-[11px] whitespace-nowrap text-gray-600 dark:text-gray-300">
                                {r.form_data?.date || '—'}
                              </td>
                              <td className="px-3.5 py-2.5">
                                <button
                                  type="button"
                                  onClick={(e) => handleCopy(rNo, e)}
                                  className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400"
                                  title="Copy Receipt No"
                                >
                                  <span>#{rNo}</span>
                                  {isCopied ? (
                                    <Check className="h-2.5 w-2.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="h-2.5 w-2.5 opacity-50" />
                                  )}
                                </button>
                              </td>
                              <td className="px-3.5 py-2.5 text-[11px] text-gray-600 dark:text-gray-300">
                                {r.form_data?.paymentMethod || 'UPI'}
                              </td>
                              <td className="px-3.5 py-2.5 text-right font-mono font-bold text-gray-900 dark:text-white">
                                {formatCurrency(amt)}
                              </td>
                              <td className="px-3.5 py-2.5 text-right">
                                {onSelectReceipt && (
                                  <button
                                    type="button"
                                    onClick={() => onSelectReceipt(r)}
                                    className="hover:text-brand-gold rounded p-1 text-gray-400"
                                    title="View Receipt"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                SVI Customer Ledger Statement
              </span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
              >
                Close Drawer
              </button>
            </div>

            {/* Off-screen PDF Render Template with Official Logo and Exact Delhi Office Grid */}
            <StatementPdfTemplate
              id={`statement-pdf-${normalizedKey}`}
              ledger={ledger}
              advisorName={resolvedAdvisorName || 'Direct / SVI Official'}
              plotArea={areaInput || initialArea}
              ratePerSqYd={ratePerSqYdInput || ledger.ratePerSqYd}
              phone={displayPhone}
              email={displayEmail}
              address={displayAddress}
            />
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
