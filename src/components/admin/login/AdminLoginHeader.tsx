import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function AdminLoginHeader() {
  return (
    <>
      {/* Icon */}
      <div className="mb-6 flex justify-center">
        <div className="bg-brand-gold/10 border-brand-gold/20 glow-gold flex h-16 w-16 items-center justify-center rounded-full border">
          <ShieldCheck className="text-brand-gold h-8 w-8" />
        </div>
      </div>

      <h1 className="text-brand-navy mb-2 text-center font-serif text-3xl tracking-tight transition-colors duration-300 dark:text-white">
        Admin{' '}
        <span
          className="text-gradient-gold animate-bg-pan inline-block pr-2 italic"
          style={{
            backgroundSize: '200% 200%',
            backgroundImage: 'linear-gradient(135deg, #d4af37, #f0d080, #b08f36, #dec070, #d4af37)',
          }}
        >
          Portal
        </span>
      </h1>

      <div className="mb-8 flex justify-center">
        <span className="bg-brand-gold/10 text-brand-gold border-brand-gold/20 inline-block rounded-sm border px-3.5 py-1.5 text-[9px] font-bold tracking-[0.2em] uppercase backdrop-blur-sm">
          SVI Infra Solutions — Restricted Access
        </span>
      </div>
    </>
  );
}
