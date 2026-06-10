'use client';

import { motion } from 'motion/react';
import { CheckCircle } from 'lucide-react';

const SERVICES = [
  'Residential Properties',
  'Commercial Properties',
  'Property Management',
  'Real Estate Builders and Developers',
  'Project Development',
];

export default function ServicesList() {
  return (
    <div className="space-y-4">
      {SERVICES.map((service, idx) => (
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
          <span className="text-brand-navy font-serif text-lg dark:text-gray-200">{service}</span>
        </motion.div>
      ))}
    </div>
  );
}
