'use client';

import { AlertCircle, CheckCircle2, PhoneForwarded, Receipt, UserX } from 'lucide-react';
import Link from 'next/link';
import type { ExecutiveDashboardData } from '@/app/api/admin/dashboard/executive/route';

export interface UrgentAttentionRadarProps {
  urgentActions: ExecutiveDashboardData['urgentActions'];
}

export function UrgentAttentionRadar({ urgentActions }: UrgentAttentionRadarProps) {
  const unverifiedReceipts = urgentActions?.unverifiedReceipts ?? [];
  const hotLeadsPending = urgentActions?.hotLeadsPending ?? [];
  const pendingLeaves = urgentActions?.pendingLeaves ?? [];

  const totalUrgent = unverifiedReceipts.length + hotLeadsPending.length + pendingLeaves.length;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#090e17]/80 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-amber-400">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Urgent Executive Triage</h3>
            <p className="text-xs text-gray-400">Items requiring admin attention</p>
          </div>
        </div>
        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-400">
          {totalUrgent} Pending
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {/* Unverified Receipts */}
        {unverifiedReceipts.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs"
          >
            <div className="flex items-center gap-3">
              <Receipt className="h-4 w-4 text-purple-400" />
              <div>
                <div className="font-medium text-white">{r.customer_name}</div>
                <div className="text-[11px] text-gray-400">
                  ₹{(r.amount / 100000).toFixed(2)}L • {r.receipt_number}
                </div>
              </div>
            </div>
            <Link
              href="/admin/payment-receipt"
              className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[11px] font-medium text-purple-300 hover:bg-purple-500/20"
            >
              Verify
            </Link>
          </div>
        ))}

        {/* Hot Leads */}
        {hotLeadsPending.map((l) => (
          <div
            key={l.id}
            className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs"
          >
            <div className="flex items-center gap-3">
              <PhoneForwarded className="h-4 w-4 text-amber-400" />
              <div>
                <div className="font-medium text-white">{l.name}</div>
                <div className="text-[11px] text-gray-400">Hot Lead • {l.phone}</div>
              </div>
            </div>
            <Link
              href="/admin/leads"
              className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300 hover:bg-amber-500/20"
            >
              Assign
            </Link>
          </div>
        ))}

        {/* Pending Leaves */}
        {pendingLeaves.map((lv) => (
          <div
            key={lv.id}
            className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs"
          >
            <div className="flex items-center gap-3">
              <UserX className="h-4 w-4 text-emerald-400" />
              <div>
                <div className="font-medium text-white">{lv.user_name}</div>
                <div className="text-[11px] text-gray-400">Leave Request: {lv.leave_type}</div>
              </div>
            </div>
            <Link
              href="/admin/workforce?tab=leaves"
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20"
            >
              Review
            </Link>
          </div>
        ))}

        {totalUrgent === 0 && (
          <div className="flex items-center justify-center gap-2 py-6 text-xs text-gray-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>All Clear! No urgent bottlenecks pending.</span>
          </div>
        )}
      </div>
    </div>
  );
}
