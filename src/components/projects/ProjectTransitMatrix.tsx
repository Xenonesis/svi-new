import type { ComponentType } from 'react';
import { Link } from '@/src/i18n/navigation';
import {
  Sparkles,
  Factory,
  Train,
  Building2,
  Car,
  Package,
  Clock,
  Milestone,
  Navigation,
  CheckCircle2,
  ShieldCheck,
  MapPin,
} from 'lucide-react';

export interface TransitDestination {
  id: string;
  name: string;
  nameHi: string;
  category: string;
  categoryHi: string;
  distance: string;
  distanceHi: string;
  time: string;
  timeHi: string;
  advantage: string;
  advantageHi: string;
  icon: ComponentType<{ className?: string }>;
  badgeColor: string;
  timeBadgeColor: string;
}

export const VERIFIED_TRANSIT_DESTINATIONS: TransitDestination[] = [
  {
    id: 'khatu-shyam-temple',
    name: 'Shree Khatu Shyam Ji Mandir',
    nameHi: 'श्री खाटू श्याम जी मंदिर धाम',
    category: 'Sacred Pilgrimage Dham',
    categoryHi: 'पवित्र तीर्थ स्थल कॉरिडोर',
    distance: '~28 km',
    distanceHi: '~28 किमी',
    time: '20–25 mins drive',
    timeHi: '20–25 मिनट',
    advantage:
      'Direct highway corridor to the world-famous pilgrimage shrine, attracting round-the-year commercial and tourism growth.',
    advantageHi:
      'विश्व प्रसिद्ध खाटू श्याम धाम के लिए सीधा राजमार्ग, जो साल भर तीर्थयात्रियों के आवागमन और उच्च व्यावसायिक मांग को बढ़ाता है।',
    icon: Sparkles,
    badgeColor: 'border-amber-400/40 bg-amber-400/10 text-amber-600 dark:text-amber-300',
    timeBadgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  },
  {
    id: 'riico-renwal',
    name: 'RIICO Industrial Area (Renwal)',
    nameHi: 'रीको औद्योगिक क्षेत्र (रेणवाल)',
    category: 'Industrial Growth Hub',
    categoryHi: 'राज्य औद्योगिक एवं विनिर्माण हब',
    distance: '1 km',
    distanceHi: '1 किमी',
    time: '2 mins drive',
    timeHi: '2 मिनट',
    advantage:
      '64-acre operational state industrial zone with 155+ planned manufacturing units generating immense local employment.',
    advantageHi:
      '64 एकड़ में विस्तृत रीको औद्योगिक क्षेत्र, 155+ नियोजित इकाइयों के साथ स्थानीय रोजगार और मजबूत आवासीय मांग उत्पन्न करता है।',
    icon: Factory,
    badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    timeBadgeColor:
      'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'renwal-railway-station',
    name: 'Renwal Railway Station (RNW)',
    nameHi: 'रेणवाल रेलवे स्टेशन (RNW)',
    category: 'Express Rail Transit',
    categoryHi: 'उत्तर पश्चिम रेलवे एक्सप्रेस जंक्शन',
    distance: '7 km',
    distanceHi: '7 किमी',
    time: '5 mins drive',
    timeHi: '5 मिनट',
    advantage:
      'Active North Western Railway station with direct passenger and express train connectivity to Jaipur, Delhi, and Rewari.',
    advantageHi:
      'जयपुर, दिल्ली व रेवाड़ी के लिए सीधी एक्सप्रेस व दैनिक पैसेंजर रेल सेवा वाला प्रमुख रेलवे स्टेशन।',
    icon: Train,
    badgeColor: 'border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    timeBadgeColor: 'bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/30',
  },
  {
    id: 'phulera-dmic-corridor',
    name: 'Phulera Junction & DMIC Corridor',
    nameHi: 'फुलेरा जंक्शन एवं DMIC कॉरिडोर',
    category: 'Dedicated Freight Corridor',
    categoryHi: 'वेस्टर्न DFC एवं स्मार्ट लॉजिस्टिक्स हब',
    distance: '~34 km',
    distanceHi: '~34 किमी',
    time: '~35 mins drive',
    timeHi: '~35 मिनट',
    advantage:
      'Western Dedicated Freight Corridor (DFC) rail interchange connecting Dadri–JNPT with mega smart logistics infrastructure.',
    advantageHi:
      'वेस्टर्न डेडिकेटेड फ्रेट कॉरिडोर (DFC) का केंद्रीय जंक्शन एवं दादरी-JNPT फ्रेट लाइन से जुड़ा मेगा स्मार्ट लॉजिस्टिक्स हब।',
    icon: Building2,
    badgeColor: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
    timeBadgeColor: 'bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border-indigo-500/30',
  },
  {
    id: 'jaipur-city-vaishali',
    name: 'Jaipur City (Vaishali Nagar / 200 Ft Bypass)',
    nameHi: 'जयपुर शहर (वैशाली नगर / 200 फीट बाईपास)',
    category: 'Urban Metropolitan Core',
    categoryHi: 'जयपुर महानगरीय व्यवसायिक केंद्र',
    distance: '~52 km',
    distanceHi: '~52 किमी',
    time: '45 mins drive',
    timeHi: '45 मिनट',
    advantage:
      'Signal-free arterial connectivity via Jaipur-Ajmer Expressway corridor directly entering prime commercial centers of Jaipur.',
    advantageHi:
      'जयपुर-अजमेर एक्सप्रेसवे और 200 फीट बाईपास के माध्यम से जयपुर के मुख्य व्यवसायिक और रिहायशी केंद्रों तक त्वरित प्रवेश।',
    icon: Car,
    badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    timeBadgeColor: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
  },
  {
    id: 'mega-warehouses',
    name: 'Mega Corporate Logistics & Warehousing',
    nameHi: 'मेगा कॉरपोरेट वेयरहाउसिंग एवं लॉजिस्टिक्स',
    category: 'National Supply-Chain Hub',
    categoryHi: 'कॉरपोरेट सप्लाई-चेन एवं वेयरहाउसिंग',
    distance: '~7 km',
    distanceHi: '~7 किमी',
    time: '~6 mins drive',
    timeHi: '~6 मिनट',
    advantage:
      'Presence of national corporate logistics and distribution facilities driving major capital investments and rapid land valuation.',
    advantageHi:
      'अग्रणी राष्ट्रीय वेयरहाउसिंग व वितरण केंद्रों की निकटता, जो क्षेत्र में संस्थागत पूंजी व भूमि के तेज मूल्यांकन को गति दे रही है।',
    icon: Package,
    badgeColor: 'border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300',
    timeBadgeColor: 'bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-500/30',
  },
];

