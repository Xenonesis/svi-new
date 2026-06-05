'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { ArrowRight, Users, ChevronDown, Award, Briefcase, Plus, Minus } from 'lucide-react';
import Link from 'next/link';

const LeadershipFAQ = dynamic(() => import('@/src/components/common/AboutFAQ'), { ssr: false });

const HIERARCHY = {
  directors: [
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
  ],
  areaManagers: [
    { name: 'Radhe Shyam', role: 'Area Manager' },
    { name: 'Kailash ', role: 'Area Manager' },
  ],
  hrManager: { name: 'To Be Announced', role: 'HR Manager' }, // Or actual name if provided
  teamLead: { name: 'To Be Announced', role: 'Team Lead (TL)' }, // Or actual name if provided
  staff: [
    { role: 'BDE (Business Development Executive)' },
    { role: 'BDM (Business Development Manager)' },
    { role: 'Telecaller' },
  ],
};

// Structured Data for Person (Leadership Team)
const personSchema = {
  '@context': 'https://schema.org',
  '@graph': HIERARCHY.directors.map((member) => ({
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
  const [maxVisibleLevel, setMaxVisibleLevel] = useState(1);

  const getNextLevelName = (level: number) => {
    switch (level) {
      case 1:
        return 'Area Managers';
      case 2:
        return 'HR Department';
      case 3:
        return 'Team Lead';
      case 4:
        return 'Staff';
      default:
        return '';
    }
  };

  return (
    <div className="page-transition min-h-screen bg-gray-50 pt-20 pb-16 dark:bg-gray-900">
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

      <section className="container mx-auto max-w-5xl px-4 py-16 md:py-20 lg:px-8">
        <div className="flex flex-col items-center">
          {/* Level 1: Directors */}
          <div className="relative z-10 grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8">
            {HIERARCHY.directors.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.7, delay: idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -10, boxShadow: '0 24px 64px rgba(0,0,0,0.14)' }}
                className="group hover:border-brand-gold relative flex flex-col overflow-hidden border border-gray-200 bg-white p-6 text-center transition-all duration-400 sm:p-8 dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="from-brand-gold/40 via-brand-gold to-brand-gold/40 absolute top-0 left-0 h-1 w-full bg-gradient-to-r" />
                <motion.div
                  className="bg-brand-gold/10 border-brand-gold/20 group-hover:border-brand-gold mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border transition-colors"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <span className="text-brand-navy font-serif text-2xl dark:text-gray-100">
                    {member.name.charAt(0)}
                  </span>
                </motion.div>
                <h3 className="text-brand-navy mb-1 font-serif text-2xl dark:text-gray-100">
                  {member.name}
                </h3>
                <span className="text-brand-gold mb-4 block text-xs font-bold tracking-widest uppercase">
                  {member.role}
                </span>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Level 2: Area Managers */}
          <AnimatePresence>
            {maxVisibleLevel >= 2 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="flex w-full flex-col items-center overflow-hidden"
              >
                <ChevronDown className="text-brand-gold my-6 h-8 w-8 animate-bounce opacity-70" />

                <div className="relative z-10 grid w-full max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8">
                  {HIERARCHY.areaManagers.map((member, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      whileHover={{ scale: 1.03, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                      className="border-brand-gold/30 hover:border-brand-gold relative flex flex-col items-center rounded-xl border bg-white p-6 shadow-md transition-all duration-300 sm:p-8 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <div className="bg-brand-gold/10 absolute -top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white shadow-sm dark:border-gray-800">
                        <Award size={20} className="text-brand-gold" />
                      </div>
                      <h4 className="text-brand-navy font-serif text-2xl dark:text-gray-100">
                        {member.name}
                      </h4>
                      <span className="text-brand-gold mt-2 text-sm font-semibold tracking-wider uppercase">
                        {member.role}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Level 3: HR Manager */}
          <AnimatePresence>
            {maxVisibleLevel >= 3 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="flex w-full flex-col items-center overflow-hidden"
              >
                <ChevronDown className="text-brand-gold my-6 h-8 w-8 animate-bounce opacity-70" />

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  className="border-brand-gold/20 relative w-full max-w-md rounded-xl border bg-white p-6 text-center shadow-md sm:p-8 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="bg-brand-navy absolute -top-5 left-1/2 flex h-10 w-10 -translate-x-1/2 transform items-center justify-center rounded-full border-2 border-white shadow-sm dark:border-gray-800">
                    <Briefcase size={18} className="text-white" />
                  </div>
                  <h4 className="text-brand-navy mt-2 font-serif text-xl dark:text-gray-100">
                    {HIERARCHY.hrManager.role}
                  </h4>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Level 4: Team Lead */}
          <AnimatePresence>
            {maxVisibleLevel >= 4 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="flex w-full flex-col items-center overflow-hidden"
              >
                <ChevronDown className="text-brand-gold my-6 h-8 w-8 animate-bounce opacity-70" />

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  className="border-brand-gold/20 w-full max-w-sm rounded-lg border bg-white p-6 text-center shadow-md dark:border-gray-700 dark:bg-gray-800"
                >
                  <h4 className="text-brand-navy font-serif text-lg dark:text-gray-100">
                    {HIERARCHY.teamLead.role}
                  </h4>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Level 5: Staff */}
          <AnimatePresence>
            {maxVisibleLevel >= 5 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="flex w-full flex-col items-center overflow-hidden"
              >
                <div className="border-brand-gold/40 my-6 h-10 w-px border-l-2 border-dashed"></div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6"
                >
                  {HIERARCHY.staff.map((staff, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -5, borderColor: 'rgba(201, 168, 76, 0.8)' }}
                      className="group flex flex-col items-center rounded-lg border border-gray-100 bg-gray-50 p-6 text-center shadow-sm transition-all dark:border-gray-800 dark:bg-gray-900"
                    >
                      <div className="mb-3 rounded-full bg-white p-3 shadow-sm transition-transform group-hover:scale-110 dark:bg-gray-800">
                        <Users className="text-brand-gold h-6 w-6" />
                      </div>
                      <span className="text-brand-navy text-sm font-medium dark:text-gray-300">
                        {staff.role}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Controls */}
          <motion.div
            className="relative z-10 my-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {maxVisibleLevel < 5 && (
              <button
                onClick={() => setMaxVisibleLevel((prev) => prev + 1)}
                className="group border-brand-gold/50 text-brand-navy hover:border-brand-gold hover:bg-brand-gold dark:text-brand-gold dark:hover:text-brand-navy relative flex cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-full border bg-white px-8 py-3.5 text-sm font-bold tracking-widest uppercase shadow-sm transition-all hover:text-white dark:bg-gray-900"
              >
                <span>Reveal {getNextLevelName(maxVisibleLevel)}</span>
                <Plus
                  size={18}
                  className="transition-transform duration-300 group-hover:rotate-90"
                />
              </button>
            )}
            {maxVisibleLevel > 1 && (
              <button
                onClick={() => setMaxVisibleLevel(1)}
                className="group flex cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3.5 text-sm font-bold tracking-widest text-gray-600 uppercase shadow-sm transition-all hover:border-red-500 hover:text-red-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-red-400 dark:hover:text-red-400"
              >
                <span>Collapse Hierarchy</span>
                <Minus size={18} />
              </button>
            )}
          </motion.div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-100 py-16 md:py-20 dark:border-gray-700 dark:bg-gray-900">
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
      <LeadershipFAQ />
    </div>
  );
}
