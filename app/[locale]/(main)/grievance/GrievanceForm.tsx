'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  { value: 'service', label: 'Service Issue' },
  { value: 'billing', label: 'Billing / Payment' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'staff', label: 'Staff Behavior' },
  { value: 'other', label: 'Other' },
];

export default function GrievanceForm() {
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

  const updateField = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl rounded-xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-500/30 dark:bg-green-500/10"
      >
        <div className="text-brand-gold mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
          <Send size={28} />
        </div>
        <h3 className="text-brand-navy mb-2 font-serif text-2xl dark:text-gray-100">
          Grievance Submitted
        </h3>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          Your grievance has been received. Your ticket ID is:
        </p>
        <div className="bg-brand-navy/5 mx-auto inline-block rounded-lg px-6 py-3 font-mono text-lg font-bold dark:bg-white/5">
          {ticketId}
        </div>
        <p className="mt-4 text-sm text-gray-500">We will respond within 48 hours.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      {submitError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          <AlertCircle size={18} />
          {submitError}
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="focus:border-brand-gold dark:focus:border-brand-gold w-full border border-gray-300 bg-white px-4 py-3 text-sm transition-colors outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="focus:border-brand-gold dark:focus:border-brand-gold w-full border border-gray-300 bg-white px-4 py-3 text-sm transition-colors outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
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
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className="focus:border-brand-gold dark:focus:border-brand-gold w-full border border-gray-300 bg-white px-4 py-3 text-sm transition-colors outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category *
          </label>
          <select
            required
            value={formData.category}
            onChange={(e) => updateField('category', e.target.value)}
            className="focus:border-brand-gold dark:focus:border-brand-gold w-full border border-gray-300 bg-white px-4 py-3 text-sm transition-colors outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="">Select category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Subject *
        </label>
        <input
          type="text"
          required
          value={formData.subject}
          onChange={(e) => updateField('subject', e.target.value)}
          className="focus:border-brand-gold dark:focus:border-brand-gold w-full border border-gray-300 bg-white px-4 py-3 text-sm transition-colors outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description *
        </label>
        <textarea
          required
          rows={5}
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          className="focus:border-brand-gold dark:focus:border-brand-gold w-full resize-none border border-gray-300 bg-white px-4 py-3 text-sm transition-colors outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-brand-navy hover:bg-brand-gold flex w-full items-center justify-center gap-2 px-8 py-4 text-sm font-bold tracking-widest text-white uppercase transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Grievance'}
        <Send size={16} />
      </button>
    </form>
  );
}
