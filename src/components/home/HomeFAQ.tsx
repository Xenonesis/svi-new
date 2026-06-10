'use client';

import { useLocale } from 'next-intl';
import FAQSection from '@/src/components/common/FAQSection';
import { BUYING_PROCESS_FAQS, INVESTMENT_FAQS } from '@/src/data/faq/general';
import { BUYING_PROCESS_FAQS_HI, INVESTMENT_FAQS_HI } from '@/src/data/faq/hi';

export default function HomeFAQ() {
  const locale = useLocale();
  const isHindi = locale === 'hi';

  const buyFaqs = isHindi ? BUYING_PROCESS_FAQS_HI : BUYING_PROCESS_FAQS;
  const invFaqs = isHindi ? INVESTMENT_FAQS_HI : INVESTMENT_FAQS;

  const allFaqs = [...buyFaqs.slice(0, 3), ...invFaqs.slice(0, 3)];

  return (
    <FAQSection
      items={allFaqs}
      title={isHindi ? 'कोई सवाल?' : 'Have Questions?'}
      subtitle={
        isHindi
          ? 'SVI Infra से प्रॉपर्टी खरीदने के बारे में हमारे ग्राहकों के अक्सर पूछे जाने वाले सवाल — जवाब के साथ।'
          : 'Here are some common questions our clients ask about buying property with SVI Infra.'
      }
      variant="brand"
      hideCTA={true}
      defaultActiveIndex={-1}
    />
  );
}
