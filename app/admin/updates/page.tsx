'use client';

import { useState, useMemo } from 'react';
import {
  SYSTEM_UPDATES,
  UPCOMING_ROADMAP,
  UpdateCategory,
  UpdatesHeader,
  UpdatesStats,
  UpdatesTimeline,
  UpcomingRoadmap,
} from '@/src/components/admin/updates';

export default function AdminUpdatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<UpdateCategory>('All');

  // Filter updates by search query and category
  const filteredReleases = useMemo(() => {
    return SYSTEM_UPDATES.filter((release) => {
      // Category match
      const categoryMatch = selectedCategory === 'All' || release.category === selectedCategory;

      if (!categoryMatch) return false;

      // Search match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();

      const inTitle = release.title.toLowerCase().includes(q);
      const inSummary = release.summary.toLowerCase().includes(q);
      const inItems = release.items.some(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.benefit && item.benefit.toLowerCase().includes(q))
      );

      return inTitle || inSummary || inItems;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 pb-16 font-sans">
      {/* Header with Search and Category Selectors */}
      <UpdatesHeader
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        onSearchChange={setSearchQuery}
        onCategoryChange={setSelectedCategory}
      />

      {/* Summary Stat Cards */}
      <UpdatesStats releases={SYSTEM_UPDATES} />

      {/* Chronological Updates Timeline */}
      <div className="pt-2">
        <UpdatesTimeline releases={filteredReleases} />
      </div>

      {/* Upcoming Operational Roadmap */}
      <div className="pt-6">
        <UpcomingRoadmap roadmap={UPCOMING_ROADMAP} />
      </div>
    </div>
  );
}
