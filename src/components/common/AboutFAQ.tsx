'use client';

import FAQSection from '@/src/components/common/FAQSection';
import { INVESTMENT_FAQS, LEGAL_FAQS } from '@/src/data/faq/general';

const ABOUT_FAQS = [...INVESTMENT_FAQS, ...LEGAL_FAQS];

export default function AboutFAQ() {
  return (
    <FAQSection
      items={ABOUT_FAQS}
      title="Why Choose SVI Infra?"
      subtitle="Learn more about our commitment to quality, transparency, and customer satisfaction."
      variant="light"
      hideCTA={true}
      defaultActiveIndex={-1}
    />
  );
}
