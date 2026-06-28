/** Shared navigation links used by DesktopNav and MobileNav. */
export const NAV_LINKS = [
  { nameKey: 'home' as const, path: '/' },
  { nameKey: 'aboutUs' as const, path: '/about' },
  { nameKey: 'calculators' as const, path: '/calculators' },
  { nameKey: 'careers' as const, path: '/careers' },
  { nameKey: 'blog' as const, path: '/blog' },
  { nameKey: 'exclusiveOffers' as const, path: '/exclusive-offers' },
] as const;
