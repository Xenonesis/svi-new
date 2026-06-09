'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, CreditCard, Landmark, X, Copy, Check, AlertCircle } from 'lucide-react';

const AMOUNTS = [100000, 200000, 500000, 1000000];

export default function PaymentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleSubmit = (e: FormEvent) => {
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
              className="w-full border px-4 py-3 text-sm outline-none focus:border-[#c9a84c] dark:border-gray-600 dark:bg-gray-800"
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
              className="w-full border px-4 py-3 text-sm outline-none focus:border-[#c9a84c] dark:border-gray-600 dark:bg-gray-800"
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
              className="w-full border px-4 py-3 text-sm outline-none focus:border-[#c9a84c] dark:border-gray-600 dark:bg-gray-800"
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
              className="w-full border px-4 py-3 text-sm outline-none focus:border-[#c9a84c] dark:border-gray-600 dark:bg-gray-800"
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
            className="w-full border px-4 py-3 text-sm outline-none focus:border-[#c9a84c] dark:border-gray-600 dark:bg-gray-800"
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
          <h3 className="text-brand-navy font-serif text-xl dark:text-gray-100">
            Bank Transfer Details
          </h3>
        </div>
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
          {[
            { label: 'Account Name', value: 'SVI INFRA SOLUTIONS PRIVATE LIMITED' },
            { label: 'Account Number', value: '1234567890' },
            { label: 'IFSC Code', value: 'SBIN0012345' },
            { label: 'Bank Name', value: 'State Bank of India' },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between border-b pb-2 dark:border-gray-700"
            >
              <span className="font-medium">{row.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-brand-navy font-mono dark:text-gray-200">{row.value}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(row.value, row.label)}
                  className="hover:text-brand-gold cursor-pointer text-gray-400 transition-colors"
                >
                  {copiedField === row.label ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
