'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Car, ShieldCheck, Sparkles } from 'lucide-react';

export interface SiteVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledProject?: string;
  prefilledPlot?: string;
}

export function SiteVisitModal({
  isOpen,
  onClose,
  prefilledProject = 'Shivani Vatika 11th',
  prefilledPlot,
}: SiteVisitModalProps): React.JSX.Element | null {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupCity, setPickupCity] = useState('Jaipur');
  const [visitDate, setVisitDate] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  useEffect(() => {
    if (isOpen) {
      setVisitDate(tomorrowStr);
      setIsSuccess(false);
      setPhoneError('');
    }
  }, [isOpen, tomorrowStr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setPhoneError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const notes = `Booked via Mobile Conversion Dock. Free AC Cab requested.${
        prefilledPlot ? ` Interested in Plot #${prefilledPlot}.` : ''
      } Pickup: ${pickupCity}.`;

      const res = await fetch('/api/site-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: cleanPhone,
          project_interest: prefilledPlot
            ? `${prefilledProject} - Plot #${prefilledPlot}`
            : prefilledProject,
          preferred_date: visitDate || tomorrowStr,
          notes,
        }),
      });

      if (!res.ok) throw new Error('Failed to book visit');
      setIsSuccess(true);
    } catch {
      setPhoneError('Failed to connect. Please call or WhatsApp us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 p-0 backdrop-blur-md sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-lg rounded-t-3xl border border-white/10 bg-[#0c1019] p-6 text-white shadow-2xl sm:rounded-3xl"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 rounded-full bg-white/5 p-2 text-gray-400 hover:bg-white/10 hover:text-white"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {isSuccess ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">Booking Confirmed!</h3>
                <p className="mt-2 text-sm text-gray-300">
                  Our executive will call you within 15 minutes to confirm your complimentary AC Cab
                  pickup.
                </p>
                {prefilledPlot && (
                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-300">
                    <Sparkles size={14} /> Reserved Site Visit for Plot #{prefilledPlot}
                  </div>
                )}
                <div className="mt-6 flex flex-col gap-3">
                  <a
                    href={`https://wa.me/919218300589?text=${encodeURIComponent(
                      `Namaste SVI Infra, I just booked a site visit for ${prefilledProject}${
                        prefilledPlot ? ` (Plot #${prefilledPlot})` : ''
                      }. Please send cab details.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full rounded-xl bg-[#25D366] py-3.5 text-center text-sm font-bold text-slate-950 transition-all hover:brightness-105"
                  >
                    Get Cab Details on WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-gray-300 hover:bg-white/10"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
                    <Car size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white">
                      Schedule Free Site Visit
                    </h3>
                    <p className="text-xs font-medium text-amber-300/90">
                      Free AC Cab Pickup & Drop for Family
                    </p>
                  </div>
                </div>

                {prefilledPlot && (
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 px-3.5 py-2 text-xs">
                    <span className="text-gray-300">Selected Plot:</span>
                    <span className="font-bold text-amber-300">Plot #{prefilledPlot}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter full name"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-400 focus:bg-white/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
                      Mobile Number *
                    </label>
                    <div className="flex">
                      <span className="flex items-center rounded-l-xl border border-r-0 border-white/10 bg-white/10 px-3.5 text-sm font-semibold text-gray-300">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value.replace(/\D/g, ''));
                          if (phoneError) setPhoneError('');
                        }}
                        placeholder="10-digit mobile number"
                        className="w-full rounded-r-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-400 focus:bg-white/10"
                      />
                    </div>
                    {phoneError && <p className="mt-1 text-xs text-rose-400">{phoneError}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
                        Visit Date *
                      </label>
                      <input
                        type="date"
                        required
                        min={todayStr}
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white [color-scheme:dark] outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
                        Pickup City
                      </label>
                      <select
                        value={pickupCity}
                        onChange={(e) => setPickupCity(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#111622] px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                      >
                        <option value="Jaipur">Jaipur</option>
                        <option value="Ringas">Ringas</option>
                        <option value="Sikar">Sikar</option>
                        <option value="Delhi-NCR">Delhi-NCR</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-[11px] text-gray-400">
                    <ShieldCheck size={16} className="flex-shrink-0 text-amber-400" />
                    <span>No obligation, 100% free door-to-door AC cab pickup.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c9a84c] py-3.5 text-center text-sm font-bold text-[#080b11] shadow-lg shadow-amber-500/20 transition-all hover:brightness-105 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Booking Cab...' : 'Confirm Free Cab Booking'}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
