import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { CheckCircle2, FileDown, ArrowRight, PhoneCall, Tag } from 'lucide-react';
import { SITE_URL, buildAlternates, localizedUrl } from '@/src/lib/seo';
import { BreadcrumbSchema, FAQSchema, PlaceAndAreaSchema } from '@/src/components/common/Schema';
import SiteVisitPill from '@/src/components/common/SiteVisitPill';

export const revalidate = 86400;

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isHindi = locale === 'hi';

  const title = isHindi
    ? 'जयपुर में 20 लाख के अंदर प्लॉट्स | आसान किश्तें व स्पष्ट रजिस्ट्री'
    : 'Plots in Jaipur Under 20 Lakhs - Affordable Residential Plots & Townships';

  const description = isHindi
    ? 'जयपुर में 20 लाख रुपये के बजट में 100% स्पष्ट रजिस्ट्री आवासीय प्लॉट्स खरीदें। खाटू श्याम जी हाईवे, हरसोली व फुलेरा कॉरिडोर में 80 से 150 गज के प्लॉट्स, आसान EMI और फ्री कैब साइट विजिट।'
    : 'Explore low-budget residential plots in Jaipur under 20 Lakhs on Khatu Shyam Ji Highway and industrial growth corridors. 80-150 sq. yds. plots with flexible monthly installment plans.';

  return {
    title,
    description,
    keywords: [
      'Plots in Jaipur under 20 lakhs',
      'Affordable plots in Jaipur',
      'Low budget residential plots in Jaipur',
      'Plots on Khatu Shyam highway under 20 lakhs',
      'Plots in Jaipur under 15 lakhs',
      'EMI plots in Jaipur',
      'SVI Infra Solutions',
    ],
    alternates: buildAlternates('/plots-in-jaipur-under-20-lakhs', locale),
    openGraph: {
      title,
      description,
      url: localizedUrl('/plots-in-jaipur-under-20-lakhs', locale),
      locale: isHindi ? 'hi_IN' : 'en_IN',
      images: [{ url: `${SITE_URL}/images/project1.png`, width: 1200, height: 630 }],
    },
  };
}

const BUDGET_FAQS = [
  {
    question: 'Can I really get a legally verified residential plot in Jaipur under 20 Lakhs?',
    answer:
      'Yes. At Shivani Vatika 11th (Harsholi on Jaipur-Khatu Shyam highway), 80 sq. yd. residential plots start around ₹ 15 Lakhs* with complete sub-registrar registry and demarcated boundary walls.',
  },
  {
    question: 'Are there interest-free monthly installment (EMI) schemes available?',
    answer:
      'Yes, SVI Infra Solutions offers tailored 12 to 24-month installment schedules with transparent paperwork and zero hidden charges.',
  },
  {
    question: 'What amenities are included in low-budget plotted townships?',
    answer:
      'Even budget plots under 20 Lakhs include 30-40 ft wide paved roads, gated grand entry arches, underground water/electricity pipelines, green community parks, and round-the-clock security.',
  },
  {
    question: 'How do I arrange a free inspection visit from Jaipur?',
    answer:
      'You can reserve a complimentary chauffeured AC cab by calling our team at +91-73000-07643 or clicking the "Book Free Site Visit Cab" button. Our driver will pick you up from your doorstep in Jaipur.',
  },
];

