import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import BlogHero from './BlogHero';
import BlogCards from './BlogCards';

const BlogFAQ = dynamic(() => import('@/src/components/common/ProjectsFAQ'));

export const metadata: Metadata = {
  title: 'Insights & Updates',
  description:
    'Stay informed with the latest real estate market trends, investment guides, and updates from SVI Infra Solutions.',
};

export default function Blog() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 dark:bg-[#0C0C0C]">
      <BlogHero />
      <BlogCards />
      <BlogFAQ />
    </div>
  );
}
