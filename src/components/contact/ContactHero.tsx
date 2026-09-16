export interface ContactHeroProps {
  badge: string;
  title: string;
  subtitle: string;
}

export function ContactHero({ badge, title, subtitle }: ContactHeroProps): React.JSX.Element {
  return (
    <section className="relative overflow-hidden border-b border-gray-200/70 bg-[#FDFBF7] pt-28 pb-20 dark:border-gray-800 dark:bg-gray-900">
      {/* Ambient gold orb */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[680px] -translate-x-1/2 rounded-full opacity-[0.06] blur-3xl"
        style={{ background: 'radial-gradient(ellipse, #d4af37 0%, transparent 70%)' }}
      />

      <div className="relative container mx-auto px-4 text-center">
        {/* Eyebrow pill */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/8 px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#b8941e] uppercase">
            {badge}
          </span>
        </div>

        <h1 className="text-brand-navy animate-hero-h1 mb-5 font-serif text-4xl leading-tight sm:text-5xl md:text-[4rem] dark:text-gray-50">
          {title}
        </h1>

        <p className="mx-auto max-w-lg text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>

        {/* Decorative gold rule */}
        <div className="animate-hero-divider mx-auto mt-8 flex items-center justify-center gap-3">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#d4af37]/60" />
          <div className="h-1 w-1 rounded-full bg-[#d4af37]" />
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#d4af37]/60" />
        </div>
      </div>
    </section>
  );
}
