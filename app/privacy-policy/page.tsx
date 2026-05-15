"use client";

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="pt-24 pb-20 bg-brand-bg dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-gray-200 hover:text-brand-gold transition-colors mb-12">
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <h1 className="text-4xl md:text-5xl font-serif text-brand-navy dark:text-gray-100 mb-4">Privacy Policy</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-12">Last updated: May 2026</p>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 md:p-12 space-y-8 text-gray-600 dark:text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif text-brand-navy dark:text-gray-100 mb-4">1. Introduction</h2>
            <p>SVI Infra Solutions Pvt. Ltd. ("we", "our", or "us") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-brand-navy dark:text-gray-100 mb-4">2. Information We Collect</h2>
            <h3 className="text-lg font-semibold text-brand-navy dark:text-gray-200 mb-2">2.1 Personal Information</h3>
            <p className="mb-4">We may collect personal information that you voluntarily provide, including:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Property interests and preferences</li>
              <li>Messages and inquiries submitted through our forms</li>
            </ul>

            <h3 className="text-lg font-semibold text-brand-navy dark:text-gray-200 mb-2 mt-6">2.2 Automatically Collected Information</h3>
            <p className="mb-4">When you visit our website, we may automatically collect:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>IP address and browser type</li>
              <li>Device information and operating system</li>
              <li>Pages visited and time spent on the website</li>
              <li>Referring website URLs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-brand-navy dark:text-gray-100 mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Respond to your inquiries and provide customer support</li>
              <li>Send property updates, newsletters, and promotional materials</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
              <li>Analyze website usage and trends</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-brand-navy dark:text-gray-100 mb-4">4. Information Sharing</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information with:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Service providers who assist in operating our website</li>
              <li>Legal authorities when required by law</li>
              <li>Business partners with your explicit consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-brand-navy dark:text-gray-100 mb-4">5. Cookies</h2>
            <p>Our website uses cookies to enhance your browsing experience. Cookies are small files stored on your device that help us remember your preferences and understand how you use our website. You can control cookie settings through your browser preferences.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-brand-navy dark:text-gray-100 mb-4">6. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-brand-navy dark:text-gray-100 mb-4">7. Your Rights</h2>
            <p className="mb-4">Depending on your location, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-brand-navy dark:text-gray-100 mb-4">8. Third-Party Links</h2>
            <p>Our website may contain links to third-party websites, including Google Maps and social media platforms. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-brand-navy dark:text-gray-100 mb-4">9. Children's Privacy</h2>
            <p>Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-brand-navy dark:text-gray-100 mb-4">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-brand-navy dark:text-gray-100 mb-4">11. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at:</p>
            <div className="mt-4 p-4 bg-brand-bg dark:bg-gray-900 rounded-lg">
              <p className="font-semibold text-brand-navy dark:text-gray-200">SVI Infra Solutions Pvt. Ltd.</p>
              <p>A-61 Sector 65, Noida, Uttar Pradesh 201309</p>
              <p>Email: info@sviinfrasolutions.com</p>
              <p>Phone: +91 73000 07643</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
