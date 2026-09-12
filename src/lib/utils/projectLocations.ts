/**
 * Project location metadata and resolver for documents (BBA, Allotment Letter, etc.)
 * Ensures each project gets its exact legal, cover, and short location strings in Hindi & English,
 * avoiding accidental fallbacks to other projects' villages.
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

const PROJECT_LOCATION_MAP: Record<string, ProjectLocationDetail> = {
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
  'generic-fallback': {
    legalLocationHi: 'जिला जयपुर, राज्य – राजस्थान',
    legalLocationEn: 'District Jaipur, State – Rajasthan',
    shortLocationHi: 'जिला जयपुर, राजस्थान',
    shortLocationEn: 'DISTRICT JAIPUR, RAJASTHAN',
    coverLocationHi: '(जयपुर, राजस्थान)',
    coverLocationEn: '(Jaipur, Rajasthan)',
    cityHi: 'जयपुर, राजस्थान',
    cityEn: 'JAIPUR, RAJASTHAN',
  },
};

/**
 * Resolve project location metadata by matching project name or slug.
 */
export function getProjectLocationDetail(projectName?: string): ProjectLocationDetail {
  const norm = (projectName || '').toLowerCase().trim();

  if (norm.includes('11') || norm.includes('11th')) {
    return PROJECT_LOCATION_MAP['shivani-vatika-11th'];
  }
  if (norm.includes('shivani vatika') || norm.includes('shivani-vatika')) {
    return PROJECT_LOCATION_MAP['shivani-vatika'];
  }
  if (norm.includes('shyam aangan') || norm.includes('shyam-aangan')) {
    return PROJECT_LOCATION_MAP['shyam-aangan'];
  }

  return PROJECT_LOCATION_MAP['generic-fallback'];
}

/**
 * Full legal location clause for recitals and operative clauses.
 * e.g. "ग्राम हरसोली, तहसील रेनवाल, जिला जयपुर, राज्य – राजस्थान"
 */
export function getProjectLegalLocation(projectName?: string, lang: 'hi' | 'en' = 'hi'): string {
  const detail = getProjectLocationDetail(projectName);
  return lang === 'hi' ? detail.legalLocationHi : detail.legalLocationEn;
}

/**
 * Short location name for definitions section.
 * e.g. "हरसोली, तहसील रेनवाल, जिला जयपुर, राजस्थान"
 */
export function getProjectShortLocation(projectName?: string, lang: 'hi' | 'en' = 'hi'): string {
  const detail = getProjectLocationDetail(projectName);
  return lang === 'hi' ? detail.shortLocationHi : detail.shortLocationEn;
}

/**
 * Parenthesized location for cover pages and header banners.
 * e.g. "(ग्राम हरसोली, तहसील रेनवाल, जिला जयपुर, राजस्थान)"
 */
export function getProjectCoverLocation(projectName?: string, lang: 'hi' | 'en' = 'hi'): string {
  const detail = getProjectLocationDetail(projectName);
  return lang === 'hi' ? detail.coverLocationHi : detail.coverLocationEn;
}

/**
 * Project city and state string.
 * e.g. "जयपुर, राजस्थान"
 */
export function getProjectCity(projectName?: string, lang: 'hi' | 'en' = 'hi'): string {
  const detail = getProjectLocationDetail(projectName);
  return lang === 'hi' ? detail.cityHi : detail.cityEn;
}
