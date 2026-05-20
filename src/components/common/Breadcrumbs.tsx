'use client';

import { ChevronRight, Home } from 'lucide-react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SITE_URL } from '@/src/lib/seo';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const routeLabels: Record<string, string> = {
  about: 'About Us',
  careers: 'Careers',
  blog: 'Blog',
  projects: 'Projects',
  current: 'Current Projects',
  completed: 'Completed Projects',
  contact: 'Contact Us',
  registration: 'Register',
  login: 'Client Login',
  payment: 'Payment',
  grievance: 'Grievance',
  faq: 'FAQ',
  leadership: 'Leadership',
  'privacy-policy': 'Privacy Policy',
  'terms-conditions': 'Terms & Conditions',
  'thank-you': 'Thank You',
};

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Don't show breadcrumbs on homepage
  if (pathname === '/') return null;

  const paths = pathname.split('/').filter(Boolean);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    ...paths.map((path, index) => {
      const href = `/${paths.slice(0, index + 1).join('/')}`;
      const label =
        routeLabels[path] || path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
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
      <nav aria-label="Breadcrumb" className="container mx-auto px-4 py-4">
        <ol className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {breadcrumbs.map((item, index) => (
            <li key={item.href} className="flex items-center gap-2">
              {index > 0 && <ChevronRight size={14} className="text-gray-400" />}
              {index === 0 ? (
                <Link
                  href={item.href}
                  className="hover:text-brand-gold flex items-center gap-1 transition-colors"
                  aria-label="Go to homepage"
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
