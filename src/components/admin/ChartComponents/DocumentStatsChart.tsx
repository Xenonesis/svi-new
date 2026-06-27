'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useMounted } from '@/src/lib/hooks/useMounted';

interface DocumentStatsChartProps {
  data: Array<{
    name: string;
    count: number;
  }>;
  isLoading?: boolean;
}

const COLORS = ['#d4af37', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function DocumentStatsChart({ data, isLoading }: DocumentStatsChartProps) {
  const mounted = useMounted();

  if (isLoading) {
    return (
      <div className="dark:bg-brand-dark-surface/65 min-w-0 animate-pulse rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8">
        <div className="mb-6">
          <div className="mb-2 h-6 w-44 rounded bg-gray-200 dark:bg-white/5" />
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-white/5" />
        </div>
        <div className="flex h-[300px] w-full items-end gap-6 px-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-gray-200 dark:bg-white/5"
              style={{ height: `${30 + ((i * 15) % 60)}%` }}
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
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Document Generation</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">By document type</p>
        </div>
      </div>

      <div className="h-[300px] w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.1}
                vertical={false}
              />
              <XAxis
                dataKey="name"
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
                cursor={{ fill: 'rgba(212, 175, 55, 0.1)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full" />
        )}
      </div>
    </div>
  );
}
