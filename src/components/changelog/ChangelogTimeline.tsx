'use client';

import { useMemo, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  Download,
  ExternalLink,
  GitBranch,
  Package,
  Search,
  Sparkles,
  Tag,
  X,
} from 'lucide-react';

import type { ChangelogRelease, ChangelogResult } from '@/src/lib/changelog';

/** Tiny helper to format a byte size into a human readable string. */
function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
}
import { ReleaseMarkdown } from './ReleaseMarkdown';

interface ChangelogTimelineProps {
  initial: ChangelogResult;
}

type Filter = 'all' | 'stable' | 'prerelease';

function isStable(r: ChangelogRelease) {
  return !r.isPrerelease && !r.isDraft;
}

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function dateRange(iso: string): string {
  if (!iso || iso.startsWith('1970')) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ChangelogTimeline({ initial }: ChangelogTimelineProps) {
  const t = useTranslations('pages.changelog');
  const [result, setResult] = useState<ChangelogResult>(initial);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [isPending, startTransition] = useTransition();

  const stableCount = useMemo(() => result.releases.filter(isStable).length, [result.releases]);
  const prereleaseCount = useMemo(
    () => result.releases.filter((r) => r.isPrerelease).length,
    [result.releases]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return result.releases.filter((r) => {
      if (filter === 'stable' && !isStable(r)) return false;
      if (filter === 'prerelease' && !r.isPrerelease) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.tagName.toLowerCase().includes(q) ||
        r.bodyMarkdown.toLowerCase().includes(q)
      );
    });
  }, [result.releases, query, filter]);

  const totalDownloads = useMemo(
    () => result.releases.reduce((s, r) => s + r.totalDownloads, 0),
    [result.releases]
  );
  const latestStable = useMemo(
    () => result.releases.find(isStable) ?? result.releases[0] ?? null,
    [result.releases]
  );

  const handleRetry = () => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/changelog?per_page=30&t=' + Date.now(), {
          cache: 'no-store',
        });
        const data = (await res.json()) as ChangelogResult;
        setResult(data);
      } catch {
        // network failure — keep existing data
      }
    });
  };

  return (
    <div className="space-y-12">
      {/* Stats banner */}
      {result.releases.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="border-brand-gold/20 from-brand-navy via-brand-navy-light to-brand-navy relative overflow-hidden rounded-2xl border bg-gradient-to-br px-6 py-8 text-white shadow-lg md:px-10 md:py-10"
          aria-labelledby="changelog-stats"
        >
          {/* Decorative gold accent */}
          <div
            className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #d4af37 0%, transparent 70%)' }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-16 h-60 w-60 rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(circle, #d4af37 0%, transparent 70%)' }}
            aria-hidden="true"
          />

          <div className="relative grid grid-cols-2 gap-6 md:grid-cols-4">
            <Stat
              icon={<GitBranch className="h-4 w-4" />}
              label={t('totalReleases')}
              value={formatNumber(result.releases.length)}
            />
            <Stat
              icon={<Tag className="h-4 w-4" />}
              label={t('latestVersion')}
              value={latestStable?.tagName ?? '—'}
              mono
            />
            <Stat
              icon={<Calendar className="h-4 w-4" />}
              label={t('lastPublished')}
              value={latestStable ? dateRange(latestStable.publishedAt) : '—'}
            />
            <Stat
              icon={<Download className="h-4 w-4" />}
              label={t('downloads')}
              value={formatNumber(totalDownloads)}
            />
          </div>

          <div className="relative mt-6 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
            <div>
              <h2
                id="changelog-stats"
                className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase"
              >
                {t('statsTitle')}
              </h2>
              <p className="mt-1 text-sm text-white/70">
                {t('activeChannel')}:{' '}
                <span className="text-white">
                  {latestStable?.isPrerelease ? t('preRelease') : t('stable')}
                </span>
              </p>
            </div>
            <a
              href={`${result.repo.url}/releases`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-widest uppercase shadow-lg transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            >
              <GitBranch className="h-4 w-4" />
              {t('viewAllReleases')}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </motion.section>
      )}

      {/* Rate-limit notice */}
      {result.status === 'rate-limited' && result.releases.length > 0 && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border border-amber-300/40 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">{t('rateLimitTitle')}</p>
            <p className="opacity-90">{t('rateLimitDesc')}</p>
          </div>
        </div>
      )}

      {/* Controls (only show when there's data) */}
      {result.releases.length > 0 && (
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-sm">
            <label htmlFor="changelog-search" className="sr-only">
              {t('searchPlaceholder')}
            </label>
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="changelog-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="text-brand-navy focus:border-brand-gold focus:ring-brand-gold/20 w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-9 pl-10 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:ring-2 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={t('clearSearch')}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div
            className="flex flex-wrap items-center gap-2"
            role="tablist"
            aria-label="Filter releases"
          >
            <FilterPill
              active={filter === 'all'}
              label={t('filterAll')}
              count={result.releases.length}
              onClick={() => setFilter('all')}
            />
            <FilterPill
              active={filter === 'stable'}
              label={t('filterStable')}
              count={stableCount}
              onClick={() => setFilter('stable')}
            />
            <FilterPill
              active={filter === 'prerelease'}
              label={t('filterPrerelease')}
              count={prereleaseCount}
              onClick={() => setFilter('prerelease')}
            />
          </div>
        </div>
      )}

      {/* Empty results from filters */}
      {result.releases.length > 0 && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-800">
          <Search className="mx-auto mb-4 h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('noResults')}</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setFilter('all');
            }}
            className="text-brand-gold hover:text-brand-gold-dark mt-3 inline-flex items-center gap-1 text-xs font-semibold tracking-wider uppercase"
          >
            {t('clearSearch')}
          </button>
        </div>
      )}

      {/* Releases timeline */}
      {filtered.length > 0 && (
        <ol className="relative space-y-10" aria-label="Release timeline">
          {/* Vertical gold rail */}
          <div
            className="from-brand-gold/60 via-brand-gold/20 absolute top-2 bottom-2 left-[15px] hidden w-px bg-gradient-to-b to-transparent sm:block"
            aria-hidden="true"
          />
          {filtered.map((release, idx) => (
            <ReleaseItem
              key={release.id}
              release={release}
              isFirst={idx === 0}
              t={{
                latest: t('latest'),
                preRelease: t('preRelease'),
                draft: t('draft'),
                viewOnGithub: t('viewOnGithub'),
                publishedOn: t('publishedOn'),
                content: t('content'),
                assets: t('assets'),
                size: t('size'),
                formatDownloadCount: (count: string) => t('downloadCount', { count }),
                openAsset: t('openAsset'),
              }}
            />
          ))}
        </ol>
      )}

      {/* Error state */}
      {result.status === 'error' && result.releases.length === 0 && (
        <ErrorState
          title={t('errorTitle')}
          description={t('errorDesc')}
          retryLabel={t('retry')}
          githubLabel={t('openGithub')}
          onRetry={handleRetry}
          isRetrying={isPending}
          repoUrl={result.repo.url}
        />
      )}

      {/* Empty state */}
      {result.status === 'empty' && (
        <EmptyState
          title={t('emptyTitle')}
          description={t('emptyDesc')}
          githubLabel={t('viewAllReleases')}
          repoUrl={result.repo.url}
        />
      )}

      {/* Subscribe card */}
      {result.releases.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="border-brand-gold/30 from-brand-bg relative overflow-hidden rounded-2xl border bg-gradient-to-br to-white p-6 md:p-8 dark:from-gray-800 dark:to-gray-900"
        >
          <div
            className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full opacity-15 blur-3xl"
            style={{ background: 'radial-gradient(circle, #d4af37 0%, transparent 70%)' }}
            aria-hidden="true"
          />
          <div className="relative flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-brand-gold/10 text-brand-gold flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-brand-navy font-serif text-lg font-semibold dark:text-gray-100">
                  {t('subscribeTitle')}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {t('subscribeDesc')}
                </p>
              </div>
            </div>
            <a
              href={`${result.repo.url}/watchers`}
              target="_blank"
              rel="noopener noreferrer"
              className="border-brand-navy text-brand-navy hover:border-brand-gold hover:text-brand-gold inline-flex items-center gap-2 border px-6 py-3 text-xs font-bold tracking-widest uppercase transition-all dark:border-gray-500 dark:text-gray-200"
            >
              <GitBranch className="h-4 w-4" />
              {t('subscribeCta')}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </motion.section>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="relative">
      <div className="text-brand-gold mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.18em] uppercase">
        {icon}
        {label}
      </div>
      <div
        className={`text-2xl leading-tight font-semibold md:text-3xl ${mono ? 'font-mono tracking-tight' : 'font-serif'}`}
      >
        {value}
      </div>
    </div>
  );
}

