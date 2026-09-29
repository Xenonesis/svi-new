import Image from 'next/image';
import { ShieldCheck, CheckCircle2, ArrowRight, FileDown } from 'lucide-react';
import { Link } from '@/src/i18n/navigation';
import { TOWNSHIP_SPECS, TOWNSHIP_AMENITIES, KHATU_CONTACT } from './khatuData';

interface KhatuTownshipSpotlightProps {
  isHindi: boolean;
}

export function KhatuTownshipSpotlight({ isHindi }: KhatuTownshipSpotlightProps) {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-6 shadow-2xl sm:p-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            {/* Project Image & Visual Badges */}
            <div className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl bg-slate-950 lg:col-span-6">
              <Image
                src={KHATU_CONTACT.gateImage}
                alt="Shivani Vatika 11th Entrance Gate on Jaipur Khatu Shyam Ji Highway"
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                priority
              />
              <div className="absolute top-3 left-3 z-10 rounded-full bg-emerald-500 px-3.5 py-1 text-xs font-bold text-slate-950 shadow-md">
                {isHindi ? 'चालू विकास (Ongoing)' : 'Ongoing Development'}
              </div>
              <div className="absolute top-3 right-3 z-10 rounded-full border border-amber-400/40 bg-slate-950/80 px-3 py-1 text-[11px] font-bold text-amber-300 backdrop-blur-md">
                {isHindi ? 'प्रारंभिक ₹ 15 लाख*' : 'From ₹ 15 Lakhs*'}
              </div>
              <div className="absolute right-3 bottom-3 left-3 z-10 rounded-xl border border-white/10 bg-slate-950/85 p-2.5 text-center backdrop-blur-md">
                <div className="text-[11px] font-semibold text-amber-300">
                  {isHindi
                    ? '11.5 बीघा • 230 सुनियोजित आवासीय प्लॉट्स • हरसोली'
                    : '11.5 Bigha • 230 Master-Planned Residential Plots • Harsholi'}
                </div>
              </div>
            </div>

            {/* Project Content & Specs */}
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-amber-400 uppercase">
                <ShieldCheck size={14} />
                <span>
                  {isHindi ? 'फ्लैगशिप टाउनशिप प्रोजेक्ट' : 'Flagship Plotted Development'}
                </span>
              </div>

              <h2 className="mt-2 font-serif text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                {isHindi
                  ? 'शिवानी वाटिका 11th (हरसोली - खाटू हाईवे)'
                  : 'Shivani Vatika 11th (Harsholi)'}
              </h2>

              <p className="mt-3 text-xs leading-relaxed text-slate-300 sm:text-sm">
                {isHindi ? (
                  <>
                    जयपुर-खाटू श्याम जी मुख्य राजमार्ग पर स्थित शिवानी वाटिका 11th, 11.5 बीघा (लगभग
                    30,480 वर्ग गज) में फैली एक भव्य आवासीय टाउनशिप है। 80 से 250 वर्ग गज के 230
                    भूखंड, 30 व 40 फीट चौड़ी पक्की सड़कें, भव्य मुख्य द्वार, चारदीवारी और तुरंत
                    पक्की रजिस्ट्री।
                  </>
                ) : (
                  <>
                    Spread over 11.5 Bigha (approx. 30,480 sq. yds.) directly on the Jaipur–Khatu
                    Shyam Ji Highway, Shivani Vatika 11th features 230 demarcated residential plots
                    from 80 to 250 sq. yds. with 30 ft wide interlocked paved roads, grand entrance
                    arch, perimeter boundary, and complete civic amenities.
                  </>
                )}
              </p>

              {/* Key Spec Grid */}
              <div className="mt-6 grid grid-cols-2 gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-xs">
                {TOWNSHIP_SPECS.map((spec, i) => (
                  <div key={i}>
                    <span className="block text-[11px] text-slate-400">
                      {isHindi ? spec.labelHi : spec.labelEn}
                    </span>
                    <strong className={spec.highlight ? 'text-emerald-400' : 'text-white'}>
                      {spec.value}
                    </strong>
                  </div>
                ))}
              </div>

              {/* Amenities Checklist */}
              <div className="mt-5 grid grid-cols-1 gap-2 text-xs text-slate-300 sm:grid-cols-2">
                {TOWNSHIP_AMENITIES.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                    <span>{isHindi ? amenity.hi : amenity.en}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={KHATU_CONTACT.projectPath}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-xs font-bold text-slate-950 uppercase shadow-md transition-colors hover:from-amber-400 hover:to-amber-500"
                >
                  <span>{isHindi ? 'टाउनशिप लेआउट देखें' : 'View Master Plan & Layout'}</span>
                  <ArrowRight size={14} />
                </Link>

                <a
                  href={KHATU_CONTACT.brochurePdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/10"
                >
                  <FileDown size={14} className="text-amber-400" />
                  <span>{isHindi ? 'ब्रोशर PDF' : 'Brochure PDF'}</span>
                </a>

                <a
                  href={KHATU_CONTACT.whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-2.5 text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-500 hover:text-slate-950"
                >
                  <span>WhatsApp Inquiry</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
