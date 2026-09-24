'use client';

import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car, X, CheckCircle2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { normalizeIndianPhone } from '@/src/lib/utils/phone';

interface SiteVisitPillProps {
  areaName?: string;
  defaultPickup?: string;
}

function SiteVisitPill({
  areaName = 'Shivani Vatika 11th (Khatu Shyam Highway)',
  defaultPickup = 'Jaipur City / Railway Station',
}: SiteVisitPillProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [pickup, setPickup] = useState(defaultPickup);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Lock body scroll when modal open
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
      setError('Please enter your full name');
      return;
    }
    if (!phone.trim() || !normalizeIndianPhone(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // 1. Record lead in DB
      await fetch('/api/chat/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          source: `free_cab_site_visit_${areaName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
        }),
      });

      // 2. Open WhatsApp for instant booking confirmation with site coordinator
      const officialPhone = '917300007643';
      const waMsg = encodeURIComponent(
        `Namaste SVI Infra Solutions,\n\nI want to book a *Free Cab Site Visit* to *${areaName}*.\n\n*Name:* ${name.trim()}\n*Mobile:* ${phone.trim()}\n*Preferred Date:* ${date || 'This Coming Weekend'}\n*Pickup Point:* ${pickup}\n\nPlease assign a dedicated site coordinator and confirm cab timing.`
      );
      const waUrl = `https://wa.me/${officialPhone}?text=${waMsg}`;

      setSubmitted(true);

      setTimeout(() => {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }, 400);
    } catch {
      setError('Could not submit booking. Please call our sales desk directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Sticky Pill for Desktop & Mobile */}
      <aside
        aria-label="Book Free Cab Site Visit"
        className="fixed bottom-20 left-4 z-40 sm:bottom-6 sm:left-6"
      >
        <motion.button
          type="button"
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="group relative flex items-center gap-3 overflow-hidden rounded-full border border-amber-400/40 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 px-4 py-3 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-amber-400 hover:shadow-amber-500/25 sm:px-5 sm:py-3.5"
        >
          {/* Subtle radar ping ring */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-amber-500" />
          </span>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md">
            <Car size={18} className="animate-pulse" />
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
                Complimentary
              </span>
              <span className="py-0.2 rounded-full bg-emerald-500/20 px-1.5 text-[9px] font-semibold text-emerald-400">
                Free Cab
              </span>
            </div>
            <div className="font-serif text-xs font-bold text-white transition-colors group-hover:text-amber-200 sm:text-sm">
              Book Free Site Visit Cab
            </div>
          </div>
        </motion.button>
      </aside>

      {/* Booking Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
              aria-hidden="true"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 text-white shadow-2xl sm:p-8"
              role="dialog"
              aria-modal="true"
            >
              {/* Gold Ambient Flare */}
              <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              {!submitted ? (
                <div>
                  <div className="mb-5">
                    <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-amber-300 uppercase">
                      <Sparkles size={13} className="text-amber-400" />
                      <span>Zero Cost • AC Cab Pickup & Drop</span>
                    </div>
                    <h3 className="font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      Book Free Cab Site Visit
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-300 sm:text-sm">
                      Experience the ground reality of <strong>{areaName}</strong>. We arrange a
                      chauffeured private AC cab from your doorstep in Jaipur directly to the site
                      and back.
                    </p>
                  </div>

                  <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-950/30 p-3 text-xs text-emerald-300">
                    <ShieldCheck size={18} className="shrink-0 text-emerald-400" />
                    <span>
                      <strong>No Obligation to Buy</strong> • Sanitized AC Cab • Guided by Senior
                      SVI Town Planner
                    </span>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div>
                      <label className="mb-1 block text-xs font-medium tracking-wider text-slate-300 uppercase">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Vikramaditya Singh"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-colors focus:border-amber-500/60 focus:bg-white/10 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium tracking-wider text-slate-300 uppercase">
                        WhatsApp Contact Number
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
                          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pr-4 pl-14 text-sm text-white placeholder-slate-500 transition-colors focus:border-amber-500/60 focus:bg-white/10 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium tracking-wider text-slate-300 uppercase">
                          Preferred Visit Date
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white transition-colors focus:border-amber-500/60 focus:bg-white/10 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium tracking-wider text-slate-300 uppercase">
                          Pickup Location
                        </label>
                        <input
                          type="text"
                          value={pickup}
                          onChange={(e) => setPickup(e.target.value)}
                          placeholder="e.g. Vaishali Nagar, Jaipur"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white placeholder-slate-500 transition-colors focus:border-amber-500/60 focus:bg-white/10 focus:outline-none"
                        />
                      </div>
                    </div>

                    {error && <p className="text-xs text-rose-400">{error}</p>}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="mt-2 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500 disabled:opacity-60"
                    >
                      {submitting ? (
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                      ) : (
                        <>
                          <span>Confirm Free Cab Booking</span>
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
                  <h4 className="font-serif text-2xl font-bold text-white">Cab Scheduled!</h4>
                  <p className="mt-2 text-sm text-slate-300">
                    Thank you, <strong>{name}</strong>. Our site visit desk is coordinating your AC
                    cab driver details for <strong>{areaName}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setSubmitted(false);
                    }}
                    className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-amber-500 px-8 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default memo(SiteVisitPill);
