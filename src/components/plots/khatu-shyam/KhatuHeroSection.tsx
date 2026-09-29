import { Sparkles, ArrowRight, FileDown, PhoneCall } from 'lucide-react';
import { Link } from '@/src/i18n/navigation';
import { HERO_PILLS, HERO_STATS, KHATU_CONTACT } from './khatuData';

interface KhatuHeroSectionProps {
  isHindi: boolean;
}

export function KhatuHeroSection({ isHindi }: KhatuHeroSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-amber-500/20 pt-28 pb-16 sm:pt-36 sm:pb-24">
      {/* Ambient Gold Glow Accents */}
      <div className="pointer-events-none absolute -top-48 -right-48 h-[32rem] w-[32rem] rounded-full bg-amber-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -left-48 h-[28rem] w-[28rem] rounded-full bg-amber-600/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/5 blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          {/* Corridor Category Pill */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-amber-300 uppercase backdrop-blur-md">
            <Sparkles size={14} className="text-amber-400" />
            <span>
              {isHindi
                ? 'श्री खाटू श्याम जी तीर्थ एवं औद्योगिक विकास कॉरिडोर'
                : 'Spiritual & High-Growth Commercial Corridor'}
            </span>
          </div>

          {/* High-Impact H1 */}
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:leading-[1.15]">
            {isHindi ? (
              <>खाटू श्याम जी हाईवे पर आवासीय प्लॉट्स की बिक्री</>
            ) : (
              <>Residential Plots for Sale Near Khatu Shyam Ji Highway</>
            )}
          </h1>

          {/* Subtitle with High-Intent Context */}
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
            {isHindi ? (
              <>
                खाटू श्याम जी मंदिर से मात्र 20-25 मिनट की दूरी पर 4-लेन मुख्य हाईवे पर 100% स्पष्ट
                रजिस्ट्री आवासीय प्लॉट्स। शिवानी वाटिका 11th में 80 से 250 वर्ग गज के 230 सुनियोजित
                भूखंड, पक्की सड़कें, 24/7 सुरक्षा और निःशुल्क एसी कैब साइट विजिट।
              </>
            ) : (
              <>
                Secure legally verified residential plots along the fast-appreciating Jaipur to
                Khatu Shyam Ji Highway (Harsholi). Located only 20–25 minutes from the holy temple
                with direct 4-lane highway frontage, gated township infrastructure, and 100%
                individual sub-registrar registry.
              </>
            )}
          </p>

          {/* Quick Highlights Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {HERO_PILLS.map((pill, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-amber-200 shadow-sm backdrop-blur-md"
              >
                <pill.icon size={15} className="shrink-0 text-amber-400" />
                <span>{isHindi ? pill.textHi : pill.textEn}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={KHATU_CONTACT.projectPath}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-3.5 text-xs font-bold tracking-wider text-slate-950 uppercase shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/30"
            >
              <span>
                {isHindi ? 'शिवानी वाटिका 11th विवरण देखें' : 'Explore Shivani Vatika 11th'}
              </span>
              <ArrowRight size={16} />
            </Link>

            <a
              href={KHATU_CONTACT.brochurePdf}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-md transition-colors hover:border-amber-400/50 hover:bg-white/10"
            >
              <FileDown size={16} className="text-amber-400" />
              <span>{isHindi ? 'डाउनलोड ब्रोशर PDF' : 'Download Brochure PDF'}</span>
            </a>

            <a
              href={`tel:${KHATU_CONTACT.phone}`}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-md transition-colors hover:border-amber-400/50 hover:bg-white/10"
            >
              <PhoneCall size={16} className="text-amber-400" />
              <span>{KHATU_CONTACT.phoneDisplay}</span>
            </a>
          </div>

          {/* Key Highway Corridor Stats */}
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {HERO_STATS.map((c, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center backdrop-blur-sm transition-all hover:border-amber-500/30"
              >
                <div className="font-serif text-xl font-bold text-amber-300 sm:text-2xl">
                  {isHindi ? c.labelHi : c.labelEn}
                </div>
                <div className="mt-1 text-xs text-slate-400">{isHindi ? c.subHi : c.subEn}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
