import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { CheckCircle2, FileDown, ArrowRight, PhoneCall, Train } from 'lucide-react';
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
    ? 'रेनवाल रेलवे स्टेशन व रीको एरिया के पास प्लॉट्स | जयपुर - खाटू हाईवे'
    : 'Plots Near Renwal Railway Station & RIICO Industrial Area | Jaipur - Khatu Highway';

  const description = isHindi
    ? 'रेनवाल रेलवे स्टेशन और रीको इंडस्ट्रियल एरिया के पास 100% स्पष्ट रजिस्ट्री आवासीय प्लॉट्स। 35 मिनट में जयपुर जंक्शन, पक्की सड़कें, बाउंड्री वॉल और फ्री कैब साइट विजिट।'
    : 'Buy premium residential plots near Renwal Railway Station and RIICO Industrial Area on Jaipur-Khatu Shyam Ji Highway. Clear registry, bank loan help & complimentary cab site visits.';

  return {
    title,
    description,
    keywords: [
      'Plots near Renwal railway station',
      'Plots near RIICO Renwal',
      'Residential plots in Renwal Jaipur',
      'Harsholi Renwal plots',
      'Plots on Jaipur to Khatu Shyam highway',
      'Low budget plots in Renwal',
      'SVI Infra Solutions',
    ],
    alternates: buildAlternates('/plots-near-renwal-railway-station', locale),
    openGraph: {
      title,
      description,
      url: localizedUrl('/plots-near-renwal-railway-station', locale),
      locale: isHindi ? 'hi_IN' : 'en_IN',
      images: [{ url: `${SITE_URL}/Shivani Vatika 11/gate.webp`, width: 1200, height: 630 }],
    },
  };
}

const RENWAL_FAQS = [
  {
    question: 'How far is Shivani Vatika 11th from Renwal Railway Station?',
    answer:
      'Shivani Vatika 11th is located just 8-10 minutes from Renwal Railway Station (NWR), offering quick daily passenger and express train access to Jaipur Junction, Phulera, and Ringas.',
  },
  {
    question: 'Why are plots near RIICO Industrial Area Renwal a strong investment?',
    answer:
      'The RIICO Industrial Area at Renwal houses numerous active industrial, manufacturing, and agricultural processing enterprises, creating strong year-round residential rental and capital value demand.',
  },
  {
    question: 'What is the starting price for residential plots near Renwal?',
    answer:
      'Residential plots at Shivani Vatika 11th near Renwal start at ₹ 15 Lakhs* for 80 sq. yd. units with 0% interest monthly installment options.',
  },
  {
    question: 'Are bank loans available for plots near Renwal Railway Station?',
    answer:
      'Yes, all our projects feature verified legal titles and registry papers, making them eligible for hassle-free property loan assistance from leading banking partners.',
  },
];

export default async function PlotsNearRenwalPage({ params }: Props) {
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
            name: isHindi ? 'रेनवाल के पास प्लॉट्स' : 'Plots Near Renwal',
            item: '/plots-near-renwal-railway-station',
          },
        ]}
      />

      <PlaceAndAreaSchema
        name="Renwal Railway Station & Harsholi Residential Hub"
        description="Plotted residential developments near Renwal Railway Station on Jaipur to Khatu Shyam Ji corridor."
        url={localizedUrl('/plots-near-renwal-railway-station', locale)}
        latitude={27.0863}
        longitude={75.4052}
        addressLocality="Renwal"
        addressRegion="Rajasthan"
        postalCode="303603"
      />

      <FAQSchema questions={RENWAL_FAQS} />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-amber-500/20 pt-28 pb-16 sm:pt-36 sm:pb-24">
        <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="relative z-10 container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-amber-300 uppercase">
              <Train size={14} className="text-amber-400" />
              <span>
                {isHindi ? 'रेलवे स्टेशन व रीको के समीप' : '8 Mins to Renwal Junction & RIICO'}
              </span>
            </div>

            <h1 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              {isHindi ? (
                <>रेनवाल रेलवे स्टेशन के पास प्रीमियम आवासीय प्लॉट्स</>
              ) : (
                <>Plots Near Renwal Railway Station & RIICO Hub</>
              )}
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
              {isHindi ? (
                <>
                  जयपुर - खाटू श्याम जी हाईवे कॉरिडोर (हरसोली-रेनवाल) पर सुरक्षित निवेश। 100% स्पष्ट
                  रजिस्ट्री, पक्की सड़कें, पानी-बिजली और तुरंत निर्माण योग्य टाउनशिप।
                </>
              ) : (
                <>
                  High-appreciation residential plots situated along the booming Jaipur-Khatu Shyam
                  highway. Adjacent to RIICO Industrial Area with unmatched rail and highway
                  connectivity.
                </>
              )}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/projects/shivani-vatika-11th"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-3.5 text-xs font-bold tracking-wider text-slate-950 uppercase shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500"
              >
                <span>{isHindi ? 'शिवानी वाटिका 11th देखें' : 'View Shivani Vatika 11th'}</span>
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

            {/* Quick connectivity indicators */}
            <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: '8 Mins', sub: 'Renwal Railway Station' },
                { label: '5 Mins', sub: 'RIICO Industrial Area' },
                { label: '25 Mins', sub: 'Shri Khatu Shyam Ji' },
                { label: '35 Mins', sub: 'Jaipur Junction (Train)' },
              ].map((c, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center"
                >
                  <div className="font-serif text-lg font-bold text-amber-300">{c.label}</div>
                  <div className="mt-0.5 text-xs text-slate-400">{c.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Township Details */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-amber-500/30 bg-slate-900/60 p-6 shadow-2xl sm:p-10">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
                <Image
                  src="/Shivani Vatika 11/gate.webp"
                  alt="Shivani Vatika 11th Gate near Renwal"
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 left-3 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-bold text-slate-950">
                  Ready Possession
                </div>
              </div>

              <div>
                <div className="text-xs font-bold tracking-widest text-amber-400 uppercase">
                  Flagship Township Near Renwal
                </div>
                <h2 className="mt-2 font-serif text-2xl font-bold text-white sm:text-3xl">
                  Shivani Vatika 11th (Harsholi)
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Located directly on the Khatu Shyam Ji corridor near Renwal, Shivani Vatika 11th
                  offers master-planned residential living with complete infrastructural amenities.
                </p>

                <div className="mt-6 space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                    <span>80, 100, 150 & 250 Sq. Yds. Demarcated Plots</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                    <span>30 & 40 Feet Wide Interlocked Paved Roads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                    <span>Individual Sub-Registrar Registry & Mutation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                    <span>24x7 Security with Gated Entry Arch</span>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-4">
                  <Link
                    href="/projects/shivani-vatika-11th"
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 uppercase hover:bg-amber-400"
                  >
                    <span>View Site Layout</span>
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
              Questions About Buying Land Near Renwal
            </h2>
            <div className="mt-8 divide-y divide-white/10">
              {RENWAL_FAQS.map((faq, i) => (
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

      <SiteVisitPill
        areaName="Renwal - Khatu Highway"
        defaultPickup="Renwal Station or Jaipur City"
      />
    </div>
  );
}
