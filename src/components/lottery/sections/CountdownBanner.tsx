'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock } from 'lucide-react';

interface CountdownBannerProps {
  countdownStr: string | null;
  scheduledAt: Date | null;
}

export function CountdownBanner({ countdownStr, scheduledAt }: CountdownBannerProps) {
  return (
    <AnimatePresence>
      {countdownStr && scheduledAt && (
        <motion.div
          key="countdown-banner"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4 }}
          className="shadow-[0_0_40px_rgba(212, 175, 55,0.15)] mb-10 overflow-hidden rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] p-px"
        >
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-r from-[#0e0e18] via-[#14142a] to-[#0e0e18] px-8 py-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/20 text-[#D4AF37]">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase">
                  Live Draw Countdown
                </div>
                <div className="mt-0.5 text-sm text-slate-300">
                  Draw scheduled for{' '}
                  <span className="font-semibold text-white">
                    {scheduledAt.toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}{' '}
                    IST
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {countdownStr.split(':').map((seg, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-2xl font-bold text-[#D4AF37]/60">:</span>}
                  <div className="flex min-w-[3rem] flex-col items-center justify-center rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-3 py-2">
                    <span className="font-mono text-3xl font-bold text-white tabular-nums">
                      {seg}
                    </span>
                    <span className="mt-0.5 text-[9px] tracking-widest text-slate-400 uppercase">
                      {i === 0 && countdownStr.split(':').length === 3
                        ? 'hrs'
                        : i === (countdownStr.split(':').length === 3 ? 1 : 0)
                          ? 'min'
                          : 'sec'}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