export default async function PlotsUnder20LakhsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isHindi = locale === 'hi';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <BreadcrumbSchema
        items={[
          { name: 'Home', item: '/' },
          { name: 'Plots in Jaipur', item: '/plots-in-jaipur' },
          {
            name: isHindi ? '20 लाख के अंदर प्लॉट्स' : 'Plots Under 20 Lakhs',
            item: '/plots-in-jaipur-under-20-lakhs',
          },
        ]}
      />

      <PlaceAndAreaSchema
        name="Affordable Residential Plots Jaipur"
        description="Low budget residential plots under 20 Lakhs in Jaipur district."
        url={localizedUrl('/plots-in-jaipur-under-20-lakhs', locale)}
        latitude={26.9124}
        longitude={75.7873}
        addressLocality="Jaipur"
        addressRegion="Rajasthan"
        postalCode="302001"
      />

      <FAQSchema questions={BUDGET_FAQS} />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-amber-500/20 pt-28 pb-16 sm:pt-36 sm:pb-24">
        <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="relative z-10 container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-amber-300 uppercase">
              <Tag size={14} className="text-amber-400" />
              <span>
                {isHindi ? 'बजट-फ्रेंडली सुरक्षित निवेश' : 'Budget-Friendly Plotted Townships'}
              </span>
            </div>

            <h1 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              {isHindi ? (
                <>जयपुर में 20 लाख के अंदर रेजिडेंशियल प्लॉट्स</>
              ) : (
                <>Residential Plots in Jaipur Under ₹ 20 Lakhs</>
              )}
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
              {isHindi ? (
                <>
                  खाटू श्याम जी हाईवे और जयपुर ग्रोथ कॉरिडोर में 80 से 150 गज के प्लॉट्स मात्र ₹ 15
                  लाख* से शुरू। आसान मासिक किश्तें, बैंक लोन सहायता और 100% स्पष्ट रजिस्ट्री।
                </>
              ) : (
                <>
                  Prime 80 to 150 sq. yd. residential plots starting from just ₹ 15 Lakhs*. Equipped
                  with gated infrastructure, electricity, paved roads, and convenient EMI schedules.
                </>
              )}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/projects/shivani-vatika-11th"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-3.5 text-xs font-bold tracking-wider text-slate-950 uppercase shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500"
              >
                <span>{isHindi ? '₹ 15 लाख वाले प्लॉट्स देखें' : 'View ₹ 15L+ Options'}</span>
                <ArrowRight size={16} />
              </Link>

              <a
                href="tel:+917300007643"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-md transition-colors hover:border-amber-400/50 hover:bg-white/10"
              >
                <PhoneCall size={16} className="text-amber-400" />
                <span>+91-73000-07643</span>
              </a>
            </div>

            {/* Value Highlights */}
            <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'From ₹ 15 Lakhs*', sub: 'Starting Price' },
                { label: '80 - 150 Sq. Yds.', sub: 'Compact Plot Sizes' },
                { label: 'Easy Installments', sub: 'Flexible EMI Plans' },
                { label: '100% Registry', sub: 'Sub-Registrar Papers' },
              ].map((h, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center"
                >
                  <div className="font-serif text-base font-bold text-amber-300 sm:text-lg">
                    {h.label}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-400">{h.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Projects under 20 Lakhs */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-amber-500/30 bg-slate-900/60 p-6 shadow-2xl sm:p-10">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
                <Image
                  src="/Shivani Vatika 11/gate.webp"
                  alt="Shivani Vatika 11th Budget Plots"
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 left-3 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold text-slate-950">
                  Best Value 2026
                </div>
              </div>

              <div>
                <div className="text-xs font-bold tracking-widest text-amber-400 uppercase">
                  Top Recommended Budget Option
                </div>
                <h2 className="mt-2 font-serif text-2xl font-bold text-white sm:text-3xl">
                  Shivani Vatika 11th
                </h2>
                <p className="mt-1 text-xs text-amber-400">
                  Jaipur - Khatu Shyam Ji Highway, Harsholi
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Compact 80 and 100 sq. yard residential plots engineered for maximum space
                  efficiency, perfect for nuclear families and long-term capital appreciation.
                </p>

                <div className="mt-6 space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                    <span>Affordable entry point starting at ₹ 15 Lakhs*</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                    <span>Ready possession with electrical poles and wide roads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                    <span>Quick connectivity to Renwal station and highway</span>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-4">
                  <Link
                    href="/projects/shivani-vatika-11th"
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 uppercase hover:bg-amber-400"
                  >
                    <span>Explore Plots</span>
                    <ArrowRight size={14} />
                  </Link>

                  <a
                    href="/Shivani Vatika 11/ShivaniVatika 11.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/10"
                  >
                    <FileDown size={14} />
                    <span>Brochure</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="border-t border-white/10 bg-slate-900/40 py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-serif text-2xl font-bold text-white sm:text-3xl">
              Budget Plot Buying FAQs
            </h2>
            <div className="mt-8 divide-y divide-white/10">
              {BUDGET_FAQS.map((faq, i) => (
                <div key={i} className="py-4">
                  <h3 className="font-serif text-base font-bold text-white sm:text-lg">
                    {faq.question}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-300">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteVisitPill areaName="Affordable Plots Jaipur" defaultPickup="Doorstep in Jaipur City" />
    </div>
  );
}
