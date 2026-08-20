import Image from 'next/image';

export function BrochureCover() {
  return (
    <section
      id="page-1-cover"
      className="relative flex h-screen w-full items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop"
          alt="Luxury Entrance"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A2E]/90 via-[#0F1A2E]/40 to-transparent"></div>
      </div>

      <div className="brochure-container relative z-10 flex h-full w-full flex-col justify-between py-12 text-center md:py-20">
        <div className="mt-10 flex w-full justify-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 rotate-45 transform items-center justify-center border border-[#C9A84C]">
              <div className="h-6 w-6 -rotate-45 transform bg-[#C9A84C]"></div>
            </div>
            <span className="font-subheading text-sm font-semibold tracking-[0.2em] text-white uppercase">
              SVI Infra
            </span>
          </div>
        </div>

        <div className="flex flex-grow flex-col items-center justify-center space-y-6">
          <h1 className="font-heading text-6xl leading-none font-medium text-balance text-white drop-shadow-2xl md:text-8xl lg:text-9xl">
            SHIVANI VATIKA 11<sup className="relative top-[-0.5em] text-4xl md:text-6xl">th</sup>
          </h1>
          <p className="font-subheading text-xl font-light tracking-[0.3em] text-white/90 uppercase md:text-2xl">
            Premium Residential Plotted Township
          </p>
          <div className="mt-8 h-1 w-24 bg-[#D4AF37]"></div>
          <div
            id="brochure-client-name-placeholder"
            className="font-subheading mt-8 hidden rounded-full border border-[#D4AF37]/50 bg-black/40 px-6 py-2 text-xl font-medium tracking-[0.2em] text-[#D4AF37] uppercase backdrop-blur-sm md:text-3xl"
          ></div>
        </div>

        <div className="flex flex-col items-center justify-end pb-8">
          <p className="font-heading text-2xl text-white italic opacity-90 md:text-3xl">
            &quot;Your Trust. Our Commitment.&quot;
          </p>
        </div>
      </div>
    </section>
  );
}
