'use client';

import React, { useState } from 'react';
import { Calendar, Phone, MessageSquare, MapPin, CheckCircle2, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { formatTelLink, formatWhatsAppLink } from './LeadsView';
import type { SiteVisitItem } from './types';

/**
 * Haversine formula to compute distance between two coordinates in meters.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Formats distance in meters to a clean readable string (e.g. '350m' or '2.4km').
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}
interface SiteVisitsViewProps {
  siteVisits: SiteVisitItem[];
  onUpdateStatus: (visitId: string, status: 'confirmed' | 'completed') => void;
}

export function SiteVisitsView({ siteVisits, onUpdateStatus }: SiteVisitsViewProps) {
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const [checkInDetails, setCheckInDetails] = useState<
    Record<string, { lat: number; lon: number; time: string }>
  >({});

  const handleGpsCheckIn = async (visit: SiteVisitItem) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setCheckingInId(visit.id);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy || 0);

        try {
          const timeStr = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          const gpsNote = `GPS On-Site Check-in verified at ${timeStr} (Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)} ±${accuracy}m)`;
          const combinedNotes = visit.notes ? `${visit.notes} • ${gpsNote}` : gpsNote;

          const res = await fetch('/api/employee/work/site-visits', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: visit.id,
              status: 'completed',
              lat,
              lon,
              notes: combinedNotes,
            }),
          });

          if (res.ok) {
            toast.success('Site visit verified and completed at current GPS location', {
              description: `Coordinates: ${lat.toFixed(4)}°, ${lon.toFixed(4)}° (Accuracy: ${accuracy}m)`,
            });
            setCheckInDetails((prev) => ({
              ...prev,
              [visit.id]: { lat, lon, time: timeStr },
            }));
            onUpdateStatus(visit.id, 'completed');
          } else {
            const data = await res.json().catch(() => null);
            toast.error(data?.message || 'Failed to complete GPS check-in');
          }
        } catch {
          toast.error('Network error during GPS check-in');
        } finally {
          setCheckingInId(null);
        }
      },
      (error) => {
        setCheckingInId(null);
        let msg = 'Unable to retrieve your current location';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied. Please allow GPS access in browser settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location signal unavailable. Please try again in an open area.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please retry.';
        }
        toast.error(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  if (siteVisits.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-500 dark:border-slate-800">
        No site visits currently assigned to you.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {siteVisits.map((visit) => {
        const isCompleted = visit.status === 'completed';
        const checkIn = checkInDetails[visit.id];

        return (
          <div
            key={visit.id}
            className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {visit.contact?.name || 'Customer Site Visit'}
                  </span>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                    <Calendar className="h-3 w-3" />
                    {visit.preferred_date
                      ? format(parseISO(visit.preferred_date), 'EEEE, MMM dd • hh:mm a')
                      : 'Date pending'}
                  </p>
                </div>
                <span
                  className={clsx(
                    'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase',
                    visit.status === 'confirmed'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : visit.status === 'requested'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : visit.status === 'completed'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'bg-slate-100 text-slate-500'
                  )}
                >
                  {visit.status}
                </span>
              </div>

              {visit.notes && (
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{visit.notes}</p>
              )}

              {/* On-Site GPS check-in verification badge if completed */}
              {isCompleted && (
                <div className="mt-3 flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/20 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    {checkIn
                      ? `On-Site Verified at ${checkIn.time}`
                      : 'Site Visit Completed & Verified'}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Actions: 1-tap Call, 1-tap WhatsApp, and GPS Check-in */}
            <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {visit.contact?.phone && (
                  <div className="flex items-center gap-1.5">
                    <a
                      href={formatTelLink(visit.contact.phone)}
                      className="flex items-center gap-1 rounded-xl border border-slate-700/50 bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                      title={`Call ${visit.contact.name || 'Client'}`}
                    >
                      <Phone className="h-3 w-3" /> Call
                    </a>
                    <a
                      href={formatWhatsAppLink(
                        visit.contact.phone,
                        `Hello ${visit.contact.name ? visit.contact.name + ', ' : ''}I am contacting you from SVI Infra regarding your scheduled site visit.`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-emerald-600/20 transition-all hover:bg-emerald-500 active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                      title="Chat on WhatsApp"
                    >
                      <MessageSquare className="h-3 w-3" /> WhatsApp
                    </a>
                  </div>
                )}

                {visit.status === 'requested' && (
                  <button
                    onClick={() => onUpdateStatus(visit.id, 'confirmed')}
                    className="rounded-xl border border-amber-500/20 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 active:scale-95 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-300"
                  >
                    Confirm
                  </button>
                )}
              </div>

              {/* GPS Check-in at Site Button for active visits */}
              {!isCompleted && (
                <button
                  disabled={checkingInId === visit.id}
                  onClick={() => handleGpsCheckIn(visit)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2 text-xs font-bold text-white shadow-sm shadow-emerald-600/20 transition-all hover:from-emerald-500 hover:to-teal-500 active:scale-95 disabled:opacity-50"
                >
                  {checkingInId === visit.id ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Acquiring GPS & Checking
                      in...
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
        );
      })}
    </div>
  );
}
