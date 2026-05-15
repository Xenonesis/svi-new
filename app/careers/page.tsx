"use client";

import { motion } from 'motion/react';
import { DollarSign, Laptop, Star, Send, Briefcase, Users, Target, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const GRADIENT_STYLE = { backgroundImage: 'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)', backgroundSize: '40px 40px' };

const FREELANCE_PERKS = [
  { icon: <Laptop size={28} />, title: "100% Remote", desc: "Work from anywhere, anytime. Be your own boss and manage your own schedule." },
  { icon: <DollarSign size={28} />, title: "Up to 12% Commission", desc: "Earn highly attractive commissions on every successful closing. Unlimited earning potential." },
  { icon: <Star size={28} />, title: "Full Support", desc: "Get marketing materials, project details, and dedicated support from our expert team." },
];

const ONSITE_ROLES = [
  { icon: <Briefcase size={28} />, role: "Business Development Manager (BDM)", type: "Onsite", salary: "Up to 40k INR" },
  { icon: <Users size={28} />, role: "Business Development Executive (BDE)", type: "Onsite", salary: "Up to 30k INR" },
  { icon: <Target size={28} />, role: "Team Lead (TL)", type: "Onsite", salary: "Up to 60k INR" },
];

export default function Careers() {
  return (
    <div className="pt-24 pb-20">
      <section className="bg-brand-bg dark:bg-gray-800 py-24 text-center border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif text-brand-navy dark:text-gray-100 mb-6"
          >
            Careers at SVI Infra Solutions
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-px bg-brand-gold mx-auto"
          ></motion.div>
        </div>
      </section>

      <section className="py-24 bg-brand-navy dark:bg-gray-900 text-white relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={GRADIENT_STYLE}></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-gold mb-6">Join Our Team</h4>
            <h2 className="text-4xl font-serif text-white mb-8">Freelance Real Estate Consultant</h2>
            <div className="text-gray-300 space-y-6 text-lg leading-relaxed">
              <p>
                Are you passionate about real estate? Do you want the flexibility to work from anywhere while earning industry-leading commissions? Join SVI Infra Solutions as a Freelance Partner and build your own success story.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {FREELANCE_PERKS.map((val, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 dark:bg-gray-800/50 p-10 border border-white/10 dark:border-gray-700 hover:border-brand-gold dark:hover:border-brand-gold transition-colors text-center"
              >
                 <div className="w-16 h-16 mx-auto bg-brand-gold/10 text-brand-gold flex items-center justify-center mb-8 rounded-full">
                   {val.icon}
                 </div>
                 <h3 className="text-xl font-serif text-white dark:text-gray-100 mb-4">{val.title}</h3>
                 <p className="text-gray-300 dark:text-gray-400 text-sm leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-brand-gold text-brand-navy px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-white transition-colors"
            >
              Apply Now <Send size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 dark:text-gray-400 mb-6">Sales & Promotion</h4>
            <h2 className="text-4xl font-serif text-brand-navy dark:text-gray-100 mb-8">Onsite Opportunities</h2>
            <div className="text-gray-600 dark:text-gray-300 space-y-6 text-lg leading-relaxed">
              <p>
                We are expanding our Sales & Promotion team. Join us onsite and take your career to the next level with competitive salaries, great growth opportunities, and an inspiring work environment.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {ONSITE_ROLES.map((job, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-gray-900 p-10 text-center shadow-lg dark:shadow-none border border-gray-100 dark:border-gray-700 hover:border-brand-gold dark:hover:border-brand-gold transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className="w-16 h-16 mx-auto bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-brand-navy dark:text-gray-300 group-hover:text-brand-gold dark:group-hover:text-brand-gold group-hover:border-brand-gold flex items-center justify-center mb-6 rounded-full transition-colors">
                  {job.icon}
                </div>
                <h3 className="text-xl font-serif text-brand-navy dark:text-gray-100 mb-4">{job.role}</h3>

                <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-4">
                  <CheckCircle size={14} className="text-brand-gold" />
                  <span>{job.type}</span>
                </div>

                <div className="inline-block px-4 py-2 bg-brand-bg dark:bg-gray-800 text-brand-gold font-bold text-lg rounded-sm">
                  {job.salary}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-brand-navy dark:bg-brand-gold text-white dark:text-brand-navy px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-brand-gold dark:hover:bg-white hover:text-white transition-colors"
            >
              Apply For Onsite Role <Send size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
