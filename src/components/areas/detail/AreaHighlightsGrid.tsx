import { CheckCircle } from 'lucide-react';

export interface AreaHighlightsGridProps {
  highlights: string[];
  title?: string;
  isHindi?: boolean;
}

export function AreaHighlightsGrid({
  highlights,
  title,
  isHindi = false,
}: AreaHighlightsGridProps) {
  if (!highlights || highlights.length === 0) return null;

  const heading = title || (isHindi ? 'क्षेत्र की मुख्य विशेषताएं' : 'Key Area Highlights');

  return (
    <section className="mb-12">
      <h2 className="text-brand-navy mb-6 font-serif text-2xl dark:text-white">{heading}</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {highlights.map((highlight, idx) => (
          <div
            key={idx}
            className="dark:bg-gray-850 flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800"
          >
            <CheckCircle className="text-brand-gold mt-1 h-5 w-5 shrink-0" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {highlight}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AreaHighlightsGrid;
