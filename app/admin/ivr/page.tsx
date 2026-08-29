'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/stores/authStore';
import { PhoneIncoming, PhoneOutgoing, PhoneCall, FileText, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

// Subcomponents
import { IvrFilterSection } from '@/src/components/admin/ivr/IvrFilterSection';
import { IvrLogsTable, CallRecord } from '@/src/components/admin/ivr/IvrLogsTable';
import { IvrDialer } from '@/src/components/admin/ivr/IvrDialer';
import { IvrApiDocs } from '@/src/components/admin/ivr/IvrApiDocs';

const GRID_STYLE = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(212, 175, 55, 0.05) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};

export default function IvrManagerPage() {
  const router = useRouter();
  const { token, isAdmin, loading: authLoading } = useAuthStore();

  // Tab State
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing' | 'dialer' | 'docs'>(
    'incoming'
  );

  // Call History State
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [statics, setStatics] = useState({ total: 0, answered: 0, missed: 0 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 8;

  // Real data state trackers
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filter States
  const [virtualNumber, setVirtualNumber] = useState('');
  const [toNumber, setToNumber] = useState('');
  const [fromNumber, setFromNumber] = useState('');
  const [status, setStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Protect Route
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace('/admin');
    }
  }, [isAdmin, authLoading, router]);

  // Fetch History
  const fetchHistory = async (targetPage = page) => {
    if (!token) return;
    setLoading(true);
    setFetchError(null);
    try {
      const offset = (targetPage - 1) * limit;
      const apiAction = activeTab === 'outgoing' ? 'outgoing-history' : 'history';

      const queryParams = new URLSearchParams({
        action: apiAction,
        offset: String(offset),
        limit: String(limit),
      });

      if (virtualNumber) queryParams.append('virtual_number', virtualNumber);
      if (toNumber) queryParams.append('to_number', toNumber);
      if (fromNumber) queryParams.append('from_number', fromNumber);
      if (status !== 'all') queryParams.append('status', status.toUpperCase()); // "ANSWERED" or "MISSED"
      if (startDate) queryParams.append('start_date', startDate);
      if (endDate) queryParams.append('end_date', endDate);

      const res = await fetch(`/api/admin/ivr?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();

      if (!res.ok) {
        setFetchError(json.status?.message || `Gateway returned error ${res.status}`);
        setCalls([]);
        setTotalCount(0);
        return;
      }

      setCalls(json.data || []);
      setTotalCount(json.statics?.total || 0);
      setStatics({
        total: json.statics?.total || 0,
        answered: json.statics?.answered || 0,
        missed: json.statics?.missed || 0,
      });
    } catch (err: any) {
      console.error(err);
      setFetchError(err.message || 'An error occurred while connecting to the proxy service.');
      setCalls([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when tab changes or filters update
  useEffect(() => {
    if (activeTab === 'incoming' || activeTab === 'outgoing') {
      setPage(1);
      fetchHistory(1);
    }
  }, [activeTab, token]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchHistory(newPage);
  };

  const clearFilters = () => {
    setVirtualNumber('');
    setToNumber('');
    setFromNumber('');
    setStatus('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
    setTimeout(() => fetchHistory(1), 50);
  };

  if (authLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="border-t-brand-gold h-10 w-10 animate-spin rounded-full border-4 border-gray-200" />
      </div>
    );
  }

  return (
    <div className="relative w-full font-sans">
      {/* Background ambient lighting effects */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="bg-brand-navy-light/10 absolute top-0 right-0 h-[450px] w-[450px] rounded-full blur-[120px]" />
        <div className="bg-brand-gold/5 absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-80" style={GRID_STYLE} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        {/* Header */}
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

        {/* Fetch Error Display */}
        {fetchError && (
          <div className="mb-6 flex gap-2.5 rounded-lg border border-red-500/25 bg-red-950/20 p-4 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-semibold">Telephony Gateway Error</p>
              <p className="mt-0.5">{fetchError}</p>
              <button
                onClick={() => fetchHistory()}
                className="text-brand-gold mt-2 font-bold underline"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Overview Stats Cards */}
        {(activeTab === 'incoming' || activeTab === 'outgoing') && !fetchError && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                label: 'Total Logs Found',
                value: statics.total,
                color: 'text-brand-gold',
                bg: 'bg-brand-gold/5',
              },
              {
                label: 'Answered Calls',
                value: statics.answered,
                color: 'text-emerald-500',
                bg: 'bg-emerald-500/5',
              },
              {
                label: 'Missed Calls',
                value: statics.missed,
                color: 'text-red-500',
                bg: 'bg-red-500/5',
              },
            ].map((stat, sidx) => (
              <div
                key={sidx}
                className={`dark:bg-brand-dark-surface/65 rounded-xl border border-gray-200 bg-white/80 p-4 shadow-sm backdrop-blur-md dark:border-white/8 ${stat.bg}`}
              >
                <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                  {stat.label}
                </p>
                <p className={`mt-1.5 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab switchers */}
        <div className="mb-8 flex border-b border-gray-200 dark:border-white/10">
          {[
            { id: 'incoming', label: 'Incoming Call History', icon: PhoneIncoming },
            { id: 'outgoing', label: 'Outgoing Call History', icon: PhoneOutgoing },
            { id: 'dialer', label: 'Manual Dialout', icon: PhoneCall },
            { id: 'docs', label: 'IVR API Reference', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group relative flex items-center gap-2 px-6 py-4.5 text-xs font-bold tracking-widest uppercase transition-all ${
                  isActive
                    ? 'text-brand-gold'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${isActive ? 'text-brand-gold' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'}`}
                />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="active-ivr-tab"
                    className="bg-brand-gold absolute right-0 bottom-0 left-0 h-0.5"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Main Contents */}
        <div className="space-y-6">
          {/* Filters - only visible for History tabs */}
          {(activeTab === 'incoming' || activeTab === 'outgoing') && !fetchError && (
            <IvrFilterSection
              virtualNumber={virtualNumber}
              setVirtualNumber={setVirtualNumber}
              toNumber={toNumber}
              setToNumber={setToNumber}
              fromNumber={fromNumber}
              setFromNumber={setFromNumber}
              status={status}
              setStatus={setStatus}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              clearFilters={clearFilters}
              fetchHistory={fetchHistory}
            />
          )}

          {/* Tab 1 & 2: Call History Logs */}
          {(activeTab === 'incoming' || activeTab === 'outgoing') && !fetchError && (
            <IvrLogsTable
              activeTab={activeTab}
              loading={loading}
              calls={calls}
              fetchHistory={fetchHistory}
              totalCount={totalCount}
              page={page}
              limit={limit}
              handlePageChange={handlePageChange}
            />
          )}

          {/* Tab 3: Manual Dialout */}
          {activeTab === 'dialer' && <IvrDialer token={token} />}

          {/* Tab 4: API Docs tab */}
          {activeTab === 'docs' && <IvrApiDocs />}
        </div>
      </div>
    </div>
  );
}
