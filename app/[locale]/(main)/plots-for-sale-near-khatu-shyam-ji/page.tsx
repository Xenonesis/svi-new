import type { Metadata } from 'next';
import Image from 'next/image';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/src/i18n/navigation';
import {
  MapPin,
  CheckCircle2,
  ShieldCheck,
  FileDown,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Clock,
  Train,
  Building2,
  ChevronDown,
  Landmark,
  Compass,
  TrendingUp,
  FileText,
  Scale,
  Award,
} from 'lucide-react';
import { SITE_URL, buildAlternates, localizedUrl } from '@/src/lib/seo';
import {
  BreadcrumbSchema,
  FAQSchema,
  PlaceAndAreaSchema,
  RealEstateListingSchema,
} from '@/src/components/common/Schema';
import SiteVisitPill from '@/src/components/common/SiteVisitPill';

export const revalidate = 86400;

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isHindi = locale === 'hi';

  const title = isHindi
    ? 'खाटू श्याम जी के पास आवासीय प्लॉट्स | जयपुर खाटू हाईवे प्लॉट्स | SVI Infra'
    : 'Plots for Sale Near Khatu Shyam Ji | Residential Plots on Highway | SVI Infra';

  const description = isHindi
    ? 'खाटू श्याम जी मंदिर से मात्र 20-25 मिनट की दूरी पर 4-लेन जयपुर-खाटू हाईवे पर 100% स्पष्ट रजिस्ट्री आवासीय प्लॉट्स। शिवानी वाटिका 11th में 80 से 250 वर्ग गज के 230 सुनियोजित प्लॉट्स, 4.5+ करोड़ तीर्थयात्री फुटफॉल कॉरिडोर और फ्री कैब साइट विजिट।'
    : 'Buy verified residential plots for sale near Khatu Shyam Ji on the 4-lane Jaipur-Khatu Highway corridor. Just 20-25 mins from temple, featuring Shivani Vatika 11th with 230 master-planned plots (80-250 sq. yds.), clear 90-A registry, and free cab site visits.';

  return {
    title,
    description,
    keywords: [
      'plots for sale near Khatu Shyam Ji',
      'residential plots near Khatu Shyam Ji',
      'plots on Jaipur Khatu Shyam Ji Highway',
      'plots near Khatu Shyam Ji Temple',
      'government approved plots near Khatu Shyam Ji',
      'Shivani Vatika 11th',
      'Harsholi Renwal plots',
      'plots near Renwal railway station',
      'SVI Infra Solutions',
    ],
    alternates: buildAlternates('/plots-for-sale-near-khatu-shyam-ji', locale),
    openGraph: {
      title,
      description,
      url: localizedUrl('/plots-for-sale-near-khatu-shyam-ji', locale),
      locale: isHindi ? 'hi_IN' : 'en_IN',
      images: [{ url: `${SITE_URL}/Shivani Vatika 11/gate.webp`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/Shivani Vatika 11/gate.webp`],
    },
  };
}

interface FAQItem {
  question: string;
  answer: string;
}

const KHATU_FAQS_EN: FAQItem[] = [
  {
    question: 'How far are these residential plots from Shree Khatu Shyam Ji Temple?',
    answer:
      'Shivani Vatika 11th at Harsholi is located just 20 to 25 minutes drive (approximately 25 km) from Shree Khatu Shyam Ji Mandir via the smooth 4-lane Jaipur to Khatu Shyam Ji Highway. Devotees and investors enjoy direct, congestion-free highway access straight toward the holy shrine.',
  },
  {
    question:
      'Are the plots on Jaipur - Khatu Shyam Ji Highway government approved and registry ready?',
    answer:
      'Yes, 100% of the plots at Shivani Vatika 11th are legally converted under Section 90-A of the Rajasthan Land Revenue Act for residential use. Each plot comes with verified Jamabandi land records, clean government revenue mutation (नामांतरण), and immediate individual sub-registrar registry.',
  },
  {
    question: 'What plot sizes and configurations are available near Khatu Shyam Ji?',
    answer:
      'The township offers demarcated residential plots ranging from 80 sq. yds. to 250 sq. yds. (including 80, 100, 150, 200, and 250 sq. yd. units) in an 11.5 Bigha (approx. 30,480 sq. yds.) gated society of 230 master-planned plots, served by 30-foot and 40-foot wide paved interlocked roads.',
  },
  {
    question: 'What is the starting price for residential plots near Khatu Shyam Ji Highway?',
    answer:
      'Residential plots start at an accessible price point from ₹ 15 Lakhs* for 80 sq. yd. units. SVI Infra Solutions provides transparent pricing, flexible 12 to 24-month interest-free monthly installment schemes, and comprehensive bank loan facilitation.',
  },
  {
    question:
      'Why is the Jaipur–Khatu Shyam Ji Highway corridor experiencing rapid property appreciation?',
    answer:
      'The corridor benefits from massive pilgrimage footfall exceeding 4.5 crore annual devotees, the ongoing 4-lane highway expansion, and its strategic location adjacent to the 64-acre operational RIICO Industrial Area Renwal (1 km) and corporate logistics hubs (Adani and Ambani warehousing). These factors generate 15% to 20% annual capital appreciation and strong rental yield demand.',
  },
  {
    question:
      'How far is Renwal Railway Station and RIICO Industrial Area from Shivani Vatika 11th?',
    answer:
      'The project is situated just 1 km (~2 minutes drive) from the RIICO Industrial Area Renwal and 7 km (~5 minutes drive) from Renwal Railway Station (North Western Railway), offering direct express train transit to Jaipur Junction in just 35 minutes.',
  },
  {
    question: 'How do I book a free cab site visit from Jaipur?',
    answer:
      'SVI Infra Solutions provides complimentary doorstep chauffeured private AC cab pickup and drop from anywhere in Jaipur directly to Shivani Vatika 11th and back. You can reserve your visit by clicking the "Book Free Site Visit Cab" button on this page or contacting our sales desk at +91-73000-07643.',
  },
];

const KHATU_FAQS_HI: FAQItem[] = [
  {
    question: 'खाटू श्याम जी मंदिर से ये आवासीय प्लॉट्स कितनी दूरी पर हैं?',
    answer:
      'हरसोली स्थित शिवानी वाटिका 11th, श्री खाटू श्याम जी मंदिर से 4-लेन जयपुर-खाटू हाईवे के माध्यम से मात्र 20 से 25 मिनट (लगभग 25 किमी) की ड्राइव पर स्थित है। यह बिना किसी जाम के सुगम और सीधा आवागमन प्रदान करता है।',
  },
  {
    question:
      'क्या जयपुर-खाटू श्याम जी हाईवे पर स्थित प्लॉट्स सरकारी स्वीकृत और रजिस्ट्री योग्य हैं?',
    answer:
      'जी हाँ, शिवानी वाटिका 11th के 100% प्लॉट्स राजस्थान भू-राजस्व अधिनियम की धारा 90-A के तहत आवासीय प्रयोजन हेतु पूर्णतः रूपांतरित हैं। सभी भूखंडों की स्पष्ट जमाबंदी, सरकारी नामांतरण और उप-पंजीयक कार्यालय में तुरंत पक्की रजिस्ट्री उपलब्ध है।',
  },
  {
    question: 'खाटू श्याम जी के पास कौन-से साइज के प्लॉट्स उपलब्ध हैं?',
    answer:
      'टाउनशिप में 80 वर्ग गज से 250 वर्ग गज (80, 100, 150, 200 व 250 वर्ग गज) तक के सुनियोजित आवासीय प्लॉट्स उपलब्ध हैं। यह 11.5 बीघा (लगभग 30,480 वर्ग गज) में 230 प्लॉट्स की भव्य गेटेड टाउनशिप है जिसमें 30 और 40 फीट चौड़ी पक्की इंटरलॉकिंग सड़कें हैं।',
  },
  {
    question: 'खाटू श्याम जी हाईवे पर आवासीय प्लॉट्स की शुरुआती कीमत क्या है?',
    answer:
      'शिवानी वाटिका 11th में 80 वर्ग गज के प्लॉट्स ₹ 15 लाख* से शुरू होते हैं। पारदर्शी कागजात के साथ SVI Infra द्वारा 12 से 24 महीने की आसान ब्याज-मुक्त किस्तों (EMI) और बैंक लोन की पूरी सहायता प्रदान की जाती है।',
  },
  {
    question:
      'जयपुर-खाटू श्याम जी हाईवे कॉरिडोर में प्रॉपर्टी की कीमतें तेजी से क्यों बढ़ रही हैं?',
    answer:
      'खाटू धाम में प्रतिवर्ष 4.5+ करोड़ श्रद्धालुओं का आगमन, 4-लेन हाईवे का विस्तार, 1 किमी पर 64 एकड़ में विस्तृत रीको इंडस्ट्रियल एरिया, 5 मिनट पर रेणवाल रेलवे स्टेशन और पास में अडानी-अंबानी वेयरहाउसिंग हब इस कॉरिडोर को 15-20% वार्षिक पूंजीगत वृद्धि और मजबूत रेंटल डिमांड प्रदान करते हैं।',
  },
  {
    question: 'शिवानी वाटिका 11th से रेणवाल रेलवे स्टेशन और रीको इंडस्ट्रियल एरिया कितना दूर है?',
    answer:
      'प्रोजेक्ट रीको इंडस्ट्रियल एरिया से मात्र 1 किमी (2 मिनट) और रेणवाल रेलवे स्टेशन से केवल 7 किमी (5 मिनट) की दूरी पर स्थित है, जहाँ से जयपुर जंक्शन के लिए केवल 35 मिनट की नियमित ट्रेन सुविधा उपलब्ध है।',
  },
  {
    question: 'जयपुर से फ्री कैब साइट विजिट कैसे बुक करें?',
    answer:
      'SVI Infra Solutions जयपुर में आपके घर से प्रोजेक्ट साइट तक और वापस आने के लिए पूर्णतः निःशुल्क प्राइवेट एसी कैब की सुविधा देता है। आप "फ्री कैब साइट विजिट" बटन पर क्लिक करके या हमारे फोन नंबर +91-73000-07643 पर संपर्क करके अपनी विजिट बुक कर सकते हैं।',
  },
];

interface TransitNode {
  destination: string;
  destinationHi: string;
  time: string;
  distance: string;
  route: string;
  routeHi: string;
  icon: typeof Landmark;
  badge: string;
  badgeHi: string;
  desc: string;
  descHi: string;
}

const TRANSIT_MATRIX: TransitNode[] = [
  {
    destination: 'Shree Khatu Shyam Ji Mandir',
    destinationHi: 'श्री खाटू श्याम जी मंदिर',
    time: '20–25 Mins',
    distance: '~25 km',
    route: '4-Lane Highway Corridor',
    routeHi: '4-लेन सीधा मुख्य हाईवे',
    icon: Landmark,
    badge: 'Spiritual Epicenter',
    badgeHi: 'पवित्र तीर्थ धाम',
    desc: 'Direct four-lane expressway access with 4.5+ crore annual pilgrims driving year-round commercial and hospitality demand.',
    descHi:
      '4-लेन एक्सप्रेसवे द्वारा सीधा मार्ग, जहां 4.5+ करोड़ वार्षिक श्रद्धालुओं का आवागमन कमर्शियल व हॉस्पिटैलिटी मांग को बढ़ाता है।',
  },
  {
    destination: 'RIICO Industrial Area (Renwal)',
    destinationHi: 'रीको इंडस्ट्रियल एरिया (रेणवाल)',
    time: '2 Mins',
    distance: '1 km',
    route: 'Direct Highway Link',
    routeHi: 'सीधा हाईवे संपर्क',
    icon: Building2,
    badge: 'Manufacturing Hub',
    badgeHi: 'औद्योगिक विकास केंद्र',
    desc: '64+ acres operational industrial zone with 155+ planned units driving permanent employment and local housing demand.',
    descHi:
      '64+ एकड़ में सक्रिय रीको हब, 155+ इकाइयों के साथ हजारों रोजगार और निरंतर रेंटल मांग सुनिश्चित करता है।',
  },
  {
    destination: 'Renwal Railway Station (RNW)',
    destinationHi: 'रेणवाल रेलवे स्टेशन (RNW)',
    time: '5 Mins',
    distance: '7 km',
    route: 'Kishangarh Renwal Road',
    routeHi: 'किशनगढ़ रेणवाल मुख्य मार्ग',
    icon: Train,
    badge: 'Express Rail Transit',
    badgeHi: 'एक्सप्रेस रेल कनेक्टिविटी',
    desc: 'Direct North Western Railway station on the Phulera–Ringas–Rewari line with 35-min daily trains to Jaipur Junction.',
    descHi:
      'उत्तर पश्चिम रेलवे का मुख्य स्टेशन; जयपुर जंक्शन मात्र 35 मिनट में और दिल्ली के लिए नियमित सुपरफास्ट ट्रेनें।',
  },
  {
    destination: 'Corporate Warehousing Hubs',
    destinationHi: 'अंबानी एवं अडानी वेयरहाउसिंग हब',
    time: '6 Mins',
    distance: '~7 km',
    route: 'Harsholi Logistics Belt',
    routeHi: 'हरसोली लॉजिस्टिक्स बेल्ट',
    icon: Compass,
    badge: 'Mega Logistics',
    badgeHi: 'नेशनल सप्लाई चेन',
    desc: 'National corporate warehousing and supply-chain logistics centers driving institutional land valuations in the vicinity.',
    descHi:
      'राष्ट्रीय स्तर के आधुनिक वेयरहाउसिंग और सप्लाई-चेन हब, जो आसपास की भूमि के पूंजीगत मूल्य में भारी वृद्धि कर रहे हैं।',
  },
  {
    destination: 'Phulera Junction & DMIC Belt',
    destinationHi: 'फुलेरा जंक्शन एवं DMIC कॉरिडोर',
    time: '35 Mins',
    distance: '~34 km',
    route: 'State Highway 19A Link',
    routeHi: 'स्टेट हाईवे 19A लिंक',
    icon: TrendingUp,
    badge: 'Freight Corridor',
    badgeHi: 'वेस्टर्न DFC जंक्शन',
    desc: 'Major Western Dedicated Freight Corridor (DFC) rail junction and proposed multi-modal smart logistics city.',
    descHi:
      'वेस्टर्न डेडिकेटेड फ्रेट कॉरिडोर (DFC) का प्रमुख रेलवे जंक्शन और उभरता हुआ स्मार्ट औद्योगिक लॉजिस्टिक्स हब।',
  },
  {
    destination: 'Jaipur City (Ring Road / Bypass)',
    destinationHi: 'जयपुर शहर (रिंग रोड / बाईपास)',
    time: '45 Mins',
    distance: 'Direct Highway',
    route: 'Jaipur-Khatu 4-Lane Highway',
    routeHi: 'जयपुर-खाटू 4-लेन हाईवे',
    icon: MapPin,
    badge: 'Capital Metro Access',
    badgeHi: 'राजधानी जयपुर संपर्क',
    desc: 'Rapid signal-free highway route connecting into Jaipur’s arterial road networks, hospitals, and educational centers.',
    descHi:
      'सुगम फोर-लेन हाईवे मार्ग जो सीधे जयपुर रिंग रोड, मेडिकल कॉलेज, अस्पताल और प्रमुख व्यावसायिक केंद्रों से जोड़ता है।',
  },
];

export default async function PlotsNearKhatuShyamJiPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isHindi = locale === 'hi';
  const faqs = isHindi ? KHATU_FAQS_HI : KHATU_FAQS_EN;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Structured Data Schemas */}
      <BreadcrumbSchema
        items={[
          { name: 'Home', item: '/' },
          { name: isHindi ? 'कॉरिडोर्स' : 'Corridors', item: '/areas/khatu-shyam-highway' },
          {
            name: isHindi ? 'खाटू श्याम जी के पास प्लॉट्स' : 'Plots Near Khatu Shyam Ji',
            item: '/plots-for-sale-near-khatu-shyam-ji',
          },
        ]}
      />

      <PlaceAndAreaSchema
        name={
          isHindi
            ? 'जयपुर - खाटू श्याम जी हाईवे कॉरिडोर'
            : 'Jaipur to Khatu Shyam Ji Highway Corridor'
        }
        description={
          isHindi
            ? 'खाटू श्याम जी मंदिर के पास 4-लेन राजमार्ग पर आवासीय एवं कमर्शियल प्लॉटेड टाउनशिप कॉरिडोर।'
            : 'High-growth plotted residential township corridor on the Jaipur to Khatu Shyam Ji 4-lane highway near Harsholi and Renwal.'
        }
        url={localizedUrl('/plots-for-sale-near-khatu-shyam-ji', locale)}
        latitude={27.130247}
        longitude={75.422285}
        addressLocality="Harsholi, Kishangarh Renwal"
        addressRegion="Rajasthan"
        postalCode="303603"
        image={`${SITE_URL}/Shivani Vatika 11/gate.webp`}
      />

      <RealEstateListingSchema
        name="Shivani Vatika 11th - Plots Near Khatu Shyam Ji"
        description="Gated residential plotted society of 230 plots (80 to 250 sq. yds.) on Jaipur - Khatu Shyam Ji Highway at Harsholi, 20-25 mins from temple."
        image="/Shivani Vatika 11/gate.webp"
        location="Harsholi, Jaipur to Khatu Shyam Ji Highway"
        status="InStock"
        price="1500000"
        url={localizedUrl('/plots-for-sale-near-khatu-shyam-ji', locale)}
      />

      <FAQSchema questions={faqs} />

      {/* 1. Hero Section */}
      <section className="relative overflow-hidden border-b border-amber-500/20 pt-28 pb-16 sm:pt-36 sm:pb-24">
        {/* Ambient Gold Glow Accents */}
        <div className="pointer-events-none absolute -top-48 -right-48 h-[32rem] w-[32rem] rounded-full bg-amber-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 -left-48 h-[28rem] w-[28rem] rounded-full bg-amber-600/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/5 blur-3xl" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            {/* Corridor Category Pill */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-amber-300 uppercase backdrop-blur-md">
              <Sparkles size={14} className="text-amber-400" />
              <span>
                {isHindi
                  ? 'श्री खाटू श्याम जी तीर्थ एवं औद्योगिक विकास कॉरिडोर'
                  : 'Spiritual & High-Growth Commercial Corridor'}
              </span>
            </div>

            {/* High-Impact H1 */}
            <h1 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:leading-[1.15]">
              {isHindi ? (
                <>खाटू श्याम जी हाईवे पर आवासीय प्लॉट्स की बिक्री</>
              ) : (
                <>Residential Plots for Sale Near Khatu Shyam Ji Highway</>
              )}
            </h1>

            {/* Subtitle with High-Intent Context */}
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
              {isHindi ? (
                <>
                  खाटू श्याम जी मंदिर से मात्र 20-25 मिनट की दूरी पर 4-लेन मुख्य हाईवे पर 100%
                  स्पष्ट रजिस्ट्री आवासीय प्लॉट्स। शिवानी वाटिका 11th में 80 से 250 वर्ग गज के 230
                  सुनियोजित भूखंड, पक्की सड़कें, 24/7 सुरक्षा और निःशुल्क एसी कैब साइट विजिट।
                </>
              ) : (
                <>
                  Secure legally verified residential plots along the fast-appreciating Jaipur to
                  Khatu Shyam Ji Highway (Harsholi). Located only 20–25 minutes from the holy temple
                  with direct 4-lane highway frontage, gated township infrastructure, and 100%
                  individual sub-registrar registry.
                </>
              )}
            </p>

            {/* Quick Highlights Pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              {[
                {
                  icon: Landmark,
                  text: isHindi ? 'मंदिर से 20–25 मिनट' : '20–25 Mins to Temple',
                },
                {
                  icon: MapPin,
                  text: isHindi ? '4-लेन मुख्य हाईवे फ्रंट' : '4-Lane Highway Frontage',
                },
                {
                  icon: Building2,
                  text: isHindi ? '80–250 वर्ग गज प्लॉट्स' : '80–250 Sq. Yds. Plots',
                },
                {
                  icon: ShieldCheck,
                  text: isHindi ? '100% पक्की रजिस्ट्री (90-A)' : '100% Registry Ready (90-A)',
                },
              ].map((pill, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-amber-200 shadow-sm backdrop-blur-md"
                >
                  <pill.icon size={15} className="shrink-0 text-amber-400" />
                  <span>{pill.text}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/projects/shivani-vatika-11th"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-3.5 text-xs font-bold tracking-wider text-slate-950 uppercase shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/30"
              >
                <span>
                  {isHindi ? 'शिवानी वाटिका 11th विवरण देखें' : 'Explore Shivani Vatika 11th'}
                </span>
                <ArrowRight size={16} />
              </Link>

              <a
                href="/Shivani Vatika 11/ShivaniVatika 11.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-md transition-colors hover:border-amber-400/50 hover:bg-white/10"
              >
                <FileDown size={16} className="text-amber-400" />
                <span>{isHindi ? 'डाउनलोड ब्रोशर PDF' : 'Download Brochure PDF'}</span>
              </a>

              <a
                href="tel:+917300007643"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-md transition-colors hover:border-amber-400/50 hover:bg-white/10"
              >
                <PhoneCall size={16} className="text-amber-400" />
                <span>+91-73000-07643</span>
              </a>
            </div>

            {/* Key Highway Corridor Stats */}
            <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  label: isHindi ? '4.5+ करोड़' : '4.5+ Crore',
                  sub: isHindi ? 'वार्षिक तीर्थयात्री फुटफॉल' : 'Annual Temple Pilgrims',
                },
                {
                  label: isHindi ? '230 प्लॉट्स' : '230 Plots',
                  sub: isHindi ? 'शिवानी वाटिका 11th' : 'Shivani Vatika 11th',
                },
                {
                  label: isHindi ? '11.5 बीघा' : '11.5 Bigha',
                  sub: isHindi ? '~30,480 वर्ग गज टाउनशिप' : '~30,480 Sq. Yds. Layout',
                },
                {
                  label: isHindi ? '100% स्पष्ट' : '100% Clear',
                  sub: isHindi ? '90-A व उप-पंजीयक रजिस्ट्री' : '90-A & Sub-Registrar Title',
                },
              ].map((c, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center backdrop-blur-sm transition-all hover:border-amber-500/30"
                >
                  <div className="font-serif text-xl font-bold text-amber-300 sm:text-2xl">
                    {c.label}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{c.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Strategic Corridor Growth Section */}
      <section className="relative border-b border-white/10 bg-slate-900/40 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
              {isHindi ? 'रणनीतिक विकास कॉरिडोर' : 'Strategic Growth Engines'}
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
              {isHindi
                ? 'खाटू श्याम जी हाईवे कॉरिडोर में निवेश क्यों करें?'
                : 'Why Invest in Plots on Jaipur–Khatu Shyam Ji Highway?'}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              {isHindi ? (
                <>
                  यह कॉरिडोर धार्मिक पर्यटन, तीव्र औद्योगिक विस्तार और 4-लेन राजमार्ग कनेक्टिविटी का
                  एक अद्वितीय केंद्र बन चुका है, जो राजस्थान में सबसे तेज पूंजीगत वृद्धि दर्ज कर रहा
                  है।
                </>
              ) : (
                <>
                  The Harsholi–Renwal corridor represents Rajasthan’s most compelling intersection
                  of high-volume religious tourism, manufacturing expansion, and dedicated
                  multi-modal transit.
                </>
              )}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Landmark,
                title: isHindi ? '4.5+ करोड़ तीर्थयात्री' : '4.5+ Crore Devotees',
                subtitle: isHindi ? 'स्थायी हॉस्पिटैलिटी मांग' : 'Perpetual Pilgrimage Footfall',
                text: isHindi
                  ? 'श्री खाटू श्याम जी धाम के लिए निरंतर बढ़ता श्रद्धालु प्रवाह धर्मशालाओं, अतिथि गृहों, भोजनालयों और आवासीय कॉलोनियों के लिए भारी मांग पैदा करता है।'
                  : 'Unprecedented round-the-year pilgrimage traffic to Khatu Shyam Dham creates massive sustained demand for guest houses, holiday homes, dharamshalas, and residential rentals.',
              },
              {
                icon: TrendingUp,
                title: isHindi ? '4-लेन हाईवे विस्तार' : '4-Lane Highway Expansion',
                subtitle: isHindi ? 'सुगम एक्सप्रेसवे ट्रांजिट' : 'Signal-Free Mobility',
                text: isHindi
                  ? 'जयपुर से खाटू श्याम जी मार्ग को आधुनिक 4-लेन एक्सप्रेसवे में बदले जाने से मंदिर तक 20-25 मिनट और जयपुर तक मात्र 45 मिनट में सुगम यात्रा संभव है।'
                  : 'Upgradation into a high-capacity 4-lane expressway cuts travel times to 20-25 minutes to Khatu Dham and 45 minutes to Jaipur bypass, driving immediate commercial appreciation.',
              },
              {
                icon: Building2,
                title: isHindi ? 'रीको व वेयरहाउसिंग हब' : 'RIICO & Logistics Belt',
                subtitle: isHindi ? '1 किमी दूरी पर औद्योगिक क्षेत्र' : '1 km to 64-Acre RIICO',
                text: isHindi
                  ? 'रीको इंडस्ट्रियल एरिया रेणवाल (155+ इकाइयां) और पास में अडानी-अंबानी वेयरहाउसिंग हब स्थानीय रोजगार और निरंतर आवासीय प्लॉटिंग मांग को गति दे रहे हैं।'
                  : 'Proximity to 64-acre operational RIICO Industrial Area Renwal and corporate logistics parks (Adani & Ambani) secures permanent tenant occupancy and job creation.',
              },
              {
                icon: Award,
                title: isHindi ? '15–20% वार्षिक वृद्धि' : '15–20% Capital Growth',
                subtitle: isHindi ? 'सुरक्षित उच्च-रिटर्न निवेश' : 'High-Appreciation Corridor',
                text: isHindi
                  ? 'जयपुर के सैचुरेटेड उपनगरों की तुलना में किफायती शुरुआती दरों (₹ 15 लाख*) पर स्पष्ट रजिस्ट्री प्लॉट्स, जो 15% से 20% तक सालाना मूल्य वृद्धि दे रहे हैं।'
                  : 'Accessible entry prices starting around ₹ 15 Lakhs* deliver superior annual ROI compared to overvalued city suburbs, backed by freehold ownership and bank loans.',
              },
            ].map((card, i) => (
              <div
                key={i}
                className="group rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl transition-all duration-300 hover:border-amber-500/40 hover:bg-slate-900/90 hover:shadow-2xl hover:shadow-amber-500/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 transition-colors group-hover:bg-amber-500 group-hover:text-slate-950">
                  <card.icon size={24} />
                </div>
                <div className="mt-5 font-serif text-lg font-bold text-white transition-colors group-hover:text-amber-200">
                  {card.title}
                </div>
                <div className="mt-0.5 text-xs font-semibold text-amber-400/90">
                  {card.subtitle}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-300 sm:text-sm">
                  {card.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Project Card: Shivani Vatika 11th */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-6 shadow-2xl sm:p-10">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
              {/* Project Image & Visual Badges */}
              <div className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl bg-slate-950 lg:col-span-6">
                <Image
                  src="/Shivani Vatika 11/gate.webp"
                  alt="Shivani Vatika 11th Entrance Gate on Jaipur Khatu Shyam Ji Highway"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  priority
                />
                <div className="absolute top-3 left-3 z-10 rounded-full bg-emerald-500 px-3.5 py-1 text-xs font-bold text-slate-950 shadow-md">
                  {isHindi ? 'कब्जा उपलब्ध (Ready)' : 'Ready Possession'}
                </div>
                <div className="absolute top-3 right-3 z-10 rounded-full border border-amber-400/40 bg-slate-950/80 px-3 py-1 text-[11px] font-bold text-amber-300 backdrop-blur-md">
                  {isHindi ? 'प्रारंभिक ₹ 15 लाख*' : 'From ₹ 15 Lakhs*'}
                </div>
                <div className="absolute right-3 bottom-3 left-3 z-10 rounded-xl border border-white/10 bg-slate-950/85 p-2.5 text-center backdrop-blur-md">
                  <div className="text-[11px] font-semibold text-amber-300">
                    {isHindi
                      ? '11.5 बीघा • 230 सुनियोजित आवासीय प्लॉट्स • हरसोली'
                      : '11.5 Bigha • 230 Master-Planned Residential Plots • Harsholi'}
                  </div>
                </div>
              </div>

              {/* Project Content & Specs */}
              <div className="lg:col-span-6">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-amber-400 uppercase">
                  <ShieldCheck size={14} />
                  <span>
                    {isHindi ? 'फ्लैगशिप टाउनशिप प्रोजेक्ट' : 'Flagship Plotted Development'}
                  </span>
                </div>

                <h2 className="mt-2 font-serif text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                  {isHindi
                    ? 'शिवानी वाटिका 11th (हरसोली - खाटू हाईवे)'
                    : 'Shivani Vatika 11th (Harsholi)'}
                </h2>

                <p className="mt-3 text-xs leading-relaxed text-slate-300 sm:text-sm">
                  {isHindi ? (
                    <>
                      जयपुर-खाटू श्याम जी मुख्य राजमार्ग पर स्थित शिवानी वाटिका 11th, 11.5 बीघा
                      (लगभग 30,480 वर्ग गज) में फैली एक भव्य आवासीय टाउनशिप है। 80 से 250 वर्ग गज के
                      230 भूखंड, 30 व 40 फीट चौड़ी पक्की सड़कें, भव्य मुख्य द्वार, चारदीवारी और
                      तुरंत पक्की रजिस्ट्री।
                    </>
                  ) : (
                    <>
                      Spread over 11.5 Bigha (approx. 30,480 sq. yds.) directly on the Jaipur–Khatu
                      Shyam Ji Highway, Shivani Vatika 11th features 230 demarcated residential
                      plots from 80 to 250 sq. yds. with 30 & 40 ft interlocked paved roads, grand
                      entrance arch, perimeter boundary, and complete civic amenities.
                    </>
                  )}
                </p>

                {/* Key Spec Grid */}
                <div className="mt-6 grid grid-cols-2 gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-xs">
                  <div>
                    <span className="block text-[11px] text-slate-400">
                      {isHindi ? 'कुल क्षेत्रफल' : 'Total Area'}
                    </span>
                    <strong className="text-white">11.5 Bigha (~30,480 Sq. Yds.)</strong>
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400">
                      {isHindi ? 'प्लॉट साइज़' : 'Plot Sizes'}
                    </span>
                    <strong className="text-white">80, 100, 150, 200, 250 Sq. Yds.</strong>
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400">
                      {isHindi ? 'आंतरिक सड़कें' : 'Internal Roads'}
                    </span>
                    <strong className="text-white">30 & 40 Feet Wide Pavers</strong>
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400">
                      {isHindi ? 'स्वीकृति व रजिस्ट्री' : 'Legal Approval'}
                    </span>
                    <strong className="text-emerald-400">Section 90-A & Sub-Registrar</strong>
                  </div>
                </div>

                {/* Amenities Checklist */}
                <div className="mt-5 grid grid-cols-1 gap-2 text-xs text-slate-300 sm:grid-cols-2">
                  {[
                    isHindi ? 'भव्य प्रवेश द्वार व गार्ड रूम' : 'Grand Gate & Guard Room',
                    isHindi ? 'चारदीवारी व 24/7 सुरक्षा' : 'Perimeter Boundary & 24/7 Security',
                    isHindi ? 'भूमिगत पेयजल व बिजली खंभे' : 'Water Supply & Electricity Lines',
                    isHindi ? 'हरित सामुदायिक पार्क' : 'Green Landscaped Parks',
                  ].map((amenity, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href="/projects/shivani-vatika-11th"
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-xs font-bold text-slate-950 uppercase shadow-md transition-colors hover:from-amber-400 hover:to-amber-500"
                  >
                    <span>{isHindi ? 'टाउनशिप लेआउट देखें' : 'View Master Plan & Layout'}</span>
                    <ArrowRight size={14} />
                  </Link>

                  <a
                    href="/Shivani Vatika 11/ShivaniVatika 11.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/10"
                  >
                    <FileDown size={14} className="text-amber-400" />
                    <span>{isHindi ? 'ब्रोशर PDF' : 'Brochure PDF'}</span>
                  </a>

                  <a
                    href="https://wa.me/917300007643?text=Namaste%20SVI%20Infra,%20I%20am%20interested%20in%20residential%20plots%20at%20Shivani%20Vatika%2011th%20near%20Khatu%20Shyam%20Ji.%20Please%20share%20available%20plot%20inventory%20and%20price%20list."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-2.5 text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-500 hover:text-slate-950"
                  >
                    <span>WhatsApp Inquiry</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Distance & Connectivity Matrix */}
      <section className="border-t border-b border-white/10 bg-slate-900/50 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
              {isHindi ? 'सत्यापित ट्रांजिट व दूरी तालिका' : 'Verified Distance & Transit Matrix'}
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
              {isHindi
                ? 'शिवानी वाटिका 11th से प्रमुख स्थलों की दूरी'
                : 'Distance & Travel Time from Shivani Vatika 11th'}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-xs text-slate-400 sm:text-sm">
              {isHindi
                ? 'गूगल मैप्स और जमीनी सड़क सर्वे द्वारा प्रमाणित वास्तविक यात्रा समय एवं दूरियां।'
                : 'Strictly verified driving times and distances to spiritual, industrial, and railway hubs.'}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TRANSIT_MATRIX.map((node, i) => (
              <div
                key={i}
                className="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm transition-all hover:border-amber-500/40 hover:bg-white/[0.04]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase">
                      {isHindi ? node.badgeHi : node.badge}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                      <Clock size={13} />
                      <span>{node.time}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                      <node.icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-white sm:text-lg">
                        {isHindi ? node.destinationHi : node.destination}
                      </h3>
                      <div className="text-xs text-slate-400">
                        {node.distance} • {isHindi ? node.routeHi : node.route}
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-300">
                    {isHindi ? node.descHi : node.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Due Diligence & Approvals Guide */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
              {isHindi ? '100% कानूनी सुरक्षा' : 'Zero Dispute Transparency'}
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
              {isHindi
                ? 'कानूनी सत्यापन, 90-A रूपांतरण व रजिस्ट्री प्रक्रिया'
                : 'Due Diligence & Legal Approvals Verification'}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-xs text-slate-300 sm:text-sm">
              {isHindi
                ? 'प्लॉट खरीदते समय SVI Infra Solutions आपके लिए 100% पारदर्शी और सुरक्षित कानूनी दस्तावेज सुनिश्चित करता है।'
                : 'Every plot delivered along the Khatu Shyam Ji corridor undergoes rigorous legal scrutiny under Rajasthan state land revenue statutes.'}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: '01',
                icon: FileText,
                title: isHindi ? 'धारा 90-A रूपांतरण' : 'Section 90-A Conversion',
                detail: isHindi
                  ? 'राजस्थान भू-राजस्व अधिनियम की धारा 90-A के तहत कृषि भूमि का विधिवत गैर-कृषि (आवासीय) रूपांतरण, जिससे मकान निर्माण व बैंक ऋण की पूर्ण कानूनी वैधता मिलती है।'
                  : 'Certified land conversion from agricultural to residential under Section 90-A of the Rajasthan Land Revenue Act, permitting legal township layout and construction.',
              },
              {
                step: '02',
                icon: Scale,
                title: isHindi ? 'स्वच्छ जमाबंदी नकल' : 'Verified Jamabandi Record',
                detail: isHindi
                  ? 'तहसीलदार और पटवारी द्वारा प्रमाणित निर्विवाद जमाबंदी एवं खसरा नक्शा, जो यह प्रमाणित करता है कि भूमि पर कोई बैंक भार, विवाद या सीलिंग का केस नहीं है।'
                  : 'Authenticated Record of Rights (Jamabandi) verified with the local revenue office, confirming zero bank mortgages, legal encumbrances, or agricultural tenancy claims.',
              },
              {
                step: '03',
                icon: ShieldCheck,
                title: isHindi ? 'दाखिल खारिज / नामांतरण' : 'Mutation (Namantaran)',
                detail: isHindi
                  ? 'राजस्व रिकॉर्ड में पूर्ण दाखिल-खारिज नामांतरण, जिससे स्वामित्व की अटूट कड़ी (chain of title) डेवलपर के पक्ष में कानूनी रूप से दर्ज रहती है।'
                  : 'Complete mutation recorded in Rajasthan revenue ledgers establishing an unbroken chain of ownership title transferred cleanly to the development entity.',
              },
              {
                step: '04',
                icon: CheckCircle2,
                title: isHindi ? 'उप-पंजीयक पक्की रजिस्ट्री' : 'Sub-Registrar Registry',
                detail: isHindi
                  ? 'स्थानीय उप-पंजीयक कार्यालय में व्यक्तिगत बैनामा रजिस्ट्री, खूंटाबंदी (डिमार्केशन) और तुरंत कब्जा सुपुर्दगी।'
                  : 'Executed individual registered sale deed (Bainama) directly at the Sub-Registrar office with physical boundary pillars, plot marking, and immediate possession.',
              },
            ].map((d, i) => (
              <div
                key={i}
                className="relative rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                    <d.icon size={20} />
                  </div>
                  <span className="font-serif text-2xl font-bold text-amber-400/40">{d.step}</span>
                </div>
                <h3 className="mt-4 font-serif text-lg font-bold text-white">{d.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">{d.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Comprehensive FAQ Accordion (7 High-Intent Questions) */}
      <section className="border-t border-white/10 bg-slate-900/40 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
              {isHindi ? 'अक्सर पूछे जाने वाले सवाल' : 'Buyer Intelligence'}
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
              {isHindi
                ? 'खाटू श्याम जी के पास प्लॉट्स से जुड़े महत्वपूर्ण सवाल'
                : 'Frequently Asked Questions About Plots Near Khatu Shyam Ji'}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-xs text-slate-400 sm:text-sm">
              {isHindi
                ? 'दूरी, कानूनी स्वीकृति, मूल्य और बुकिंग प्रक्रिया से संबंधित सभी तथ्य।'
                : 'Everything you need to know about distances, legal titles, plot sizes, and buying procedures.'}
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-3xl space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all duration-200 open:border-amber-500/40 open:bg-white/[0.04] hover:border-amber-500/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-base font-bold text-white transition-colors group-open:text-amber-300 sm:text-lg">
                  <span>{faq.question}</span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-amber-400 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="mt-3 border-t border-white/5 pt-3 text-xs leading-relaxed text-slate-300 sm:text-sm">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Action CTA & Free Cab Booking Banner */}
      <section className="relative overflow-hidden border-t border-amber-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/60 py-16 sm:py-20">
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="relative z-10 container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-semibold text-amber-300 uppercase">
              <Sparkles size={14} className="text-amber-400" />
              <span>{isHindi ? 'निःशुल्क एसी कैब सुविधा' : 'Zero Cost Doorstep Inspection'}</span>
            </div>

            <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              {isHindi
                ? 'खाटू श्याम जी हाईवे कॉरिडोर का प्रत्यक्ष अनुभव लें'
                : 'Experience the Khatu Shyam Highway Corridor Firsthand'}
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-xs leading-relaxed text-slate-300 sm:text-sm md:text-base">
              {isHindi ? (
                <>
                  हम जयपुर में आपके घर से शिवानी वाटिका 11th (हरसोली) तक और वापस जाने के लिए पूर्णतः
                  निःशुल्क प्राइवेट एसी कैब प्रदान करते हैं। बिना किसी खरीद बाध्यता के 4-लेन हाईवे,
                  भव्य गेट, पक्की सड़कों और 100% स्पष्ट कागजातों का स्वयं निरीक्षण करें।
                </>
              ) : (
                <>
                  We arrange a complimentary private chauffeured AC cab from your doorstep anywhere
                  in Jaipur directly to Shivani Vatika 11th (Harsholi) and back. Inspect the 4-lane
                  highway, gated infrastructure, and verified 90-A registry records with zero
                  obligation.
                </>
              )}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://wa.me/917300007643?text=Namaste%20SVI%20Infra,%20I%20want%20to%20book%20a%20Free%20Cab%20Site%20Visit%20for%20Shivani%20Vatika%2011th%20on%20Khatu%20Shyam%20Ji%20Highway."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-3.5 text-xs font-bold tracking-wider text-slate-950 uppercase shadow-lg shadow-amber-500/25 transition-all hover:from-amber-400 hover:to-amber-500"
              >
                <span>{isHindi ? 'फ्री कैब साइट विजिट बुक करें' : 'Book Free Site Visit Cab'}</span>
                <ArrowRight size={16} />
              </a>

              <a
                href="/Shivani Vatika 11/ShivaniVatika 11.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-md transition-colors hover:border-amber-400/50 hover:bg-white/10"
              >
                <FileDown size={16} className="text-amber-400" />
                <span>{isHindi ? 'ब्रोशर PDF डाउनलोड करें' : 'Download Master Plan PDF'}</span>
              </a>

              <a
                href="tel:+917300007643"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-md transition-colors hover:border-amber-400/50 hover:bg-white/10"
              >
                <PhoneCall size={16} className="text-amber-400" />
                <span>+91-73000-07643</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Free Cab Sticky Pill Component */}
      <SiteVisitPill
        areaName="Shivani Vatika 11th (Khatu Shyam Highway)"
        defaultPickup="Doorstep Pickup in Jaipur City"
      />
    </div>
  );
}
