'use client';

import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, Wifi } from 'lucide-react';

interface RegistrationAnalyticsProps {
  token: string;
}

interface DailyTrend {
  date: string;
  count: number;
  fullDate: string;
}

interface StatusEntry {
  name: string;
  value: number;
  color: string;
}

// ── Custom Tooltip for LineChart ─────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-gray-900/90 px-4 py-2.5 text-xs shadow-2xl backdrop-blur-xl">
      <p className="mb-1 font-semibold text-gray-300">{label}</p>
      <p className="text-brand-gold font-bold">
        {payload[0].value}{' '}
        <span className="font-normal text-gray-400">
          {payload[0].value === 1 ? 'registration' : 'registrations'}
        </span>
      </p>
    </div>
  );
}

// ── Custom Tooltip for PieChart ──────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-xl border border-white/10 bg-gray-900/90 px-4 py-2.5 text-xs shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ background: entry.payload.color }}
        />
        <span className="font-semibold text-gray-200">{entry.name}</span>
      </div>
      <p className="mt-0.5 pl-4 font-bold text-white">
        {entry.value}{' '}
        <span className="font-normal text-gray-400">
          ({entry.payload.percent ? `${(entry.payload.percent * 100).toFixed(1)}%` : '0%'})
        </span>
      </p>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function ChartSkeleton({ height = 'h-40' }: { height?: string }) {
  return (
    <div className={`${height} w-full animate-pulse rounded-xl bg-white/5`}>
      <div className="flex h-full flex-col items-center justify-center gap-2 opacity-30">
        <div className="h-2 w-3/4 rounded-full bg-gray-600" />
        <div className="h-2 w-1/2 rounded-full bg-gray-600" />
        <div className="h-2 w-2/3 rounded-full bg-gray-600" />
      </div>
    </div>
  );
}

export function RegistrationAnalytics({ token }: RegistrationAnalyticsProps) {
  const { data, isLoading } = useQuery<{
    dailyTrend: DailyTrend[];
    statusDistribution: StatusEntry[];
  }>({
    queryKey: ['registrationAnalytics', token],
    queryFn: async () => {
      const res = await fetch('/api/admin/registrations/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
    enabled: !!token,
    staleTime: 30_000, // 30s cache
    refetchInterval: 60_000, // auto-refresh every 60s
  });

  const dailyTrend = data?.dailyTrend ?? [];
  const statusDistribution = data?.statusDistribution ?? [];
  const totalFromDist = statusDistribution.reduce((acc, e) => acc + e.value, 0);

  // Show only every 5th label to avoid crowding on the X-axis
  const trendWithFilteredLabels = dailyTrend.map((d, i) => ({
    ...d,
    displayDate: i % 5 === 0 || i === dailyTrend.length - 1 ? d.date : '',
  }));

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* ── Line Chart: 30-day trend ─────────────────────────────────────── */}
      <div className="dark:border-brand-gold/15 dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 p-5 shadow-lg backdrop-blur-xl lg:col-span-3">
        {/* Top accent bar */}
        <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-brand-gold/10 border-brand-gold/25 flex h-9 w-9 items-center justify-center rounded-lg border">
              <TrendingUp className="text-brand-gold h-4 w-4" />
            </div>
            <div>
              <p className="text-brand-navy text-sm font-semibold dark:text-white">
                Registration Trend
              </p>
              <p className="text-[10px] font-medium tracking-wider text-gray-500 uppercase">
                Last 30 days
              </p>
            </div>
          </div>
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1">
            <Wifi className="h-3 w-3 text-emerald-400" />
            <span className="text-[10px] font-semibold text-emerald-400 uppercase">Live</span>
          </div>
        </div>

        {isLoading ? (
          <ChartSkeleton height="h-44" />
        ) : (
          <ResponsiveContainer width="100%" height={176}>
            <LineChart
              data={trendWithFilteredLabels}
              margin={{ top: 4, right: 8, left: -28, bottom: 0 }}
            >
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#b08f36" />
                  <stop offset="50%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#f0d080" />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 10, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                content={<TrendTooltip />}
                cursor={{ stroke: 'rgba(212,175,55,0.2)', strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="url(#goldGradient)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#d4af37', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Donut Chart: status distribution ────────────────────────────── */}
      <div className="dark:border-brand-gold/15 dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 p-5 shadow-lg backdrop-blur-xl lg:col-span-2">
        <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

        <div className="mb-4 flex items-center gap-2.5">
          <div className="bg-brand-gold/10 border-brand-gold/25 flex h-9 w-9 items-center justify-center rounded-lg border">
            <PieChartIcon className="text-brand-gold h-4 w-4" />
          </div>
          <div>
            <p className="text-brand-navy text-sm font-semibold dark:text-white">
              Status Breakdown
            </p>
            <p className="text-[10px] font-medium tracking-wider text-gray-500 uppercase">
              All time · {totalFromDist} total
            </p>
          </div>
        </div>

        {isLoading ? (
          <ChartSkeleton height="h-44" />
        ) : (
          <ResponsiveContainer width="100%" height={176}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={68}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {statusDistribution.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">{value}</span>
                )}
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
