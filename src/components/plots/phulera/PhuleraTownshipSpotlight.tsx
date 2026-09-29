import Image from 'next/image';
import { Navigation, CheckCircle2, ArrowRight, Compass } from 'lucide-react';
import { Link } from '@/src/i18n/navigation';
import { TOWNSHIP_FEATURES } from './phuleraData';

interface PhuleraTownshipSpotlightProps {
  isHindi: boolean;
}

export function PhuleraTownshipSpotlight({ isHindi }: PhuleraTownshipSpotlightProps) {
  return (
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
                  {isHindi ? 'चालू विकास (Ongoing)' : 'Ongoing Development'}
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
                      फुलेरा जंक्शन से मात्र 35 मिनट की दूरी पर 11.5 बीघा (लगभग 30,480 वर्ग गज) में
                      विस्तृत 230 आवासीय भूखंडों की सुव्यवस्थित टाउनशिप। 80 से 250 वर्ग गज के तुरंत
                      निर्माण योग्य प्लॉट्स।
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
                  {TOWNSHIP_FEATURES.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                      <span>{isHindi ? feat.textHi : feat.textEn}</span>
                    </div>
                  ))}
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
  );
}
