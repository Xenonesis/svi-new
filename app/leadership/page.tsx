"use client";

import { motion } from 'motion/react';
import { Linkedin, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const TEAM_MEMBERS = [
  {
    name: "Iliyas Ali",
    role: "Director",
    bio: "Key personnel behind SVI Infra Solutions Private Limited. Instrumental in guiding the company's strategic vision and operations."
  },
  {
    name: "Vinod Kumar",
    role: "Director",
    bio: "Key personnel behind SVI Infra Solutions Private Limited. Brings extensive expertise in building construction and civil engineering."
  }
];

export default function Leadership() {
  return (
    <div className="pt-24 pb-20 bg-gray-50 dark:bg-gray-900 min-h-screen page-transition">
      <section className="bg-brand-navy py-24 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)', backgroundSize: '40px 40px' }} />
        {/* Animated orbs */}
        <motion.div
          className="absolute -top-20 -left-20 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 7, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-80 h-80 bg-brand-gold/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 9, repeat: Infinity }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-6xl font-serif text-white leading-tight mb-6"
          >
            Our Leadership
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="w-16 h-px bg-brand-gold mx-auto mb-6 origin-left"
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed"
          >
            Incorporated in December 2022 in Delhi, SVI Infra Solutions Private Limited is a non-government private company involved in building construction and civil engineering, based in Dwarka, Delhi. Meet the visionaries behind our success.
          </motion.p>
        </div>
      </section>


      <section className="container mx-auto px-4 lg:px-8 py-20 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {TEAM_MEMBERS.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -10, boxShadow: '0 24px 64px rgba(0,0,0,0.14)' }}
              className="bg-white dark:bg-gray-800 group overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-brand-gold transition-all duration-400 flex flex-col p-10 text-center relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-gold/40 via-brand-gold to-brand-gold/40" />
              {/* Animated background accent */}
              <motion.div
                className="absolute bottom-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-tl-full"
                whileHover={{ scale: 3, opacity: 0.12 }}
                transition={{ duration: 0.5 }}
              />
              <motion.div
                className="w-24 h-24 mx-auto bg-brand-gold/10 rounded-full flex items-center justify-center mb-6 border border-brand-gold/20 group-hover:border-brand-gold transition-colors float-slow"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-3xl font-serif text-brand-navy dark:text-gray-100">{member.name.charAt(0)}</span>
              </motion.div>
              <div className="flex flex-col flex-grow">
                <h3 className="text-3xl font-serif text-brand-navy dark:text-gray-100 mb-2">{member.name}</h3>
                <span className="text-sm font-bold text-brand-gold uppercase tracking-widest mb-6 block">{member.role}</span>
                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-8 flex-grow">
                  {member.bio}
                </p>
                <div className="flex justify-center gap-4 mt-auto pt-6 border-t border-gray-100 dark:border-gray-700">
                  <motion.a
                    href="#"
                    whileHover={{ scale: 1.2, backgroundColor: '#1a2744', color: '#fff' }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-400 flex items-center justify-center transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={18} />
                  </motion.a>
                  <motion.a
                    href="#"
                    whileHover={{ scale: 1.2, backgroundColor: '#1a2744', color: '#fff' }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-400 flex items-center justify-center transition-colors"
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
      
      <section className="bg-gray-100 dark:bg-gray-800 py-20 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif text-brand-navy dark:text-gray-100 mb-6">Join Our Growing Team</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-10 leading-relaxed text-lg">
              We are always looking for passionate professionals to join us in shaping the future of real estate.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link href="/careers" className="inline-flex items-center gap-2 bg-brand-navy text-white px-8 py-4 font-bold uppercase text-xs tracking-widest hover:bg-brand-gold hover:text-brand-navy transition-colors">
                View Open Positions <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
