import type React from 'react';

const GRID_STYLE = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(212, 175, 55, 0.05) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};

export function DashboardBackground(): React.JSX.Element {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <div className="bg-brand-navy-light/10 absolute top-0 right-0 h-[450px] w-[450px] rounded-full blur-[120px]" />
      <div className="bg-brand-gold/5 absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full blur-[100px]" />
      <div className="absolute inset-0 opacity-80" style={GRID_STYLE} />
    </div>
  );
}
