'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, TrendingUp, Calendar, Mail, Send, Users, Globe } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getToken } from './helpers';

interface UsageData {
  period: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounces: number;
  spamComplaints: number;
  dailyStats: { date: string; sent: number; delivered: number; opened: number }[];
}

interface ResendUsageDashboardProps {
  className?: string;
}

export function ResendUsageDashboard({ className }: ResendUsageDashboardProps) {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsage = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const res = await fetch('/api/admin/email?action=usage', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch usage data');
        const data = await res.json();
        setUsageData(data);
      } catch (e) {
        setError('Failed to load usage data');
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, []);

  const PLAN_LIMITS = {
    emailsPerMonth: 3000,
    emailsPerDay: 100,
    domains: 1,
    apiRequestsPerMinute: 1000,
  };

  const statsCards = [
    {
      title: 'Emails Sent (Month)',
      current: usageData?.sent || 0,
      max: PLAN_LIMITS.emailsPerMonth,
      unit: 'emails',
      icon: Send,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-500/15',
    },
    {
      title: 'Emails Per Day',
      current: usageData?.sent || 0,
      max: PLAN_LIMITS.emailsPerDay,
      unit: 'emails',
      icon: Mail,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-100 dark:bg-emerald-500/15',
    },
    {
      title: 'Delivery Rate',
      current: usageData?.delivered || 0,
      max: usageData?.sent || 100,
      unit: 'percent',
      icon: TrendingUp,
      color: 'text-violet-500',
      bgColor: 'bg-violet-100 dark:bg-violet-500/15',
      isPercentage: true,
    },
    {
      title: 'Active Domains',
      current: 1,
      max: PLAN_LIMITS.domains,
      unit: 'domains',
      icon: Globe,
      color: 'text-amber-500',
      bgColor: 'bg-amber-100 dark:bg-amber-500/15',
    },
  ];

  return (
    <div className={className}>
      <div className="rounded-xl border border-gray-200/80 bg-white p-6 dark:border-gray-700/60 dark:bg-[#0e0e14]">
        <div className="mb-5 flex items-center gap-3">
          <div className="bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <BarChart3 className="text-brand-gold h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Resend Usage Dashboard
            </h3>
            <p className="font-mono text-[10px] tracking-wider text-gray-400 uppercase">
              Email sending analytics and limits
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="mb-2 h-4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-8 rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-4 text-center text-sm text-gray-500">{error}</div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {statsCards.map((stat) => {
                const StatIcon = stat.icon;
                const percentage = stat.isPercentage
                  ? stat.current
                  : Math.min(100, (stat.current / stat.max) * 100);
                const isNearLimit = percentage >= 80;
                const isOverLimit = percentage > 100;

                return (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className={`rounded-lg border p-4 ${
                      isOverLimit
                        ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                        : isNearLimit
                          ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
                          : 'border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {stat.title}
                      </span>
                    </div>
                    <div className="mt-2 flex items-end gap-1">
                      <span
                        className={`text-2xl font-bold ${
                          isOverLimit
                            ? 'text-red-600'
                            : isNearLimit
                              ? 'text-amber-600'
                              : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {stat.isPercentage ? `${stat.current}%` : stat.current}
                      </span>
                      <span className="text-xs text-gray-400">
                        / {stat.max} {stat.unit}
                      </span>
                    </div>
                    {!stat.isPercentage && (
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOverLimit
                              ? 'bg-red-500'
                              : isNearLimit
                                ? 'bg-amber-500'
                                : 'bg-brand-gold'
                          }`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Advanced Analytics Chart */}
            {usageData?.dailyStats && usageData.dailyStats.length > 0 && (
              <div className="mt-8 border-t border-gray-200/60 pt-6 dark:border-gray-800/60">
                <h4 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">
                  Email Delivery Over Time
                </h4>
                <div className="h-[250px] w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={usageData.dailyStats}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
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
                      <YAxis
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(14, 14, 20, 0.95)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="sent"
                        name="Sent"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorSent)"
                      />
                      <Area
                        type="monotone"
                        dataKey="delivered"
                        name="Delivered"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorDelivered)"
                      />
                      <Area
                        type="monotone"
                        dataKey="opened"
                        name="Opened"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorOpened)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-5 flex items-center justify-between">
              <div className="text-xs text-gray-400">
                Period:{' '}
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  {usageData?.period || 'N/A'}
                </span>
              </div>
              <a
                href="https://resend.com/overview"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-gold text-xs underline hover:opacity-80"
              >
                View full dashboard →
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