interface ProjectTransitMatrixProps {
  isHindi?: boolean;
  destinations?: TransitDestination[];
}

export default function ProjectTransitMatrix({
  isHindi = false,
  destinations = VERIFIED_TRANSIT_DESTINATIONS,
}: ProjectTransitMatrixProps) {
  return (
    <section id="transit-matrix" className="mt-20 w-full scroll-mt-24">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-[#0c1220] via-[#080d19] to-[#050811] p-6 shadow-2xl sm:p-10">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-bold tracking-wider text-amber-300 uppercase">
                <Navigation className="h-3.5 w-3.5 text-amber-400" />
                <span>
                  {isHindi
                    ? 'सत्यापित ट्रांजिट एवं दूरी मैट्रिक्स'
                    : 'Verified Transit & Commute Matrix'}
                </span>
              </div>

              <h2 className="mt-3.5 font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                {isHindi
                  ? 'शिवानी वाटिका 11th से रणनीतिक दूरियां एवं आवागमन समय'
                  : 'Strategic Connectivity & Commute Matrix from Shivani Vatika 11th'}
              </h2>

              <p className="mt-2.5 text-sm leading-relaxed text-slate-300 sm:text-base">
                {isHindi
                  ? 'जयपुर से खाटू श्याम जी 4-लेन राजमार्ग पर स्थित इस टाउनशिप से प्रमुख तीर्थ स्थल, रीको औद्योगिक क्षेत्र, रेलवे स्टेशन एवं जयपुर शहर की सटीक सत्यापित दूरियां।'
                  : 'Directly fronting the Jaipur–Khatu Shyam Ji highway corridor at Harsholi. Real verified commute times and road distances to prime spiritual, industrial, rail, and urban destinations.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-amber-300/90 sm:justify-end">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>{isHindi ? '100% सत्यापित दूरियां' : '100% GPS Verified'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md">
                <Clock className="h-4 w-4 text-amber-400" />
                <span>{isHindi ? 'औसत ड्राइव समय' : 'Avg Drive Times'}</span>
              </span>
            </div>
          </div>

          {/* Desktop & Tablet Table (md and up) */}
          <div className="relative z-10 mt-8 hidden overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 shadow-xl backdrop-blur-md md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.04] text-[11px] font-bold tracking-widest text-slate-300 uppercase">
                    <th scope="col" className="px-6 py-4">
                      {isHindi ? 'गंतव्य स्थल / लैंडमार्क' : 'Destination / Landmark'}
                    </th>
                    <th scope="col" className="px-6 py-4">
                      {isHindi ? 'कॉरिडोर प्रकार' : 'Corridor Type'}
                    </th>
                    <th scope="col" className="px-6 py-4 text-center">
                      {isHindi ? 'दूरी (किमी)' : 'Distance'}
                    </th>
                    <th scope="col" className="px-6 py-4 text-center">
                      {isHindi ? 'यात्रा समय' : 'Drive Time'}
                    </th>
                    <th scope="col" className="px-6 py-4">
                      {isHindi ? 'रणनीतिक लाभ एवं कनेक्टिविटी' : 'Strategic Highway Advantage'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {destinations.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <tr
                        key={item.id}
                        className="group transition-colors duration-150 hover:bg-white/[0.04]"
                      >
                        <td className="px-6 py-4.5 font-medium text-white">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-400 transition-colors group-hover:border-amber-400/40 group-hover:bg-amber-400/20">
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-serif text-base font-bold text-white transition-colors group-hover:text-amber-300">
                                {isHindi ? item.nameHi : item.name}
                              </p>
                              <p className="text-xs text-slate-400">
                                {isHindi ? item.categoryHi : item.category}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4.5">
                          <span
                            className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase ${item.badgeColor}`}
                          >
                            {isHindi ? item.categoryHi : item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <span className="inline-flex items-center gap-1 font-mono text-base font-bold text-amber-300">
                            <Milestone className="h-3.5 w-3.5 text-amber-400" />
                            {isHindi ? item.distanceHi : item.distance}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-extrabold shadow-sm ${item.timeBadgeColor}`}
                          >
                            <Clock className="h-3.5 w-3.5" />
                            {isHindi ? item.timeHi : item.time}
                          </span>
                        </td>
                        <td className="max-w-sm px-6 py-4.5 text-xs leading-relaxed text-slate-300">
                          {isHindi ? item.advantageHi : item.advantage}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card Grid (sm and down) */}
          <div className="relative z-10 mt-6 grid grid-cols-1 gap-4 md:hidden">
            {destinations.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-400">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-serif text-base font-bold text-white">
                          {isHindi ? item.nameHi : item.name}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {isHindi ? item.categoryHi : item.category}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 font-mono text-xs font-bold text-amber-300">
                      <Milestone className="h-3 w-3 text-amber-400" />
                      <span>{isHindi ? item.distanceHi : item.distance}</span>
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-xs font-bold ${item.timeBadgeColor}`}
                    >
                      <Clock className="h-3 w-3" />
                      <span>{isHindi ? item.timeHi : item.time}</span>
                    </span>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-300">
                    {isHindi ? item.advantageHi : item.advantage}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Bottom Trust & Proximity Callout */}
          <div className="relative z-10 mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-6 py-4 backdrop-blur-md sm:flex-row">
            <div className="flex items-center gap-3 text-left">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-400" />
              <p className="text-xs text-slate-200 sm:text-sm">
                <span className="font-bold text-amber-300">
                  {isHindi ? 'त्वरित कनेक्टिविटी:' : 'Direct Highway Access:'}
                </span>{' '}
                {isHindi
                  ? 'मुख्य 4-लेन राजमार्ग पर प्रत्यक्ष प्रवेश — किसी कच्ची या संकरी सड़क के बिना 100% सुगम यात्रा।'
                  : 'Zero unpaved detours. Direct asphalt frontage on the state highway connecting Jaipur to Khatu Shyam Ji.'}
              </p>
            </div>
            <Link
              href="/contact?project=shivani-vatika-11th"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold tracking-wider text-slate-950 uppercase shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>{isHindi ? 'साइट विजिट बुक करें' : 'Book Free Site Cab'}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
