import React from 'react';

const GRID_STYLE = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(212, 175, 55, 0.08) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};

export function AdminLoginBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <div className="bg-brand-gold/5 absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" />
      <div className="bg-brand-navy-light/10 absolute top-0 right-0 h-96 w-96 rounded-full blur-[100px]" />
      <div className="bg-brand-gold/5 absolute bottom-0 left-0 h-80 w-80 rounded-full blur-[100px]" />
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-80" style={GRID_STYLE} />
    </div>
  );
}
