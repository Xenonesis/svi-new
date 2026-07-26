'use client';

import { motion } from 'motion/react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

type ROIChartDataPoint = {
  year: string;
  yearShort: string;
  value: number;
  gain: number;
  investment: number;
};

type ROITabProps = {
  effectiveInvestment: number;
  growthRate: number;
  onGrowthRateChange: (val: number) => void;
  investmentYears: number;
  onInvestmentYearsChange: (val: number) => void;
  investmentAmount: number;
  onInvestmentAmountChange: (val: number) => void;
  roiData: ROIChartDataPoint[];
  finalValue: number;
  totalGain: number;
  roiPercent: number;
  formatCurrency: (val: number) => string;
  inputCls: string;
  labelCls: string;
  valueCls: string;
  hasFixedPrice: boolean;
  plotSize: number;
  pricePerSqYd: number;
};

export default function ROITab({
  effectiveInvestment,
  growthRate,
  onGrowthRateChange,
  investmentYears,
  onInvestmentYearsChange,
  investmentAmount,
  onInvestmentAmountChange,
  roiData,
  finalValue,
  totalGain,
  roiPercent,
  formatCurrency,
  inputCls,
  labelCls,
  valueCls,
  hasFixedPrice,
  plotSize,
  pricePerSqYd,
}: ROITabProps) {
  return (
    <motion.div
      key="roi"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg md:p-10 dark:border-gray-700 dark:bg-gray-900"
    >
      <h3 className="text-brand-navy font-serif text-2xl font-bold dark:text-gray-100">
        Investment ROI Tracker
      </h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        See how your investment grows over time in high-growth corridors
      </p>

      {/* Sliders */}
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {/* Investment Amount */}
        <div>
          <div className="flex items-baseline justify-between">
            <span className={labelCls}>Investment</span>
            <span className={valueCls}>{formatCurrency(effectiveInvestment)}</span>
          </div>
          {hasFixedPrice ? (
            <div className="mt-3 rounded-lg bg-gray-100 px-3 py-2 text-center text-xs text-gray-500 dark:bg-gray-700">
              {plotSize} sq.yd. × ₹{pricePerSqYd.toLocaleString('en-IN')}/sq.yd.
            </div>
          ) : (
            <>
              <input
                type="range"
                min={500000}
                max={20000000}
                step={100000}
                value={investmentAmount}
                onChange={(e) => onInvestmentAmountChange(Number(e.target.value))}
                aria-label="Investment Amount"
                className={`${inputCls} mt-3`}
              />
              <div className="mt-1 flex justify-between text-xs text-gray-400">
                <span>₹5L</span>
                <span>₹2Cr</span>
              </div>
            </>
          )}
        </div>

        {/* Growth Rate */}
        <div>
          <div className="flex items-baseline justify-between">
            <span className={labelCls}>Annual Growth</span>
            <span className={valueCls}>{growthRate}%</span>
          </div>
          <input
            type="range"
            min={2}
            max={30}
            step={0.5}
            value={growthRate}
            onChange={(e) => onGrowthRateChange(Number(e.target.value))}
            aria-label="Growth Rate"
            className={`${inputCls} mt-3`}
          />
          <div className="mt-1 flex justify-between text-xs text-gray-400">
            <span>2%</span>
            <span>30%</span>
          </div>
        </div>

        {/* Time Period */}
        <div>
          <div className="flex items-baseline justify-between">
            <span className={labelCls}>Time Period</span>
            <span className={valueCls}>{investmentYears} yrs</span>
          </div>
          <input
            type="range"
            min={1}
            max={15}
            step={1}
            value={investmentYears}
            onChange={(e) => onInvestmentYearsChange(Number(e.target.value))}
            aria-label="Investment Period"
            className={`${inputCls} mt-3`}
          />
          <div className="mt-1 flex justify-between text-xs text-gray-400">
            <span>1 yr</span>
            <span>15 yrs</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-10">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={roiData}>
            <defs>
              <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="yearShort" stroke="#9ca3af" fontSize={12} />
            <YAxis
              stroke="#9ca3af"
              fontSize={12}
              tickFormatter={(v: number) => '₹' + (v / 100000).toFixed(1) + 'L'}
            />
            <Tooltip
              formatter={function (val: any) {
                return [formatCurrency(val), 'Projected Value'];
              }}
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#d4af37"
              strokeWidth={2}
              fill="url(#roiGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Results */}
      <div className="mt-8 grid gap-6 rounded-xl bg-gray-50 p-6 md:grid-cols-3 dark:bg-gray-800">
        <div className="text-center">
          <p className="text-xs font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
            Projected Value
          </p>
          <p className="text-brand-gold mt-2 text-3xl font-bold">
            {formatCurrency(Math.round(finalValue))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
            Total Gain
          </p>
          <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
            +{formatCurrency(Math.round(totalGain))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
            ROI
          </p>
          <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
            +{roiPercent}%
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400 italic">
        * Projected values based on assumed annual growth rate. Actual returns may vary. Past
        performance does not guarantee future results.
      </p>
    </motion.div>
  );
}
