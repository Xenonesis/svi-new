import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Tag } from 'lucide-react';
import { BLOG_POST_MAP, BLOG_POSTS as SHARED_BLOG_POSTS } from '@/src/lib/blog';
import { absoluteUrl, buildAlternates, localizedUrl } from '@/src/lib/seo';
import BlogDetailFAQ from '@/src/components/faq/ProjectsFAQ';
import ShareButtons from './ShareButtons';
import RelatedPosts from './RelatedPosts';
import ReadingProgress from './ReadingProgress';
import TableOfContents, { BackToTop } from './TableOfContents';
import FloatingShare from './FloatingShare';
import BlogPostJsonLd from '@/src/components/blog/BlogPostJsonLd';
import BlogPostHero from '@/src/components/blog/BlogPostHero';
import BlogPostTakeaways from '@/src/components/blog/BlogPostTakeaways';
import { BlogPostAuthorCard, BlogPostCta } from '@/src/components/blog/BlogPostAuthorCard';

export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  return ['en', 'hi'].flatMap((locale) =>
    SHARED_BLOG_POSTS.map((post) => ({ locale, slug: post.slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = BLOG_POST_MAP[slug];
  if (!post) return { title: 'Blog Post Not Found' };

  await getTranslations({ locale, namespace: 'pages.blog' });
  const title = locale === 'hi' && post.titleHi ? post.titleHi : post.title;
  const excerpt = locale === 'hi' && post.excerptHi ? post.excerptHi : post.excerpt;
  const tags = locale === 'hi' && post.tagsHi ? post.tagsHi : post.tags;
  const currentUrl = localizedUrl(`/blog/${slug}`, locale);

  return {
    title,
    description: excerpt,
    alternates: buildAlternates(`/blog/${slug}`, locale),
    openGraph: {
      type: 'article',
      url: currentUrl,
      title,
      description: excerpt,
      siteName: 'SVI Infra Solutions',
      locale: locale === 'hi' ? 'hi_IN' : 'en_IN',
      publishedTime: new Date(post.date).toISOString(),
      modifiedTime: new Date(post.date).toISOString(),
      authors: [post.author],
      tags,
      images: [{ url: absoluteUrl(post.image), width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: excerpt,
      images: [absoluteUrl(post.image)],
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const isHindi = locale === 'hi';

  const post = BLOG_POST_MAP[slug];
  if (!post) notFound();

  const title = isHindi && post.titleHi ? post.titleHi : post.title;
  const excerpt = isHindi && post.excerptHi ? post.excerptHi : post.excerpt;
  const content = isHindi && post.contentHi ? post.contentHi : post.content;
  const tags = isHindi && post.tagsHi ? post.tagsHi : post.tags;
  const takeaways = isHindi && post.takeawaysHi ? post.takeawaysHi : post.takeaways;

  const sameCategory = SHARED_BLOG_POSTS.filter(
    (p) => p.slug !== slug && p.category === post.category
  );
  const otherCategory = SHARED_BLOG_POSTS.filter(
    (p) => p.slug !== slug && p.category !== post.category
  );
  const relatedPosts = [...sameCategory, ...otherCategory].slice(0, 3);

  return (
    <div className="dark:bg-brand-dark-bg min-h-screen bg-gray-50 pt-20">
      <BlogPostJsonLd post={post} locale={locale} slug={slug} />
      <ReadingProgress />
      <BlogPostHero post={post} locale={locale} />

      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="flex gap-10">
          <article className="max-w-4xl min-w-0 flex-1">
            <div className="relative -mt-20 mb-12 aspect-[2/1] overflow-hidden rounded-2xl border border-gray-200/60 shadow-2xl dark:border-gray-700/60">
              <Image
                src={post.image}
                alt={title}
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-cover"
                priority
                quality={90}
              />
            </div>

            <div className="border-brand-gold bg-brand-gold/5 mb-10 rounded-xl border-l-4 p-6">
              <p className="text-lg leading-relaxed font-medium text-gray-700 italic dark:text-gray-300">
                {excerpt}
              </p>
            </div>

            <BlogPostTakeaways takeaways={takeaways} isHindi={isHindi} />

            <div
              className="blog-content max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {tags && tags.length > 0 && (
              <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-8 dark:border-gray-700">
                <Tag size={16} className="text-gray-400" />
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="hover:bg-brand-gold/10 hover:text-brand-gold dark:hover:bg-brand-gold/20 rounded-full bg-gray-100 px-4 py-1.5 text-xs font-medium text-gray-600 transition-colors dark:bg-gray-800 dark:text-gray-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              <ShareButtons title={title} />
              <BlogPostAuthorCard author={post.author} isHindi={isHindi} />
            </div>

            <BlogPostCta isHindi={isHindi} />
          </article>

          <aside className="hidden w-64 flex-shrink-0 xl:block">
            <TableOfContents />
          </aside>
        </div>
      </div>

      <BackToTop />
      <FloatingShare title={title} />
      {relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} locale={locale} />}

      <div className="container mx-auto mt-16 max-w-4xl px-4 pb-20">
        <BlogDetailFAQ />
      </div>
    </div>
  );
}
