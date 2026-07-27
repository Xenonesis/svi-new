'use client';

interface EMISlidersProps {
  loanAmountLakhs: number;
  tenureYears: number;
  interestRate: number;
  onLoanAmountChange: (val: number) => void;
  onTenureChange: (val: number) => void;
  onInterestRateChange: (val: number) => void;
}

export default function EMISliders({
  loanAmountLakhs,
  tenureYears,
  interestRate,
  onLoanAmountChange,
  onTenureChange,
  onInterestRateChange,
}: EMISlidersProps) {
  return (
    <div className="space-y-6">
      {/* Slider 1: Loan/Investment Amount */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-bold tracking-wider text-gray-900 uppercase dark:text-gray-200">
            Property / Investment Amount
          </label>
          <span className="dark:text-brand-gold text-lg font-bold text-amber-600">
            ₹ {loanAmountLakhs} Lakhs
          </span>
        </div>
        <input
          type="range"
          min={5}
          max={100}
          step={1}
          value={loanAmountLakhs}
          onChange={(e) => onLoanAmountChange(Number(e.target.value))}
          className="dark:accent-brand-gold h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-amber-500 dark:bg-gray-700"
        />
        <div className="mt-1 flex justify-between text-[10px] font-semibold text-gray-500 dark:text-gray-400">
          <span>₹ 5 Lakhs</span>
          <span>₹ 50 Lakhs</span>
          <span>₹ 1 Crore</span>
        </div>
      </div>

      {/* Slider 2: Loan Tenure */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-bold tracking-wider text-gray-900 uppercase dark:text-gray-200">
            Loan Tenure (Years)
          </label>
          <span className="dark:text-brand-gold text-lg font-bold text-amber-600">
            {tenureYears} Years
          </span>
        </div>
        <input
          type="range"
          min={3}
          max={30}
          step={1}
          value={tenureYears}
          onChange={(e) => onTenureChange(Number(e.target.value))}
          className="dark:accent-brand-gold h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-amber-500 dark:bg-gray-700"
        />
        <div className="mt-1 flex justify-between text-[10px] font-semibold text-gray-500 dark:text-gray-400">
          <span>3 Yrs</span>
          <span>15 Yrs</span>
          <span>30 Yrs</span>
        </div>
      </div>

      {/* Interest Rate Selector */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-bold tracking-wider text-gray-900 uppercase dark:text-gray-200">
            Interest Rate (% p.a.)
          </label>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {interestRate}%
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[8.4, 8.5, 8.75, 9.0].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => onInterestRateChange(rate)}
              className={`rounded-lg border py-2 text-xs font-bold transition-all ${
                interestRate === rate
                  ? 'dark:border-brand-gold dark:bg-brand-gold dark:text-brand-navy border-amber-500 bg-amber-500 text-white shadow-sm'
                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-500/50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {rate}%
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
