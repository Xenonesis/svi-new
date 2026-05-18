"use client";

import { motion } from 'motion/react';
import Image from 'next/image';
import { ArrowRight, Calendar, User } from 'lucide-react';
import Link from 'next/link';

const BLOG_POSTS = [
  {
    id: 1,
    title: "Why Jaipur is Becoming the Next Big IT Hub",
    excerpt: "Explore the infrastructure developments and government initiatives driving IT giants to set up campuses in Jaipur, making it a prime real estate investment destination.",
    date: "Oct 12, 2023",
    author: "SVI Research Team",
    category: "Market Trends",
    image: "/images/blog1.png"
  },
  {
    id: 2,
    title: "Construction Update: Shyam Aangan Phase 1",
    excerpt: "We are thrilled to announce that Phase 1 of Shyam Aangan is progressing ahead of schedule. Read on to see the latest site photos and development milestones.",
    date: "Sep 28, 2023",
    author: "Project Management",
    category: "Company News",
    image: "/images/blog2.png"
  },
  {
    id: 3,
    title: "5 Tips for First-Time Property Buyers in India",
    excerpt: "Navigating the real estate market can be daunting. Here are our top 5 essential tips to ensure a smooth, secure, and profitable property buying experience.",
    date: "Sep 15, 2023",
    author: "Priya Desai",
    category: "Investment Guide",
    image: "/images/blog3.png"
  }
];

export default function Blog() {
  // BreadcrumbList Structured Data
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://sviiinfrasolutions.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://sviiinfrasolutions.com/blog',
      },
    ],
  };

  return (
    <div className="pt-24 pb-20 bg-gray-50 dark:bg-[#0C0C0C] min-h-screen">
      {/* BreadcrumbList Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <section className="bg-brand-navy dark:bg-gray-900 py-20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)', backgroundSize: '40px 40px' }}></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif text-white leading-tight mb-6"
          >
            Insights &amp; Updates
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-px bg-brand-gold mx-auto mb-6"
          ></motion.div>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
            Stay informed with the latest market trends, investment guides, and updates from SVI Infra Solutions.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {BLOG_POSTS.map((post, idx) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.15, ease: "easeOut" }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:-translate-y-2 hover:shadow-2xl transition-all duration-400 flex flex-col group overflow-hidden"
            >
              <div className="relative h-60 overflow-hidden">
                <Image 
                  src={post.image} 
                  alt={post.title}
                  fill
                  quality={85}
                  className="object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-brand-gold text-brand-navy text-[10px] font-bold uppercase tracking-widest px-3 py-1 shadow-sm">
                  {post.category}
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-4 text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-4">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                  <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
                </div>
                <h3 className="text-2xl font-serif text-brand-navy dark:text-white mb-4 group-hover:text-brand-gold transition-colors">{post.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-8 flex-grow">
                  {post.excerpt}
                </p>
                <Link href={`/blog/${post.id}`} className="text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-brand-gold inline-flex items-center gap-2 group-hover:text-brand-gold dark:group-hover:text-white transition-colors mt-auto">
                  Read Article <ArrowRight size={14} />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
