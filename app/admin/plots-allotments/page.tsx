'use client';

import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/en.json';
import PortalAllotmentsAdmin from '@/app/[locale]/(main)/admin/portal-allotments/page';

export default function PlotsAllotmentsPage() {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <PortalAllotmentsAdmin />
    </NextIntlClientProvider>
  );
}
