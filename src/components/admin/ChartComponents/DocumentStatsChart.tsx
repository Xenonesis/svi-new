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

interface DocumentStatsChartProps {
  data: Array<{
    name: string;
    count: number;
  }>;
}

const COLORS = ['#c9a84c', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function DocumentStatsChart({ data }: DocumentStatsChartProps) {
  return (
    <div className="rounded-2xl bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:bg-[#0e0e14]/65">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Document Generation</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">By document type</p>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} vertical={false} />
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
                border: '1px solid rgba(201, 168, 76, 0.2)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
              cursor={{ fill: 'rgba(201, 168, 76, 0.1)' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
