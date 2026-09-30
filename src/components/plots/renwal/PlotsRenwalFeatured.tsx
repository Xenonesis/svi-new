import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, FileDown } from 'lucide-react';

interface PlotsRenwalFeaturedProps {
  isHindi: boolean;
}

export function PlotsRenwalFeatured({ isHindi }: PlotsRenwalFeaturedProps) {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-amber-500/30 bg-slate-900/60 p-6 shadow-2xl sm:p-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
              <Image
                src="/Shivani Vatika 11/gate.webp"
                alt="Shivani Vatika 11th - Main Grand Entrance Gate near Kishangarh Renwal Railway Station and RIICO Industrial Area"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute top-3 left-3 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-bold text-slate-950">
                {isHindi ? 'प्रगतिशील टाउनशिप' : 'Ongoing Development'}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold tracking-widest text-amber-400 uppercase">
                {isHindi ? 'रेनवाल के पास प्रमुख टाउनशिप' : 'Flagship Township Near Renwal'}
              </div>
              <h2 className="mt-2 font-serif text-2xl font-bold text-white sm:text-3xl">
                Shivani Vatika 11th (Harsholi)
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {isHindi
                  ? 'खाटू श्याम जी हाईवे कॉरिडोर पर रेनवाल के समीप स्थित, शिवानी वाटिका 11th संपूर्ण बुनियादी ढांचे और आधुनिक सुविधाओं के साथ आवासीय जीवन प्रदान करती है।'
                  : 'Located directly on the Khatu Shyam Ji corridor near Renwal, Shivani Vatika 11th offers master-planned residential living with complete infrastructural amenities.'}
              </p>

              <div className="mt-6 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                  <span>
                    {isHindi
                      ? '40 फीट चौड़ी डामर सड़कें एवं डिमार्केटेड कॉर्नर पिलर्स'
                      : '40 ft wide blacktop roads & demarcated corner pillars'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                  <span>
                    {isHindi
                      ? 'रेनवाल रेलवे जंक्शन से मात्र 8-10 मिनट की दूरी'
                      : 'Just 8-10 mins from Renwal Railway Junction'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                  <span>
                    {isHindi
                      ? 'रीको इंडस्ट्रियल क्षेत्र (64 एकड़) से 5 मिनट की निकटता'
                      : '5 mins to RIICO Industrial Area (64 Acres)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                  <span>
                    {isHindi
                      ? 'मान्यता प्राप्त बैंकों से 80% तक बैंक ऋण सुविधा'
                      : 'Up to 80% bank loan approval available'}
                  </span>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <Link
                  href="/projects/shivani-vatika-11th"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 uppercase hover:bg-amber-400"
                >
                  <span>{isHindi ? 'टाउनशिप देखें' : 'View Township'}</span>
                  <ArrowRight size={14} />
                </Link>

                <a
                  href="/Shivani Vatika 11/ShivaniVatika 11.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/10"
                >
                  <FileDown size={14} />
                  <span>{isHindi ? 'विवरणिका डाउनलोड' : 'Download Brochure'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
