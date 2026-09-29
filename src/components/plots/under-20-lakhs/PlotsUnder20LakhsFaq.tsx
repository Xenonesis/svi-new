import { BUDGET_FAQS } from './plotsUnder20LakhsData';

interface PlotsUnder20LakhsFaqProps {
  isHindi: boolean;
}

export function PlotsUnder20LakhsFaq({ isHindi }: PlotsUnder20LakhsFaqProps) {
  return (
    <section className="border-t border-white/10 bg-slate-900/40 py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-serif text-2xl font-bold text-white sm:text-3xl">
            {isHindi ? 'बजट प्लॉट खरीद से जुड़े सवाल (FAQ)' : 'Budget Plot Buying FAQs'}
          </h2>
          <div className="mt-8 divide-y divide-white/10">
            {BUDGET_FAQS.map((faq, i) => (
              <div key={i} className="py-4">
                <h3 className="font-serif text-base font-bold text-white sm:text-lg">
                  {faq.question}
                </h3>
                <p className="mt-1.5 text-sm text-slate-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
