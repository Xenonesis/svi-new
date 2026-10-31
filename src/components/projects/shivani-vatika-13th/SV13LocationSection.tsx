import { MapPin, Train, Navigation, Compass, Building, Car, ExternalLink } from 'lucide-react';

interface SV13LocationSectionProps {
  isHindi?: boolean;
}

export function SV13LocationSection({ isHindi = false }: SV13LocationSectionProps) {
  const connectivityPoints = [
    {
      icon: Train,
      title: isHindi ? 'फुलेरा रेलवे जंक्शन (NWR)' : 'Phulera Junction (NWR)',
      distance: '4 km',
      time: '~6 Mins',
      desc: isHindi
        ? 'उत्तर पश्चिम रेलवे का प्रमुख जंक्शन एवं वेस्टर्न डेडिकेटेड फ्रेट कॉरिडोर (DFC) केंद्र।'
        : 'Major North Western Railway junction & pivotal Western DFC logistics node.',
      badge: 'Major Rail Hub',
    },
    {
      icon: Compass,
      title: isHindi ? 'सांभर सॉल्ट लेक एवं रामसर साइट' : 'Sambhar Salt Lake',
      distance: '10 km',
      distanceTime: '~12 Mins',
      desc: isHindi
        ? 'भारत की सबसे बड़ी अंतर्देशीय नमक झील, ऐतिहासिक साल्ट ट्रेन और फ्लेमिंगो हेरिटेज।'
        : 'India’s largest inland salt lake, historic colonial salt rail lines, and eco-tourism.',
      badge: 'Heritage & Tourism',
    },
    {
      icon: Navigation,
      title: isHindi ? 'जयपुर-अजमेर एक्सप्रेसवे (NH-48)' : 'Jaipur–Ajmer Expressway (NH-48)',
      distance: '18 km',
      distanceTime: '~18 Mins',
      desc: isHindi
        ? '6-लेन राष्ट्रीय राजमार्ग जो जयपुर और अजमेर के बीच सुगम आवागमन प्रदान करता है।'
        : '6-lane high-speed national highway corridor ensuring seamless city connectivity.',
      badge: 'National Highway',
    },
    {
      icon: Car,
      title: isHindi ? 'जयपुर शहर केंद्र' : 'Jaipur City Center',
      distance: '55 km',
      distanceTime: '~45 Mins',
      desc: isHindi
        ? 'एक्सप्रेसवे के माध्यम से जयपुर शहर, रेलवे स्टेशन और हवाई अड्डे तक सीधी पहुंच।'
        : 'Fast expressway commute to 200 Ft Bypass, Jaipur Railway Station & Airport.',
      badge: 'Capital City Access',
    },
    {
      icon: Building,
      title: isHindi ? 'DMIC व वेयरहाउसिंग बेल्ट' : 'DMIC & Logistics Hub',
      distance: '5 km',
      distanceTime: '~8 Mins',
      desc: isHindi
        ? 'दिल्ली-मुंबई इंडस्ट्रियल कॉरिडोर के अंतर्गत विशाल लॉजिस्टिक्स एवं वेयरहाउसिंग हब।'
        : 'Part of the high-velocity industrial manufacturing & warehousing belt.',
      badge: 'Economic Corridor',
    },
  ];

  return (
    <section
      id="location"
      className="scroll-mt-20 bg-white py-20 text-slate-900 dark:bg-slate-950 dark:text-white"
    >
      <div className="container mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-amber-600 uppercase dark:text-amber-400">
            <MapPin className="h-3.5 w-3.5" />
            {isHindi ? 'लोकेशन एवं कनेक्टिविटी' : 'Location & Connectivity'}
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
            {isHindi
              ? 'रणनीतिक सांभर-फुलेरा ग्रोथ कॉरिडोर'
              : 'Strategic Sambhar–Phulera Growth Corridor'}
          </h2>
          <p className="mt-4 text-base text-slate-600 sm:text-lg dark:text-slate-300">
            {isHindi
              ? 'सांभर-फुलेरा क्षेत्र में स्थित, जो रेल, राष्ट्रीय राजमार्ग और औद्योगिक गलियारों के संगम पर तेजी से उभर रहा है।'
              : 'Positioned at the confluence of the Western Dedicated Freight Corridor, North Western Railway junction, and NH-48.'}
          </p>
        </div>

        {/* 2-Column: Map View & Verified Commute Table */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Map Column (7 Cols) */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-xl lg:col-span-7 dark:border-white/10 dark:bg-slate-900">
            <div className="relative aspect-[16/11] min-h-[380px] w-full">
              <iframe
                title="Shivani Vatika 13th Sambhar Phulera Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113745.85697665799!2d75.1432483!3d26.9034875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396c56b025a17e0b%3A0x8d51195a6ad6e6a!2sSambhar%20Lake!5e0!3m2!1sen!2sin!4v1714000000000!5m2!1sen!2sin"
                className="h-full w-full border-0 contrast-[1.05] grayscale-[20%]"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Map Footer Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900/90">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <MapPin className="h-4 w-4 text-amber-500" />
                <span className="font-semibold">
                  Sambhar–Phulera, Rajasthan (26.87° N, 75.24° E)
                </span>
              </div>
              <a
                href="https://maps.google.com/maps?q=26.87,75.24&z=14&hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-500 dark:text-amber-400"
              >
                <span>{isHindi ? 'गूगल मैप्स पर खोलें' : 'Open in Google Maps'}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Commute Distances Column (5 Cols) */}
          <div className="flex flex-col justify-between space-y-4 lg:col-span-5">
            <h3 className="font-serif text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
              {isHindi ? 'सटीक दूरी एवं यात्रा समय' : 'Verified Distances & Transit Times'}
            </h3>

            <div className="space-y-3">
              {connectivityPoints.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-amber-400 hover:shadow-md dark:border-white/10 dark:bg-slate-900/70"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </h4>
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          {item.time || item.distanceTime}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {item.distance} • {item.badge}
                      </p>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
