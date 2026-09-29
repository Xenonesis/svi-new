import { Train, ArrowRight, FileDown, PhoneCall } from 'lucide-react';
import { Link } from '@/src/i18n/navigation';
import { PhuleraBrochureButton } from '@/src/components/areas/PhuleraInteractive';
import { HERO_PILLARS, PHULERA_CONTACT } from './phuleraData';

interface PhuleraHeroSectionProps {
  isHindi: boolean;
}

export function PhuleraHeroSection({ isHindi }: PhuleraHeroSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-amber-500/20 pt-28 pb-16 sm:pt-36 sm:pb-24">
      {/* Ambient Gold & Sapphire Glows */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          {/* Corridor Badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-amber-300 uppercase">
            <Train size={14} className="text-amber-400" />
            <span>
              {isHindi
                ? 'DMIC मेगा लॉजिस्टिक्स एवं DFC फ्रेट हब'
                : 'DMIC Mega Logistics & Western DFC Corridor'}
            </span>
          </div>

          {/* High-impact H1 */}
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            {isHindi ? (
              <>फुलेरा में प्लॉट्स — DMIC स्मार्ट सिटी कॉरिडोर</>
            ) : (
              <>Plots for Sale in Phulera — DMIC Smart City Corridors</>
            )}
          </h1>

          {/* Sub-headline */}
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
            {isHindi ? (
              <>
                दिल्ली-मुंबई इंडस्ट्रियल कॉरिडोर (DMIC) और वेस्टर्न DFC रेलवे जंक्शन पर रणनीतिक
                निवेश। 100% स्पष्ट रजिस्ट्री, 80 से 250 वर्ग गज के आवासीय व कमर्शियल प्लॉट्स, जयपुर
                से मात्र 45 मिनट की दूरी एवं उच्च विकास क्षमता।
              </>
            ) : (
              <>
                Secure prime residential and commercial plots in Rajasthan&apos;s fastest-growing
                multi-modal logistics hub. Strategically positioned on the Delhi-Mumbai Industrial
                Corridor (DMIC) with high growth potential, clear registry, and 45 minutes
                connectivity to central Jaipur.
              </>
            )}
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/projects/shivani-vatika-11th"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-7 py-3.5 text-xs font-bold tracking-wider text-slate-950 uppercase shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500 active:scale-95"
            >
              <span>{isHindi ? 'फ्लैगशिप टाउनशिप देखें' : 'Explore Flagship Township'}</span>
              <ArrowRight size={16} />
            </Link>

            <PhuleraBrochureButton variant="outline">
              <FileDown size={16} className="text-amber-400" />
              <span>{isHindi ? 'व्हाट्सएप ब्रोशर प्राप्त करें' : 'Get WhatsApp Brochure'}</span>
            </PhuleraBrochureButton>

            <a
              href={`tel:${PHULERA_CONTACT.phone}`}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-md transition-colors hover:border-amber-400/50 hover:bg-white/10"
            >
              <PhoneCall size={16} className="text-amber-400" />
              <span>{PHULERA_CONTACT.phoneFormatted}</span>
            </a>
          </div>

          {/* Quick 4-Pillar Highlights */}
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {HERO_PILLARS.map((h, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center backdrop-blur-sm transition-all hover:border-amber-500/30 hover:bg-white/[0.05]"
              >
                <h.icon className="mx-auto mb-1.5 h-5 w-5 text-amber-400" />
                <div className="font-serif text-sm font-bold text-amber-300 sm:text-base">
                  {isHindi ? h.labelHi : h.labelEn}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-400">
                  {isHindi ? h.subHi : h.subEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
