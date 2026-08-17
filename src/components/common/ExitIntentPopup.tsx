'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, Home } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { normalizeIndianPhone } from '@/src/lib/utils/phone';

export default function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const t = useTranslations('common');

  useEffect(() => {
    // Check if it already triggered in this session or previously
    const alreadyShown = localStorage.getItem('svi_exit_intent_shown');
    if (alreadyShown) {
      setHasTriggered(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger if mouse leaves from the top of the window
      if (e.clientY <= 0 && !hasTriggered) {
        setIsVisible(true);
        setHasTriggered(true);
        localStorage.setItem('svi_exit_intent_shown', 'true');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    // For mobile, trigger after 30 seconds if not already triggered
    const mobileTimeout = setTimeout(() => {
      if (!hasTriggered && window.innerWidth < 768) {
        setIsVisible(true);
        setHasTriggered(true);
        localStorage.setItem('svi_exit_intent_shown', 'true');
      }
    }, 30000);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(mobileTimeout);
    };
  }, [hasTriggered]);

  const closeModal = useCallback(() => {
    setIsVisible(false);
    // Reset state on close
    setName('');
    setPhone('');
    setIsSuccess(false);
    setErrorMsg('');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const cleanPhone = normalizeIndianPhone(phone);
    if (!cleanPhone) {
      setErrorMsg(
        t('invalidPhone') || 'Please enter a valid 10-digit phone number starting with 6-9'
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/chat/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone: cleanPhone, source: 'exit_intent' }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to submit');
      }

      setIsSuccess(true);
      setTimeout(() => {
        closeModal();
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="bg-brand-navy/80 absolute inset-0 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Left side - Image */}
              <div className="bg-brand-navy relative hidden w-full md:block md:w-5/12 lg:w-1/2">
                <div className="absolute inset-0 opacity-20">
                  <div className="h-full w-full bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:20px_20px]" />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white">
                  <Home className="text-brand-gold mb-4 h-12 w-12" />
                  <h3 className="mb-2 font-serif text-3xl font-bold">
                    Wait! Don't leave empty handed.
                  </h3>
                  <p className="text-sm text-gray-300">
                    Get exclusive access to pre-launch offers and priority site visits for our
                    upcoming premium projects.
                  </p>
                </div>
              </div>

              {/* Right side - Content */}
              <div className="w-full p-8 md:w-7/12 md:p-12 lg:w-1/2">
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="bg-brand-gold/10 text-brand-gold mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                      <svg
                        className="h-8 w-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-2 font-serif text-2xl font-bold text-gray-900 dark:text-white">
                      Thank You!
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your VIP request has been submitted. Our property experts will contact you
                      shortly.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <div className="mb-8">
                      <span className="bg-brand-gold/10 text-brand-gold mb-2 inline-block rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
                        Limited Time Offer
                      </span>
                      <h2 className="mb-3 font-serif text-2xl text-gray-900 md:text-3xl dark:text-white">
                        Unlock VIP Access
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Drop your details below and our property experts will send you our exclusive
                        catalog.
                      </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                      {errorMsg && (
                        <div className="text-xs font-medium text-red-500">{errorMsg}</div>
                      )}
                      <div>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={isSubmitting}
                          placeholder="Your Name"
                          className="focus:border-brand-gold focus:ring-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all outline-none focus:ring-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={isSubmitting}
                          placeholder="Phone Number"
                          className="focus:border-brand-gold focus:ring-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all outline-none focus:ring-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group bg-brand-gold text-brand-navy hover:bg-brand-gold/90 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold tracking-widest uppercase transition-all disabled:bg-gray-300 disabled:text-gray-500"
                      >
                        {isSubmitting ? 'Submitting...' : 'Get Exclusive Access'}
                        {!isSubmitting && (
                          <ArrowRight
                            size={16}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        )}
                      </button>
                    </form>
                  </>
                )}

                <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
                  By submitting, you agree to our terms and conditions. We respect your privacy.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
