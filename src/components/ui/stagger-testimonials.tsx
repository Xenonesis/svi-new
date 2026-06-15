'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import Image from 'next/image';

const SQRT_5000 = Math.sqrt(5000);

const testimonialImages = [
  '/images/testimonials/arjun_avatar.png',
  '/images/testimonials/rohan_avatar.png',
  '/images/testimonials/priya_avatar.png',
  '/images/testimonials/vikram_avatar.png',
  '/images/testimonials/ananya_avatar.png',
  '/images/testimonials/karan_avatar.png',
  '/images/testimonials/amit_avatar.png',
  '/images/testimonials/siddharth_avatar.png',
  '/images/testimonials/neha_avatar.png',
  '/images/testimonials/kritika_avatar.png',
];

const testimonials = [
  {
    tempId: 0,
    testimonial: 'My favorite solution in the market. We work 5x faster with SVI Infra Solutions.',
    by: 'Arjun, CEO at TechCorp',
    imgSrc: testimonialImages[0],
  },
  {
    tempId: 1,
    testimonial:
      "I'm confident my data is safe with SVI Infra Solutions. I can't say that about other providers.",
    by: 'Rohan, CTO at SecureNet',
    imgSrc: testimonialImages[1],
  },
  {
    tempId: 2,
    testimonial:
      "I know it's cliche, but we were lost before we found SVI Infra Solutions. Can't thank you guys enough!",
    by: 'Priya, COO at InnovateCo',
    imgSrc: testimonialImages[2],
  },
  {
    tempId: 3,
    testimonial:
      "SVI Infra Solutions's products make planning for the future seamless. Can't recommend them enough!",
    by: 'Vikram, CFO at FuturePlanning',
    imgSrc: testimonialImages[3],
  },
  {
    tempId: 4,
    testimonial: "If I could give 11 stars, I'd give 12.",
    by: 'Ananya, Head of Design at CreativeSolutions',
    imgSrc: testimonialImages[4],
  },
  {
    tempId: 5,
    testimonial: "SO SO SO HAPPY WE FOUND YOU GUYS!!!! I'd bet you've saved me 100 hours so far.",
    by: 'Karan, Product Manager at TimeWise',
    imgSrc: testimonialImages[5],
  },
  {
    tempId: 6,
    testimonial:
      "Took some convincing, but now that we're on SVI Infra Solutions, we're never going back.",
    by: 'Amit, Marketing Director at BrandBuilders',
    imgSrc: testimonialImages[6],
  },
  {
    tempId: 7,
    testimonial:
      "I would be lost without SVI Infra Solutions's in-depth analytics. The ROI is EASILY 100X for us.",
    by: 'Siddharth, Data Scientist at AnalyticsPro',
    imgSrc: testimonialImages[7],
  },
  {
    tempId: 8,
    testimonial: "It's just the best. Period.",
    by: 'Neha, UX Designer at UserFirst',
    imgSrc: testimonialImages[8],
  },
  {
    tempId: 9,
    testimonial: 'I switched 5 years ago and never looked back.',
    by: 'Kritika, DevOps Engineer at CloudMasters',
    imgSrc: testimonialImages[9],
  },
  {
    tempId: 10,
    testimonial:
      "I've been searching for a solution like SVI Infra Solutions for YEARS. So glad I finally found one!",
    by: 'Varun, Sales Director at RevenueRockets',
    imgSrc: testimonialImages[0],
  },
  {
    tempId: 11,
    testimonial: "It's so simple and intuitive, we got the team up to speed in 10 minutes.",
    by: 'Rahul, HR Manager at TalentForge',
    imgSrc: testimonialImages[1],
  },
  {
    tempId: 12,
    testimonial:
      "SVI Infra Solutions's customer support is unparalleled. They're always there when we need them.",
    by: 'Sneha, Customer Success Manager at ClientCare',
    imgSrc: testimonialImages[2],
  },
  {
    tempId: 13,
    testimonial:
      "The efficiency gains we've seen since implementing SVI Infra Solutions are off the charts!",
    by: 'Manish, Operations Manager at StreamlineSolutions',
    imgSrc: testimonialImages[3],
  },
  {
    tempId: 14,
    testimonial:
      "SVI Infra Solutions has revolutionized how we handle our workflow. It's a game-changer!",
    by: 'Deepika, Workflow Specialist at ProcessPro',
    imgSrc: testimonialImages[4],
  },
  {
    tempId: 15,
    testimonial:
      "The scalability of SVI Infra Solutions's solution is impressive. It grows with our business seamlessly.",
    by: 'Rajesh, Scaling Officer at GrowthGurus',
    imgSrc: testimonialImages[5],
  },
  {
    tempId: 16,
    testimonial:
      "I appreciate how SVI Infra Solutions continually innovates. They're always one step ahead.",
    by: 'Kunal, Innovation Lead at FutureTech',
    imgSrc: testimonialImages[6],
  },
  {
    tempId: 17,
    testimonial:
      "The ROI we've seen with SVI Infra Solutions is incredible. It's paid for itself many times over.",
    by: 'Ankit, Finance Analyst at ProfitPeak',
    imgSrc: testimonialImages[7],
  },
  {
    tempId: 18,
    testimonial:
      "SVI Infra Solutions's platform is so robust, yet easy to use. It's the perfect balance.",
    by: 'Simran, Tech Lead at BalancedTech',
    imgSrc: testimonialImages[8],
  },
  {
    tempId: 19,
    testimonial:
      "We've tried many solutions, but SVI Infra Solutions stands out in terms of reliability and performance.",
    by: 'Meera, Performance Manager at ReliableSystems',
    imgSrc: testimonialImages[9],
  },
];

