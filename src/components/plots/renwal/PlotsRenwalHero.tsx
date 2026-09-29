import Link from 'next/link';
import { Train, ArrowRight, PhoneCall } from 'lucide-react';
import { RENWAL_CONNECTIVITY_ITEMS } from './plotsRenwalData';

interface PlotsRenwalHeroProps {
  isHindi: boolean;
}

export function PlotsRenwalHero({ isHindi }: PlotsRenwalHeroProps) {
  return (
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
            {RENWAL_CONNECTIVITY_ITEMS.map((c, i) => (
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
  );
}
