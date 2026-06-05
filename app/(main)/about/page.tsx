'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { Target, Heart, Lightbulb, Award, CheckCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const AboutFAQ = dynamic(() => import('@/src/components/common/AboutFAQ'), { ssr: false });

export default function About() {
  return (
    <div className="min-h-screen bg-white pt-20 pb-20 dark:bg-gray-900">
      <section className="bg-brand-bg border-b border-gray-200 py-16 text-center md:py-24 dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h1 className="text-brand-navy animate-hero-h1 mb-6 px-2 font-serif text-3xl sm:text-4xl md:text-6xl dark:text-gray-100">
            About SVI Infra Solutions
          </h1>
          <div className="bg-brand-gold animate-hero-divider mx-auto h-px w-16"></div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h4 className="mb-6 text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase dark:text-gray-500">
              Our Story
            </h4>
            <h2 className="text-brand-navy mb-8 font-serif text-3xl dark:text-gray-100">
              Building Legacies Since 2009
            </h2>
            <div className="space-y-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              <p>
                For over 17 years, SVI Infra Solutions Pvt. Ltd. has been synonymous with trust,
                quality, and integrity in the Indian real estate market. We have successfully
                completed 15+ projects, delivering joy to over 5000+ happy clients.
              </p>
              <p>
                Our vision extends beyond just building structures; we create communities, shape
                lifestyles, and provide high-value investment avenues. Focused significantly on the
                Phulera Smart City, Jaipur region, and the DMIC/DFC corridors, our integrity-driven
                approach has made us a preferred partner for home buyers and investors alike.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-navy relative py-16 text-white md:py-24 dark:bg-gray-900">
        <div
          className="pointer-events-none absolute top-0 left-0 h-full w-full opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)',
            backgroundSize: '40px 40px',
          }}
        ></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="mb-16 text-center">
            <h4 className="text-brand-gold mb-4 text-[10px] font-bold tracking-[0.3em] uppercase">
              Core Principles
            </h4>
            <h2 className="mb-8 font-serif text-4xl text-white">Mission & Values</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <Target />,
                title: 'Integrity',
                desc: 'Honesty and transparency in every transaction.',
              },
              {
                icon: <Heart />,
                title: 'Customer-Centricity',
                desc: "Putting our clients' needs and aspirations first.",
              },
              {
                icon: <Lightbulb />,
                title: 'Innovation',
                desc: 'Pioneering new standards in real estate.',
              },
              {
                icon: <Award />,
                title: 'Excellence',
                desc: 'Delivering world-class quality without compromise.',
              },
            ].map((val, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px', amount: 0.05 }}
                transition={{ delay: idx * 0.08 }}
                className="hover:border-brand-gold dark:hover:border-brand-gold border border-white/10 bg-white/5 p-6 text-center transition-colors sm:p-8 md:p-10 dark:border-gray-700 dark:bg-gray-800/50"
              >
                <div className="bg-brand-gold/10 text-brand-gold mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full">
                  {val.icon}
                </div>
                <h3 className="mb-4 font-serif text-xl text-white dark:text-gray-100">
                  {val.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-300 dark:text-gray-300">
                  {val.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-10 md:flex-row md:gap-16">
            <div className="w-full md:w-1/2">
              <Image
                src="/images/house1.png"
                alt="SVI Infra residential property showcasing quality construction and modern design"
                width={800}
                height={600}
                className="w-full border shadow-2xl dark:border-gray-700 dark:shadow-none"
                quality={85}
              />
            </div>
            <div className="w-full md:w-1/2">
              <h4 className="mb-6 text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase dark:text-gray-500">
                Expertise
              </h4>
              <h2 className="text-brand-navy mb-10 font-serif text-4xl dark:text-gray-100">
                Services We Offer
              </h2>
              <div className="space-y-4">
                {[
                  'Residential Properties',
                  'Commercial Properties',
                  'Property Management',
                  'Real Estate Builders and Developers',
                  'Project Development',
                ].map((service, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '0px', amount: 0.05 }}
                    transition={{ delay: idx * 0.08 }}
                    className="group flex items-center gap-6 border-b border-gray-100 pb-4 dark:border-gray-700"
                  >
                    <div className="group-hover:border-brand-gold dark:group-hover:border-brand-gold flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 transition-colors dark:border-gray-600">
                      <CheckCircle className="text-brand-gold h-4 w-4 shrink-0" />
                    </div>
                    <span className="text-brand-navy font-serif text-lg dark:text-gray-200">
                      {service}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <AboutFAQ />
    </div>
  );
}
