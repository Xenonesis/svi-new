import { Metadata } from 'next';
import BrochureGenerator from '@/src/components/brochure/BrochureGenerator';
import { buildAlternates } from '@/src/lib/seo';
import {
  BrochureCover,
  BrochurePromise,
  BrochureGrowth,
  BrochureMasterplan,
  BrochureLifestyle,
  BrochureInvestment,
  BrochureTrust,
  BrochureClosing,
} from '@/src/components/brochure/shivani-vatika-11';

export const metadata: Metadata = {
  title: 'Shivani Vatika 11th Brochure - Premium Residential Plotted Township',
  description:
    'An ultra-premium residential plotted township by SVI Infra Solutions in Jaipur. Designed for generations.',
  alternates: buildAlternates('/brochure/shivani-vatika-11', 'en'),
};


export default function ShivaniVatika11Brochure() {
  return (
    <div
      className="min-h-screen w-full overflow-x-hidden bg-[#F8F6F0] text-[#111111] font-sans"
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
        .font-heading { font-family: var(--font-serif), Georgia, 'Times New Roman', serif; }
        .font-subheading { font-family: var(--font-sans), system-ui, sans-serif; }
        .font-body { font-family: var(--font-sans), system-ui, sans-serif; }
        .font-stats { font-family: var(--font-sans), system-ui, sans-serif; font-feature-settings: "tnum"; font-weight: 700; }
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
      <BrochureCover />

      {/* PAGE 2: THE SVI PROMISE */}
      <BrochurePromise />

      {/* PAGE 3: GROWTH DESTINATION */}
      <BrochureGrowth />

      {/* PAGE 4: MASTERPLAN */}
      <BrochureMasterplan />

      {/* PAGE 5: LIFESTYLE & AMENITIES */}
      <BrochureLifestyle />

      {/* PAGE 6: INVESTMENT REASONS & PLANS */}
      <BrochureInvestment />

      {/* PAGE 7: TRUST & TESTIMONIAL METRICS */}
      <BrochureTrust />

      {/* PAGE 8: CLOSING CONTACT & OFFICE */}
      <BrochureClosing />
    </div>
  );
}
