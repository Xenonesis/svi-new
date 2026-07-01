'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Quote } from 'lucide-react';
import AnimatedSection from '@/src/components/ui/AnimatedSection';

export default function LeadershipSection() {
  const t = useTranslations('leadershipHome');

  return (
    <section
      className="relative bg-white py-16 md:py-32 dark:bg-gray-900"
      role="region"
      aria-label="Leadership vision"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-16 lg:flex-row">
          <AnimatedSection type="fadeRight" className="relative w-full lg:w-5/12">
            <div className="border-brand-gold/20 absolute inset-0 -translate-x-4 -translate-y-4 border-2" />
            <div className="img-zoom-container relative z-10 aspect-[4/5] w-full shadow-2xl">
              {/* Replace with actual founder image later. For now, use a premium placeholder or project image */}
              <Image
                src="/images/hero2.png"
                alt="Leadership"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
                quality={85}
              />
              <div className="from-brand-navy/90 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="font-serif text-2xl font-bold">{t('founderName')}</p>
                <div className="bg-brand-gold mt-2 h-1 w-12" />
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection type="fadeLeft" className="w-full lg:w-7/12 lg:pl-12">
            <h4 className="mb-4 text-[10px] font-semibold tracking-[0.2em] text-gray-400 uppercase dark:text-gray-500">
              {t('sectionTitle')}
            </h4>
            <h2 className="text-brand-navy mb-8 font-serif text-4xl leading-tight md:text-5xl dark:text-gray-100">
              {t('heading')}
            </h2>

            <div className="relative mb-10">
              <Quote className="text-brand-gold/20 absolute -top-4 -left-4 h-16 w-16" />
              <p className="relative z-10 font-serif text-xl leading-relaxed text-gray-700 italic md:text-2xl dark:text-gray-300">
                "{t('visionStatement')}"
              </p>
            </div>

            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
              {t('founderStory')}
            </p>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
