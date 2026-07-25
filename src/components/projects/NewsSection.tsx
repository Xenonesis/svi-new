'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { BLOG_POST_CARDS } from '@/src/lib/blog';
import { ArrowRight, Calendar, Clock } from 'lucide-react';

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

export default function NewsSection() {
  const locale = useLocale();
  const isHindi = locale === 'hi';
  const latestPosts = BLOG_POST_CARDS.slice(0, 4);

  return (
    <section className="mt-20">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-brand-navy mb-2 font-serif text-3xl dark:text-white">
            {isHindi ? 'ब्लॉग एवं समाचार' : 'News & Insights'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {isHindi ? 'नवीनतम अपडेट्स और बाज़ार विश्लेषण' : 'Our Latest Updates'}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            {isHindi
              ? 'SVI Infra Solutions से नवीनतम रुझानों, निवेश गाइड और अपडेट के साथ जुड़े रहें'
              : 'Stay informed with the latest market trends, investment guides, and updates from SVI Infra Solutions'}
          </p>
        </div>
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
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {latestPosts.map((post) => {
          const title = isHindi && post.titleHi ? post.titleHi : post.title;
          const category = isHindi && post.categoryHi ? post.categoryHi : post.category;
          const readTime = isHindi && post.readTimeHi ? post.readTimeHi : post.readTime;
          const gradient = CATEGORY_COLORS[category] || 'from-brand-gold to-amber-600';

          return (
            <article
              key={post.slug}
              className="blog-card-glow group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-700/60 dark:bg-gray-900"
            >
              <Link
                href={`/${locale}/blog/${post.slug}`}
                className="relative block overflow-hidden"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={post.image}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover transition-all duration-700 group-hover:scale-110"
                    quality={85}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute top-3 left-3 z-10">
                  <span
                    className={`inline-block rounded-full bg-gradient-to-r px-2 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase shadow-md ${gradient}`}
                  >
                    {category}
                  </span>
                </div>
                <div className="absolute right-3 bottom-3 z-10">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold text-gray-700 shadow-sm backdrop-blur-sm dark:bg-gray-900/90 dark:text-gray-300">
                    <Clock size={10} />
                    {readTime}
                  </span>
                </div>
              </Link>

              <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex items-center gap-2 text-[9px] text-gray-400 dark:text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(post.date).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <h3 className="text-brand-navy group-hover:text-brand-gold mb-2 line-clamp-2 font-serif text-sm leading-snug transition-colors duration-300 dark:text-gray-100">
                  <Link href={`/${locale}/blog/${post.slug}`}>{title}</Link>
                </h3>

                <div className="mt-auto pt-4">
                  <Link
                    href={`/${locale}/blog/${post.slug}`}
                    className="group/link text-brand-gold hover:text-brand-navy inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase transition-colors dark:hover:text-gray-200"
                  >
                    <span className="relative">
                      {isHindi ? 'पढ़ें' : 'Read More'}
                      <span className="bg-brand-gold/30 absolute -bottom-0.5 left-0 h-px w-0 transition-all duration-300 group-hover/link:w-full" />
                    </span>
                    <ArrowRight
                      size={12}
                      className="transition-transform group-hover/link:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Mobile View All Button */}
      <div className="mt-8 border-t border-gray-200 pt-6 text-center md:hidden dark:border-gray-700">
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
    </section>
  );
}
