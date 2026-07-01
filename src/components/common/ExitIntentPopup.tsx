'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, Home } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
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
  }, []);

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

                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    closeModal(); /* Handle submit */
                  }}
                >
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      className="focus:border-brand-gold focus:ring-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all outline-none focus:ring-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number"
                      className="focus:border-brand-gold focus:ring-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all outline-none focus:ring-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="group bg-brand-gold text-brand-navy hover:bg-brand-gold/90 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold tracking-widest uppercase transition-all"
                  >
                    Get Exclusive Access
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>
                </form>

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
