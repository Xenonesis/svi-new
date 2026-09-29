import { DUE_DILIGENCE_STEPS } from './khatuData';

interface KhatuDueDiligenceSectionProps {
  isHindi: boolean;
}

export function KhatuDueDiligenceSection({ isHindi }: KhatuDueDiligenceSectionProps) {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
            {isHindi ? '100% कानूनी सुरक्षा' : 'Zero Dispute Transparency'}
          </span>
          <h2 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
            {isHindi
              ? 'कानूनी सत्यापन, 90-A रूपांतरण व रजिस्ट्री प्रक्रिया'
              : 'Due Diligence & Legal Approvals Verification'}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-xs text-slate-300 sm:text-sm">
            {isHindi
              ? 'प्लॉट खरीदते समय SVI Infra Solutions आपके लिए 100% पारदर्शी और सुरक्षित कानूनी दस्तावेज सुनिश्चित करता है।'
              : 'Every plot delivered along the Khatu Shyam Ji corridor undergoes rigorous legal scrutiny under Rajasthan state land revenue statutes.'}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {DUE_DILIGENCE_STEPS.map((d, i) => (
            <div
              key={i}
              className="relative rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                  <d.icon size={20} />
                </div>
                <span className="font-serif text-2xl font-bold text-amber-400/40">{d.step}</span>
              </div>
              <h3 className="mt-4 font-serif text-lg font-bold text-white">
                {isHindi ? d.titleHi : d.titleEn}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                {isHindi ? d.detailHi : d.detailEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
