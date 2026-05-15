"use client";

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsConditions() {
  return (
    <div className="pt-24 pb-20 bg-brand-bg dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-gray-200 hover:text-brand-gold transition-colors mb-12">
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <h1 className="text-4xl md:text-5xl font-serif text-brand-navy dark:text-gray-100 mb-4">Terms & Conditions</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-12">Last updated: May 2026</p>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 md:p-12 space-y-8 text-gray-600 dark:text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif text-brand-navy dark:text-gray-100 mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using the SVI Infra Solutions website ("Website"), you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use this Website.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-brand-navy dark:text-gray-100 mb-4">2. Website Usage</h2>
            <p className="mb-4">You agree to use this Website only for lawful purposes and in a manner that does not infringe the rights of others or restrict their use and enjoyment of the Website.</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>You must not use the Website in any way that causes damage to the site</li>
              <li>You must not attempt to gain unauthorized access to any portion of the Website</li>
              <li>You must not use automated systems to access the Website without prior consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-brand-navy dark:text-gray-100 mb-4">3. Property Listings Disclaimer</h2>
            <p className="mb-4">The property information displayed on this Website is for informational purposes only. While we strive to provide accurate and up-to-date information:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Property details, pricing, and availability are subject to change without notice</li>
              <li>Images shown may be representative and may not reflect the actual property</li>
              <li>All measurements and specifications should be independently verified</li>
              <li>We do not guarantee the accuracy of any information provided by third parties</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-brand-navy dark:text-gray-100 mb-4">4. Registration and Forms</h2>
            <p className="mb-4">When you submit a registration or contact form:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>You confirm that the information provided is accurate and complete</li>
              <li>You consent to being contacted by our team regarding your inquiry</li>
              <li>You agree to receive property updates and promotional communications</li>
              <li>You may opt out of communications at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-brand-navy dark:text-gray-100 mb-4">5. Intellectual Property</h2>
            <p>All content on this Website, including text, images, logos, graphics, and design elements, is the property of SVI Infra Solutions Pvt. Ltd. and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our prior written consent.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-brand-navy dark:text-gray-100 mb-4">6. Limitation of Liability</h2>
            <p className="mb-4">To the maximum extent permitted by law, SVI Infra Solutions shall not be liable for:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Any indirect, incidental, or consequential damages arising from use of the Website</li>
              <li>Any errors or omissions in the content of the Website</li>
              <li>Any interruption or suspension of the Website</li>
              <li>Any decisions made based on information provided on the Website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-brand-navy dark:text-gray-100 mb-4">7. Third-Party Links</h2>
            <p>Our Website may contain links to third-party websites, including Google Maps and social media platforms. These links are provided for your convenience and do not signify our endorsement. We have no control over the content of these sites and accept no responsibility for them.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-brand-navy dark:text-gray-100 mb-4">8. Governing Law</h2>
            <p>These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Noida, Uttar Pradesh.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-brand-navy dark:text-gray-100 mb-4">9. Modifications</h2>
            <p>We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting to the Website. Your continued use of the Website after changes constitutes acceptance of the modified terms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-brand-navy dark:text-gray-100 mb-4">10. Contact Information</h2>
            <p>If you have any questions about these Terms and Conditions, please contact us at:</p>
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
