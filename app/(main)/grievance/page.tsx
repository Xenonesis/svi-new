'use client';

import { motion } from 'motion/react';
import dynamic from 'next/dynamic';

const GrievanceFAQ = dynamic(() => import('@/src/components/common/ContactFAQ'), { ssr: false });
import { MessageSquareWarning, FileText, Send, AlertCircle } from 'lucide-react';
import { useState, type FormEvent } from 'react';

export default function Grievance() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    description: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/grievance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Submission failed');
      const data = await res.json();
      setTicketId(data.ticket_id);
      setSubmitted(true);
    } catch {
      setSubmitError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-brand-bg min-h-screen pt-20 pb-20 dark:bg-gray-900">
      <section className="bg-brand-bg border-b border-gray-200 py-14 text-center md:py-20 dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="bg-brand-navy text-brand-gold dark:border-brand-gold/30 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full shadow-md dark:border">
            <MessageSquareWarning size={32} />
          </div>
          <h1 className="text-brand-navy animate-hero-h1 mb-6 font-serif text-3xl leading-tight sm:text-4xl md:text-6xl dark:text-gray-100">
            Raise a Grievance
          </h1>
          <div className="bg-brand-gold animate-hero-divider mx-auto mb-6 h-px w-16"></div>
          <p className="animate-hero-subtitle mx-auto max-w-2xl text-base leading-relaxed text-gray-500 md:text-lg dark:text-gray-400">
            We are committed to resolving your issues promptly. Please provide details of your
            grievance or support request below.
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-3xl px-4 py-16">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg border border-gray-200 bg-white p-10 text-center shadow-sm md:p-12 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <FileText size={40} />
            </div>
            <h2 className="text-brand-navy mb-4 font-serif text-2xl dark:text-white">
              Ticket Submitted Successfully
            </h2>
            <p className="mb-8 text-gray-600 dark:text-gray-400">
              Your grievance has been registered with Ticket ID:{' '}
              <strong className="text-brand-navy dark:text-white">#{ticketId}</strong>. Our support
              team will get back to you within 24-48 business hours.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-brand-gold border-brand-gold hover:text-brand-navy border-b pb-1 text-xs font-bold tracking-widest uppercase transition-colors dark:hover:text-white"
            >
              Submit Another Request
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm md:p-12 dark:border-gray-700 dark:bg-gray-800"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-brand-navy text-xs font-bold tracking-widest uppercase dark:text-gray-300">
                    Client Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    className="focus:border-brand-gold w-full border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-colors focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-brand-navy text-xs font-bold tracking-widest uppercase dark:text-gray-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    required
                    className="focus:border-brand-gold w-full border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-colors focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-brand-navy text-xs font-bold tracking-widest uppercase dark:text-gray-300">
                    Registered Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    required
                    className="focus:border-brand-gold w-full border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-colors focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-brand-navy text-xs font-bold tracking-widest uppercase dark:text-gray-300">
                    Project Name
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                    required
                    className="focus:border-brand-gold w-full border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-colors focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-brand-navy text-xs font-bold tracking-widest uppercase dark:text-gray-300">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    required
                    className="focus:border-brand-gold w-full appearance-none border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-colors focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Select Category</option>
                    <option value="payment">Payment &amp; Accounts</option>
                    <option value="construction">Construction Updates</option>
                    <option value="documents">Documentation / Registry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-brand-navy text-xs font-bold tracking-widest uppercase dark:text-gray-300">
                  Grievance Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  required
                  rows={5}
                  className="focus:border-brand-gold w-full resize-none border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-colors focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Please describe your issue in detail..."
                ></textarea>
              </div>

              {submitError && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle size={12} /> {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-navy hover:bg-brand-gold text-brand-gold hover:text-brand-navy border-brand-navy flex w-full items-center justify-center gap-2 border py-4 text-xs font-bold tracking-widest uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                ) : (
                  <>
                    Submit Request <Send size={16} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </section>
      <GrievanceFAQ />
    </div>
  );
}
