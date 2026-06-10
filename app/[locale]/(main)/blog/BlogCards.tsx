'use client';

import { useLocale } from 'next-intl';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { BLOG_POSTS } from '@/src/lib/blog';

export default function BlogCards() {
  const locale = useLocale();
  const isHindi = locale === 'hi';

  return (
    <section className="container mx-auto px-4 py-20 lg:px-8">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
        {BLOG_POSTS.map((post, idx) => {
          const title = isHindi && post.titleHi ? post.titleHi : post.title;
          const excerpt = isHindi && post.excerptHi ? post.excerptHi : post.excerpt;
          const category = isHindi && post.categoryHi ? post.categoryHi : post.category;
          const readTime = isHindi && post.readTimeHi ? post.readTimeHi : post.readTime;

          return (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: idx * 0.15, ease: 'easeOut' }}
              className="group flex flex-col overflow-hidden border border-gray-200 bg-white transition-all duration-400 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-900"
            >
              <Link
                href={`/${locale}/blog/${post.slug}`}
                className="relative block overflow-hidden"
              >
                <div className="bg-brand-navy aspect-[4/3] overflow-hidden">
                  <Image
                    src={post.image}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-all duration-500 group-hover:scale-105"
                    quality={85}
                  />
                </div>
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-brand-gold text-brand-navy px-3 py-1 text-[10px] font-bold tracking-wider uppercase shadow-sm">
                    {category}
                  </span>
                </div>
              </Link>
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex items-center gap-4 text-[11px] text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    {new Date(post.date).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User size={13} />
                    {post.author}
                  </span>
                </div>
                <h3 className="text-brand-navy group-hover:text-brand-gold mb-3 font-serif text-xl leading-tight transition-colors dark:text-gray-100">
                  <Link href={`/${locale}/blog/${post.slug}`}>{title}</Link>
                </h3>
                <p className="mb-5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {excerpt}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase dark:text-gray-500">
                    {readTime}
                  </span>
                  <Link
                    href={`/${locale}/blog/${post.slug}`}
                    className="group/link text-brand-gold hover:text-brand-navy flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase transition-colors dark:hover:text-gray-200"
                  >
                    {isHindi ? 'पढ़ें' : 'Read More'}
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
    </section>
  );
}
