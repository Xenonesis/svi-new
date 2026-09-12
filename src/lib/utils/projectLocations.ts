/**
 * Project location metadata and dynamic resolver for documents (BBA, Allotment Letter, etc.)
 * Dynamically resolves locations saved via "/admin/properties" with ZERO generic fallback
 * for unknown or unconfigured projects.
 */

export interface ProjectLocationDetail {
  legalLocationHi: string;
  legalLocationEn: string;
  shortLocationHi: string;
  shortLocationEn: string;
  coverLocationHi: string;
  coverLocationEn: string;
  cityHi: string;
  cityEn: string;
}

const STATIC_PROJECT_LOCATIONS: Record<string, ProjectLocationDetail> = {
  'shivani-vatika-11th': {
    legalLocationHi: 'ग्राम हरसोली, तहसील रेनवाल, जिला जयपुर, राज्य – राजस्थान',
    legalLocationEn: 'Village Harsoli, Tehsil Renwal, District Jaipur, State – Rajasthan',
    shortLocationHi: 'हरसोली, तहसील रेनवाल, जिला जयपुर, राजस्थान',
    shortLocationEn: 'HARSOLI, TEHSIL RENWAL, DISTRICT JAIPUR, RAJASTHAN',
    coverLocationHi: '(ग्राम हरसोली, तहसील रेनवाल, जिला जयपुर, राजस्थान)',
    coverLocationEn: '(Village Harsoli, Tehsil Renwal, District Jaipur, Rajasthan)',
    cityHi: 'जयपुर, राजस्थान',
    cityEn: 'JAIPUR, RAJASTHAN',
  },
  'shivani-vatika': {
    legalLocationHi: 'ग्राम मानपुरा माचेड़ी, तहसील आमेर, जिला जयपुर, राज्य – राजस्थान',
    legalLocationEn: 'Village Manpura Machedi, Tehsil Amer, District Jaipur, State – Rajasthan',
    shortLocationHi: 'मानपुरा माचेड़ी, तहसील आमेर, जिला जयपुर, राजस्थान',
    shortLocationEn: 'MANPURA MACHEDI, TEHSIL AMER, DISTRICT JAIPUR, RAJASTHAN',
    coverLocationHi: '(ग्राम मानपुरा माचेड़ी, तहसील आमेर, जिला जयपुर, राजस्थान)',
    coverLocationEn: '(Village Manpura Machedi, Tehsil Amer, District Jaipur, Rajasthan)',
    cityHi: 'जयपुर, राजस्थान',
    cityEn: 'JAIPUR, RAJASTHAN',
  },
  'shyam-aangan': {
    legalLocationHi: 'ग्राम बसादी, तहसील किशनगढ़ रेनवाल, जिला जयपुर, राज्य – राजस्थान',
    legalLocationEn: 'Village Basadi, Tehsil Kishan Garh Renwal, Dist. Jaipur, State – Rajasthan',
    shortLocationHi: 'बसादी, किशनगढ़ रेनवाल, जिला जयपुर, राजस्थान',
    shortLocationEn: 'BASADI, KISHAN GARH RENWAL, JAIPUR, RAJASTHAN',
    coverLocationHi: '(ग्राम बसादी, तहसील किशनगढ़ रेनवाल, जिला जयपुर, राजस्थान)',
    coverLocationEn: '(Village Basadi, Tehsil Kishangarh Renwal, District Jaipur, Rajasthan)',
    cityHi: 'जयपुर, राजस्थान',
    cityEn: 'JAIPUR, RAJASTHAN',
  },
};

// Dynamic storage for properties loaded from database (/admin/properties)
const DYNAMIC_PROJECT_MAP = new Map<string, ProjectLocationDetail>();

/**
 * Register dynamic property locations retrieved from Supabase properties table.
 */
