'use client';

import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ShieldCheck, Download, Sparkles, ArrowRight } from 'lucide-react';
import { normalizeIndianPhone } from '@/src/lib/utils/phone';

interface WhatsAppBrochureModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
  defaultBrochureUrl?: string;
}

function WhatsAppBrochureModal({
  isOpen,
  onClose,
  projectName = 'Shivani Vatika-11th',
  defaultBrochureUrl = '/Shivani Vatika 11/ShivaniVatika 11.pdf',
}: WhatsAppBrochureModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [intent, setIntent] = useState<'investment' | 'residential' | 'immediate'>('investment');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Lock body scroll on modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!phone.trim() || !normalizeIndianPhone(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // 1. Ingest lead to DB
      await fetch('/api/chat/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          source: `instant_whatsapp_brochure_${projectName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
        }),
      });

      // 2. Open WhatsApp directly with personalized greeting
      const cleanPhone = '917300007643'; // Official SVI Sales Line
      const waMsg = encodeURIComponent(
        `Namaste SVI Infra Solutions,\n\nMy name is *${name.trim()}*.\nI want the instant layout map, price breakdown, and official brochure for *${projectName}*.\n\nPurpose: ${intent === 'investment' ? 'Capital Growth Investment' : intent === 'residential' ? 'Residential Home Construction' : 'Immediate Plot Booking'}.\n\nPlease send me the PDF and current payment plan on WhatsApp.`
      );
      const waUrl = `https://wa.me/${cleanPhone}?text=${waMsg}`;

      setSubmitted(true);

      // Trigger automatic brochure PDF open in new tab
      if (defaultBrochureUrl) {
        window.open(defaultBrochureUrl, '_blank', 'noopener,noreferrer');
      }

      // Open WhatsApp chat in background/active tab
      setTimeout(() => {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }, 500);
    } catch {
      setError('Could not process request. Please try again or call us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 text-white shadow-2xl sm:p-8"
            role="dialog"
            aria-modal="true"
          >
            {/* Ambient Gold Glow */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            {!submitted ? (
              <div>
                {/* Header */}
                <div className="mb-6">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-amber-300 uppercase">
                    <Sparkles size={13} className="text-amber-400" />
                    <span>Instant Price List & Layout</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Get Instant Brochure on WhatsApp
                  </h3>
                  <p className="mt-2 text-sm text-slate-300">
                    Receive the verified layout plan, BSP pricing sheet, and legal approval
                    documents directly on your WhatsApp within seconds.
                  </p>
                </div>

                {/* Scarcity / Trust Banner */}
                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-950/30 p-3 text-xs text-emerald-300">
                  <ShieldCheck size={18} className="shrink-0 text-emerald-400" />
                  <span>
                    <strong>100% Verified Documents</strong> • 0 Spam Guarantee • Direct SVI Sales
                    Office Dispatch
                  </span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium tracking-wider text-slate-300 uppercase">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Sharma"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-amber-500/60 focus:bg-white/10 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium tracking-wider text-slate-300 uppercase">
                      WhatsApp Mobile Number
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-sm font-semibold text-amber-400">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="98765 43210"
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-4 pl-14 text-sm text-white placeholder-slate-500 transition-colors focus:border-amber-500/60 focus:bg-white/10 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium tracking-wider text-slate-300 uppercase">
                      Primary Objective
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'investment', label: 'Investment' },
                        { id: 'residential', label: 'Own Home' },
                        { id: 'immediate', label: 'Immediate' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setIntent(item.id as typeof intent)}
                          className={`rounded-xl border py-2 text-xs font-medium transition-all ${
                            intent === item.id
                              ? 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-sm'
                              : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && <p className="text-xs text-rose-400">{error}</p>}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-2 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/30 disabled:opacity-60"
                  >
                    {submitting ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                    ) : (
                      <>
                        <span>Get Instant WhatsApp Brochure</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 ring-8 ring-emerald-500/5">
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="font-serif text-2xl font-bold text-white">Brochure Dispatched!</h4>
                <p className="mt-2 text-sm text-slate-300">
                  Thank you, <strong>{name}</strong>. The official high-resolution brochure has
                  opened and your WhatsApp chat is connecting with our Senior Property Advisor.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <a
                    href={defaultBrochureUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/20"
                  >
                    <Download size={14} />
                    Download PDF Direct
                  </a>
                  <button
                    onClick={onClose}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default memo(WhatsAppBrochureModal);
