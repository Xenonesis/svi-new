"use client";

import { motion, AnimatePresence } from 'motion/react';
import { useCallback, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

const FAQ_DATA = [
  // Buying Process
  {
    category: "Buying Process",
    question: "What makes SVI Infra Solutions different from other real estate developers?",
    answer: "SVI Infra focuses on strategic locations, government-approved projects, and timely delivery. We ensure clear titles, transparent documentation, and a customer-centric approach that prioritizes long-term appreciation for our investors."
  },
  {
    category: "Buying Process",
    question: "How can I book a property or schedule a site visit?",
    answer: "You can easily schedule a site visit or book a property by filling out the Registration form on our website, or by contacting our sales team directly via phone or email."
  },
  {
    category: "Buying Process",
    question: "What is the booking process for your properties?",
    answer: "The booking process involves selecting your preferred unit, paying a token amount (typically ₹1-2 lakhs), signing the booking agreement, and completing documentation within 7-14 days. Our team assists you at every step."
  },
  {
    category: "Buying Process",
    question: "What documents are required for property purchase?",
    answer: "Required documents include PAN card, Aadhaar card, address proof, income proof (for home loans), passport-size photographs, and bank statements. For NRIs, additional documents like passport and visa copies are required."
  },
  {
    category: "Buying Process",
    question: "Can I customize my apartment or plot before possession?",
    answer: "Yes, we offer customization options during the construction phase. You can discuss layout modifications, flooring choices, and fixture preferences with our design team, subject to structural feasibility."
  },
  {
    category: "Buying Process",
    question: "What payment plans do you offer?",
    answer: "We offer flexible payment plans including Down Payment Plan, Construction-linked Plan, and Time-bound Payment Plan. Each plan is designed to suit different financial needs and cash flow requirements."
  },
  {
    category: "Buying Process",
    question: "Is there a cancellation policy if I change my mind?",
    answer: "Yes, cancellations are allowed as per RERA guidelines. Cancellation charges apply based on the stage of construction and time elapsed since booking. Please refer to your booking agreement for specific terms."
  },
  {
    category: "Buying Process",
    question: "How do I track the progress of my property construction?",
    answer: "We provide regular construction updates via email, WhatsApp, and our customer portal. You can also schedule site visits to personally inspect the progress at any time."
  },
  
  // Investment & Finance
  {
    category: "Investment",
    question: "Do you provide assistance with home loans?",
    answer: "Absolutely! We have tied up with several leading banks and financial institutions including SBI, HDFC, ICICI, and Axis Bank to facilitate smooth and hassle-free home loan processing for our customers."
  },
  {
    category: "Investment",
    question: "What is the expected ROI on SVI Infra properties?",
    answer: "Based on historical performance, our properties have delivered 12-18% annual appreciation. However, actual returns depend on location, market conditions, and holding period. Past performance doesn't guarantee future results."
  },
  {
    category: "Investment",
    question: "Are your properties suitable for NRI investment?",
    answer: "Yes, many of our projects are popular among NRIs. We provide dedicated NRI support including virtual site tours, remote documentation assistance, and coordination with RBI-compliant payment channels."
  },
  {
    category: "Investment",
    question: "Can I get rental income from SVI Infra properties?",
    answer: "Yes, our completed projects in prime locations generate healthy rental yields. We also offer property management services to help you manage tenants and maintenance."
  },
  {
    category: "Investment",
    question: "What tax benefits can I avail on property purchase?",
    answer: "Under Section 80C, you can claim deduction up to ₹1.5 lakh on principal repayment. Under Section 24(b), interest on home loan up to ₹2 lakh is deductible. Consult a tax advisor for personalized advice."
  },
  {
    category: "Investment",
    question: "Do you offer resale or exit options for investors?",
    answer: "Yes, once the project is completed and registered, you can resell your property. We also maintain a resale portal to connect buyers and sellers within our community."
  },
  
  // Project-Specific
  {
    category: "Project-Specific",
    question: "Are all your projects government approved?",
    answer: "Yes, all our projects undergo rigorous legal and technical due diligence and have the necessary approvals from local development authorities like JDA, RERA, and municipal corporations. We believe in 100% transparency."
  },
  {
    category: "Project-Specific",
    question: "Which regions do you primarily operate in?",
    answer: "We are based in Noida, but we strategically operate across expanding regions with high appreciation potential, such as the Phulera Smart City, Jaipur, and the DMIC/DFC corridors in Rajasthan."
  },
  {
    category: "Project-Specific",
    question: "What amenities are included in your residential projects?",
    answer: "Our projects typically include clubhouse, swimming pool, gymnasium, landscaped gardens, children's play area, jogging tracks, 24/7 security, power backup, water supply, and covered parking. Premium projects may include additional features."
  },
  {
    category: "Project-Specific",
    question: "How do you ensure quality construction?",
    answer: "We use premium-grade materials, engage reputed contractors, conduct third-party quality audits, and follow strict QC protocols. All construction adheres to NBC (National Building Code) standards."
  },
  {
    category: "Project-Specific",
    question: "What is the typical timeline for project completion?",
    answer: "Residential projects typically take 3-5 years from launch to completion, depending on size and complexity. We commit realistic timelines in our RERA registration and strive for on-time or early delivery."
  },
  {
    category: "Project-Specific",
    question: "Do you offer possession guarantees?",
    answer: "Yes, as per RERA regulations, we commit to possession dates in our agreements. In case of delays beyond our control, compensation is provided as per statutory guidelines."
  },
  {
    category: "Project-Specific",
    question: "What happens if there's a delay in project delivery?",
    answer: "In case of delays attributable to us, we pay interest as per RERA guidelines (SBI MCLR + 2%). Force majeure events like natural disasters or regulatory changes may extend timelines without penalty."
  },
  
  // Legal & Compliance
  {
    category: "Legal & Compliance",
    question: "Are the property titles clear and litigation-free?",
    answer: "Yes, we conduct thorough title verification through legal experts before launching any project. All our properties have clear, marketable titles free from encumbrances and litigation."
  },
  {
    category: "Legal & Compliance",
    question: "Is SVI Infra RERA registered?",
    answer: "Yes, all our eligible projects are registered with the Real Estate Regulatory Authority (RERA). You can verify our registration details on the respective state RERA websites."
  },
  {
    category: "Legal & Compliance",
    question: "What warranties do you provide on construction?",
    answer: "We provide a 5-year structural warranty and 1-year warranty on fixtures and fittings. Any defects reported during this period are rectified free of cost."
  },
  {
    category: "Legal & Compliance",
    question: "How do you handle customer grievances?",
    answer: "We have a dedicated grievance redressal mechanism. You can raise concerns through our website, email, or customer care. Most issues are resolved within 7-15 working days."
  }
];

export default function FAQ() {
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);

  const toggleFaq = useCallback((index: number) => {
    setActiveFaqIndex((prev) => (prev === index ? null : index));
  }, []);

  // Generate FAQPage structured data
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_DATA.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  // Group FAQs by category
  const groupedFaqs = FAQ_DATA.reduce((acc, faq) => {
    const category = faq.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(faq);
    return acc;
  }, {} as Record<string, typeof FAQ_DATA>);

  return (
    <div className="pt-20 pb-16 bg-brand-bg dark:bg-[#0C0C0C] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <section className="bg-brand-bg dark:bg-gray-900 py-14 md:py-20 text-center border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif text-brand-navy dark:text-gray-100 mb-6 animate-hero-h1">
            Frequently Asked Questions
          </h1>
          <div className="w-16 h-px bg-brand-gold mx-auto mb-6 animate-hero-divider"></div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Find answers to common questions about our projects and services.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          {Object.entries(groupedFaqs).map(([category, questions], catIndex) => (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-serif text-brand-navy dark:text-gray-100 mb-6 pb-2 border-b-2 border-brand-gold inline-block">
                {category}
              </h2>
              <div className="space-y-4">
                {questions.map((faq, index) => {
                  const globalIndex = FAQ_DATA.indexOf(faq);
                  return (
                    <motion.div
                      key={globalIndex}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '0px', amount: 0.05 }}
                      transition={{ delay: index * 0.06 }}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
                    >
                      <button
                        onClick={() => toggleFaq(globalIndex)}
                        className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                      >
                        <span className="font-serif text-xl text-brand-navy dark:text-gray-100 pr-4">
                          {faq.question}
                        </span>
                        <motion.div
                          animate={{ rotate: activeFaqIndex === globalIndex ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex-shrink-0 text-brand-gold"
                        >
                          <ChevronDown size={20} />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {activeFaqIndex === globalIndex ? (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="px-6 pb-6 pt-2 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700/50">
                              {faq.answer}
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="text-gray-600 dark:text-gray-400 mb-6">Still have questions?</p>
            <Link href="/contact" className="inline-flex bg-brand-navy dark:bg-brand-gold text-white dark:text-brand-navy px-8 py-4 font-bold uppercase text-xs tracking-widest transition-colors hover:bg-brand-gold hover:text-brand-navy border border-brand-navy dark:border-brand-gold shadow-md hover:shadow-xl">
              Contact Our Team
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
