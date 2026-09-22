'use client';

import { Target } from 'lucide-react';
import type { ExecutiveDashboardData } from '@/app/api/admin/dashboard/executive/route';

export interface TargetAchievementMeterProps {
  target: ExecutiveDashboardData['target'];
}

export function TargetAchievementMeter({ target }: TargetAchievementMeterProps) {
  const targetLakhs = (target.monthlyTarget / 100000).toFixed(1);
  const collectedLakhs = (target.currentCollections / 100000).toFixed(1);
  const isAhead = target.status === 'ahead' || target.status === 'on_track';

  return (
    <div className="rounded-2xl border border-white/10 bg-[#090e17]/80 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold rounded-xl border p-2">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Monthly Target Pacing</h3>
            <p className="text-xs text-gray-400">Target: ₹{targetLakhs}L</p>
          </div>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
            isAhead
              ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
              : 'border border-amber-500/30 bg-amber-500/15 text-amber-400'
          }`}
        >
          {isAhead ? 'Ahead of Target' : 'Pacing Gap'}
        </span>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-end justify-between text-xs">
          <span className="text-gray-400">
            Current Collections: <strong className="text-white">₹{collectedLakhs}L</strong>
          </span>
          <span className="text-brand-gold text-base font-bold">{target.percentage}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/10 p-0.5">
          <div
            className="from-brand-gold/80 to-brand-gold shadow-brand-gold h-full rounded-full bg-gradient-to-r shadow-sm transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, target.percentage))}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/5 pt-4 text-xs">
        <div>
          <span className="text-[11px] text-gray-400">Projected Run Rate</span>
          <div className="font-semibold text-white">
            ₹{(target.projectedTotal / 100000).toFixed(1)}L
          </div>
        </div>
        <div>
          <span className="text-[11px] text-gray-400">Needed Run Rate</span>
          <div className="font-semibold text-amber-400">
            ₹{(target.dailyRunRateNeeded / 1000).toFixed(0)}k / day
          </div>
        </div>
      </div>
    </div>
  );
}
