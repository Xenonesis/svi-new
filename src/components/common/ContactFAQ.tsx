'use client';

import FAQSection from '@/src/components/common/FAQSection';
import { BUYING_PROCESS_FAQS, LEGAL_FAQS } from '@/src/data/faq/general';

const CONTACT_FAQS = [...BUYING_PROCESS_FAQS.slice(0, 4), ...LEGAL_FAQS.slice(0, 2)];

export default function ContactFAQ() {
  return (
    <FAQSection
      items={CONTACT_FAQS}
      title="Common Questions"
      subtitle="Quick answers before you reach out to us."
      variant="light"
      maxWidth="max-w-3xl"
      hideCTA={true}
      defaultActiveIndex={-1}
    />
  );
}
