export interface BlogPostTakeawaysProps {
  takeaways?: string[] | null;
  isHindi?: boolean;
  locale?: string;
}

export function BlogPostTakeaways({ takeaways, isHindi, locale }: BlogPostTakeawaysProps) {
  if (!takeaways || takeaways.length === 0) {
    return null;
  }

  const hindi = isHindi ?? locale === 'hi';

  return (
    <div className="blog-takeaways">
      <h3 className="text-brand-navy mb-3 flex items-center gap-2 font-serif text-lg font-bold dark:text-gray-100">
        <span className="bg-brand-gold text-brand-navy flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
          !
        </span>
        {hindi ? 'ज़रूरी बातें' : 'Key Takeaways'}
      </h3>
      <ul className="space-y-2">
        {takeaways.map((t, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
          >
            <span className="bg-brand-gold/20 text-brand-gold mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
              {i + 1}
            </span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BlogPostTakeaways;
