'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Copy,
  Check,
  MessageSquare,
  Phone,
  AlertCircle,
  CheckCheck,
  FileText,
  BadgeCheck,
  Video,
  MoreVertical,
} from 'lucide-react';
import { toast } from 'sonner';
import { SavedReceipt } from './ReceiptTypes';
import {
  cleanIndianPhoneNumber,
  isValidIndianPhoneNumber,
  buildReceiptWhatsAppMessage,
  buildWhatsAppShareUrl,
  formatReceiptDate,
} from '@/src/lib/receipt/receiptWhatsApp';

interface ReceiptWhatsAppModalProps {
  receipt: SavedReceipt | null;
  onClose: () => void;
}

export function ReceiptWhatsAppModal({ receipt, onClose }: ReceiptWhatsAppModalProps) {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [previewMode, setPreviewMode] = useState<'gui' | 'raw'>('gui');
  const [copied, setCopied] = useState(false);
  const [touched, setTouched] = useState(false);
  const [timeString, setTimeString] = useState('10:30 AM');

  useEffect(() => {
    setTimeString(
      new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    );
  }, []);
  useEffect(() => {
    if (receipt) {
      const initialPhone = receipt.form_data?.clientPhone || '';
      setPhone(cleanIndianPhoneNumber(initialPhone));
      setMessage(buildReceiptWhatsAppMessage(receipt));
      setTouched(false);
    }
  }, [receipt]);

  if (!receipt) return null;

  const d = receipt.form_data || ({} as SavedReceipt['form_data']);
  const amountVal = parseFloat(d.amount) || 0;
  const amountFormatted = amountVal.toLocaleString('en-IN');
  const displayDate = formatReceiptDate(d.date);
  const isPhoneValid = !phone || isValidIndianPhoneNumber(phone);
  const canSend = phone.length > 0 && isValidIndianPhoneNumber(phone);
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success('Message copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    setTouched(true);
    if (!phone) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!isValidIndianPhoneNumber(phone)) {
      toast.error('Mobile number must be a valid 10-digit Indian number');
      return;
    }

    const shareUrl = buildWhatsAppShareUrl(phone, message);
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    toast.success(`WhatsApp opened for +91 ${phone}`);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="dark:bg-brand-dark-surface relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10"
        >
          {/* Top Emerald Accent Glow */}
          <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Share Receipt via WhatsApp
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Receipt #{d.receiptNo || 'N/A'} • {d.name || 'Client'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5 dark:hover:text-white"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-4 p-5">
            {/* Phone Input */}
            <div>
              <label
                htmlFor="wa-phone-input"
                className="mb-1.5 flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300"
              >
                <span>Client Mobile Number</span>
                <span className="text-[10px] font-normal text-gray-400">
                  Indian 10-digit number
                </span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="ml-1.5 text-xs font-bold text-gray-500 dark:text-gray-400">
                    +91
                  </span>
                </div>
                <input
                  id="wa-phone-input"
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => {
                    const cleaned = cleanIndianPhoneNumber(e.target.value);
                    setPhone(cleaned);
                    setTouched(true);
                  }}
                  className={`w-full rounded-xl border py-2.5 pr-4 pl-16 font-mono text-sm font-medium text-gray-900 transition-colors focus:outline-none dark:text-white ${
                    touched && !isPhoneValid
                      ? 'border-red-500 bg-red-50/50 focus:border-red-500 dark:bg-red-500/10'
                      : 'border-gray-200 bg-gray-50/50 focus:border-emerald-500 dark:border-white/10 dark:bg-white/5'
                  }`}
                />
              </div>
              {touched && !isPhoneValid && (
                <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  Enter a valid 10-digit Indian mobile number
                </p>
              )}
            </div>

            {/* Message Preview */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-100 p-0.5 dark:border-white/10 dark:bg-white/5">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('gui')}
                    className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                      previewMode === 'gui'
                        ? 'bg-white text-emerald-700 shadow-xs dark:bg-white/15 dark:text-emerald-300'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    <MessageSquare className="h-3 w-3" />
                    Chat Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('raw')}
                    className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                      previewMode === 'raw'
                        ? 'bg-white text-emerald-700 shadow-xs dark:bg-white/15 dark:text-emerald-300'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    <FileText className="h-3 w-3" />
                    Edit Text
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy Text
                    </>
                  )}
                </button>
              </div>

              {previewMode === 'gui' ? (
                <div className="overflow-hidden rounded-2xl border border-emerald-950/20 shadow-md dark:border-emerald-500/20">
                  {/* WhatsApp Chat Top Bar */}
                  <div className="flex items-center justify-between border-b border-emerald-800/30 bg-[#075e54] px-3.5 py-2.5 text-white shadow-xs">
                    <div className="flex items-center gap-2.5">
                      {/* Rounded avatar with square brand mark icon */}
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white p-1 shadow-xs ring-1 ring-white/30">
                        <img
                          src="/logo-icon.png"
                          alt="SVI Infra Solutions"
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="leading-tight">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold tracking-tight text-white">
                            SVI Infra Solutions
                          </span>
                          <BadgeCheck className="h-3.5 w-3.5 fill-[#25d366] text-white" />
                        </div>
                        <p className="text-[10px] text-emerald-100/80">Official Business Account</p>
                      </div>
                    </div>

                    {/* WhatsApp Action Icons */}
                    <div className="flex items-center gap-3 text-emerald-100/80">
                      <Video className="h-4 w-4" />
                      <Phone className="h-3.5 w-3.5" />
                      <MoreVertical className="h-4 w-4" />
                    </div>
                  </div>

                  {/* WhatsApp Wallpaper & Message Container */}
                  <div
                    className="max-h-80 overflow-y-auto bg-[#efeae2] p-3.5 sm:p-4 dark:bg-[#0b141a]"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.05) 1px, transparent 0)',
                      backgroundSize: '16px 16px',
                    }}
                  >
                    {/* Centered Date Pill */}
                    <div className="mb-3 text-center">
                      <span className="inline-block rounded-md bg-white/95 px-3 py-1 font-sans text-[10px] font-semibold text-gray-600 shadow-xs dark:bg-[#182229] dark:text-gray-300">
                        {displayDate !== 'N/A' ? `Today, ${displayDate}` : 'TODAY'}
                      </span>
                    </div>

                    {/* Outgoing Message Bubble */}
                    <div className="relative ml-auto max-w-[95%] rounded-2xl rounded-tr-xs bg-[#d9fdd3] p-3 text-gray-900 shadow-sm sm:max-w-[90%] dark:bg-[#005c4b] dark:text-gray-100">
                      {/* Crisp White Receipt Card - 100% Contrast & No Overlap */}
                      <div className="overflow-hidden rounded-xl border border-emerald-950/10 bg-white text-gray-900 shadow-xs">
                        {/* Receipt Card Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/90 px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-5 max-w-[120px] items-center">
                              <img
                                src="/logo.png"
                                alt="SVI Infra Solutions"
                                className="h-full w-auto object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                              Receipt Details
                            </span>
                          </div>
                          <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800 ring-1 ring-emerald-600/20">
                            #{d.receiptNo || 'N/A'}
                          </span>
                        </div>

                        {/* Receipt Card Body */}
                        <div className="p-3">
                          {/* Amount Hero Banner */}
                          <div className="mb-2.5 flex items-baseline justify-between rounded-lg border border-emerald-500/15 bg-emerald-50/60 p-2.5">
                            <div>
                              <p className="text-[9px] font-bold tracking-wider text-emerald-800/80 uppercase">
                                Amount Received
                              </p>
                              <p className="font-mono text-base font-extrabold text-emerald-700">
                                ₹{amountFormatted}
                              </p>
                            </div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                              <Check className="h-2.5 w-2.5 stroke-[3]" /> Received
                            </span>
                          </div>

                          {/* Key-Value Details Grid */}
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                            <div>
                              <span className="text-gray-400">Ref ID: </span>
                              <span className="font-mono font-bold text-gray-900">
                                {d.refId || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Date: </span>
                              <span className="font-medium text-gray-800">{displayDate}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Mode: </span>
                              <span className="font-semibold text-gray-800">
                                {d.paymentMethod || 'UPI'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Unit: </span>
                              <span className="font-medium text-gray-800">
                                Plot {d.plotNo || 'N/A'}
                              </span>
                            </div>
                            {d.paymentRef && (
                              <div className="col-span-2 text-[10px]">
                                <span className="text-gray-400">Ref/UTR: </span>
                                <span className="font-mono text-gray-700">{d.paymentRef}</span>
                              </div>
                            )}
                            {d.drawnOn && (
                              <div className="col-span-2 text-[10px]">
                                <span className="text-gray-400">Bank: </span>
                                <span className="font-medium text-gray-700">{d.drawnOn}</span>
                              </div>
                            )}
                          </div>

                          {/* Authentic Document Attachment Pill */}
                          <div className="mt-2.5 flex items-center justify-between border-t border-gray-100 pt-2 text-[10px] text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="max-w-[170px] truncate font-medium text-gray-700">
                                Receipt_{d.receiptNo || 'Doc'}_
                                {d.name?.replace(/\s+/g, '_') || 'Client'}.pdf
                              </span>
                            </div>
                            <span className="text-[9px] font-semibold text-emerald-700">
                              Official e-Receipt
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Conversational Message Text */}
                      <div className="mt-2.5 space-y-1.5 text-xs leading-relaxed text-gray-800 dark:text-gray-100">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          Dear {d.salutation ? `${d.salutation} ` : ''}
                          {d.name || 'Valued Client'},
                        </p>
                        <p className="text-[11px] text-gray-700 dark:text-gray-200">
                          Greetings from <strong>SVI Infra Solutions</strong>. We gratefully
                          acknowledge receipt of your payment towards{' '}
                          <strong>
                            Plot {d.plotNo || 'N/A'}
                            {d.plotSize ? ` (${d.plotSize} Sq. Yds.)` : ''}
                          </strong>
                          .
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-emerald-100/70">
                          For any queries, please reply directly to this chat.
                        </p>
                      </div>

                      {/* Timestamp & Double Blue Ticks */}
                      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-gray-500 dark:text-emerald-200/80">
                        <span>{timeString}</span>
                        <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <textarea
                  id="wa-message-preview"
                  rows={7}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 font-sans text-xs text-gray-800 transition-colors focus:border-emerald-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 bg-gray-50/50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              Open WhatsApp
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
