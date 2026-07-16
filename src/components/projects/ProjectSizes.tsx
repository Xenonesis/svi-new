type ProjectSizesProps = {
  sizes: string[];
  isHindi?: boolean;
};

export default function ProjectSizes({ sizes, isHindi }: ProjectSizesProps) {
  if (!sizes || sizes.length === 0) return null;

  return (
    <div className="mb-12">
      <h3 className="text-brand-navy mb-6 font-serif text-2xl dark:text-white">
        {isHindi ? 'उपलब्ध आकार' : 'Available Sizes'}
      </h3>
      <div className="flex flex-wrap gap-4">
        {sizes.map((size: string, idx: number) => (
          <span
            key={idx}
            className="bg-brand-gold/10 text-brand-navy dark:bg-brand-gold/20 dark:text-brand-gold border-brand-gold/20 rounded-full border px-6 py-2 text-sm font-bold"
          >
            {size}
          </span>
        ))}
      </div>
    </div>
  );
}
