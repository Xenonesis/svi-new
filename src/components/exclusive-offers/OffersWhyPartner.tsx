'use client';

import { motion } from 'motion/react';
import { MapPin, TrendingUp, ShieldCheck, Building2 } from 'lucide-react';

interface OffersWhyPartnerProps {
  whyPartnerTitle: string;
  primeLocations: string;
  highDemand: string;
  clearTitles: string;
  trustedDevelopment: string;
  quoteText: string;
}

export function OffersWhyPartner({
  whyPartnerTitle,
  primeLocations,
  highDemand,
  clearTitles,
  trustedDevelopment,
  quoteText,
}: OffersWhyPartnerProps) {
  const whyPartner = [
    {
      icon: <MapPin className="text-brand-gold h-5 w-5" />,
      title: primeLocations,
    },
    {
      icon: <TrendingUp className="text-brand-gold h-5 w-5" />,
      title: highDemand,
    },
    {
      icon: <ShieldCheck className="text-brand-gold h-5 w-5" />,
      title: clearTitles,
    },
    {
      icon: <Building2 className="text-brand-gold h-5 w-5" />,
      title: trustedDevelopment,
    },
  ];

  return (
    <section className="border-t border-white/5 bg-slate-900/50 py-24">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {whyPartnerTitle}
          </h2>
          <div className="bg-brand-gold mx-auto mt-4 h-0.5 w-12" />
        </div>

        {/* Core Values Grid */}
        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {whyPartner.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-brand-navy/60 hover:border-brand-gold/30 flex flex-col items-center justify-center rounded-xl border border-white/5 p-6 text-center transition-all duration-300"
            >
              <div className="bg-brand-gold/10 border-brand-gold/20 mb-4 flex h-12 w-12 items-center justify-center rounded-full border">
                {item.icon}
              </div>
              <h3 className="font-serif text-sm font-bold tracking-wider text-white uppercase">
                {item.title}
              </h3>
            </motion.div>
          ))}
        </div>

        {/* Elegant Quote block */}
        <div className="mt-20 flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="border-brand-gold bg-brand-navy max-w-2xl border-l-4 px-6 py-4 shadow-xl"
          >
            <p className="font-serif text-lg text-gray-300 italic md:text-xl">
              &ldquo;{quoteText}&rdquo;
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
