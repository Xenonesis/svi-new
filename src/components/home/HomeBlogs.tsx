'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BLOG_POST_CARDS } from '@/src/lib/blog';
import AnimatedSection, {
  StaggerContainer,
  StaggerItem,
} from '@/src/components/ui/AnimatedSection';
import BlogCard from './BlogCard';

const CATEGORY_COLORS: Record<string, string> = {
  'Investment Tips': 'from-emerald-500 to-teal-600',
  'निवेश टिप्स': 'from-emerald-500 to-teal-600',
  'Market Analysis': 'from-blue-500 to-indigo-600',
  'बाज़ार विश्लेषण': 'from-blue-500 to-indigo-600',
  Technology: 'from-purple-500 to-pink-600',
  टेक्नोलॉजी: 'from-purple-500 to-pink-600',
  'Legal & JDA': 'from-amber-500 to-orange-600',
  'लीगल एवं JDA': 'from-amber-500 to-orange-600',
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
  const latestPosts = BLOG_POST_CARDS.slice(0, 3);

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
          {latestPosts.map((post) => {
            const category = isHindi && post.categoryHi ? post.categoryHi : post.category;
            const gradient = CATEGORY_COLORS[category] || 'from-brand-gold to-amber-600';

            return (
              <StaggerItem key={post.slug}>
                <BlogCard post={post} locale={locale} isHindi={isHindi} gradient={gradient} />
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
