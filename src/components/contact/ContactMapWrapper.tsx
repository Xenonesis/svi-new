'use client';

import dynamic from 'next/dynamic';

const ContactMap = dynamic(() => import('@/src/components/contact/ContactMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
      <div className="border-brand-gold h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
    </div>
  ),
});

export default function ContactMapWrapper() {
  return <ContactMap />;
}
