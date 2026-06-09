import type { Metadata } from 'next';
import ThankYouCard from './ThankYouCard';

export const metadata: Metadata = {
  title: 'Thank You',
  description:
    'Your registration has been submitted successfully. Our team will reach out to you shortly.',
};

const GRADIENT_STYLE = {
  backgroundImage:
    'repeating-linear-gradient(45deg, #1a2744 0, #1a2744 1px, transparent 0, transparent 50%)',
  backgroundSize: '40px 40px',
};

export default function ThankYou() {
  return (
    <div className="bg-brand-bg relative flex min-h-screen items-center justify-center py-20 pt-24 dark:bg-gray-900">
      <div
        className="pointer-events-none absolute top-0 left-0 h-full w-full opacity-5"
        style={GRADIENT_STYLE}
      ></div>
      <div className="relative z-10 container mx-auto px-4 text-center">
        <ThankYouCard />
      </div>
    </div>
  );
}
