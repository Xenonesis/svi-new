import type { Metadata } from 'next';
import Image from 'next/image';
import { setRequestLocale } from 'next-intl/server';
import {
  Train,
  Building2,
  TrendingUp,
  MapPin,
  CheckCircle2,
  ArrowRight,
  PhoneCall,
  FileDown,
  ShieldCheck,
  Sparkles,
  Warehouse,
  Truck,
  Compass,
  Clock,
  Navigation,
} from 'lucide-react';
import { Link } from '@/src/i18n/navigation';
import { SITE_URL, buildAlternates, localizedUrl } from '@/src/lib/seo';
import { BreadcrumbSchema, FAQSchema, PlaceAndAreaSchema } from '@/src/components/common/Schema';
import SiteVisitPill from '@/src/components/common/SiteVisitPill';
import {
  PhuleraBrochureButton,
  PhuleraFaqAccordion,
  PhuleraLeadCaptureForm,
  type PhuleraFaqItem,
} from '@/src/components/areas/PhuleraInteractive';

export const revalidate = 86400;

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isHindi = locale === 'hi';

  const title = isHindi
    ? 'फुलेरा में आवासीय प्लॉट्स | फुलेरा स्मार्ट सिटी प्लॉट्स जयपुर | SVI Infra'
    : 'Plots for Sale in Phulera | Residential Plots in Phulera Smart City | SVI Infra';

  const description = isHindi
    ? 'फुलेरा स्मार्ट सिटी (DMIC एवं वेस्टर्न DFC रेलवे कॉरिडोर) में 100% स्पष्ट रजिस्ट्री आवासीय व कमर्शियल प्लॉट्स। फुलेरा जंक्शन, जयपुर-अजमेर एक्सप्रेसवे से 45 मिनट, कम बजट में 15-20% उच्च वार्षिक रिटर्न और फ्री कैब साइट विजिट।'
    : 'Buy premium residential & commercial plots in Phulera Smart City along the Delhi-Mumbai Industrial Corridor (DMIC) & Western DFC rail junction. Low-entry investment with 15-20% projected annual appreciation, clear registry & Jaipur expressway connectivity.';

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: [
      'plots for sale in Phulera',
      'residential plots in Phulera',
      'plots for sale in Jaipur Phulera',
      'Phulera smart city plots',
      'DMIC DFC corridor plots',
      'commercial plots in Phulera',
      'industrial plots Phulera junction',
      'plots near Sambhar lake',
      'plots near Jaipur Ajmer expressway',
      'SVI Infra Solutions',
    ],
    alternates: buildAlternates('/plots-for-sale-in-phulera', locale),
    openGraph: {
      title,
      description,
      url: localizedUrl('/plots-for-sale-in-phulera', locale),
      locale: isHindi ? 'hi_IN' : 'en_IN',
      images: [
        {
          url: `${SITE_URL}/images/landmarks/phulera-dmic.webp`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/images/landmarks/phulera-dmic.webp`],
    },
  };
}

const PHULERA_FAQS_EN: PhuleraFaqItem[] = [
  {
    question: 'Why are plots for sale in Phulera considered a high-growth real estate investment?',
    answer:
      'Phulera is the principal logistics and freight intersection of the Delhi-Mumbai Industrial Corridor (DMIC) and the Western Dedicated Freight Corridor (DFC) in Rajasthan. With inland container depots, warehousing parks, and manufacturing clusters expanding rapidly, land in the Phulera corridor projects an estimated 15–20% annual capital appreciation rate.',
  },
  {
    question: 'What plot sizes and categories are available in the Phulera Smart City corridor?',
    answer:
      'Buyers can choose from demarcated residential villa plots ranging from 80 sq. yds. to 250 sq. yds., commercial frontage plots suitable for showrooms and logistics offices, as well as larger warehousing parcels with wide 30 to 60-foot arterial road access.',
  },
  {
    question: 'How connected is Phulera to Jaipur City and major economic centers?',
    answer:
      'Phulera connects seamlessly to central Jaipur in under 45 minutes via the 4-lane Jaipur-Ajmer Expressway (NH-48) and the upcoming Jaipur Ring Road Phase II. Phulera Junction is also one of North Western Railway’s largest rail nodes, offering frequent direct trains to Jaipur, Delhi, Ajmer, and Ahmedabad.',
  },
  {
    question:
      'Are residential plots in the Phulera corridor 100% legally approved with clear registry?',
    answer:
      'Yes. Plotted developments promoted by SVI Infra Solutions in this corridor feature legally verified title deeds, Section 90-A land conversion approvals, individual sub-registrar registration, and immediate mutation in government revenue records.',
  },
  {
    question:
      'What is the connectivity between Phulera Junction and Shivani Vatika 11th (Harsholi)?',
    answer:
      'Shivani Vatika 11th is located approximately 34 km (~35 minutes drive) north of Phulera Junction along the Renwal-Harsholi highway link. This offers investors easy cross-corridor mobility between the industrial logistics hub of Phulera and the pilgrimage-commercial corridor of Khatu Shyam Ji Highway.',
  },
  {
    question: 'Can I visit the Phulera corridor plots with free transportation from Jaipur?',
    answer:
      'Yes. SVI Infra Solutions provides complimentary doorstep AC cab pickup and drop services from anywhere in Jaipur City, the airport, or railway stations for prospective buyers and families. You can reserve your visit online or via WhatsApp.',
  },
];

const PHULERA_FAQS_HI: PhuleraFaqItem[] = [
  {
    question: 'फुलेरा में प्लॉट्स खरीदना भविष्य के लिए सबसे बेहतरीन निवेश क्यों है?',
    answer:
      'फुलेरा दिल्ली-मुंबई इंडस्ट्रियल कॉरिडोर (DMIC) और वेस्टर्न डेडिकेटेड फ्रेट कॉरिडोर (DFC) का प्रमुख रणनीतिक केंद्र है। वेयरहाउसिंग, इनलैंड कंटेनर डिपो (ICD) और लॉजिस्टिक्स पार्क्स के तीव्र विस्तार के चलते यहाँ प्लॉट्स में 15–20% वार्षिक विकास दर (Capital Appreciation) का अनुमान है।',
  },
  {
    question: 'फुलेरा स्मार्ट सिटी कॉरिडोर में किस साइज के प्लॉट्स उपलब्ध हैं?',
    answer:
      'यहाँ 80 से 250 वर्ग गज तक के सुव्यवस्थित आवासीय भूखंड (विला प्लॉट्स), लॉजिस्टिक्स एवं व्यावसायिक प्रतिष्ठानों के लिए कमर्शियल प्लॉट्स तथा वेयरहाउसिंग हेतु उपयुक्त बड़े भूखंड 30 से 60 फीट चौड़ी सड़कों के साथ उपलब्ध हैं।',
  },
  {
    question: 'फुलेरा से जयपुर शहर और प्रमुख व्यापारिक केंद्रों की कनेक्टिविटी कैसी है?',
    answer:
      'फुलेरा 4-लेन जयपुर-अजमेर एक्सप्रेसवे (NH-48) और जयपुर रिंग रोड फ़ेज़-2 के माध्यम से जयपुर शहर से मात्र 45 मिनट की दूरी पर है। फुलेरा जंक्शन उत्तर पश्चिम रेलवे का विशालतम रेलवे जंक्शन है, जहाँ से जयपुर, दिल्ली, अजमेर और मुंबई के लिए नियमित ट्रेनें उपलब्ध हैं।',
  },
  {
    question: 'क्या फुलेरा के आवासीय प्लॉट्स की रजिस्ट्री और दस्तावेज 100% स्पष्ट हैं?',
    answer:
      'हाँ! SVI Infra Solutions द्वारा प्रस्तुत सभी प्लॉट्स 100% स्पष्ट दस्तावेजों, धारा 90-ए (Section 90-A) रूपांतरण, सब-रजिस्ट्रार कार्यालय में पक्की रजिस्ट्री और तुरंत नामांतरण (दाखिल-खारिज) की कानूनी सुरक्षा के साथ उपलब्ध कराए जाते हैं।',
  },
  {
    question: 'फुलेरा जंक्शन से शिवानी वाटिका 11th (हरसोली) की कनेक्टिविटी कैसी है?',
    answer:
      'शिवानी वाटिका 11th फुलेरा जंक्शन से मात्र 34 किमी (लगभग 35 मिनट) की दूरी पर रेनवाल-हरसोली मार्ग पर स्थित है। यह कॉरिडोर फुलेरा के औद्योगिक लॉजिस्टिक्स हब को खाटू श्याम जी हाईवे कॉरिडोर से सीधे जोड़ता है।',
  },
  {
    question: 'क्या जयपुर से फ्री साइट विजिट कैब की सुविधा उपलब्ध है?',
    answer:
      'हाँ! SVI Infra Solutions जयपुर के किसी भी हिस्से, रेलवे स्टेशन या एयरपोर्ट से खरीदारों के लिए पूर्णतः निःशुल्क (फ्री) एसी कैब पिकअप एवं ड्रॉप की सुविधा प्रदान करता है।',
  },
];

const COMMUTE_MATRIX = [
  {
    landmark: 'Phulera Junction (NWR & DFC Hub)',
    landmarkHi: 'फुलेरा जंक्शन (उत्तर पश्चिम रेलवे व DFC हब)',
    distance: '3–5 km',
    time: '5–8 Mins',
    route: 'Direct Town Arterial Road',
    routeHi: 'मुख्य शहर संपर्क मार्ग',
    highlight: 'Major 4-way railway freight interchange',
    highlightHi: 'प्रमुख चार-तरफा रेलवे फ्रेट जंक्शन',
  },
  {
    landmark: 'Sambhar Salt Lake & Eco-Tourism',
    landmarkHi: 'सांभर सॉल्ट लेक एवं पर्यटन क्षेत्र',
    distance: '10 km',
    time: '12–15 Mins',
    route: 'Phulera-Sambhar Highway (SH-19)',
    routeHi: 'फुलेरा-सांभर राजमार्ग (SH-19)',
    highlight: 'Historic salt production belt & tourist hub',
    highlightHi: 'सांभर नमक उद्योग एवं हेरिटेज पर्यटन केंद्र',
  },
  {
    landmark: 'Jaipur-Ajmer Expressway (NH-48)',
    landmarkHi: 'जयपुर-अजमेर एक्सप्रेसवे (NH-48)',
    distance: '18 km',
    time: '18–20 Mins',
    route: '6-Lane National Expressway Corridor',
    routeHi: '6-लेन राष्ट्रीय एक्सप्रेसवे कॉरिडोर',
    highlight: 'Direct signal-free high-speed corridor',
    highlightHi: 'सिग्नल-फ्री हाई-स्पीड हाईवे संपर्क',
  },
  {
    landmark: 'RIICO Industrial Area Renwal',
    landmarkHi: 'रीको इंडस्ट्रियल एरिया किशनगढ़ रेनवाल',
    distance: '32 km',
    time: '30–32 Mins',
    route: 'Phulera - Renwal Arterial Link',
    routeHi: 'फुलेरा - रेनवाल लिंक मार्ग',
    highlight: '64-Acre operational manufacturing zone',
    highlightHi: '64 एकड़ में विस्तृत सक्रिय मैन्युफैक्चरिंग ज़ोन',
  },
  {
    landmark: 'Shivani Vatika 11th (Harsholi)',
    landmarkHi: 'शिवानी वाटिका 11th (हरसोली टाउनशिप)',
    distance: '34 km',
    time: '~35 Mins',
    route: 'Jaipur-Khatu Highway Extension',
    routeHi: 'जयपुर-खाटू श्याम जी हाईवे',
    highlight: '230 demarcated residential plots (11.5 Bigha)',
    highlightHi: '11.5 बीघा में 230 सुनियोजित आवासीय प्लॉट्स',
  },
  {
    landmark: 'Jaipur Ring Road (Phase II Interchange)',
    landmarkHi: 'जयपुर रिंग रोड (फ़ेज़-2 इंटरचेंज)',
    distance: '35 km',
    time: '35 Mins',
    route: 'Access-Controlled Ring Expressway',
    routeHi: 'नियंत्रित एक्सेस रिंग एक्सप्रेसवे',
    highlight: 'Direct bypass avoiding city congestion',
    highlightHi: 'जयपुर शहर के ट्रैफिक से मुक्त सीधा बाईपास',
  },
  {
    landmark: 'Central Jaipur (200 Ft Bypass / Ajmer Rd)',
    landmarkHi: 'जयपुर सिटी (200 फीट बाईपास / अजमेर रोड)',
    distance: '55 km',
    time: '45–50 Mins',
    route: 'NH-48 Expressway Express Flow',
    routeHi: 'NH-48 एक्सप्रेसवे सीधा आवागमन',
    highlight: 'Rapid commute to Jaipur commercial centers',
    highlightHi: 'जयपुर के मुख्य व्यावसायिक केंद्रों तक त्वरित पहुँच',
  },
  {
    landmark: 'Jaipur International Airport (JAI)',
    landmarkHi: 'जयपुर इंटरनेशनल एयरपोर्ट (सांगानेर)',
    distance: '65 km',
    time: '60–65 Mins',
    route: 'Via Ring Road & Tonk Road Expressway',
    routeHi: 'रिंग रोड व टोंक रोड एक्सप्रेसवे द्वारा',
    highlight: 'Terminal 2 air connectivity',
    highlightHi: 'टर्मिनल 2 सीधी घरेलू व अंतरराष्ट्रीय उड़ानें',
  },
];

export default async function PlotsForSaleInPhuleraPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isHindi = locale === 'hi';

  const faqItems = isHindi ? PHULERA_FAQS_HI : PHULERA_FAQS_EN;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Structured Data: Breadcrumb, Place & FAQ Schemas */}
      <BreadcrumbSchema
        items={[
          { name: isHindi ? 'होम' : 'Home', item: '/' },
          { name: isHindi ? 'कॉरिडोर्स' : 'Corridors', item: '/areas' },
          {
            name: isHindi ? 'फुलेरा में प्लॉट्स' : 'Plots for Sale in Phulera',
            item: '/plots-for-sale-in-phulera',
          },
        ]}
      />

      <PlaceAndAreaSchema
        name={isHindi ? 'फुलेरा DMIC स्मार्ट सिटी कॉरिडोर' : 'Phulera DMIC Smart City Corridor'}
        description={
          isHindi
            ? 'दिल्ली-मुंबई इंडस्ट्रियल कॉरिडोर (DMIC) एवं वेस्टर्न DFC रेलवे हब, जयपुर जिला, राजस्थान'
            : 'Delhi-Mumbai Industrial Corridor (DMIC) & Western Dedicated Freight Corridor mega rail logistics hub, Jaipur district, Rajasthan.'
        }
        url={localizedUrl('/plots-for-sale-in-phulera', locale)}
        latitude={26.9}
        longitude={75.18}
        addressLocality="Phulera DMIC Corridor, Jaipur District"
        addressRegion="Rajasthan"
        postalCode="303338"
        image={`${SITE_URL}/images/landmarks/phulera-dmic.webp`}
      />

      <FAQSchema questions={faqItems} />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-amber-500/20 pt-28 pb-16 sm:pt-36 sm:pb-24">
        {/* Ambient Gold & Sapphire Glows */}
        <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            {/* Corridor Badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-amber-300 uppercase">
              <Train size={14} className="text-amber-400" />
              <span>
                {isHindi
                  ? 'DMIC मेगा लॉजिस्टिक्स एवं DFC फ्रेट हब'
                  : 'DMIC Mega Logistics & Western DFC Corridor'}
              </span>
            </div>

            {/* High-impact H1 */}
            <h1 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              {isHindi ? (
                <>फुलेरा में प्लॉट्स — DMIC स्मार्ट सिटी कॉरिडोर</>
              ) : (
                <>Plots for Sale in Phulera — DMIC Smart City Corridors</>
              )}
            </h1>

            {/* Sub-headline */}
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
              {isHindi ? (
                <>
                  दिल्ली-मुंबई इंडस्ट्रियल कॉरिडोर (DMIC) और वेस्टर्न DFC रेलवे जंक्शन पर रणनीतिक
                  निवेश। 100% स्पष्ट रजिस्ट्री, 80 से 250 वर्ग गज के आवासीय व कमर्शियल प्लॉट्स,
                  जयपुर से मात्र 45 मिनट की दूरी एवं 15-20% वार्षिक विकास दर।
                </>
              ) : (
                <>
                  Secure prime residential and commercial plots in Rajasthan&apos;s fastest-growing
                  multi-modal logistics hub. Strategically positioned on the Delhi-Mumbai Industrial
                  Corridor (DMIC) with 15–20% projected annual appreciation, clear registry, and 45
                  minutes connectivity to central Jaipur.
                </>
              )}
            </p>

            {/* Hero CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/projects/shivani-vatika-11th"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-7 py-3.5 text-xs font-bold tracking-wider text-slate-950 uppercase shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500 active:scale-95"
              >
                <span>{isHindi ? 'फ्लैगशिप टाउनशिप देखें' : 'Explore Flagship Township'}</span>
                <ArrowRight size={16} />
              </Link>

              <PhuleraBrochureButton variant="outline">
                <FileDown size={16} className="text-amber-400" />
                <span>{isHindi ? 'व्हाट्सएप ब्रोशर प्राप्त करें' : 'Get WhatsApp Brochure'}</span>
              </PhuleraBrochureButton>

              <a
                href="tel:+917300007643"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-md transition-colors hover:border-amber-400/50 hover:bg-white/10"
              >
                <PhoneCall size={16} className="text-amber-400" />
                <span>+91-73000-07643</span>
              </a>
            </div>

            {/* Quick 4-Pillar Highlights */}
            <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  label: isHindi ? 'DFC वेस्टर्न रेल हब' : 'DFC Western Rail Hub',
                  sub: isHindi ? 'क्वाड-ट्रैक फ्रेट जंक्शन' : 'Quad-Track Freight Hub',
                  icon: Train,
                },
                {
                  label: isHindi ? 'DMIC इंडस्ट्रियल कॉरिडोर' : 'DMIC Freight Corridor',
                  sub: isHindi ? 'ड्राई पोर्ट्स व वेयरहाउसिंग' : 'Dry Ports & Warehouses',
                  icon: Warehouse,
                },
                {
                  label: isHindi ? 'जयपुर से 45 मिनट' : '45 Mins to Jaipur',
                  sub: isHindi ? 'जयपुर-अजमेर एक्सप्रेसवे' : 'Jaipur-Ajmer Expressway',
                  icon: Compass,
                },
                {
                  label: isHindi ? '15–20% वार्षिक ROI' : '15–20% Projected Growth',
                  sub: isHindi ? 'तीव्र कैपिटल एप्रिसिएशन' : 'High Capital Appreciation',
                  icon: TrendingUp,
                },
              ].map((h, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center backdrop-blur-sm transition-all hover:border-amber-500/30 hover:bg-white/[0.05]"
                >
                  <h.icon className="mx-auto mb-1.5 h-5 w-5 text-amber-400" />
                  <div className="font-serif text-sm font-bold text-amber-300 sm:text-base">
                    {h.label}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-400">{h.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Phulera Mega Hub Advantage Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
              {isHindi ? 'औद्योगिक विकास एवं निवेश के लाभ' : 'Industrial & Commercial Drivers'}
            </span>
            <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-white sm:text-4xl">
              {isHindi ? <>फुलेरा मेगा हब का रणनीतिक महत्व</> : <>The Phulera Mega Hub Advantage</>}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
              {isHindi ? (
                <>
                  फुलेरा जंक्शन केवल एक रेलवे स्टेशन नहीं, बल्कि दिल्ली-मुंबई इंडस्ट्रियल कॉरिडोर का
                  एक बहुआयामी आर्थिक इंजन है जो औद्योगिक विकास, रोजगार और रियल एस्टेट को तीव्र गति
                  प्रदान कर रहा है।
                </>
              ) : (
                <>
                  Phulera represents the epicenter of cargo logistics and industrial infrastructure
                  in Jaipur district. Discover why top logistics providers and smart plot investors
                  are prioritizing this economic corridor.
                </>
              )}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Warehouse,
                title: isHindi
                  ? 'औद्योगिक वेयरहाउसिंग व कंटेनर डिपो'
                  : 'Industrial Warehousing & Container Depots',
                desc: isHindi
                  ? 'इनलैंड कंटेनर डिपो (ICD) और बहु-आयामी लॉजिस्टिक्स पार्क्स के कारण बड़े पैमाने पर भंडारण एवं कार्गो केंद्र स्थापित हो रहे हैं।'
                  : 'Massive warehousing complexes, dry ports, and multi-modal logistics parks (MMLP) operate along the freight rail corridor.',
              },
              {
                icon: Train,
                title: isHindi
                  ? 'त्रिकोणीय रेलवे जंक्शन कनेक्टिविटी'
                  : 'Triple Rail Connectivity & NWR Hub',
                desc: isHindi
                  ? 'फुलेरा जंक्शन से जयपुर, दिल्ली, अजमेर, अहमदाबाद व बीकानेर के लिए चौबीसों घंटे सीधी रेल कनेक्टिविटी और वेस्टर्न DFC फ्रेट लाइन उपलब्ध है।'
                  : 'Direct non-stop passenger and heavy freight rail movement connecting Delhi-NCR, Jaipur, Ajmer, and western Indian sea ports.',
              },
              {
                icon: Compass,
                title: isHindi
                  ? 'एक्सप्रेसवे व रिंग रोड से सुगम सफर'
                  : 'Expressway & Ring Road Arteries',
                desc: isHindi
                  ? 'जयपुर-अजमेर 4-लेन राष्ट्रीय राजमार्ग (NH-48) और जयपुर रिंग रोड फ़ेज़-2 के जरिए केवल 45 मिनट में जयपुर शहर पहुँचा जा सकता है।'
                  : 'Direct 4-lane access to NH-48 (Jaipur-Ajmer Expressway) and Jaipur Ring Road Phase II bypasses all inner-city traffic bottlenecks.',
              },
              {
                icon: ShieldCheck,
                title: isHindi
                  ? '100% स्पष्ट रजिस्ट्री एवं धारा 90-ए'
                  : '100% Clear Titles & 90-A Conversion',
                desc: isHindi
                  ? 'सभी टाउनशिप कानूनी रूप से रूपांतरित, मास्टर प्लान स्वीकृत और सब-रजिस्ट्रार कार्यालय में तुरंत रजिस्ट्री व म्यूटेशन के साथ उपलब्ध हैं।'
                  : 'Every plotted development adheres to Section 90-A conversion with clean revenue mutation, freehold deeds, and zero legal ambiguity.',
              },
              {
                icon: Building2,
                title: isHindi
                  ? 'स्मार्ट सिटी बुनियादी ढांचा व सड़कें'
                  : 'Smart City Infrastructure & Paved Roads',
                desc: isHindi
                  ? '30 से 60 फीट चौड़ी इंटरलॉकिंग पक्की सड़कें, भूमिगत पानी की पाइपलाइन, विद्युतीकरण, भव्य प्रवेश द्वार और 24/7 सुरक्षा बाउंड्री।'
                  : 'Engineered master-planned layouts featuring 30–60 ft wide paved roads, boundary walls, street lighting, and underground utilities.',
              },
              {
                icon: TrendingUp,
                title: isHindi
                  ? 'लाखों का रोजगार एवं आवास की भारी मांग'
                  : 'High Rental Yield & Sustained Appreciation',
                desc: isHindi
                  ? 'मैन्युफैक्चरिंग इकाइयों और लॉजिस्टिक्स कंपनियों से हज़ारों नए कर्मियों का आगमन आवासीय किराये और ज़मीन के मूल्यों को नई ऊँचाइयों पर ले जा रहा है।'
                  : 'Sustained industrial employment drives steady residential rental yields and 15–20% year-on-year land valuation compounding.',
              },
            ].map((adv, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-6 transition-all duration-300 hover:border-amber-500/40 hover:bg-slate-900/90"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400 transition-transform group-hover:scale-110">
                  <adv.icon size={22} />
                </div>
                <h3 className="font-serif text-lg font-bold text-white sm:text-xl">{adv.title}</h3>
                <p className="mt-2.5 text-xs leading-relaxed text-slate-300 sm:text-sm">
                  {adv.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects & Connectivity Spotlight */}
      <section className="border-y border-white/10 bg-slate-900/30 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-10 text-center">
              <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
                {isHindi ? 'संबद्ध प्रोजेक्ट्स एवं कनेक्टिविटी' : 'Corridor Townships & Proximity'}
              </span>
              <h2 className="mt-2 font-serif text-2xl font-bold text-white sm:text-4xl">
                {isHindi
                  ? 'फुलेरा कॉरिडोर एवं शिवानी वाटिका 11th'
                  : 'Phulera Corridor & Flagship Developments'}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-xs text-slate-300 sm:text-sm">
                {isHindi
                  ? 'फुलेरा DMIC इंडस्ट्रियल बेल्ट और हरसोली-किशनगढ़ रेनवाल हाईवे कॉरिडोर के मध्य निर्बाध कनेक्टिविटी।'
                  : 'Strategic plotted developments engineered to capture both the industrial expansion of Phulera and the high footfall of Jaipur-Khatu Highway.'}
              </p>
            </div>

            {/* Featured Township Card: Shivani Vatika 11th */}
            <div className="overflow-hidden rounded-3xl border border-amber-500/30 bg-slate-900/80 p-6 shadow-2xl sm:p-10">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10">
                  <Image
                    src="/Shivani Vatika 11/gate.webp"
                    alt="Shivani Vatika 11th Township near Renwal and Phulera"
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-bold text-slate-950">
                    {isHindi ? 'तुरंत कब्जा व रजिस्ट्री' : 'Ongoing / Ready Possession'}
                  </div>
                  <div className="absolute right-3 bottom-3 rounded-full border border-black/40 bg-slate-950/80 px-3 py-1 text-[11px] font-semibold text-amber-300 backdrop-blur-md">
                    {isHindi ? '~34 किमी फुलेरा से' : '~34 km from Phulera'}
                  </div>
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-amber-400 uppercase">
                    <Navigation size={13} />
                    <span>{isHindi ? 'फ्लैगशिप टाउनशिप' : 'Direct Highway Transit Connect'}</span>
                  </div>
                  <h3 className="mt-2 font-serif text-2xl font-bold text-white sm:text-3xl">
                    Shivani Vatika 11th (Harsholi)
                  </h3>
                  <p className="mt-1 text-xs text-amber-300">
                    {isHindi
                      ? 'जयपुर - खाटू श्याम जी हाईवे (रीको रेनवाल के समीप)'
                      : 'Jaipur - Khatu Shyam Ji Highway, Adjacent to RIICO Renwal'}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-slate-300 sm:text-sm">
                    {isHindi ? (
                      <>
                        फुलेरा जंक्शन से मात्र 35 मिनट की दूरी पर 11.5 बीघा (लगभग 30,480 वर्ग गज)
                        में विस्तृत 230 आवासीय भूखंडों की सुव्यवस्थित टाउनशिप। 80 से 250 वर्ग गज के
                        तुरंत निर्माण योग्य प्लॉट्स।
                      </>
                    ) : (
                      <>
                        Located just ~34 km (~35 mins) from Phulera Junction, Shivani Vatika 11th
                        spans 11.5 Bigha (approx. 30,480 sq. yds.) featuring 230 master-planned
                        residential plots (80 to 250 sq. yds.) with complete boundary demarcation.
                      </>
                    )}
                  </p>

                  <div className="mt-5 space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                      <span>
                        {isHindi
                          ? 'रीको इंडस्ट्रियल एरिया (1 किमी / 2 मिनट) और रेनवाल स्टेशन (7 किमी / 5 मिनट)'
                          : '1 km (2 mins) to RIICO Industrial Area & 7 km (5 mins) to Renwal Station'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                      <span>
                        {isHindi
                          ? 'श्री खाटू श्याम जी मंदिर तक मात्र 20-25 मिनट की सुगम ड्राइव'
                          : 'Smooth 20-25 minutes drive to Shri Khatu Shyam Ji Temple'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                      <span>
                        {isHindi
                          ? '30 व 40 फीट चौड़ी इंटरलॉकिंग पक्की सड़कें व 24/7 सुरक्षा'
                          : '30 & 40 ft interlocked roads, grand entry arch & 24/7 gated security'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <Link
                      href="/projects/shivani-vatika-11th"
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 uppercase transition-all hover:bg-amber-400"
                    >
                      <span>{isHindi ? 'टाउनशिप देखें' : 'View Project Details'}</span>
                      <ArrowRight size={14} />
                    </Link>

                    <Link
                      href="/areas/phulera-smart-city"
                      className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-bold text-white transition-all hover:border-amber-400/50 hover:bg-white/10"
                    >
                      <Compass size={14} className="text-amber-400" />
                      <span>{isHindi ? 'फुलेरा एरिया गाइड' : 'Phulera Area Guide'}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Distance & Commute Table */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 text-center">
              <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
                {isHindi ? 'दूरी एवं कनेक्टिविटी तालिका' : 'Strategic Transit Matrix'}
              </span>
              <h2 className="mt-2 font-serif text-2xl font-bold text-white sm:text-4xl">
                {isHindi
                  ? 'फुलेरा जंक्शन से प्रमुख केंद्रों की दूरी'
                  : 'Distance & Commute Time from Phulera'}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-xs text-slate-300 sm:text-sm">
                {isHindi
                  ? 'फुलेरा जंक्शन एवं DMIC कॉरिडोर से जयपुर, अजमेर, रीको एवं तीर्थ स्थलों की वास्तविक दूरी एवं समय।'
                  : 'Verified road and rail commute times connecting Phulera Smart City to key industrial hubs, expressways, and central Jaipur.'}
              </p>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-white/10 bg-white/[0.04] text-[11px] font-bold tracking-wider text-amber-300 uppercase sm:text-xs">
                    <tr>
                      <th className="px-4 py-4 sm:px-6">
                        {isHindi ? 'गंतव्य / लैंडमार्क' : 'Destination / Landmark'}
                      </th>
                      <th className="px-4 py-4 sm:px-6">{isHindi ? 'दूरी' : 'Distance'}</th>
                      <th className="px-4 py-4 sm:px-6">{isHindi ? 'समय' : 'Drive Time'}</th>
                      <th className="hidden px-4 py-4 sm:px-6 md:table-cell">
                        {isHindi ? 'रूट / विशेषता' : 'Route / Infrastructure'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {COMMUTE_MATRIX.map((item, index) => (
                      <tr key={index} className="transition-colors hover:bg-white/[0.02]">
                        <td className="px-4 py-4 font-medium text-white sm:px-6">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="shrink-0 text-amber-400" />
                            <span>{isHindi ? item.landmarkHi : item.landmark}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-semibold text-amber-300 sm:px-6">
                          {item.distance}
                        </td>
                        <td className="px-4 py-4 text-slate-300 sm:px-6">
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs">
                            <Clock size={12} className="text-amber-400" />
                            <span>{item.time}</span>
                          </div>
                        </td>
                        <td className="hidden px-4 py-4 text-xs text-slate-400 sm:px-6 md:table-cell">
                          <div>{isHindi ? item.routeHi : item.route}</div>
                          <div className="text-[11px] text-slate-500">
                            {isHindi ? item.highlightHi : item.highlight}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Accordion */}
      <section className="border-t border-white/10 bg-slate-900/40 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center">
              <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
                {isHindi ? 'सामान्य प्रश्न एवं उत्तर' : 'Frequently Asked Questions'}
              </span>
              <h2 className="mt-2 font-serif text-2xl font-bold text-white sm:text-4xl">
                {isHindi
                  ? 'फुलेरा में ज़मीन खरीदने से जुड़े महत्वपूर्ण सवाल'
                  : 'Questions About Buying Land in Phulera'}
              </h2>
              <p className="mt-2 text-xs text-slate-300 sm:text-sm">
                {isHindi
                  ? 'निवेश सुरक्षा, रजिस्ट्री प्रक्रिया, और DMIC विकास से संबंधित सभी आवश्यक जानकारियां।'
                  : 'Clear answers on legal conversion, investment viability, commute routes, and registry papers.'}
              </p>
            </div>

            {/* Client Accordion */}
            <PhuleraFaqAccordion items={faqItems} isHindi={isHindi} />
          </div>
        </div>
      </section>

      {/* Lead Capture & WhatsApp Brochure CTA Section */}
      <section className="relative overflow-hidden border-t border-amber-500/20 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-16 sm:py-24">
        <div className="pointer-events-none absolute -right-32 -bottom-32 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
              {/* Left Column: WhatsApp Brochure & Perks */}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>
                    {isHindi ? 'तत्काल दर सूची एवं लेआउट' : 'Instant Rates & Layout Plan'}
                  </span>
                </div>

                <h2 className="mt-3 font-serif text-2xl font-bold text-white sm:text-4xl">
                  {isHindi ? (
                    <>फुलेरा स्मार्ट सिटी ब्रोशर व्हाट्सएप पर पाएं</>
                  ) : (
                    <>Get Phulera Corridor Brochure on WhatsApp</>
                  )}
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {isHindi ? (
                    <>
                      फुलेरा और जयपुर कॉरिडोर की प्रमाणित दरें, उपलब्ध प्लॉट्स का लेआउट मैप और 100%
                      स्पष्ट कानूनी दस्तावेज सीधे अपने मोबाइल पर प्राप्त करें।
                    </>
                  ) : (
                    <>
                      Download verified site layout maps, official BSP pricing, and legal approval
                      certificates directly on your WhatsApp in seconds.
                    </>
                  )}
                </p>

                <div className="mt-6 space-y-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={16} className="shrink-0 text-emerald-400" />
                    <span>
                      {isHindi
                        ? '100% सत्यापित दस्तावेज एवं जीरो स्पैम गारंटी'
                        : '100% verified legal papers & zero spam guarantee'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={16} className="shrink-0 text-emerald-400" />
                    <span>
                      {isHindi
                        ? 'जयपुर से निःशुल्क एसी कैब साइट विजिट सुविधा'
                        : 'Complimentary chauffeured AC cab site visit from Jaipur'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={16} className="shrink-0 text-emerald-400" />
                    <span>
                      {isHindi
                        ? 'सीधे डेवलपर से संपर्क — बिना किसी बिचौलिए या ब्रोकरेज के'
                        : 'Direct developer booking with zero third-party brokerage fees'}
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <PhuleraBrochureButton variant="whatsapp">
                    <FileDown size={16} />
                    <span>
                      {isHindi
                        ? 'व्हाट्सएप पर ब्रोशर प्राप्त करें'
                        : 'Download Brochure on WhatsApp'}
                    </span>
                  </PhuleraBrochureButton>

                  <a
                    href="tel:+917300007643"
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-md transition-colors hover:border-amber-400/50 hover:bg-white/10"
                  >
                    <PhoneCall size={16} className="text-amber-400" />
                    <span>+91-73000-07643</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Interactive Lead Capture Form */}
              <div className="rounded-3xl border border-amber-500/30 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-md sm:p-8">
                <div className="mb-5">
                  <h3 className="font-serif text-xl font-bold text-white">
                    {isHindi ? 'साइट विजिट व रेट लिस्ट इंक्वायरी' : 'Book Site Visit or Callback'}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {isHindi
                      ? 'अपना विवरण भरें, हमारे वरिष्ठ निवेश सलाहकार 15 मिनट में संपर्क करेंगे।'
                      : 'Fill details below to get direct consultation from our Phulera advisor.'}
                  </p>
                </div>

                <PhuleraLeadCaptureForm isHindi={isHindi} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Free Site Visit Cab Pill */}
      <SiteVisitPill
        areaName="Phulera DMIC Smart City"
        defaultPickup="Jaipur City or Phulera Junction"
      />
    </div>
  );
}
