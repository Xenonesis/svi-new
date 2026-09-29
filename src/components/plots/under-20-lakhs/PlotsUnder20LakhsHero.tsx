import Link from 'next/link';
import { Tag, ArrowRight, PhoneCall } from 'lucide-react';
import { VALUE_HIGHLIGHTS } from './plotsUnder20LakhsData';

interface PlotsUnder20LakhsHeroProps {
  isHindi: boolean;
}

export function PlotsUnder20LakhsHero({ isHindi }: PlotsUnder20LakhsHeroProps) {
  return (
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
            {VALUE_HIGHLIGHTS.map((h, i) => (
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
  );
}
