'use client';

import { useAuthStore } from '@/src/stores/authStore';
import { motion } from 'motion/react';
import { Building2, FileText, CreditCard, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from '@/src/i18n/navigation';
import { useTranslations } from 'next-intl';
import {
  useAllotments,
  usePaymentSchedules,
  useDocuments,
} from '@/src/lib/hooks/useCustomerPortal';

export default function PortalDashboard() {
  const { profile } = useAuthStore();
  const t = useTranslations('Portal');

  const { data: allotments, isLoading: loadingAllotments } = useAllotments();
  const { data: payments, isLoading: loadingPayments } = usePaymentSchedules();
  const { data: documents, isLoading: loadingDocuments } = useDocuments();

  const totalProperties = allotments?.length || 0;
  const totalDocuments = documents?.length || 0;

  // Calculate total payments due
  const duePayments =
    payments?.filter((p) => p.status === 'pending' || p.status === 'overdue') || [];
  const totalDueAmount = duePayments.reduce((sum, p) => sum + Number(p.amount), 0);

  const isLoading = loadingAllotments || loadingPayments || loadingDocuments;

  const stats = [
    {
      title: 'My Properties',
      value: isLoading ? '-' : totalProperties.toString(),
      icon: Building2,
      href: '/portal/properties',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Documents',
      value: isLoading ? '-' : totalDocuments.toString(),
      icon: FileText,
      href: '/portal/documents',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      title: 'Payments Due',
      value: isLoading
        ? '-'
        : new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
          }).format(totalDueAmount),
      icon: CreditCard,
      href: '/portal/payments',
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-900/20',
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Welcome Section */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:p-8 dark:border-gray-700/50 dark:bg-gray-800">
        <h1 className="flex items-center gap-3 font-serif text-2xl font-bold text-gray-900 lg:text-3xl dark:text-white">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Guest'}!
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Here is an overview of your properties and recent updates.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={stat.href}
              className="group block rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700/50 dark:bg-gray-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`rounded-xl p-4 ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm font-medium text-[#0256B4] group-hover:underline dark:text-[#E8D17A]">
                View Details
                <ChevronRight className="ml-1 h-4 w-4" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity placeholder */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:p-8 dark:border-gray-700/50 dark:bg-gray-800">
        <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            No recent activity to show.
          </div>
        )}
      </div>

      {/* Employee Quick Switcher */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs sm:flex-row sm:items-center dark:bg-blue-950/20">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <span className="font-semibold">SVI Staff Member?</span>
          <span className="text-slate-500">
            Track your attendance, site visits, and daily work tasks.
          </span>
        </div>
        <a
          href="/employee/dashboard"
          className="self-start font-bold text-blue-600 hover:underline sm:self-auto dark:text-blue-400"
        >
          Open Staff Workspace →
        </a>
      </div>
    </div>
  );
}
