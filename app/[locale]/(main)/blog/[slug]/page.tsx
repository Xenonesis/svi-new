import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { BLOG_POST_MAP, BLOG_POSTS as SHARED_BLOG_POSTS } from '@/src/lib/blog';
import { absoluteUrl } from '@/src/lib/seo';
import BlogDetailFAQ from '@/src/components/common/ProjectsFAQ';

// Sample blog posts data (in production, this would come from a CMS or database)
/* const BLOG_POSTS = {
  'top-5-real-estate-investment-tips': {
    title: 'Top 5 Real Estate Investment Tips for First-Time Buyers',
    slug: 'top-5-real-estate-investment-tips',
    excerpt: 'Essential guidance for newcomers looking to invest in real estate markets.',
    content: `
      <p>Investing in real estate can be one of the most rewarding financial decisions you make. However, for first-time buyers, navigating the property market can seem overwhelming. Here are five essential tips to help you get started on your investment journey.</p>
      
      <h2>1. Research the Location Thoroughly</h2>
      <p>Location is arguably the most important factor in real estate investment. Look for areas with:</p>
      <ul>
        <li>Good connectivity to major highways and public transport</li>
        <li>Proximity to schools, hospitals, and shopping centers</li>
        <li>Planned infrastructure developments</li>
        <li>Low crime rates and good neighborhood reputation</li>
      </ul>
      
      <h2>2. Understand Your Budget</h2>
      <p>Before you start looking at properties, get clarity on your finances:</p>
      <ul>
        <li>Check your credit score and improve it if necessary</li>
        <li>Get pre-approved for a home loan</li>
        <li>Factor in additional costs like registration, stamp duty, and maintenance</li>
        <li>Maintain an emergency fund for unexpected expenses</li>
      </ul>
      
      <h2>3. Think Long-Term</h2>
      <p>Real estate is a long-term investment. Consider:</p>
      <ul>
        <li>The appreciation potential of the area</li>
        <li>Rental yield if you plan to lease the property</li>
        <li>Future development plans in the vicinity</li>
        <li>Your own life goals and how the property fits into them</li>
      </ul>
      
      <h2>4. Verify Legal Documentation</h2>
      <p>Never skip the legal due diligence:</p>
      <ul>
        <li>Verify title deeds and ownership history</li>
        <li>Check for any pending litigation or encumbrances</li>
        <li>Ensure all necessary approvals from local authorities</li>
        <li>Hire a qualified lawyer to review all documents</li>
      </ul>
      
      <h2>5. Work with Reputed Developers</h2>
      <p>Choose developers with a proven track record:</p>
      <ul>
        <li>Research their past projects and delivery timelines</li>
        <li>Read customer reviews and testimonials</li>
        <li>Verify RERA registration and compliance</li>
        <li>Assess the quality of construction and materials used</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Real estate investment requires careful planning and research. By following these five tips, you'll be better equipped to make informed decisions and maximize your returns. Remember, patience and due diligence are your best allies in the property market.</p>
    `,
    author: 'SVI Infra Solutions',
    date: '2026-05-15',
    category: 'Investment Tips',
    image: '/images/blog1.png',
    tags: ['investment', 'first-time buyers', 'real estate tips'],
    readTime: '5 min read',
  },
  'jaipur-real-estate-market-trends': {
    title: 'Jaipur Real Estate Market Trends 2026',
    slug: 'jaipur-real-estate-market-trends',
    excerpt: 'Comprehensive analysis of the current real estate landscape in Jaipur.',
    content: `
      <p>Jaipur's real estate market has shown remarkable growth in recent years, driven by infrastructure development, IT sector expansion, and increasing demand for affordable housing. Let's explore the key trends shaping the market in 2026.</p>
      
      <h2>Infrastructure Development Driving Growth</h2>
      <p>The Delhi-Mumbai Industrial Corridor (DMIC) and Dedicated Freight Corridor (DFC) have significantly boosted Jaipur's real estate prospects. Areas along these corridors are witnessing unprecedented demand from both residential and commercial investors.</p>
      
      <h2>Rising Demand in Suburban Areas</h2>
      <p>With land prices in central Jaipur reaching premium levels, buyers are increasingly looking at suburban locations like:</p>
      <ul>
        <li>Jagatpura</li>
        <li>Vidhyadhar Nagar extension</li>
        <li>NH-8 corridor</li>
        <li>Tonk Road</li>
        <li>Ajmer Road</li>
      </ul>
      
      <h2>Affordable Housing Boom</h2>
      <p>Government initiatives like PMAY (Pradhan Mantri Awas Yojana) have made homeownership more accessible. Developers are focusing on compact, well-designed apartments in the ₹25-50 lakh range, catering to middle-income families.</p>
      
      <h2>Commercial Real Estate Expansion</h2>
      <p>The IT and services sector growth has led to increased demand for office spaces and retail outlets. Areas near Sitapura Industrial Area and Malviya Nagar are emerging as commercial hubs.</p>
      
      <h2>Price Appreciation Trends</h2>
      <p>Residential property prices in Jaipur have appreciated by 8-12% annually over the past three years, outperforming many Tier-2 cities. Experts predict continued growth of 10-15% in prime locations.</p>
      
      <h2>Investment Outlook</h2>
      <p>With Smart City projects, improved connectivity, and growing employment opportunities, Jaipur presents excellent investment opportunities for both end-users and investors seeking capital appreciation.</p>
    `,
    author: 'SVI Infra Solutions',
    date: '2026-05-10',
    category: 'Market Analysis',
    image: '/images/blog2.png',
    tags: ['Jaipur', 'market trends', 'property prices'],
    readTime: '7 min read',
  },
  'smart-home-features-modern-living': {
    title: 'Smart Home Features Transforming Modern Living',
    slug: 'smart-home-features-modern-living',
    excerpt: 'How technology is revolutionizing residential properties and enhancing lifestyle.',
    content: `
      <p>The concept of home is evolving rapidly with the integration of smart technology. Modern homebuyers are no longer just looking for four walls and a roof—they want intelligent living spaces that enhance comfort, security, and energy efficiency.</p>
      
      <h2>Essential Smart Home Features</h2>
      
      <h3>1. Automated Lighting and Climate Control</h3>
      <p>Smart lighting systems allow you to control brightness, color, and scheduling through mobile apps or voice commands. Similarly, smart thermostats learn your preferences and optimize heating/cooling for maximum comfort and energy savings.</p>
      
      <h3>2. Advanced Security Systems</h3>
      <p>Modern homes feature:</p>
      <ul>
        <li>Video doorbells with two-way communication</li>
        <li>Smart locks with remote access</li>
        <li>Motion sensors and surveillance cameras</li>
        <li>Integrated alarm systems connected to smartphones</li>
      </ul>
      
      <h3>3. Energy Management</h3>
      <p>Smart meters and energy monitoring systems help homeowners track consumption patterns and reduce electricity bills. Solar panel integration with battery storage is becoming increasingly popular.</p>
      
      <h3>4. Voice-Activated Assistants</h3>
      <p>Integration with Alexa, Google Assistant, or Siri allows seamless control of various home functions through simple voice commands.</p>
      
      <h2>Benefits of Smart Homes</h2>
      <ul>
        <li><strong>Convenience:</strong> Control everything from your smartphone</li>
        <li><strong>Energy Efficiency:</strong> Reduce utility bills by 20-30%</li>
        <li><strong>Enhanced Security:</strong> Real-time monitoring and alerts</li>
        <li><strong>Increased Property Value:</strong> Smart features boost resale value</li>
        <li><strong>Accessibility:</strong> Easier management for elderly and differently-abled residents</li>
      </ul>
      
      <h2>Future Trends</h2>
      <p>Emerging technologies like AI-powered home assistants, predictive maintenance systems, and IoT-enabled appliances will further transform how we interact with our living spaces.</p>
      
      <h2>Conclusion</h2>
      <p>Smart home technology is no longer a luxury—it's becoming a standard expectation. As developers, we're committed to integrating these innovations into our projects to deliver future-ready homes.</p>
    `,
    author: 'SVI Infra Solutions',
    date: '2026-05-05',
    category: 'Technology',
    image: '/images/blog3.png',
    tags: ['smart home', 'technology', 'modern living'],
    readTime: '6 min read',
  },
}; */

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POST_MAP[slug];

  if (!post) {
    return {
      title: 'Blog Post Not Found',
    };
  }

  return {
    title: `${post.title} | SVI Infra Solutions Blog`,
    description: post.excerpt,
    keywords: [...post.tags, 'real estate blog', 'property insights', 'SVI Infra'],
    alternates: {
      canonical: absoluteUrl(`/blog/${post.slug}`),
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: absoluteUrl(`/blog/${post.slug}`),
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: `https://sviiinfrasolutions.com${post.image}`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  return SHARED_BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POST_MAP[slug];

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16 dark:bg-[#0C0C0C]">
      {/* Article Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            image: `https://sviiinfrasolutions.com${post.image}`,
            datePublished: post.date,
            dateModified: post.date,
            author: {
              '@type': 'Organization',
              name: post.author,
              url: 'https://sviiinfrasolutions.com',
            },
            publisher: {
              '@type': 'Organization',
              name: 'SVI Infra Solutions',
              logo: {
                '@type': 'ImageObject',
                url: 'https://sviiinfrasolutions.com/logo.png',
              },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://sviiinfrasolutions.com/blog/${post.slug}`,
            },
          }),
        }}
      />

      <article className="container mx-auto max-w-4xl px-4 py-12">
        {/* Back to Blog Link */}
        <Link
          href="/blog"
          className="text-brand-navy hover:text-brand-gold group mb-8 inline-flex items-center gap-2 transition-colors dark:text-gray-300"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Back to Blog</span>
        </Link>

        {/* Featured Image */}
        <div className="relative mb-8 h-[400px] overflow-hidden rounded-lg bg-gray-200 md:h-[500px] dark:bg-gray-800">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Article Header */}
        <header className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="inline-flex items-center gap-1">
              <Calendar size={16} />
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="inline-flex items-center gap-1">
              <User size={16} />
              {post.author}
            </span>
            <span className="inline-flex items-center gap-1">
              <Tag size={16} />
              {post.category}
            </span>
            <span>{post.readTime}</span>
          </div>

          <h1 className="text-brand-navy mb-4 font-serif text-3xl leading-tight md:text-4xl lg:text-5xl dark:text-gray-100">
            {post.title}
          </h1>

          <p className="text-xl leading-relaxed text-gray-600 dark:text-gray-400">{post.excerpt}</p>
        </header>

        {/* Article Content */}
        <div
          className="prose prose-lg dark:prose-invert prose-headings:font-serif prose-headings:text-brand-navy dark:prose-headings:text-gray-100 prose-a:text-brand-gold hover:prose-a:text-brand-gold/80 prose-strong:text-brand-navy dark:prose-strong:text-gray-100 max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-brand-navy mt-12 rounded-lg p-8 text-center dark:bg-gray-800">
          <h3 className="mb-4 font-serif text-2xl text-white">Interested in Our Properties?</h3>
          <p className="mb-6 text-gray-300">
            Explore our current and completed projects to find your perfect home.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/projects/current"
              className="bg-brand-gold text-brand-navy inline-block px-6 py-3 text-xs font-bold tracking-widest uppercase transition-colors hover:bg-white"
            >
              View Current Projects
            </Link>
            <Link
              href="/contact"
              className="hover:text-brand-navy inline-block border-2 border-white px-6 py-3 text-xs font-bold tracking-widest text-white uppercase transition-colors hover:bg-white"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </article>
      <BlogDetailFAQ />
    </div>
  );
}
