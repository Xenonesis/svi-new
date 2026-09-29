import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, FileDown } from 'lucide-react';

interface PlotsUnder20LakhsFeaturedProps {
  isHindi: boolean;
}

export function PlotsUnder20LakhsFeatured({ isHindi }: PlotsUnder20LakhsFeaturedProps) {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-amber-500/30 bg-slate-900/60 p-6 shadow-2xl sm:p-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
              <Image
                src="/Shivani Vatika 11/gate.webp"
                alt="Shivani Vatika 11th - Affordable Residential Plots Under 20 Lakhs on Jaipur Khatu Shyam Ji Highway, Harsholi"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute top-3 left-3 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold text-slate-950">
                Best Value 2026
              </div>
            </div>

            <div>
              <div className="text-xs font-bold tracking-widest text-amber-400 uppercase">
                {isHindi ? 'शीर्ष अनुशंसित बजट विकल्प' : 'Top Recommended Budget Option'}
              </div>
              <h2 className="mt-2 font-serif text-2xl font-bold text-white sm:text-3xl">
                Shivani Vatika 11th
              </h2>
              <p className="mt-1 text-xs text-amber-400">
                {isHindi
                  ? 'जयपुर - खाटू श्याम जी हाईवे, हरसोली'
                  : 'Jaipur - Khatu Shyam Ji Highway, Harsholi'}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {isHindi
                  ? 'कॉम्पैक्ट 80 और 100 वर्ग गज के आवासीय प्लॉट्स, उत्कृष्ट स्पेस उपयोग, न्यूक्लियर फैमिली और लॉन्ग-टर्म रिटर्न के लिए आदर्श।'
                  : 'Compact 80 and 100 sq. yard residential plots engineered for maximum space efficiency, perfect for nuclear families and long-term capital appreciation.'}
              </p>

              <div className="mt-6 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                  <span>
                    {isHindi
                      ? '₹ 15 लाख* से किफायती शुरुआती बजट'
                      : 'Affordable entry point starting at ₹ 15 Lakhs*'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                  <span>
                    {isHindi
                      ? 'बिजली पोल और चौड़ी सड़कों के साथ तैयार कब्जा'
                      : 'Ready possession with electrical poles and wide roads'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                  <span>
                    {isHindi
                      ? 'रेनवाल रेलवे स्टेशन और हाईवे से त्वरित कनेक्टिविटी'
                      : 'Quick connectivity to Renwal station and highway'}
                  </span>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <Link
                  href="/projects/shivani-vatika-11th"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 uppercase hover:bg-amber-400"
                >
                  <span>{isHindi ? 'प्लॉट्स देखें' : 'Explore Plots'}</span>
                  <ArrowRight size={14} />
                </Link>

                <a
                  href="/Shivani Vatika 11/ShivaniVatika 11.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/10"
                >
                  <FileDown size={14} />
                  <span>{isHindi ? 'विवरणिका' : 'Brochure'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
