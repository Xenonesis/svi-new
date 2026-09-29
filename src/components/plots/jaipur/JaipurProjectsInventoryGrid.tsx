import Image from 'next/image';
import Link from 'next/link';
import { MapPin, CheckCircle2, ShieldCheck, FileDown, ArrowRight } from 'lucide-react';
import { JAIPUR_PROJECTS, type JaipurProject } from './jaipurPlotsData';

export interface JaipurProjectsInventoryGridProps {
  isHindi: boolean;
  locale?: string;
  projects?: JaipurProject[];
}

export function JaipurProjectsInventoryGrid({
  isHindi,
  projects = JAIPUR_PROJECTS,
}: JaipurProjectsInventoryGridProps) {
  return (
    <section id="projects-inventory" className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-12 text-center">
          <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
            {isHindi ? 'प्राइम लोकेशन्स' : 'Strategic Jaipur Corridors'}
          </span>
          <h2 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
            {isHindi
              ? 'जयपुर में हमारे प्रमुख टाउनशिप प्रोजेक्ट्स'
              : 'Featured Plotted Townships in Jaipur'}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs text-slate-400 sm:text-sm">
            {isHindi
              ? 'अपनी बजट और लोकेशन प्राथमिकता के अनुसार सत्यापित प्लॉट चुनें।'
              : 'Choose from meticulously planned plotted developments with complete infrastructural amenities.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl transition-all duration-300 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
                <Image
                  src={proj.img}
                  alt={proj.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-slate-950/80 px-3 py-1 text-[10px] font-bold text-amber-400 backdrop-blur-md">
                  <ShieldCheck size={12} />
                  <span>Verified Registry</span>
                </div>
                <div className="absolute top-4 right-4 z-10 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold text-slate-950 shadow-md">
                  {proj.priceBadge}
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="mb-1 flex items-center gap-1.5 text-xs text-amber-400">
                  <MapPin size={13} />
                  <span>{isHindi ? proj.corridorHi : proj.corridor}</span>
                </div>

                <h3 className="font-serif text-2xl font-bold text-white transition-colors group-hover:text-amber-200">
                  {isHindi ? proj.titleHi : proj.title}
                </h3>

                <div className="mt-2 text-xs text-slate-300">
                  <strong>Plot Sizes:</strong> {proj.size}
                </div>

                <ul className="mt-4 space-y-2 border-t border-white/10 pt-4 text-xs text-slate-400">
                  {proj.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex items-center gap-3 pt-4">
                  <Link
                    href={proj.href}
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/20"
                  >
                    <span>Explore Layout</span>
                    <ArrowRight size={14} />
                  </Link>

                  <a
                    href={proj.brochureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-300 transition-colors hover:bg-amber-500 hover:text-slate-950"
                  >
                    <FileDown size={14} />
                    <span>PDF</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default JaipurProjectsInventoryGrid;
