'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, User, Clock } from 'lucide-react';
import { BLOG_POSTS } from '@/src/lib/blog';
import AnimatedSection, {
  StaggerContainer,
  StaggerItem,
} from '@/src/components/ui/AnimatedSection';

const CATEGORY_COLORS: Record<string, string> = {
  'Investment Tips': 'from-emerald-500 to-teal-600',
  'निवेश टिप्स': 'from-emerald-500 to-teal-600',
  'Market Analysis': 'from-blue-500 to-indigo-600',
  'बाज़ार विश्लेषण': 'from-blue-500 to-indigo-600',
  Technology: 'from-purple-500 to-pink-600',
  टेक्नोलॉजी: 'from-purple-500 to-pink-600',
  'Legal & RERA': 'from-amber-500 to-orange-600',
  'लीगल एवं RERA': 'from-amber-500 to-orange-600',
  Sustainability: 'from-green-500 to-emerald-600',
  'ग्रीन होम व टिकाऊ निर्माण': 'from-green-500 to-emerald-600',
  'Lifestyle & Design': 'from-rose-500 to-red-600',
  'लाइफ़स्टाइल व इंटीरियर': 'from-rose-500 to-red-600',
};

export default function HomeBlogs() {
  const locale = useLocale();
  const isHindi = locale === 'hi';
  const t = useTranslations('pages.blog');

  // Display the 3 latest blog posts
  const latestPosts = BLOG_POSTS.slice(0, 3);

  return (
    <section
      className="dark:border-brand-gold/20 dark:bg-brand-dark-bg border-b border-transparent bg-gray-50/50 py-16 md:py-24"
      role="region"
      aria-label="Latest insights and updates"
    >
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="mb-10 flex flex-col gap-4 border-b border-gray-200 pb-6 sm:mb-16 sm:pb-8 md:flex-row md:items-end md:justify-between dark:border-gray-700">
          <AnimatedSection type="fadeLeft" className="max-w-2xl">
            <h4 className="mb-4 text-[10px] font-semibold tracking-[0.2em] text-gray-400 uppercase dark:text-gray-500">
              {isHindi ? 'ब्लॉग एवं समाचार' : 'News & Insights'}
            </h4>
            <h2 className="text-brand-navy mb-2 font-serif text-3xl md:text-5xl dark:text-gray-100">
              {t('heading')}
            </h2>
            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {t('subtitle')}
            </p>
          </AnimatedSection>
          <AnimatedSection type="fadeRight" className="shrink-0">
            <Link
              href={`/${locale}/blog`}
              className="text-brand-navy group hidden items-center gap-2 text-[11px] font-semibold tracking-wider uppercase md:inline-flex dark:text-gray-200"
            >
              <span className="group-hover:text-brand-gold transition-colors">
                {isHindi ? 'सभी ब्लॉग देखें' : 'View All Blogs'}
              </span>
              <ArrowRight
                size={14}
                className="text-brand-gold transition-transform group-hover:translate-x-1"
              />
            </Link>
          </AnimatedSection>
        </div>

        {/* Blogs grid */}
        <StaggerContainer className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {latestPosts.map((post, idx) => {
            const title = isHindi && post.titleHi ? post.titleHi : post.title;
            const excerpt = isHindi && post.excerptHi ? post.excerptHi : post.excerpt;
            const category = isHindi && post.categoryHi ? post.categoryHi : post.category;
            const readTime = isHindi && post.readTimeHi ? post.readTimeHi : post.readTime;
            const gradient = CATEGORY_COLORS[category] || 'from-brand-gold to-amber-600';

            return (
              <StaggerItem key={post.slug}>
                <article className="blog-card-glow group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-700/60 dark:bg-gray-900">
                  <Link
                    href={`/${locale}/blog/${post.slug}`}
                    className="relative block overflow-hidden"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden">
                      <Image
                        src={post.image}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-all duration-700 group-hover:scale-110"
                        quality={85}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="absolute top-4 left-4 z-10">
                      <span
                        className={`inline-block rounded-full bg-gradient-to-r px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow-md ${gradient}`}
                      >
                        {category}
                      </span>
                    </div>
                    <div className="absolute right-4 bottom-4 z-10">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-gray-700 shadow-sm backdrop-blur-sm dark:bg-gray-900/90 dark:text-gray-300">
                        <Clock size={10} />
                        {readTime}
                      </span>
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex items-center gap-3 text-[10px] text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(post.date).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="h-0.5 w-0.5 rounded-full bg-gray-300" />
                      <span className="flex items-center gap-1">
                        <User size={11} />
                        {post.author}
                      </span>
                    </div>

                    <h3 className="text-brand-navy group-hover:text-brand-gold mb-3 line-clamp-2 font-serif text-lg leading-snug transition-colors duration-300 dark:text-gray-100">
                      <Link href={`/${locale}/blog/${post.slug}`}>{title}</Link>
                    </h3>

                    <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                      {excerpt}
                    </p>

                    <div className="mt-auto">
                      <Link
                        href={`/${locale}/blog/${post.slug}`}
                        className="group/link text-brand-gold hover:text-brand-navy inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase transition-colors dark:hover:text-gray-200"
                      >
                        <span className="relative">
                          {isHindi ? 'पढ़ें' : 'Read More'}
                          <span className="bg-brand-gold/30 absolute -bottom-0.5 left-0 h-px w-0 transition-all duration-300 group-hover/link:w-full" />
                        </span>
                        <ArrowRight
                          size={13}
                          className="transition-transform group-hover/link:translate-x-1"
                        />
                      </Link>
                    </div>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Mobile View All Button */}
        <div className="mt-12 border-t border-gray-200 pt-6 text-center md:hidden dark:border-gray-700">
          <Link
            href={`/${locale}/blog`}
            className="text-brand-navy group inline-flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase dark:text-gray-200"
          >
            <span className="group-hover:text-brand-gold transition-colors">
              {isHindi ? 'सभी ब्लॉग देखें' : 'View All Blogs'}
            </span>
            <ArrowRight
              size={14}
              className="text-brand-gold transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
