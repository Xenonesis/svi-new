'use client';

import { useState, type FormEvent, memo } from 'react';
import { Send, X, User, Phone, Check } from 'lucide-react';

interface LeadCaptureProps {
  onClose: () => void;
  onSubmitted: () => void;
}

function LeadCapture({ onClose, onSubmitted }: LeadCaptureProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''))) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/chat/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });

      if (!res.ok) throw new Error('Failed to save');

      setSubmitted(true);
      onSubmitted();
      setTimeout(onClose, 2000);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-4 mb-3 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
        <Check className="h-4 w-4 shrink-0" />
        Thanks! We&apos;ll get back to you shortly.
      </div>
    );
  }

  return (
    <div className="border-brand-gold/20 bg-brand-gold/5 dark:border-brand-gold/10 mx-4 mb-3 rounded-xl border p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-brand-navy text-sm font-medium dark:text-gray-200">
          Want us to follow up? 👋
        </p>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
          <User className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="flex-1 text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:bg-transparent dark:text-gray-200"
          />
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
          <Phone className="h-4 w-4 text-gray-400" />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Mobile number"
            className="flex-1 text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:bg-transparent dark:text-gray-200"
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="bg-brand-navy hover:bg-brand-navy-light dark:bg-brand-gold dark:text-brand-navy flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-white transition-colors disabled:opacity-60"
        >
          {submitting ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <Send className="h-3 w-3" />
              Send
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default memo(LeadCapture);
