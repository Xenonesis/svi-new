import React from 'react';
import { Compass, ShieldCheck, TrendingUp, Building2 } from 'lucide-react';

export interface AreasHeroProps {
  isHindi?: boolean;
}

export function AreasHero({ isHindi = false }: AreasHeroProps): React.JSX.Element {
  return (
    <section className="relative overflow-hidden border-b border-amber-500/20 bg-linear-to-b from-[#0e1626] via-[#101b30] to-[#0a1120] pt-32 pb-20 text-white">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:4rem_4rem]"
        aria-hidden="true"
      />

      <div className="relative container mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold tracking-widest text-amber-300 uppercase shadow-inner">
          <Compass className="h-3.5 w-3.5 text-amber-400" />
          <span>{isHindi ? 'रणनीतिक विकास क्षेत्र' : 'Strategic Growth Corridors'}</span>
        </div>

        <h1 className="mt-6 font-serif text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
          {isHindi ? (
            <>
              जहाँ जयपुर का विकास है, <br />
              <span className="bg-linear-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                वहाँ हमारी टाउनशिप हैं
              </span>
            </>
          ) : (
            <>
              Where Jaipur Grows, <br />
              <span className="bg-linear-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                We Build Legacy Corridors
              </span>
            </>
          )}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
          {isHindi
            ? 'जयपुर से खाटू श्याम जी हाईवे, नायला एवं फुलेरा स्मार्ट सिटी (DMIC कॉरिडोर) के सबसे तेजी से विकसित हो रहे रणनीतिक क्षेत्रों में सुरक्षित, 100% कानूनी और उच्च रिटर्न वाले आवासीय भूखंड।'
            : 'Curated high-potential corridors backed by multi-lane national highways, the Jaipur to Khatu Shyam Ji Highway, Nayla, and the Delhi-Mumbai Industrial Corridor with complete legal clarity.'}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-300 sm:text-sm">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            {isHindi ? '100% वैध दस्तावेज़' : '100% Legal Clear Titles'}
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-amber-400" />
            {isHindi ? 'उच्च पूंजी वृद्धि' : 'High Capital Appreciation'}
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-blue-400" />
            {isHindi ? 'मास्टर प्लान टाउनशिप' : 'Master-Planned Townships'}
          </span>
        </div>
      </div>
    </section>
  );
}
