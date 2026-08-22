'use client';

import { motion } from 'motion/react';
import { CreditCard, CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { usePaymentSchedules } from '@/src/lib/hooks/useCustomerPortal';
import { useTranslations } from 'next-intl';

export default function PortalPayments() {
  const t = useTranslations('pages.portalPayments');
  const { data: payments, isLoading, error } = usePaymentSchedules();

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-rose-500" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
      case 'pending':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
      case 'overdue':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200 dark:border-rose-800/50';
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
  };

  const totalPaid =
    payments?.filter((p) => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const totalPending =
    payments
      ?.filter((p) => p.status === 'pending' || p.status === 'overdue')
      .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-gray-900 lg:text-3xl dark:text-white">
          {t('title')}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">{t('subtitle')}</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700/50 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('totalPaid')}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            ₹{totalPaid.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700/50 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t('totalPending')}
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">
            ₹{totalPending.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700/50 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-50 text-sm text-gray-500 dark:bg-gray-900/50 dark:text-gray-400">
                <th className="border-b border-gray-100 px-6 py-4 font-medium dark:border-gray-700/50">
                  {t('columns.description')}
                </th>
                <th className="border-b border-gray-100 px-6 py-4 font-medium dark:border-gray-700/50">
                  {t('columns.amount')}
                </th>
                <th className="border-b border-gray-100 px-6 py-4 font-medium dark:border-gray-700/50">
                  {t('columns.dueDate')}
                </th>
                <th className="border-b border-gray-100 px-6 py-4 font-medium dark:border-gray-700/50">
                  {t('columns.status')}
                </th>
                <th className="border-b border-gray-100 px-6 py-4 text-right font-medium dark:border-gray-700/50">
                  {t('columns.action')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      <span className="ml-2">{t('loading')}</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-rose-500">
                    {t('loadError')}
                  </td>
                </tr>
              ) : payments?.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    {t('empty')}
                  </td>
                </tr>
              ) : (
                payments?.map((payment, index) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/20"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {payment.title}
                        {(() => {
                          const unitNo = Array.isArray(payment.allotments)
                            ? payment.allotments[0]?.unit_no
                            : typeof payment.allotments === 'object' && payment.allotments !== null
                              ? (payment.allotments as Record<string, unknown>).unit_no
                              : undefined;

                          return typeof unitNo === 'string' && unitNo
                            ? ` - ${t('unitPrefix')} ${unitNo}`
                            : '';
                        })()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      ₹{Number(payment.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(payment.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center space-x-1.5 rounded-full border px-3 py-1 text-sm font-medium ${getStatusClass(payment.status)}`}
                      >
                        {getStatusIcon(payment.status)}
                        <span>
                          {payment.status.toLowerCase() === 'paid'
                            ? t('statusPaid')
                            : payment.status.toLowerCase() === 'pending'
                              ? t('statusPending')
                              : payment.status.toLowerCase() === 'overdue'
                                ? t('statusOverdue')
                                : payment.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {payment.status === 'pending' || payment.status === 'overdue' ? (
                        <button className="rounded-lg bg-[#0256B4] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#024494]">
                          {t('payNow')}
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
