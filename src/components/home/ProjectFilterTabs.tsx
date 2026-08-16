'use client';

import AnimatedSection from '@/src/components/ui/AnimatedSection';

const TABS = [
  { id: 'all', label: 'All Projects' },
  { id: 'plots', label: 'Residential Plots' },
  { id: 'townships', label: 'Gated Townships' },
  { id: 'commercial', label: 'Commercial Hubs' },
];

interface ProjectFilterTabsProps {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

export default function ProjectFilterTabs({
  activeCategory,
  onCategoryChange,
}: ProjectFilterTabsProps) {
  return (
    <AnimatedSection type="fadeRight">
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onCategoryChange(tab.id)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-300 ${
              activeCategory === tab.id
                ? 'border-brand-gold bg-brand-gold text-brand-navy scale-105 shadow-md'
                : 'hover:border-brand-gold/50 border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </AnimatedSection>
  );
}
