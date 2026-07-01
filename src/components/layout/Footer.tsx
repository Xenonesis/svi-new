'use client';

import { AnimatePresence, motion } from 'motion/react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { FacebookIcon, InstagramIcon } from '@/src/components/common/social-icons';
import { memo, useCallback, useState } from 'react';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const CURRENT_YEAR = new Date().getFullYear();

const Footer = memo(function Footer() {
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setSubscribed(true);
        setEmail('');
        setTimeout(() => setSubscribed(false), 3000);
      }
    },
    [email]
  );

  return (
    <footer className="border-t border-gray-200 bg-white pt-16 pb-8 dark:border-gray-800 dark:bg-gray-900">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="mb-6 inline-block">
              <Image
                src="/logo.png"
                alt="SVI Infra Solutions Pvt. Ltd."
                width={282}
                height={83}
                quality={100}
                className="h-10 w-auto dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
              />
            </Link>
            <p className="mb-6 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {t('common.tagline')} {t('common.description')}
            </p>
            <div className="flex gap-4">
              {[
                {
                  icon: <FacebookIcon size={18} />,
                  label: 'Facebook',
                  href: 'https://www.facebook.com/profile.php?id=61590993533426',
                },
                {
                  icon: <InstagramIcon size={18} />,
                  label: 'Instagram',
                  href: 'https://www.instagram.com/sviinfrasolution/?hl=en',
                },
              ].map(({ icon, label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={t('nav.followUs', { social: label })}
                  whileHover={{ scale: 1.1, borderColor: '#d4af37', color: '#d4af37' }}
                  whileTap={{ scale: 0.95 }}
                  className="text-brand-navy flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition-colors dark:border-gray-700 dark:text-gray-200"
                >
                  {icon}
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-brand-gold dark:text-brand-gold mb-5 text-[10px] font-semibold tracking-[0.2em] uppercase">
              {t('footer.quickLinks')}
            </h4>
            <ul className="flex flex-col gap-4">
              <li>
                <Link
                  href="/"
                  className="text-brand-navy hover:text-brand-gold dark:hover:text-brand-gold text-[11px] font-semibold tracking-wider uppercase transition-colors dark:text-gray-200"
                >
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-brand-navy hover:text-brand-gold dark:hover:text-brand-gold text-[11px] font-semibold tracking-wider uppercase transition-colors dark:text-gray-200"
                >
                  {t('nav.aboutUs')}
                </Link>
              </li>
              <li>
                <Link
                  href="/leadership"
                  className="text-brand-navy hover:text-brand-gold dark:hover:text-brand-gold text-[11px] font-semibold tracking-wider uppercase transition-colors dark:text-gray-200"
                >
                  {t('nav.leadership')}
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-brand-navy hover:text-brand-gold dark:hover:text-brand-gold text-[11px] font-semibold tracking-wider uppercase transition-colors dark:text-gray-200"
                >
                  {t('nav.faq')}
                </Link>
              </li>
              <li>
                <Link
                  href="/projects/completed"
                  className="text-brand-navy hover:text-brand-gold dark:hover:text-brand-gold text-[11px] font-semibold tracking-wider uppercase transition-colors dark:text-gray-200"
                >
                  {t('nav.completedProjects')}
                </Link>
              </li>
              <li>
                <Link
                  href="/registration"
                  className="text-brand-navy hover:text-brand-gold dark:hover:text-brand-gold text-[11px] font-semibold tracking-wider uppercase transition-colors dark:text-gray-200"
                >
                  {t('footer.register')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-brand-navy hover:text-brand-gold dark:hover:text-brand-gold text-[11px] font-semibold tracking-wider uppercase transition-colors dark:text-gray-200"
                >
                  {t('nav.contactUs')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-brand-gold dark:text-brand-gold mb-5 text-[10px] font-semibold tracking-[0.2em] uppercase">
              {t('footer.servicesSupport')}
            </h4>
            <ul className="flex flex-col gap-4">
              <li>
                <Link
                  href="/payment"
                  className="text-brand-navy hover:text-brand-gold dark:hover:text-brand-gold text-[11px] font-semibold tracking-wider uppercase transition-colors dark:text-gray-200"
                >
                  {t('footer.payOnline')}
                </Link>
              </li>
              <li>
                <Link
                  href="/grievance"
                  className="text-brand-navy hover:text-brand-gold dark:hover:text-brand-gold text-[11px] font-semibold tracking-wider uppercase transition-colors dark:text-gray-200"
                >
                  {t('footer.raiseGrievance')}
                </Link>
              </li>
              <li className="text-brand-gold dark:text-brand-gold text-[11px] font-semibold tracking-wider uppercase">
                {t('footer.residentialProperties')}
              </li>
              <li className="text-brand-gold dark:text-brand-gold text-[11px] font-semibold tracking-wider uppercase">
                {t('footer.commercialProperties')}
              </li>
              <li className="text-brand-gold dark:text-brand-gold text-[11px] font-semibold tracking-wider uppercase">
                {t('footer.propertyManagement')}
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-brand-gold dark:text-brand-gold mb-5 text-[10px] font-semibold tracking-[0.2em] uppercase">
              {t('footer.contactInfo')}
            </h4>
            <ul className="flex flex-col gap-5">
              <li className="flex items-start gap-3">
                <MapPin className="text-brand-gold mt-1 shrink-0" size={18} />
                <a
                  href="https://maps.google.com/?q=A-61+Sector+65+Noida+Uttar+Pradesh+201309"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start transition-colors hover:opacity-80"
                  suppressHydrationWarning
                >
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    A-61 Sector 65, Noida,
                    <br />
                    Uttar Pradesh 201309
                  </span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-brand-gold shrink-0" size={18} />
                <a
                  href="tel:+917300007643"
                  className="hover:text-brand-gold dark:hover:text-brand-gold text-sm font-medium text-gray-600 transition-colors dark:text-gray-400"
                  suppressHydrationWarning
                >
                  +91 73000 07643
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-brand-gold shrink-0" size={18} />
                <a
                  href="mailto:info@sviinfrasolutions.com"
                  className="hover:text-brand-gold dark:hover:text-brand-gold text-sm font-medium text-gray-600 transition-colors dark:text-gray-400"
                >
                  info@sviinfrasolutions.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mb-8 border-t border-gray-200 py-8 dark:border-gray-800">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <h4 className="text-brand-navy mb-1 text-sm font-semibold tracking-wider uppercase dark:text-gray-100">
                {t('footer.stayUpdated')}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('footer.newsletterDesc')}
              </p>
            </div>
            <form
              onSubmit={handleNewsletterSubmit}
              className="relative flex w-full flex-col gap-3 sm:flex-row md:w-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.enterEmail')}
                className="text-brand-navy focus:border-brand-gold w-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-colors focus:outline-none sm:flex-1 md:w-64 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                required
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-brand-gold text-brand-navy hover:bg-brand-navy hover:text-brand-gold border-brand-gold relative flex w-full items-center justify-center gap-2 overflow-hidden border px-6 py-3 text-xs font-bold tracking-widest uppercase transition-colors sm:w-auto"
              >
                <AnimatePresence mode="wait">
                  {subscribed ? (
                    <motion.span
                      key="ok"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {t('footer.done')}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="sub"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <Send size={14} /> {t('footer.subscribe')}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </form>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-[10px] font-semibold tracking-wider text-gray-500 uppercase md:text-left dark:text-gray-400">
            &copy; {CURRENT_YEAR} SVI Infra Solutions.
          </p>
          <div className="flex gap-6 text-[10px] font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
            <Link href="/privacy-policy" className="hover:text-brand-gold transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link href="/terms-conditions" className="hover:text-brand-gold transition-colors">
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
