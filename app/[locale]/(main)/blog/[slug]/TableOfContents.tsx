'use client';

import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const content = document.querySelector('.blog-content');
    if (!content) return;

    const h2s = content.querySelectorAll('h2');
    const items: TOCItem[] = [];
    h2s.forEach((h, i) => {
      const id = `heading-${i}`;
      h.id = id;
      items.push({ id, text: h.textContent || '', level: 2 });
    });
    setHeadings(items);

    // Intersection observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    h2s.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  if (headings.length < 3) return null;

  return (
    <nav className="sticky top-24 hidden xl:block">
      <div className="rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm dark:border-gray-700/60 dark:bg-gray-900">
        <h4 className="text-brand-navy mb-3 text-xs font-bold tracking-widest uppercase dark:text-gray-200">
          Table of Contents
        </h4>
        <ul className="space-y-1.5">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById(h.id)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`block rounded-md px-2.5 py-1.5 text-xs leading-relaxed transition-all ${
                  activeId === h.id
                    ? 'bg-brand-gold/10 text-brand-gold font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                }`}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="bg-brand-gold text-brand-navy shadow-brand-gold/20 fixed right-6 bottom-6 z-40 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 hover:shadow-xl"
      aria-label="Back to top"
    >
      <ChevronUp size={18} strokeWidth={2.5} />
    </button>
  );
}
