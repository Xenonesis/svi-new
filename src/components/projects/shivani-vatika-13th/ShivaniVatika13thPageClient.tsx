'use client';

import { useState } from 'react';
import { SV13HeroSection } from './SV13HeroSection';
import { SV13OverviewSection } from './SV13OverviewSection';
import { SV13MasterPlanSection } from './SV13MasterPlanSection';
import { SV13AmenitiesSection } from './SV13AmenitiesSection';
import { SV13PaymentPlanSection } from './SV13PaymentPlanSection';
import { SV13LocationSection } from './SV13LocationSection';
import { SV13AttractionsSection } from './SV13AttractionsSection';
import { SV13GallerySection } from './SV13GallerySection';
import { SV13WhyChooseSection } from './SV13WhyChooseSection';
import { SV13EnquirySection } from './SV13EnquirySection';
import { SV13ContactSection } from './SV13ContactSection';
import { SV13FloatingBar } from './SV13FloatingBar';
import { SiteVisitModal } from '@/src/components/layout/SiteVisitModal';
import type { SV13PlotData } from '@/src/data/shivaniVatika13Plots';

interface ShivaniVatika13thPageClientProps {
  isHindi?: boolean;
}

export function ShivaniVatika13thPageClient({ isHindi = false }: ShivaniVatika13thPageClientProps) {
  const [isSiteVisitOpen, setIsSiteVisitOpen] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState<SV13PlotData | null>(null);

  const handleOpenSiteVisit = () => {
    setIsSiteVisitOpen(true);
  };

  const handleCloseSiteVisit = () => {
    setIsSiteVisitOpen(false);
  };

  const handleDownloadBrochure = () => {
    // Open brochure or trigger download
    const link = document.createElement('a');
    link.href = '/Shivani Vatika 11/shivani-vatika-11th-brochure.pdf';
    link.download = 'Shivani-Vatika-13th-Brochure.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBookPlot = (plot: SV13PlotData) => {
    setSelectedPlot(plot);
    const enquiryEl = document.getElementById('enquiry');
    if (enquiryEl) {
      enquiryEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEnquirePlan = () => {
    const enquiryEl = document.getElementById('enquiry');
    if (enquiryEl) {
      enquiryEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 font-sans text-white">
      {/* 1. Hero Section */}
      <SV13HeroSection
        isHindi={isHindi}
        onBookSiteVisit={handleOpenSiteVisit}
        onDownloadBrochure={handleDownloadBrochure}
      />

      {/* 2. Project Overview */}
      <SV13OverviewSection isHindi={isHindi} />

      {/* 3. Interactive Project Master Plan (60 Plots) */}
      <SV13MasterPlanSection isHindi={isHindi} onBookPlot={handleBookPlot} />

      {/* 4. Amenities & Features Grid */}
      <SV13AmenitiesSection isHindi={isHindi} />

      {/* 5. Payment Plan */}
      <SV13PaymentPlanSection isHindi={isHindi} onEnquirePlan={handleEnquirePlan} />

      {/* 6. Location & Connectivity */}
      <SV13LocationSection isHindi={isHindi} />

      {/* 7. Life Around Shivani Vatika (Regional Attractions) */}
      <SV13AttractionsSection isHindi={isHindi} />

      {/* 8. Project Gallery */}
      <SV13GallerySection isHindi={isHindi} />

      {/* 9. Why Choose Shivani Vatika 13th? */}
      <SV13WhyChooseSection isHindi={isHindi} />

      {/* 10. Enquiry & Site Visit Form */}
      <SV13EnquirySection isHindi={isHindi} prefilledPlotNo={selectedPlot?.plotNo || ''} />

      {/* 11. Contact Details */}
      <SV13ContactSection isHindi={isHindi} />

      {/* 12. Floating CTAs & Mobile Bar */}
      <SV13FloatingBar isHindi={isHindi} onBookSiteVisit={handleOpenSiteVisit} />

      {/* Global Interactive Site Visit Modal */}
      <SiteVisitModal
        isOpen={isSiteVisitOpen}
        onClose={handleCloseSiteVisit}
        prefilledProject="Shivani Vatika 13th (Sambhar-Phulera)"
        prefilledPlot={selectedPlot?.plotNo}
      />
    </div>
  );
}
