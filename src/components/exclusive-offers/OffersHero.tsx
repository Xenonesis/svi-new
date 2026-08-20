'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Calculator, Coins } from 'lucide-react';
import Image from 'next/image';

interface OffersHeroProps {
  description: string;
}

const RATES: Record<string, number> = {
  '100 SQ. YRD.': 0.07,
  '200 SQ. YRD.': 0.1,
  '300 SQ. YRD.': 0.12,
  '500 SQ. YRD.': 0.15,
};

export function OffersHero({ description }: OffersHeroProps) {
  const [selectedSize, setSelectedSize] = useState('200 SQ. YRD.');
  const [plotValue, setPlotValue] = useState(4000000); // ₹40 Lakhs default

  const commissionRate = RATES[selectedSize] || 0.07;
  const estimatedCommission = plotValue * commissionRate;

  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <section className="relative flex min-h-[90dvh] items-center justify-start overflow-hidden pt-28 pb-16">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/exclusive_offers_hero.png"
          alt="SVI Infra premium land plot development"
          fill
          priority
          className="object-cover object-center opacity-40"
          quality={95}
        />
        <div className="from-brand-navy via-brand-navy/90 to-brand-navy/60 absolute inset-0 bg-gradient-to-r" />
        <div className="from-brand-navy to-brand-navy/50 absolute inset-0 bg-gradient-to-t via-transparent" />
      </div>

      <div className="relative z-10 container mx-auto w-full px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Headline & Subtitles */}
          <div className="flex max-w-3xl flex-col justify-center lg:col-span-7">
            {/* Trusted Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold inline-flex w-fit items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold tracking-wider uppercase"
            >
              <Users className="h-4 w-4" />
              <span>Trusted by 1000+ Families</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-8 font-serif text-4xl leading-none font-extrabold tracking-tight text-white uppercase sm:text-5xl md:text-6xl xl:text-7xl"
            >
              Earn More <br />
              <span className="text-brand-gold">Grow Together</span>
            </motion.h1>

            {/* Subtitles */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="border-brand-gold mt-6 border-l-2 pl-4 text-sm font-semibold tracking-[0.25em] text-gray-300 uppercase sm:text-base"
            >
              {description}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-brand-gold mt-4 font-sans text-base font-bold sm:text-lg"
            >
              BETTER PLOTS. HIGHER RETURNS. BIGGER BENEFITS FOR BROKERS.
            </motion.p>

            {/* CTA Arrow Down */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-12"
            >
              <a
                href="#benefits"
                className="hover:bg-brand-gold/20 border-brand-gold text-brand-gold inline-flex items-center justify-center rounded-full border px-6 py-3 text-xs font-bold tracking-widest uppercase transition-all hover:scale-105"
              >
                Explore Exclusive Offers
              </a>
            </motion.div>
          </div>

          {/* Right Column: Interactive Calculator Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full lg:col-span-5"
          >
            <div className="border-brand-gold/30 relative overflow-hidden rounded-2xl border bg-slate-900/80 p-6 shadow-2xl backdrop-blur-md sm:p-8">
              {/* Gold Highlight Border Top */}
              <div className="via-brand-gold absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent to-transparent" />

              <div className="mb-6 flex items-center gap-2.5">
                <div className="bg-brand-gold/10 border-brand-gold/20 flex h-10 w-10 items-center justify-center rounded-lg border">
                  <Calculator className="text-brand-gold h-5 w-5" />
                </div>
                <div>
                  <span className="text-brand-gold block text-[10px] font-bold tracking-[0.2em] uppercase">
                    Broker Utility
                  </span>
                  <h3 className="font-serif text-lg leading-tight font-bold text-white">
                    Commission Estimator
                  </h3>
                </div>
              </div>

              <div className="space-y-6">
                {/* Size selector tabs */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Select Plot Size
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(RATES).map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`rounded-lg border px-3 py-2 text-xs font-bold transition-all duration-300 ${
                          selectedSize === size
                            ? 'bg-brand-gold border-brand-gold text-brand-navy shadow-brand-gold/20 shadow-lg'
                            : 'hover:border-brand-gold/40 border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Value Range Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-gray-400">
                    <span className="tracking-wider uppercase">Est. Sale Value</span>
                    <span className="text-brand-gold font-sans text-sm font-bold">
                      {formatINR(plotValue)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1000000}
                    max={15000000}
                    step={500000}
                    value={plotValue}
                    onChange={(e) => setPlotValue(Number(e.target.value))}
                    className="accent-brand-gold h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 outline-none"
                  />
                  <div className="flex justify-between text-[10px] font-bold tracking-wider text-gray-500">
                    <span>₹10 LAKH</span>
                    <span>₹1.5 CRORE</span>
                  </div>
                </div>

                {/* Progress towards max tier */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                    <span>Commission Tier Progress</span>
                    <span className="text-white">{(commissionRate * 100).toFixed(0)}% Rate</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full border border-white/5 bg-white/5">
                    <div
                      className="from-brand-gold/50 to-brand-gold h-full rounded-full bg-gradient-to-r transition-all duration-500"
                      style={{ width: `${(commissionRate / 0.15) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Results box */}
                <div className="bg-brand-gold/5 border-brand-gold/20 rounded-xl border p-4 text-center">
                  <span className="mb-1 block text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Estimated Broker Payout
                  </span>
                  <span className="text-brand-gold block font-serif text-3xl font-extrabold tracking-wide transition-all duration-300">
                    {formatINR(estimatedCommission)}
                  </span>
                </div>

                {/* Claim Button */}
                <a
                  href={`https://wa.me/917300007643?text=Hi%20SVI%20Infra,%20I'm%20a%20broker%20interested%20in%20a%20${selectedSize}%20plot%20with%20an%20estimated%20sale%20value%20of%20${formatINR(plotValue)}.%20I'd%20like%20to%20learn%20more%20about%20earning%20the%20${(commissionRate * 100).toFixed(0)}%25%20commission%20(${formatINR(estimatedCommission)}).`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-brand-gold text-brand-navy hover:bg-brand-gold/90 shadow-brand-gold/10 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold tracking-wider uppercase shadow-lg transition-all hover:scale-[1.02]"
                >
                  <Coins className="h-4.5 w-4.5" />
                  <span>Claim Your Commission</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
