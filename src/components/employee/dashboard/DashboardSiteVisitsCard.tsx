'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  MapPin,
  Navigation,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight,
  Loader2,
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

  if (!visits || visits.length === 0) return null;
  const visit = visits[0];
  const isCompleted = visit.status === 'completed' || completedVisitId === visit.id;

  const handleGpsCheckIn = async () => {
    setCheckingIn(true);
    try {
      const loc = await getDeviceCoordinates({ enableHighAccuracy: true, timeout: 10000 });
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
        toast.success('Site visit verified and completed at current GPS location', {
          description: `Coordinates: ${lat.toFixed(4)}°, ${lon.toFixed(4)}° (Accuracy: ${accuracy}m)`,
        });
        setCompletedVisitId(visit.id);
        setCheckInTime(timeStr);
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.message || 'Failed to complete GPS check-in');
      }
    } catch {
      toast.error('Unable to retrieve location. Please ensure GPS is enabled.');
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent p-5 shadow-sm dark:border-purple-500/30 dark:from-purple-950/20">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
            <Compass className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Next Scheduled Site Visit
          </h2>
        </div>
        <Link
          href="/employee/work?tab=site-visits"
          className="text-xs font-semibold text-purple-600 hover:underline dark:text-purple-400"
        >
          View All
        </Link>
      </div>

      <div className="rounded-2xl border border-purple-200/60 bg-white/90 p-4 shadow-sm dark:border-purple-900/40 dark:bg-slate-900/80">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              {visit.property?.title || 'Property Site Visit'}
            </h4>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <MapPin className="h-3 w-3 text-purple-500" />
              {visit.location || visit.property?.location || 'Jaipur Site'}
            </p>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
              isCompleted
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
            }`}
          >
            {isCompleted ? 'completed' : visit.status}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <Calendar className="h-3.5 w-3.5 text-purple-500" />
            <span>
              {format(new Date(visit.preferred_date), 'd MMM yyyy')}
              {visit.preferred_time ? ` (${visit.preferred_time})` : ''}
            </span>
          </div>

          {/* 1-tap Contact Actions */}
          {visit.contact?.phone && (
            <div className="flex items-center gap-1.5">
              <a
                href={formatTelLink(visit.contact.phone)}
                className="flex items-center gap-1 rounded-lg border border-slate-700/50 bg-slate-900 px-2 py-1 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                title="Direct call"
              >
                <Phone className="h-3 w-3" /> Call
              </a>
              <a
                href={formatWhatsAppLink(
                  visit.contact.phone,
                  `Hello ${visit.contact.full_name || 'Sir/Madam'}, I am contacting you from SVI Infra regarding your scheduled site visit.`
                )}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white shadow-sm shadow-emerald-600/20 transition-all hover:bg-emerald-500 active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                title="WhatsApp message"
              >
                <MessageSquare className="h-3 w-3" /> WhatsApp
              </a>
            </div>
          )}
        </div>

        {/* GPS Check-in Action / Verification Badge */}
        <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          {isCompleted ? (
            <div className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
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
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2 text-xs font-bold text-white shadow-sm shadow-emerald-600/20 transition-all hover:from-emerald-500 hover:to-teal-500 active:scale-95 disabled:opacity-50"
            >
              {checkingIn ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Acquiring GPS & Checking in...
                </>
              ) : (
                <>
                  <MapPin className="h-3.5 w-3.5" /> GPS Check-in at Site
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
