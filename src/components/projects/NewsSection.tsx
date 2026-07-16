'use client';

import Image from 'next/image';

type NewsSectionProps = {
  news: string[];
};

export default function NewsSection({ news }: NewsSectionProps) {
  if (!news || news.length === 0) return null;

  return (
    <section className="mt-20">
      <div className="mb-8">
        <h2 className="text-brand-navy mb-2 font-serif text-3xl dark:text-white">News Section</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Latest updates and news about the project
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {news.map((item, idx) => (
          <div
            key={idx}
            className="relative aspect-[16/9] overflow-hidden rounded-xl border border-gray-200 bg-white p-2 shadow-sm transition-all hover:shadow-md lg:aspect-square dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="relative h-full w-full overflow-hidden rounded-lg">
              <Image
                src={item}
                alt={`News Update ${idx + 1}`}
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
