import React from 'react';
import Link from 'next/link';
import { Compass, ShieldCheck, TrendingUp, ArrowRight } from 'lucide-react';

export interface AreasWhyInvestProps {
  isHindi?: boolean;
}

export function AreasWhyInvest({ isHindi = false }: AreasWhyInvestProps): React.JSX.Element {
  return (
    <section className="container mx-auto mt-20 px-4">
      <div className="rounded-3xl border border-amber-500/20 bg-linear-to-r from-[#0c1322] via-[#101b30] to-[#0c1322] p-8 text-white sm:p-12">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
            {isHindi ? 'रणनीतिक चयन' : 'Investment Philosophy'}
          </span>
          <h2 className="mt-2 font-serif text-2xl font-bold sm:text-4xl">
            {isHindi
              ? 'हम केवल उच्च विकास वाले कॉरिडोर क्यों चुनते हैं?'
              : 'Why SVI Develops Exclusively Along Major Corridors'}
          </h2>
          <p className="mt-4 text-xs leading-relaxed text-slate-300 sm:text-base">
            {isHindi
              ? 'रियल एस्टेट में लाभ स्थान से नहीं, बल्कि भविष्य की कनेक्टिविटी से तय होता है। हमारे सभी प्रोजेक्ट्स आगामी रिंग रोड, डीएमआईसी और राष्ट्रीय राजमार्गों से जुड़े हुए हैं।'
              : 'Real estate wealth is created at the intersection of government infrastructure and private capital. Every SVI township is strategically positioned ahead of civic growth curves.'}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/20 text-amber-400">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">
              {isHindi ? 'हाईवे एवं एक्सप्रेसवे कनेक्टिविटी' : 'Infrastructure Centric'}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              {isHindi
                ? 'जयपुर रिंग रोड, डीएमआईसी फ्रेट कॉरिडोर और खाटू श्याम जी हाईवे जैसे प्रमुख मार्गों पर स्थित प्रोजेक्ट्स।'
                : 'Zero isolated locations. Direct access to 4/6-lane arterial corridors and upcoming rapid transit.'}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">
              {isHindi ? '100% स्पष्ट दस्तावेज़ीकरण' : 'Bank-Grade Due Diligence'}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              {isHindi
                ? 'तत्काल रजिस्ट्री, दाखिल खारिज और जेडीए/143 नियमों के अनुरूप पारदर्शी विकास कार्य।'
                : 'Pre-vetted land ownership, clear demarcation, and 100% registry-ready parcels for peace of mind.'}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/20 text-blue-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">
              {isHindi ? 'उच्च पूंजी प्रशंसा (ROI)' : 'First-Mover Value Gain'}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              {isHindi
                ? 'प्रारंभिक चरण में निवेश करने वाले ग्राहकों के लिए अधिकतम रिटर्न और सुरक्षित परिसंपत्ति निर्माण।'
                : 'Early entry in notified smart city and logistics clusters ensures maximum compound appreciation.'}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 text-center sm:flex-row">
          <Link
            href="/registration"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-300 active:scale-98 sm:text-sm"
          >
            <span>{isHindi ? 'प्रोजेक्ट विज़िट बुक करें' : 'Book a Corridor Site Visit'}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-xs font-bold text-white transition-all hover:bg-white/20 active:scale-98 sm:text-sm"
          >
            <span>{isHindi ? 'सलाहकार से संपर्क करें' : 'Talk to a Land Specialist'}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
