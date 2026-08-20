import Image from 'next/image';
import { MapPin, TrendingUp, Map } from 'lucide-react';

const GROWTH_POINTS = [
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
];

export function BrochureGrowth() {
  return (
    <section id="page-3-growth" className="bg-[#F8F6F0] py-24 md:py-40">
      <div className="brochure-container">
        <div className="mx-auto mb-20 max-w-4xl text-center">
          <h2 className="font-heading mb-6 text-5xl text-[#0F1A2E] md:text-7xl">
            Jaipur&apos;s Next Growth Destination
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
            {GROWTH_POINTS.map((item, i) => (
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
  );
}
