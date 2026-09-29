import { Sparkles, ShieldCheck, FileDown, PhoneCall } from 'lucide-react';
import {
  PhuleraBrochureButton,
  PhuleraLeadCaptureForm,
} from '@/src/components/areas/PhuleraInteractive';
import { LEAD_CAPTURE_PERKS, PHULERA_CONTACT } from './phuleraData';

interface PhuleraLeadCaptureSectionProps {
  isHindi: boolean;
}

export function PhuleraLeadCaptureSection({ isHindi }: PhuleraLeadCaptureSectionProps) {
  return (
    <section className="relative overflow-hidden border-t border-amber-500/20 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-16 sm:py-24">
      <div className="pointer-events-none absolute -right-32 -bottom-32 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            {/* Left Column: WhatsApp Brochure & Perks */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
                <Sparkles size={13} className="text-amber-400" />
                <span>{isHindi ? 'तत्काल दर सूची एवं लेआउट' : 'Instant Rates & Layout Plan'}</span>
              </div>

              <h2 className="mt-3 font-serif text-2xl font-bold text-white sm:text-4xl">
                {isHindi ? (
                  <>फुलेरा स्मार्ट सिटी ब्रोशर व्हाट्सएप पर पाएं</>
                ) : (
                  <>Get Phulera Corridor Brochure on WhatsApp</>
                )}
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {isHindi ? (
                  <>
                    फुलेरा और जयपुर कॉरिडोर की प्रमाणित दरें, उपलब्ध प्लॉट्स का लेआउट मैप और 100%
                    स्पष्ट कानूनी दस्तावेज सीधे अपने मोबाइल पर प्राप्त करें।
                  </>
                ) : (
                  <>
                    Download verified site layout maps, official BSP pricing, and legal approval
                    certificates directly on your WhatsApp in seconds.
                  </>
                )}
              </p>

              <div className="mt-6 space-y-3 text-xs text-slate-300">
                {LEAD_CAPTURE_PERKS.map((perk, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <ShieldCheck size={16} className="shrink-0 text-emerald-400" />
                    <span>{isHindi ? perk.textHi : perk.textEn}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <PhuleraBrochureButton variant="whatsapp">
                  <FileDown size={16} />
                  <span>
                    {isHindi ? 'व्हाट्सएप पर ब्रोशर प्राप्त करें' : 'Download Brochure on WhatsApp'}
                  </span>
                </PhuleraBrochureButton>

                <a
                  href={`tel:${PHULERA_CONTACT.phone}`}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-md transition-colors hover:border-amber-400/50 hover:bg-white/10"
                >
                  <PhoneCall size={16} className="text-amber-400" />
                  <span>{PHULERA_CONTACT.phoneFormatted}</span>
                </a>
              </div>
            </div>

            {/* Right Column: Interactive Lead Capture Form */}
            <div className="rounded-3xl border border-amber-500/30 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-md sm:p-8">
              <div className="mb-5">
                <h3 className="font-serif text-xl font-bold text-white">
                  {isHindi ? 'साइट विजिट व रेट लिस्ट इंक्वायरी' : 'Book Site Visit or Callback'}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {isHindi
                    ? 'अपना विवरण भरें, हमारे वरिष्ठ निवेश सलाहकार 15 मिनट में संपर्क करेंगे।'
                    : 'Fill details below to get direct consultation from our Phulera advisor.'}
                </p>
              </div>

              <PhuleraLeadCaptureForm isHindi={isHindi} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
