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
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <section className="bg-brand-navy py-20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)', backgroundSize: '40px 40px' }}></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif text-white leading-tight mb-6"
          >
            Our Leadership
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-px bg-brand-gold mx-auto mb-6"
          ></motion.div>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
            Incorporated in December 2022 in Delhi, SVI Infra Solutions Private Limited is a non-government private company involved in building construction and civil engineering, based in Dwarka, Delhi. Meet the visionaries behind our success.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 lg:px-8 py-20 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {TEAM_MEMBERS.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.15, ease: "easeOut" }}
              className="bg-white group overflow-hidden border border-gray-200 hover:-translate-y-2 hover:shadow-xl transition-all duration-400 flex flex-col p-10 text-center relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-brand-gold"></div>
              <div className="w-24 h-24 mx-auto bg-brand-bg rounded-full flex items-center justify-center mb-6 border border-gray-100 group-hover:border-brand-gold transition-colors">
                <span className="text-3xl font-serif text-brand-navy">{member.name.charAt(0)}</span>
              </div>
              <div className="flex flex-col flex-grow">
                <h3 className="text-3xl font-serif text-brand-navy mb-2">{member.name}</h3>
                <span className="text-sm font-bold text-brand-gold uppercase tracking-widest mb-6 block">{member.role}</span>
                <p className="text-gray-600 text-base leading-relaxed mb-8 flex-grow">
                  {member.bio}
                </p>
                <div className="flex justify-center gap-4 mt-auto pt-6 border-t border-gray-100">
                  <a href="#" className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-brand-navy hover:text-white transition-colors" aria-label="LinkedIn">
                    <Linkedin size={18} />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-brand-navy hover:text-white transition-colors" aria-label="Email">
                    <Mail size={18} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      
      <section className="bg-brand-bg py-20 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-serif text-brand-navy mb-6">Join Our Growing Team</h2>
          <p className="text-gray-600 mb-10 leading-relaxed text-lg">
            We are always looking for passionate professionals to join us in shaping the future of real estate.
          </p>
          <Link href="/careers" className="inline-flex items-center gap-2 bg-brand-navy text-white px-8 py-4 font-bold uppercase text-xs tracking-widest hover:bg-brand-gold hover:text-brand-navy transition-colors">
            View Open Positions <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
