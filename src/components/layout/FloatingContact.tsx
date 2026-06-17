'use client';

import { track } from '@vercel/analytics';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, MessageCircle, Calendar, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PHONE_HREF, WHATSAPP_URL } from '@/src/lib/constants';

export function FloatingContact() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
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
          <span className="text-[10px] font-medium tracking-wider uppercase">Call</span>
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
          <span className="text-[10px] font-medium tracking-wider uppercase">WhatsApp</span>
        </a>
        <div className="h-8 w-px bg-gray-300 dark:bg-gray-700" />
        <button
          onClick={handleBookVisitOpen}
          className="text-brand-navy hover:text-brand-gold flex flex-1 flex-col items-center justify-center gap-1 transition-colors dark:text-gray-100"
        >
          <Calendar size={20} />
          <span className="text-[10px] font-medium tracking-wider uppercase">Book Visit</span>
        </button>
      </div>

      {/* Desktop FAB */}
      <div className="fixed right-8 bottom-8 z-50 hidden flex-col items-end gap-3 md:flex">
        <a
          href={PHONE_HREF}
          onClick={handleCallClick}
          className="hover:text-brand-gold flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-700 shadow-xl transition-transform hover:scale-110 dark:bg-gray-800 dark:text-gray-200"
          title="Call Us"
        >
          <Phone size={20} />
        </a>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          onClick={handleWhatsAppClick}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-110"
          title="WhatsApp Us"
        >
          <MessageCircle size={22} />
        </a>
        <button
          onClick={handleBookVisitOpen}
          className="bg-brand-gold text-brand-navy flex items-center gap-2 rounded-full px-5 py-3 font-semibold tracking-wider shadow-xl transition-transform hover:scale-105"
        >
          <Calendar size={18} />
          <span className="text-xs uppercase">Book Visit</span>
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
                <h3 className="text-brand-gold mb-2 font-serif text-2xl">Book a Site Visit</h3>
                <p className="text-sm text-white/80">
                  Experience luxury living firsthand. Schedule your visit today.
                </p>
              </div>

              <form
                className="space-y-4 p-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  track('book_visit_submit');
                  alert(
                    'Booking requested! In a real app, this would hit the Supabase leads table with lead_score.'
                  );
                  setIsModalOpen(false);
                }}
              >
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
                    Name
                  </label>
                  <input
                    required
                    type="text"
                    className="focus:border-brand-gold focus:ring-brand-gold w-full rounded-md border border-gray-200 bg-gray-50 p-3 text-sm transition-all outline-none focus:ring-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
                      Phone
                    </label>
                    <input
                      required
                      type="tel"
                      className="focus:border-brand-gold focus:ring-brand-gold w-full rounded-md border border-gray-200 bg-gray-50 p-3 text-sm transition-all outline-none focus:ring-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      placeholder="+91 00000 00000"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
                      Email
                    </label>
                    <input
                      required
                      type="email"
                      className="focus:border-brand-gold focus:ring-brand-gold w-full rounded-md border border-gray-200 bg-gray-50 p-3 text-sm transition-all outline-none focus:ring-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
                    Project Interest
                  </label>
                  <select className="focus:border-brand-gold focus:ring-brand-gold w-full rounded-md border border-gray-200 bg-gray-50 p-3 text-sm transition-all outline-none focus:ring-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                    <option value="">Select a project</option>
                    <option value="Shyam Aangan">Shyam Aangan</option>
                    <option value="Shivani Vatika">Shivani Vatika</option>
                    <option value="Shree Shyam Residency">Shree Shyam Residency</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
                    Preferred Visit Date
                  </label>
                  <input
                    required
                    type="date"
                    className="focus:border-brand-gold focus:ring-brand-gold w-full rounded-md border border-gray-200 bg-gray-50 p-3 text-sm transition-all outline-none focus:ring-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light mt-2 w-full rounded-md py-4 font-bold tracking-wider uppercase transition-colors"
                >
                  Confirm Booking
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
