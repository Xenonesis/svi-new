'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, Search, Building2, MapPin } from 'lucide-react';

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 4,
}));

const QUICK_LINKS = [
  { label: 'Current Projects', href: '/projects/current', icon: Building2 },
  { label: 'Registration', href: '/registration', icon: MapPin },
  { label: 'Contact Us', href: '/contact', icon: Search },
];

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(15);
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (mounted && countdown === 0) {
      router.push('/');
    }
  }, [countdown, mounted, router]);

  const cancelRedirect = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCountdown(0);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-4 py-20 dark:bg-[#0e1628]">
      {/* Animated background grid — subtle in light, faint in dark */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.045]"
        style={{
          backgroundImage: `linear-gradient(rgba(26,39,68,0.9) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26,39,68,0.9) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      {/* Dark mode grid override */}
      <div
        className="pointer-events-none absolute inset-0 hidden opacity-[0.04] dark:block"
        style={{
          backgroundImage: `linear-gradient(rgba(212, 175, 55,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 175, 55,0.8) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(212, 175, 55,0.05) 0%, transparent 70%)',
        }}
      />

      {/* Floating gold particles */}
      {mounted &&
        PARTICLES.map((p) => (
          <div
            key={p.id}
            className="bg-brand-gold pointer-events-none absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: 0.1 + Math.random() * 0.15,
              animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}

      {/* City skyline silhouette */}
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-32 opacity-[0.07] dark:opacity-[0.12]">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="h-full w-full">
          <path
            d="M0,80 L40,80 L40,50 L50,50 L50,30 L60,30 L60,50 L70,50 L70,80
               L120,80 L120,40 L130,40 L130,20 L135,20 L135,10 L140,10 L140,20 L145,20 L145,40 L155,40 L155,80
               L200,80 L200,55 L215,55 L215,80
               L260,80 L260,45 L270,45 L270,25 L280,25 L280,45 L290,45 L290,80
               L340,80 L340,60 L360,60 L360,80
               L420,80 L420,35 L430,35 L430,15 L435,15 L435,5 L440,5 L440,15 L445,15 L445,35 L455,35 L455,80
               L510,80 L510,55 L530,55 L530,80
               L580,80 L580,45 L590,45 L590,25 L600,25 L600,45 L610,45 L610,80
               L660,80 L660,60 L680,60 L680,40 L690,40 L690,60 L700,60 L700,80
               L760,80 L760,50 L775,50 L775,80
               L820,80 L820,35 L830,35 L830,10 L840,10 L840,35 L850,35 L850,80
               L900,80 L900,55 L920,55 L920,80
               L970,80 L970,45 L980,45 L980,80
               L1030,80 L1030,60 L1050,60 L1050,40 L1060,40 L1060,60 L1070,60 L1070,80
               L1130,80 L1130,50 L1145,50 L1145,30 L1155,30 L1155,50 L1165,50 L1165,80
               L1200,80 L1200,120 L0,120 Z"
            className="fill-brand-navy dark:fill-brand-gold"
          />
        </svg>
      </div>

      {/* Main content */}
      <div
        className="relative z-10 mx-auto max-w-2xl text-center"
        style={{ animation: 'slide-in-bottom 0.7s cubic-bezier(0.22,1,0.36,1) both' }}
      >
        {/* Large 404 */}
        <div className="relative mb-4 select-none">
          {/* Light mode */}
          <span
            className="block font-serif text-[120px] leading-none font-bold md:text-[180px] dark:hidden"
            style={{
              background: 'linear-gradient(135deg, #111827 0%, #2a3b61 40%, #d4af37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-4px',
            }}
          >
            404
          </span>
          {/* Dark mode */}
          <span
            className="hidden font-serif text-[120px] leading-none font-bold md:text-[180px] dark:block"
            style={{
              background: 'linear-gradient(135deg, #111827 0%, #2a3b61 50%, #111827 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              WebkitTextStroke: '1px rgba(212, 175, 55,0.3)',
              letterSpacing: '-4px',
            }}
          >
            404
          </span>
          {/* Gold shimmer overlay (both modes) */}
          <span
            className="pointer-events-none absolute inset-0 flex items-center justify-center font-serif text-[120px] leading-none font-bold md:text-[180px]"
            style={{
              background:
                'linear-gradient(135deg, transparent 30%, rgba(212, 175, 55,0.1) 50%, transparent 70%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-4px',
            }}
          >
            404
          </span>
        </div>

        {/* Gold divider */}
        <div className="mx-auto mb-6 flex items-center justify-center gap-3">
          <div className="to-brand-gold h-px w-12 bg-gradient-to-r from-transparent" />
          <div className="bg-brand-gold h-1.5 w-1.5 rotate-45" />
          <div className="to-brand-gold h-px w-12 bg-gradient-to-l from-transparent" />
        </div>

        <p className="text-brand-gold mb-2 text-[10px] font-semibold tracking-[0.25em] uppercase opacity-90">
          Page Not Found
        </p>

        <h1 className="text-brand-navy mb-4 font-serif text-3xl leading-tight md:text-4xl dark:text-white">
          This Address Doesn&apos;t Exist <span className="text-brand-gold italic">...Yet</span>
        </h1>

        <p className="mx-auto mb-4 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          The page you&apos;re looking for may have been moved, renamed, or is still under
          construction — much like the finest properties we build.
        </p>

        <p className="text-brand-gold/80 mb-8 font-serif text-base italic">
          &ldquo;Where Dreams Take Address&rdquo; — but not at this URL.
        </p>

        {/* Countdown */}
        {countdown > 0 && (
          <div className="mb-8 inline-flex flex-col items-center gap-2">
            <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-5 py-2.5 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm">
              {/* Conic progress ring */}
              <div
                className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#d4af37 ${(countdown / 15) * 360}deg, rgba(212, 175, 55,0.1) 0deg)`,
                }}
              >
                <div className="absolute inset-1 rounded-full bg-gray-50 dark:bg-[#0e1628]" />
                <span className="text-brand-gold relative z-10 text-[10px] font-bold">
                  {countdown}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Redirecting to home in{' '}
                <span className="text-brand-navy font-semibold dark:text-white">{countdown}s</span>
              </span>
            </div>
            <button
              onClick={cancelRedirect}
              className="text-[10px] tracking-wider text-gray-400 uppercase underline underline-offset-2 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              Cancel redirect
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            onClick={cancelRedirect}
            className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light hover:shadow-[0_0_24px_rgba(212, 175, 55,0.3)] flex items-center gap-2.5 px-8 py-3.5 text-[11px] font-bold tracking-widest uppercase shadow-lg transition-all"
          >
            <Home size={14} />
            Back to Home
          </Link>
          <Link
            href="/contact"
            onClick={cancelRedirect}
            className="border-brand-navy/30 text-brand-navy hover:border-brand-gold hover:text-brand-gold dark:hover:border-brand-gold/60 flex items-center gap-2.5 border px-8 py-3.5 text-[11px] font-bold tracking-widest uppercase transition-all dark:border-white/20 dark:text-white/80 dark:hover:text-white"
          >
            <ArrowLeft size={14} />
            Contact Support
          </Link>
        </div>

        {/* Quick links */}
        <div className="border-t border-gray-200 pt-8 dark:border-white/10">
          <p className="mb-4 text-[10px] font-semibold tracking-widest text-gray-400 uppercase dark:text-gray-500">
            You might be looking for
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={cancelRedirect}
                className="group hover:border-brand-gold/40 hover:bg-brand-gold/5 hover:text-brand-gold dark:hover:border-brand-gold/30 dark:hover:bg-brand-gold/10 dark:hover:text-brand-gold flex items-center gap-2 border border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500 transition-all dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
              >
                <Icon size={12} className="transition-transform group-hover:scale-110" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
