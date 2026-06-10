'use client';

import { useLocale } from 'next-intl';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, User, Clock, Bookmark } from 'lucide-react';
import { BLOG_POSTS } from '@/src/lib/blog';

const CATEGORY_COLORS: Record<string, string> = {
  'Investment Tips': 'from-emerald-500 to-teal-600',
  'निवेश टिप्स': 'from-emerald-500 to-teal-600',
  'Market Analysis': 'from-blue-500 to-indigo-600',
  'बाज़ार विश्लेषण': 'from-blue-500 to-indigo-600',
  Technology: 'from-purple-500 to-pink-600',
  टेक्नोलॉजी: 'from-purple-500 to-pink-600',
};

export default function BlogCards() {
  const locale = useLocale();
  const isHindi = locale === 'hi';

  return (
    <section className="bg-gray-50/50 py-20 dark:bg-[#0C0C0C]/50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Featured first post — full width */}
        {(() => {
          const post = BLOG_POSTS[0];
          const title = isHindi && post.titleHi ? post.titleHi : post.title;
          const excerpt = isHindi && post.excerptHi ? post.excerptHi : post.excerpt;
          const category = isHindi && post.categoryHi ? post.categoryHi : post.category;
          const readTime = isHindi && post.readTimeHi ? post.readTimeHi : post.readTime;
          const gradient = CATEGORY_COLORS[category] || 'from-brand-gold to-amber-600';

          return (
            <motion.article
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="group relative mb-12 overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-lg transition-all duration-500 hover:shadow-2xl dark:border-gray-700/60 dark:bg-gray-900"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Image side */}
                <Link
                  href={`/${locale}/blog/${post.slug}`}
                  className="relative aspect-[4/3] overflow-hidden lg:aspect-auto"
                >
                  <Image
                    src={post.image}
                    alt={title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-all duration-700 group-hover:scale-105"
                    quality={90}
                    priority
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  {/* Featured badge */}
                  <div className="absolute top-5 left-5 z-10">
                    <span className="bg-brand-gold text-brand-navy inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase shadow-lg">
                      <Bookmark size={10} fill="currentColor" />
                      {isHindi ? 'फ़ीचर्ड' : 'Featured'}
                    </span>
                  </div>
                </Link>
                {/* Content side */}
                <div className="flex flex-col justify-center p-8 lg:p-10">
                  {/* Category + Meta */}
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-block rounded-full bg-gradient-to-r px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow-sm ${gradient}`}
                    >
                      {category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Clock size={11} />
                      {readTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-brand-navy group-hover:text-brand-gold dark:group-hover:text-brand-gold mb-4 font-serif text-2xl leading-snug transition-colors duration-300 md:text-3xl dark:text-gray-100">
                    <Link href={`/${locale}/blog/${post.slug}`}>{title}</Link>
                  </h2>

                  {/* Excerpt with highlight */}
                  <p className="mb-6 text-base leading-relaxed text-gray-500 dark:text-gray-400">
                    {excerpt}
                  </p>

                  {/* Author + Date row */}
                  <div className="mb-6 flex items-center gap-4 text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      {new Date(post.date).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-gray-300" />
                    <span className="flex items-center gap-1.5">
                      <User size={12} />
                      {post.author}
                    </span>
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/${locale}/blog/${post.slug}`}
                    className="group/link text-brand-gold hover:text-brand-navy inline-flex w-fit items-center gap-2 text-xs font-bold tracking-wider uppercase transition-colors dark:hover:text-gray-200"
                  >
                    <span className="relative">
                      {isHindi ? 'पूरा पढ़ें' : 'Read Full Article'}
                      <span className="bg-brand-gold/30 absolute -bottom-0.5 left-0 h-px w-0 transition-all duration-300 group-hover/link:w-full" />
                    </span>
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover/link:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            </motion.article>
          );
        })()}

        {/* Remaining posts grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {BLOG_POSTS.slice(1).map((post, idx) => {
            const title = isHindi && post.titleHi ? post.titleHi : post.title;
            const excerpt = isHindi && post.excerptHi ? post.excerptHi : post.excerpt;
            const category = isHindi && post.categoryHi ? post.categoryHi : post.category;
            const readTime = isHindi && post.readTimeHi ? post.readTimeHi : post.readTime;
            const gradient = CATEGORY_COLORS[category] || 'from-brand-gold to-amber-600';

            return (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: 'easeOut' }}
                className="group flex flex-col overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-700/60 dark:bg-gray-900"
              >
                {/* Image */}
                <Link
                  href={`/${locale}/blog/${post.slug}`}
                  className="relative block overflow-hidden"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <Image
                      src={post.image}
                      alt={title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-all duration-700 group-hover:scale-110"
                      quality={85}
                    />
                  </div>
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  {/* Category badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span
                      className={`inline-block rounded-full bg-gradient-to-r px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow-md ${gradient}`}
                    >
                      {category}
                    </span>
                  </div>
                  {/* Reading time badge */}
                  <div className="absolute right-4 bottom-4 z-10">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-gray-700 shadow-sm backdrop-blur-sm dark:bg-gray-900/90 dark:text-gray-300">
                      <Clock size={10} />
                      {readTime}
                    </span>
                  </div>
                </Link>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  {/* Meta */}
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

                  {/* Title */}
                  <h3 className="text-brand-navy group-hover:text-brand-gold mb-3 font-serif text-xl leading-snug transition-colors duration-300 dark:text-gray-100">
                    <Link href={`/${locale}/blog/${post.slug}`}>{title}</Link>
                  </h3>

                  {/* Excerpt */}
                  <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                    {excerpt}
                  </p>

                  {/* Read more */}
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
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
