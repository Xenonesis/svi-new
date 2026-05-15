"use client";

import { motion, AnimatePresence } from 'motion/react';
import { useCallback, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

const FAQ_DATA = [
  {
    question: "What makes SVI Infra Solutions different from other real estate developers?",
    answer: "SVI Infra focuses on strategic locations, government-approved projects, and timely delivery. We ensure clear titles, transparent documentation, and a customer-centric approach that prioritizes long-term appreciation for our investors."
  },
  {
    question: "Are all your projects government approved?",
    answer: "Yes, all our projects undergo rigorous legal and technical due diligence and have the necessary approvals from local development authorities. We believe in 100% transparency."
  },
  {
    question: "Do you provide assistance with home loans?",
    answer: "Absolutely! We have tied up with several leading banks and financial institutions to facilitate smooth and hassle-free home loan processing for our customers."
  },
  {
    question: "Which regions do you primarily operate in?",
    answer: "We are based in Noida, but we strategically operate across expanding regions with high appreciation potential, such as the Phulera Smart City, Jaipur, and the DMIC/DFC corridors in Rajasthan."
  },
  {
    question: "How can I book a property or schedule a site visit?",
    answer: "You can easily schedule a site visit or book a property by filling out the Registration form on our website, or by contacting our sales team directly via phone or email."
  }
];

export default function FAQ() {
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);

  const toggleFaq = useCallback((index: number) => {
    setActiveFaqIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <div className="pt-24 pb-20 bg-brand-bg dark:bg-gray-800 min-h-screen">
      <section className="bg-brand-bg dark:bg-gray-800 py-20 text-center border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif text-brand-navy dark:text-gray-100 mb-6"
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-px bg-brand-gold mx-auto mb-6"
          ></motion.div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Find answers to common questions about our projects and services.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-4">
            {FAQ_DATA.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="font-serif text-xl text-brand-navy dark:text-gray-100 pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: activeFaqIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 text-brand-gold"
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {activeFaqIndex === index ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 pt-2 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700/50">
                        {faq.answer}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="text-gray-600 dark:text-gray-400 mb-6">Still have questions?</p>
            <Link href="/contact" className="inline-flex bg-brand-navy dark:bg-brand-gold text-white dark:text-brand-navy px-8 py-4 font-bold uppercase text-xs tracking-widest transition-colors hover:bg-brand-gold hover:text-brand-navy border border-brand-navy dark:border-brand-gold shadow-md hover:shadow-xl">
              Contact Our Team
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
