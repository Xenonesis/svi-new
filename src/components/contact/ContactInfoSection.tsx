'use client';

import {
  MapPin,
  PhoneIcon,
  Mail,
  Clock,
  ArrowUpRight,
  Headphones,
  Briefcase,
  MessageCircle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export function isOfficeOpen(): boolean {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 5.5 * 3600000);
  const day = ist.getDay(); // 0=Sun … 6=Sat
  const h = ist.getHours() + ist.getMinutes() / 60;
  if (day >= 1 && day <= 5) return h >= 9 && h < 19;
  if (day === 6) return h >= 9 && h < 17;
  if (day === 0) return h >= 10 && h < 16;
  return false;
}

export function ContactInfoSection(): React.JSX.Element {
  const t = useTranslations('pages.contact');
  const open = isOfficeOpen();

  const addressTitle =
    t('info.address.title') !== 'info.address.title' && !t('info.address.title').includes('.')
      ? t('info.address.title')
      : t('ourOffice') || 'Corporate Office';

  const phoneTitle =
    t('info.phone.title') !== 'info.phone.title' && !t('info.phone.title').includes('.')
      ? t('info.phone.title')
      : 'Call Us';

  const emailTitle =
    t('info.email.title') !== 'info.email.title' && !t('info.email.title').includes('.')
      ? t('info.email.title')
      : t('emails') || 'Email Us';

  const hoursTitle =
    t('info.hours.title') !== 'info.hours.title' && !t('info.hours.title').includes('.')
      ? t('info.hours.title')
      : t('businessHours') || 'Working Hours';

  const contactDetails = [
    {
      icon: MapPin,
      label: addressTitle,
      content: (
        <a
          href="https://maps.app.goo.gl/9GKzv3BuNVRKxUsb7"
          target="_blank"
          rel="noopener noreferrer"
          className="group block rounded-xl bg-white/[0.04] px-3 py-2.5 ring-1 ring-white/5 transition-all duration-300 hover:bg-white/[0.07] hover:ring-[#d4af37]/20"
        >
          <p className="flex items-start gap-2 text-[13px] leading-relaxed text-white/75 transition-colors group-hover:text-white">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4af37] opacity-80 transition-all group-hover:opacity-100 group-hover:shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
            <span>
              Block E-220, 2nd Floor, Sector 63,
              <br />
              <span className="text-white/65 group-hover:text-white/80">
                Noida, Uttar Pradesh 201309
              </span>
            </span>
          </p>
          <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold tracking-widest text-[#d4af37]/80 uppercase transition-all group-hover:gap-1.5 group-hover:text-[#d4af37]">
            Open in Google Maps <ArrowUpRight size={10} strokeWidth={2.5} />
          </span>
        </a>
      ),
    },
    {
      icon: PhoneIcon,
      label: phoneTitle,
      content: (
        <>
          <a
            href="tel:+917300007643"
            className="block text-[13px] font-semibold text-white/80 transition-colors duration-200 hover:text-[#d4af37]"
          >
            +91-73000-07643
          </a>
          <span className="mt-1 inline-block text-[9px] font-bold tracking-[0.18em] text-[#d4af37] uppercase">
            {t('mainOfficeSales') !== 'mainOfficeSales'
              ? t('mainOfficeSales')
              : 'Main Office / Sales'}
          </span>
        </>
      ),
    },
    {
      icon: Mail,
      label: emailTitle,
      content: (
        <>
          <a
            href="mailto:info@sviinfrasolutions.com"
            className="group flex items-center gap-1 text-[13px] font-medium text-white/80 transition-colors duration-200 hover:text-[#d4af37]"
          >
            info@sviinfrasolutions.com
            <ArrowUpRight
              size={11}
              className="opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
            />
          </a>
          <a
            href="mailto:sales@sviinfrasolutions.com"
            className="group mt-1.5 flex items-center gap-1 text-[13px] font-medium text-white/70 transition-colors duration-200 hover:text-[#d4af37]"
          >
            sales@sviinfrasolutions.com
            <ArrowUpRight
              size={11}
              className="opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
            />
          </a>
        </>
      ),
    },
    {
      icon: Clock,
      label: hoursTitle,
      content: (
        <div className="space-y-1.5">
          {[
            {
              label: 'Mon – Fri',
              value:
                t('info.hours.weekdays') !== 'info.hours.weekdays' &&
                !t('info.hours.weekdays').includes('.')
                  ? t('info.hours.weekdays')
                  : t('monFriHours') || '9:00 AM - 7:00 PM',
            },
            {
              label: 'Saturday',
              value:
                t('info.hours.saturday') !== 'info.hours.saturday' &&
                !t('info.hours.saturday').includes('.')
                  ? t('info.hours.saturday')
                  : t('satHours') || '9:00 AM - 5:00 PM',
            },
            {
              label: 'Sunday',
              value:
                t('info.hours.sunday') !== 'info.hours.sunday' &&
                !t('info.hours.sunday').includes('.')
                  ? t('info.hours.sunday')
                  : t('sunHours') || '10:00 AM - 4:00 PM',
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <span className="text-[11px] font-medium text-white/40">{label}</span>
              <span className="text-[11px] font-semibold text-white/70">{value}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <aside className="lg:w-[320px] lg:flex-shrink-0">
      {/* Double-bezel card: outer shell + inner core */}
      <div className="sticky top-24 overflow-hidden rounded-2xl bg-white p-1 shadow-[0_4px_32px_rgba(0,0,0,0.06)] ring-1 ring-black/5 dark:bg-gray-800/80 dark:ring-white/[0.08]">
        <div className="rounded-[14px] bg-[#1a2744] p-7">
          {/* Eyebrow + heading */}
          <p className="mb-1 text-[9px] font-bold tracking-[0.25em] text-[#d4af37] uppercase">
            {t('reachOut') !== 'reachOut' ? t('reachOut') : 'Reach Out'}
          </p>
          <h2 className="mb-8 font-serif text-2xl leading-snug text-white">
            {t('heading') !== 'heading' ? t('heading') : 'Get In Touch'}
          </h2>

          {/* Contact rows */}
          <div className="space-y-7">
            {contactDetails.map(({ icon: Icon, label, content }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#d4af37]/12 ring-1 ring-[#d4af37]/20">
                  <Icon size={14} className="text-[#d4af37]" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-1.5 text-[9px] font-bold tracking-[0.18em] text-white/40 uppercase">
                    {label}
                  </p>
                  {content}
                </div>
              </div>
            ))}
          </div>

          {/* Status + divider */}
          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span
              className={`flex items-center gap-1.5 text-[10px] font-bold tracking-wide ${
                open ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${open ? 'bg-emerald-400' : 'bg-red-400'}`}
              />
              {open
                ? t('info.hours.open') !== 'info.hours.open' && !t('info.hours.open').includes('.')
                  ? t('info.hours.open')
                  : 'Open Now'
                : t('info.hours.closed') !== 'info.hours.closed' &&
                    !t('info.hours.closed').includes('.')
                  ? t('info.hours.closed')
                  : 'Closed'}
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Directions CTA */}
          <a
            href="https://maps.app.goo.gl/9GKzv3BuNVRKxUsb7"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex w-full items-center justify-between rounded-xl bg-[#d4af37]/10 px-4 py-3 ring-1 ring-[#d4af37]/20 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#d4af37]/20 hover:ring-[#d4af37]/40 active:scale-[0.98]"
          >
            <span className="text-[11px] font-bold tracking-wider text-[#d4af37] uppercase">
              Get Directions
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d4af37]/15 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-[#d4af37]/25">
              <ArrowUpRight size={11} className="text-[#d4af37]" strokeWidth={2.5} />
            </span>
          </a>

          {/* Quick connect channels */}
          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="mb-3 text-[9px] font-bold tracking-[0.2em] text-[#d4af37] uppercase">
              Quick Connect
            </p>
            <div className="grid grid-cols-1 gap-2">
              <a
                href="tel:+917300007643"
                className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2 text-xs text-white/80 ring-1 ring-white/5 transition-all hover:bg-white/[0.08] hover:text-[#d4af37]"
              >
                <span className="flex items-center gap-2">
                  <Headphones size={13} className="text-[#d4af37]" />
                  Sales Enquiry
                </span>
                <ArrowUpRight size={12} />
              </a>
              <a
                href="mailto:info@sviinfrasolutions.com?subject=Career%20Enquiry"
                className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2 text-xs text-white/80 ring-1 ring-white/5 transition-all hover:bg-white/[0.08] hover:text-[#d4af37]"
              >
                <span className="flex items-center gap-2">
                  <Briefcase size={13} className="text-[#d4af37]" />
                  Careers & HR
                </span>
                <ArrowUpRight size={12} />
              </a>
              <a
                href="https://wa.me/917300007643"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2 text-xs text-white/80 ring-1 ring-white/5 transition-all hover:bg-white/[0.08] hover:text-[#d4af37]"
              >
                <span className="flex items-center gap-2">
                  <MessageCircle size={13} className="text-[#d4af37]" />
                  WhatsApp Support
                </span>
                <ArrowUpRight size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
