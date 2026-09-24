import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import {
  MapPin,
  CheckCircle2,
  ShieldCheck,
  FileDown,
  ArrowRight,
  Sparkles,
  PhoneCall,
} from 'lucide-react';
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
    ? 'जयपुर में प्लॉट्स और आवासीय भूमि | 100% स्पष्ट रजिस्ट्री टाउनशिप'
    : 'Plots in Jaipur - Verified Residential Plots & Gated Townships for Sale';

  const description = isHindi
    ? 'जयपुर में खाटू श्याम जी हाईवे, नायला और फुलेरा स्मार्ट सिटी कॉरिडोर पर 100% स्पष्ट रजिस्ट्री आवासीय प्लॉट्स खरीदें। ईएमआई सुविधा और फ्री कैब साइट विजिट उपलब्ध।'
    : 'Buy verified residential plots and gated township land in Jaipur across prime growth corridors: Khatu Shyam Highway, Nayla & Phulera DMIC. Clear registry, bank loan assistance, and complimentary cab site visits.';

  return {
    title,
    description,
    keywords: [
      'Plots in Jaipur',
      'Residential Plots in Jaipur',
      'Plots for sale in Jaipur',
      'Gated township Jaipur',
      'Khatu Shyam Highway Plots',
      'Nayla Jaipur Plots',
      'Buy Land in Jaipur',
      'Low budget plots in Jaipur',
      'JDA approved plots Jaipur',
      'SVI Infra Solutions',
    ],
    alternates: buildAlternates('/plots-in-jaipur', locale),
    openGraph: {
      title,
      description,
      url: localizedUrl('/plots-in-jaipur', locale),
      locale: isHindi ? 'hi_IN' : 'en_IN',
      images: [{ url: `${SITE_URL}/images/project1.png`, width: 1200, height: 630 }],
    },
  };
}

const JAIPUR_PROJECTS = [
  {
    id: 'shivani-vatika-11th',
    title: 'Shivani Vatika 11th',
    titleHi: 'शिवानी वाटिका 11th',
    corridor: 'Jaipur - Khatu Shyam Ji Highway (Harsholi)',
    corridorHi: 'जयपुर - खाटू श्याम जी हाईवे (हरसोली)',
    type: 'Premier Gated Residential Plots',
    typeHi: 'प्रीमियर आवासीय प्लॉट्स',
    size: '80 - 250 Sq. Yds.',
    priceBadge: 'From ₹ 15 Lakhs*',
    img: '/Shivani Vatika 11/gate.webp',
    highlights: [
      'Adjacent to RIICO Industrial Area',
      '10 mins to Renwal Railway Station',
      'Grand Gate & 24/7 Security',
      'Wide Interlocked Roads',
    ],
    href: '/projects/shivani-vatika-11th',
    brochureUrl: '/Shivani Vatika 11/ShivaniVatika 11.pdf',
  },
  {
    id: 'shivani-vatika',
    title: 'Shivani Vatika',
    titleHi: 'शिवानी वाटिका',
    corridor: 'Nayla, Foothills of Jaipur',
    corridorHi: 'नायला, जयपुर',
    type: 'Luxury Eco-Living Plots',
    typeHi: 'लक्जरी आवासीय प्लॉट्स',
    size: '100 - 300 Sq. Yds.',
    priceBadge: 'From ₹ 22 Lakhs*',
    img: '/Shivani Vatika/shivani vatika6 frontgate.webp',
    highlights: [
      'Serene Natural Foothill Surroundings',
      'Underground Water Supply',
      'Landscaped Green Parks',
      'Quick Connect to Agra Road / Jaipur Bypass',
    ],
    href: '/projects/shivani-vatika',
    brochureUrl: '/Shivani Vatika/shivani-vatika-11th-brochure.pdf',
  },
  {
    id: 'shyam-aangan',
    title: 'Shyam Aangan',
    titleHi: 'श्याम आंगन',
    corridor: 'Basri Khurd, Jaipur',
    corridorHi: 'बासंडी खुर्द, जयपुर',
    type: 'Integrated Modern Township (40 Bigha)',
    typeHi: 'इंटीग्रेटेड टाउनशिप',
    size: '50 - 750 Sq. Yds.',
    priceBadge: 'From ₹ 18 Lakhs*',
    img: '/images/project1.png',
    highlights: [
      '100% Vastu-Compliant Masterplan',
      'Clubhouse & Temple Complex',
      '40-Foot Wide Arterial Roads',
      'Commercial Hub & Daily Needs',
    ],
    href: '/projects/shyam-aangan',
    brochureUrl: '/Shivani Vatika 11/ShivaniVatika 11.pdf',
  },
];

