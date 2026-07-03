'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function AreaInquiryForm({ areaName }: { areaName: string }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/site-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'),
          phone: fd.get('phone'),
          email: fd.get('email'),
          project_interest: `Area Inquiry: ${areaName}`,
          preferred_date: new Date().toISOString().split('T')[0],
        }),
      });

      if (!res.ok) throw new Error('Failed');

      toast.success('Inquiry submitted successfully! Our representative will contact you shortly.');
      (e.target as HTMLFormElement).reset();
    } catch {
      toast.error('Failed to submit inquiry. Please call +91-73000-07643 directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-3.5" onSubmit={handleSubmit}>
      <div>
        <input
          required
          name="name"
          type="text"
          placeholder="Your Name"
          className="focus:border-brand-gold focus:ring-brand-gold w-full rounded-md border border-gray-200 bg-gray-50 p-2.5 text-xs outline-none focus:ring-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>
      <div>
        <input
          required
          name="phone"
          type="tel"
          placeholder="Phone Number"
          className="focus:border-brand-gold focus:ring-brand-gold w-full rounded-md border border-gray-200 bg-gray-50 p-2.5 text-xs outline-none focus:ring-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>
      <div>
        <input
          required
          name="email"
          type="email"
          placeholder="Email Address"
          className="focus:border-brand-gold focus:ring-brand-gold w-full rounded-md border border-gray-200 bg-gray-50 p-2.5 text-xs outline-none focus:ring-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light w-full rounded-md py-3 text-xs font-bold tracking-wider uppercase transition-colors disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Request Call Back'}
      </button>
    </form>
  );
}
