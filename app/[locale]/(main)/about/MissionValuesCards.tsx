'use client';

import { motion } from 'motion/react';
import { Target, Heart, Lightbulb, Award } from 'lucide-react';

const VALUES = [
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
];

export default function MissionValuesCards() {
  return (
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
          {VALUES.map((val, idx) => (
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
              <h3 className="mb-4 font-serif text-xl text-white dark:text-gray-100">{val.title}</h3>
              <p className="text-sm leading-relaxed text-gray-300 dark:text-gray-300">{val.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
