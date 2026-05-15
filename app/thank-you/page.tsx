"use client";

import { motion } from 'motion/react';
import Link from 'next/link';
import { CheckCircle, Home } from 'lucide-react';

const GRADIENT_STYLE = { backgroundImage: 'repeating-linear-gradient(45deg, #1a2744 0, #1a2744 1px, transparent 0, transparent 50%)', backgroundSize: '40px 40px' };

export default function ThankYou() {
  return (
    <div className="pt-24 min-h-screen flex items-center justify-center bg-brand-bg dark:bg-gray-900 py-20 relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={GRADIENT_STYLE}></div>
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="bg-white dark:bg-gray-800 p-16 max-w-2xl mx-auto shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 border border-brand-gold text-brand-gold flex items-center justify-center mx-auto mb-10 shadow-sm"
          >
            <CheckCircle size={40} />
          </motion.div>

          <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 dark:text-gray-500 mb-4">Submission Complete</h4>
          <h1 className="text-4xl md:text-5xl font-serif text-brand-navy dark:text-gray-100 mb-6">Thank You!</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-12 leading-relaxed">
            Your registration has been successfully submitted. One of our property experts will reach out to you shortly.
          </p>

          <Link
            href="/"
            className="bg-brand-navy hover:bg-brand-gold text-brand-gold hover:text-brand-navy font-bold uppercase text-xs tracking-widest px-8 py-4 transition-colors flex items-center justify-center gap-3 border border-brand-navy inline-flex w-full sm:w-auto"
          >
            <Home size={16} />
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
