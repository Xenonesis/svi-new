'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Copy, Check, MessageSquare, Phone, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SavedReceipt } from './ReceiptTypes';
import {
  cleanIndianPhoneNumber,
  isValidIndianPhoneNumber,
  buildReceiptWhatsAppMessage,
  buildWhatsAppShareUrl,
} from '@/src/lib/receipt/receiptWhatsApp';

interface ReceiptWhatsAppModalProps {
  receipt: SavedReceipt | null;
  onClose: () => void;
}

export function ReceiptWhatsAppModal({ receipt, onClose }: ReceiptWhatsAppModalProps) {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [touched, setTouched] = useState(false);

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
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="wa-message-preview"
                  className="text-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  WhatsApp Message Preview
                </label>
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
              <textarea
                id="wa-message-preview"
                rows={7}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 font-sans text-xs text-gray-800 transition-colors focus:border-emerald-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
              />
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
