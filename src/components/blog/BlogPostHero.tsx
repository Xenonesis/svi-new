import type { BlogPost } from '@/src/lib/blog';
import { Link } from '@/src/i18n/navigation';
import { ArrowLeft, Calendar, User, Clock, Bookmark } from 'lucide-react';

export interface BlogPostHeroProps {
  post: BlogPost;
  locale: string;
}

export function BlogPostHero({ post, locale }: BlogPostHeroProps) {
  const isHindi = locale === 'hi';
  const title = isHindi && post.titleHi ? post.titleHi : post.title;
  const category = isHindi && post.categoryHi ? post.categoryHi : post.category;
  const readTime = isHindi && post.readTimeHi ? post.readTimeHi : post.readTime;

  return (
    <div className="bg-brand-navy relative overflow-hidden py-12 dark:bg-gray-900">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #d4af37 0, #d4af37 1px, transparent 0, transparent 50%)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="relative z-10 container mx-auto max-w-4xl px-4">
        <Link
          href="/blog"
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
  );
}

export default BlogPostHero;
