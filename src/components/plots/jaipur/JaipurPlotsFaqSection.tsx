import { JAIPUR_FAQS_EN, JAIPUR_FAQS_HI, type JaipurFaqItem } from './jaipurPlotsData';

export interface JaipurPlotsFaqSectionProps {
  isHindi: boolean;
  faqs?: JaipurFaqItem[];
}

export function JaipurPlotsFaqSection({ isHindi, faqs }: JaipurPlotsFaqSectionProps) {
  const faqList = faqs ?? (isHindi ? JAIPUR_FAQS_HI : JAIPUR_FAQS_EN);

  return (
    <section className="border-t border-white/10 bg-slate-900/40 py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
            {isHindi ? 'अक्सर पूछे जाने वाले प्रश्न' : 'Buyer Questions'}
          </span>
          <h2 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
            {isHindi
              ? 'जयपुर में प्लॉट्स के बारे में अक्सर पूछे जाने वाले प्रश्न'
              : 'Frequently Asked Questions About Plots in Jaipur'}
          </h2>
        </div>

        <div className="mx-auto mt-10 max-w-3xl divide-y divide-white/10">
          {faqList.map((faq, idx) => (
            <div key={idx} className="py-5">
              <h3 className="font-serif text-lg font-bold text-white sm:text-xl">{faq.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default JaipurPlotsFaqSection;
