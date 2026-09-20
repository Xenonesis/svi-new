import type { BlogPost } from '@/src/lib/blog';
import { Link } from '@/src/i18n/navigation';

export interface BlogPostAuthorCardProps {
  author?: string;
  post?: BlogPost;
  isHindi?: boolean;
  locale?: string;
}

export function BlogPostAuthorCard({
  author: authorProp,
  post,
  isHindi,
  locale,
}: BlogPostAuthorCardProps) {
  const hindi = isHindi ?? locale === 'hi';
  const author = authorProp ?? post?.author ?? 'SVI Infra Solutions';

  return (
    <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <div className="from-brand-gold text-brand-navy flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br to-amber-500 text-lg font-bold shadow-md">
        S
      </div>
      <div>
        <h4 className="text-brand-navy mb-0.5 text-sm font-bold dark:text-gray-100">{author}</h4>
        <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          {hindi
            ? 'जयपुर, नोएडा और DMIC कॉरिडोर में 17+ साल के एक्सपीरियंस वाला रियल एस्टेट एक्सपर्ट।'
            : 'Real estate expert with 17+ years of experience in Jaipur, Noida, and DMIC Corridor.'}
        </p>
      </div>
    </div>
  );
}

export interface BlogPostCtaProps {
  isHindi?: boolean;
  locale?: string;
}

export function BlogPostCta({ isHindi, locale }: BlogPostCtaProps) {
  const hindi = isHindi ?? locale === 'hi';

  return (
    <div className="from-brand-navy to-brand-navy/90 mt-12 overflow-hidden rounded-2xl border border-gray-200/60 bg-gradient-to-br p-10 text-center shadow-xl dark:border-gray-700/60 dark:from-gray-900 dark:to-gray-900/90">
      <div className="relative z-10">
        <h3 className="mb-3 font-serif text-2xl text-white">
          {hindi ? 'हमारी प्रॉपर्टीज़ में दिलचस्पी है?' : 'Interested in Our Properties?'}
        </h3>
        <p className="mb-6 text-gray-300">
          {hindi
            ? 'अपना ड्रीम होम खोजने के लिए हमारे चालू और पूरे हो चुके प्रोजेक्ट देखें।'
            : 'Explore our current and completed projects to find your perfect home.'}
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/projects/current"
            className="bg-brand-gold text-brand-navy hover:shadow-brand-gold/20 inline-block rounded-full px-8 py-3 text-xs font-bold tracking-wider uppercase transition-all hover:shadow-lg"
          >
            {hindi ? 'चालू प्रोजेक्ट देखें' : 'View Current Projects'}
          </Link>
          <Link
            href="/contact"
            className="text-brand-gold inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase transition-colors hover:text-white"
          >
            {hindi ? 'संपर्क करें' : 'Contact Us'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export { BlogPostCta as BlogPostInquiryCta };
export default BlogPostAuthorCard;
