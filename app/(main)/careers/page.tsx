'use client';

import { motion } from 'motion/react';
import {
  DollarSign,
  Laptop,
  Star,
  Send,
  Briefcase,
  Users,
  Target,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

const GRADIENT_STYLE = {
  backgroundImage:
    'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)',
  backgroundSize: '40px 40px',
};

const FREELANCE_PERKS = [
  {
    icon: <Laptop size={28} />,
    title: '100% Remote',
    desc: 'Work from anywhere, anytime. Be your own boss and manage your own schedule.',
  },
  {
    icon: <DollarSign size={28} />,
    title: 'Up to 12% Commission',
    desc: 'Earn highly attractive commissions on every successful closing. Unlimited earning potential.',
  },
  {
    icon: <Star size={28} />,
    title: 'Full Support',
    desc: 'Get marketing materials, project details, and dedicated support from our expert team.',
  },
];

const ONSITE_ROLES = [
  {
    icon: <Briefcase size={28} />,
    role: 'Business Development Manager (BDM)',
    type: 'Onsite',
    salary: 'Up to 40k INR',
  },
  {
    icon: <Users size={28} />,
    role: 'Business Development Executive (BDE)',
    type: 'Onsite',
    salary: 'Up to 30k INR',
  },
  { icon: <Target size={28} />, role: 'Team Lead (TL)', type: 'Onsite', salary: 'Up to 60k INR' },
];

export default function Careers() {
  return (
    <div className="pt-20 pb-16">
      <section className="bg-brand-bg border-b border-gray-200 py-14 text-center md:py-24 dark:border-gray-700 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h1 className="text-brand-navy animate-hero-h1 mb-6 font-serif text-3xl sm:text-4xl md:text-6xl dark:text-gray-100">
            Careers at SVI Infra Solutions
          </h1>
          <div className="bg-brand-gold animate-hero-divider mx-auto h-px w-16"></div>
        </div>
      </section>

      <section className="bg-brand-navy relative py-14 text-white md:py-24 dark:bg-gray-900">
        <div
          className="pointer-events-none absolute top-0 left-0 h-full w-full opacity-10"
          style={GRADIENT_STYLE}
        ></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-4xl text-center">
            <h4 className="text-brand-gold mb-6 text-[10px] font-bold tracking-[0.3em] uppercase">
              Join Our Team
            </h4>
            <h2 className="mb-8 font-serif text-4xl text-white">
              Freelance Real Estate Consultant
            </h2>
            <div className="space-y-6 text-lg leading-relaxed text-gray-300">
              <p>
                Are you passionate about real estate? Do you want the flexibility to work from
                anywhere while earning industry-leading commissions? Join SVI Infra Solutions as a
                Freelance Partner and build your own success story.
              </p>
            </div>
          </div>

          <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {FREELANCE_PERKS.map((val, idx) => (
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
                <p className="text-sm leading-relaxed text-gray-300 dark:text-gray-400">
                  {val.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/contact"
              className="bg-brand-gold text-brand-navy inline-flex items-center gap-2 px-8 py-4 text-sm font-bold tracking-widest uppercase transition-colors hover:bg-white"
            >
              Apply Now <Send size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 dark:bg-[#0C0C0C]">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-4xl text-center">
            <h4 className="mb-6 text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase dark:text-gray-400">
              Sales & Promotion
            </h4>
            <h2 className="text-brand-navy mb-8 font-serif text-4xl dark:text-gray-100">
              Onsite Opportunities
            </h2>
            <div className="space-y-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              <p>
                We are expanding our Sales & Promotion team. Join us onsite and take your career to
                the next level with competitive salaries, great growth opportunities, and an
                inspiring work environment.
              </p>
            </div>
          </div>

          <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {ONSITE_ROLES.map((job, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="hover:border-brand-gold dark:hover:border-brand-gold group border border-gray-100 bg-white p-6 text-center shadow-lg transition-all duration-300 hover:-translate-y-2 sm:p-10 dark:border-gray-700 dark:bg-gray-900 dark:shadow-none"
              >
                <div className="text-brand-navy group-hover:text-brand-gold dark:group-hover:text-brand-gold group-hover:border-brand-gold mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gray-100 bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {job.icon}
                </div>
                <h3 className="text-brand-navy mb-4 font-serif text-xl dark:text-gray-100">
                  {job.role}
                </h3>

                <div className="mb-4 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <CheckCircle size={14} className="text-brand-gold" />
                  <span>{job.type}</span>
                </div>

                <div className="bg-brand-bg text-brand-gold inline-block rounded-sm px-4 py-2 text-lg font-bold dark:bg-gray-800">
                  {job.salary}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/contact"
              className="bg-brand-navy dark:bg-brand-gold dark:text-brand-navy hover:bg-brand-gold inline-flex items-center gap-2 px-8 py-4 text-sm font-bold tracking-widest text-white uppercase transition-colors hover:text-white dark:hover:bg-white"
            >
              Apply For Onsite Role <Send size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
