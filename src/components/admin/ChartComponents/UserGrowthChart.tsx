'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useMounted } from '@/src/lib/hooks/useMounted';

interface UserGrowthChartProps {
  data: Array<{
    date: string;
    users: number;
  }>;
  isLoading?: boolean;
}

export default function UserGrowthChart({ data, isLoading }: UserGrowthChartProps) {
  const mounted = useMounted();

  if (isLoading) {
    return (
      <div className="dark:bg-brand-dark-surface/65 min-w-0 animate-pulse rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8">
        <div className="mb-6">
          <div className="mb-2 h-6 w-32 rounded bg-gray-200 dark:bg-white/5" />
          <div className="h-4 w-20 rounded bg-gray-200 dark:bg-white/5" />
        </div>
        <div className="flex h-[300px] w-full items-end gap-3 px-2">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-gray-200 dark:bg-white/5"
              style={{ height: `${25 + Math.sin(i) * 15 + ((i * 7) % 35)}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dark:bg-brand-dark-surface/65 min-w-0 rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">User Growth</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Last 30 days</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-brand-gold h-2 w-2 rounded-full" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">New Users</span>
        </div>
      </div>

      <div className="h-[300px] w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.1}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(14, 14, 20, 0.95)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                cursor={{ stroke: '#d4af37', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#d4af37"
                strokeWidth={2}
                fill="url(#userGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full" />
        )}
      </div>
    </div>
  );
}
