import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';

const TermsFAQ = dynamic(() => import('@/src/components/common/ProjectsFAQ'));

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.terms' });
  return {
    title: t('title'),
    description:
      'SVI Infra Solutions terms and conditions — rules and guidelines for using our website and services.',
  };
}

export default async function TermsConditions({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="bg-brand-bg min-h-screen pt-24 pb-20 dark:bg-gray-900">
      <div className="container mx-auto max-w-4xl px-4">
        <Link
          href="/"
          className="text-brand-navy hover:text-brand-gold mb-12 inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors dark:text-gray-200"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <h1 className="text-brand-navy mb-4 font-serif text-4xl md:text-5xl dark:text-gray-100">
          Terms & Conditions
        </h1>
        <p className="mb-12 text-sm text-gray-500 dark:text-gray-400">Last updated: May 2026</p>

        <div className="space-y-8 rounded-lg border border-gray-200 bg-white p-8 leading-relaxed text-gray-600 shadow-sm md:p-12 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          <section>
            <h2 className="text-brand-navy mb-4 font-serif text-2xl dark:text-gray-100">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using the SVI Infra Solutions website ("Website"), you accept and
              agree to be bound by these Terms and Conditions. If you do not agree, please do not
              use this Website.
            </p>
          </section>

          <section>
            <h2 className="text-brand-navy mb-4 font-serif text-2xl dark:text-gray-100">
              2. Website Usage
            </h2>
            <p className="mb-4">
              You agree to use this Website only for lawful purposes and in a manner that does not
              infringe the rights of others or restrict their use and enjoyment of the Website.
            </p>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>You must not use the Website in any way that causes damage to the site</li>
              <li>
                You must not attempt to gain unauthorized access to any portion of the Website
              </li>
              <li>
                You must not use automated systems to access the Website without prior consent
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-brand-navy mb-4 font-serif text-2xl dark:text-gray-100">
              3. Property Listings Disclaimer
            </h2>
            <p className="mb-4">
              The property information displayed on this Website is for informational purposes only.
              While we strive to provide accurate and up-to-date information:
            </p>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>
                Property details, pricing, and availability are subject to change without notice
              </li>
              <li>Images shown may be representative and may not reflect the actual property</li>
              <li>All measurements and specifications should be independently verified</li>
              <li>We do not guarantee the accuracy of any information provided by third parties</li>
            </ul>
          </section>

          <section>
            <h2 className="text-brand-navy mb-4 font-serif text-2xl dark:text-gray-100">
              4. Registration and Forms
            </h2>
            <p className="mb-4">When you submit a registration or contact form:</p>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>You confirm that the information provided is accurate and complete</li>
              <li>You consent to being contacted by our team regarding your inquiry</li>
              <li>You agree to receive property updates and promotional communications</li>
              <li>You may opt out of communications at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-brand-navy mb-4 font-serif text-2xl dark:text-gray-100">
              5. Intellectual Property
            </h2>
            <p>
              All content on this Website, including text, images, logos, graphics, and design
              elements, is the property of SVI Infra Solutions Pvt. Ltd. and is protected by
              intellectual property laws. You may not reproduce, distribute, or create derivative
              works without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-brand-navy mb-4 font-serif text-2xl dark:text-gray-100">
              6. Limitation of Liability
            </h2>
            <p className="mb-4">
              To the maximum extent permitted by law, SVI Infra Solutions shall not be liable for:
            </p>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>
                Any indirect, incidental, or consequential damages arising from use of the Website
              </li>
              <li>Any errors or omissions in the content of the Website</li>
              <li>Any interruption or suspension of the Website</li>
              <li>Any decisions made based on information provided on the Website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-brand-navy mb-4 font-serif text-2xl dark:text-gray-100">
              7. Third-Party Links
            </h2>
            <p>
              Our Website may contain links to third-party websites, including Google Maps and
              social media platforms. These links are provided for your convenience and do not
              signify our endorsement. We have no control over the content of these sites and accept
              no responsibility for them.
            </p>
          </section>

          <section>
            <h2 className="text-brand-navy mb-4 font-serif text-2xl dark:text-gray-100">
              8. Governing Law
            </h2>
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the
              laws of India. Any disputes arising from these terms shall be subject to the exclusive
              jurisdiction of the courts in Noida, Uttar Pradesh.
            </p>
          </section>

          <section>
            <h2 className="text-brand-navy mb-4 font-serif text-2xl dark:text-gray-100">
              9. Modifications
            </h2>
            <p>
              We reserve the right to modify these Terms and Conditions at any time. Changes will be
              effective immediately upon posting to the Website. Your continued use of the Website
              after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-brand-navy mb-4 font-serif text-2xl dark:text-gray-100">
              10. Contact Information
            </h2>
            <p>If you have any questions about these Terms and Conditions, please contact us at:</p>
            <div className="bg-brand-bg mt-4 rounded-lg p-4 dark:bg-gray-900">
              <p className="text-brand-navy font-semibold dark:text-gray-200">
                SVI Infra Solutions Pvt. Ltd.
              </p>
              <p>A-61 Sector 65, Noida, Uttar Pradesh 201309</p>
              <p>Email: info@sviinfrasolutions.com</p>
              <p>Phone: +91 73000 07643</p>
            </div>
          </section>
        </div>
      </div>
      <TermsFAQ />
    </div>
  );
}
