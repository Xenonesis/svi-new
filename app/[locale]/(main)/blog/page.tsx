import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import dynamic from 'next/dynamic';
import BlogHero from './BlogHero';
import BlogCards from './BlogCards';
import { BLOG_POSTS } from '@/src/lib/blog';

const BlogFAQ = dynamic(() => import('@/src/components/faq/ProjectsFAQ'));

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.blog' });
  return {
    title: t('heading'),
    description:
      'Stay informed with the latest real estate market trends, investment guides, and updates from SVI Infra Solutions.',
  };
}

export default async function Blog({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.blog');

  const listPosts = BLOG_POSTS.map(({ content, contentHi, ...rest }) => rest);

  return (
    <div className="dark:bg-brand-dark-bg min-h-screen bg-gray-50 pt-24 pb-20">
      <BlogHero />
      <BlogCards posts={listPosts} />
      <BlogFAQ />
    </div>
  );
}
