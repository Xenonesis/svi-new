'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  MapPin,
  Phone,
  MessageSquare,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Loader2,
  CalendarX2,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { getDeviceCoordinates } from '@/src/lib/location/geolocationService';
import { formatTelLink, formatWhatsAppLink } from '@/src/components/employee/work/LeadsView';
import type { DashboardData } from './types';

interface DashboardSiteVisitsCardProps {
  visits: DashboardData['upcoming_site_visits'] | undefined;
}

export function DashboardSiteVisitsCard({ visits }: DashboardSiteVisitsCardProps) {
  const [checkingIn, setCheckingIn] = useState(false);
  const [completedVisitId, setCompletedVisitId] = useState<string | null>(null);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // ignore
      }
    }
  };

  const formatVisitDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'd MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  // Zero-State: Render a clean compact card instead of null to maintain layout balance
  if (!visits || visits.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-5 shadow-sm backdrop-blur-xl transition-all sm:p-6 dark:border-white/10 dark:bg-slate-900/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Scheduled Site Visits
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Property & site field inspections
              </p>
            </div>
          </div>
          <Link
            href="/employee/work?tab=site-visits"
            className="flex items-center gap-0.5 text-xs font-semibold text-purple-600 hover:underline dark:text-purple-400"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-3.5 flex items-center justify-between rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-xs dark:border-slate-800 dark:bg-slate-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <CalendarX2 className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                No site visits scheduled for today
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                All property inspections and customer tours are up to date.
              </p>
            </div>
          </div>
          <Link
            href="/employee/work?tab=site-visits"
            className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Schedule Visit
          </Link>
        </div>
      </div>
    );
  }

  const visit = visits[0];
  const isCompleted = visit.status === 'completed' || completedVisitId === visit.id;

  const handleGpsCheckIn = async () => {
    triggerHaptic();
    setCheckingIn(true);
    try {
      const loc = await getDeviceCoordinates({ enableHighAccuracy: true, timeout: 12000 });
      const lat = loc.latitude;
      const lon = loc.longitude;
      const accuracy = Math.round(loc.accuracy || 0);

      const timeStr = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const gpsNote = `GPS On-Site Check-in verified at ${timeStr} (Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)} ±${accuracy}m)`;

      const res = await fetch('/api/employee/work/site-visits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: visit.id,
          status: 'completed',
          lat,
          lon,
          notes: gpsNote,
        }),
      });

      if (res.ok) {
        toast.success('Site visit GPS check-in verified & completed', {
          description: `Location: ${lat.toFixed(4)}°, ${lon.toFixed(4)}° (Accuracy: ${accuracy}m)`,
        });
        setCompletedVisitId(visit.id);
        setCheckInTime(timeStr);
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.message || 'Failed to complete GPS check-in. Please try again.');
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Unable to retrieve device GPS location. Please ensure location services are enabled.';
      toast.error('GPS Check-in Failed', {
        description: errorMessage,
      });
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="rounded-3xl border border-purple-500/20 bg-white/95 p-5 shadow-sm backdrop-blur-xl transition-all sm:p-6 dark:border-purple-500/30 dark:bg-slate-900/80">
      {/* Card Header */}
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Next Scheduled Site Visit
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Active client inspection briefing
            </p>
          </div>
        </div>
        <Link
          href="/employee/work?tab=site-visits"
          className="flex items-center gap-0.5 text-xs font-semibold text-purple-600 hover:underline dark:text-purple-400"
        >
          <span>View All ({visits.length})</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Visit Details Box */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition-all dark:border-white/5 dark:bg-slate-950/40">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              {visit.property?.title || 'Property Site Visit'}
            </h4>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-purple-500" />
              <span>{visit.location || visit.property?.location || 'Jaipur Site'}</span>
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
              isCompleted
                ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300'
            }`}
          >
            {isCompleted ? 'completed' : visit.status}
          </span>
        </div>

        {/* Date, Time & 1-tap Contact Actions */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60 pt-3 text-xs dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Calendar className="h-3.5 w-3.5 text-purple-500" />
            <span className="font-medium">
              {formatVisitDate(visit.preferred_date)}
              {visit.preferred_time ? ` • ${visit.preferred_time}` : ''}
            </span>
          </div>

          {/* 1-tap Contact Actions */}
          {visit.contact?.phone && (
            <div className="flex items-center gap-1.5">
              <a
                href={formatTelLink(visit.contact.phone)}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                title="Direct call"
              >
                <Phone className="h-3 w-3 text-blue-500" />
                <span>Call</span>
              </a>
              <a
                href={formatWhatsAppLink(
                  visit.contact.phone,
                  `Hello ${visit.contact.full_name || 'Sir/Madam'}, I am contacting you from SVI Infra regarding your scheduled site visit.`
                )}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm shadow-emerald-600/20 transition-all hover:bg-emerald-500 active:scale-95"
                title="WhatsApp message"
              >
                <MessageSquare className="h-3 w-3" />
                <span>WhatsApp</span>
              </a>
            </div>
          )}
        </div>

        {/* GPS Check-in Action / Verification Badge */}
        <div className="mt-3.5 border-t border-slate-200/60 pt-3 dark:border-slate-800">
          {isCompleted ? (
            <div className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                {checkInTime
                  ? `Checked In (GPS Verified at ${checkInTime})`
                  : 'Site Visit Completed (GPS Verified)'}
              </span>
            </div>
          ) : (
            <button
              disabled={checkingIn}
              onClick={handleGpsCheckIn}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:from-emerald-500 hover:to-teal-500 active:scale-95 disabled:opacity-50"
            >
              {checkingIn ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Acquiring GPS & Checking in...</span>
                </>
              ) : (
                <>
                  <MapPin className="h-3.5 w-3.5" />
                  <span>GPS Check-in at Site</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
