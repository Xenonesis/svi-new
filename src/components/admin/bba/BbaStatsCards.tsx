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
    <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <FileText className="text-brand-gold h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Total BBAs
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</h3>
          </div>
        </div>
      </div>

      <div className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <IndianRupee className="text-brand-gold h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Total Unit Value
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h3>
          </div>
        </div>
      </div>

      <div className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <TrendingUp className="text-brand-gold h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Avg Area (Sq.Yds)
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {avgArea.toFixed(1)}
            </h3>
          </div>
        </div>
      </div>

      <div className="dark:bg-brand-dark-surface/50 relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <Building2 className="text-brand-gold h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Shyam Aangan
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{shyamAanganCount}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
