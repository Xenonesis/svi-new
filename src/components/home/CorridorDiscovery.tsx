'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Compass, MapPin, Sparkles, TrendingUp, Train, ArrowRight } from 'lucide-react';

interface CorridorItem {
  slug: string;
  badge: { en: string; hi: string };
  title: { en: string; hi: string };
  price: { en: string; hi: string };
  highlight: { en: string; hi: string };
  distance: { en: string; hi: string };
  icon: typeof Compass;
}

const CORRIDORS: CorridorItem[] = [
  {
    slug: '/plots-in-jaipur',
    badge: { en: 'Comprehensive Hub', hi: 'मुख्य केंद्र' },
    title: { en: 'All Jaipur Plotted Townships', hi: 'जयपुर के सभी आवासीय प्लॉट्स' },
    price: { en: 'From ₹7,500 / sq. yd.', hi: '₹7,500 / वर्ग गज से' },
    highlight: {
      en: 'Master-planned townships with 160 ft & 30 ft paved roads, clear registry & mutation.',
      hi: '160 फीट व 30 फीट चौड़ी पक्की सड़कें, 90-A पक्की रजिस्ट्री व दाखिल खारिज।',
    },
    distance: { en: 'Citywide Corridors', hi: 'संपूर्ण जयपुर क्षेत्र' },
    icon: Compass,
  },
  {
    slug: '/plots-in-jaipur-under-20-lakhs',
    badge: { en: 'High Demand', hi: 'बजट फ्रेंडली' },
    title: { en: 'Plots Under 20 Lakhs', hi: '20 लाख के अंदर प्लॉट्स' },
    price: { en: 'Starts @ ₹6 Lakhs', hi: 'मात्र ₹6 लाख से शुरू' },
    highlight: {
      en: '80 & 100 sq. yd. budget residential plots engineered for early home builders & investors.',
      hi: '80 व 100 वर्ग गज के किफायती प्लॉट्स, आसान भुगतान व बैंक लोन सुविधा।',
    },
    distance: { en: 'Harsholi / Nayla', hi: 'हरसोली / नायला' },
    icon: Sparkles,
  },
  {
    slug: '/plots-for-sale-near-khatu-shyam-ji',
    badge: { en: 'Pilgrim & Highway Node', hi: 'तीर्थ व हाईवे कॉरिडोर' },
    title: { en: 'Khatu Shyam Ji Highway', hi: 'खाटू श्याम जी हाईवे कॉरिडोर' },
    price: { en: 'Flagship Shivani Vatika 11th', hi: 'शिवानी वाटिका 11th' },
    highlight: {
      en: '160 ft highway frontage, 230 gated plots, 2 min from Ring Road / Harsholi junction.',
      hi: '160 फीट हाईवे फ्रंट, 230 गेटेड प्लॉट्स, रिंग रोड व हरसोली जंक्शन के नजदीक।',
    },
    distance: { en: 'Jaipur - Sikar Expressway', hi: 'जयपुर - सीकर एक्सप्रेसवे' },
    icon: TrendingUp,
  },
  {
    slug: '/plots-near-renwal-railway-station',
    badge: { en: 'Industrial & Transit', hi: 'औद्योगिक व रेलवे हब' },
    title: { en: 'Renwal Railway Station Corridor', hi: 'रेनवाल रेलवे स्टेशन कॉरिडोर' },
    price: { en: 'High Rental Potential', hi: 'मजबूत रेंटल व ग्रोथ' },
    highlight: {
      en: 'Just 7 km from Kishangarh Renwal Station, directly adjacent to RIICO Industrial Area Phase 1.',
      hi: 'किशनगढ़ रेनवाल स्टेशन से मात्र 7 किमी, रीको (RIICO) औद्योगिक क्षेत्र फेज 1 के पास।',
    },
    distance: { en: '7 Km to Station', hi: '7 किमी रेलवे स्टेशन' },
    icon: Train,
  },
  {
    slug: '/plots-for-sale-in-phulera',
    badge: { en: 'DMIC Freight Corridor', hi: 'DMIC स्मार्ट सिटी' },
    title: { en: 'Phulera Smart City Hub', hi: 'फुलेरा स्मार्ट सिटी कॉरिडोर' },
    price: { en: 'Logistics Growth Hub', hi: 'लॉजिस्टिक्स व इंडस्ट्रियल' },
    highlight: {
      en: 'Located along the Western Dedicated Freight Corridor with multi-modal industrial cargo connectivity.',
      hi: 'डेडिकेटेड फ्रेट कॉरिडोर (DFC) और मल्टी-मॉडल कनेक्टिविटी के साथ तीव्र विकास।',
    },
    distance: { en: 'Western DFC Node', hi: 'वेस्टर्न DFC जंक्शन' },
    icon: MapPin,
  },
];

export default function CorridorDiscovery() {
  const locale = useLocale();
  const isHindi = locale === 'hi';

  return (
    <section className="relative overflow-hidden bg-slate-950 py-16 text-slate-100 sm:py-24">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.08),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(30,58,138,0.12),transparent_50%)]" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-amber-300 uppercase backdrop-blur-md">
            <Compass size={14} className="text-amber-400" />
            {isHindi ? 'जयपुर प्राइम प्लॉट्स कॉरिडोर' : 'Explore Prime Jaipur Plotted Corridors'}
          </div>
          <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {isHindi ? (
              <>
                रणनीतिक स्थानों पर <span className="text-amber-400">वेरिफाइड प्लॉट्स</span> खोजें
              </>
            ) : (
              <>
                Discover Strategic <span className="text-amber-400">Plotted Corridors</span> in
                Jaipur
              </>
            )}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
            {isHindi
              ? 'खाटू श्याम जी हाईवे, फुलेरा स्मार्ट सिटी और रेनवाल रीको औद्योगिक क्षेत्र के साथ जयपुर के सभी प्रमुख विकास गलियारों में 100% पक्की रजिस्ट्री वाले प्लॉट्स।'
              : 'Direct access to government-recognized Section 90-A converted plots with transparent registry across Jaipur’s fastest-growing highway nodes.'}
          </p>
        </div>

        {/* Corridor Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CORRIDORS.map((corridor, idx) => {
            const Icon = corridor.icon;
            const isFullWidthMobile = idx === 0 ? 'sm:col-span-2 lg:col-span-1' : '';

            return (
              <Link
                key={corridor.slug}
                href={corridor.slug}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/50 hover:bg-slate-900/90 hover:shadow-2xl hover:shadow-amber-500/10 ${isFullWidthMobile}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-amber-300 uppercase">
                      {isHindi ? corridor.badge.hi : corridor.badge.en}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                      <MapPin size={12} className="text-amber-400" />
                      {isHindi ? corridor.distance.hi : corridor.distance.en}
                    </span>
                  </div>

                  <div className="mt-5 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-amber-400 transition-colors group-hover:border-amber-500/40 group-hover:bg-amber-500/10">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-white transition-colors group-hover:text-amber-300">
                        {isHindi ? corridor.title.hi : corridor.title.en}
                      </h3>
                      <p className="text-xs font-semibold text-amber-400/90">
                        {isHindi ? corridor.price.hi : corridor.price.en}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-slate-300">
                    {isHindi ? corridor.highlight.hi : corridor.highlight.en}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4 text-xs font-semibold text-slate-400 transition-colors group-hover:text-amber-300">
                  <span>{isHindi ? 'प्लॉट व लेआउट देखें' : 'View Plots & Corridor Details'}</span>
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
