'use client';

import { motion } from 'motion/react';
import { Linkedin, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const TEAM_MEMBERS = [
  {
    name: 'Iliyas Ali',
    role: 'Director',
    bio: "Key personnel behind SVI Infra Solutions Private Limited. Instrumental in guiding the company's strategic vision and operations.",
  },
  {
    name: 'Vinod Kumar',
    role: 'Director',
    bio: 'Key personnel behind SVI Infra Solutions Private Limited. Brings extensive expertise in building construction and civil engineering.',
  },
];

// Structured Data for Person (Leadership Team)
const personSchema = {
  '@context': 'https://schema.org',
  '@graph': TEAM_MEMBERS.map((member) => ({
    '@type': 'Person',
    name: member.name,
    jobTitle: member.role,
    description: member.bio,
    worksFor: {
      '@type': 'Organization',
      name: 'SVI Infra Solutions Private Limited',
      url: 'https://sviiinfrasolutions.com',
    },
    url: 'https://sviiinfrasolutions.com/leadership',
  })),
};

export default function Leadership() {
  return (
    <div className="page-transition min-h-screen bg-gray-50 pt-20 pb-16 dark:bg-[#0C0C0C]">
      {/* Person Schema - Leadership Team */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      <section className="bg-brand-navy relative overflow-hidden py-14 text-center md:py-24">
        <div
          className="pointer-events-none absolute top-0 left-0 h-full w-full opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Animated orbs */}
        <motion.div
          className="bg-brand-gold/10 absolute -top-20 -left-20 h-64 w-64 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 7, repeat: Infinity }}
        />
        <motion.div
          className="bg-brand-gold/10 absolute -right-20 -bottom-20 h-80 w-80 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 9, repeat: Infinity }}
        />
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="animate-hero-h1 mb-6 font-serif text-3xl leading-tight text-white sm:text-4xl md:text-6xl">
            Our Leadership
          </h1>
          <div className="bg-brand-gold animate-hero-divider mx-auto mb-6 h-px w-16"></div>
          <p className="animate-hero-subtitle mx-auto max-w-2xl text-lg leading-relaxed text-gray-300">
            Incorporated in December 2022 in Delhi, SVI Infra Solutions Private Limited is a
            non-government private company involved in building construction and civil engineering,
            based in Dwarka, Delhi. Meet the visionaries behind our success.
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-5xl px-4 py-20 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {TEAM_MEMBERS.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -10, boxShadow: '0 24px 64px rgba(0,0,0,0.14)' }}
              className="group hover:border-brand-gold relative flex flex-col overflow-hidden border border-gray-200 bg-white p-10 text-center transition-all duration-400 dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="from-brand-gold/40 via-brand-gold to-brand-gold/40 absolute top-0 left-0 h-1 w-full bg-gradient-to-r" />
              {/* Animated background accent */}
              <motion.div
                className="bg-brand-gold/5 absolute right-0 bottom-0 h-32 w-32 rounded-tl-full"
                whileHover={{ scale: 3, opacity: 0.12 }}
                transition={{ duration: 0.5 }}
              />
              <motion.div
                className="bg-brand-gold/10 border-brand-gold/20 group-hover:border-brand-gold float-slow mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border transition-colors"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-brand-navy font-serif text-3xl dark:text-gray-100">
                  {member.name.charAt(0)}
                </span>
              </motion.div>
              <div className="flex flex-grow flex-col">
                <h3 className="text-brand-navy mb-2 font-serif text-3xl dark:text-gray-100">
                  {member.name}
                </h3>
                <span className="text-brand-gold mb-6 block text-sm font-bold tracking-widest uppercase">
                  {member.role}
                </span>
                <p className="mb-8 flex-grow text-base leading-relaxed text-gray-600 dark:text-gray-400">
                  {member.bio}
                </p>
                <div className="mt-auto flex justify-center gap-4 border-t border-gray-100 pt-6 dark:border-gray-700">
                  <motion.a
                    href="#"
                    whileHover={{ scale: 1.2, backgroundColor: '#1a2744', color: '#fff' }}
                    whileTap={{ scale: 0.9 }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors dark:bg-gray-700"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={18} />
                  </motion.a>
                  <motion.a
                    href="#"
                    whileHover={{ scale: 1.2, backgroundColor: '#1a2744', color: '#fff' }}
                    whileTap={{ scale: 0.9 }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors dark:bg-gray-700"
                    aria-label="Email"
                  >
                    <Mail size={18} />
                  </motion.a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-100 py-20 dark:border-gray-700 dark:bg-gray-900">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-brand-navy mb-6 font-serif text-3xl md:text-4xl dark:text-gray-100">
              Join Our Growing Team
            </h2>
            <p className="mb-10 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
              We are always looking for passionate professionals to join us in shaping the future of
              real estate.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/careers"
                className="bg-brand-navy hover:bg-brand-gold hover:text-brand-navy inline-flex items-center gap-2 px-8 py-4 text-xs font-bold tracking-widest text-white uppercase transition-colors"
              >
                View Open Positions <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
