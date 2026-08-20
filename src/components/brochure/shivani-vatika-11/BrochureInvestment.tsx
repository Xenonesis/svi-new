import { Banknote, FileText, CheckCircle, CreditCard, ShieldCheck, TrendingUp } from 'lucide-react';

const REASONS = [
  {
    icon: <FileText size={24} />,
    title: 'Prime Gated Land',
    desc: '100% verified documentation with clear demarcation and immediate possession readiness.',
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
];

export function BrochureInvestment() {
  return (
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
            {REASONS.map((item, idx) => (
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
                  <p className="font-body text-sm leading-relaxed text-[#111111]/70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
