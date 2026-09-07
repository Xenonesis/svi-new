'use client';

import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { PaymentScheduleItem } from './types';

export interface PortalAllotmentScheduleDrawerProps {
  isExpanded: boolean;
  paymentSchedules?: PaymentScheduleItem[];
  onToggleStatus?: (paymentId: string, currentStatus: string) => Promise<void> | void;
  onTogglePaymentStatus?: (paymentId: string, currentStatus: string) => Promise<void> | void;
}

export function PortalAllotmentScheduleDrawer({
  isExpanded,
  paymentSchedules = [],
  onToggleStatus,
  onTogglePaymentStatus,
}: PortalAllotmentScheduleDrawerProps) {
  const t = useTranslations('pages.adminPortalAllotments');
  const handleToggle = onToggleStatus || onTogglePaymentStatus;

  const paidCount = paymentSchedules.filter((p) => p.status === 'paid').length;
  const totalCount = paymentSchedules.length;

  const sortedSchedules = [...paymentSchedules].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-bold text-gray-900 dark:text-white">{t('paymentSchedule')}</h4>
              <span className="text-xs text-gray-500">
                {paidCount} {t('ofLabel')} {totalCount} {t('paidLabel')}
              </span>
            </div>

            {sortedSchedules.length > 0 ? (
              <div className="space-y-3">
                {sortedSchedules.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {payment.milestone_name}
                      </p>
                      <p className="mt-1 flex gap-4 text-xs text-gray-500">
                        <span>
                          {t('dueLabel')}: {new Date(payment.due_date).toLocaleDateString()}
                        </span>
                        <span>₹{payment.amount?.toLocaleString('en-IN')}</span>
                      </p>
                    </div>
                    {handleToggle && (
                      <button
                        onClick={() => handleToggle(payment.id, payment.status)}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                          payment.status === 'paid'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}
                      >
                        {payment.status === 'paid' ? (
                          <>
                            <CheckCircle className="h-3.5 w-3.5" /> {t('paid')}
                          </>
                        ) : (
                          <>
                            <Clock className="h-3.5 w-3.5" /> {t('pending')}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-gray-500">{t('noPaymentSchedules')}</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
