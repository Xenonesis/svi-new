'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Network, ShieldCheck, HardHat, TrendingUp, Handshake, Headset } from 'lucide-react';
import AnimatedSection, {
  StaggerContainer,
  StaggerItem,
} from '@/src/components/ui/AnimatedSection';
import { GlowCard } from '@/src/components/ui/spotlight-card';

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
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 800px' }}
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

        <StaggerContainer className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <StaggerItem key={idx}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                <GlowCard
                  customSize={true}
                  glowColor="orange"
                  className="group relative h-full cursor-pointer p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8 md:p-10 dark:shadow-none"
                >
                  <div className="text-brand-gold mb-6 flex h-12 w-12 shrink-0 items-center justify-center">
                    {FEATURE_ICONS[idx]}
                  </div>
                  <h3 className="text-brand-navy mb-4 font-serif text-2xl dark:text-gray-200">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {feature.desc}
                  </p>
                </GlowCard>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