const JAIPUR_FAQS = [
  {
    question:
      'Are all residential plots in Jaipur legally verified with clear registry documentation?',
    answer:
      'Yes, 100% of plotted developments delivered by SVI Infra Solutions in Jaipur feature clear registry documentation, verified ownership titles, and demarcated boundaries with boundary walls and individual plot numbering.',
  },
  {
    question:
      'What is the starting price for residential plots near Jaipur on Khatu Shyam Ji Highway?',
    answer:
      'Plot sizes at Shivani Vatika 11th start from 80 sq. yds. up to 250 sq. yds., with prices beginning around ₹ 15 Lakhs*. We also offer flexible interest-free payment installments and bank loan assistance.',
  },
  {
    question: 'How can I book a free cab site visit to inspect plots in Jaipur?',
    answer:
      'We offer complimentary chauffeured AC cab pickup and drop from your doorstep anywhere in Jaipur. Simply click the "Book Free Site Visit Cab" button or WhatsApp us at +91-73000-07643 to reserve your timing.',
  },
  {
    question:
      'Why is Khatu Shyam Ji Highway Harsholi one of the highest appreciation corridors in Rajasthan?',
    answer:
      'The corridor benefits from massive pilgrimage footfall expansion, proximity to the RIICO Industrial Area at Renwal, and direct freight and passenger transit connectivity, generating rapid commercial and residential capital appreciation.',
  },
  {
    question: 'Can NRIs and outstation buyers book plots in Jaipur remotely?',
    answer:
      'Yes, SVI Infra provides dedicated virtual walkthroughs, digital allotment ledger access, remote documentation coordination, and RBI-compliant payment processing for outstation and NRI buyers.',
  },
];

