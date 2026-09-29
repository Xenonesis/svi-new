import { Sparkles, ArrowRight, FileDown, PhoneCall } from 'lucide-react';
import { KHATU_CONTACT } from './khatuData';

interface KhatuCtaBannerProps {
  isHindi: boolean;
}

export function KhatuCtaBanner({ isHindi }: KhatuCtaBannerProps) {
  return (
    <section className="relative overflow-hidden border-t border-amber-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/60 py-16 sm:py-20">
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl" />
      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-semibold text-amber-300 uppercase">
            <Sparkles size={14} className="text-amber-400" />
            <span>{isHindi ? 'निःशुल्क एसी कैब सुविधा' : 'Zero Cost Doorstep Inspection'}</span>
          </div>

          <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            {isHindi
              ? 'खाटू श्याम जी हाईवे कॉरिडोर का प्रत्यक्ष अनुभव लें'
              : 'Experience the Khatu Shyam Highway Corridor Firsthand'}
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-xs leading-relaxed text-slate-300 sm:text-sm md:text-base">
            {isHindi ? (
              <>
                हम जयपुर में आपके घर से शिवानी वाटिका 11th (हरसोली) तक और वापस जाने के लिए पूर्णतः
                निःशुल्क प्राइवेट एसी कैब प्रदान करते हैं। बिना किसी खरीद बाध्यता के 4-लेन हाईवे,
                भव्य गेट, पक्की सड़कों और 100% स्पष्ट कागजातों का स्वयं निरीक्षण करें।
              </>
            ) : (
              <>
                We arrange a complimentary private chauffeured AC cab from your doorstep anywhere in
                Jaipur directly to Shivani Vatika 11th (Harsholi) and back. Inspect the 4-lane
                highway, gated infrastructure, and verified 90-A registry records with zero
                obligation.
              </>
            )}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href={KHATU_CONTACT.whatsappCabUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-3.5 text-xs font-bold tracking-wider text-slate-950 uppercase shadow-lg shadow-amber-500/25 transition-all hover:from-amber-400 hover:to-amber-500"
            >
              <span>{isHindi ? 'फ्री कैब साइट विजिट बुक करें' : 'Book Free Site Visit Cab'}</span>
              <ArrowRight size={16} />
            </a>

            <a
              href={KHATU_CONTACT.brochurePdf}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-md transition-colors hover:border-amber-400/50 hover:bg-white/10"
            >
              <FileDown size={16} className="text-amber-400" />
              <span>{isHindi ? 'ब्रोशर PDF डाउनलोड करें' : 'Download Master Plan PDF'}</span>
            </a>

            <a
              href={`tel:${KHATU_CONTACT.phone}`}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-md transition-colors hover:border-amber-400/50 hover:bg-white/10"
            >
              <PhoneCall size={16} className="text-amber-400" />
              <span>{KHATU_CONTACT.phoneDisplay}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
