'use client';

import FAQSection from '@/src/components/common/FAQSection';
import { PROJECT_FAQS } from '@/src/data/faq/general';

export default function ProjectsFAQ() {
  return (
    <FAQSection
      items={PROJECT_FAQS}
      title="About Our Projects"
      subtitle="Get answers to common questions about our real estate projects and developments."
      variant="light"
      hideCTA={true}
      defaultActiveIndex={-1}
    />
  );
}
