import { Link } from '@/src/i18n/navigation';
import { ArrowRight, Building2 } from 'lucide-react';
import { EmiCalculator } from '@/src/components/properties/EmiCalculator';
import AreaInquiryForm from '@/src/components/properties/AreaInquiryForm';
import type { CommercialHubConfig } from './areaDetailData';

export interface AreaSidebarCardProps {
  areaName: string;
  commercialHub?: CommercialHubConfig | null;
  isHindi?: boolean;
  className?: string;
}

export function AreaSidebarCard({
  areaName,
  commercialHub,
  isHindi = false,
  className = 'w-full lg:w-1/3',
}: AreaSidebarCardProps) {
  return (
    <aside className={className}>
      {commercialHub && (
        <div className="border-brand-gold/40 from-brand-navy mb-6 rounded-xl border bg-gradient-to-br to-[#0f213e] p-5 text-white shadow-md">
          <div className="text-brand-gold mb-2 inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase">
            <Building2 size={13} />
            <span>{isHindi ? 'कमर्शियल हब' : 'Commercial Plots Hub'}</span>
          </div>
          <p className="mb-3 text-sm font-medium text-white/90">
            {isHindi ? commercialHub.headline.hi : commercialHub.headline.en}
          </p>
          <Link
            href={commercialHub.href}
            className="bg-brand-gold text-brand-navy inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold shadow transition-all hover:bg-amber-300"
          >
            <span>{isHindi ? 'उपलब्ध प्लॉट्स देखें' : 'View Available Plots'}</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      )}
      <div className="dark:border-gray-850 sticky top-24 rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:bg-gray-900">
        <h3 className="text-brand-navy mb-2 font-serif text-xl dark:text-white">
          {isHindi ? `${areaName} के लिए पंजीकरण करें` : `Register for ${areaName}`}
        </h3>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          {isHindi
            ? 'साइट विजिट, बुकिंग और लेआउट की जानकारी के लिए हमारे स्थानीय रियल एस्टेट विशेषज्ञों से संपर्क करें।'
            : 'Contact our local real estate experts for site visits, bookings, and layouts.'}
        </p>

        <AreaInquiryForm areaName={areaName} />
      </div>

      <div className="mt-8">
        <EmiCalculator />
      </div>
    </aside>
  );
}

export default AreaSidebarCard;