export default async function PlotsInJaipurPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isHindi = locale === 'hi';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <BreadcrumbSchema
        items={[
          { name: 'Home', item: '/' },
          { name: isHindi ? 'जयपुर में प्लॉट्स' : 'Plots in Jaipur', item: '/plots-in-jaipur' },
        ]}
      />

      <PlaceAndAreaSchema
        name="Jaipur Residential Townships & Land Developments"
        description="Verified residential plots, gated communities, and highway investment lands across Jaipur district."
        url={localizedUrl('/plots-in-jaipur', locale)}
        latitude={26.9124}
        longitude={75.7873}
        addressLocality="Jaipur"
        addressRegion="Rajasthan"
        postalCode="302001"
      />

      <FAQSchema questions={JAIPUR_FAQS} />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-amber-500/20 pt-28 pb-16 sm:pt-36 sm:pb-24">
        <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-amber-300 uppercase">
              <Sparkles size={14} className="text-amber-400" />
              <span>
                {isHindi ? '100% स्पष्ट रजिस्ट्री प्लॉट्स' : '100% Clear Title Registry Plots'}
              </span>
            </div>

            <h1 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              {isHindi ? (
                <>जयपुर में सत्यापित आवासीय प्लॉट्स व गेटेड टाउनशिप्स</>
              ) : (
                <>Residential Plots & Gated Townships in Jaipur</>
              )}
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
              {isHindi ? (
                <>
                  खाटू श्याम जी हाईवे, नायला और फुलेरा डीएमआईसी कॉरिडोर में अपना पसंदीदा प्लॉट
                  चुनें। आधुनिक इंफ्रास्ट्रक्चर, बिजली, पानी, 24/7 सुरक्षा और निःशुल्क कैब साइट
                  विजिट सुविधा।
                </>
              ) : (
                <>
                  Invest in verified residential land across Jaipur’s fastest appreciating
                  corridors. Featuring gated boundaries, 40-ft paved roads, underground utilities,
                  and 0-compromise legal documentation.
                </>
              )}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#projects-inventory"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-3.5 text-xs font-bold tracking-wider text-slate-950 uppercase shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/30"
              >
                <span>{isHindi ? 'उपलब्ध प्लॉट्स देखें' : 'View Available Plots'}</span>
                <ArrowRight size={16} />
              </a>

              <a
                href="tel:+917300007643"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-md transition-colors hover:border-amber-400/50 hover:bg-white/10"
              >
                <PhoneCall size={16} className="text-amber-400" />
                <span>+91-73000-07643</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  label: isHindi ? '100% स्पष्ट दस्तावेज़' : '100% Clear Title',
                  sub: isHindi ? 'सुरक्षित निवेश' : 'Zero Dispute',
                },
                {
                  label: isHindi ? 'फ्री कैब साइट विजिट' : 'Free AC Cab Visit',
                  sub: isHindi ? 'घर से पिकअप' : 'Doorstep Pickup',
                },
                {
                  label: isHindi ? 'आसान किश्तें' : 'Easy Installments',
                  sub: isHindi ? 'बैंक सहायता' : 'Bank Loan Help',
                },
                {
                  label: isHindi ? '17+ वर्षों का अनुभव' : '17+ Years Legacy',
                  sub: isHindi ? 'विश्वसनीय बिल्डर' : 'Trusted Developer',
                },
              ].map((badge, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center"
                >
                  <div className="font-serif text-sm font-bold text-amber-300 sm:text-base">
                    {badge.label}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-400">{badge.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Inventory Grid */}
      <section id="projects-inventory" className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
              {isHindi ? 'प्राइम लोकेशन्स' : 'Strategic Jaipur Corridors'}
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
              {isHindi
                ? 'जयपुर में हमारे प्रमुख टाउनशिप प्रोजेक्ट्स'
                : 'Featured Plotted Townships in Jaipur'}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-xs text-slate-400 sm:text-sm">
              {isHindi
                ? 'अपनी बजट और लोकेशन प्राथमिकता के अनुसार सत्यापित प्लॉट चुनें।'
                : 'Choose from meticulously planned plotted developments with complete infrastructural amenities.'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {JAIPUR_PROJECTS.map((proj) => (
              <div
                key={proj.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl transition-all duration-300 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
                  <Image
                    src={proj.img}
                    alt={proj.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-slate-950/80 px-3 py-1 text-[10px] font-bold text-amber-400 backdrop-blur-md">
                    <ShieldCheck size={12} />
                    <span>Verified Registry</span>
                  </div>
                  <div className="absolute top-4 right-4 z-10 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold text-slate-950 shadow-md">
                    {proj.priceBadge}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-amber-400">
                    <MapPin size={13} />
                    <span>{isHindi ? proj.corridorHi : proj.corridor}</span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-white transition-colors group-hover:text-amber-200">
                    {isHindi ? proj.titleHi : proj.title}
                  </h3>

                  <div className="mt-2 text-xs text-slate-300">
                    <strong>Plot Sizes:</strong> {proj.size}
                  </div>

                  <ul className="mt-4 space-y-2 border-t border-white/10 pt-4 text-xs text-slate-400">
                    {proj.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex items-center gap-3 pt-4">
                    <Link
                      href={proj.href}
                      className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/20"
                    >
                      <span>Explore Layout</span>
                      <ArrowRight size={14} />
                    </Link>

                    <a
                      href={proj.brochureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-300 transition-colors hover:bg-amber-500 hover:text-slate-950"
                    >
                      <FileDown size={14} />
                      <span>PDF</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="border-t border-white/10 bg-slate-900/40 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
              Buyer Questions
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
              Frequently Asked Questions About Plots in Jaipur
            </h2>
          </div>

          <div className="mx-auto mt-10 max-w-3xl divide-y divide-white/10">
            {JAIPUR_FAQS.map((faq, idx) => (
              <div key={idx} className="py-5">
                <h3 className="font-serif text-lg font-bold text-white sm:text-xl">
                  {faq.question}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Free Cab Site Visit Sticky Action */}
      <SiteVisitPill
        areaName="Jaipur Residential Townships"
        defaultPickup="Doorstep in Jaipur City"
      />
    </div>
  );
}
