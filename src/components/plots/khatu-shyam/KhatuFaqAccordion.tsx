import { ChevronDown } from 'lucide-react';
import { type FAQItem, KHATU_FAQS_EN, KHATU_FAQS_HI } from './khatuData';

interface KhatuFaqAccordionProps {
  isHindi: boolean;
  faqs?: FAQItem[];
}

export function KhatuFaqAccordion({ isHindi, faqs }: KhatuFaqAccordionProps) {
  const faqList = faqs ?? (isHindi ? KHATU_FAQS_HI : KHATU_FAQS_EN);

  return (
    <section className="border-t border-white/10 bg-slate-900/40 py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
            {isHindi ? 'अक्सर पूछे जाने वाले सवाल' : 'Buyer Intelligence'}
          </span>
          <h2 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
            {isHindi
              ? 'खाटू श्याम जी के पास प्लॉट्स से जुड़े महत्वपूर्ण सवाल'
              : 'Frequently Asked Questions About Plots Near Khatu Shyam Ji'}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-xs text-slate-400 sm:text-sm">
            {isHindi
              ? 'दूरी, कानूनी स्वीकृति, मूल्य और बुकिंग प्रक्रिया से संबंधित सभी तथ्य।'
              : 'Everything you need to know about distances, legal titles, plot sizes, and buying procedures.'}
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl space-y-4">
          {faqList.map((faq, idx) => (
            <details
              key={idx}
              className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all duration-200 open:border-amber-500/40 open:bg-white/[0.04] hover:border-amber-500/30"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-base font-bold text-white transition-colors group-open:text-amber-300 sm:text-lg">
                <span>{faq.question}</span>
                <ChevronDown className="h-5 w-5 shrink-0 text-amber-400 transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="mt-3 border-t border-white/5 pt-3 text-xs leading-relaxed text-slate-300 sm:text-sm">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
