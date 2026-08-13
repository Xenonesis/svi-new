'use client';

import type { QuotationCalculationResult } from '@/src/lib/quotation/types';
import { formatINR } from '@/src/lib/quotation/format';

interface QuotationSummaryProps {
  calculation: QuotationCalculationResult | null;
  area: string;
}

export default function QuotationSummary({ calculation, area }: QuotationSummaryProps) {
  if (!calculation) {
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-white/5 dark:bg-white/3">
        <p className="text-xs text-gray-400 dark:text-gray-600">
          Fill in pricing details to see live calculation summary.
        </p>
      </div>
    );
  }

  const rows = [
    {
      label: 'Plot Area',
      value: `${Number(area).toLocaleString('en-IN')} Sq. Yds.`,
      emphasis: false,
    },
    {
      label: 'Basic Rate',
      value: `${formatINR(calculation.basicRate)} / Sq. Yd.`,
      emphasis: false,
    },
    {
      label: 'Basic Price',
      value: formatINR(calculation.basicPrice),
      emphasis: false,
      sublabel: `${Number(area).toLocaleString('en-IN')} × ${formatINR(calculation.basicRate)}`,
    },
    {
      label: 'EDC Rate',
      value: `${formatINR(calculation.edcRate)} / Sq. Yd.`,
      emphasis: false,
    },
    {
      label: 'EDC Amount',
      value: formatINR(calculation.edcAmount),
      emphasis: false,
      sublabel: `${Number(area).toLocaleString('en-IN')} × ${formatINR(calculation.edcRate)}`,
    },
    {
      label: `PLC @ ${calculation.plcPercent}%`,
      value: formatINR(calculation.plcAmount),
      emphasis: false,
      sublabel: `${calculation.plcPercent}% of ${formatINR(calculation.basicPrice)}`,
    },
    {
      label: 'Effective Rate',
      value: `${formatINR(calculation.effectiveRate)} / Sq. Yd.`,
      emphasis: false,
    },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-5 dark:border-white/8 dark:bg-white/3">
      <p className="mb-4 text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
        Live Calculation
      </p>
      <div className="divide-y divide-gray-100 dark:divide-white/5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-4 py-2.5">
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">{row.label}</p>
              {row.sublabel && (
                <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-600">
                  {row.sublabel}
                </p>
              )}
            </div>
            <p className="text-xs font-bold text-gray-900 tabular-nums dark:text-white">
              {row.value}
            </p>
          </div>
        ))}
      </div>

      {/* Grand Total highlight */}
      <div className="mt-4 rounded-lg border border-amber-200/50 bg-amber-50 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/10">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold tracking-wider text-amber-900 uppercase dark:text-amber-400">
            Grand Total
          </p>
          <p className="text-xl font-extrabold text-amber-900 tabular-nums dark:text-amber-400">
            {formatINR(calculation.grandTotal)}
          </p>
        </div>
      </div>
    </div>
  );
}
