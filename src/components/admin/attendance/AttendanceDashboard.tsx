'use client';

import { BarChart3, CalendarCheck, RefreshCw, TrendingUp, Users, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

import AttendanceStatusChart from '@/src/components/admin/ChartComponents/AttendanceStatusChart';
import AttendanceTrendChart from '@/src/components/admin/ChartComponents/AttendanceTrendChart';

interface AttendanceDashboardProps {
  token: string;
  showToast: (type: 'success' | 'error', msg: string) => void;
}

interface AnalyticsData {
  today: {
    present: number;
    absent: number;
    half_day: number;
    leave: number;
    total: number;
    rate: number;
  };
  weeklyTrend: Array<{ date: string; rate: number }>;
  monthlyBreakdown: Array<{ name: string; count: number }>;
  thirtyDayTrend: Array<{ date: string; rate: number }>;
}

const STATS: Array<{
  key: keyof AnalyticsData['today'];
  label: string;
  icon: typeof CalendarCheck;
  color: string;
  bg: string;
  suffix?: string;
}> = [
  {
    key: 'present',
    label: 'Present Today',
    icon: CalendarCheck,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    key: 'absent',
    label: 'Absent Today',
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
  {
    key: 'rate',
    label: 'Attendance Rate',
    icon: TrendingUp,
    color: 'text-brand-gold',
    bg: 'bg-brand-gold/10',
    suffix: '%',
  },
  {
    key: 'total',
    label: 'Total Marked',
    icon: Users,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
];

export default function AttendanceDashboard({ token, showToast }: AttendanceDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/attendance/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error);
      }
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAnalytics();
  }, [token]);

  if (loading) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-brand-navy font-serif text-xl font-semibold tracking-tight dark:text-white">
              Dashboard
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Attendance overview and trends
            </p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-gray-200 bg-white/80 p-6 dark:border-white/8 dark:bg-[#0e0e14]/65"
            >
              <div className="mb-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-white/5" />
                <div className="space-y-2">
                  <div className="h-8 w-16 rounded bg-gray-200 dark:bg-white/5" />
                  <div className="h-3 w-24 rounded bg-gray-200 dark:bg-white/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-gray-200 bg-white/80 p-6 dark:border-white/8 dark:bg-[#0e0e14]/65"
            >
              <div className="mb-6 space-y-2">
                <div className="h-5 w-32 rounded bg-gray-200 dark:bg-white/5" />
                <div className="h-3 w-20 rounded bg-gray-200 dark:bg-white/5" />
              </div>
              <div className="h-[300px] rounded bg-gray-200 dark:bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-brand-navy font-serif text-xl font-semibold tracking-tight dark:text-white">
            Dashboard
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Attendance overview and trends</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold tracking-widest text-gray-700 uppercase transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#0e0e14]/85 dark:text-gray-300 dark:hover:bg-white/5"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          const value = data.today[stat.key];

          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8 dark:bg-[#0e0e14]/65"
            >
              {i === 0 && (
                <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />
              )}
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-brand-navy text-3xl font-bold tracking-tight dark:text-white">
                    {value}
                    {stat.suffix || ''}
                  </p>
                  <p className="mt-1 text-[10px] font-medium tracking-wide text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {data.thirtyDayTrend.length > 0 && <AttendanceTrendChart data={data.thirtyDayTrend} />}
        {data.monthlyBreakdown.some((d) => d.count > 0) && (
          <AttendanceStatusChart data={data.monthlyBreakdown} />
        )}
      </div>

      {data.thirtyDayTrend.length === 0 && !data.monthlyBreakdown.some((d) => d.count > 0) && (
        <div className="py-16 text-center">
          <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-700" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            No attendance data yet. Start marking attendance to see trends here.
          </p>
        </div>
      )}
    </div>
  );
}
