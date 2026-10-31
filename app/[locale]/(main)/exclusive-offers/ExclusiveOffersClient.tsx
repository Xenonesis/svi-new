'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Sparkles,
  MapPin,
  Gift,
  Coins,
  Tv,
  CheckCircle2,
  Calendar,
  Phone,
  MessageCircle,
  Car,
  ShieldCheck,
  FileText,
  Compass,
  ArrowRight,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

const REWARD_CARDS = [
  {
    icon: Gift,
    badge: 'Mega Bumper Reward',
    title: 'FREE SCOOTY on Plot Registry',
    subtitle: 'Plot ki registry par brand new Scooty paane ka sunahra mauka!',
    desc: 'Complete your plot registry during this festive Diwali season and take home a brand-new Scooty to celebrate with your family.',
    tag: 'Guaranteed on Registry',
    accent: 'from-amber-500 to-amber-700',
  },
  {
    icon: Coins,
    badge: 'Auspicious Dhanteras & Diwali',
    title: 'Pure Gold Coin on Spot Booking',
    subtitle: 'Lakshmi-Ganesh 24K Gold Coin',
    desc: 'Bring home auspicious blessings of wealth and prosperity with a certified gold coin gift handed over on your festive token booking.',
    tag: 'Spot Booking Gift',
    accent: 'from-yellow-400 to-amber-600',
  },
  {
    icon: Tv,
    badge: 'Festive Celebration',
    title: 'Exciting Home Electronics Hamper',
    subtitle: 'Smart LED TV / Refrigerator / Microwave',
    desc: 'Premium home appliances hamper to brighten your new plot investment, delivered with complete documentation.',
    tag: 'Festival Bonus',
    accent: 'from-amber-600 to-yellow-600',
  },
];

const TOWNSHIP_FEATURES = [
  {
    icon: ShieldCheck,
    title: '100% Clear Titles & Instant Registry',
    desc: 'Direct sub-registrar office registry with prompt mutation (dastawez). Fully verified and safe ownership.',
  },
  {
    icon: Compass,
    title: 'Near Sacred Khatu Shyam Ji Dham',
    desc: 'Prime strategic location in Rajasthan on the direct pilgrim & highway corridor with rapid land appreciation.',
  },
  {
    icon: Car,
    title: 'Wide 30ft & 40ft Paver Roads',
    desc: 'Blacktop metal and concrete paver internal roads with underground electrification and street lighting.',
  },
  {
    icon: FileText,
    title: 'Gated Township & Boundary Wall',
    desc: 'Secured perimeter with grand entrance archway, CCTV surveillance provisions, and dedicated security guards.',
  },
];

const PROJECT_GALLERY = [
  {
    src: '/Shivani Vatika 11/gate.webp',
    title: 'Grand Entrance Archway',
    alt: 'Shivani Vatika 11th Grand Entrance Arch',
  },
  {
    src: '/Shivani Vatika 11/plot.webp',
    title: 'Demarcated Plots & Roads',
    alt: 'Shivani Vatika 11th Plot Demarcation',
  },
  {
    src: '/Shivani Vatika 11/middle2.webp',
    title: 'Wide Internal Sector Roads',
    alt: 'Shivani Vatika 11th Internal Road',
  },
  {
    src: '/Shivani Vatika 11/middle3.webp',
    title: 'Township Landscaping',
    alt: 'Shivani Vatika 11th Greenery & Campus',
  },
];

const FAQS = [
  {
    q: 'What is the Free Scooty Diwali Offer on Shivani Vatika 11th?',
    a: 'As part of our Diwali festive celebration, clients completing their plot registry during the festive promotion period are eligible to receive a brand-new Scooty voucher / reward along with festive gift hampers (T&C apply based on plot size and payment schedules).',
  },
  {
    q: 'How does the Free AC Cab Site Visit work for Delhi NCR & Noida buyers?',
    a: 'We offer complimentary doorstep pickup and drop in a comfortable luxury AC cab from anywhere in Delhi, Noida, Gurgaon, or Ghaziabad. Our relationship manager accompanies your family for the site inspection and darshan assistance at Khatu Shyam Ji.',
  },
  {
    q: 'Are plots in Shivani Vatika 11th ready for immediate registry?',
    a: 'Yes, 100%. All plots have clear titles, clean legal documentation, and are available for immediate sub-registrar registry and mutation.',
  },
  {
    q: 'What plot sizes are available in Shivani Vatika 11th?',
    a: 'Residential plot sizes range typically from 100 sq. yds, 150 sq. yds, 200 sq. yds, up to 300+ sq. yds, including prime corner and park-facing plots.',
  },
  {
    q: 'How can I connect immediately for enquiry?',
    a: 'You can directly call our official helpline at +91 73000 07643 or message us on WhatsApp with 1-click.',
  },
];

