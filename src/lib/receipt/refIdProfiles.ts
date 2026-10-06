export interface RefIdProfile {
  refId: string;
  name: string;
  salutation: string;
  clientPhone: string;
  plotNo: string;
  plotSize: string;
  account: string;
  source: 'receipt' | 'candidate';
  date?: string;
}

export interface ReceiptSourceLike {
  id?: string;
  date?: string | null;
  created_at?: string | null;
  form_data?: {
    receiptNo?: string | number | null;
    refId?: string | number | null;
    ref_id?: string | number | null;
    name?: string | null;
    salutation?: string | null;
    clientPhone?: string | null;
    phone?: string | null;
    plotNo?: string | null;
    unitNo?: string | null;
    plotSize?: string | number | null;
    area?: string | number | null;
    account?: string | null;
    projectName?: string | null;
    date?: string | null;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
}

export interface CandidateSourceLike {
  ticketId?: string | null;
  normalizedId?: string | null;
  clientName?: string | null;
  phone?: string | null;
  unitNo?: string | null;
  area?: string | number | null;
  projectName?: string | null;
  bookingDate?: string | null;
  salutation?: string | null;
  [key: string]: unknown;
}

/**
 * Normalizes a reference ID by trimming, converting to uppercase,
 * and stripping non-alphanumeric characters for robust deduplication.
 */
export function normalizeRefId(raw?: string | null): string {
  if (!raw) return '';
  return String(raw)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

export function extractRefIdNumber(refId?: string | null): number {
  if (!refId) return 0;
  const match = String(refId).match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

export type RefIdSourceFilter = 'all' | 'receipt' | 'candidate';

export type RefIdSortOption =
  'none' | 'refId-desc' | 'refId-asc' | 'name-asc' | 'name-desc' | 'date-desc';

export function compareProfilesBySortOption(
  a: RefIdProfile,
  b: RefIdProfile,
  sortOption: RefIdSortOption = 'refId-desc'
): number {
  switch (sortOption) {
    case 'refId-desc': {
      const numA = extractRefIdNumber(a.refId);
      const numB = extractRefIdNumber(b.refId);
      if (numA !== numB) return numB - numA;
      return (b.refId || '').localeCompare(a.refId || '');
    }
    case 'refId-asc': {
      const numA = extractRefIdNumber(a.refId);
      const numB = extractRefIdNumber(b.refId);
      if (numA !== numB) return numA - numB;
      return (a.refId || '').localeCompare(b.refId || '');
    }
    case 'name-asc': {
      const cmp = (a.name || '').localeCompare(b.name || '', undefined, {
        sensitivity: 'base',
      });
      if (cmp !== 0) return cmp;
      return extractRefIdNumber(b.refId) - extractRefIdNumber(a.refId);
    }
    case 'name-desc': {
      const cmp = (b.name || '').localeCompare(a.name || '', undefined, {
        sensitivity: 'base',
      });
      if (cmp !== 0) return cmp;
      return extractRefIdNumber(b.refId) - extractRefIdNumber(a.refId);
    }
    case 'date-desc': {
      const scoreA = parseDateScore(a.date);
      const scoreB = parseDateScore(b.date);
      if (scoreA !== scoreB) return scoreB - scoreA;
      return extractRefIdNumber(b.refId) - extractRefIdNumber(a.refId);
    }
    default:
      return 0;
  }
}

function parseDateScore(dateStr?: string | null): number {
  if (!dateStr) return 0;
  const t = new Date(dateStr).getTime();
  return isNaN(t) ? 0 : t;
}
/**
 * Builds a unified list of RefIdProfile entries from receipts and allotment candidates.
 *
 * Rules:
 * - Deduplicates profiles by normalized alphanumeric Ref ID.
 * - Preserves original clean display refId.
 * - When both receipts and candidates share the same normalized Ref ID,
 *   the receipt record takes precedence (finalized salutation & verified details).
 * - When multiple records exist for the same source, the latest record by date takes precedence.
 */
export function buildRefIdProfiles(
  receipts?: ReceiptSourceLike[] | null,
  candidates?: CandidateSourceLike[] | null
): RefIdProfile[] {
  const profileMap = new Map<
    string,
    {
      profile: RefIdProfile;
      score: number;
      isReceipt: boolean;
    }
  >();

  // 1. Process allotment candidates
  if (Array.isArray(candidates)) {
    for (const c of candidates) {
      if (!c) continue;
      const rawRefId = c.ticketId ?? c.normalizedId ?? '';
      const displayRefId = String(rawRefId).trim();
      const normId = normalizeRefId(displayRefId);
      if (!normId) continue;

      const dateStr = c.bookingDate ? String(c.bookingDate).trim() : undefined;
      const score = parseDateScore(dateStr);

      const existing = profileMap.get(normId);
      if (!existing || (!existing.isReceipt && score > existing.score)) {
        profileMap.set(normId, {
          profile: {
            refId: displayRefId,
            name: String(c.clientName || '').trim(),
            salutation: String(c.salutation || '').trim(),
            clientPhone: String(c.phone || '').trim(),
            plotNo: String(c.unitNo || '').trim(),
            plotSize: c.area !== undefined && c.area !== null ? String(c.area).trim() : '',
            account: String(c.projectName || '').trim(),
            source: 'candidate',
            ...(dateStr ? { date: dateStr } : {}),
          },
          score,
          isReceipt: false,
        });
      }
    }
  }

  // 2. Process receipts (receipt records take precedence over candidates)
  if (Array.isArray(receipts)) {
    for (const r of receipts) {
      if (!r) continue;
      const fd = r.form_data;
      if (!fd) continue;
      const rawRefId = fd.refId ?? fd.ref_id;
      if (rawRefId === undefined || rawRefId === null) continue;
      const displayRefId = String(rawRefId).trim();
      const normId = normalizeRefId(displayRefId);
      if (!normId) continue;

      const rawDate = fd.date ?? r.date ?? r.created_at;
      const dateStr = rawDate ? String(rawDate).trim() : undefined;
      const score = parseDateScore(dateStr);

      const existing = profileMap.get(normId);
      if (!existing || !existing.isReceipt || score > existing.score) {
        profileMap.set(normId, {
          profile: {
            refId: displayRefId,
            name: String(fd.name || '').trim(),
            salutation: String(fd.salutation || '').trim(),
            clientPhone: String(fd.clientPhone || fd.phone || '').trim(),
            plotNo: String(fd.plotNo || fd.unitNo || '').trim(),
            plotSize:
              fd.plotSize !== undefined && fd.plotSize !== null
                ? String(fd.plotSize).trim()
                : fd.area !== undefined && fd.area !== null
                  ? String(fd.area).trim()
                  : '',
            account: String(fd.account || fd.projectName || '').trim(),
            source: 'receipt',
            ...(dateStr ? { date: dateStr } : {}),
          },
          score,
          isReceipt: true,
        });
      }
    }
  }

  const profiles = Array.from(profileMap.values()).map((entry) => entry.profile);
  // Sort newest Ref IDs first by default
  return profiles.sort((a, b) => compareProfilesBySortOption(a, b, 'refId-desc'));
}

export interface FilterAndSortProfilesOptions {
  query?: string | null;
  sourceFilter?: RefIdSourceFilter;
  sortOption?: RefIdSortOption;
  limit?: number;
}

/**
 * Filters profiles by source and search query, then sorts according to the requested sort option.
 */
export function filterAndSortRefIdProfiles(
  profiles: RefIdProfile[],
  options: FilterAndSortProfilesOptions = {}
): RefIdProfile[] {
  if (!profiles || !Array.isArray(profiles) || profiles.length === 0) {
    return [];
  }

  const { query, sourceFilter = 'all', sortOption = 'refId-desc', limit = 30 } = options;

  if (limit <= 0) return [];

  // 1. Filter by source
  let filtered = profiles;
  if (sourceFilter === 'receipt') {
    filtered = profiles.filter((p) => p.source === 'receipt');
  } else if (sourceFilter === 'candidate') {
    filtered = profiles.filter((p) => p.source === 'candidate');
  }

  const rawTrimmed = (query || '').trim();
  if (!rawTrimmed) {
    if (sortOption === 'none') {
      return filtered.slice(0, limit);
    }
    const sorted = [...filtered].sort((a, b) => compareProfilesBySortOption(a, b, sortOption));
    return sorted.slice(0, limit);
  }

  const q = rawTrimmed.toLowerCase();
  const qNorm = normalizeRefId(rawTrimmed);

  interface ScoredProfile {
    profile: RefIdProfile;
    rank: number;
    index: number;
  }

  const scored: ScoredProfile[] = [];

  for (let i = 0; i < filtered.length; i++) {
    const p = filtered[i];
    const refLower = (p.refId || '').toLowerCase();
    const nameLower = (p.name || '').toLowerCase();
    const phoneLower = (p.clientPhone || '').toLowerCase();
    const plotLower = (p.plotNo || '').toLowerCase();
    const accountLower = (p.account || '').toLowerCase();
    const refNorm = normalizeRefId(p.refId);

    const isExactRef = refLower === q || (qNorm.length > 0 && refNorm === qNorm);
    const isPrefixRef = refLower.startsWith(q) || (qNorm.length > 0 && refNorm.startsWith(qNorm));
    const isSubRef = refLower.includes(q) || (qNorm.length > 0 && refNorm.includes(qNorm));

    const isPrefixName = nameLower.startsWith(q);
    const isSubName = nameLower.includes(q);

    const isPhoneMatch = phoneLower.includes(q);
    const isPlotMatch = plotLower.includes(q);
    const isAccountMatch = accountLower.includes(q);

    if (!isSubRef && !isSubName && !isPhoneMatch && !isPlotMatch && !isAccountMatch) {
      continue;
    }

    let rank = 10;
    if (isExactRef) {
      rank = 0;
    } else if (isPrefixRef) {
      rank = 1;
    } else if (isSubRef) {
      rank = 2;
    } else if (isPrefixName) {
      rank = 3;
    } else if (isSubName) {
      rank = 4;
    } else if (isPhoneMatch) {
      rank = 5;
    } else if (isPlotMatch) {
      rank = 6;
    } else if (isAccountMatch) {
      rank = 7;
    }

    scored.push({ profile: p, rank, index: i });
  }

  scored.sort((a, b) => {
    if (a.rank !== b.rank) {
      return a.rank - b.rank;
    }
    if (sortOption === 'none') {
      return a.index - b.index;
    }
    return compareProfilesBySortOption(a.profile, b.profile, sortOption);
  });

  return scored.slice(0, limit).map((s) => s.profile);
}

/**
 * Searches across profiles case-insensitively by refId, name, and clientPhone.
 * Exact refId prefix matches are ranked higher than general substring matches.
 */
export function searchRefIdProfiles(
  profiles: RefIdProfile[],
  query?: string | null,
  limit: number = 10
): RefIdProfile[] {
  if (!profiles || !Array.isArray(profiles) || profiles.length === 0 || limit <= 0) {
    return [];
  }

  const rawTrimmed = (query || '').trim();
  if (!rawTrimmed) {
    return profiles.slice(0, limit);
  }

  return filterAndSortRefIdProfiles(profiles, {
    query,
    sourceFilter: 'all',
    sortOption: 'none',
    limit,
  });
}
