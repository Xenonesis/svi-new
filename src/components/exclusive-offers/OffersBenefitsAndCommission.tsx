'use client';

import { motion } from 'motion/react';
import { Award, Percent, Zap, Headphones, Handshake, Star } from 'lucide-react';

interface BenefitItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

interface OffersBenefitsAndCommissionProps {
  benefitsTitle: string;
  benefitsSubtitle: string;
  commissionSubtitle: string;
  commissionExample: string;
  plotSizeHeader: string;
  commissionHeader: string;
  moreSizeMoreCommission: string;
  benefitCommissionTitle: string;
  benefitCommissionDesc: string;
  benefitPayoutsTitle: string;
  benefitPayoutsDesc: string;
  benefitSupportTitle: string;
  benefitSupportDesc: string;
  benefitAssociationTitle: string;
  benefitAssociationDesc: string;
}

const COMMISSION_DATA = [
  { size: '100 SQ. YRD.', commission: '7%' },
  { size: '200 SQ. YRD.', commission: '10%' },
  { size: '300 SQ. YRD.', commission: '12%' },
  { size: '500 SQ. YRD.', commission: '15%' },
];

export function OffersBenefitsAndCommission({
  benefitsTitle,
  benefitsSubtitle,
  commissionSubtitle,
  commissionExample,
  plotSizeHeader,
  commissionHeader,
  moreSizeMoreCommission,
  benefitCommissionTitle,
  benefitCommissionDesc,
  benefitPayoutsTitle,
  benefitPayoutsDesc,
  benefitSupportTitle,
  benefitSupportDesc,
  benefitAssociationTitle,
  benefitAssociationDesc,
}: OffersBenefitsAndCommissionProps) {
  const benefits: BenefitItem[] = [
    {
      icon: <Percent className="text-brand-gold h-6 w-6" />,
      title: benefitCommissionTitle,
      desc: benefitCommissionDesc,
    },
    {
      icon: <Zap className="text-brand-gold h-6 w-6" />,
      title: benefitPayoutsTitle,
      desc: benefitPayoutsDesc,
    },
    {
      icon: <Headphones className="text-brand-gold h-6 w-6" />,
      title: benefitSupportTitle,
      desc: benefitSupportDesc,
    },
    {
      icon: <Handshake className="text-brand-gold h-6 w-6" />,
      title: benefitAssociationTitle,
      desc: benefitAssociationDesc,
    },
  ];

  return (
    <section id="benefits" className="bg-brand-navy relative z-10 border-t border-white/5 py-24">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left side: Exclusive Benefits for Brokers */}
          <div className="flex flex-col justify-center lg:col-span-5">
            <div className="border-brand-gold/20 bg-brand-gold/5 text-brand-gold mb-6 inline-flex w-fit items-center gap-2 rounded-lg border px-3 py-1 text-xs font-bold tracking-widest uppercase">
              <Award className="h-4 w-4" />
              <span>Broker Rewards</span>
            </div>

            <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              {benefitsTitle}
            </h2>
            <p className="mt-4 max-w-md text-gray-400">{benefitsSubtitle}</p>

            {/* Benefits list */}
            <div className="mt-10 space-y-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -25 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="hover:border-brand-gold/30 flex items-start gap-4 rounded-xl border border-white/5 bg-white/5 p-4 transition-all duration-300 hover:bg-white/10"
                >
                  <div className="bg-brand-gold/10 border-brand-gold/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-white">{benefit.title}</h3>
                    <p className="mt-1 text-sm text-gray-400">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right side: Commission Structure Table Card */}
          <div className="flex flex-col justify-center lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="border-brand-gold/30 shadow-brand-gold/5 relative overflow-hidden rounded-2xl border bg-slate-900/80 p-6 shadow-2xl backdrop-blur-md sm:p-10"
            >
              {/* Gold Highlight Border Top */}
              <div className="via-brand-gold absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent to-transparent" />

              {/* Table Header Callout */}
              <div className="text-center">
                <h3 className="text-brand-gold font-sans text-xs font-bold tracking-[0.2em] uppercase">
                  {commissionSubtitle}
                </h3>

                {/* Example Box */}
                <div className="bg-brand-gold/10 border-brand-gold/20 mt-4 rounded-lg border p-3 text-xs text-gray-300 sm:text-sm">
                  <span className="text-brand-gold font-semibold">Example: </span>
                  {commissionExample}
                </div>
              </div>

              {/* Table */}
              <div className="mt-8 overflow-hidden rounded-xl border border-white/10">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="text-brand-gold px-6 py-4 font-serif text-sm font-bold tracking-wider uppercase">
                        {plotSizeHeader}
                      </th>
                      <th className="text-brand-gold px-6 py-4 text-right font-serif text-sm font-bold tracking-wider uppercase">
                        {commissionHeader}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {COMMISSION_DATA.map((row, index) => (
                      <tr key={index} className="hover:bg-brand-gold/5 group transition-colors">
                        <td className="group-hover:text-brand-gold px-6 py-5 font-sans text-base font-bold text-white transition-colors">
                          {row.size}
                        </td>
                        <td className="text-brand-gold px-6 py-5 text-right font-serif text-2xl font-bold">
                          {row.commission}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer Banner */}
              <div className="mt-8 flex items-center justify-center gap-2 border-t border-white/5 pt-6">
                <Star className="text-brand-gold fill-brand-gold h-4 w-4" />
                <span className="text-brand-gold font-serif text-sm font-semibold tracking-widest uppercase">
                  {moreSizeMoreCommission}
                </span>
                <Star className="text-brand-gold fill-brand-gold h-4 w-4" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
