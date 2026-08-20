'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface OffersVideoShowcaseProps {
  title: string;
  heading: string;
  desc: string;
}

export function OffersVideoShowcase({ title, heading, desc }: OffersVideoShowcaseProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <section className="bg-brand-navy border-t border-white/5 py-24">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="border-brand-gold/20 bg-brand-gold/5 text-brand-gold mb-6 inline-flex w-fit items-center gap-2 rounded-lg border px-3 py-1 text-xs font-bold tracking-widest uppercase">
            <span>{title}</span>
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {heading}
          </h2>
          <p className="mt-4 text-gray-400">{desc}</p>
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
              ref={videoRef}
              controls
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="h-full w-full bg-slate-950 object-contain"
              poster="/images/hero-poster.webp"
            >
              <source
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/hero.av1.mp4`}
                type='video/mp4; codecs="av01.0.05M.08"'
              />
              <source
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/hero.vp9.webm`}
                type='video/webm; codecs="vp9"'
              />
              <source
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/hero.h264.mp4`}
                type="video/mp4"
              />
            </video>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
