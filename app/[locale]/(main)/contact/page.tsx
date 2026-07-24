import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, PhoneIcon, Mail, Clock, ArrowUpRight } from 'lucide-react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { SITE_URL } from '@/src/lib/seo';
import ContactMapWrapper from '@/src/components/contact/ContactMapWrapper';

const ContactFAQ = dynamic(() => import('@/src/components/faq/ContactFAQ'), {
  loading: () => (
    <div className="py-16 text-center">
      <div className="mx-auto h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  ),
});

const ContactForm = dynamic(() => import('@/src/components/contact/ContactForm'), {
  loading: () => (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto mb-6 h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-4">
        <div className="h-12 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="h-12 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="h-24 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="h-12 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  ),
});

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'SVI Infra Solutions Pvt. Ltd.',
  image: `${SITE_URL}/logo.png`,
  url: `${SITE_URL}/contact`,
  telephone: '+91-73000-07643',
  email: 'info@sviinfrasolutions.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'A-61 Sector 65',
    addressLocality: 'Noida',
    addressRegion: 'Uttar Pradesh',
    postalCode: '201309',
    addressCountry: 'IN',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 28.6112, longitude: 77.382 },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '19:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '09:00',
      closes: '17:00',
    },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday', opens: '10:00', closes: '16:00' },
  ],
  areaServed: [
    { '@type': 'City', name: 'Jaipur' },
    { '@type': 'City', name: 'Noida' },
    { '@type': 'City', name: 'Phulera' },
  ],
  priceRange: '$$$',
};

function isOfficeOpen(): boolean {
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

export default async function Contact(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.contact' });
  const open = isOfficeOpen();

  const contactDetails = [
    {
      icon: MapPin,
      label: t('ourOffice'),
      content: (
        <p className="text-[13px] leading-relaxed text-white/70">
          A-61 Sector 65,
          <br />
          Noida, Uttar Pradesh 201309
        </p>
      ),
    },
    {
      icon: PhoneIcon,
      label: t('formPhone'),
      content: (
        <>
          <a
            href="tel:+917300007643"
            className="block text-[13px] font-semibold text-white/80 transition-colors duration-200 hover:text-[#d4af37]"
          >
            +91 73000 07643
          </a>
          <span className="mt-1 inline-block text-[9px] font-bold tracking-[0.18em] text-[#d4af37] uppercase">
            {t('mainOfficeSales')}
          </span>
        </>
      ),
    },
    {
      icon: Mail,
      label: t('emails'),
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
      label: t('businessHours'),
      content: (
        <div className="space-y-1.5">
          {[
            { label: 'Mon – Fri', value: t('monFriHours') },
            { label: 'Saturday', value: t('satHours') },
            { label: 'Sunday', value: t('sunHours') },
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
    <div className="bg-[#FDFBF7] dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />

      {/* ── Hero ─────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-gray-200/70 bg-[#FDFBF7] pt-28 pb-20 dark:border-gray-800 dark:bg-gray-900">
        {/* Ambient gold orb */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[680px] -translate-x-1/2 rounded-full opacity-[0.06] blur-3xl"
          style={{ background: 'radial-gradient(ellipse, #d4af37 0%, transparent 70%)' }}
        />

        <div className="relative container mx-auto px-4 text-center">
          {/* Eyebrow pill */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/8 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#b8941e] uppercase">
              Get In Touch
            </span>
          </div>

          <h1 className="text-brand-navy animate-hero-h1 mb-5 font-serif text-4xl leading-tight sm:text-5xl md:text-[4rem] dark:text-gray-50">
            {t('title')}
          </h1>

          <p className="mx-auto max-w-lg text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            Our team of real estate specialists is ready to guide you through every step of your
            property journey.
          </p>

          {/* Decorative gold rule */}
          <div className="animate-hero-divider mx-auto mt-8 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#d4af37]/60" />
            <div className="h-1 w-1 rounded-full bg-[#d4af37]" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#d4af37]/60" />
          </div>
        </div>
      </section>

      {/* ── Main content ─────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:gap-10">
            {/* ── Sidebar ── */}
            <aside className="lg:w-[320px] lg:flex-shrink-0">
              {/* Double-bezel card: outer shell + inner core */}
              <div className="sticky top-24 overflow-hidden rounded-2xl bg-white p-1 shadow-[0_4px_32px_rgba(0,0,0,0.06)] ring-1 ring-black/5 dark:bg-gray-800/80 dark:ring-white/[0.08]">
                <div className="rounded-[14px] bg-[#1a2744] p-7">
                  {/* Eyebrow + heading */}
                  <p className="mb-1 text-[9px] font-bold tracking-[0.25em] text-[#d4af37] uppercase">
                    {t('reachOut')}
                  </p>
                  <h2 className="mb-8 font-serif text-2xl leading-snug text-white">
                    {t('heading')}
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
                      className={`flex items-center gap-1.5 text-[10px] font-bold tracking-wide ${open ? 'text-emerald-400' : 'text-red-400'}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${open ? 'bg-emerald-400' : 'bg-red-400'}`}
                      />
                      {open ? 'Open Now' : 'Closed'}
                    </span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  {/* Directions CTA */}
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=28.6112,77.382"
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
                </div>
              </div>
            </aside>

            {/* ── Right: Form + Map ── */}
            <div className="flex flex-1 flex-col gap-6 md:gap-8">
              <ContactForm />
              <Suspense
                fallback={
                  <div className="flex h-[400px] w-full animate-pulse items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                    <span className="text-xs text-gray-400">Loading map…</span>
                  </div>
                }
              >
                <ContactMapWrapper />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      <ContactFAQ />
    </div>
  );
}
