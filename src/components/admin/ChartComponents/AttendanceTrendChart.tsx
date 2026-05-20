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

interface AttendanceTrendChartProps {
  data: Array<{
    date: string;
    rate: number;
  }>;
}

export default function AttendanceTrendChart({ data }: AttendanceTrendChartProps) {
  return (
    <div className="rounded-2xl bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:bg-[#0e0e14]/65">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Attendance Rate</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Last 30 days</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-brand-gold h-2 w-2 rounded-full" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Rate %</span>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#c9a84c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(14, 14, 20, 0.95)',
                border: '1px solid rgba(201, 168, 76, 0.2)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
              cursor={{ stroke: '#c9a84c', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="#c9a84c"
              strokeWidth={2}
              fill="url(#attendanceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
