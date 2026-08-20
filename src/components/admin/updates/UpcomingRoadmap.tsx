import { Compass, Clock } from 'lucide-react';
import { RoadmapItem } from './types';

interface UpcomingRoadmapProps {
  roadmap: RoadmapItem[];
}

export function UpcomingRoadmap({ roadmap }: UpcomingRoadmapProps) {
  return (
    <div className="dark:bg-brand-dark-surface/70 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10">
      <div className="flex items-center gap-2.5">
        <div className="bg-brand-gold/15 text-brand-gold flex h-8 w-8 items-center justify-center rounded-xl">
          <Compass className="h-4.5 w-4.5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Upcoming Roadmap & Planned Features
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            A preview of operational features currently in development or planned for upcoming
            quarters.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {roadmap.map((item, idx) => (
          <div
            key={idx}
            className="hover:border-brand-gold/30 flex flex-col justify-between rounded-xl border border-gray-100 bg-gray-50/70 p-4 transition-all hover:bg-white dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="bg-brand-navy/5 text-brand-navy dark:text-brand-gold rounded-md px-2 py-0.5 text-[10px] font-bold uppercase dark:bg-white/10">
                  {item.category}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  <Clock className="h-3 w-3" />
                  {item.targetQuarter}
                </span>
              </div>
              <h3 className="mt-2.5 text-sm font-bold text-gray-900 dark:text-white">
                {item.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                {item.description}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  item.status === 'In Development'
                    ? 'animate-pulse bg-emerald-500'
                    : item.status === 'Testing'
                      ? 'bg-blue-500'
                      : 'bg-gray-400'
                }`}
              />
              <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