interface TestimonialCardProps {
  position: number;
  testimonial: (typeof testimonials)[0];
  handleMove: (steps: number) => void;
  cardSize: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  position,
  testimonial,
  handleMove,
  cardSize,
}) => {
  const isCenter = position === 0;

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        'absolute top-1/2 left-1/2 cursor-pointer border-2 p-8 transition-all duration-300 ease-out',
        isCenter
          ? 'bg-brand-gold text-brand-navy border-brand-gold z-10'
          : 'text-brand-navy dark:bg-brand-dark-surface dark:border-brand-dark-border hover:border-brand-gold/50 z-0 border-gray-200 bg-white dark:text-gray-100'
      )}
      style={{
        width: cardSize,
        height: cardSize,
        clipPath: `polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)`,
        transform: `
          translate(-50%, -50%) 
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        boxShadow: isCenter
          ? '0px 8px 0px 4px var(--color-brand-dark-border)'
          : '0px 0px 0px 0px transparent',
      }}
    >
      <span
        className="dark:bg-brand-dark-border absolute block origin-top-right rotate-45 bg-gray-200"
        style={{
          right: -2,
          top: 48,
          width: SQRT_5000,
          height: 2,
        }}
      />
      <div
        className="dark:bg-brand-dark-bg relative mb-4 h-14 w-12 bg-gray-100"
        style={{ boxShadow: '3px 3px 0px var(--color-brand-bg)' }}
      >
        <Image
          src={testimonial.imgSrc}
          alt={`${testimonial.by.split(',')[0]}`}
          fill
          className="object-cover object-top grayscale transition-all duration-300 hover:grayscale-0"
        />
      </div>
      <h3
        className={cn(
          'font-serif text-base font-medium sm:text-xl',
          isCenter ? 'text-brand-navy' : 'text-brand-navy dark:text-gray-100'
        )}
      >
        "{testimonial.testimonial}"
      </h3>
      <p
        className={cn(
          'absolute right-8 bottom-8 left-8 mt-2 text-sm italic',
          isCenter ? 'text-brand-navy/80' : 'text-gray-500 dark:text-gray-400'
        )}
      >
        - {testimonial.by}
      </p>
    </div>
  );
};

export const StaggerTestimonials: React.FC = () => {
  const [cardSize, setCardSize] = useState(365);
  const [testimonialsList, setTestimonialsList] = useState(testimonials);

  const handleMove = (steps: number) => {
    const newList = [...testimonialsList];
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift();
        if (!item) return;
        newList.push({ ...item, tempId: Math.random() });
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop();
        if (!item) return;
        newList.unshift({ ...item, tempId: Math.random() });
      }
    }
    setTestimonialsList(newList);
  };

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia('(min-width: 640px)');
      setCardSize(matches ? 365 : 290);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      handleMove(1);
    }, 3000);
    return () => clearInterval(interval);
  }, [testimonialsList]);

  return (
    <section className="bg-brand-bg dark:bg-brand-dark-bg relative overflow-hidden py-24">
      <div className="container mx-auto mb-16 px-4 text-center">
        <h2 className="text-brand-navy mb-4 font-serif text-4xl md:text-5xl dark:text-white">
          What Our Clients Say
        </h2>
        <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
          Discover why hundreds of families and businesses trust SVI Infra Solutions for their real
          estate needs.
        </p>
      </div>
      <div className="relative w-full overflow-hidden" style={{ height: 600 }}>
        {testimonialsList.map((testimonial, index) => {
          const position =
            testimonialsList.length % 2
              ? index - (testimonialsList.length + 1) / 2
              : index - testimonialsList.length / 2;
          return (
            <TestimonialCard
              key={testimonial.tempId}
              testimonial={testimonial}
              handleMove={handleMove}
              position={position}
              cardSize={cardSize}
            />
          );
        })}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          <button
            onClick={() => handleMove(-1)}
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-full text-2xl transition-colors',
              'dark:bg-brand-dark-surface dark:border-brand-dark-border text-brand-navy hover:bg-brand-gold hover:text-brand-navy hover:border-brand-gold dark:hover:bg-brand-gold dark:hover:text-brand-navy border-2 border-gray-200 bg-white dark:text-gray-100',
              'focus-visible:ring-brand-gold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
            )}
            aria-label="Previous testimonial"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => handleMove(1)}
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-full text-2xl transition-colors',
              'dark:bg-brand-dark-surface dark:border-brand-dark-border text-brand-navy hover:bg-brand-gold hover:text-brand-navy hover:border-brand-gold dark:hover:bg-brand-gold dark:hover:text-brand-navy border-2 border-gray-200 bg-white dark:text-gray-100',
              'focus-visible:ring-brand-gold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
            )}
            aria-label="Next testimonial"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
};
