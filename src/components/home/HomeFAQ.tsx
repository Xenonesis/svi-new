'use client';

import FAQSection from '@/src/components/common/FAQSection';
import { BUYING_PROCESS_FAQS, INVESTMENT_FAQS } from '@/src/data/faq/general';

const HOME_FAQS = [...BUYING_PROCESS_FAQS.slice(0, 3), ...INVESTMENT_FAQS.slice(0, 3)];

export default function HomeFAQ() {
  return (
    <FAQSection
      items={HOME_FAQS}
      title="Have Questions?"
      subtitle="Here are some common questions our clients ask about buying property with SVI Infra."
      variant="brand"
      hideCTA={true}
      defaultActiveIndex={-1}
    />
  );
}
