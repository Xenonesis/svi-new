'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/stores/authStore';
import { AlertCircle } from 'lucide-react';

import { IvrFilterSection } from '@/src/components/admin/ivr/IvrFilterSection';
import { IvrLogsTable } from '@/src/components/admin/ivr/IvrLogsTable';
import { IvrDialer } from '@/src/components/admin/ivr/IvrDialer';
import { IvrApiDocs } from '@/src/components/admin/ivr/IvrApiDocs';
import { IvrStatsGrid } from '@/src/components/admin/ivr/IvrStatsGrid';
import { IvrTabNav, type IvrTab } from '@/src/components/admin/ivr/IvrTabNav';
import { useIvrData } from '@/src/components/admin/ivr/useIvrData';

const GRID_STYLE = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(212, 175, 55, 0.05) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};

export default function IvrManagerPage() {
  const router = useRouter();
  const { token, isAdmin, loading: authLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<IvrTab>('incoming');
  const ivr = useIvrData({ token, activeTab });

  useEffect(() => {
    if (!authLoading && !isAdmin) router.replace('/admin');
  }, [isAdmin, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="border-t-brand-gold h-10 w-10 animate-spin rounded-full border-4 border-gray-200" />
      </div>
    );
  }

  const isHistoryTab = (activeTab === 'incoming' || activeTab === 'outgoing') && !ivr.fetchError;

  return (
    <div className="relative w-full font-sans">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="bg-brand-navy-light/10 absolute top-0 right-0 h-[450px] w-[450px] rounded-full blur-[120px]" />
        <div className="bg-brand-gold/5 absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-80" style={GRID_STYLE} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-brand-navy mb-1.5 font-serif text-4xl tracking-tight dark:text-white">
              IVR{' '}
              <span
                className="text-gradient-gold animate-bg-pan inline-block pr-2.5 italic"
                style={{
                  backgroundSize: '200% 200%',
                  backgroundImage:
                    'linear-gradient(135deg, #d4af37, #f0d080, #b08f36, #dec070, #d4af37)',
                }}
              >
                Telephony Manager
              </span>
            </h1>
            <p className="text-xs tracking-wide text-gray-600 dark:text-gray-400">
              Manage incoming/outgoing voice traffic, play call recordings, and dial out to
              customers.
            </p>
          </div>
        </div>

        {ivr.fetchError && (
          <div className="mb-6 flex gap-2.5 rounded-lg border border-red-500/25 bg-red-950/20 p-4 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-semibold">Telephony Gateway Error</p>
              <p className="mt-0.5">{ivr.fetchError}</p>
              <button
                onClick={() => ivr.fetchHistory()}
                className="text-brand-gold mt-2 font-bold underline"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {isHistoryTab && <IvrStatsGrid statics={ivr.statics} />}
        <IvrTabNav activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="space-y-6">
          {isHistoryTab && <IvrFilterSection {...ivr.filterProps} />}
          {isHistoryTab && <IvrLogsTable activeTab={activeTab} {...ivr.logsTableProps} />}
          {activeTab === 'dialer' && <IvrDialer token={token} />}
          {activeTab === 'docs' && <IvrApiDocs />}
        </div>
      </div>
    </div>
  );
}
