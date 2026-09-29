import { PHULERA_ADVANTAGES } from './phuleraData';

interface PhuleraAdvantageSectionProps {
  isHindi: boolean;
}

export function PhuleraAdvantageSection({ isHindi }: PhuleraAdvantageSectionProps) {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
            {isHindi ? 'औद्योगिक विकास एवं निवेश के लाभ' : 'Industrial & Commercial Drivers'}
          </span>
          <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-white sm:text-4xl">
            {isHindi ? <>फुलेरा मेगा हब का रणनीतिक महत्व</> : <>The Phulera Mega Hub Advantage</>}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
            {isHindi ? (
              <>
                फुलेरा जंक्शन केवल एक रेलवे स्टेशन नहीं, बल्कि दिल्ली-मुंबई इंडस्ट्रियल कॉरिडोर का
                एक बहुआयामी आर्थिक इंजन है जो औद्योगिक विकास, रोजगार और रियल एस्टेट को तीव्र गति
                प्रदान कर रहा है।
              </>
            ) : (
              <>
                Phulera represents the epicenter of cargo logistics and industrial infrastructure in
                Jaipur district. Discover why top logistics providers and smart plot investors are
                prioritizing this economic corridor.
              </>
            )}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PHULERA_ADVANTAGES.map((adv, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-6 transition-all duration-300 hover:border-amber-500/40 hover:bg-slate-900/90"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400 transition-transform group-hover:scale-110">
                <adv.icon size={22} />
              </div>
              <h3 className="font-serif text-lg font-bold text-white sm:text-xl">
                {isHindi ? adv.titleHi : adv.titleEn}
              </h3>
              <p className="mt-2.5 text-xs leading-relaxed text-slate-300 sm:text-sm">
                {isHindi ? adv.descHi : adv.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
