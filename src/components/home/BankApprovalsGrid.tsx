'use client';

import {
  CalendarCheck,
  ShieldAlert,
  Receipt,
  FileCheck,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useLocale } from 'next-intl';
import AnimatedSection from '@/src/components/ui/AnimatedSection';

const PAYMENT_ADVANTAGES = [
  {
    icon: Sparkles,
    titleEn: 'Minimal Token Booking',
    titleHi: 'न्यूनतम टोकन बुकिंग',
    descEn: 'Reserve your plot with easy initial token amount',
    descHi: 'आसान प्रारंभिक टोकन राशि से अपना प्लॉट सुरक्षित करें',
  },
  {
    icon: CalendarCheck,
    titleEn: 'Milestone Installments',
    titleHi: 'आसान किस्तों में भुगतान',
    descEn: 'Flexible timeline tailored to development stages',
    descHi: 'डेवलपमेंट के अनुसार आसान समय-सीमा में भुगतान',
  },
  {
    icon: ShieldAlert,
    titleEn: 'Zero Loan Processing Fee',
    titleHi: 'जीरो लोन प्रोसेसिंग फीस',
    descEn: 'No bank file charges, file delays, or hidden interest',
    descHi: 'कोई बैंक फाइल शुल्क, देरी या छिपा ब्याज नहीं',
  },
  {
    icon: Receipt,
    titleEn: 'Direct Developer Receipts',
    titleHi: 'कंपनी की अधिकृत रसीदें',
    descEn: 'Instant official digital receipts for every payment',
    descHi: 'प्रत्येक भुगतान पर तुरंत आधिकारिक डिजिटल रसीद',
  },
  {
    icon: FileCheck,
    titleEn: 'Immediate Registry',
    titleHi: 'भुगतान पर तुरंत रजिस्ट्री',
    descEn: 'Clear title transfer without waiting for bank NOCs',
    descHi: 'बिना बैंक एनओसी के झंझट के तुरंत नाम ट्रांसफर',
  },
];

export default function BankApprovalsGrid() {
  const locale = useLocale();
  const isHindi = locale === 'hi';

  return (
    <AnimatedSection type="fadeUp" delay={0.2}>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md md:p-8 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 text-center md:flex md:items-center md:justify-between md:text-left">
          <div>
            <span className="dark:text-brand-gold text-[10px] font-bold tracking-widest text-amber-600 uppercase">
              {isHindi ? 'भुगतान में सुगमता' : 'DIRECT DEVELOPER PAYMENT PLANS'}
            </span>
            <h3 className="mt-1 font-serif text-xl font-bold text-gray-900 md:text-2xl dark:text-gray-100">
              {isHindi
                ? 'आसान किस्तों और पारदर्शी शर्तों पर प्लॉट ओनरशिप'
                : 'Flexible Installments & Direct Developer Payment Terms'}
            </h3>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600 md:mt-0 dark:text-emerald-400">
            <CheckCircle2 size={16} />
            <span>
              {isHindi
                ? 'जीरो बैंक फाइल झंझट • डायरेक्ट कंपनी डीलिंग'
                : 'Zero Bank Hassle • 100% Direct Developer Terms'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {PAYMENT_ADVANTAGES.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="group hover:border-brand-gold relative flex flex-col rounded-xl border border-gray-200 bg-gray-50/80 p-4 text-center transition-all duration-300 hover:bg-white hover:shadow-md dark:border-gray-800 dark:bg-gray-800/80 dark:hover:bg-gray-800"
              >
                <div className="mb-3 flex justify-center">
                  <div className="dark:text-brand-gold rounded-lg bg-amber-500/10 p-2.5 text-amber-600 transition-transform group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  {isHindi ? item.titleHi : item.titleEn}
                </span>
                <p className="mt-1.5 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                  {isHindi ? item.descHi : item.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </AnimatedSection>
  );
}
