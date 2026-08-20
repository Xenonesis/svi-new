'use client';

import { Sparkles, Search, X, Printer } from 'lucide-react';
import { UpdateCategory } from './types';

interface UpdatesHeaderProps {
  searchQuery: string;
  selectedCategory: UpdateCategory;
  onSearchChange: (q: string) => void;
  onCategoryChange: (cat: UpdateCategory) => void;
}

const CATEGORIES: UpdateCategory[] = [
  'All',
  'Email & Marketing',
  'WhatsApp Sales',
  'Documents & Legal',
  'Staff & Operations',
  'Security & Platform',
];

export function UpdatesHeader({
  searchQuery,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
}: UpdatesHeaderProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="bg-brand-gold/15 text-brand-gold flex h-8 w-8 items-center justify-center rounded-xl">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <span className="text-brand-gold text-xs font-bold tracking-widest uppercase">
              System What&apos;s New & Release Log
            </span>
          </div>
          <h1 className="text-brand-navy mt-1.5 font-serif text-3xl font-bold tracking-tight sm:text-4xl dark:text-white">
            Platform <span className="text-brand-gold italic">Updates</span> & History
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            A comprehensive, plain-language record of all features, operational enhancements, and
            system upgrades.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="dark:hover:bg-brand-dark-surface/80 flex items-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 sm:self-center dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
          title="Print or Save as PDF"
        >
          <Printer className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span>Print / Export Log</span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search className="text-brand-gold absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search updates (e.g. Email, WhatsApp, Hindi, BBA)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="focus:border-brand-gold focus:ring-brand-gold/15 dark:bg-brand-dark-surface/85 w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-10 pl-10 text-xs text-gray-900 placeholder-gray-400 transition-all focus:ring-2 focus:outline-none sm:text-sm dark:border-white/10 dark:text-white dark:placeholder-gray-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="hover:text-brand-gold absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="scrollbar-gold flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-brand-gold text-brand-navy shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
