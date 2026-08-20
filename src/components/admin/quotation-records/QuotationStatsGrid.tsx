import { FileText, IndianRupee, TrendingUp } from 'lucide-react';

interface QuotationStatsGridProps {
  totalCount: number;
  totalValue: number;
  completedCount: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-md sm:rounded-2xl sm:p-5 dark:border-white/5">
      <div className="flex items-center gap-2.5 sm:gap-4">
        <div className="bg-brand-gold/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl">
          <Icon className="text-brand-gold h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-bold tracking-wider text-gray-400 uppercase sm:text-[10px] sm:tracking-widest">
            {label}
          </p>
          <h3 className="truncate text-lg font-bold text-gray-900 sm:text-2xl dark:text-white">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}

export function QuotationStatsGrid({
  totalCount,
  totalValue,
  completedCount,
}: QuotationStatsGridProps) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-2.5 sm:mb-8 sm:grid-cols-3 sm:gap-5">
      <StatCard icon={FileText} label="Total Quotations" value={String(totalCount)} />
      <StatCard
        icon={IndianRupee}
        label="Total Value"
        value={`₹${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
      />
      <div className="col-span-2 sm:col-span-1">
        <StatCard icon={TrendingUp} label="Completed" value={String(completedCount)} />
      </div>
    </div>
  );
}
