import { Sparkles, Layers, ShieldCheck, Zap } from 'lucide-react';
import { SystemUpdateRelease } from './types';

interface UpdatesStatsProps {
  releases: SystemUpdateRelease[];
}

export function UpdatesStats({ releases }: UpdatesStatsProps) {
  const totalReleases = releases.length;
  const totalItems = releases.reduce((sum, r) => sum + r.items.length, 0);
  const newFeaturesCount = releases.reduce(
    (sum, r) => sum + r.items.filter((i) => i.tag === 'New Feature').length,
    0
  );
  const improvementsCount = releases.reduce(
    (sum, r) => sum + iCount(r, 'Improvement') + iCount(r, 'Fix') + iCount(r, 'Design & Speed'),
    0
  );

  function iCount(r: SystemUpdateRelease, tag: string) {
    return r.items.filter((i) => i.tag === tag).length;
  }

  const stats = [
    {
      icon: Sparkles,
      label: 'New Features Added',
      value: `${newFeaturesCount}+`,
      subtext: 'High-impact business tools',
    },
    {
      icon: Zap,
      label: 'Operational Refinements',
      value: `${improvementsCount}+`,
      subtext: 'Speed, accuracy & fixes',
    },
    {
      icon: Layers,
      label: 'Major System Releases',
      value: String(totalReleases),
      subtext: `${totalItems} total documented updates`,
    },
    {
      icon: ShieldCheck,
      label: 'System Reliability',
      value: '99.98%',
      subtext: 'Hardened corporate standards',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="dark:bg-brand-dark-surface/60 relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all sm:p-5 dark:border-white/10"
          >
            <div className="flex items-start justify-between">
              <div className="bg-brand-gold/10 text-brand-gold flex h-9 w-9 items-center justify-center rounded-xl sm:h-10 sm:w-10">
                <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
            </div>
            <div className="mt-3.5">
              <h3 className="font-serif text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                {stat.value}
              </h3>
              <p className="mt-0.5 text-xs font-semibold text-gray-700 dark:text-gray-200">
                {stat.label}
              </p>
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{stat.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
