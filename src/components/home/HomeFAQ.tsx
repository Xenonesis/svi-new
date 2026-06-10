'use client';

import { useTranslations } from 'next-intl';
import FAQSection from '@/src/components/common/FAQSection';
import { BUYING_PROCESS_FAQS, INVESTMENT_FAQS } from '@/src/data/faq/general';

const HOME_FAQS = [...BUYING_PROCESS_FAQS.slice(0, 3), ...INVESTMENT_FAQS.slice(0, 3)];

export default function HomeFAQ() {
  const t = useTranslations('faq');
  return (
    <FAQSection
      items={HOME_FAQS}
      title={t('title')}
      subtitle={t('subtitle')}
      variant="brand"
      hideCTA={true}
      defaultActiveIndex={-1}
    />
  );
}
