'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, CreditCard, Landmark, Copy, Check } from 'lucide-react';

const AMOUNTS = [100000, 200000, 500000, 1000000];

export default function PaymentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [projects, setProjects] = useState<{ value: string; label: string }[]>([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    project: '',
    amount: '',
  });

  useEffect(() => {
    let active = true;
    fetch('/api/properties')
      .then((res) => res.json())
      .then((data) => {
        if (active && data.properties) {
          setProjects(data.properties.map((p: any) => ({ value: p.slug, label: p.name })));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      alert('Redirecting to secure payment gateway...');
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Your payment is secure and encrypted. Proceed with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="focus:border-brand-gold w-full border px-4 py-3 text-sm outline-none dark:border-gray-600 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email *
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="focus:border-brand-gold w-full border px-4 py-3 text-sm outline-none dark:border-gray-600 dark:bg-gray-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone *
            </label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="focus:border-brand-gold w-full border px-4 py-3 text-sm outline-none dark:border-gray-600 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Project *
            </label>
            <select
              required
              value={form.project}
              onChange={(e) => setForm((f) => ({ ...f, project: e.target.value }))}
              className="focus:border-brand-gold w-full border px-4 py-3 text-sm outline-none dark:border-gray-600 dark:bg-gray-800"
            >
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Amount (₹)
          </label>
          <div className="mb-4 flex flex-wrap gap-3">
            {AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setForm((f) => ({ ...f, amount: amt.toString() }))}
                className={`cursor-pointer border px-4 py-2 text-sm font-bold transition-colors ${
                  form.amount === amt.toString()
                    ? 'bg-brand-gold text-brand-navy border-brand-gold'
                    : 'hover:border-brand-gold border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400'
                }`}
              >
                ₹{amt.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
          <input
            type="number"
            placeholder="Or enter custom amount"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            className="focus:border-brand-gold w-full border px-4 py-3 text-sm outline-none dark:border-gray-600 dark:bg-gray-800"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-navy hover:bg-brand-gold flex w-full cursor-pointer items-center justify-center gap-2 px-8 py-4 text-sm font-bold tracking-widest text-white uppercase transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Redirecting...' : 'Pay Securely'}
          <CreditCard size={16} />
        </button>
      </form>

      {/* Bank Transfer Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-900"
      >
        <div className="mb-6 flex items-center gap-3">
          <Landmark className="text-brand-gold h-6 w-6" />
          <h3 className="text-brand-navy font-serif text-xl dark:text-gray-100">Payment Details</h3>
        </div>
        <div className="flex flex-col items-start gap-8 md:flex-row">
          {/* Left Column: Beautiful Recreated 3D IDBI Bank Scanner Stand */}
          <div className="mx-auto flex w-full max-w-[240px] shrink-0 flex-col items-center min-[380px]:max-w-[280px] md:w-[270px] md:max-w-none">
            {/* Main Stand Container */}
            <div className="group relative w-full">
              {/* Subtle 3D shadow behind the stand */}
              <div className="absolute inset-0 translate-x-1 translate-y-2 transform rounded-2xl bg-black/10 blur-lg transition-transform duration-300 group-hover:translate-y-3"></div>

              {/* Green Card Body */}
              <div className="relative z-10 flex w-full flex-col overflow-hidden rounded-t-2xl border border-[#004d28] bg-[#005c30] p-3 text-white shadow-lg">
                {/* Glossy Acrylic Reflection Effect */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10"></div>
                <div className="absolute -inset-x-24 -inset-y-12 -translate-x-full rotate-45 transform bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-[1500ms] ease-out group-hover:translate-x-full"></div>

                {/* IDBI Brand Header */}
                <div className="mb-1.5 text-center font-sans text-[8px] font-bold tracking-widest uppercase opacity-95">
                  Powered by
                </div>

                {/* Double Border IDBI Box */}
                <div className="mb-3 border border-white/95 bg-[#005c30] p-[2px]">
                  <div className="flex items-center justify-center border border-white/95 bg-[#005c30] px-3 py-1.5">
                    <svg viewBox="0 0 100 100" className="mr-2 h-5 w-5 shrink-0">
                      <circle cx="50" cy="50" r="46" fill="#e35205" />
                      <circle cx="50" cy="30" r="7" fill="#ffffff" />
                      <path d="M46 42h8v35h-8z" fill="#ffffff" />
                      <path
                        d="M50 42c-10 0-16 6-16 16v17h6V58c0-6 4-10 10-10s10 4 10 10v17h6V58c0-10-6-16-16-16z"
                        fill="#ffffff"
                      />
                    </svg>
                    <span className="font-serif text-[14px] leading-none font-bold tracking-wider text-white">
                      IDBI BANK
                    </span>
                  </div>
                </div>

                {/* Inner White Container */}
                <div className="flex flex-col items-center rounded-xl bg-white p-3 text-black shadow-inner">
                  {/* BHIM / UPI Logos Row */}
                  <div className="mb-2.5 flex w-full items-center justify-between px-0.5">
                    {/* BHIM SVG Logo */}
                    <svg viewBox="0 0 100 28" className="h-6 w-[45%] shrink-0">
                      <g transform="skewX(-10)">
                        <text
                          x="2"
                          y="16"
                          fontFamily="sans-serif"
                          fontWeight="900"
                          fontSize="16"
                          fill="#1b365d"
                        >
                          BHIM
                        </text>
                      </g>
                      <g transform="translate(48, 2)">
                        <path d="M0 0 L8 5.5 L0 11 Z" fill="#005c30" />
                        <path d="M0 0 L8 5.5 L2.5 2.5 Z" fill="#e35205" />
                      </g>
                      <text
                        x="2"
                        y="24"
                        fontFamily="sans-serif"
                        fontWeight="700"
                        fontSize="3.5"
                        fill="#6B7280"
                        letterSpacing="0.3"
                      >
                        SMART INTERFACE FOR MONEY
                      </text>
                    </svg>

                    {/* Vertical Separator */}
                    <div className="h-6 w-[1px] bg-gray-200"></div>

                    {/* UPI SVG Logo */}
                    <svg viewBox="0 0 100 28" className="h-6 w-[45%] shrink-0">
                      <g transform="skewX(-10)">
                        <text
                          x="2"
                          y="16"
                          fontFamily="sans-serif"
                          fontWeight="900"
                          fontSize="16"
                          fill="#1E293B"
                        >
                          UPI
                        </text>
                      </g>
                      <g transform="translate(36, 2)">
                        <path d="M0 0 L8 5.5 L0 11 Z" fill="#09733c" />
                        <path d="M0 0 L8 5.5 L2.5 2.5 Z" fill="#e35205" />
                        <path d="M0 0 L2.5 1.7 L0 3.4 Z" fill="#1b365d" />
                      </g>
                      <text
                        x="2"
                        y="24"
                        fontFamily="sans-serif"
                        fontWeight="700"
                        fontSize="4"
                        fill="#6B7280"
                        letterSpacing="0.1"
                      >
                        UNIFIED PAYMENTS INTERFACE
                      </text>
                    </svg>
                  </div>

                  {/* SCAN & PAY Label */}
                  <div className="mb-1.5 font-sans text-[10px] font-extrabold tracking-widest text-[#1e293b] uppercase">
                    SCAN & PAY
                  </div>

                  {/* QR Code Container */}
                  <div className="border-gray-150 mb-2 flex aspect-square w-full items-center justify-center rounded-lg border bg-white p-1.5 shadow-sm">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=1000221207001410.7300007643@idbi&pn=SVI%20INFRA%20SOLUTIONS%20PVT.%20LTD."
                      alt="UPI QR Code"
                      className="aspect-square h-auto w-full object-contain"
                    />
                  </div>

                  {/* UPI VPA (Ochre Gold Color, Centered, No background card) */}
                  <div className="mb-2.5 text-center font-mono text-[9px] font-bold tracking-wide break-all text-[#9b722d]">
                    1000221207001410.7300007643@idbi
                  </div>

                  {/* Company Green Bar (Sharp-edged, exact match) */}
                  <div className="mb-2.5 w-full rounded-sm bg-[#005c30] px-2 py-1.5 text-center font-sans text-[9px] font-bold tracking-wide text-white uppercase">
                    SVI INFRA SOLUTIONS PVT. LTD.
                  </div>

                  {/* Bilingual Acceptance Subtext */}
                  <div className="mb-2.5 space-y-1 text-center">
                    <div className="font-sans text-[8px] leading-tight font-extrabold text-[#1e293b]">
                      Payment Accepted from all UPI Apps.
                    </div>
                    <div className="text-[8.5px] leading-tight font-bold text-gray-700">
                      सभी UPI Apps से भुगतान स्वीकृत किया जाता है।
                    </div>
                  </div>

                  {/* Bottom Badges Row */}
                  <div className="border-gray-150 mt-1.5 flex w-full justify-between border-t px-0.5 pt-2">
                    {/* IDBI GO Mobile Badge */}
                    <div className="flex h-6 w-[46%] shrink-0 origin-left scale-[0.9] items-center justify-center rounded-sm border border-[#b89551] bg-[#005c30] p-[1px]">
                      <div className="flex flex-col items-center justify-center text-center font-sans leading-none text-white">
                        <span className="text-[3px] font-semibold tracking-tighter uppercase opacity-90">
                          IDBI BANK
                        </span>
                        <span className="my-[0.5px] text-[7px] font-black tracking-wide text-white">
                          GO
                        </span>
                        <span className="text-[3px] font-semibold tracking-tighter opacity-90">
                          Mobile
                        </span>
                      </div>
                    </div>

                    {/* IDBI BANK PayWiz Badge */}
                    <div className="flex h-6 w-[46%] shrink-0 origin-right scale-[0.9] items-center justify-center rounded-sm border border-[#b89551] bg-black p-[1px]">
                      <div className="flex flex-col items-center justify-center text-center font-sans leading-none">
                        <span className="text-[3px] leading-none font-semibold tracking-tighter text-white uppercase opacity-80">
                          IDBI BANK
                        </span>
                        <span className="mt-[1px] text-[6.5px] font-extrabold tracking-tight text-[#b89551] italic">
                          PayWiz
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3D Acrylic Base Stand Foot */}
              <div className="flex w-full flex-col items-center">
                <div className="z-0 h-3 w-[94%] rounded-b-xl border-t border-gray-600/50 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 shadow-md"></div>
                <div className="mt-0.5 h-1.5 w-[84%] rounded-full bg-black/25 blur-[1.5px]"></div>
              </div>
            </div>
          </div>

          {/* Right Column: Bank Details */}
          <div className="flex w-full flex-1 flex-col space-y-4">
            <div className="flex flex-col space-y-1.5">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Account Name
              </span>
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#f8fafc] p-3.5 dark:border-gray-700 dark:bg-gray-800">
                <span className="mr-2 font-mono text-[13px] leading-tight tracking-wider break-words text-[#1e293b] uppercase dark:text-white">
                  SVI INFRA SOLUTIONS PVT. LTD.
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy('SVI INFRA SOLUTIONS PVT. LTD.', 'name')}
                  className="text-brand-navy hover:text-brand-gold shrink-0 p-1 transition-colors"
                  title="Copy"
                >
                  {copiedField === 'name' ? (
                    <Check size={18} className="text-green-600" />
                  ) : (
                    <Copy size={18} className="text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Account Number
              </span>
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#f8fafc] p-3.5 dark:border-gray-700 dark:bg-gray-800">
                <span className="font-mono text-[13px] tracking-wider text-[#1e293b] dark:text-white">
                  0894102000013837
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy('0894102000013837', 'account')}
                  className="text-brand-navy hover:text-brand-gold shrink-0 p-1 transition-colors"
                  title="Copy"
                >
                  {copiedField === 'account' ? (
                    <Check size={18} className="text-green-600" />
                  ) : (
                    <Copy size={18} className="text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                IFSC Code
              </span>
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#f8fafc] p-3.5 dark:border-gray-700 dark:bg-gray-800">
                <span className="font-mono text-[13px] tracking-wider text-[#1e293b] dark:text-white">
                  IBKL0000894
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy('IBKL0000894', 'ifsc')}
                  className="text-brand-navy hover:text-brand-gold shrink-0 p-1 transition-colors"
                  title="Copy"
                >
                  {copiedField === 'ifsc' ? (
                    <Check size={18} className="text-green-600" />
                  ) : (
                    <Copy size={18} className="text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Bank / Branch
              </span>
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#f8fafc] p-3.5 dark:border-gray-700 dark:bg-gray-800">
                <span className="font-mono text-[13px] tracking-wider text-[#1e293b] dark:text-white">
                  IDBI BANK
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
