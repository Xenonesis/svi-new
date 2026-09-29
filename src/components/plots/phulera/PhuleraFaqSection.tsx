import { PhuleraFaqAccordion } from '@/src/components/areas/PhuleraInteractive';
import type { PhuleraFaqItem } from './phuleraData';

interface PhuleraFaqSectionProps {
  isHindi: boolean;
  faqItems: PhuleraFaqItem[];
}

export function PhuleraFaqSection({ isHindi, faqItems }: PhuleraFaqSectionProps) {
  return (
    <section className="border-t border-white/10 bg-slate-900/40 py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
              {isHindi ? 'सामान्य प्रश्न एवं उत्तर' : 'Frequently Asked Questions'}
            </span>
            <h2 className="mt-2 font-serif text-2xl font-bold text-white sm:text-4xl">
              {isHindi
                ? 'फुलेरा में ज़मीन खरीदने से जुड़े महत्वपूर्ण सवाल'
                : 'Questions About Buying Land in Phulera'}
            </h2>
            <p className="mt-2 text-xs text-slate-300 sm:text-sm">
              {isHindi
                ? 'निवेश सुरक्षा, रजिस्ट्री प्रक्रिया, और DMIC विकास से संबंधित सभी आवश्यक जानकारियां।'
                : 'Clear answers on legal conversion, investment viability, commute routes, and registry papers.'}
            </p>
          </div>

          {/* Client Accordion */}
          <PhuleraFaqAccordion items={faqItems} isHindi={isHindi} />
        </div>
      </div>
    </section>
  );
}
