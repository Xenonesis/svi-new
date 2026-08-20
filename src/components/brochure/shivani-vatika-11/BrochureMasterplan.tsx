import Image from 'next/image';

export function BrochureMasterplan() {
  return (
    <section
      id="page-4-masterplan"
      className="relative overflow-hidden bg-[#0F1A2E] py-24 text-white md:py-40"
    >
      <div className="brochure-container relative z-10">
        <div className="mb-16 flex flex-col items-end justify-between gap-8 md:flex-row">
          <div>
            <p className="font-subheading mb-4 text-sm font-bold tracking-[0.2em] text-[#C9A84C] uppercase">
              The Blueprint
            </p>
            <h2 className="font-heading text-5xl text-white md:text-7xl">Master Plan</h2>
          </div>
          <div className="font-subheading flex flex-wrap gap-8 md:gap-12">
            <div>
              <p className="mb-1 text-sm tracking-widest text-[#C9A84C] uppercase">Total Land</p>
              <p className="text-3xl">11.5 Bigha</p>
            </div>
            <div>
              <p className="mb-1 text-sm tracking-widest text-[#C9A84C] uppercase">Premium Plots</p>
              <p className="text-3xl">230</p>
            </div>
            <div>
              <p className="mb-1 text-sm tracking-widest text-[#C9A84C] uppercase">Sizes</p>
              <p className="text-3xl">
                80–250 <span className="text-lg text-white/60">Sq. Yds</span>
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex h-[60vh] w-full items-center justify-center overflow-hidden rounded-3xl border border-[#C9A84C]/30 bg-[#1a2639]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#C9A84C] to-transparent opacity-20"></div>
          <Image
            src="https://images.unsplash.com/photo-1524813686514-a57563d77965?q=80&w=2670&auto=format&fit=crop"
            alt="Masterplan Architecture"
            fill
            className="object-cover opacity-60 mix-blend-overlay"
          />

          <div className="luxury-card-dark absolute top-1/4 left-[10%] flex items-center gap-4 p-4 md:left-1/4 md:p-6">
            <div className="h-3 w-3 rounded-full bg-[#D4AF37] shadow-[0_0_15px_#D4AF37]"></div>
            <span className="font-subheading text-xs font-bold tracking-wider text-white uppercase md:text-sm">
              Residential Zone
            </span>
          </div>
          <div className="luxury-card-dark absolute right-[10%] bottom-1/3 flex items-center gap-4 p-4 md:right-1/4 md:p-6">
            <div className="h-3 w-3 rounded-full bg-[#22c55e] shadow-[0_0_15px_#22c55e]"></div>
            <span className="font-subheading text-xs font-bold tracking-wider text-white uppercase md:text-sm">
              Parks & Greenery
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