export default function ExclusiveOffersClient() {
  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    city: 'Delhi NCR',
    plot_size: '100 SQ. YRD.',
    preferred_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formState.name.trim() || !formState.phone.trim()) {
      setErrorMsg('Please enter your name and phone number.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/site-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formState.name.trim(),
          phone: formState.phone.trim(),
          email: `${formState.phone.trim()}@sviinfrasolutions.com`,
          project_interest: `Shivani Vatika 11th - Diwali Offer (Free Scooty) [City: ${formState.city}, Size: ${formState.plot_size}]`,
          preferred_date: formState.preferred_date || new Date().toISOString().split('T')[0],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Submission failed. Please call us directly.');
      }

      setSubmitted(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Something went wrong. Please call helpline.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const whatsappUrl = `https://wa.me/917300007643?text=${encodeURIComponent(
    'Namaste SVI Infra, I am interested in Shivani Vatika 11th Diwali Special Offer (Free Scooty on Registry). Please share offer details and free site visit cab availability for Delhi NCR.'
  )}`;

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-amber-500 selection:text-slate-950">
      {/* 1. Festive Top Notification Bar */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-md sm:text-sm">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded bg-slate-950 px-2 py-0.5 text-[11px] font-bold tracking-wider text-amber-400 uppercase">
              <Sparkles className="h-3 w-3 animate-spin text-amber-400" />
              Diwali Special
            </span>
            <span>
              <strong>SHIVANI VATIKA 11TH:</strong> Plot ki registry par{' '}
              <strong>FREE SCOOTY</strong> aur exciting gifts!
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="hidden font-medium text-slate-900 md:inline">
              Delhi NCR &amp; Noida enquiries welcome
            </span>
            <Link
              href="/old-exclusive-offers"
              className="inline-flex items-center gap-1 font-bold underline transition-colors hover:text-white"
            >
              Broker / Partner Offers <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Hero Section */}
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden pt-24 pb-16">
        {/* Background Image with Deep Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/Shivani Vatika 11/gate.webp"
            alt="Shivani Vatika 11th Grand Entrance"
            fill
            priority
            className="scale-105 object-cover object-center brightness-50 filter"
            quality={95}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/50" />
          <div className="bg-radial-gradient absolute inset-0 from-transparent via-slate-950/60 to-slate-950" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Project & Offer Pills */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 inline-flex flex-wrap items-center justify-center gap-2"
            >
              <span className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold tracking-widest text-amber-400 uppercase backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Special Diwali Offer 2026
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-slate-200 backdrop-blur-md">
                <MapPin className="h-3.5 w-3.5 text-amber-400" />
                Near Khatu Shyam Ji, Rajasthan
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-serif text-4xl leading-[1.1] font-extrabold tracking-tight text-white uppercase sm:text-5xl md:text-6xl lg:text-7xl"
            >
              This Diwali, Apne <br />
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                Dream Plot
              </span>{' '}
              Ka Plan Banayein!
            </motion.h1>

            {/* Hook: Scooty & Gifts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-6 inline-block max-w-2xl rounded-xl border-y border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-amber-500/30 to-amber-500/20 px-6 py-4 backdrop-blur-md"
            >
              <p className="text-lg font-bold text-amber-300 sm:text-xl md:text-2xl">
                🎁 SHIVANI VATIKA 11TH Special Diwali Bumper
              </p>
              <p className="mt-1 text-sm font-medium text-slate-200 sm:text-base">
                Plot ki registry par{' '}
                <strong className="text-white underline decoration-amber-400">FREE SCOOTY</strong>{' '}
                aur exciting gifts paane ka sunahra mauka!
              </p>
            </motion.div>

            {/* Delhi & Noida Special Callout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300 sm:text-sm"
            >
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5">
                <Car className="h-4 w-4 text-amber-400" />
                Delhi &amp; Noida enquiries welcome
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Complimentary Doorstep AC Cab Site Visit
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5">
                <FileText className="h-4 w-4 text-amber-400" />
                Immediate Registry &amp; Mutation
              </span>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <a
                href="#claim-offer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 px-8 py-4 text-sm font-bold text-slate-950 shadow-xl shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-yellow-400 active:scale-95 sm:text-base"
              >
                <span>Claim Diwali Offer / Site Visit</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-600/90 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-900/30 transition-all hover:bg-emerald-600 active:scale-95 sm:text-base"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Enquiry</span>
              </a>

              <a
                href="tel:+917300007643"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-6 py-4 text-sm font-semibold text-slate-200 transition-all hover:bg-slate-800 active:scale-95 sm:text-base"
              >
                <Phone className="h-4 w-4 text-amber-400" />
                <span>+91 73000 07643</span>
              </a>
            </motion.div>

            <p className="mt-4 text-xs text-slate-400">
              *T&amp;C apply. Offer eligibility aur conditions confirm karein. Limited period
              festive window.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Bumper Rewards Showcase Grid */}
      <section className="relative border-t border-slate-800 bg-slate-900 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold tracking-widest text-amber-400 uppercase">
              Festive Gifting Tiers
            </span>
            <h2 className="mt-4 font-serif text-3xl font-bold text-white sm:text-4xl">
              Diwali Bumper Rewards for Your Family
            </h2>
            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              Shivani Vatika 11th me plot lene par apko milenge guaranteed festive uphar aur grand
              celebrations.
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
            {REWARD_CARDS.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950 p-7 shadow-xl transition-all hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/5"
                >
                  <div
                    className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r ${card.accent}`}
                  />

                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400 transition-transform group-hover:scale-110">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-400">
                        {card.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white transition-colors group-hover:text-amber-300">
                      {card.title}
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-amber-400/90">{card.subtitle}</p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">{card.desc}</p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      {card.tag}
                    </span>
                    <a
                      href="#claim-offer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300"
                    >
                      Avail Offer <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <p className="mx-auto max-w-2xl text-xs text-slate-400">
              *T&amp;C Apply: Free Scooty is provided on completion of plot registry in Shivani
              Vatika 11th under this Diwali promotional window. Eligibility subject to plot
              dimensions and timely installment milestones.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Project Highlights & Real Infrastructure */}
      <section className="border-t border-slate-800 bg-slate-950 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left Column: Information */}
            <div className="lg:col-span-6">
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold tracking-widest text-amber-400 uppercase">
                Flagship Plotted Township
              </span>
              <h2 className="mt-4 font-serif text-3xl leading-tight font-bold text-white sm:text-4xl">
                Shivani Vatika 11th <br />
                <span className="font-sans text-2xl font-semibold text-amber-400 sm:text-3xl">
                  Near Khatu Shyam Ji, Rajasthan
                </span>
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                A premier gated residential development nestled in the auspicious and
                high-appreciation Khatu Shyam Ji corridor. Designed with wide internal roads, grand
                entrance, and peaceful environment for long-term family security and retirement
                living.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {TOWNSHIP_FEATURES.map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <div
                      key={idx}
                      className="flex flex-col justify-start rounded-xl border border-slate-800 bg-slate-900 p-4"
                    >
                      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white">{feat.title}</h4>
                      <p className="mt-1 text-xs leading-normal text-slate-400">{feat.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="/Shivani Vatika 11/ShivaniVatika 11.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-slate-900 px-5 py-3 text-xs font-bold tracking-wider text-amber-400 uppercase transition-colors hover:bg-slate-800"
                >
                  <FileText className="h-4 w-4" />
                  <span>Download Project Brochure (PDF)</span>
                </a>
              </div>
            </div>

            {/* Right Column: Real On-Ground Photos */}
            <div className="grid grid-cols-2 gap-4 lg:col-span-6">
              {PROJECT_GALLERY.map((item, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-800"
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute right-2 bottom-2 left-2">
                    <span className="inline-block rounded bg-slate-950/80 px-2 py-1 text-[11px] font-medium text-slate-200 backdrop-blur-sm">
                      {item.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Delhi NCR Doorstep AC Cab VIP Site Visit Program */}
      <section className="border-t border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-amber-500/30 bg-slate-950 p-8 shadow-2xl sm:p-12">
            <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl" />

            <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold tracking-wider text-amber-400 uppercase">
                  <Car className="h-3.5 w-3.5" />
                  Doorstep Facility for Delhi &amp; Noida Buyers
                </span>
                <h3 className="mt-4 font-serif text-2xl font-bold text-white sm:text-3xl">
                  Free AC Cab Site Visit from Delhi NCR
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
                  Aapke pure parivaar ke liye comfortable AC cab pickup aur drop bilkul muft.
                  Project layout inspection ke sath Khatu Shyam Ji darshan ka shubh awsar.
                </p>

                <div className="mt-6 space-y-2 text-xs text-slate-300 sm:text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                    <span>Doorstep Pickup from your home in Delhi, Noida, or Gurgaon</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                    <span>
                      Personal Relationship Advisor for layout demarcation &amp; map inspection
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                    <span>Zero obligation, transparent registry documentation review</span>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto">
                <a
                  href="#claim-offer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Free Cab Visit</span>
                </a>
                <a
                  href="tel:+917300007643"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-3.5 text-sm font-semibold text-slate-200 transition-all hover:border-slate-500"
                >
                  <Phone className="h-4 w-4 text-amber-400" />
                  <span>Call: +91 73000 07643</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Lead Capture & Site Visit Booking Form */}
      <section
        id="claim-offer"
        className="relative scroll-mt-20 border-t border-slate-800 bg-slate-950 py-20"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="mb-10 text-center">
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold tracking-widest text-amber-400 uppercase">
                Enquiry &amp; Booking
              </span>
              <h2 className="mt-4 font-serif text-3xl font-bold text-white">
                Claim Your Diwali Offer &amp; Book Site Visit
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Fill this quick form to reserve your Free Scooty / Festive Gift eligibility on
                Shivani Vatika 11th.
              </p>
            </div>

            <div className="relative rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-10">
              {submitted ? (
                <div className="space-y-4 py-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Thank You! Enquiry Received</h3>
                  <p className="mx-auto max-w-md text-sm text-slate-300">
                    Your Diwali offer request for <strong>Shivani Vatika 11th</strong> has been
                    logged. Our relationship manager will call you shortly to confirm your offer
                    eligibility and site visit schedule.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 pt-4">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-500"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Instant WhatsApp Confirmation</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="rounded-xl border border-slate-800 px-5 py-3 text-xs font-medium text-slate-400 hover:text-white"
                    >
                      Submit Another Query
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {errorMsg && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-medium text-red-400">
                      {errorMsg}
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-300 uppercase">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Sharma"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-300 uppercase">
                      Phone Number (Mobile / WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-300 uppercase">
                        Your Location / City
                      </label>
                      <select
                        value={formState.city}
                        onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white transition-colors outline-none focus:border-amber-500"
                      >
                        <option value="Delhi NCR">Delhi NCR</option>
                        <option value="Noida">Noida / Greater Noida</option>
                        <option value="Gurgaon">Gurgaon</option>
                        <option value="Ghaziabad / Faridabad">Ghaziabad / Faridabad</option>
                        <option value="Jaipur">Jaipur</option>
                        <option value="Other">Other City</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-300 uppercase">
                        Preferred Plot Size
                      </label>
                      <select
                        value={formState.plot_size}
                        onChange={(e) => setFormState({ ...formState, plot_size: e.target.value })}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white transition-colors outline-none focus:border-amber-500"
                      >
                        <option value="100 SQ. YRD.">100 Sq. Yards</option>
                        <option value="150 SQ. YRD.">150 Sq. Yards</option>
                        <option value="200 SQ. YRD.">200 Sq. Yards</option>
                        <option value="300+ SQ. YRD.">300+ Sq. Yards</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-300 uppercase">
                      Preferred Date for Free Cab Site Visit (Optional)
                    </label>
                    <input
                      type="date"
                      value={formState.preferred_date}
                      onChange={(e) =>
                        setFormState({ ...formState, preferred_date: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white transition-colors outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 py-4 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 sm:text-base"
                  >
                    {loading ? 'Submitting Enquiry...' : 'Lock My Diwali Offer & Book Free Visit'}
                  </button>

                  <p className="text-center text-[11px] text-slate-400">
                    🔒 Your details are 100% confidential. No spam. SVI Infra official relationship
                    team will contact you.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQs Accordion */}
      <section className="border-t border-slate-800 bg-slate-900 py-20">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold tracking-widest text-amber-400 uppercase">
              Frequently Asked Questions
            </span>
            <h2 className="mt-4 font-serif text-3xl font-bold text-white">
              Got Questions About Shivani Vatika 11th Offer?
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-bold text-white sm:text-base"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 flex-shrink-0 text-amber-400" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${
                      openFaq === idx ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="border-t border-slate-800/60 px-5 pt-4 pb-5 text-xs leading-relaxed text-slate-300 sm:text-sm">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Sticky Bottom Call/WhatsApp Dock (Mobile & Desktop) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-950/95 p-3 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2">
          <a
            href="tel:+917300007643"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-xs font-bold text-white"
          >
            <Phone className="h-3.5 w-3.5 text-amber-400" />
            <span>Call Now</span>
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-3 text-xs font-bold text-white"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>WhatsApp</span>
          </a>
          <a
            href="#claim-offer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-3 py-3 text-xs font-bold text-slate-950"
          >
            <span>Claim Offer</span>
          </a>
        </div>
      </div>
    </div>
  );
}
