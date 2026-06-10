import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, User, Tag, Clock, Bookmark } from 'lucide-react';
import { BLOG_POST_MAP, BLOG_POSTS as SHARED_BLOG_POSTS } from '@/src/lib/blog';
import { absoluteUrl } from '@/src/lib/seo';
import BlogDetailFAQ from '@/src/components/common/ProjectsFAQ';
import ShareButtons from './ShareButtons';
import RelatedPosts from './RelatedPosts';
import ReadingProgress from './ReadingProgress';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const params: Array<{ locale: string; slug: string }> = [];
  for (const locale of ['en', 'hi']) {
    for (const post of SHARED_BLOG_POSTS) {
      params.push({ locale, slug: post.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = BLOG_POST_MAP[slug];
  if (!post) return { title: 'Blog Post Not Found' };

  const blogT = await getTranslations({ locale, namespace: 'pages.blog' });
  const title = locale === 'hi' && post.titleHi ? post.titleHi : post.title;

  return {
    title: `${title} | ${blogT('heading')}`,
    description: locale === 'hi' && post.excerptHi ? post.excerptHi : post.excerpt,
    openGraph: {
      title,
      description: locale === 'hi' && post.excerptHi ? post.excerptHi : post.excerpt,
      images: [{ url: absoluteUrl(post.image), width: 1200, height: 630 }],
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
  const category = isHindi && post.categoryHi ? post.categoryHi : post.category;
  const tags = isHindi && post.tagsHi ? post.tagsHi : post.tags;
  const readTime = isHindi && post.readTimeHi ? post.readTimeHi : post.readTime;

  // Get other posts for related section
  const relatedPosts = SHARED_BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 dark:bg-[#0C0C0C]">
      {/* Reading progress bar */}
      <ReadingProgress />

      {/* Hero banner */}
      <div className="bg-brand-navy relative overflow-hidden py-12 dark:bg-gray-900">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative z-10 container mx-auto max-w-4xl px-4">
          <Link
            href={`/${locale}/blog`}
            className="text-brand-gold mb-6 inline-flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase transition-colors hover:text-white"
          >
            <ArrowLeft size={14} />
            {isHindi ? 'वापस ब्लॉग पर' : 'Back to Blog'}
          </Link>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="bg-brand-gold/20 text-brand-gold inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase">
              <Bookmark size={10} fill="currentColor" />
              {category}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Clock size={11} />
              {readTime}
            </span>
          </div>

          <h1 className="mb-4 max-w-3xl font-serif text-3xl leading-tight text-white md:text-5xl">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {new Date(post.date).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span className="h-1 w-1 rounded-full bg-gray-500" />
            <span className="flex items-center gap-1.5">
              <User size={14} />
              {post.author}
            </span>
          </div>
        </div>
      </div>

      <article className="container mx-auto max-w-4xl px-4 py-12">
        {/* Featured Image */}
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

        {/* Excerpt */}
        <div className="border-brand-gold bg-brand-gold/5 mb-10 rounded-xl border-l-4 p-6">
          <p className="text-lg leading-relaxed font-medium text-gray-700 italic dark:text-gray-300">
            {excerpt}
          </p>
        </div>

        {/* Content */}
        <div
          className="blog-content prose prose-lg dark:prose-invert prose-headings:font-serif prose-headings:text-brand-navy dark:prose-headings:text-gray-100 prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-2xl prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-gray-700 prose-h2:pb-3 prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-p:leading-[1.8] prose-li:text-gray-600 dark:prose-li:text-gray-400 prose-li:leading-[1.7] prose-strong:text-brand-navy dark:prose-strong:text-gray-200 prose-a:text-brand-gold prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-brand-gold prose-blockquote:bg-brand-gold/5 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300 max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Tags */}
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

        {/* Share + Author */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Share */}
          <ShareButtons title={title} />

          {/* Author Card */}
          <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="from-brand-gold text-brand-navy flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br to-amber-500 text-lg font-bold shadow-md">
              S
            </div>
            <div>
              <h4 className="text-brand-navy mb-0.5 text-sm font-bold dark:text-gray-100">
                {post.author}
              </h4>
              <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                {isHindi
                  ? 'जयपुर, नोएडा और DMIC कॉरिडोर में 15+ साल के एक्सपीरियंस वाला रियल एस्टेट एक्सपर्ट।'
                  : 'Real estate expert with 15+ years of experience in Jaipur, Noida, and DMIC Corridor.'}
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="from-brand-navy to-brand-navy/90 mt-12 overflow-hidden rounded-2xl border border-gray-200/60 bg-gradient-to-br p-10 text-center shadow-xl dark:border-gray-700/60 dark:from-gray-900 dark:to-gray-900/90">
          <div className="relative z-10">
            <h3 className="mb-3 font-serif text-2xl text-white">
              {isHindi ? 'हमारी प्रॉपर्टीज़ में दिलचस्पी है?' : 'Interested in Our Properties?'}
            </h3>
            <p className="mb-6 text-gray-300">
              {isHindi
                ? 'अपना ड्रीम होम खोजने के लिए हमारे चालू और पूरे हो चुके प्रोजेक्ट देखें।'
                : 'Explore our current and completed projects to find your perfect home.'}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/projects/current"
                className="bg-brand-gold text-brand-navy hover:shadow-brand-gold/20 inline-block rounded-full px-8 py-3 text-xs font-bold tracking-wider uppercase transition-all hover:shadow-lg"
              >
                {isHindi ? 'चालू प्रोजेक्ट देखें' : 'View Current Projects'}
              </Link>
              <Link
                href="/contact"
                className="text-brand-gold inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase transition-colors hover:text-white"
              >
                {isHindi ? 'संपर्क करें' : 'Contact Us'}
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} locale={locale} />}

      {/* FAQ */}
      <div className="container mx-auto mt-16 max-w-4xl px-4 pb-20">
        <BlogDetailFAQ />
      </div>
    </div>
  );
}
