import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { BLOG_POST_MAP, BLOG_POSTS as SHARED_BLOG_POSTS } from '@/src/lib/blog';
import { absoluteUrl } from '@/src/lib/seo';
import BlogDetailFAQ from '@/src/components/common/ProjectsFAQ';

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

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 dark:bg-[#0C0C0C]">
      <article className="container mx-auto max-w-4xl px-4">
        <Link
          href={`/${locale}/blog`}
          className="text-brand-navy mb-8 inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase transition-colors hover:text-gray-600 dark:text-gray-200"
        >
          <ArrowLeft size={16} />
          {isHindi ? 'वापस ब्लॉग पर' : 'Back to Blog'}
        </Link>

        {/* Featured Image */}
        <div className="relative mb-12 aspect-[2/1] overflow-hidden border border-gray-200 dark:border-gray-700">
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

        {/* Meta */}
        <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <Calendar size={15} />
            {new Date(post.date).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <span className="flex items-center gap-1.5">
            <User size={15} />
            {post.author}
          </span>
          <span className="bg-brand-gold/10 text-brand-gold rounded-sm px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
            {category}
          </span>
          <span className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
            {readTime}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-brand-navy mb-8 font-serif text-3xl leading-tight md:text-5xl dark:text-gray-100">
          {title}
        </h1>

        {/* Excerpt */}
        <p className="mb-10 text-lg leading-relaxed text-gray-600 italic dark:text-gray-400">
          {excerpt}
        </p>

        {/* Content */}
        <div
          className="blog-content prose prose-lg dark:prose-invert prose-headings:font-serif prose-headings:text-brand-navy prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-brand-navy prose-a:text-brand-gold dark:prose-headings:text-gray-100 dark:prose-p:text-gray-400 dark:prose-li:text-gray-400 dark:prose-strong:text-gray-200 max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-8 dark:border-gray-700">
            <Tag size={16} className="text-gray-400" />
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-4 py-1.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
          <h3 className="text-brand-navy mb-3 font-serif text-2xl dark:text-gray-100">
            {isHindi ? 'हमारी प्रॉपर्टीज़ में दिलचस्पी है?' : 'Interested in Our Properties?'}
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {isHindi
              ? 'अपना ड्रीम होम खोजने के लिए हमारे चालू और पूरे हो चुके प्रोजेक्ट देखें।'
              : 'Explore our current and completed projects to find your perfect home.'}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/projects/current"
              className="bg-brand-gold text-brand-navy inline-block px-8 py-3 text-xs font-bold tracking-wider uppercase transition-all hover:shadow-lg"
            >
              {isHindi ? 'चालू प्रोजेक्ट देखें' : 'View Current Projects'}
            </Link>
            <Link
              href="/contact"
              className="text-brand-navy hover:text-brand-gold inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase transition-colors dark:text-gray-200"
            >
              {isHindi ? 'संपर्क करें' : 'Contact Us'}
            </Link>
          </div>
        </div>
      </article>

      <div className="container mx-auto mt-16 max-w-4xl px-4">
        <BlogDetailFAQ />
      </div>
    </div>
  );
}
