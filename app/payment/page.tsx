"use client";

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
      alert("Redirecting to secure payment gateway...");
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-serif text-brand-navy mb-4">Secure Online Payment</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Pay your booking amount or installment securely through our integrated payment portal. All transactions are encrypted.
          </p>
        </motion.div>

        <div className="bg-white shadow-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/3 bg-brand-navy p-8 text-white flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-serif mb-6">Payment Guidelines</h3>
              <ul className="space-y-4 text-sm text-gray-300">
                <li className="flex gap-3"><ShieldCheck className="shrink-0 text-brand-gold" size={20} /> 100% Secure & Encrypted Transaction</li>
                <li className="flex gap-3"><CreditCard className="shrink-0 text-brand-gold" size={20} /> Credit/Debit Cards & Net Banking Accepted</li>
                <li className="flex gap-3"><Landmark className="shrink-0 text-brand-gold" size={20} /> RTGS/NEFT options available on request</li>
              </ul>
            </div>
            <div className="mt-12 text-xs text-gray-400">
              For payment related queries, please contact:<br/>
              <span className="text-brand-gold mt-1 block">accounts@sviinfrasolutions.com</span>
            </div>
          </div>

          <div className="md:w-2/3 p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-navy">Full Name</label>
                  <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand-gold transition-colors" placeholder="As per records" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-navy">Phone Number</label>
                  <input type="tel" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand-gold transition-colors" placeholder="+91" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-brand-navy">Email Address</label>
                <input type="email" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand-gold transition-colors" placeholder="For payment receipt" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-navy">Project Name</label>
                  <select required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand-gold transition-colors appearance-none">
                    <option value="">Select Project</option>
                    <option value="shyam-aangan">Shyam Aangan</option>
                    <option value="shivani-vatika">Shivani Vatika</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-navy">Unit / Plot Number</label>
                  <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand-gold transition-colors" placeholder="If known" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-brand-navy">Payment Amount (INR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                  <input type="number" required min="1" className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand-gold transition-colors text-lg" placeholder="0.00" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-brand-gold text-brand-navy py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand-navy hover:text-brand-gold transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-brand-navy border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Proceed to Pay"
                )}
              </button>

              <div className="pt-4 border-t border-gray-200 mt-6 text-center">
                <span className="text-sm text-gray-500 mb-4 block">Alternatively, pay directly to our bank account</span>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-white text-brand-navy border border-brand-navy py-4 font-bold uppercase tracking-widest text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white rounded-[2rem] w-full max-w-[660px] overflow-hidden relative shadow-2xl p-8"
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>

            <div className="mb-6 mt-2">
              <h2 className="text-[28px] font-serif text-[#1e293b] mb-1">For Application Amount</h2>
              <p className="text-gray-500 text-sm">Payment Details</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Left Column: Beautiful Recreated 3D IDBI Bank Scanner Stand */}
              <div className="md:w-[270px] w-full shrink-0 flex flex-col items-center">
                {/* Main Stand Container */}
                <div className="w-full relative group">
                  {/* Subtle 3D shadow behind the stand */}
                  <div className="absolute inset-0 bg-black/10 rounded-2xl blur-lg transform translate-y-2 translate-x-1 group-hover:translate-y-3 transition-transform duration-300"></div>
                  
                  {/* Green Card Body */}
                  <div className="relative w-full bg-[#005c30] rounded-t-2xl p-3 border border-[#004d28] text-white flex flex-col overflow-hidden z-10 shadow-lg">
                    {/* Glossy Acrylic Reflection Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none"></div>
                    <div className="absolute -inset-y-12 -inset-x-24 bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 transform -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms] ease-out"></div>

                    {/* IDBI Brand Header */}
                    <div className="text-center text-[8px] tracking-widest uppercase opacity-95 font-bold mb-1.5 font-sans">
                      Powered by
                    </div>
                    
                    {/* Double Border IDBI Box */}
                    <div className="p-[2px] border border-white/95 mb-3 bg-[#005c30]">
                      <div className="border border-white/95 py-1.5 px-3 bg-[#005c30] flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-5 h-5 mr-2 shrink-0">
                          <circle cx="50" cy="50" r="46" fill="#e35205" />
                          <circle cx="50" cy="30" r="7" fill="#ffffff" />
                          <path d="M46 42h8v35h-8z" fill="#ffffff"/>
                          <path d="M50 42c-10 0-16 6-16 16v17h6V58c0-6 4-10 10-10s10 4 10 10v17h6V58c0-10-6-16-16-16z" fill="#ffffff"/>
                        </svg>
                        <span className="font-serif font-bold text-[14px] tracking-wider text-white leading-none">IDBI BANK</span>
                      </div>
                    </div>

                    {/* Inner White Container */}
                    <div className="bg-white rounded-xl p-3 text-black flex flex-col items-center shadow-inner">
                      {/* BHIM / UPI Logos Row */}
                      <div className="flex justify-between w-full items-center px-0.5 mb-2.5">
                        {/* BHIM SVG Logo */}
                        <svg viewBox="0 0 100 28" className="h-6 w-[45%] shrink-0">
                          <g transform="skewX(-10)">
                            <text x="2" y="16" font-family="sans-serif" font-weight="900" font-size="16" fill="#1b365d">BHIM</text>
                          </g>
                          <g transform="translate(48, 2)">
                            <path d="M0 0 L8 5.5 L0 11 Z" fill="#005c30" />
                            <path d="M0 0 L8 5.5 L2.5 2.5 Z" fill="#e35205" />
                          </g>
                          <text x="2" y="24" font-family="sans-serif" font-weight="700" font-size="3.5" fill="#6B7280" letter-spacing="0.3">SMART INTERFACE FOR MONEY</text>
                        </svg>
                        
                        {/* Vertical Separator */}
                        <div className="h-6 w-[1px] bg-gray-200"></div>
                        
                        {/* UPI SVG Logo */}
                        <svg viewBox="0 0 100 28" className="h-6 w-[45%] shrink-0">
                          <g transform="skewX(-10)">
                            <text x="2" y="16" font-family="sans-serif" font-weight="900" font-size="16" fill="#1E293B">UPI</text>
                          </g>
                          <g transform="translate(36, 2)">
                            <path d="M0 0 L8 5.5 L0 11 Z" fill="#09733c" />
                            <path d="M0 0 L8 5.5 L2.5 2.5 Z" fill="#e35205" />
                            <path d="M0 0 L2.5 1.7 L0 3.4 Z" fill="#1b365d" />
                          </g>
                          <text x="2" y="24" font-family="sans-serif" font-weight="700" font-size="4" fill="#6B7280" letter-spacing="0.1">UNIFIED PAYMENTS INTERFACE</text>
                        </svg>
                      </div>

                      {/* SCAN & PAY Label */}
                      <div className="text-[10px] font-extrabold tracking-widest text-[#1e293b] mb-1.5 uppercase font-sans">
                        SCAN & PAY
                      </div>

                      {/* QR Code Container */}
                      <div className="bg-white p-1.5 border border-gray-150 rounded-lg mb-2 shadow-sm w-full aspect-square flex items-center justify-center">
                        <img 
                          src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=1000221207001410.7300007643@idbi&pn=SVI%20INFRA%20SOLUTIONS%20PVT.%20LTD." 
                          alt="UPI QR Code" 
                          className="w-full h-auto aspect-square object-contain"
                        />
                      </div>

                      {/* UPI VPA (Ochre Gold Color, Centered, No background card) */}
                      <div className="text-[9px] font-bold text-[#9b722d] mb-2.5 text-center tracking-wide break-all font-mono">
                        1000221207001410.7300007643@idbi
                      </div>

                      {/* Company Green Bar (Sharp-edged, exact match) */}
                      <div className="bg-[#005c30] text-white w-full text-center py-1.5 px-2 rounded-sm font-bold text-[9px] tracking-wide mb-2.5 uppercase font-sans">
                        SVI INFRA SOLUTIONS PVT. LTD.
                      </div>

                      {/* Bilingual Acceptance Subtext */}
                      <div className="text-center space-y-1 mb-2.5">
                        <div className="text-[8px] font-extrabold text-[#1e293b] leading-tight font-sans">
                          Payment Accepted from all UPI Apps.
                        </div>
                        <div className="text-[8.5px] font-bold text-gray-700 leading-tight">
                          सभी UPI Apps से भुगतान स्वीकृत किया जाता है।
                        </div>
                      </div>

                      {/* Bottom Badges Row */}
                      <div className="flex justify-between w-full mt-1.5 pt-2 border-t border-gray-150 px-0.5">
                        {/* IDBI GO Mobile Badge */}
                        <div className="border border-[#b89551] rounded-sm p-[1px] flex items-center bg-[#005c30] w-[46%] h-6 justify-center shrink-0 scale-[0.9] origin-left">
                          <div className="flex flex-col text-center text-white leading-none font-sans justify-center items-center">
                            <span className="text-[3px] font-semibold tracking-tighter opacity-90 uppercase">IDBI BANK</span>
                            <span className="text-white text-[7px] font-black tracking-wide my-[0.5px]">GO</span>
                            <span className="text-[3px] font-semibold tracking-tighter opacity-90">Mobile</span>
                          </div>
                        </div>

                        {/* IDBI BANK PayWiz Badge */}
                        <div className="border border-[#b89551] rounded-sm p-[1px] flex items-center bg-black w-[46%] h-6 justify-center shrink-0 scale-[0.9] origin-right">
                          <div className="flex flex-col text-center leading-none font-sans justify-center items-center">
                            <span className="text-[3px] font-semibold text-white tracking-tighter opacity-80 uppercase leading-none">IDBI BANK</span>
                            <span className="text-[#b89551] text-[6.5px] font-extrabold italic tracking-tight mt-[1px]">PayWiz</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* 3D Acrylic Base Stand Foot */}
                  <div className="w-full flex flex-col items-center">
                    <div className="w-[94%] h-3 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 rounded-b-xl shadow-md border-t border-gray-600/50 z-0"></div>
                    <div className="w-[84%] h-1.5 bg-black/25 blur-[1.5px] rounded-full mt-0.5"></div>
                  </div>
                </div>
              </div>

              {/* Right Column: Bank Details */}
              <div className="flex-1 flex flex-col space-y-4 w-full">
                <div className="flex flex-col space-y-1.5">
                  <span className="text-sm text-gray-500 font-medium">Account Name</span>
                  <div className="bg-[#f8fafc] rounded-xl p-3.5 flex justify-between items-center border border-gray-100">
                    <span className="text-[13px] font-mono text-[#1e293b] tracking-wider break-words mr-2 uppercase leading-tight">Svi Infra Solutions Pvt. Ltd</span>
                    <button 
                      onClick={() => handleCopy("Svi Infra Solutions Pvt. Ltd", "name")}
                      className="text-brand-navy hover:text-brand-gold transition-colors p-1 shrink-0"
                      title="Copy"
                    >
                      {copiedField === "name" ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-gray-600" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <span className="text-sm text-gray-500 font-medium">Account Number</span>
                  <div className="bg-[#f8fafc] rounded-xl p-3.5 flex justify-between items-center border border-gray-100">
                    <span className="text-[13px] font-mono text-[#1e293b] tracking-wider">0894102000013837</span>
                    <button 
                      onClick={() => handleCopy("0894102000013837", "account")}
                      className="text-brand-navy hover:text-brand-gold transition-colors p-1 shrink-0"
                      title="Copy"
                    >
                      {copiedField === "account" ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-gray-600" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <span className="text-sm text-gray-500 font-medium">IFSC Code</span>
                  <div className="bg-[#f8fafc] rounded-xl p-3.5 flex justify-between items-center border border-gray-100">
                    <span className="text-[13px] font-mono text-[#1e293b] tracking-wider">IBKL0000894</span>
                    <button 
                      onClick={() => handleCopy("IBKL0000894", "ifsc")}
                      className="text-brand-navy hover:text-brand-gold transition-colors p-1 shrink-0"
                      title="Copy"
                    >
                      {copiedField === "ifsc" ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-gray-600" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <span className="text-sm text-gray-500 font-medium">Bank / Branch</span>
                  <div className="bg-[#f8fafc] rounded-xl p-3.5 flex justify-between items-center border border-gray-100">
                    <span className="text-[13px] font-mono text-[#1e293b] tracking-wider">IDBI BANK</span>
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
