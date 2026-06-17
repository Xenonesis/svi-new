'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import Image from 'next/image';

const SQRT_5000 = Math.sqrt(5000);

const testimonialImages = [
  'https://ui-avatars.com/api/?name=Arjun&background=D4AF37&color=fff',
  'https://ui-avatars.com/api/?name=Rohan&background=1e293b&color=fff',
  'https://ui-avatars.com/api/?name=Priya&background=D4AF37&color=fff',
  'https://ui-avatars.com/api/?name=Vikram&background=1e293b&color=fff',
  'https://ui-avatars.com/api/?name=Ananya&background=D4AF37&color=fff',
  'https://ui-avatars.com/api/?name=Karan&background=1e293b&color=fff',
  'https://ui-avatars.com/api/?name=Amit&background=D4AF37&color=fff',
  'https://ui-avatars.com/api/?name=Siddharth&background=1e293b&color=fff',
  'https://ui-avatars.com/api/?name=Neha&background=D4AF37&color=fff',
  'https://ui-avatars.com/api/?name=Kritika&background=1e293b&color=fff',
];

const testimonials = [
  {
    tempId: 0,
    testimonial:
      'Investing in their completed commercial project in Noida was the best decision. The footfall is amazing and the rental potential is excellent.',
    by: 'Arjun, Commercial Investor',
    imgSrc: testimonialImages[0],
  },
  {
    tempId: 1,
    testimonial:
      "We shifted to our new flat last month. The construction quality is top-class and it's 100% Vastu compliant. Very happy with SVI Infra.",
    by: 'Rohan, Homeowner',
    imgSrc: testimonialImages[1],
  },
  {
    tempId: 2,
    testimonial:
      "Possession was given exactly on time! Usually, builders delay a lot, but SVI Infra's completed projects are proof of their commitment.",
    by: 'Priya, Resident',
    imgSrc: testimonialImages[2],
  },
  {
    tempId: 3,
    testimonial:
      'The location of their existing projects in Jaipur is prime. Perfect connectivity for daily commute and great neighborhood.',
    by: 'Vikram, Real Estate Investor',
    imgSrc: testimonialImages[3],
  },
  {
    tempId: 4,
    testimonial:
      'Unki property management team bohot cooperative hai. Maintenance in the completed towers is excellent and hassle-free.',
    by: 'Ananya, Business Owner',
    imgSrc: testimonialImages[4],
  },
  {
    tempId: 5,
    testimonial:
      'Visited their site in Noida. The society is fully secure and the amenities for kids are really good. Finalized our booking the same day.',
    by: 'Karan, Property Buyer',
    imgSrc: testimonialImages[5],
  },
  {
    tempId: 6,
    testimonial:
      'Retail space in their completed project has given my shop a huge boost. Parking and security is totally tension-free.',
    by: 'Amit, Retail Entrepreneur',
    imgSrc: testimonialImages[6],
  },
  {
    tempId: 7,
    testimonial:
      'I only trust SVI Infra for investment. Unke existing projects ki resale value aur demand hamesha market mein high rehti hai.',
    by: 'Siddharth, Financial Analyst',
    imgSrc: testimonialImages[7],
  },
  {
    tempId: 8,
    testimonial:
      'My parents are really happy with the new apartment. Society temple nearby and a great park for their evening walks.',
    by: 'Neha, Homeowner',
    imgSrc: testimonialImages[8],
  },
  {
    tempId: 9,
    testimonial:
      'The value growth in the Noida completed project has been outstanding. Definitely a great choice for NRI investors.',
    by: 'Kritika, Asset Manager',
    imgSrc: testimonialImages[9],
  },
  {
    tempId: 10,
    testimonial:
      'SVI Infra literally delivers what they promise in the brochure. No hidden charges and super transparent booking process.',
    by: 'Varun, Homeowner',
    imgSrc: testimonialImages[0],
  },
  {
    tempId: 11,
    testimonial:
      'Existing projects ki maintenance itni achi hai ki society abhi bhi brand new lagti hai. Very proactive facility team.',
    by: 'Rahul, Community Resident',
    imgSrc: testimonialImages[1],
  },
  {
    tempId: 12,
    testimonial:
      'Leased an office space in their IT park. Electricity backup and internet connectivity is flawless. Great corporate vibe.',
    by: 'Sneha, Startup Founder',
    imgSrc: testimonialImages[2],
  },
  {
    tempId: 13,
    testimonial:
      'Clubhouse and green area in their residential project is amazing. Weekend pe bahaar jaane ki zarurat hi nahi padti ab.',
    by: 'Manish, Property Buyer',
    imgSrc: testimonialImages[3],
  },
  {
    tempId: 14,
    testimonial:
      "SVI Infra's completed commercial hubs have the best corporate crowd. Very premium feel and the layout is very spacious.",
    by: 'Deepika, Corporate Client',
    imgSrc: testimonialImages[4],
  },
  {
    tempId: 15,
    testimonial:
      "Property papers and registry process was handled so smoothly. Really appreciate their legal team's support.",
    by: 'Rajesh, Portfolio Investor',
    imgSrc: testimonialImages[5],
  },
  {
    tempId: 16,
    testimonial:
      'The floor plan is very spacious. Natural light aur ventilation ka poora dhyan rakha gaya hai apartments mein.',
    by: 'Kunal, Interior Designer',
    imgSrc: testimonialImages[6],
  },
  {
    tempId: 17,
    testimonial:
      "We checked multiple options in NCR, but SVI's existing projects offer the best value for money and lifestyle.",
    by: 'Ankit, Prospective Buyer',
    imgSrc: testimonialImages[7],
  },
  {
    tempId: 18,
    testimonial:
      'Key handover ceremony was beautifully organized. Really felt like a VIP customer when taking possession.',
    by: 'Simran, First-time Buyer',
    imgSrc: testimonialImages[8],
  },
  {
    tempId: 19,
    testimonial:
      "Trust is everything in real estate, and SVI's track record with completed projects speaks for itself. Ekdum genuine builder.",
    by: 'Meera, Real Estate Consultant',
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
        <img
          src={testimonial.imgSrc}
          alt={`${testimonial.by.split(',')[0]}`}
          className="h-full w-full object-cover object-top grayscale transition-all duration-300 hover:grayscale-0"
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
        - {testimonial.by.split(',')[0]}
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
