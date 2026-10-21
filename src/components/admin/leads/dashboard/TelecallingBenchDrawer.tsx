import React from 'react';
import { ChevronDown, MessageCircle, Phone } from 'lucide-react';
import type { AdvisorPerformanceMetric } from '@/src/lib/types/telecalling';

interface TelecallingBenchDrawerProps {
  benchAdvisors: AdvisorPerformanceMetric[];
  showBench: boolean;
  setShowBench: (show: boolean) => void;
  isSearching: boolean;
}

export function TelecallingBenchDrawer({
  benchAdvisors,
  showBench,
  setShowBench,
  isSearching,
}: TelecallingBenchDrawerProps) {
  if (benchAdvisors.length === 0) return null;

  return (
    <div className="mt-4 rounded-2xl border border-gray-200/70 bg-gray-50/50 p-4 transition-colors dark:border-white/5 dark:bg-white/[0.01]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-700 dark:bg-white/10 dark:text-gray-300">
            {benchAdvisors.length}
          </span>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Inactive Telecallers On Bench (0 Calls Recorded)
          </span>
          <span className="hidden text-[11px] text-gray-400 sm:inline">
            &bull; Ready for next campaign assignment
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowBench(!showBench)}
          className="text-brand-gold hover:text-brand-gold-light flex cursor-pointer items-center gap-1.5 text-xs font-bold"
        >
          <span>
            {showBench || isSearching
              ? 'Collapse Bench'
              : `Show Inactive Staff (${benchAdvisors.length})`}
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${
              showBench || isSearching ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {(showBench || isSearching) && (
        <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {benchAdvisors.map((advisor) => (
            <div
              key={advisor.advisor_id}
              className="flex items-center justify-between rounded-xl border border-gray-200/60 bg-white p-3 shadow-2xs transition-colors dark:border-white/5 dark:bg-[#13131c]"
            >
              <div className="min-w-0 pr-2">
                <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                  {advisor.advisor_name}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                  <span className="capitalize">{advisor.role || 'Advisor'}</span>
                  {advisor.is_active === false && (
                    <span className="py-0.2 rounded-md border border-red-500/20 bg-red-50 px-1 text-[9px] font-semibold text-red-600 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-400">
                      Disabled
                    </span>
                  )}
                  {advisor.phone && (
                    <>
                      <span>&bull;</span>
                      <span className="font-mono">{advisor.phone}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {advisor.phone && (
                  <>
                    <a
                      href={`https://wa.me/91${advisor.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Hello ${advisor.advisor_name}, checking your telecalling campaign assignment status.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                      title="Message on WhatsApp"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                    </a>
                    <a
                      href={`tel:${advisor.phone}`}
                      className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                      title="Direct Call"
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
