'use client';

import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/en.json';
import PlotsAllotmentsPage from '@/app/[locale]/(main)/admin/plots-allotments/page';

export default function PlotsAllotmentsRoute() {
  return (
    <NextIntlClientProvider locale="en" messages={messages} timeZone="Asia/Kolkata">
      <PlotsAllotmentsPage />
    </NextIntlClientProvider>
  );
}
