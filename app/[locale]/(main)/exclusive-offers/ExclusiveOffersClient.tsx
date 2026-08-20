'use client';

import { useTranslations } from 'next-intl';
import {
  OffersHero,
  OffersVideoShowcase,
  OffersBenefitsAndCommission,
  OffersWhyPartner,
  OffersCtaCard,
} from '@/src/components/exclusive-offers';

export default function ExclusiveOffersClient() {
  const t = useTranslations('pages.exclusiveOffers');

  return (
    <div className="bg-brand-navy min-h-screen text-white" suppressHydrationWarning>
      {/* Hero Section with Interactive Calculator */}
      <OffersHero description={t('description')} />

      {/* Video Showcase / Virtual Tour Section */}
      <OffersVideoShowcase
        title={t('videoSectionTitle')}
        heading={t('videoSectionHeading')}
        desc={t('videoSectionDesc')}
      />

      {/* Benefits & Commission Grid Section */}
      <OffersBenefitsAndCommission
        benefitsTitle={t('brokerBenefitsTitle')}
        benefitsSubtitle={t('brokerBenefitsSubtitle')}
        commissionSubtitle={t('commissionStructureSubtitle')}
        commissionExample={t('commissionExample')}
        plotSizeHeader={t('plotSize')}
        commissionHeader={t('commission')}
        moreSizeMoreCommission={t('moreSizeMoreCommission')}
        benefitCommissionTitle={t('benefitCommissionTitle')}
        benefitCommissionDesc={t('benefitCommissionDesc')}
        benefitPayoutsTitle={t('benefitPayoutsTitle')}
        benefitPayoutsDesc={t('benefitPayoutsDesc')}
        benefitSupportTitle={t('benefitSupportTitle')}
        benefitSupportDesc={t('benefitSupportDesc')}
        benefitAssociationTitle={t('benefitAssociationTitle')}
        benefitAssociationDesc={t('benefitAssociationDesc')}
      />

      {/* Why Partner with SVI Section */}
      <OffersWhyPartner
        whyPartnerTitle={t('whyPartnerTitle')}
        primeLocations={t('primeLocations')}
        highDemand={t('highDemand')}
        clearTitles={t('clearTitles')}
        trustedDevelopment={t('trustedDevelopment')}
        quoteText={t('quoteText')}
      />

      {/* Interactive Call to Action Section */}
      <OffersCtaCard
        footerTitle={t('footerTitle')}
        contactUsForDeals={t('contactUsForDeals')}
        callWhatsapp={t('callWhatsapp')}
        locationsTitle={t('locationsTitle')}
        locationsList={t('locationsList')}
      />
    </div>
  );
}
