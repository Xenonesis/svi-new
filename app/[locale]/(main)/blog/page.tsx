import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';

import BlogHero from './BlogHero';
import BlogCards from './BlogCards';
import { BLOG_POSTS } from '@/src/lib/blog';
import { absoluteUrl, getAlternateLinks } from '@/src/lib/seo';
import BlogFAQ from '@/src/components/faq/ProjectsFAQ';

// ISR: revalidate every hour — blog posts update periodically
export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.blog' });
  const title = t('heading');
  const description =
    'Stay informed with the latest real estate market trends, investment guides, and updates from SVI Infra Solutions.';
  const currentUrl = absoluteUrl(`/${locale}/blog`);

  return {
    title,
    description,
    alternates: getAlternateLinks('/blog', locale),
    openGraph: {
      type: 'website',
      url: currentUrl,
      title: `${title} | SVI Infra Solutions`,
      description,
      siteName: 'SVI Infra Solutions',
      locale: locale === 'hi' ? 'hi_IN' : 'en_IN',
      images: [
        {
          url: absoluteUrl('/opengraph-image'),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | SVI Infra Solutions`,
      description,
      images: [absoluteUrl('/opengraph-image')],
    },
  };
}

export default async function Blog({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isHindi = locale === 'hi';

  const listPosts = BLOG_POSTS.map(({ content, contentHi, ...rest }) => rest);

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'SVI Infra Real Estate Blog',
    description:
      'Real estate insights, DMIC corridor analysis, NRI investment guides, and property market updates from SVI Infra Solutions.',
    url: absoluteUrl(`/${locale}/blog`),
    publisher: {
      '@type': 'Organization',
      name: 'SVI Infra Solutions',
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/logo.png'),
      },
    },
    blogPost: BLOG_POSTS.map((post) => ({
      '@type': 'BlogPosting',
      headline: isHindi && post.titleHi ? post.titleHi : post.title,
      description: isHindi && post.excerptHi ? post.excerptHi : post.excerpt,
      url: absoluteUrl(`/${locale}/blog/${post.slug}`),
      datePublished: new Date(post.date).toISOString(),
    })),
  };

  return (
    <div className="dark:bg-brand-dark-bg min-h-screen bg-gray-50 pt-24 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <BlogHero />
      <BlogCards posts={listPosts} />
      <BlogFAQ />
    </div>
  );
}
