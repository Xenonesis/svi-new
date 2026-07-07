'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { SITE_URL } from '@/src/lib/seo';

interface BreadcrumbItem {
  label: string;
  href: string;
}

export default function Breadcrumbs() {
  const locale = useLocale();
  const t = useTranslations('breadcrumbs');
  const pathname = usePathname();

  // Don't show breadcrumbs on homepage or locale root
  if (pathname === '/' || pathname === `/${locale}` || pathname === `/${locale}/`) return null;

  let paths = pathname.split('/').filter(Boolean);
  // Remove locale prefix from breadcrumbs array if present
  if (paths[0] === locale) {
    paths = paths.slice(1);
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: t('home'), href: `/${locale}` },
    ...paths.map((path, index) => {
      const href = `/${locale}/${paths.slice(0, index + 1).join('/')}`;
      const routesKey = `routes.${path}`;
      const label = t.has(routesKey)
        ? t(routesKey)
        : path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
      return { label, href };
    }),
  ];

  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${SITE_URL}${item.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label={t('ariaLabel')}
        className="breadcrumbs-nav container mx-auto px-4 pt-16 pb-4 md:pt-20"
      >
        <ol className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {breadcrumbs.map((item, index) => (
            <li key={item.href} className="flex items-center gap-2">
              {index > 0 && <ChevronRight size={14} className="text-gray-400" />}
              {index === 0 ? (
                <Link
                  href={item.href}
                  className="hover:text-brand-gold flex items-center gap-1 transition-colors"
                  aria-label={t('ariaGoHome')}
                >
                  <Home size={14} />
                  <span className="sr-only md:not-sr-only">{item.label}</span>
                </Link>
              ) : index === breadcrumbs.length - 1 ? (
                <span
                  className="text-brand-navy font-medium dark:text-gray-200"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-brand-gold transition-colors">
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
