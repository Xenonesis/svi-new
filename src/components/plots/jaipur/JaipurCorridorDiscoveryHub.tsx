import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CORRIDORS_LIST, type CorridorLink } from './jaipurPlotsData';

export interface JaipurCorridorDiscoveryHubProps {
  isHindi: boolean;
  corridors?: CorridorLink[];
}

export function JaipurCorridorDiscoveryHub({
  isHindi,
  corridors = CORRIDORS_LIST,
}: JaipurCorridorDiscoveryHubProps) {
  return (
    <section className="border-t border-white/10 bg-slate-950/60 py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
            {isHindi ? 'विशिष्ट क्षेत्र व कॉरिडोर' : 'Explore Dedicated Corridors'}
          </span>
          <h2 className="mt-2 font-serif text-2xl font-bold text-white sm:text-3xl">
            {isHindi
              ? 'जयपुर क्षेत्र के प्रमुख निवेश गलियारे'
              : 'Primary Jaipur Plotted Investment Corridors'}
          </h2>
          <p className="mt-2 text-xs text-slate-400 sm:text-sm">
            {isHindi
              ? 'सत्यापित कानूनी दस्तावेज़ों और सीधी कनेक्टिविटी वाले समर्पित कॉरिडोर पेजों पर जाएँ।'
              : 'Direct access to high-intent location guides with verified revenue clearances and pricing.'}
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {corridors.map((corridor) => (
            <Link
              key={corridor.href}
              href={corridor.href}
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/50 p-6 transition-all duration-300 hover:border-amber-500/40 hover:bg-slate-900/80"
            >
              <div>
                <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">
                  {isHindi && corridor.badgeHi ? corridor.badgeHi : corridor.badge}
                </span>
                <h3 className="mt-2 font-serif text-lg font-bold text-white transition-colors group-hover:text-amber-200">
                  {isHindi ? corridor.titleHi : corridor.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {isHindi ? corridor.descHi : corridor.desc}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <span>{isHindi ? 'विस्तृत विवरण देखें' : 'View Corridor Plots'}</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default JaipurCorridorDiscoveryHub;
