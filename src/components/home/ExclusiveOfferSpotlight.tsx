'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Car,
  Clock,
  ArrowRight,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import {
  defaultSpotlightConfig,
  type ExclusiveOfferSpotlightConfig,
} from '@/src/config/exclusiveOfferSpotlight';

function useCountdown(targetDate: string | null) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!targetDate) return;

    const calculate = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

export default function ExclusiveOfferSpotlight() {
  const [config, setConfig] = useState<ExclusiveOfferSpotlightConfig>(defaultSpotlightConfig);
  const [loading, setLoading] = useState(true);
  const timeLeft = useCountdown(config.targetDate);

  useEffect(() => {
    let cancelled = false;

    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/exclusive-offers/spotlight');
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data?.config) {
            setConfig(data.config);
          }
        }
      } catch (err) {
        // Fallback to default
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  // When loading or disabled by admin, render nothing
  if (loading || !config.enabled) {
    return null;
  }

  const cleanPhone = config.phone.replace(/[^0-9]/g, '');

  return (
    <section className="relative overflow-hidden py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-[#d4af37]/35 bg-gradient-to-br from-[#0c1322] via-[#070b14] to-[#04060b] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(212,175,55,0.12)]">
          {/* Subtle background glow effects */}
          <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#d4af37]/10 blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />

          {/* Golden top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

          <div className="relative z-10 p-6 sm:p-10 lg:p-12">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
              {/* Left Column: Offer Details */}
              <div className="lg:col-span-7">
                {/* Festive Badges */}
                <div className="mb-4 flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d4af37]/60 bg-[#d4af37]/15 px-3.5 py-1 text-xs font-bold tracking-wider text-[#d4af37] uppercase shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse text-[#d4af37]" />
                    {config.badge}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                    <MapPin className="h-3 w-3" />
                    Khatu Shyam Ji, Rajasthan
                  </span>
                </div>

                {/* Main Headline */}
                <h2 className="font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
                  {config.title.split('FREE SCOOTY')[0]}
                  <span className="bg-gradient-to-r from-[#ffe58f] via-[#d4af37] to-[#b8860b] bg-clip-text text-transparent">
                    FREE SCOOTY
                  </span>
                  {config.title.split('FREE SCOOTY')[1] || ' & Exciting Gifts!'}
                </h2>

                <p className="mt-2 text-sm font-semibold tracking-wide text-[#d4af37]">
                  {config.subtitle}
                </p>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                  {config.description}
                </p>

                {/* Perks Grid */}
                <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {config.perks.map((perk, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] px-3.5 py-2.5 text-xs font-medium text-slate-200 backdrop-blur-sm transition-colors hover:border-[#d4af37]/30 sm:text-sm"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#d4af37]" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>

                {/* Action CTAs */}
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href={config.primaryCtaLink}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] px-6 py-3.5 text-sm font-bold text-slate-950 shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(212,175,55,0.6)]"
                  >
                    <span>{config.primaryCtaText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <a
                    href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                      'Hi SVI Infra, I want details regarding Shivani Vatika 11th Diwali Offer & Free Scooty scheme.'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-bold text-white transition-all hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-400"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-400" />
                    <span>WhatsApp Inquiry</span>
                  </a>

                  <a
                    href={`tel:${cleanPhone}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold text-slate-300 transition-colors hover:border-[#d4af37]/40 hover:text-white"
                  >
                    <Phone className="h-4 w-4 text-[#d4af37]" />
                    <span className="hidden sm:inline">{config.phone}</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Visual Card + Countdown + Free Cab Callout */}
              <div className="lg:col-span-5">
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
                  {/* Real Project Banner Thumbnail */}
                  <div className="relative mb-5 h-44 w-full overflow-hidden rounded-xl border border-[#d4af37]/20">
                    <Image
                      src="/Shivani Vatika 11/gate.webp"
                      alt="Shivani Vatika 11th Grand Entrance"
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between">
                      <span className="rounded-lg bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                        Shivani Vatika 11th
                      </span>
                      <span className="rounded-lg bg-[#d4af37] px-2.5 py-1 text-[11px] font-bold text-slate-950">
                        Limited Plots Available
                      </span>
                    </div>
                  </div>

                  {/* Festive Countdown Bar */}
                  <div className="rounded-xl border border-[#d4af37]/20 bg-gradient-to-r from-[#d4af37]/10 via-transparent to-[#d4af37]/10 p-3.5 text-center">
                    <div className="mb-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#d4af37]">
                      <Clock className="h-3.5 w-3.5 animate-spin" />
                      <span>Diwali Special Offer Closes In:</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="rounded-lg bg-black/60 p-2">
                        <div className="font-mono text-lg font-bold text-white sm:text-xl">
                          {String(timeLeft.days).padStart(2, '0')}
                        </div>
                        <div className="text-[10px] tracking-wider text-slate-400 uppercase">
                          Days
                        </div>
                      </div>
                      <div className="rounded-lg bg-black/60 p-2">
                        <div className="font-mono text-lg font-bold text-white sm:text-xl">
                          {String(timeLeft.hours).padStart(2, '0')}
                        </div>
                        <div className="text-[10px] tracking-wider text-slate-400 uppercase">
                          Hours
                        </div>
                      </div>
                      <div className="rounded-lg bg-black/60 p-2">
                        <div className="font-mono text-lg font-bold text-white sm:text-xl">
                          {String(timeLeft.minutes).padStart(2, '0')}
                        </div>
                        <div className="text-[10px] tracking-wider text-slate-400 uppercase">
                          Mins
                        </div>
                      </div>
                      <div className="rounded-lg bg-black/60 p-2">
                        <div className="font-mono text-lg font-bold text-[#d4af37] sm:text-xl">
                          {String(timeLeft.seconds).padStart(2, '0')}
                        </div>
                        <div className="text-[10px] tracking-wider text-slate-400 uppercase">
                          Secs
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delhi & Noida Special Assistance Box */}
                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs">
                    <Car className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <div>
                      <span className="font-bold text-emerald-300">
                        Delhi NCR & Noida Residents:
                      </span>{' '}
                      <span className="text-slate-300">
                        Book a complimentary doorstep AC cab visit for your family to visit the site
                        and Khatu Shyam Ji Temple.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
