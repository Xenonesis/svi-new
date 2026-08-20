import { Quote } from 'lucide-react';

export function BrochureTrust() {
  return (
    <section
      id="page-7-trust"
      className="relative flex flex-col justify-center bg-[#0F1A2E] py-32 text-white md:py-48"
    >
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-luminosity"></div>

      <div className="brochure-container relative z-10 text-center">
        <Quote size={64} className="mx-auto mb-12 text-[#C9A84C] opacity-50" strokeWidth={1} />

        <h2 className="font-heading mx-auto mb-20 max-w-5xl text-4xl leading-tight text-balance md:text-5xl lg:text-7xl">
          &quot;We build more than just physical spaces. We cultivate environments where families
          thrive and investments flourish.&quot;
        </h2>

        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-12 md:grid-cols-4 md:gap-8">
          <div>
            <p className="font-stats mb-4 text-4xl text-[#D4AF37] md:text-5xl lg:text-6xl">5000+</p>
            <p className="font-subheading text-xs font-semibold tracking-widest text-white/70 uppercase md:text-sm">
              Happy Customers
            </p>
          </div>
          <div>
            <p className="font-stats mb-4 text-4xl text-[#D4AF37] md:text-5xl lg:text-6xl">230</p>
            <p className="font-subheading text-xs font-semibold tracking-widest text-white/70 uppercase md:text-sm">
              Premium Plots
            </p>
          </div>
          <div>
            <p className="font-stats mb-4 text-4xl text-[#D4AF37] md:text-5xl lg:text-6xl">5+</p>
            <p className="font-subheading text-xs font-semibold tracking-widest text-white/70 uppercase md:text-sm">
              Mega Projects
            </p>
          </div>
          <div>
            <p className="font-stats mb-4 text-4xl text-[#D4AF37] md:text-5xl lg:text-6xl">15+</p>
            <p className="font-subheading text-xs font-semibold tracking-widest text-white/70 uppercase md:text-sm">
              Years Legacy
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
