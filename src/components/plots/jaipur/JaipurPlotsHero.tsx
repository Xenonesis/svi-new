import Link from 'next/link';
import { Sparkles, ArrowRight, PhoneCall } from 'lucide-react';
import { JAIPUR_CONTACT, JAIPUR_HERO_QUICK_LINKS, JAIPUR_TRUST_BADGES } from './jaipurPlotsData';

export interface JaipurPlotsHeroProps {
  isHindi: boolean;
}

export function JaipurPlotsHero({ isHindi }: JaipurPlotsHeroProps) {
  return (
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
                खाटू श्याम जी हाईवे, नायला और फुलेरा डीएमआईसी कॉरिडोर में अपना पसंदीदा प्लॉट चुनें।
                आधुनिक इंफ्रास्ट्रक्चर, बिजली, पानी, 24/7 सुरक्षा और निःशुल्क कैब साइट विजिट सुविधा।
              </>
            ) : (
              <>
                Invest in verified residential land across Jaipur’s fastest appreciating corridors.
                Featuring gated boundaries, 40-ft paved roads, underground utilities, and
                0-compromise legal documentation.
              </>
            )}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {JAIPUR_HERO_QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3.5 py-1 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-400/20"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#projects-inventory"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-3.5 text-xs font-bold tracking-wider text-slate-950 uppercase shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/30"
            >
              <span>{isHindi ? 'उपलब्ध प्लॉट्स देखें' : 'View Available Plots'}</span>
              <ArrowRight size={16} />
            </a>

            <a
              href={`tel:${JAIPUR_CONTACT.phone}`}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-md transition-colors hover:border-amber-400/50 hover:bg-white/10"
            >
              <PhoneCall size={16} className="text-amber-400" />
              <span>{JAIPUR_CONTACT.displayPhone}</span>
            </a>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {JAIPUR_TRUST_BADGES.map((badge, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center"
              >
                <div className="font-serif text-sm font-bold text-amber-300 sm:text-base">
                  {isHindi ? badge.labelHi : badge.labelEn}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-400">
                  {isHindi ? badge.subHi : badge.subEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default JaipurPlotsHero;
