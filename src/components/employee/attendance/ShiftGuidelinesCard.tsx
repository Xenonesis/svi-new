'use client';

import React from 'react';
import Link from 'next/link';
import {
  Clock,
  AlertCircle,
  Building,
  Info,
  ShieldCheck,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface AttendanceSettingsProps {
  punch_in_start?: string;
  punch_in_late_after?: string;
  punch_in_cutoff?: string;
  punch_out_start?: string;
  punch_out_end?: string;
  min_hours_half_day?: number;
  min_hours_full_day?: number;
  geofence_radius_meters?: number;
}

interface GeofenceLocation {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  radius_meters?: number;
}

interface ShiftGuidelinesCardProps {
  settings?: AttendanceSettingsProps;
  locations?: GeofenceLocation[];
}

function formatTime12(timeStr?: string): string {
  if (!timeStr) return '--:--';
  const clean = timeStr.replace(/"/g, '');
  const parts = clean.split(':');
  if (parts.length < 2) return clean;
  let hour = parseInt(parts[0], 10);
  const min = parts[1];
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${String(hour).padStart(2, '0')}:${min} ${ampm}`;
}

export function ShiftGuidelinesCard({ settings, locations }: ShiftGuidelinesCardProps) {
  const shiftStart = formatTime12(settings?.punch_in_start || '09:00');
  const lateGraceTime = formatTime12(settings?.punch_in_late_after || '09:15');
  const shiftEnd = formatTime12(settings?.punch_out_start || '17:00');
  const lateCutoff = formatTime12(settings?.punch_in_cutoff || '10:30');
  const punchOutWindowEnd = formatTime12(settings?.punch_out_end || '21:00');
  const minHalfDayHrs = settings?.min_hours_half_day ?? 4;
  const minFullDayHrs = settings?.min_hours_full_day ?? 8;
  const radiusMeters = settings?.geofence_radius_meters || 200;
  const officeNames =
    locations && locations.length > 0
      ? locations.map((l) => l.name).join(', ')
      : 'SVI Head Office (Sector 63, Noida)';

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Admin Shift Policy & Timings
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Live working rules configured by SVI Admin
          </p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
          <ShieldCheck className="h-3 w-3" /> Configured by Admin
        </span>
      </div>

      <div className="space-y-3 text-xs">
        {/* Official Shift Window */}
        <div className="flex items-center justify-between rounded-xl bg-slate-50/80 p-2.5 dark:bg-slate-950/40">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">
                Official Shift Window
              </span>
              <p className="text-[10px] text-slate-400">Standard working day</p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
              {shiftStart} – {shiftEnd}
            </span>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
              8 hrs standard duty
            </p>
          </div>
        </div>

        {/* On-Time Grace & Late Threshold */}
        <div className="flex items-center justify-between rounded-xl bg-slate-50/80 p-2.5 dark:bg-slate-950/40">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">
                On-Time Grace Window
              </span>
              <p className="text-[10px] text-slate-400">Till {lateGraceTime} • 100% Day Salary</p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Grace: {lateGraceTime}
            </span>
            <p className="text-[10px] text-slate-400">After {lateGraceTime} = Late</p>
          </div>
        </div>

        {/* Half Day Cutoff & Salary Impact */}
        <div className="flex items-center justify-between rounded-xl bg-amber-50/70 p-2.5 dark:bg-amber-950/30">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="font-semibold text-amber-950 dark:text-amber-200">
                Half-Day Trigger (50% Salary)
              </span>
              <p className="text-[10px] text-amber-800/80 dark:text-amber-300/80">
                Punched after {lateCutoff} OR &lt;{minFullDayHrs}h worked
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
              Cutoff: {lateCutoff}
            </span>
            <p className="text-[10px] text-amber-700 dark:text-amber-300">Counts as 0.5 Day</p>
          </div>
        </div>

        {/* Duty Hours Breakdown */}
        <div className="flex items-center justify-between rounded-xl bg-slate-50/80 p-2.5 dark:bg-slate-950/40">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">
                Daily Duty Thresholds
              </span>
              <p className="text-[10px] text-slate-400">
                Full Day: &ge;{minFullDayHrs}h | Half Day: &ge;{minHalfDayHrs}h
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
              {minFullDayHrs}h Standard
            </span>
            <p className="text-[10px] text-slate-400">&lt;{minHalfDayHrs}h = Loss of Pay</p>
          </div>
        </div>

        {/* Punch Out Window */}
        <div className="flex items-center justify-between rounded-xl bg-slate-50/80 p-2.5 dark:bg-slate-950/40">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">Punch Out Window</span>
              <p className="text-[10px] text-slate-400">Evening shift sign-off</p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
              {shiftEnd} – {punchOutWindowEnd}
            </span>
            <p className="text-[10px] text-purple-600 dark:text-purple-400">With daily work log</p>
          </div>
        </div>

        {/* Geofenced Office Locations */}
        <div className="flex items-start justify-between rounded-xl bg-slate-50/80 p-2.5 dark:bg-slate-950/40">
          <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Building className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">
                Approved Base Locations
              </span>
              <p className="mt-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                {officeNames}
              </p>
            </div>
          </div>
          <span className="ml-2 flex-shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            ±{radiusMeters}m Radius
          </span>
        </div>

        {/* Regularization Prompt */}
        <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 p-2.5 dark:border-blue-900/30 dark:bg-blue-950/20">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Info className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium">Forgot to punch or outdoor visit?</span>
          </div>
          <Link
            href="/employee/attendance/history"
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
          >
            Apply Regularization →
          </Link>
        </div>
      </div>
    </div>
  );
}
