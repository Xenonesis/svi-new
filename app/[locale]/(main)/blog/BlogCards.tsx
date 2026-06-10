'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { BLOG_POSTS } from '@/src/lib/blog';

export default function BlogCards() {
  return (
    <section className="container mx-auto px-4 py-20 lg:px-8">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
        {BLOG_POSTS.map((post, idx) => (
          <motion.article
            key={post.slug}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: idx * 0.15, ease: 'easeOut' }}
            className="group flex flex-col overflow-hidden border border-gray-200 bg-white transition-all duration-400 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="relative h-60 overflow-hidden">
              <Image
                src={post.image}
                alt={post.title}
                fill
                quality={85}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="transform object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="bg-brand-gold text-brand-navy absolute top-4 left-4 px-3 py-1 text-[10px] font-bold tracking-widest uppercase shadow-sm">
                {post.category}
              </div>
            </div>
            <div className="flex flex-grow flex-col p-8">
              <div className="mb-4 flex items-center gap-4 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(post.date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <User size={12} /> {post.author}
                </span>
              </div>
              <h3 className="text-brand-navy group-hover:text-brand-gold mb-4 font-serif text-2xl transition-colors dark:text-white">
                {post.title}
              </h3>
              <p className="mb-8 flex-grow text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {post.excerpt}
              </p>
              <Link
                href={`/blog/${post.slug}`}
                className="text-brand-navy dark:text-brand-gold group-hover:text-brand-gold mt-auto inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors dark:group-hover:text-white"
              >
                Read Article <ArrowRight size={14} />
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
