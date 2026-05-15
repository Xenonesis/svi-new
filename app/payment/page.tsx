"use client";

import { motion } from 'motion/react';
import { ShieldCheck, CreditCard, Landmark } from 'lucide-react';
import { useState, type FormEvent } from 'react';

export default function Payment() {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
