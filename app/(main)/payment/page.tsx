'use client';

import { motion } from 'motion/react';
import { ShieldCheck, CreditCard, Landmark, X, Copy, Check } from 'lucide-react';
import { useState, type FormEvent } from 'react';

export default function Payment() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      alert('Redirecting to secure payment gateway...');
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 dark:bg-[#0C0C0C]">
      <section className="container mx-auto max-w-4xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-brand-navy mb-4 font-serif text-4xl dark:text-white">
            Secure Online Payment
          </h1>
          <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
            Pay your booking amount or installment securely through our integrated payment portal.
            All transactions are encrypted.
          </p>
        </motion.div>

        <div className="flex flex-col overflow-hidden border border-gray-200 bg-white shadow-xl md:flex-row dark:border-gray-700 dark:bg-gray-900">
          <div className="bg-brand-navy flex flex-col justify-between p-8 text-white md:w-1/3">
            <div>
              <h3 className="mb-6 font-serif text-xl">Payment Guidelines</h3>
              <ul className="space-y-4 text-sm text-gray-300">
                <li className="flex gap-3">
                  <ShieldCheck className="text-brand-gold shrink-0" size={20} /> 100% Secure &
                  Encrypted Transaction
                </li>
                <li className="flex gap-3">
                  <CreditCard className="text-brand-gold shrink-0" size={20} /> Credit/Debit Cards &
                  Net Banking Accepted
                </li>
                <li className="flex gap-3">
                  <Landmark className="text-brand-gold shrink-0" size={20} /> RTGS/NEFT options
                  available on request
                </li>
              </ul>
            </div>
            <div className="mt-12 text-xs text-gray-400">
              For payment related queries, please contact:
              <br />
              <span className="text-brand-gold mt-1 block">accounts@sviinfrasolutions.com</span>
            </div>
          </div>

          <div className="p-8 md:w-2/3 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="pay-name"
                    className="text-brand-navy text-xs font-bold tracking-widest uppercase dark:text-gray-300"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="pay-name"
                    required
                    className="focus:border-brand-gold w-full border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-colors focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="As per records"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="pay-phone"
                    className="text-brand-navy text-xs font-bold tracking-widest uppercase dark:text-gray-300"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="pay-phone"
                    required
                    className="focus:border-brand-gold w-full border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-colors focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="+91"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="pay-email"
                  className="text-brand-navy text-xs font-bold tracking-widest uppercase dark:text-gray-300"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="pay-email"
                  required
                  className="focus:border-brand-gold w-full border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-colors focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="For payment receipt"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="pay-project"
                    className="text-brand-navy text-xs font-bold tracking-widest uppercase dark:text-gray-300"
                  >
                    Project Name
                  </label>
                  <select
                    id="pay-project"
                    required
                    className="focus:border-brand-gold w-full appearance-none border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-colors focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Select Project</option>
                    <option value="shyam-aangan">Shyam Aangan</option>
                    <option value="shivani-vatika">Shivani Vatika</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="pay-unit"
                    className="text-brand-navy text-xs font-bold tracking-widest uppercase dark:text-gray-300"
                  >
                    Unit / Plot Number
                  </label>
                  <input
                    type="text"
                    id="pay-unit"
                    className="focus:border-brand-gold w-full border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-colors focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="If known"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="pay-amount"
                  className="text-brand-navy text-xs font-bold tracking-widest uppercase dark:text-gray-300"
                >
                  Payment Amount (INR)
                </label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 font-bold text-gray-500 dark:text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    id="pay-amount"
                    required
                    min="1"
                    className="focus:border-brand-gold w-full border border-gray-200 bg-gray-50 py-3 pr-4 pl-8 text-lg text-gray-900 transition-colors focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-gold text-brand-navy hover:bg-brand-navy hover:text-brand-gold flex w-full items-center justify-center gap-2 py-4 text-sm font-bold tracking-widest uppercase transition-colors disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="border-brand-navy h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"></span>
                ) : (
                  'Proceed to Pay'
                )}
              </button>

              <div className="mt-6 border-t border-gray-200 pt-4 text-center dark:border-gray-700">
                <span className="mb-4 block text-sm text-gray-500 dark:text-gray-400">
                  Alternatively, pay directly to our bank account
                </span>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-brand-navy border-brand-navy flex w-full items-center justify-center gap-2 border bg-white py-4 text-sm font-bold tracking-widest uppercase transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                >
                  <Landmark size={18} />
                  Pay via UPI / Bank Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Payment Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-[660px] overflow-hidden rounded-[2rem] border bg-white p-8 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 rounded-full bg-gray-50 p-2 transition-colors hover:bg-gray-100"
            >
              <X size={20} className="text-gray-500" />
            </button>

            <div className="mt-2 mb-6">
              <h2 className="mb-1 font-serif text-[28px] text-[#1e293b] dark:text-white">
                For Application Amount
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Payment Details</p>
            </div>

            <div className="flex flex-col items-start gap-8 md:flex-row">
              {/* Left Column: Beautiful Recreated 3D IDBI Bank Scanner Stand */}
              <div className="flex w-full shrink-0 flex-col items-center md:w-[270px]">
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
                              font-family="sans-serif"
                              font-weight="900"
                              font-size="16"
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
                            font-family="sans-serif"
                            font-weight="700"
                            font-size="3.5"
                            fill="#6B7280"
                            letter-spacing="0.3"
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
                              font-family="sans-serif"
                              font-weight="900"
                              font-size="16"
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
                            font-family="sans-serif"
                            font-weight="700"
                            font-size="4"
                            fill="#6B7280"
                            letter-spacing="0.1"
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
                      Svi Infra Solutions Pvt. Ltd
                    </span>
                    <button
                      onClick={() => handleCopy('Svi Infra Solutions Pvt. Ltd', 'name')}
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
      )}
    </div>
  );
}
