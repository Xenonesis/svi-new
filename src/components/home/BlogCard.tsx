'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, Clock } from 'lucide-react';
import type { BlogPostCard } from '@/src/lib/blog';

interface BlogPostFlatProps {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  coverImage?: string;
  image?: string;
  author?: string;
  titleHi?: string;
  excerptHi?: string;
  categoryHi?: string;
  readTimeHi?: string;
  locale?: string;
  isHindi?: boolean;
  gradient?: string;
  post?: never;
}

interface BlogPostNestedProps {
  post: BlogPostCard;
  locale?: string;
  isHindi?: boolean;
  gradient?: string;
}

export type BlogCardProps = BlogPostNestedProps | BlogPostFlatProps;

export default function BlogCard(props: BlogCardProps) {
  const isNested = 'post' in props && props.post !== undefined;
  const post = isNested ? props.post : props;
  const locale = props.locale;
  const isHindi = Boolean(props.isHindi);
  const gradient = props.gradient || 'from-amber-500 to-orange-600';

  const title = isHindi && post.titleHi ? post.titleHi : post.title;
  const excerpt = isHindi && post.excerptHi ? post.excerptHi : post.excerpt;
  const category = isHindi && post.categoryHi ? post.categoryHi : post.category;
  const readTime = isHindi && post.readTimeHi ? post.readTimeHi : post.readTime;
  const imageSrc =
    'coverImage' in post && post.coverImage
      ? post.coverImage
      : 'image' in post && post.image
        ? post.image
        : '/images/blog/trend.jpg';
  const author = 'author' in post && post.author ? post.author : 'SVI Infra';
  const slug = post.slug;
  const href = locale && locale !== 'en' ? `/${locale}/blog/${slug}` : `/blog/${slug}`;

  return (
    <article className="hover-lift hover-gold-glow blog-card-glow group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-md transition-all duration-500 hover:shadow-2xl dark:border-gray-700/60 dark:bg-gray-900">
      <Link href={href} className="relative block overflow-hidden">
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <div
            className={`absolute top-4 left-4 z-10 rounded-full bg-gradient-to-r ${gradient} px-3 py-1 text-[10px] font-semibold text-white shadow-lg`}
          >
            {category}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-3 text-[10px] font-medium text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {post.date}
          </span>
          <span className="flex items-center gap-1">
            <User size={12} />
            {author}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {readTime}
          </span>
        </div>

        <Link href={href}>
          <h3 className="dark:group-hover:text-brand-gold font-serif text-lg leading-snug font-bold text-gray-900 transition-colors duration-200 group-hover:text-amber-600 dark:text-gray-100">
            {title}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {excerpt}
        </p>

        <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
          <Link
            href={href}
            className="text-brand-navy dark:text-brand-gold inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase transition-opacity hover:opacity-70"
          >
            {isHindi ? 'पूरा पढ़ें' : 'Read Full Article'}
          </Link>
        </div>
      </div>
    </article>
  );
}
