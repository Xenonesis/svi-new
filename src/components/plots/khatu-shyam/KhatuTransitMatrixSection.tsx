import { Clock } from 'lucide-react';
import { TRANSIT_MATRIX } from './khatuData';

interface KhatuTransitMatrixSectionProps {
  isHindi: boolean;
}

export function KhatuTransitMatrixSection({ isHindi }: KhatuTransitMatrixSectionProps) {
  return (
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
  );
}
