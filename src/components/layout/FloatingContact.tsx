'use client';

import { toast } from 'sonner';
import { track } from '@vercel/analytics';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  MessageCircle,
  Calendar,
  X,
  CheckCircle2,
  ChevronDown,
  Check,
  Sparkles,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PHONE_HREF, WHATSAPP_URL } from '@/src/lib/constants';

interface ProjectOption {
  id: string;
  name: string;
  slug: string;
}

const FALLBACK_PROJECTS: ProjectOption[] = [
  { id: '1', name: 'Shivani Vatika 11th', slug: 'shivani-vatika-11th' },
  { id: '2', name: 'Shivani Vatika', slug: 'shivani-vatika' },
  { id: '3', name: 'Shyam Aangan', slug: 'shyam-aangan' },
  { id: '4', name: 'Phulera SmartCity', slug: 'phulera-smartcity' },
];

export function FloatingContact() {
  const t = useTranslations('floatingContact');
  const pathname = usePathname();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Dynamic projects
  const [projects, setProjects] = useState<ProjectOption[]>(FALLBACK_PROJECTS);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tomorrow date string as default & min date as today
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  useEffect(() => {
    setIsMounted(true);
    setPreferredDate(tomorrowStr);

    // Fetch active projects dynamically
    fetch('/api/properties')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.properties) && data.properties.length > 0) {
          const mapped: ProjectOption[] = data.properties.map(
            (p: { id: string; name: string; slug: string }) => ({
              id: p.id,
              name: p.name,
              slug: p.slug || p.name.toLowerCase().replace(/\s+/g, '-'),
            })
          );
          setProjects(mapped);
        }
      })
      .catch(() => {
        // Fallback to FALLBACK_PROJECTS
      });
  }, [tomorrowStr]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Pre-select project if user is currently viewing a project page
  useEffect(() => {
    if (pathname && projects.length > 0) {
      const match = projects.find((p) => pathname.includes(p.slug));
      if (match) {
        setSelectedProject(match.name);
      } else if (!selectedProject && projects.length > 0) {
        setSelectedProject(projects[0].name);
      }
    }
  }, [pathname, projects, selectedProject]);

  if (!isMounted) return null;

  const handleCallClick = () => track('call_click');
  const handleWhatsAppClick = () => track('whatsapp_click');

  const handleBookVisitOpen = () => {
    track('book_visit_open');
    setIsSuccess(false);
    setPhoneError('');
    setIsModalOpen(true);
  };

  const handleResetAndClose = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setIsSuccess(false);
      setName('');
      setPhone('');
      setEmail('');
      setPhoneError('');
      setPreferredDate(tomorrowStr);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPhoneError('');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSubmitting(true);
    track('book_visit_submit');

    try {
      const res = await fetch('/api/site-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: cleanPhone,
          email: email.trim() || null,
          project_interest: selectedProject || null,
          preferred_date: preferredDate || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || data?.message || 'Failed');
      }

      setIsSuccess(true);
      toast.success(t('bookingSuccess'));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('bookingError');
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-filled WhatsApp message for instant confirmation
  const whatsappConfirmUrl = (() => {
    const projName = selectedProject || 'SVI Township';
    const dateFormatted = preferredDate
      ? new Date(preferredDate).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : 'Upcoming Date';
    const msg = `Hi SVI Infra team, I have scheduled a site visit for *${projName}* on *${dateFormatted}*. Please confirm my complimentary cab pickup.`;
    return `${WHATSAPP_URL}?text=${encodeURIComponent(msg)}`;
  })();

  return (
    <>
      {/* Mobile Sticky Bar */}
      <div className="fixed right-0 bottom-0 left-0 z-50 flex h-[calc(4rem+env(safe-area-inset-bottom,0px))] w-full items-center justify-around border-t border-gray-200/80 bg-white/95 px-3 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom,0px))] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur-xl md:hidden dark:border-white/10 dark:bg-[#0b0f19]/95">
        <a
          href={PHONE_HREF}
          onClick={handleCallClick}
          className="hover:text-brand-gold flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-gray-700 transition-colors active:bg-gray-100 dark:text-gray-300 dark:active:bg-white/5"
        >
          <Phone size={19} />
          <span className="text-[10px] font-semibold tracking-wider uppercase">{t('call')}</span>
        </a>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsAppClick}
          className="group flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-gray-700 transition-colors hover:text-emerald-600 active:bg-green-50 dark:text-gray-300 dark:hover:text-emerald-400 dark:active:bg-green-950/20"
        >
          <MessageCircle
            size={19}
            className="text-[#25D366] transition-transform group-hover:scale-110"
          />
          <span className="text-[10px] font-semibold tracking-wider text-[#25D366] uppercase">
            {t('whatsapp')}
          </span>
        </a>
        <button
          onClick={handleBookVisitOpen}
          className="text-brand-navy hover:text-brand-gold active:bg-brand-gold/10 flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5 font-semibold transition-colors dark:text-gray-100"
        >
          <Calendar size={19} />
          <span className="text-[10px] font-semibold tracking-wider uppercase">
            {t('bookVisit')}
          </span>
        </button>
      </div>

      {/* Desktop Floating Badges */}
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
            rel="noopener noreferrer"
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
          className="bg-brand-gold text-brand-navy shadow-brand-gold/20 flex items-center gap-2 rounded-full px-5 py-3 font-semibold tracking-wider shadow-xl transition-transform hover:scale-105"
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleResetAndClose();
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative max-h-[92dvh] w-full max-w-md overflow-hidden overflow-y-auto rounded-2xl border border-white/10 bg-[#080b11] text-white shadow-2xl shadow-black/80"
            >
              {/* Top Luxury Banner */}
              <div className="relative border-b border-white/10 bg-gradient-to-b from-[#0f172a] to-[#080b11] p-6">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="absolute top-4 right-4 rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-[10px] font-bold tracking-widest text-amber-400 uppercase">
                  <Sparkles size={11} />
                  <span>Complimentary Site Visit</span>
                </div>
                <h3 className="mt-2 font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {t('bookSiteVisit')}
                </h3>
                <p className="mt-1 text-xs text-white/70 sm:text-sm">{t('bookSiteVisitDesc')}</p>
              </div>

              {/* Body Content: Form or Success State */}
              <div className="p-6">
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-4 text-center"
                  >
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 size={36} />
                    </div>
                    <h4 className="mt-4 font-serif text-xl font-bold text-white">
                      {t('visitSuccessTitle')}
                    </h4>
                    <p className="mt-2 text-xs leading-relaxed text-gray-300">
                      {t('visitSuccessDesc')}
                    </p>

                    {/* Booking Details Pill */}
                    <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-amber-300">
                      <span className="font-semibold">{selectedProject || 'SVI Township'}</span>
                      <span className="text-white/40">·</span>
                      <span>
                        {preferredDate
                          ? new Date(preferredDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Tomorrow'}
                      </span>
                    </div>

                    {/* Instant WhatsApp Confirmation */}
                    <div className="mt-6 space-y-3">
                      <a
                        href={whatsappConfirmUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3.5 text-xs font-bold tracking-wider text-white uppercase shadow-lg shadow-[#25D366]/20 transition-all hover:brightness-110 active:scale-[0.99]"
                      >
                        <MessageCircle size={17} />
                        <span>{t('instantWhatsApp')}</span>
                      </a>

                      <button
                        type="button"
                        onClick={handleResetAndClose}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        {t('done')}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Full Name */}
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold tracking-wider text-gray-300 uppercase">
                        {t('name')} <span className="text-amber-400">*</span>
                      </label>
                      <input
                        name="name"
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-gray-500 transition-all outline-none focus:border-amber-400 focus:bg-white/[0.07] focus:ring-1 focus:ring-amber-400"
                        placeholder={t('namePlaceholder')}
                      />
                    </div>

                    {/* Phone Number with +91 Prefix */}
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold tracking-wider text-gray-300 uppercase">
                        {t('phone')} <span className="text-amber-400">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-xs font-bold text-amber-400 select-none">
                          +91
                        </span>
                        <input
                          name="phone"
                          required
                          type="tel"
                          maxLength={10}
                          value={phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setPhone(val);
                            if (phoneError && val.length === 10) setPhoneError('');
                          }}
                          className={`w-full rounded-xl border bg-white/5 py-2.5 pr-3.5 pl-12 text-sm text-white placeholder-gray-500 transition-all outline-none focus:bg-white/[0.07] ${
                            phoneError
                              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                              : 'border-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'
                          }`}
                          placeholder="98290 12345"
                        />
                      </div>
                      {phoneError && <p className="mt-1 text-xs text-red-400">{phoneError}</p>}
                    </div>

                    {/* Email (Optional) */}
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold tracking-wider text-gray-300 uppercase">
                        {t('email')}
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-gray-500 transition-all outline-none focus:border-amber-400 focus:bg-white/[0.07] focus:ring-1 focus:ring-amber-400"
                        placeholder={t('emailPlaceholder')}
                      />
                    </div>

                    {/* Project Interest — Luxury Dropdown */}
                    <div ref={dropdownRef} className="relative">
                      <label className="mb-1.5 block text-[11px] font-semibold tracking-wider text-gray-300 uppercase">
                        {t('projectInterest')}
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-left text-sm text-white transition-all hover:border-amber-500/40 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none"
                      >
                        <span className={selectedProject ? 'text-white' : 'text-gray-400'}>
                          {selectedProject || t('selectProject')}
                        </span>
                        <ChevronDown
                          size={16}
                          className={`text-amber-400 transition-transform duration-200 ${
                            isDropdownOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-20 mt-1 max-h-52 w-full overflow-hidden overflow-y-auto rounded-xl border border-amber-500/30 bg-[#0d121f] p-1.5 shadow-2xl shadow-black/90 backdrop-blur-xl"
                          >
                            {projects.map((proj) => {
                              const isSelected = selectedProject === proj.name;
                              return (
                                <button
                                  key={proj.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedProject(proj.name);
                                    setIsDropdownOpen(false);
                                  }}
                                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                                    isSelected
                                      ? 'bg-amber-500/20 text-amber-300'
                                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                  }`}
                                >
                                  <span>{proj.name}</span>
                                  {isSelected && <Check size={14} className="text-amber-400" />}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Preferred Date */}
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold tracking-wider text-gray-300 uppercase">
                        {t('preferredDate')}
                      </label>
                      <input
                        name="date"
                        required
                        type="date"
                        min={todayStr}
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white [color-scheme:dark] transition-all outline-none focus:border-amber-400 focus:bg-white/[0.07] focus:ring-1 focus:ring-amber-400"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-xs font-bold tracking-widest text-slate-950 uppercase shadow-lg shadow-amber-500/20 transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                          <span>Scheduling...</span>
                        </div>
                      ) : (
                        <span>{t('confirmBooking')}</span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
