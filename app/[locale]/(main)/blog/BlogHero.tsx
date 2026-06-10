'use client';

import { motion } from 'motion/react';

export default function BlogHero() {
  return (
    <section className="bg-brand-navy relative overflow-hidden py-20 text-center dark:bg-gray-900">
      <div
        className="pointer-events-none absolute top-0 left-0 h-full w-full opacity-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)',
          backgroundSize: '40px 40px',
        }}
      ></div>
      <div className="relative z-10 container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 font-serif text-4xl leading-tight text-white md:text-6xl"
        >
          Insights &amp; Updates
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-brand-gold mx-auto mb-6 h-px w-16"
        ></motion.div>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-300">
          Stay informed with the latest market trends, investment guides, and updates from SVI Infra
          Solutions.
        </p>
      </div>
    </section>
  );
}
