'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { PlotData, PlotBlock } from '@/src/data/shivaniVatika11Plots';
import { PlotCard } from './PlotCard';
import { Search, X, RotateCcw, Filter } from 'lucide-react';

export interface PlotMatrixGridProps {
  plots: PlotData[];
  onSelectPlot: (plot: PlotData) => void;
  isHindi?: boolean;
  initialBlock?: string;
}

const BLOCK_OPTIONS = ['All', 'Residential', 'A-Block', 'Commercial'] as const;
const SIZE_OPTIONS = ['All Sizes', '50 Gaj', '64 Gaj', '80 Gaj', '100 Gaj', '150+ Gaj'] as const;
const STATUS_OPTIONS = ['All', 'Available', 'Booked', 'Reserved'] as const;

export function PlotMatrixGrid({
  plots,
  onSelectPlot,
  isHindi = false,
  initialBlock = 'All',
}: PlotMatrixGridProps): React.JSX.Element {
  const [selectedBlock, setSelectedBlock] = useState<string>(initialBlock);
  const [selectedSize, setSelectedSize] = useState<string>('All Sizes');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (initialBlock) {
      setSelectedBlock(initialBlock);
    }
  }, [initialBlock]);

  const filteredPlots = useMemo(() => {
    return plots.filter((plot) => {
      // Block Filter
      if (selectedBlock !== 'All' && plot.block !== selectedBlock) {
        return false;
      }

      // Size Filter
      if (selectedSize !== 'All Sizes') {
        const size = plot.sizeSqYd;
        if (selectedSize === '50 Gaj' && Math.round(size) !== 50) return false;
        if (selectedSize === '64 Gaj' && Math.round(size) !== 64) return false;
        if (selectedSize === '80 Gaj' && Math.round(size) !== 80) return false;
        if (selectedSize === '100 Gaj' && Math.round(size) !== 100) return false;
        if (selectedSize === '150+ Gaj' && size < 150) return false;
      }

      // Status Filter
      if (selectedStatus !== 'All') {
        if (plot.status.toLowerCase() !== selectedStatus.toLowerCase()) {
          return false;
        }
      }

      // Search input matching plotNo (case-insensitive)
      if (searchQuery.trim()) {
        const cleanQuery = searchQuery
          .trim()
          .toLowerCase()
          .replace(/^(plot\s*#?|#)/i, '')
          .trim();
        const plotNoLower = plot.plotNo.toLowerCase();
        if (cleanQuery && !plotNoLower.includes(cleanQuery)) {
          return false;
        }
      }

      return true;
    });
  }, [plots, selectedBlock, selectedSize, selectedStatus, searchQuery]);

  const handleResetFilters = (): void => {
    setSelectedBlock('All');
    setSelectedSize('All Sizes');
    setSelectedStatus('All');
    setSearchQuery('');
  };

  const isFiltered =
    selectedBlock !== 'All' ||
    selectedSize !== 'All Sizes' ||
    selectedStatus !== 'All' ||
    searchQuery.trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Filter Control Center */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0c1019]/90 p-4 backdrop-blur-md sm:p-5">
        {/* Row 1: Search bar + Status Counts */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Plot # (e.g. 45, A-15, Shop-4)..."
              aria-label="Search plot number"
              className="w-full rounded-xl border border-white/10 bg-black/50 py-2.5 pr-9 pl-10 text-sm text-white placeholder-gray-500 transition-all focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Reset Filters Quick Button if active */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 self-start rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-gray-300 transition-colors hover:border-[#d4af37]/40 hover:text-white sm:self-auto"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#d4af37]" />
              <span>{isHindi ? 'फ़िल्टर हटाएं' : 'Reset Filters'}</span>
            </button>
          )}
        </div>

        {/* Row 2: Block, Size & Status Filter Pill Groups */}
        <div className="flex flex-col gap-4 border-t border-white/5 pt-4 text-xs">
          {/* Block Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-gray-400 sm:w-16">
              {isHindi ? 'ब्लॉक:' : 'Block:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {BLOCK_OPTIONS.map((block) => {
                const isActive = selectedBlock === block;
                return (
                  <button
                    key={block}
                    type="button"
                    onClick={() => setSelectedBlock(block)}
                    className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                      isActive
                        ? 'bg-[#d4af37] font-semibold text-[#080b11] shadow-sm shadow-[#d4af37]/20'
                        : 'border border-white/5 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {block}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-gray-400 sm:w-16">
              {isHindi ? 'साइज़:' : 'Size:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SIZE_OPTIONS.map((size) => {
                const isActive = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                      isActive
                        ? 'bg-[#d4af37] font-semibold text-[#080b11] shadow-sm shadow-[#d4af37]/20'
                        : 'border border-white/5 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-gray-400 sm:w-16">
              {isHindi ? 'स्थिति:' : 'Status:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((status) => {
                const isActive = selectedStatus === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setSelectedStatus(status)}
                    className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                      isActive
                        ? 'bg-[#d4af37] font-semibold text-[#080b11] shadow-sm shadow-[#d4af37]/20'
                        : 'border border-white/5 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results indicator bar */}
        <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[11px] text-gray-400">
          <span>
            {isHindi
              ? `दिखाए जा रहे हैं: ${filteredPlots.length} / ${plots.length} प्लॉट्स`
              : `Showing ${filteredPlots.length} of ${plots.length} plots`}
          </span>
          {isFiltered && (
            <span className="text-[#d4af37]">
              {isHindi ? 'फ़िल्टर लागू हैं' : 'Active Filters Applied'}
            </span>
          )}
        </div>
      </div>

      {/* Main Grid / Empty State */}
      {filteredPlots.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0c1019] px-4 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400">
            <Filter className="h-6 w-6 text-[#d4af37]" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            {isHindi ? 'कोई प्लॉट नहीं मिला' : 'No plots found matching your criteria'}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-gray-400">
            {isHindi
              ? 'कृपया अपने फ़िल्टर या खोज मानदंड बदलकर पुनः प्रयास करें।'
              : 'Try loosening your block, size, or status filters to find available units.'}
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-2 text-xs font-semibold text-[#d4af37] transition-all hover:bg-[#d4af37]/20"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{isHindi ? 'सभी फ़िल्टर साफ़ करें' : 'Reset all filters'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filteredPlots.map((plot) => (
            <PlotCard key={plot.plotNo} plot={plot} onSelect={onSelectPlot} />
          ))}
        </div>
      )}
    </div>
  );
}
