import { BLOG_POSTS } from '@/src/lib/blog';
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/src/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();
  function getSitemapEntry(
    path: string,
    lastModified: Date,
    changeFrequency: 'weekly' | 'monthly' | 'yearly',
    priority: number
  ) {
    return {
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: {
          en: `${SITE_URL}${path}`,
          hi: `${SITE_URL}/hi${path === '/' ? '' : path}`,
        },
      },
    };
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    getSitemapEntry('/', currentDate, 'weekly', 1),
    getSitemapEntry('/about', currentDate, 'monthly', 0.8),
    getSitemapEntry('/careers', currentDate, 'monthly', 0.6),
    getSitemapEntry('/faq', currentDate, 'monthly', 0.7),
    getSitemapEntry('/projects/current', currentDate, 'weekly', 0.9),
    getSitemapEntry('/projects/completed', currentDate, 'monthly', 0.8),
    getSitemapEntry('/registration', currentDate, 'monthly', 0.9),
    getSitemapEntry('/contact', currentDate, 'monthly', 0.8),
    getSitemapEntry('/privacy-policy', currentDate, 'yearly', 0.3),
    getSitemapEntry('/terms-conditions', currentDate, 'yearly', 0.3),
    getSitemapEntry('/leadership', currentDate, 'monthly', 0.5),
    getSitemapEntry('/blog', currentDate, 'weekly', 0.7),
    getSitemapEntry('/grievance', currentDate, 'monthly', 0.4),
    getSitemapEntry('/calculators', currentDate, 'monthly', 0.7),
    getSitemapEntry('/lottery', currentDate, 'weekly', 0.6),
  ];

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) =>
    getSitemapEntry(`/blog/${post.slug}`, new Date(post.date), 'monthly', 0.6)
  );

  return [...staticRoutes, ...blogRoutes];
}
