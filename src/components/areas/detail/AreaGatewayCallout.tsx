import { Link } from '@/src/i18n/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { CommercialHubConfig } from './areaDetailData';

export interface AreaGatewayCalloutProps {
  commercialHub?: CommercialHubConfig | null;
  isHindi?: boolean;
}

export function AreaGatewayCallout({ commercialHub, isHindi = false }: AreaGatewayCalloutProps) {
  if (!commercialHub) return null;

  return (
    <div className="mb-10">
      <Link
        href={commercialHub.href}
        className="group border-brand-gold/40 from-brand-navy to-brand-navy hover:border-brand-gold focus:ring-brand-gold relative block overflow-hidden rounded-2xl border-2 bg-gradient-to-r via-[#0c1a30] p-6 text-white shadow-xl transition-all duration-300 hover:scale-[1.005] hover:shadow-2xl focus:ring-2 focus:ring-offset-2 focus:outline-none md:p-8"
      >
        {/* Subtle gold ambient glow */}
        <div
          className="bg-brand-gold/15 pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full blur-3xl transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl space-y-2.5">
            <div className="border-brand-gold/40 bg-brand-gold/15 text-brand-gold inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isHindi ? commercialHub.badge.hi : commercialHub.badge.en}</span>
            </div>

            <h2 className="text-xl font-bold tracking-tight text-white transition-colors duration-200 group-hover:text-amber-200 md:text-2xl">
              {isHindi ? commercialHub.headline.hi : commercialHub.headline.en}
            </h2>

            <p className="text-xs leading-relaxed text-gray-300 md:text-sm">
              {isHindi ? commercialHub.description.hi : commercialHub.description.en}
            </p>
          </div>

          <div className="via-brand-gold text-brand-navy group-hover:shadow-brand-gold/30 inline-flex shrink-0 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-bold shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
            <span>{isHindi ? commercialHub.ctaText.hi : commercialHub.ctaText.en}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </div>
  );
}

export default AreaGatewayCallout;
