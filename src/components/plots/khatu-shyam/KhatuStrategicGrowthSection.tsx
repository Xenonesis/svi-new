import { STRATEGIC_GROWTH_CARDS } from './khatuData';

interface KhatuStrategicGrowthSectionProps {
  isHindi: boolean;
}

export function KhatuStrategicGrowthSection({ isHindi }: KhatuStrategicGrowthSectionProps) {
  return (
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
                The Harsholi–Renwal corridor represents Rajasthan’s most compelling intersection of
                high-volume religious tourism, manufacturing expansion, and dedicated multi-modal
                transit.
              </>
            )}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STRATEGIC_GROWTH_CARDS.map((card, i) => (
            <div
              key={i}
              className="group rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl transition-all duration-300 hover:border-amber-500/40 hover:bg-slate-900/90 hover:shadow-2xl hover:shadow-amber-500/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 transition-colors group-hover:bg-amber-500 group-hover:text-slate-950">
                <card.icon size={24} />
              </div>
              <div className="mt-5 font-serif text-lg font-bold text-white transition-colors group-hover:text-amber-200">
                {isHindi ? card.titleHi : card.titleEn}
              </div>
              <div className="mt-0.5 text-xs font-semibold text-amber-400/90">
                {isHindi ? card.subtitleHi : card.subtitleEn}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-300 sm:text-sm">
                {isHindi ? card.textHi : card.textEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
