'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, Building2, MapPin, Search, Phone } from 'lucide-react';

const QUICK_LINKS = [
  { label: 'Current Projects', href: '/projects/current', icon: Building2 },
  { label: 'Registration', href: '/registration', icon: MapPin },
  { label: 'Contact Us', href: '/contact', icon: Phone },
  { label: 'About Us', href: '/about', icon: Search },
];

export default function NotFoundPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(12);
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [router]);

  const cancelRedirect = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCountdown(0);
  };

  return (
    <div className="dark:bg-brand-dark-bg relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden bg-gray-50 px-4 py-24">
      {/* Decorative background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(26,39,68,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26,39,68,1) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Gold radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212, 175, 55,0.04) 0%, transparent 65%)',
        }}
      />

      {/* Floating decorative diamonds */}
      {mounted &&
        [
          { x: '8%', y: '20%', size: 8, delay: 0 },
          { x: '92%', y: '15%', size: 6, delay: 1.5 },
          { x: '5%', y: '75%', size: 10, delay: 0.8 },
          { x: '95%', y: '70%', size: 7, delay: 2.2 },
          { x: '50%', y: '8%', size: 5, delay: 1.1 },
        ].map((d, i) => (
          <div
            key={i}
            className="pointer-events-none absolute rotate-45 opacity-20"
            style={{
              left: d.x,
              top: d.y,
              width: d.size,
              height: d.size,
              background: '#d4af37',
              animation: `float 6s ease-in-out ${d.delay}s infinite`,
            }}
          />
        ))}

      {/* City skyline at bottom */}
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-20 opacity-[0.06] dark:opacity-[0.1]">
        <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className="h-full w-full">
          <path
            d="M0,50 L50,50 L50,30 L60,30 L60,20 L65,20 L65,10 L70,10 L70,20 L75,20 L75,30 L85,30 L85,50
               L130,50 L130,35 L145,35 L145,50
               L200,50 L200,25 L210,25 L210,15 L215,15 L215,5 L220,5 L220,15 L225,15 L225,25 L235,25 L235,50
               L280,50 L280,38 L295,38 L295,50
               L340,50 L340,20 L350,20 L350,8 L358,8 L358,20 L365,20 L365,50
               L420,50 L420,32 L435,32 L435,50
               L490,50 L490,22 L500,22 L500,12 L505,12 L505,4 L510,4 L510,12 L515,12 L515,22 L525,22 L525,50
               L580,50 L580,35 L595,35 L595,50
               L650,50 L650,28 L660,28 L660,15 L668,15 L668,28 L678,28 L678,50
               L730,50 L730,40 L748,40 L748,50
               L800,50 L800,22 L810,22 L810,10 L818,10 L818,2 L824,2 L824,10 L830,10 L830,22 L840,22 L840,50
               L895,50 L895,35 L910,35 L910,50
               L960,50 L960,28 L972,28 L972,15 L980,15 L980,28 L990,28 L990,50
               L1040,50 L1040,38 L1055,38 L1055,50
               L1110,50 L1110,25 L1120,25 L1120,12 L1128,12 L1128,25 L1138,25 L1138,50
               L1200,50 L1200,80 L0,80 Z"
            fill="#111827"
          />
        </svg>
      </div>

      <div
        className="relative z-10 mx-auto max-w-2xl text-center"
        style={{ animation: 'slide-in-bottom 0.7s cubic-bezier(0.22,1,0.36,1) both' }}
      >
        {/* Large 404 */}
        <div className="relative mb-2 select-none">
          <span
            className="block font-serif text-[110px] leading-none font-bold md:text-[160px]"
            style={{
              color: 'transparent',
              WebkitTextStroke: '1px rgba(212, 175, 55,0.25)',
              letterSpacing: '-4px',
            }}
          >
            404
          </span>
          {/* Layered gold glow text */}
          <span
            className="pointer-events-none absolute inset-0 flex items-center justify-center font-serif text-[110px] leading-none font-bold md:text-[160px]"
            style={{
              background:
                'linear-gradient(135deg, rgba(212, 175, 55,0.08) 0%, rgba(212, 175, 55,0.15) 50%, rgba(212, 175, 55,0.06) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-4px',
            }}
          >
            404
          </span>
        </div>

        {/* Decorative divider */}
        <div className="mx-auto mb-5 flex items-center justify-center gap-3">
          <div className="to-brand-gold/60 h-px w-16 bg-gradient-to-r from-transparent" />
          <div className="bg-brand-gold h-2 w-2 rotate-45" />
          <div className="to-brand-gold/60 h-px w-16 bg-gradient-to-l from-transparent" />
        </div>

        <p className="text-brand-gold mb-2 text-[10px] font-semibold tracking-[0.25em] uppercase">
          Page Not Found
        </p>

        <h1 className="text-brand-navy mb-4 font-serif text-3xl leading-tight md:text-4xl dark:text-gray-100">
          This Address Doesn&apos;t <span className="text-brand-gold italic">Exist Yet</span>
        </h1>

        <p className="mx-auto mb-3 max-w-md text-base leading-relaxed text-gray-600 dark:text-gray-400">
          The page you&apos;re looking for may have been moved, renamed, or hasn&apos;t been built
          yet — much like the finest properties we develop.
        </p>

        <p className="text-brand-gold/70 mb-8 font-serif text-base italic">
          &ldquo;Where Dreams Take Address&rdquo; — but not at this URL.
        </p>

        {/* Countdown auto-redirect */}
        {countdown > 0 && (
          <div className="mb-8 flex flex-col items-center gap-2">
            <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-5 py-2.5 shadow-sm dark:border-gray-700 dark:bg-gray-800/60">
              {/* Conic progress ring */}
              <div
                className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#d4af37 ${(countdown / 12) * 360}deg, rgba(212, 175, 55,0.1) 0deg)`,
                }}
              >
                <div className="absolute inset-1 rounded-full bg-white dark:bg-gray-800" />
                <span className="text-brand-gold relative z-10 text-[10px] font-bold">
                  {countdown}
                </span>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Auto-redirecting to home in{' '}
                <span className="font-semibold text-gray-800 dark:text-gray-200">{countdown}s</span>
              </span>
            </div>
            <button
              onClick={cancelRedirect}
              className="text-[10px] tracking-wider text-gray-400 uppercase underline underline-offset-2 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            >
              Stay on this page
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            onClick={cancelRedirect}
            className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light hover:shadow-[0_0_20px_rgba(212, 175, 55,0.3)] flex items-center gap-2.5 px-8 py-3.5 text-[11px] font-bold tracking-widest uppercase shadow-lg transition-all"
          >
            <Home size={14} />
            Back to Home
          </Link>
          <Link
            href="/contact"
            onClick={cancelRedirect}
            className="text-brand-navy border-brand-navy hover:border-brand-gold hover:text-brand-gold flex items-center gap-2.5 border px-8 py-3.5 text-[11px] font-bold tracking-widest uppercase transition-all dark:border-gray-400 dark:text-gray-300"
          >
            <ArrowLeft size={14} />
            Contact Support
          </Link>
        </div>

        {/* Quick links grid */}
        <div className="border-t border-gray-200 pt-8 dark:border-gray-700">
          <p className="mb-4 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
            Explore instead
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={cancelRedirect}
                className="group hover:border-brand-gold/40 hover:bg-brand-gold/5 hover:text-brand-gold flex items-center gap-2 border border-gray-200 bg-white px-4 py-2 text-xs text-gray-600 shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
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
