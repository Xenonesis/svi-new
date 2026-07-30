/**
 * Server-side GitHub releases fetcher for the SVI Infra Solutions changelog page.
 *
 * - Reads repo coordinates from `GITHUB_REPO` (defaults to a sensible fallback).
 * - Uses a server-only `GITHUB_TOKEN` (PAT) when available to lift the rate limit
 *   from 60/hr (anonymous) to 5,000/hr (authenticated).
 * - Caches results for 10 minutes via Next.js Data Cache to keep us well under
 *   the limit even on cold starts.
 * - Returns a strongly-typed result so the page can render a graceful empty /
 *   error / rate-limited state without throwing.
 */
import 'server-only';

const GITHUB_API = 'https://api.github.com';

export interface ReleaseAuthor {
  login: string;
  avatarUrl: string;
  htmlUrl: string;
}

export interface ReleaseAsset {
  id: number;
  name: string;
  label: string | null;
  contentType: string;
  size: number;
  downloadCount: number;
  browserDownloadUrl: string;
  updatedAt: string;
}

export interface ChangelogRelease {
  id: number;
  tagName: string;
  name: string;
  htmlUrl: string;
  /** Markdown source — render with a sanitized component, never dangerouslySetInnerHTML. */
  bodyMarkdown: string;
  publishedAt: string;
  publishedAtLabel: string; // pre-formatted for SSR
  isPrerelease: boolean;
  isDraft: boolean;
  isLatest: boolean;
  author: ReleaseAuthor;
  assets: ReleaseAsset[];
  totalDownloads: number;
}

export interface ChangelogResult {
  releases: ChangelogRelease[];
  repo: { owner: string; repo: string; url: string };
  /** Status of the underlying fetch — drives UI messaging. */
  status: 'ok' | 'rate-limited' | 'empty' | 'error';
  statusMessage?: string;
  rateLimit?: {
    remaining: number;
    limit: number;
    resetAt: string;
  };
  fetchedAt: string;
}

interface GithubReleaseDto {
  id: number;
  tag_name: string;
  name: string | null;
  html_url: string;
  body: string | null;
  published_at: string | null;
  prerelease: boolean;
  draft: boolean;
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;
  assets: Array<{
    id: number;
    name: string;
    label: string | null;
    content_type: string;
    size: number;
    download_count: number;
    browser_download_url: string;
    updated_at: string;
  }>;
}

function getRepoCoordinates(): { owner: string; repo: string; url: string } {
  const raw = process.env.GITHUB_REPO?.trim() || 'sviinfrasolutions/svi-website';
  const [owner, repo] = raw.split('/');
  if (!owner || !repo) {
    return {
      owner: 'sviinfrasolutions',
      repo: 'svi-website',
      url: 'https://github.com/sviinfrasolutions/svi-website',
    };
  }
  return { owner, repo, url: `https://github.com/${owner}/${repo}` };
}

function formatPublishedAt(iso: string | null): string {
  if (!iso) return 'Unpublished';
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(iso));
  } catch {
    return 'Unpublished';
  }
}

function mapRelease(dto: GithubReleaseDto, isLatest: boolean): ChangelogRelease {
  const totalDownloads = dto.assets.reduce((sum, a) => sum + (a.download_count ?? 0), 0);
  return {
    id: dto.id,
    tagName: dto.tag_name,
    name: dto.name || dto.tag_name,
    htmlUrl: dto.html_url,
    bodyMarkdown: dto.body ?? '',
    publishedAt: dto.published_at ?? new Date(0).toISOString(),
    publishedAtLabel: formatPublishedAt(dto.published_at),
    isPrerelease: !!dto.prerelease,
    isDraft: !!dto.draft,
    isLatest,
    author: {
      login: dto.author?.login ?? 'unknown',
      avatarUrl: dto.author?.avatar_url ?? '',
      htmlUrl: dto.author?.html_url ?? 'https://github.com',
    },
    assets: dto.assets.map((a) => ({
      id: a.id,
      name: a.name,
      label: a.label,
      contentType: a.content_type,
      size: a.size,
      downloadCount: a.download_count ?? 0,
      browserDownloadUrl: a.browser_download_url,
      updatedAt: a.updated_at,
    })),
    totalDownloads,
  };
}

/**
 * Fetch all public releases for the configured repository. Cached for 10 minutes
 * per request signature. Falls back gracefully on rate-limit / network errors.
 */
export async function fetchChangelog(options?: { perPage?: number }): Promise<ChangelogResult> {
  const repo = getRepoCoordinates();
  const perPage = Math.min(Math.max(options?.perPage ?? 30, 1), 100);
  const url = `${GITHUB_API}/repos/${repo.owner}/${repo.repo}/releases?per_page=${perPage}`;

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'svi-infra-changelog',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const fetchedAt = new Date().toISOString();

  try {
    const response = await fetch(url, {
      headers,
      // Cache the response in the Next.js data cache + revalidate every 10 min
      next: { revalidate: 600, tags: [`changelog:${repo.owner}/${repo.repo}`] },
      signal: AbortSignal.timeout(15_000),
    });

    const remaining = Number(response.headers.get('x-ratelimit-remaining') ?? '0');
    const limit = Number(response.headers.get('x-ratelimit-limit') ?? '60');
    const resetEpoch = Number(response.headers.get('x-ratelimit-reset') ?? '0');

    if (response.status === 403 && remaining === 0) {
      return {
        releases: [],
        repo,
        status: 'rate-limited',
        statusMessage: 'GitHub API rate limit reached. Showing the most recent cached releases.',
        rateLimit: {
          remaining: 0,
          limit,
          resetAt: resetEpoch
            ? new Date(resetEpoch * 1000).toISOString()
            : new Date().toISOString(),
        },
        fetchedAt,
      };
    }

    if (response.status === 404) {
      return {
        releases: [],
        repo,
        status: 'empty',
        statusMessage:
          'The configured GitHub repository was not found. Releases will appear once it is published.',
        fetchedAt,
      };
    }

    if (!response.ok) {
      return {
        releases: [],
        repo,
        status: 'error',
        statusMessage: `GitHub responded with ${response.status} ${response.statusText}.`,
        fetchedAt,
      };
    }

    const data = (await response.json()) as GithubReleaseDto[];

    if (!Array.isArray(data) || data.length === 0) {
      return {
        releases: [],
        repo,
        status: 'empty',
        statusMessage: 'No releases have been published on GitHub yet.',
        fetchedAt,
      };
    }

    const releases = data.map((dto, i) =>
      mapRelease(dto, i === 0 && !dto.draft && !dto.prerelease)
    );

    return {
      releases,
      repo,
      status: 'ok',
      rateLimit: {
        remaining,
        limit,
        resetAt: resetEpoch ? new Date(resetEpoch * 1000).toISOString() : new Date().toISOString(),
      },
      fetchedAt,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      releases: [],
      repo,
      status: 'error',
      statusMessage: `Unable to reach GitHub: ${message}`,
      fetchedAt,
    };
  }
}