export function registerDynamicProjectLocations(
  properties: Array<{ name: string; slug?: string | null; location?: string | null }>
) {
  if (!properties || !Array.isArray(properties)) return;

  for (const p of properties) {
    if (!p.name) continue;

    let legalHi = '';
    let legalEn = '';

    if (p.location) {
      try {
        const parsed = JSON.parse(p.location);
        legalHi = parsed.legalHi || parsed.legal_location_hi || '';
        legalEn = parsed.legalEn || parsed.legal_location_en || '';
      } catch {
        legalHi = p.location;
        legalEn = p.location;
      }
    }

    if (legalHi || legalEn) {
      const detail: ProjectLocationDetail = {
        legalLocationHi: legalHi,
        legalLocationEn: legalEn,
        shortLocationHi: legalHi
          .replace(/^ग्राम\s*/i, '')
          .replace(/,\s*राज्य\s*–\s*राजस्थान/i, ', राजस्थान'),
        shortLocationEn: legalEn
          .replace(/^Village\s*/i, '')
          .replace(/,\s*State\s*–\s*Rajasthan/i, ', Rajasthan')
          .toUpperCase(),
        coverLocationHi: legalHi ? `(${legalHi})` : '',
        coverLocationEn: legalEn ? `(${legalEn})` : '',
        cityHi: 'जयपुर, राजस्थान',
        cityEn: 'JAIPUR, RAJASTHAN',
      };

      DYNAMIC_PROJECT_MAP.set(p.name.toLowerCase().trim(), detail);
      if (p.slug) {
        DYNAMIC_PROJECT_MAP.set(p.slug.toLowerCase().trim(), detail);
      }
    }
  }
}

/**
 * Resolve project location metadata by matching project name or slug.
 * Returns null if no location is registered or configured (NO FALLBACK for unknown projects).
 */
export function getProjectLocationDetail(projectName?: string): ProjectLocationDetail | null {
  const norm = (projectName || '').toLowerCase().trim();
  if (!norm) return null;

  // 1. Check dynamic database-loaded map first
  if (DYNAMIC_PROJECT_MAP.has(norm)) {
    return DYNAMIC_PROJECT_MAP.get(norm)!;
  }

  // 2. Check static known defaults for existing core projects
  if (norm.includes('11') || norm.includes('11th')) {
    return STATIC_PROJECT_LOCATIONS['shivani-vatika-11th'];
  }
  if (norm.includes('shivani vatika') || norm.includes('shivani-vatika')) {
    return STATIC_PROJECT_LOCATIONS['shivani-vatika'];
  }
  if (norm.includes('shyam aangan') || norm.includes('shyam-aangan')) {
    return STATIC_PROJECT_LOCATIONS['shyam-aangan'];
  }

  // 3. ZERO FALLBACK: return null for any other/new project
  return null;
}

/**
 * Full legal location clause for recitals and operative clauses.
 * Returns empty string if no location is configured.
 */
export function getProjectLegalLocation(projectName?: string, lang: 'hi' | 'en' = 'hi'): string {
  const detail = getProjectLocationDetail(projectName);
  if (!detail) return '';
  return lang === 'hi' ? detail.legalLocationHi : detail.legalLocationEn;
}

/**
 * Short location name for definitions section.
 * Returns empty string if no location is configured.
 */
export function getProjectShortLocation(projectName?: string, lang: 'hi' | 'en' = 'hi'): string {
  const detail = getProjectLocationDetail(projectName);
  if (!detail) return '';
  return lang === 'hi' ? detail.shortLocationHi : detail.shortLocationEn;
}

/**
 * Parenthesized location for cover pages and header banners.
 * Returns empty string if no location is configured.
 */
export function getProjectCoverLocation(projectName?: string, lang: 'hi' | 'en' = 'hi'): string {
  const detail = getProjectLocationDetail(projectName);
  if (!detail) return '';
  return lang === 'hi' ? detail.coverLocationHi : detail.coverLocationEn;
}

/**
 * Project city and state string.
 * Returns empty string if no project detail is found.
 */
export function getProjectCity(projectName?: string, lang: 'hi' | 'en' = 'hi'): string {
  const detail = getProjectLocationDetail(projectName);
  if (!detail) return '';
  return lang === 'hi' ? detail.cityHi : detail.cityEn;
}
