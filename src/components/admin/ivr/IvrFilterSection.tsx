import React from 'react';
import { Search } from 'lucide-react';

interface IvrFilterSectionProps {
  virtualNumber: string;
  setVirtualNumber: (val: string) => void;
  toNumber: string;
  setToNumber: (val: string) => void;
  fromNumber: string;
  setFromNumber: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  clearFilters: () => void;
  fetchHistory: (page?: number) => void;
}

export function IvrFilterSection({
  virtualNumber,
  setVirtualNumber,
  toNumber,
  setToNumber,
  fromNumber,
  setFromNumber,
  status,
  setStatus,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  clearFilters,
  fetchHistory,
}: IvrFilterSectionProps) {
  return (
    <div className="dark:bg-brand-dark-surface/65 relative rounded-xl border border-gray-200 bg-white/80 p-5 shadow-lg backdrop-blur-md dark:border-white/8">
      <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-white/5">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Filter Voice Logs</h3>
        <button
          onClick={clearFilters}
          className="hover:text-brand-gold text-[10px] font-bold tracking-wider text-gray-400 uppercase transition-colors"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <div>
          <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
            Virtual Number
          </label>
          <input
            type="text"
            value={virtualNumber}
            onChange={(e) => setVirtualNumber(e.target.value)}
            placeholder="Virtual No."
            className="focus:border-brand-gold focus:ring-brand-gold/15 dark:bg-brand-dark-surface/85 w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 transition-all dark:border-white/10 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
            Executive (to_number)
          </label>
          <input
            type="text"
            value={toNumber}
            onChange={(e) => setToNumber(e.target.value)}
            placeholder="Executive phone"
            className="focus:border-brand-gold focus:ring-brand-gold/15 dark:bg-brand-dark-surface/85 w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 transition-all dark:border-white/10 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
            Client (from_number)
          </label>
          <input
            type="text"
            value={fromNumber}
            onChange={(e) => setFromNumber(e.target.value)}
            placeholder="Client phone"
            className="focus:border-brand-gold focus:ring-brand-gold/15 dark:bg-brand-dark-surface/85 w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 transition-all dark:border-white/10 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="focus:border-brand-gold focus:ring-brand-gold/15 dark:bg-brand-dark-surface/85 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-900 transition-all dark:border-white/10 dark:text-white"
          >
            <option value="all">All Statuses</option>
            <option value="answered">Answered</option>
            <option value="missed">Missed</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="focus:border-brand-gold focus:ring-brand-gold/15 dark:bg-brand-dark-surface/85 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 transition-all dark:border-white/10 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="focus:border-brand-gold focus:ring-brand-gold/15 dark:bg-brand-dark-surface/85 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 transition-all dark:border-white/10 dark:text-white"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <button
          onClick={() => fetchHistory(1)}
          className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex cursor-pointer items-center gap-2 rounded-lg px-6 py-2.5 text-[10px] font-bold tracking-widest uppercase shadow-md transition-all"
        >
          <Search className="h-3.5 w-3.5" /> Apply Filter
        </button>
      </div>
    </div>
  );
}
