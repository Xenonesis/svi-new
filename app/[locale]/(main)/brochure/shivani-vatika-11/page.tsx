import { Metadata } from 'next';
import Image from 'next/image';
import { Cormorant_Garamond, Manrope, Inter, Montserrat } from 'next/font/google';
import BrochureGenerator from '@/src/components/brochure/BrochureGenerator';
import {
  MapPin,
  Phone,
  Mail,
  Map,
  Trees,
  ShieldCheck,
  Droplets,
  Zap,
  Users,
  TrendingUp,
  CheckCircle,
  CreditCard,
  Building,
  Quote,
  FileText,
  Banknote,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Shivani Vatika 11th - Premium Residential Plotted Township | SVI Infra',
  description:
    'An ultra-premium residential plotted township by SVI Infra Solutions in Jaipur. Designed for generations.',
};

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
});
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
});
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-inter',
});
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-montserrat',
});

export default function ShivaniVatika11Brochure() {
  return (
    <div
      className={`min-h-screen w-full overflow-x-hidden bg-[#F8F6F0] text-[#111111] ${cormorant.variable} ${manrope.variable} ${inter.variable} ${montserrat.variable} font-sans`}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        :root {
          --brochure-navy: #0F1A2E;
          --brochure-gold: #C9A84C;
          --brochure-gold-accent: #D4AF37;
          --brochure-white: #F8F6F0;
          --brochure-text: #111111;
          --brochure-divider: rgba(201, 168, 76, 0.35);
        }
        .font-heading { font-family: var(--font-cormorant), serif; }
        .font-subheading { font-family: var(--font-manrope), sans-serif; }
        .font-body { font-family: var(--font-inter), sans-serif; }
        .font-stats { font-family: var(--font-montserrat), sans-serif; }
        
        .gold-divider {
          height: 1px;
          background-color: var(--brochure-divider);
          width: 100%;
          margin: 2rem 0;
        }
        .gold-divider-vertical {
          width: 1px;
          background-color: var(--brochure-divider);
          height: 100%;
        }
        .text-gold { color: var(--brochure-gold); }
        .bg-navy { background-color: var(--brochure-navy); }
        .bg-gold { background-color: var(--brochure-gold); }
        .brochure-container {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 5%;
        }
        .luxury-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 3rem;
          box-shadow: 0 20px 40px rgba(15, 26, 46, 0.05);
          border: 1px solid rgba(201,168,76, 0.1);
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }
        .luxury-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 30px 60px rgba(15, 26, 46, 0.08);
        }
        .luxury-card-dark {
          background: rgba(255,255,255,0.03);
          border-radius: 24px;
          padding: 3rem;
          border: 1px solid rgba(201,168,76, 0.15);
          backdrop-filter: blur(10px);
        }
      `,
        }}
      />

      <BrochureGenerator />

      {/* PAGE 1: LUXURY COVER */}
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
              "Your Trust. Our Commitment."
            </p>
          </div>
        </div>
      </section>

      {/* PAGE 2: THE SVI PROMISE */}
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
                  Every great legacy begins with the right address. At SVI Infra Solutions, we don't
                  just develop land; we craft destinations designed for generations.
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

      {/* PAGE 3: GROWTH DESTINATION */}
      <section id="page-3-growth" className="bg-[#F8F6F0] py-24 md:py-40">
        <div className="brochure-container">
          <div className="mx-auto mb-20 max-w-4xl text-center">
            <h2 className="font-heading mb-6 text-5xl text-[#0F1A2E] md:text-7xl">
              Jaipur's Next Growth Destination
            </h2>
            <p className="font-body text-xl font-light text-[#111111]/70">
              An investment backed by vision. Situated in the heart of the fastest-growing corridor.
            </p>
            <div className="gold-divider mx-auto my-8 w-24"></div>
          </div>

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="relative h-[600px] overflow-hidden rounded-3xl shadow-2xl lg:col-span-7">
              <Image
                src="https://images.unsplash.com/photo-1598228723793-52759bba239c?q=80&w=1974&auto=format&fit=crop"
                alt="Jaipur Landscape"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[#0F1A2E]/20"></div>

              <div className="absolute inset-0 flex flex-col justify-between p-8">
                <div className="font-subheading flex items-center gap-2 self-end rounded-full bg-white/90 px-6 py-3 text-sm font-bold text-[#0F1A2E] shadow-xl backdrop-blur-md">
                  <MapPin size={16} className="text-[#D4AF37]" /> Khatu Shyam Ji
                </div>
                <div className="font-subheading mt-32 flex items-center gap-2 self-start rounded-full bg-white/90 px-6 py-3 text-sm font-bold text-[#0F1A2E] shadow-xl backdrop-blur-md">
                  <TrendingUp size={16} className="text-[#D4AF37]" /> RIICO Industrial Area
                </div>
                <div className="font-subheading flex items-center gap-2 self-center rounded-full bg-white/90 px-6 py-3 text-sm font-bold text-[#0F1A2E] shadow-xl backdrop-blur-md">
                  <Map size={16} className="text-[#D4AF37]" /> Greenfield Expressway
                </div>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-5">
              {[
                {
                  title: 'Near Khatu Shyam Ji',
                  desc: 'A prominent spiritual destination bringing endless footfall and regional development.',
                },
                {
                  title: 'RIICO Connectivity',
                  desc: 'Direct access to major industrial and employment hubs driving rental demand.',
                },
                {
                  title: 'NH48 Proximity',
                  desc: 'Seamless connection to the national highway ensuring unmatched accessibility.',
                },
                {
                  title: 'Greenfield Expressway',
                  desc: 'Positioned strategically near the new infrastructure marvel of Rajasthan.',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[rgba(201,168,76,0.1)] bg-white p-8 shadow-sm transition-all hover:border-[rgba(201,168,76,0.5)]"
                >
                  <h4 className="font-subheading mb-2 flex items-center gap-3 text-xl font-bold text-[#0F1A2E]">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F1A2E] text-xs text-[#D4AF37]">
                      0{i + 1}
                    </span>
                    {item.title}
                  </h4>
                  <p className="font-body pl-11 text-[#111111]/70">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PAGE 4: MASTERPLAN */}
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
                <p className="mb-1 text-sm tracking-widest text-[#C9A84C] uppercase">
                  Premium Plots
                </p>
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

      {/* PAGE 5: LIFESTYLE */}
      <section id="page-5-lifestyle" className="bg-white py-24 md:py-40">
        <div className="brochure-container">
          <div className="mx-auto mb-20 max-w-3xl text-center">
            <h2 className="font-heading mb-6 text-5xl text-[#0F1A2E] md:text-7xl">
              Crafted for Tomorrow
            </h2>
            <p className="font-body text-xl font-light text-[#111111]/70">
              Experience a lifestyle where every detail is curated for comfort, security, and
              spiritual well-being.
            </p>
            <div className="gold-divider mx-auto my-8 w-24"></div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <ShieldCheck size={32} strokeWidth={1.5} />,
                title: '24/7 Security',
                desc: 'Gated community with complete CCTV surveillance.',
              },
              {
                icon: <Trees size={32} strokeWidth={1.5} />,
                title: 'Lush Parks',
                desc: "Beautifully landscaped parks and dedicated children's play areas.",
              },
              {
                icon: <Building size={32} strokeWidth={1.5} />,
                title: 'Wide Roads',
                desc: 'Premium wide internal roads for smooth, congestion-free transit.',
              },
              {
                icon: <Droplets size={32} strokeWidth={1.5} />,
                title: 'Water Supply',
                desc: 'Uninterrupted and dedicated water supply infrastructure.',
              },
              {
                icon: <Zap size={32} strokeWidth={1.5} />,
                title: 'Electricity',
                desc: 'Reliable power grid ensuring continuous electricity.',
              },
              {
                icon: <Users size={32} strokeWidth={1.5} />,
                title: 'Community Temple',
                desc: 'A serene temple space for spiritual connection and peace.',
              },
            ].map((amenity, idx) => (
              <div
                key={idx}
                className="luxury-card flex flex-col items-center p-8 text-center md:p-12"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#F8F6F0] text-[#0F1A2E]">
                  {amenity.icon}
                </div>
                <h4 className="font-subheading mb-4 text-2xl font-bold text-[#0F1A2E]">
                  {amenity.title}
                </h4>
                <p className="font-body leading-relaxed text-[#111111]/70">{amenity.desc}</p>
              </div>
            ))}
          </div>

          <div className="relative mt-20 h-[400px] overflow-hidden rounded-3xl shadow-2xl md:h-[500px]">
            <Image
              src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=2070&auto=format&fit=crop"
              alt="Luxury Lifestyle"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* PAGE 6: INVESTMENT */}
      <section id="page-6-investment" className="bg-[#F8F6F0] py-24 md:py-40">
        <div className="brochure-container">
          <div className="flex flex-col gap-16 lg:flex-row">
            <div className="w-full lg:w-1/3">
              <h2 className="font-heading mb-8 text-5xl leading-tight text-[#0F1A2E] md:text-6xl">
                Why Smart Investors Choose Shivani Vatika
              </h2>
              <p className="font-body mb-12 text-xl font-light text-[#111111]/70">
                Where vision meets long-term value. We ensure complete transparency and financial
                flexibility for your peace of mind.
              </p>

              <div className="relative overflow-hidden rounded-2xl bg-[#0F1A2E] p-8 text-white shadow-xl">
                <div className="absolute -top-4 -right-4 text-[rgba(201,168,76,0.1)]">
                  <Banknote size={120} />
                </div>
                <h4 className="font-subheading mb-6 text-sm font-bold tracking-widest text-[#C9A84C] uppercase">
                  Investment Options
                </h4>

                <div className="relative z-10 space-y-6">
                  <div>
                    <p className="font-body mb-1 flex items-center justify-between text-sm text-white/70">
                      <span>One-Time Payment</span>
                      <span className="rounded bg-white/10 px-2 py-1 text-xs font-bold text-white uppercase">
                        Best Value
                      </span>
                    </p>
                    <p className="font-stats text-3xl text-white md:text-4xl">
                      ₹7,500{' '}
                      <span className="font-subheading text-lg font-normal text-white/50">
                        / sq. yd
                      </span>
                    </p>
                  </div>
                  <div className="h-px w-full bg-white/10"></div>
                  <div>
                    <p className="font-body mb-1 text-sm text-white/70">1 Year No-Cost EMI</p>
                    <p className="font-stats text-3xl text-[#C9A84C] md:text-4xl">
                      ₹7,750{' '}
                      <span className="font-subheading text-lg font-normal text-[#C9A84C]/50">
                        / sq. yd
                      </span>
                    </p>
                  </div>
                  <div className="h-px w-full bg-white/10"></div>
                  <div>
                    <p className="font-body mb-1 text-sm text-white/70">2 Year No-Cost EMI</p>
                    <p className="font-stats text-3xl text-[#C9A84C] md:text-4xl">
                      ₹8,000{' '}
                      <span className="font-subheading text-lg font-normal text-[#C9A84C]/50">
                        / sq. yd
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:w-2/3">
              {[
                {
                  icon: <FileText size={24} />,
                  title: 'JDA Approved Land',
                  desc: '100% legally clear and approved by the Jaipur Development Authority.',
                },
                {
                  icon: <CheckCircle size={24} />,
                  title: 'Registry after 40%',
                  desc: 'Get your land registered securely after paying just 40% of the total value.',
                },
                {
                  icon: <Banknote size={24} />,
                  title: 'Company Loan Facility',
                  desc: 'Hassle-free company financing available for seamless purchasing.',
                },
                {
                  icon: <CreditCard size={24} />,
                  title: 'Flexible Payment Plans',
                  desc: 'Customized payment schedules spanning up to 2 years with zero interest.',
                },
                {
                  icon: <ShieldCheck size={24} />,
                  title: 'Transparent Documentation',
                  desc: 'No hidden clauses. Absolute clarity in every single piece of paperwork.',
                },
                {
                  icon: <TrendingUp size={24} />,
                  title: 'High Appreciation',
                  desc: 'Strategically located in a rapidly growing corridor ensuring stellar ROI.',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-6 rounded-2xl border border-[#C9A84C]/20 bg-white p-8 transition-shadow hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#F8F6F0] text-[#D4AF37]">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-subheading mb-2 text-xl font-bold text-[#0F1A2E]">
                      {item.title}
                    </h4>
                    <p className="font-body text-sm leading-relaxed text-[#111111]/70">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PAGE 7: TRUST */}
      <section
        id="page-7-trust"
        className="relative flex flex-col justify-center bg-[#0F1A2E] py-32 text-white md:py-48"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-luminosity"></div>

        <div className="brochure-container relative z-10 text-center">
          <Quote size={64} className="mx-auto mb-12 text-[#C9A84C] opacity-50" strokeWidth={1} />

          <h2 className="font-heading mx-auto mb-20 max-w-5xl text-4xl leading-tight text-balance md:text-5xl lg:text-7xl">
            "We build more than just physical spaces. We cultivate environments where families
            thrive and investments flourish."
          </h2>

          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-12 md:grid-cols-4 md:gap-8">
            <div>
              <p className="font-stats mb-4 text-4xl text-[#D4AF37] md:text-5xl lg:text-6xl">
                5000+
              </p>
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

      {/* PAGE 8: CLOSING */}
      <section
        id="page-8-closing"
        className="relative flex min-h-[80vh] w-full items-end md:h-screen"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=2187&auto=format&fit=crop"
            alt="Golden Sunset"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A2E] via-[#0F1A2E]/80 to-transparent"></div>
        </div>

        <div className="brochure-container relative z-10 w-full pt-24 pb-10 md:pt-40 md:pb-20">
          <div className="mb-12 text-center md:mb-20">
            <h2 className="font-heading mb-6 text-4xl text-white md:text-6xl lg:text-7xl">
              Reserve Your Place in Tomorrow's Community
            </h2>
            <p className="font-subheading text-sm tracking-widest text-[#C9A84C] uppercase md:text-xl">
              Every great legacy begins with the right address.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl md:grid-cols-2 md:gap-12 md:p-16 lg:grid-cols-4">
            <div>
              <p className="font-subheading mb-4 text-xs font-bold tracking-widest text-[#D4AF37] uppercase md:text-sm">
                Contact Us
              </p>
              <div className="font-body space-y-4 text-sm text-white/90 md:text-base">
                <p className="flex items-center gap-3">
                  <Phone size={18} className="text-[#C9A84C]" /> +91 73000 07643
                </p>
                <p className="flex items-center gap-3">
                  <Phone size={18} className="text-[#C9A84C]" /> +91 92160 14579
                </p>
                <p className="flex items-center gap-3 break-all">
                  <Mail size={18} className="flex-shrink-0 text-[#C9A84C]" />{' '}
                  info@sviinfrasolutions.com
                </p>
              </div>
            </div>

            <div className="lg:col-span-2">
              <p className="font-subheading mb-4 text-xs font-bold tracking-widest text-[#D4AF37] uppercase md:text-sm">
                Corporate Office
              </p>
              <div className="font-body flex items-start gap-3 space-y-2 text-sm leading-relaxed text-white/90 md:text-base">
                <MapPin size={18} className="mt-1 flex-shrink-0 text-[#C9A84C]" />
                <p>
                  SVI Infra Solutions Pvt. Ltd.
                  <br />
                  A-61, Sector-65
                  <br />
                  Noida, Uttar Pradesh 201309
                </p>
              </div>
            </div>

            <div className="flex flex-row items-center justify-between md:flex-col md:items-start lg:items-end">
              <div>
                <p className="font-subheading mb-2 text-xs font-bold tracking-widest text-[#D4AF37] uppercase md:mb-4 md:text-sm">
                  Visit Us
                </p>
                <p className="font-body flex cursor-pointer items-center gap-2 text-sm text-white transition-colors hover:text-[#C9A84C] md:text-base">
                  www.sviinfrasolutions.com
                </p>
              </div>

              <div className="mt-4 rounded-xl bg-white p-2 md:mt-8">
                <div className="flex h-16 w-16 items-center justify-center border-2 border-dashed border-[#0F1A2E]/20 md:h-24 md:w-24">
                  <span className="font-subheading text-center text-[10px] font-bold text-[#0F1A2E]/50 uppercase md:text-xs">
                    Scan
                    <br />
                    QR
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 mb-6 h-px w-full bg-white/10 md:mt-16 md:mb-8"></div>

          <div className="font-body flex flex-col items-center justify-between gap-4 text-center text-[10px] tracking-widest text-white/50 uppercase md:flex-row md:text-left md:text-xs">
            <p>© {new Date().getFullYear()} SVI Infra Solutions. All Rights Reserved.</p>
            <p>Designed for Generations.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
