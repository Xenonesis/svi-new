'use client';

import { motion } from 'motion/react';
import { Building2, Shield, TrendingUp } from 'lucide-react';
import AnimatedSection, {
  StaggerContainer,
  StaggerItem,
} from '@/src/components/common/AnimatedSection';

const FEATURES = [
  {
    icon: <Building2 size={32} />,
    title: 'Expert Agents',
    desc: 'Our experienced professionals guide you through every step of property selection and acquisition.',
  },
  {
    icon: <Shield size={32} />,
    title: 'Trusted Service',
    desc: '20+ years of core management expertise ensuring complete transparency and peace of mind.',
  },
  {
    icon: <TrendingUp size={32} />,
    title: 'Market Expertise',
    desc: 'Deep insights into high-growth corridors like DMIC ensuring the best ROI for investors.',
  },
];

export default function FeaturesSection() {
  return (
    <section
      className="bg-gray-50 py-16 md:py-24 dark:bg-gray-800"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 600px' }}
      role="region"
      aria-label="Why invest with us"
    >
      <div className="container mx-auto px-4">
        <AnimatedSection type="fadeUp" className="mx-auto mb-20 max-w-3xl text-center">
          <h4 className="mb-4 text-[10px] font-semibold tracking-[0.2em] text-gray-400 uppercase dark:text-gray-500">
            Why Invest With Us
          </h4>
          <h2 className="text-brand-navy mb-6 font-serif text-3xl md:text-5xl dark:text-gray-100">
            Excellence in Every Step
          </h2>
          <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            We focus on prime locations with high appreciation potential, notably the Phulera Smart
            City, Jaipur, and DMIC/DFC corridors. Backed by government approvals and strong
            partnerships.
          </p>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {FEATURES.map((feature, idx) => (
            <StaggerItem key={idx}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="group relative h-full border border-gray-200 bg-white p-8 transition-shadow duration-300 hover:shadow-lg md:p-10 dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="text-brand-gold mb-6 flex h-12 w-12 shrink-0 items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-brand-navy mb-4 font-serif text-2xl dark:text-gray-200">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {feature.desc}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
