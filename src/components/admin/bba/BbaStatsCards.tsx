import { FileText, IndianRupee, TrendingUp, Building2 } from 'lucide-react';

interface BbaStatsCardsProps {
  totalCount: number;
  totalValue: number;
  avgArea: number;
  shyamAanganCount: number;
}

export default function BbaStatsCards({
  totalCount,
  totalValue,
  avgArea,
  shyamAanganCount,
}: BbaStatsCardsProps) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-2.5 sm:mb-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
      <div className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-md sm:rounded-2xl sm:p-5 dark:border-white/5">
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="bg-brand-gold/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl">
            <FileText className="text-brand-gold h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold tracking-wider text-gray-400 uppercase sm:text-[10px] sm:tracking-widest">
              Total BBAs
            </p>
            <h3 className="truncate text-lg font-bold text-gray-900 sm:text-2xl dark:text-white">
              {totalCount}
            </h3>
          </div>
        </div>
      </div>

      <div className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-md sm:rounded-2xl sm:p-5 dark:border-white/5">
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="bg-brand-gold/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl">
            <IndianRupee className="text-brand-gold h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold tracking-wider text-gray-400 uppercase sm:text-[10px] sm:tracking-widest">
              Total Unit Value
            </p>
            <h3 className="truncate text-lg font-bold text-gray-900 sm:text-2xl dark:text-white">
              ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h3>
          </div>
        </div>
      </div>

      <div className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-md sm:rounded-2xl sm:p-5 dark:border-white/5">
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="bg-brand-gold/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl">
            <TrendingUp className="text-brand-gold h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold tracking-wider text-gray-400 uppercase sm:text-[10px] sm:tracking-widest">
              Avg Area (Sq.Yds)
            </p>
            <h3 className="truncate text-lg font-bold text-gray-900 sm:text-2xl dark:text-white">
              {avgArea.toFixed(1)}
            </h3>
          </div>
        </div>
      </div>

      <div className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-md sm:rounded-2xl sm:p-5 dark:border-white/5">
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="bg-brand-gold/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl">
            <Building2 className="text-brand-gold h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold tracking-wider text-gray-400 uppercase sm:text-[10px] sm:tracking-widest">
              Shyam Aangan
            </p>
            <h3 className="truncate text-lg font-bold text-gray-900 sm:text-2xl dark:text-white">
              {shyamAanganCount}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
