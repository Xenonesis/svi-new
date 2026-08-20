export function BrochurePromise() {
  return (
    <section id="page-2-promise" className="bg-white py-24 md:py-40">
      <div className="brochure-container">
        <div className="flex flex-col items-center gap-16 md:flex-row lg:gap-32">
          <div className="w-full space-y-10 md:w-1/2">
            <div>
              <p className="font-subheading mb-4 text-sm font-bold tracking-[0.2em] text-[#C9A84C] uppercase">
                Built on Trust
              </p>
              <h2 className="font-heading text-5xl leading-tight text-[#0F1A2E] md:text-7xl">
                The SVI Promise
              </h2>
              <div className="gold-divider my-8 max-w-[200px]"></div>
            </div>

            <div className="font-body space-y-8 text-lg leading-relaxed font-light text-[#111111]/80 md:text-xl">
              <p>
                Every great legacy begins with the right address. At SVI Infra Solutions, we
                don&apos;t just develop land; we craft destinations designed for generations.
              </p>

              <div className="rounded-2xl border border-[rgba(201,168,76,0.15)] bg-[#F8F6F0] p-8">
                <h3 className="font-subheading mb-4 text-2xl font-semibold text-[#0F1A2E]">
                  Leadership
                </h3>
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="font-heading flex h-12 w-12 items-center justify-center rounded-full bg-[#0F1A2E] text-xl text-white">
                      IA
                    </div>
                    <div>
                      <p className="font-subheading font-bold text-[#0F1A2E]">Mr. Illas Ali</p>
                      <p className="font-body text-sm tracking-widest text-[#111111]/60 uppercase">
                        Founder
                      </p>
                    </div>
                  </div>
                  <div className="h-px w-full bg-[rgba(201,168,76,0.2)]"></div>
                  <div className="flex items-center gap-4">
                    <div className="font-heading flex h-12 w-12 items-center justify-center rounded-full bg-[#C9A84C] text-xl text-white">
                      VK
                    </div>
                    <div>
                      <p className="font-subheading font-bold text-[#0F1A2E]">Mr. Vinod Kumar</p>
                      <p className="font-body text-sm tracking-widest text-[#111111]/60 uppercase">
                        Co-Founder
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-8 md:w-1/2">
            <div className="luxury-card flex aspect-square flex-col items-center justify-center text-center">
              <span className="font-stats text-5xl text-[#D4AF37] lg:text-7xl">5000+</span>
              <span className="font-subheading mt-4 text-sm font-semibold tracking-widest text-[#0F1A2E] uppercase">
                Happy Customers
              </span>
            </div>
            <div className="luxury-card flex aspect-square translate-y-12 flex-col items-center justify-center text-center">
              <span className="font-stats text-5xl text-[#0F1A2E] lg:text-7xl">5+</span>
              <span className="font-subheading mt-4 text-sm font-semibold tracking-widest text-[#111111]/70 uppercase">
                Landmark Projects
              </span>
            </div>
            <div className="luxury-card flex aspect-square flex-col items-center justify-center text-center">
              <span className="font-stats text-5xl text-[#0F1A2E] lg:text-7xl">15+</span>
              <span className="font-subheading mt-4 text-sm font-semibold tracking-widest text-[#111111]/70 uppercase">
                Years Leadership
              </span>
            </div>
            <div className="luxury-card flex aspect-square translate-y-12 flex-col items-center justify-center border-none bg-[#0F1A2E] text-center">
              <span className="font-stats text-5xl text-white lg:text-7xl">100%</span>
              <span className="font-subheading mt-4 text-sm font-semibold tracking-widest text-[#C9A84C] uppercase">
                Transparency
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
