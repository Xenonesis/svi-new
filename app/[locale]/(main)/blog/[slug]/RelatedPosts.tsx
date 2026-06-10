'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import type { BlogPost } from '@/src/lib/blog';

interface RelatedPostsProps {
  posts: BlogPost[];
  locale: string;
}

export default function RelatedPosts({ posts, locale }: RelatedPostsProps) {
  const isHindi = locale === 'hi';

  return (
    <section className="border-t border-gray-200 bg-white py-16 dark:border-gray-800 dark:bg-gray-950">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-brand-navy mb-2 font-serif text-2xl md:text-3xl dark:text-gray-100">
            {isHindi ? 'और पढ़ें' : 'Related Articles'}
          </h2>
          <div className="bg-brand-gold mx-auto h-px w-12" />
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {posts.map((post, idx) => {
            const title = isHindi && post.titleHi ? post.titleHi : post.title;
            const excerpt = isHindi && post.excerptHi ? post.excerptHi : post.excerpt;
            const category = isHindi && post.categoryHi ? post.categoryHi : post.category;
            const readTime = isHindi && post.readTimeHi ? post.readTimeHi : post.readTime;

            return (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="group flex gap-5 overflow-hidden rounded-xl border border-gray-200/60 bg-gray-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700/60 dark:bg-gray-900"
              >
                <Link
                  href={`/${locale}/blog/${post.slug}`}
                  className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg"
                >
                  <Image
                    src={post.image}
                    alt={title}
                    fill
                    sizes="96px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    quality={80}
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-brand-gold mb-1 text-[10px] font-bold tracking-wider uppercase">
                    {category}
                  </span>
                  <h3 className="text-brand-navy group-hover:text-brand-gold mb-1 truncate font-serif text-base leading-snug transition-colors dark:text-gray-100">
                    <Link href={`/${locale}/blog/${post.slug}`}>{title}</Link>
                  </h3>
                  <p className="mb-2 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                    {excerpt}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Clock size={10} />
                      {readTime}
                    </span>
                    <Link
                      href={`/${locale}/blog/${post.slug}`}
                      className="text-brand-gold hover:text-brand-navy inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase transition-colors"
                    >
                      {isHindi ? 'पढ़ें' : 'Read'}
                      <ArrowRight
                        size={10}
                        className="transition-transform group-hover:translate-x-0.5"
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
