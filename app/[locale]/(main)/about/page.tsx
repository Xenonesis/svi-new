import type { Metadata } from 'next';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import MissionValuesCards from './MissionValuesCards';
import ServicesList from './ServicesList';

const AboutFAQ = dynamic(() => import('@/src/components/common/AboutFAQ'));

export const metadata: Metadata = {
  title: 'About SVI Infra Solutions',
  description:
    'Building legacies since 2009. SVI Infra Solutions is a premium real estate developer with 15+ projects and 5000+ happy clients across Jaipur, Noida, and Phulera Smart City.',
};

export default function About() {
  return (
    <div className="min-h-screen bg-white pt-20 pb-20 dark:bg-gray-900">
      {/* Hero */}
      <section className="bg-brand-bg border-b border-gray-200 py-16 text-center md:py-24 dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h1 className="text-brand-navy animate-hero-h1 mb-6 px-2 font-serif text-3xl sm:text-4xl md:text-6xl dark:text-gray-100">
            About SVI Infra Solutions
          </h1>
          <div className="bg-brand-gold animate-hero-divider mx-auto h-px w-16"></div>
        </div>
      </section>

      {/* Story */}
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

      {/* Mission & Values (client leaf for motion animations) */}
      <MissionValuesCards />

      {/* Services */}
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
              {/* Client leaf for motion animations */}
              <ServicesList />
            </div>
          </div>
        </div>
      </section>

      <AboutFAQ />
    </div>
  );
}