function FilterPill({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold tracking-wider uppercase transition-all ${
        active
          ? 'border-brand-gold bg-brand-gold text-brand-navy shadow-sm'
          : 'hover:border-brand-gold/40 hover:text-brand-gold border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 text-[10px] font-bold ${active ? 'bg-brand-navy/20 text-brand-navy' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'}`}
      >
        {count}
      </span>
    </button>
  );
}

function ReleaseItem({
  release,
  isFirst,
  t,
}: {
  release: ChangelogRelease;
  isFirst: boolean;
  t: {
    latest: string;
    preRelease: string;
    draft: string;
    viewOnGithub: string;
    publishedOn: string;
    content: string;
    assets: string;
    size: string;
    formatDownloadCount: (count: string) => string;
    openAsset: string;
  };
}) {
  const [expanded, setExpanded] = useState(isFirst);

  return (
    <li className="relative pl-0 sm:pl-12">
      {/* Timeline dot */}
      <span
        className={`absolute top-2 left-[7px] hidden h-[18px] w-[18px] items-center justify-center rounded-full border-2 sm:flex ${
          release.isLatest
            ? 'border-brand-gold bg-brand-gold/10'
            : release.isPrerelease
              ? 'border-amber-400 bg-amber-50 dark:bg-amber-500/10'
              : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
        }`}
        aria-hidden="true"
      >
        {release.isLatest && <span className="bg-brand-gold h-2 w-2 rounded-full" />}
      </span>

      <motion.article
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md dark:bg-gray-800 ${
          release.isLatest
            ? 'border-brand-gold/40 ring-brand-gold/10 ring-1'
            : 'border-gray-200 dark:border-gray-700'
        }`}
      >
        {/* Header */}
        <header className="flex flex-col gap-4 px-5 pt-5 sm:flex-row sm:items-start sm:justify-between sm:px-7 sm:pt-6">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {release.isLatest && (
                <span className="bg-brand-gold text-brand-navy inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                  <Sparkles className="h-3 w-3" /> {t.latest}
                </span>
              )}
              {release.isPrerelease && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-amber-700 uppercase dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                  {t.preRelease}
                </span>
              )}
              {release.isDraft && (
                <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-gray-600 uppercase dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {t.draft}
                </span>
              )}
            </div>
            <h3 className="text-brand-navy font-serif text-xl leading-tight sm:text-2xl dark:text-gray-100">
              {release.name}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span className="bg-brand-bg/60 inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono dark:bg-gray-700/60">
                <Tag className="h-3 w-3" />
                {release.tagName}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                {t.publishedOn} {release.publishedAtLabel}
              </span>
              {release.author.avatarUrl && (
                <a
                  href={release.author.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-gold inline-flex items-center gap-1.5 transition-colors"
                >
                  <img
                    src={release.author.avatarUrl}
                    alt=""
                    width={16}
                    height={16}
                    className="h-4 w-4 rounded-full"
                    loading="lazy"
                  />
                  @{release.author.login}
                </a>
              )}
              {release.totalDownloads > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Download className="h-3 w-3" />
                  {formatNumber(release.totalDownloads)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:flex-col sm:items-end">
            <a
              href={release.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border-brand-navy/20 text-brand-navy hover:border-brand-gold hover:text-brand-gold inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase transition-colors dark:border-gray-600 dark:text-gray-200"
            >
              <GitBranch className="h-3.5 w-3.5" />
              {t.viewOnGithub}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </header>

        {/* Expand / collapse body */}
        <div className="px-5 pt-4 pb-1 sm:px-7">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls={`release-body-${release.id}`}
            className="text-brand-navy hover:text-brand-gold group inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase transition-colors dark:text-gray-300"
          >
            {t.content}
            <span
              className={`transition-transform duration-300 ${expanded ? 'rotate-180' : 'rotate-0'}`}
            >
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                <path
                  d="M1 1L5 5L9 1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              id={`release-body-${release.id}`}
              key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="border-t border-gray-200 px-5 pt-4 pb-5 sm:px-7 sm:pt-5 sm:pb-6 dark:border-gray-700">
                <ReleaseMarkdown source={release.bodyMarkdown} />

                {release.assets.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-brand-navy mb-3 flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase dark:text-gray-200">
                      <Package className="h-3.5 w-3.5" />
                      {t.assets} ({release.assets.length})
                    </h4>
                    <ul className="space-y-2">
                      {release.assets.map((asset) => (
                        <li
                          key={asset.id}
                          className="border-brand-gold/20 bg-brand-bg/40 flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800/60"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <Package className="text-brand-gold h-4 w-4 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-brand-navy truncate font-medium dark:text-gray-100">
                                {asset.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {t.size}: {formatBytes(asset.size)} ·{' '}
                                {t.formatDownloadCount(formatNumber(asset.downloadCount))}
                              </p>
                            </div>
                          </div>
                          <a
                            href={asset.browserDownloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-navy hover:text-brand-gold inline-flex shrink-0 items-center gap-1 text-xs font-semibold tracking-wider uppercase"
                          >
                            {t.openAsset}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>
    </li>
  );
}

function ErrorState({
  title,
  description,
  retryLabel,
  githubLabel,
  onRetry,
  isRetrying,
  repoUrl,
}: {
  title: string;
  description: string;
  retryLabel: string;
  githubLabel: string;
  onRetry: () => void;
  isRetrying: boolean;
  repoUrl: string;
}) {
  return (
    <div className="border-brand-gold/30 from-brand-bg relative overflow-hidden rounded-2xl border bg-gradient-to-br to-white p-8 text-center md:p-12 dark:from-gray-800 dark:to-gray-900">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(239,68,68,0.04) 0%, transparent 65%)',
        }}
        aria-hidden="true"
      />
      <div className="relative">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10">
          <AlertCircle className="h-6 w-6 text-red-500" />
        </div>
        <h3 className="text-brand-navy mb-2 font-serif text-xl dark:text-gray-100">{title}</h3>
        <p className="mx-auto mb-6 max-w-md text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-widest uppercase shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              className={isRetrying ? 'animate-spin' : ''}
              aria-hidden="true"
            >
              <path
                d="M21 12a9 9 0 11-3.34-7.02M21 4v6h-6"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {isRetrying ? '…' : retryLabel}
          </button>
          <a
            href={`${repoUrl}/releases`}
            target="_blank"
            rel="noopener noreferrer"
            className="border-brand-navy text-brand-navy hover:border-brand-gold hover:text-brand-gold inline-flex items-center gap-2 border px-5 py-2.5 text-xs font-bold tracking-widest uppercase transition-all dark:border-gray-500 dark:text-gray-300"
          >
            <GitBranch className="h-3.5 w-3.5" />
            {githubLabel}
          </a>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
  githubLabel,
  repoUrl,
}: {
  title: string;
  description: string;
  githubLabel: string;
  repoUrl: string;
}) {
  return (
    <div className="border-brand-gold/30 from-brand-bg relative overflow-hidden rounded-2xl border bg-gradient-to-br to-white p-8 text-center md:p-12 dark:from-gray-800 dark:to-gray-900">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,175,55,0.05) 0%, transparent 65%)',
        }}
        aria-hidden="true"
      />
      <div className="relative">
        <div className="bg-brand-gold/10 text-brand-gold mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full">
          <Package className="h-6 w-6" />
        </div>
        <h3 className="text-brand-navy mb-2 font-serif text-xl dark:text-gray-100">{title}</h3>
        <p className="mx-auto mb-6 max-w-md text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
        <a
          href={`${repoUrl}/releases`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-widest uppercase shadow-md transition-all"
        >
          <GitBranch className="h-3.5 w-3.5" />
          {githubLabel}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
