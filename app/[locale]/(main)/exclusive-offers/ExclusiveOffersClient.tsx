'use client';

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
    <div className="bg-brand-navy min-h-screen text-white">
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

        <div className="relative z-10 container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Trusted Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold tracking-wider uppercase"
            >
              <Users className="h-4 w-4" />
              <span>Trusted by 1000+ Families</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-8 font-serif text-4xl leading-none font-extrabold tracking-tight text-white uppercase sm:text-5xl md:text-7xl"
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
              <video
                src="/a svi 1.mp4"
                controls
                preload="metadata"
                className="h-full w-full object-cover"
                poster="/images/exclusive_offers_hero.png"
              />
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
                        <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.062 5.248 5.311 0 11.776 0c3.132.001 6.077 1.22 8.29 3.433 2.212 2.214 3.43 5.159 3.43 8.29 0 6.546-5.249 11.796-11.713 11.796-2.007-.001-3.97-.513-5.712-1.488L0 24zm6.49-4.22c1.642.975 3.254 1.486 4.903 1.488 5.4 0 9.794-4.393 9.797-9.793.002-2.616-1.015-5.074-2.862-6.92C16.536 2.709 14.08 1.69 11.47 1.69c-5.41 0-9.81 4.403-9.814 9.813 0 1.77.473 3.497 1.367 5.048L1.923 22.3l6.104-1.602c1.558.85 3.228 1.29 4.903 1.29zM17.56 18.06c-.326-.09-1.534-.757-1.77-.842-.236-.085-.407-.127-.578.127-.17.255-.66.842-.808 1.012-.148.17-.296.19-.622.02-.326-.17-1.378-.508-2.625-1.62-1.012-.903-1.694-2.02-1.892-2.36-.198-.34-.02-.523.15-.693.153-.153.326-.382.49-.573.163-.19.217-.327.326-.546.109-.218.055-.41-.027-.58-.083-.17-.707-1.702-.97-2.336-.256-.617-.516-.533-.707-.543-.183-.009-.393-.01-.602-.01-.209 0-.55.078-.838.393-.287.315-1.096 1.072-1.096 2.616 0 1.544 1.123 3.036 1.277 3.248.154.212 2.21 3.376 5.353 4.733.747.323 1.33.516 1.784.66.75.238 1.433.204 1.973.123.6-.09 1.534-.627 1.77-1.233.236-.607.236-1.127.165-1.23-.07-.105-.255-.17-.58-.327z" />
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
