import type { Metadata } from 'next';
import LotteryClientSection from '@/src/components/lottery/LotteryClientSection';
import LotteryFAQ from '@/src/components/common/ProjectsFAQ';

export const metadata: Metadata = {
  title: 'Lucky Draw | SVI Infra Solutions',
  description:
    'Participate in the SVI Infra live lucky draw. Watch the exclusive residential plot and luxury villa giveaway reveal in real time — verified and audited on Supabase.',
  openGraph: {
    title: 'Lucky Draw | SVI Infra Solutions',
    description:
      'Watch the SVI Infra live lucky draw — exclusive residential plots and luxury villas for registered investors.',
    type: 'website',
  },
};

export default function LotteryPage() {
  return (
    <div className="bg-brand-bg min-h-screen pt-20 pb-16 dark:bg-gray-900">
      <section className="bg-brand-bg border-b border-gray-200 py-14 text-center md:py-20 dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <p className="mb-4 text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase dark:text-gray-500">
            Official Lucky Draw Portal
          </p>
          <h1 className="text-brand-navy mb-6 font-serif text-3xl sm:text-4xl md:text-6xl dark:text-gray-100">
            SVI Infra <span className="text-brand-gold">Mega Giveaway</span>
          </h1>
          <div className="bg-brand-gold animate-hero-divider mx-auto mb-6 h-px w-16"></div>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-500 md:text-lg dark:text-gray-400">
            Exclusive residential plot and luxury villa lucky drawings for registered SVI investors
            and buyers. All draws are provably fair, audited, and processed via cryptographically
            secure database procedures.
          </p>
        </div>
      </section>

      <LotteryClientSection />
      <LotteryFAQ />
    </div>
  );
}
