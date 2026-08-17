import { BLOG_POSTS } from '@/src/lib/blog';
import { AREAS_DATA } from '@/src/data/areas';
import { PROJECTS_DB } from '@/src/data/projects';
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/src/lib/seo';

// Bump this when static page content actually changes. Build-time `new Date()`
// produced identical, ever-shifting timestamps that give crawlers no signal.
const STATIC_LAST_MODIFIED = new Date('2026-08-16T00:00:00.000Z');

function getSitemapEntry(
  path: string,
  lastModified: Date,
  changeFrequency: 'weekly' | 'monthly' | 'yearly',
  priority: number
) {
  const enUrl = `${SITE_URL}${path}`;
  const hiUrl = `${SITE_URL}/hi${path === '/' ? '' : path}`;

  // Codes must match the hreflang emitted on the pages (en-IN / hi-IN).
  const alternates = {
    languages: {
      'en-IN': enUrl,
      'hi-IN': hiUrl,
      'x-default': enUrl,
    },
  };

  return [
    {
      url: enUrl,
      lastModified,
      changeFrequency,
      priority,
      alternates,
    },
    {
      url: hiUrl,
      lastModified,
      changeFrequency,
      priority,
      alternates,
    },
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    ...getSitemapEntry('/', STATIC_LAST_MODIFIED, 'weekly', 1),
    ...getSitemapEntry('/about', STATIC_LAST_MODIFIED, 'monthly', 0.8),
    ...getSitemapEntry('/careers', STATIC_LAST_MODIFIED, 'monthly', 0.6),
    ...getSitemapEntry('/faq', STATIC_LAST_MODIFIED, 'monthly', 0.7),
    ...getSitemapEntry('/projects/current', STATIC_LAST_MODIFIED, 'weekly', 0.9),
    ...getSitemapEntry('/projects/completed', STATIC_LAST_MODIFIED, 'monthly', 0.8),
    ...getSitemapEntry('/registration', STATIC_LAST_MODIFIED, 'monthly', 0.9),
    ...getSitemapEntry('/contact', STATIC_LAST_MODIFIED, 'monthly', 0.8),
    ...getSitemapEntry('/privacy-policy', STATIC_LAST_MODIFIED, 'yearly', 0.3),
    ...getSitemapEntry('/terms-conditions', STATIC_LAST_MODIFIED, 'yearly', 0.3),
    ...getSitemapEntry('/leadership', STATIC_LAST_MODIFIED, 'monthly', 0.5),
    ...getSitemapEntry('/blog', STATIC_LAST_MODIFIED, 'weekly', 0.7),
    ...getSitemapEntry('/grievance', STATIC_LAST_MODIFIED, 'monthly', 0.4),
    ...getSitemapEntry('/calculators', STATIC_LAST_MODIFIED, 'monthly', 0.7),
    ...getSitemapEntry('/lottery', STATIC_LAST_MODIFIED, 'weekly', 0.6),
    ...getSitemapEntry('/changelog', STATIC_LAST_MODIFIED, 'weekly', 0.5),
    ...getSitemapEntry('/exclusive-offers', STATIC_LAST_MODIFIED, 'weekly', 0.7),
  ];

  // Money pages: project detail and area landing pages (previously missing).
  const projectRoutes: MetadataRoute.Sitemap = Object.keys(PROJECTS_DB).flatMap((slug) =>
    getSitemapEntry(`/projects/${slug}`, STATIC_LAST_MODIFIED, 'weekly', 0.9)
  );

  const areaRoutes: MetadataRoute.Sitemap = Object.keys(AREAS_DATA).flatMap((slug) =>
    getSitemapEntry(`/areas/${slug}`, STATIC_LAST_MODIFIED, 'monthly', 0.9)
  );

  // English-only brochure page — no /hi alternate (content is not translated).
  const brochureRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/brochure/shivani-vatika-11`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.flatMap((post) =>
    getSitemapEntry(`/blog/${post.slug}`, new Date(post.date), 'monthly', 0.6)
  );

  return [...staticRoutes, ...projectRoutes, ...areaRoutes, ...brochureRoutes, ...blogRoutes];
}
