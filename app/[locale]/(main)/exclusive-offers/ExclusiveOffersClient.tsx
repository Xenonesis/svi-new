'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Percent,
  Zap,
  Headphones,
  Handshake,
  MapPin,
  Phone,
  QrCode,
  Award,
  TrendingUp,
  ShieldCheck,
  Building2,
  Star,
  Users,
  Calculator,
  Coins,
} from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export default function ExclusiveOffersClient() {
  const t = useTranslations('pages.exclusiveOffers');
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [selectedSize, setSelectedSize] = useState('200 SQ. YRD.');
  const [plotValue, setPlotValue] = useState(4000000); // ₹40 Lakhs default

  const rates: { [key: string]: number } = {
    '100 SQ. YRD.': 0.07,
    '200 SQ. YRD.': 0.1,
    '300 SQ. YRD.': 0.12,
    '500 SQ. YRD.': 0.15,
  };

  const commissionRate = rates[selectedSize] || 0.07;
  const estimatedCommission = plotValue * commissionRate;

  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const benefits = [
    {
      icon: <Percent className="text-brand-gold h-6 w-6" />,
      title: t('benefitCommissionTitle'),
      desc: t('benefitCommissionDesc'),
    },
    {
      icon: <Zap className="text-brand-gold h-6 w-6" />,
      title: t('benefitPayoutsTitle'),
      desc: t('benefitPayoutsDesc'),
    },
    {
      icon: <Headphones className="text-brand-gold h-6 w-6" />,
      title: t('benefitSupportTitle'),
      desc: t('benefitSupportDesc'),
    },
    {
      icon: <Handshake className="text-brand-gold h-6 w-6" />,
      title: t('benefitAssociationTitle'),
      desc: t('benefitAssociationDesc'),
    },
  ];

  const whyPartner = [
    {
      icon: <MapPin className="text-brand-gold h-5 w-5" />,
      title: t('primeLocations'),
    },
    {
      icon: <TrendingUp className="text-brand-gold h-5 w-5" />,
      title: t('highDemand'),
    },
    {
      icon: <ShieldCheck className="text-brand-gold h-5 w-5" />,
      title: t('clearTitles'),
    },
    {
      icon: <Building2 className="text-brand-gold h-5 w-5" />,
      title: t('trustedDevelopment'),
    },
  ];

  const commissionData = [
    { size: '100 SQ. YRD.', commission: '7%' },
    { size: '200 SQ. YRD.', commission: '10%' },
    { size: '300 SQ. YRD.', commission: '12%' },
    { size: '500 SQ. YRD.', commission: '15%' },
  ];

  return (
    <div className="bg-brand-navy min-h-screen text-white" suppressHydrationWarning>
      {/* Hero Section */}
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
                {t('description')}
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
                      {Object.keys(rates).map((size) => (
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

      {/* Video Showcase / Virtual Tour Section */}
      <section className="bg-brand-navy border-t border-white/5 py-24">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <div className="border-brand-gold/20 bg-brand-gold/5 text-brand-gold mb-6 inline-flex w-fit items-center gap-2 rounded-lg border px-3 py-1 text-xs font-bold tracking-widest uppercase">
              <span>{t('videoSectionTitle')}</span>
            </div>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t('videoSectionHeading')}
            </h2>
            <p className="mt-4 text-gray-400">{t('videoSectionDesc')}</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="border-brand-gold/30 relative mx-auto max-w-5xl overflow-hidden rounded-2xl border bg-slate-900 shadow-2xl"
          >
            {/* Gold Highlight Border Top */}
            <div className="via-brand-gold absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-transparent to-transparent" />

            <div className="relative aspect-video w-full">
              {isMounted ? (
                <video
                  src="/a svi 1.mp4"
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                  poster="/images/exclusive_offers_hero.png"
                />
              ) : (
                <div
                  className="h-full w-full bg-slate-900"
                  style={{
                    backgroundImage: 'url(/images/exclusive_offers_hero.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits & Commission Grid Section */}
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
                {t('brokerBenefitsTitle')}
              </h2>
              <p className="mt-4 max-w-md text-gray-400">{t('brokerBenefitsSubtitle')}</p>

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
                      <h3 className="font-serif text-lg font-semibold text-white">
                        {benefit.title}
                      </h3>
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
                    {t('commissionStructureSubtitle')}
                  </h3>

                  {/* Example Box */}
                  <div className="bg-brand-gold/10 border-brand-gold/20 mt-4 rounded-lg border p-3 text-xs text-gray-300 sm:text-sm">
                    <span className="text-brand-gold font-semibold">Example: </span>
                    {t('commissionExample')}
                  </div>
                </div>

                {/* Table */}
                <div className="mt-8 overflow-hidden rounded-xl border border-white/10">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="text-brand-gold px-6 py-4 font-serif text-sm font-bold tracking-wider uppercase">
                          {t('plotSize')}
                        </th>
                        <th className="text-brand-gold px-6 py-4 text-right font-serif text-sm font-bold tracking-wider uppercase">
                          {t('commission')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {commissionData.map((row, index) => (
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
                    {t('moreSizeMoreCommission')}
                  </span>
                  <Star className="text-brand-gold fill-brand-gold h-4 w-4" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Partner with SVI? Section */}
      <section className="border-t border-white/5 bg-slate-900/50 py-24">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t('whyPartnerTitle')}
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
                &ldquo;{t('quoteText')}&rdquo;
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Call to Action Section */}
      <section className="bg-brand-navy border-t border-white/5 py-24">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="border-brand-gold/30 relative overflow-hidden rounded-3xl border bg-slate-900 shadow-2xl">
              <div className="relative z-10 p-8 sm:p-12 md:p-16">
                <div className="text-center">
                  <h2 className="font-serif text-3xl font-extrabold tracking-tight text-white uppercase sm:text-5xl">
                    {t('footerTitle')}
                  </h2>
                  <p className="text-brand-gold mt-4 font-sans text-sm font-bold tracking-widest uppercase">
                    {t('contactUsForDeals')}
                  </p>
                </div>

                {/* Call / WhatsApp & QR Grid */}
                <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-12">
                  {/* Left Column: Direct Action Contacts */}
                  <div className="flex flex-col justify-between gap-6 md:col-span-8">
                    {/* Call Card */}
                    <a
                      href="tel:7300007643"
                      className="hover:border-brand-gold/50 flex items-center gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:scale-[1.02]"
                    >
                      <div className="bg-brand-gold text-brand-navy flex h-14 w-14 shrink-0 items-center justify-center rounded-xl">
                        <Phone className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold tracking-wider text-gray-400 uppercase">
                          {t('callWhatsapp')}
                        </span>
                        <span className="text-xl font-bold tracking-wide text-white sm:text-2xl">
                          +91 73000 07643
                        </span>
                      </div>
                    </a>

                    {/* WhatsApp Card */}
                    <a
                      href="https://wa.me/917300007643"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-5 rounded-2xl border border-white/10 bg-[#075e54]/10 p-5 transition-all hover:scale-[1.02] hover:border-[#25d366]/50"
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#25d366] text-white">
                        <svg
                          className="h-6 w-6 fill-current"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold tracking-wider text-gray-400 uppercase">
                          Instant Connect
                        </span>
                        <span className="text-xl font-bold tracking-wide text-white sm:text-2xl">
                          WhatsApp SVI Team
                        </span>
                      </div>
                    </a>
                  </div>

                  {/* Right Column: QR Code scanning card */}
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 text-center md:col-span-4">
                    <div className="border-brand-gold/20 relative mb-3 flex h-24 w-24 items-center justify-center rounded-lg border bg-[#0f172a] p-1.5">
                      {}
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://www.sviinfrasolutions.com&color=d4af37&bgcolor=0f172a"
                        alt="SVI Infra Website QR Code"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <span className="text-brand-gold mb-1 block text-xs font-semibold tracking-widest uppercase">
                      SCAN QR CODE
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Scan to visit our official website and explore more maps
                    </span>
                  </div>
                </div>

                {/* Strategic Locations & Socials footer inside card */}
                <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row">
                  {/* Locations */}
                  <div className="flex items-start gap-3">
                    <MapPin className="text-brand-gold mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                      <span className="block text-xs tracking-wider text-gray-400 uppercase">
                        {t('locationsTitle')}
                      </span>
                      <span className="text-sm font-semibold text-white">{t('locationsList')}</span>
                    </div>
                  </div>

                  {/* Social Handles */}
                  <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                    <a
                      href="https://facebook.com/sviinfrasolutions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:border-brand-gold/40 hover:text-brand-gold flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-colors"
                      title="SVI Infra Solutions on Facebook"
                    >
                      <FacebookIcon className="h-4.5 w-4.5 shrink-0" />
                      <span className="font-sans text-xs font-semibold whitespace-nowrap">
                        SVI Infra Solutions
                      </span>
                    </a>
                    <a
                      href="https://instagram.com/sviinfrasolutions_official"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:border-brand-gold/40 hover:text-brand-gold flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-colors"
                      title="sviinfrasolutions_official on Instagram"
                    >
                      <InstagramIcon className="h-4.5 w-4.5 shrink-0" />
                      <span className="font-sans text-xs font-semibold whitespace-nowrap">
                        sviinfrasolutions_official
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
