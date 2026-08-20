import Image from 'next/image';
import { ShieldCheck, Trees, Building, Droplets, Zap, Users } from 'lucide-react';

const AMENITIES = [
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
];

export function BrochureLifestyle() {
  return (
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
          {AMENITIES.map((amenity, idx) => (
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
  );
}
