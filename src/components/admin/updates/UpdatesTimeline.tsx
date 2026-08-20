'use client';

import { motion } from 'motion/react';
import { Calendar, Tag, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { SystemUpdateRelease, UpdateTag } from './types';

interface UpdatesTimelineProps {
  releases: SystemUpdateRelease[];
}

const TAG_STYLES: Record<UpdateTag, { bg: string; text: string; border: string }> = {
  'New Feature': {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-500/30',
  },
  Improvement: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-500/30',
  },
  Fix: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-500/30',
  },
  'Design & Speed': {
    bg: 'bg-purple-500/10 dark:bg-purple-500/15',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-500/30',
  },
  Security: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-500/30',
  },
};

export function UpdatesTimeline({ releases }: UpdatesTimelineProps) {
  if (releases.length === 0) {
    return (
      <div className="dark:bg-brand-dark-surface/40 rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-white/10">
        <Sparkles className="mx-auto h-10 w-10 text-gray-400" />
        <h3 className="mt-3 text-base font-semibold text-gray-900 dark:text-white">
          No updates match your search
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your search terms or category filter above.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 pl-4 sm:pl-8">
      {/* Vertical Golden Connecting Line */}
      <div className="via-brand-gold/40 from-brand-gold/60 absolute top-4 bottom-4 left-4 h-full w-[2px] -translate-x-1/2 bg-gradient-to-b to-transparent sm:left-8" />

      {releases.map((release, releaseIdx) => (
        <motion.article
          key={release.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: releaseIdx * 0.05, duration: 0.4 }}
          className="relative pl-6 sm:pl-10"
        >
          {/* Milestone Node Badge */}
          <div
            className={`absolute top-1.5 left-0 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2 shadow-md ${
              release.isLatest
                ? 'bg-brand-gold text-brand-navy shadow-brand-gold/30 border-white'
                : 'border-brand-gold/50 dark:bg-brand-dark-surface bg-white text-gray-700 dark:text-gray-200'
            }`}
          >
            {release.isLatest ? (
              <Sparkles className="h-4 w-4" />
            ) : (
              <Calendar className="h-3.5 w-3.5" />
            )}
          </div>

          {/* Release Card */}
          <div className="dark:bg-brand-dark-surface/80 overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-lg backdrop-blur-sm dark:border-white/10">
            {/* Card Header */}
            <div className="border-b border-gray-100 bg-gray-50/70 p-5 sm:p-6 dark:border-white/5 dark:bg-white/[0.02]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="bg-brand-navy text-brand-gold inline-flex items-center rounded-lg px-2.5 py-1 font-mono text-xs font-bold dark:bg-white/10 dark:text-white">
                    {release.version}
                  </span>
                  {release.isLatest && (
                    <span className="bg-brand-gold/20 text-brand-navy dark:text-brand-gold rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                      Latest Release
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    <Tag className="h-3 w-3" />
                    {release.category}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <time dateTime={release.date}>{release.formattedDate}</time>
                </div>
              </div>

              <h2 className="text-brand-navy mt-3 font-serif text-xl font-bold tracking-tight sm:text-2xl dark:text-white">
                {release.title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {release.summary}
              </p>
            </div>

            {/* List of Improvements */}
            <div className="divide-y divide-gray-100 p-5 sm:p-6 dark:divide-white/5">
              {release.items.map((item, itemIdx) => {
                const style = TAG_STYLES[item.tag] || TAG_STYLES['Improvement'];
                return (
                  <div
                    key={itemIdx}
                    className={`py-4 first:pt-0 last:pb-0 ${itemIdx !== 0 ? 'mt-4' : ''}`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${style.bg} ${style.text} ${style.border}`}
                      >
                        {item.tag}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        {item.title}
                      </h3>
                    </div>

                    <p className="mt-1.5 text-xs leading-relaxed text-gray-600 sm:text-sm dark:text-gray-300">
                      {item.description}
                    </p>

                    {item.benefit && (
                      <div className="mt-2.5 flex items-start gap-2 rounded-xl bg-amber-500/5 p-2.5 text-xs text-amber-900 sm:items-center dark:bg-amber-500/10 dark:text-amber-200">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                        <span>
                          <strong className="font-semibold">Business Benefit:</strong>{' '}
                          {item.benefit}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
