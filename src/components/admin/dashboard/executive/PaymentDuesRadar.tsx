'use client';

import { useState } from 'react';
import { Calendar, Bell, AlertTriangle, CheckCircle2, Check } from 'lucide-react';
import type { ExecutiveDashboardData } from '@/app/api/admin/dashboard/executive/route';

export interface PaymentDuesRadarProps {
  paymentDues: ExecutiveDashboardData['paymentDues'];
  onSendReminder?: (due: ExecutiveDashboardData['paymentDues'][number]) => void;
}

export function PaymentDuesRadar({ paymentDues, onSendReminder }: PaymentDuesRadarProps) {
  const [remindedIds, setRemindedIds] = useState<Set<string>>(new Set());

  const handleReminder = (due: ExecutiveDashboardData['paymentDues'][number]) => {
    setRemindedIds((prev) => new Set(prev).add(due.id));
    if (onSendReminder) {
      onSendReminder(due);
    } else if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(`Reminder queued for ${due.customer_name}`);
    }
  };

  const duesList = paymentDues ?? [];

  return (
    <div className="rounded-2xl border border-white/10 bg-[#090e17]/80 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-rose-400">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Payment Dues Radar</h3>
            <p className="text-xs text-gray-400">Upcoming client installments</p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {duesList.map((due) => {
          const isReminded = remindedIds.has(due.id);
          return (
            <div
              key={due.id}
              className={`flex items-center justify-between rounded-xl border p-3 text-xs transition-colors ${
                due.is_overdue
                  ? 'border-rose-500/30 bg-rose-500/5'
                  : 'border-white/5 bg-white/[0.02]'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5 font-medium text-white">
                  <span>{due.customer_name}</span>
                  {due.is_overdue && (
                    <span className="flex items-center gap-0.5 text-[10px] font-semibold text-rose-400">
                      <AlertTriangle className="h-3 w-3" /> Overdue
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-gray-400">
                  Plot {due.plot_number} • Due: {due.due_date}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">
                  ₹{(due.amount_due / 1000).toFixed(0)}k
                </span>
                <button
                  type="button"
                  onClick={() => handleReminder(due)}
                  className={`rounded-lg border p-1.5 transition-colors ${
                    isReminded
                      ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-400'
                      : 'hover:border-brand-gold/30 hover:text-brand-gold border-white/10 bg-white/5 text-gray-300'
                  }`}
                  title={isReminded ? 'Reminder Sent' : 'Send Reminder'}
                  aria-label={`Send reminder to ${due.customer_name}`}
                >
                  {isReminded ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Bell className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {duesList.length === 0 && (
          <div className="flex items-center justify-center gap-2 py-6 text-xs text-gray-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>No upcoming payment dues found.</span>
          </div>
        )}
      </div>
    </div>
  );
}
