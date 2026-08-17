'use client';

import { ChevronRight, Home } from 'lucide-react';
import { Link, usePathname } from '@/src/i18n/navigation';
import { useTranslations } from 'next-intl';

interface BreadcrumbItem {
  label: string;
  href: string;
}

// Visual breadcrumb nav only. BreadcrumbList JSON-LD is emitted once per page
// by the route's `BreadcrumbSchema` (see src/components/common/Schema.tsx) so we
// never emit duplicate or `/en/*` (307-redirecting) structured-data URLs here.
export default function Breadcrumbs() {
  const t = useTranslations('breadcrumbs');
  // next-intl usePathname already strips the locale prefix.
  const pathname = usePathname();

  // Don't show breadcrumbs on homepage or locale root
  if (!pathname || pathname === '/') return null;

  const paths = pathname.split('/').filter(Boolean);
  if (paths.length === 0) return null;

  const breadcrumbs: BreadcrumbItem[] = [
    { label: t('home'), href: '/' },
    ...paths.map((path, index) => {
      const href = `/${paths.slice(0, index + 1).join('/')}`;
      const routesKey = `routes.${path}`;
      const label = t.has(routesKey)
        ? t(routesKey)
        : path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
      return { label, href };
    }),
  ];

  return (
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
              <span className="text-brand-navy font-medium dark:text-gray-200" aria-current="page">
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
  );
}
