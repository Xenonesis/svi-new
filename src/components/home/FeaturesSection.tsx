'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Network, ShieldCheck, HardHat, TrendingUp, Handshake, Headset } from 'lucide-react';
import AnimatedSection, {
  StaggerContainer,
  StaggerItem,
} from '@/src/components/ui/AnimatedSection';
import { GlowCard } from '@/src/components/ui/spotlight-card';
import MagicBento from '@/src/components/ui/MagicBento';

const FEATURE_ICONS = [
  <Network size={32} key="connectivity" />,
  <ShieldCheck size={32} key="security" />,
  <HardHat size={32} key="development" />,
  <TrendingUp size={32} key="growth" />,
  <Handshake size={32} key="transparent" />,
  <Headset size={32} key="support" />,
];

export default function FeaturesSection() {
  const t = useTranslations('whyInvest');

  const features = [
    { title: t('futureConnectivityTitle'), desc: t('futureConnectivityDesc') },
    { title: t('legalSecurityTitle'), desc: t('legalSecurityDesc') },
    { title: t('developmentReadyTitle'), desc: t('developmentReadyDesc') },
    { title: t('organicGrowthTitle'), desc: t('organicGrowthDesc') },
    { title: t('transparentTransactionsTitle'), desc: t('transparentTransactionsDesc') },
    { title: t('endToEndSupportTitle'), desc: t('endToEndSupportDesc') },
  ];

  return (
    <section
      className="dark:border-brand-gold/20 dark:bg-brand-dark-bg border-b border-transparent bg-gray-50 py-16 md:py-24"
      role="region"
      aria-label="Why investors choose SVI"
    >
      <div className="container mx-auto px-4">
        <AnimatedSection
          type="fadeUp"
          className="mx-auto mb-10 max-w-3xl text-center sm:mb-16 md:mb-20"
        >
          <h4 className="mb-4 text-[10px] font-semibold tracking-[0.2em] text-gray-400 uppercase dark:text-gray-500">
            {t('sectionTitle')}
          </h4>
          <h2 className="text-brand-navy mb-4 font-serif text-2xl sm:mb-6 sm:text-3xl md:text-5xl dark:text-gray-100">
            {t('heading')}
          </h2>
          <p className="text-base leading-relaxed text-gray-600 sm:text-lg dark:text-gray-400">
            {t('description')}
          </p>
        </AnimatedSection>

        <MagicBento
          cardData={features.map((feature, idx) => ({
            title: feature.title,
            desc: feature.desc,
            icon: FEATURE_ICONS[idx],
            label: '',
            color: 'transparent',
          }))}
          textAutoHide={false}
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={true}
          enableMagnetism={true}
          clickEffect={true}
          spotlightRadius={300}
          particleCount={12}
          glowColor="212, 175, 55"
        />
      </div>
    </section>
  );
}
