'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useCallback, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export interface FAQItem {
  category?: string;
  question: string;
  answer: string;
}

interface FAQSectionProps {
  /** Array of FAQ items to display */
  items: FAQItem[];
  /** Title for the FAQ section */
  title?: string;
  /** Subtitle shown below title */
  subtitle?: string;
  /** Whether to show structured data JSON-LD */
  showStructuredData?: boolean;
  /** Max width class for container */
  maxWidth?: string;
  /** Background variant */
  variant?: 'light' | 'dark' | 'brand' | 'none';
  /** Extra CSS classes */
  className?: string;
  /** If true, hides "Still have questions?" CTA */
  hideCTA?: boolean;
  /** Override the CTA link URL */
  ctaHref?: string;
  /** Override the CTA link text */
  ctaText?: string;
  /** Default active index (default: 0). Set -1 for none. */
  defaultActiveIndex?: number;
}

export default function FAQSection({
  items,
  title = 'Frequently Asked Questions',
  subtitle,
  showStructuredData = true,
  maxWidth = 'max-w-3xl',
  variant = 'none',
  className = '',
  hideCTA = false,
  ctaHref = '/contact',
  ctaText = 'Contact Our Team',
  defaultActiveIndex = 0,
}: FAQSectionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(
    defaultActiveIndex >= 0 ? defaultActiveIndex : null
  );

  const toggleFaq = useCallback((index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  }, []);

  const JSON_LD = showStructuredData
    ? {
        '@context': 'https://schema.org' as const,
        '@type': 'FAQPage' as const,
        mainEntity: items.map((faq) => ({
          '@type': 'Question' as const,
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer' as const,
            text: faq.answer,
          },
        })),
      }
    : null;

  // Group by category
  const grouped = items.reduce(
    (acc, faq) => {
      const cat = faq.category || 'General';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(faq);
      return acc;
    },
    {} as Record<string, FAQItem[]>
  );

  const bgClass =
    variant === 'light'
      ? 'bg-white dark:bg-gray-900'
      : variant === 'dark'
        ? 'bg-gray-50 dark:bg-[#0C0C0C]'
        : variant === 'brand'
          ? 'bg-brand-bg dark:bg-gray-900'
          : '';

  return (
    <div className={`${bgClass} py-16 md:py-24 ${className}`}>
      {showStructuredData && JSON_LD && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      )}

      <div className={`container mx-auto px-4 ${maxWidth}`}>
        {/* Header */}
        <div className="mb-12 text-center">
          {title && (
            <h2 className="text-brand-navy mb-4 font-serif text-3xl md:text-4xl dark:text-gray-100">
              {title}
            </h2>
          )}
          {subtitle ? (
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          ) : (
            <div className="bg-brand-gold mx-auto h-px w-16" />
          )}
        </div>

        {/* FAQ Items */}
        <div className="space-y-12">
          {Object.entries(grouped).map(([category, questions]) => (
            <div key={category}>
              {category !== 'General' && (
                <h3 className="text-brand-navy border-brand-gold mb-6 inline-block border-b-2 pb-2 font-serif text-2xl dark:text-gray-100">
                  {category}
                </h3>
              )}
              <div className="space-y-4">
                {questions.map((faq, idx) => {
                  const globalIdx = items.indexOf(faq);
                  return (
                    <motion.div
                      key={globalIdx}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '0px', amount: 0.05 }}
                      transition={{ delay: idx * 0.06 }}
                      className="overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
                    >
                      <button
                        onClick={() => toggleFaq(globalIdx)}
                        className="flex w-full items-center justify-between px-6 py-5 text-left focus:outline-none"
                      >
                        <span className="text-brand-navy pr-4 font-serif text-xl dark:text-gray-100">
                          {faq.question}
                        </span>
                        <motion.div
                          animate={{ rotate: activeIndex === globalIdx ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-brand-gold flex-shrink-0"
                        >
                          <ChevronDown size={20} />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {activeIndex === globalIdx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="border-t border-gray-100 px-6 pt-2 pb-6 leading-relaxed text-gray-600 dark:border-gray-700/50 dark:text-gray-400">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        {!hideCTA && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="mb-6 text-gray-600 dark:text-gray-400">Still have questions?</p>
            <Link
              href={ctaHref}
              className="bg-brand-navy dark:bg-brand-gold dark:text-brand-navy hover:bg-brand-gold hover:text-brand-navy border-brand-navy dark:border-brand-gold inline-flex border px-8 py-4 text-xs font-bold tracking-widest text-white uppercase shadow-md transition-colors hover:shadow-xl"
            >
              {ctaText}
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
