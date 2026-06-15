'use client';

import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { FilterDropdown } from './FilterDropdown';
import { STATUS_OPTIONS, STATUS_MAP } from './types';
import type { Filters, FilterOptions } from './types';

interface FilterPanelProps {
  show: boolean;
  filters: Filters;
  filterOptions: FilterOptions;
  activeFilterCount: number;
  onUpdateFilter: (key: keyof Filters, value: string) => void;
  onClearFilters: () => void;
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="bg-brand-gold/10 text-brand-gold flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold">
      {label}
      <button onClick={onRemove}>
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

export function FilterPanel({
  show,
  filters,
  filterOptions,
  activeFilterCount,
  onUpdateFilter,
  onClearFilters,
}: FilterPanelProps) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={show ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="dark:border-brand-gold/15 dark:bg-brand-dark-surface/65 rounded-xl border border-gray-200 bg-white/80 p-5 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-brand-navy text-xs font-bold tracking-widest dark:text-white">
            FILTER BY
          </h3>
          {activeFilterCount > 0 && (
            <button
              onClick={onClearFilters}
              className="text-brand-gold hover:text-brand-gold/80 cursor-pointer text-xs font-semibold"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {/* Status filter */}
          <div className="min-w-0 flex-1">
            <label className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => onUpdateFilter('status', e.target.value)}
              className="focus:border-brand-gold dark:bg-brand-dark-surface mt-1 w-full appearance-none truncate rounded border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 outline-none dark:border-white/10 dark:text-gray-300"
            >
              <option value="">All</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <FilterDropdown
            label="Project"
            value={filters.project}
            options={filterOptions.projects}
            onChange={(v) => onUpdateFilter('project', v)}
          />
          <FilterDropdown
            label="Advisor"
            value={filters.advisor}
            options={filterOptions.advisors}
            onChange={(v) => onUpdateFilter('advisor', v)}
          />
          <FilterDropdown
            label="Property Type"
            value={filters.propertyType}
            options={filterOptions.propertyTypes}
            onChange={(v) => onUpdateFilter('propertyType', v)}
          />
          <FilterDropdown
            label="Property Size"
            value={filters.propertySize}
            options={filterOptions.propertySizes}
            onChange={(v) => onUpdateFilter('propertySize', v)}
          />
          <FilterDropdown
            label="Plot Preference"
            value={filters.plotPreference}
            options={filterOptions.plotPreferences}
            onChange={(v) => onUpdateFilter('plotPreference', v)}
          />
          <FilterDropdown
            label="Payment Plan"
            value={filters.paymentPlan}
            options={filterOptions.paymentPlans}
            onChange={(v) => onUpdateFilter('paymentPlan', v)}
          />
          <FilterDropdown
            label="Payment Mode"
            value={filters.paymentMode}
            options={filterOptions.paymentModes}
            onChange={(v) => onUpdateFilter('paymentMode', v)}
          />
          <div className="min-w-0 flex-1">
            <label className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">
              From Date
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onUpdateFilter('dateFrom', e.target.value)}
              className="focus:border-brand-gold dark:bg-brand-dark-surface mt-1 w-full rounded border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 outline-none dark:border-white/10 dark:text-gray-300"
            />
          </div>
          <div className="min-w-0 flex-1">
            <label className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">
              To Date
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onUpdateFilter('dateTo', e.target.value)}
              className="focus:border-brand-gold dark:bg-brand-dark-surface mt-1 w-full rounded border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 outline-none dark:border-white/10 dark:text-gray-300"
            />
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.status && (
              <FilterChip
                label={`Status: ${STATUS_MAP[filters.status]?.label || filters.status}`}
                onRemove={() => onUpdateFilter('status', '')}
              />
            )}
            {filters.project && (
              <FilterChip
                label={`Project: ${filters.project}`}
                onRemove={() => onUpdateFilter('project', '')}
              />
            )}
            {filters.advisor && (
              <FilterChip
                label={`Advisor: ${filters.advisor}`}
                onRemove={() => onUpdateFilter('advisor', '')}
              />
            )}
            {filters.propertyType && (
              <FilterChip
                label={`Type: ${filters.propertyType}`}
                onRemove={() => onUpdateFilter('propertyType', '')}
              />
            )}
            {filters.propertySize && (
              <FilterChip
                label={`Size: ${filters.propertySize}`}
                onRemove={() => onUpdateFilter('propertySize', '')}
              />
            )}
            {filters.plotPreference && (
              <FilterChip
                label={`Plot: ${filters.plotPreference}`}
                onRemove={() => onUpdateFilter('plotPreference', '')}
              />
            )}
            {filters.paymentPlan && (
              <FilterChip
                label={`Plan: ${filters.paymentPlan}`}
                onRemove={() => onUpdateFilter('paymentPlan', '')}
              />
            )}
            {filters.paymentMode && (
              <FilterChip
                label={`Mode: ${filters.paymentMode}`}
                onRemove={() => onUpdateFilter('paymentMode', '')}
              />
            )}
            {filters.dateFrom && (
              <FilterChip
                label={`From: ${filters.dateFrom}`}
                onRemove={() => onUpdateFilter('dateFrom', '')}
              />
            )}
            {filters.dateTo && (
              <FilterChip
                label={`To: ${filters.dateTo}`}
                onRemove={() => onUpdateFilter('dateTo', '')}
              />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
