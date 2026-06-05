'use client';

import FAQSection from '@/src/components/common/FAQSection';
import { BUYING_PROCESS_FAQS } from '@/src/data/faq/general';

export default function RegistrationFAQ() {
  return (
    <FAQSection
      items={BUYING_PROCESS_FAQS}
      title="Registration FAQ"
      subtitle="Have questions about the registration process? Find answers here."
      variant="none"
      maxWidth="max-w-4xl"
      hideCTA={true}
      defaultActiveIndex={-1}
    />
  );
}
