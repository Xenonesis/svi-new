'use client';

import { track } from '@vercel/analytics';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, MessageCircle, Calendar, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PHONE_HREF, WHATSAPP_URL } from '@/src/lib/constants';

export function FloatingContact() {
  const t = useTranslations('floatingContact');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }, []);

  if (!isMounted) return null;

  const handleCallClick = () => track('call_click');
  const handleWhatsAppClick = () => track('whatsapp_click');
  const handleBookVisitOpen = () => {
    track('book_visit_open');
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Mobile Sticky Bar */}
      <div className="fixed right-0 bottom-0 left-0 z-50 flex h-16 w-full items-center justify-between border-t border-gray-200 bg-white/90 px-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] backdrop-blur-md md:hidden dark:border-gray-800 dark:bg-gray-900/90">
        <a
          href={PHONE_HREF}
          onClick={handleCallClick}
          className="hover:text-brand-gold flex flex-1 flex-col items-center justify-center gap-1 text-gray-600 transition-colors dark:text-gray-400"
        >
          <Phone size={20} />
          <span className="text-[10px] font-medium tracking-wider uppercase">{t('call')}</span>
        </a>
        <div className="h-8 w-px bg-gray-300 dark:bg-gray-700" />
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          onClick={handleWhatsAppClick}
          className="flex flex-1 flex-col items-center justify-center gap-1 text-[#25D366] transition-colors hover:text-green-500"
        >
          <MessageCircle size={20} />
          <span className="text-[10px] font-medium tracking-wider uppercase">{t('whatsapp')}</span>
        </a>
        <div className="h-8 w-px bg-gray-300 dark:bg-gray-700" />
        <button
          onClick={handleBookVisitOpen}
          className="text-brand-navy hover:text-brand-gold flex flex-1 flex-col items-center justify-center gap-1 transition-colors dark:text-gray-100"
        >
          <Calendar size={20} />
          <span className="text-[10px] font-medium tracking-wider uppercase">{t('bookVisit')}</span>
        </button>
      </div>

      <div className="fixed right-8 bottom-8 z-50 hidden flex-col items-end gap-4 md:flex">
        <div className="group relative">
          <a
            href={PHONE_HREF}
            onClick={handleCallClick}
            className="hover:text-brand-gold relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-700 shadow-xl transition-transform hover:scale-110 dark:bg-gray-800 dark:text-gray-200"
            aria-label={t('callTitle')}
          >
            <Phone size={20} />
          </a>
          <div className="pointer-events-none absolute top-1/2 right-full mr-3 -translate-y-1/2 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 dark:bg-white dark:text-gray-900">
            {t('callTitle')}
            <div className="absolute top-1/2 right-[-4px] -translate-y-1/2 border-y-4 border-l-4 border-transparent border-l-gray-900 dark:border-l-white"></div>
          </div>
        </div>

        <div className="group relative">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            onClick={handleWhatsAppClick}
            className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-110"
            aria-label={t('whatsappTitle')}
          >
            <MessageCircle size={22} />
          </a>
          <div className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-75"></div>
          <div className="pointer-events-none absolute top-1/2 right-full mr-3 -translate-y-1/2 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 dark:bg-white dark:text-gray-900">
            {t('whatsappTitle')}
            <div className="absolute top-1/2 right-[-4px] -translate-y-1/2 border-y-4 border-l-4 border-transparent border-l-gray-900 dark:border-l-white"></div>
          </div>
        </div>
        <button
          onClick={handleBookVisitOpen}
          className="bg-brand-gold text-brand-navy flex items-center gap-2 rounded-full px-5 py-3 font-semibold tracking-wider shadow-xl transition-transform hover:scale-105"
        >
          <Calendar size={18} />
          <span className="text-xs uppercase">{t('bookVisit')}</span>
        </button>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-900"
            >
              <div className="bg-brand-navy relative p-6 text-white">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="hover:text-brand-gold absolute top-4 right-4 text-white/70 transition-colors"
                >
                  <X size={24} />
                </button>
                <h3 className="text-brand-gold mb-2 font-serif text-2xl">{t('bookSiteVisit')}</h3>
                <p className="text-sm text-white/80">{t('bookSiteVisitDesc')}</p>
              </div>

              <form
                className="space-y-4 p-6"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (isSubmitting) return;

                  const form = e.target as HTMLFormElement;
                  const fd = new FormData(form);

                  setIsSubmitting(true);
                  track('book_visit_submit');

                  try {
                    const res = await fetch('/api/site-visit', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name: fd.get('name'),
                        phone: fd.get('phone'),
                        email: fd.get('email'),
                        project_interest: fd.get('project'),
                        preferred_date: fd.get('date'),
                      }),
                    });

                    if (!res.ok) throw new Error('Failed');

                    form.reset();
                    setIsModalOpen(false);
                    showToast('success', t('bookingSuccess'));
                  } catch {
                    showToast('error', t('bookingError'));
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
                    {t('name')}
                  </label>
                  <input
                    name="name"
                    required
                    type="text"
                    className="focus:border-brand-gold focus:ring-brand-gold w-full rounded-md border border-gray-200 bg-gray-50 p-3 text-sm transition-all outline-none focus:ring-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder={t('namePlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
                      {t('phone')}
                    </label>
                    <input
                      name="phone"
                      required
                      type="tel"
                      className="focus:border-brand-gold focus:ring-brand-gold w-full rounded-md border border-gray-200 bg-gray-50 p-3 text-sm transition-all outline-none focus:ring-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      placeholder={t('phonePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
                      {t('email')}
                    </label>
                    <input
                      name="email"
                      required
                      type="email"
                      className="focus:border-brand-gold focus:ring-brand-gold w-full rounded-md border border-gray-200 bg-gray-50 p-3 text-sm transition-all outline-none focus:ring-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      placeholder={t('emailPlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
                    {t('projectInterest')}
                  </label>
                  <select
                    name="project"
                    className="focus:border-brand-gold focus:ring-brand-gold w-full rounded-md border border-gray-200 bg-gray-50 p-3 text-sm transition-all outline-none focus:ring-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">{t('selectProject')}</option>
                    <option value="Shyam Aangan">Shyam Aangan</option>
                    <option value="Shivani Vatika">Shivani Vatika</option>
                    <option value="Shree Shyam Residency">Shree Shyam Residency</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
                    {t('preferredDate')}
                  </label>
                  <input
                    name="date"
                    required
                    type="date"
                    className="focus:border-brand-gold focus:ring-brand-gold w-full rounded-md border border-gray-200 bg-gray-50 p-3 text-sm transition-all outline-none focus:ring-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light mt-2 w-full rounded-md py-4 font-bold tracking-wider uppercase transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? '...' : t('confirmBooking')}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed right-4 bottom-4 z-[200] flex items-center gap-3 rounded-xl border px-5 py-3.5 text-sm font-semibold shadow-2xl md:right-8 md:bottom-8 ${
              toast.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-950/95 dark:text-emerald-300'
                : 'border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-950/95 dark:text-red-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            )}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
