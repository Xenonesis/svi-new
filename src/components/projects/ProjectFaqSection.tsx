'use client';

import { Link } from '@/src/i18n/navigation';
import { useState, useCallback } from 'react';
import { ChevronDown, HelpCircle, PhoneCall, Calendar, ShieldCheck, MapPin } from 'lucide-react';
import { FAQSchema } from '@/src/components/common/Schema';

export interface ProjectFaqItem {
  id: string;
  question: string;
  questionHi: string;
  answer: string;
  answerHi: string;
  category?: string;
  categoryHi?: string;
}

export const SHIVANI_VATIKA_FAQS: ProjectFaqItem[] = [
  {
    id: 'what-is-shivani-vatika-11th',
    category: 'Project Overview',
    categoryHi: 'प्रोजेक्ट अवलोकन',
    question: 'What is Shivani Vatika 11th?',
    questionHi: 'शिवानी वाटिका 11th क्या है?',
    answer:
      'Shivani Vatika 11th is a master-planned residential plotted township spread across 11.5 Bigha (approx. 30,480 sq. yds.) developed by SVI Infra Solutions. The township features 230 premium residential plots ranging from 80 sq. yds. to 250 sq. yds. It is equipped with essential modern infrastructure including a grand entrance gate, 24/7 security with CCTV surveillance, wide internal roads (30 ft and 24 ft), landscaped parks, reliable electrification, water supply, and complete boundary demarcation.',
    answerHi:
      'शिवानी वाटिका 11th एसवीआई इन्फ्रा सॉल्यूशंस (SVI Infra Solutions) द्वारा विकसित 11.5 बीघा (लगभग 30,480 वर्ग गज) में फैली एक सुनियोजित आवासीय टाउनशिप है। इसमें 80 से 250 वर्ग गज आकार के कुल 230 आवासीय भूखंड उपलब्ध हैं। यह टाउनशिप भव्य मुख्य प्रवेश द्वार, सीसीटीवी व 24/7 सुरक्षा, चौड़ी सड़कें (30 व 24 फीट), पार्क, बिजली-पानी आपूर्ति और बाउंड्री वॉल जैसी आधुनिक सुविधाओं से सुसज्जित है।',
  },
  {
    id: 'location-shivani-vatika-11th',
    category: 'Location & Access',
    categoryHi: 'स्थान एवं कनेक्टिविटी',
    question: 'Where is Shivani Vatika 11th located?',
    questionHi: 'शिवानी वाटिका 11th कहाँ स्थित है?',
    answer:
      'Shivani Vatika 11th is strategically located with direct frontage on the Jaipur to Khatu Shyam Ji Highway at Harsholi, Kishangarh Renwal (Pin: 303603). It is positioned just 1 km (2 minutes drive) from the 64-acre operational RIICO Industrial Area Renwal, 7 km (5 minutes drive) from Renwal Railway Station (RNW), and provides uninterrupted arterial access toward Jaipur City, Phulera DMIC Junction, and Khatu Shyam Ji Dham.',
    answerHi:
      'शिवानी वाटिका 11th जयपुर से खाटू श्याम जी राजमार्ग पर हरसोली, किशनगढ़ रेणवाल (पिन: 303603) में मुख्य सड़क पर स्थित है। यह 64 एकड़ में विस्तृत रीको औद्योगिक क्षेत्र (रेणवाल) से मात्र 1 किमी (2 मिनट) और रेणवाल रेलवे स्टेशन (RNW) से 7 किमी (5 मिनट) की दूरी पर स्थित है, जहाँ से जयपुर शहर, फुलेरा DMIC जंक्शन और खाटू धाम के लिए सीधा आवागमन है।',
  },
  {
    id: 'distance-khatu-shyam-temple',
    category: 'Spiritual Corridor',
    categoryHi: 'तीर्थ कॉरिडोर',
    question: 'How far is Shivani Vatika 11th from Khatu Shyam Ji Temple?',
    questionHi: 'शिवानी वाटिका 11th से खाटू श्याम जी मंदिर कितनी दूरी पर है?',
    answer:
      'Shivani Vatika 11th is located approximately 25 to 28 km from Shree Khatu Shyam Ji Mandir, translating to a smooth 20 to 25 minutes drive along the direct 4-lane highway corridor. Because the project sits directly on the primary pilgrimage route, it enjoys sustained commercial footfall, hospitality potential, and solid capital appreciation.',
    answerHi:
      'शिवानी वाटिका 11th श्री खाटू श्याम जी मंदिर से लगभग 25 से 28 किमी की दूरी पर स्थित है, जहाँ सीधे 4-लेन राजमार्ग द्वारा केवल 20 से 25 मिनट में पहुँचा जा सकता है। तीर्थ यात्रा मार्ग पर मुख्य हाईवे फ्रंट पर होने के कारण यहाँ साल भर श्रद्धालुओं का आवागमन रहता है जिससे जमीन के दामों में निरंतर वृद्धि हो रही है।',
  },
  {
    id: 'plot-sizes-available',
    category: 'Plot Options',
    categoryHi: 'प्लॉट विकल्प',
    question: 'What plot sizes are available in Shivani Vatika 11th?',
    questionHi: 'शिवानी वाटिका 11th में कौन-कौन से प्लॉट साइज उपलब्ध हैं?',
    answer:
      'The township offers 230 well-demarcated residential plots catering to varied residential and investment requirements, ranging from 80 sq. yds. to 250 sq. yds. Options include compact villa plots (80–150 Sq. Yds.), standard family plots (150–200 Sq. Yds.), and spacious corner/wide-frontage plots (200–250 Sq. Yds.) adjacent to 30-foot arterial roads.',
    answerHi:
      'टाउनशिप में विभिन्न परिवारों और निवेशकों की आवश्यकताओं के अनुकूल 80 वर्ग गज से लेकर 250 वर्ग गज तक के 230 आवासीय भूखंड उपलब्ध हैं। इनमें कॉम्पैक्ट विला प्लॉट्स (80-150 वर्ग गज), मानक आवासीय प्लॉट्स (150-200 वर्ग गज), और 30 फीट चौड़ी सड़कों के पास स्थित बड़े कॉर्नर प्लॉट्स (200-250 वर्ग गज) के विकल्प शामिल हैं।',
  },
  {
    id: 'pricing-payment-options',
    category: 'Pricing & Finance',
    categoryHi: 'मूल्य एवं भुगतान',
    question: 'What are the pricing and payment options?',
    questionHi: 'प्लॉट्स की कीमतें और भुगतान के विकल्प क्या हैं?',
    answer:
      'Residential plots at Shivani Vatika 11th start from ₹ 7,500 per sq. yd., meaning an 80 sq. yd. plot starts at approximately ₹ 15 Lakhs*. SVI Infra Solutions guarantees transparent developer pricing without brokerage or hidden development charges, along with flexible construction-linked payment milestones and seamless bank loan assistance.',
    answerHi:
      'शिवानी वाटिका 11th में आवासीय प्लॉट्स की कीमतें मात्र ₹ 7,500 प्रति वर्ग गज से शुरू होती हैं, यानी 80 वर्ग गज का प्लॉट लगभग ₹ 15 लाख* से उपलब्ध है। एसवीआई इन्फ्रा सॉल्यूशंस बिना किसी छुपे शुल्क या ब्रोकरेज के 100% पारदर्शी मूल्य निर्धारण, निर्माण-आधारित आसान किस्त योजनाएं और प्रमुख बैंकों से त्वरित लोन सहायता प्रदान करता है।',
  },
  {
    id: 'approvals-documentation',
    category: 'Legal & Approvals',
    categoryHi: 'दस्तावेज एवं अनुमतियां',
    question: 'What approvals and documentation are available?',
    questionHi: 'परियोजना के कौन से दस्तावेज और वैधानिक अनुमतियां उपलब्ध हैं?',
    answer:
      'Shivani Vatika 11th is fully legally verified with Section 90-A land conversion approval, clear marketable title deeds, approved master layout plans, and 100% registry readiness. Each buyer receives complete chain documentation, official conversion certificates, and immediate registry-possession upon purchase.',
    answerHi:
      'शिवानी वाटिका 11th 100% स्पष्ट दस्तावेजों वाली टाउनशिप है जिसमें राजस्थान भू-राजस्व अधिनियम की धारा 90-ए (Section 90-A) रूपांतरण स्वीकृति, स्पष्ट मालिकाना हक (क्लियर टाइटल), स्वीकृत लेआउट प्लान और तुरंत पक्की रजिस्ट्री की सुविधा उपलब्ध है। सभी खरीदारों को पूर्ण वैधानिक सुरक्षा और पारदर्शिता के साथ तुरंत कब्जा व दस्तावेज सौंपे जाते हैं।',
  },
  {
    id: 'book-free-site-visit',
    category: 'Site Visit',
    categoryHi: 'साइट विजिट',
    question: 'How can I book a free cab site visit?',
    questionHi: 'फ्री कैब साइट विजिट कैसे बुक कर सकते हैं?',
    answer:
      'SVI Infra Solutions provides complimentary doorstep AC cab pickup and drop services for prospective buyers across Jaipur City, Jaipur Junction, Renwal Station, or the Airport. You can reserve your visit by submitting the booking form on this page, tapping the WhatsApp button, or calling our direct desk at +91-73000-07643. Our representative will arrange a prompt escorted tour at your preferred time.',
    answerHi:
      'एसवीआई इन्फ्रा सॉल्यूशंस जयपुर शहर, रेलवे स्टेशन, एयरपोर्ट या किसी भी नजदीकी स्थान से खरीदारों के लिए पूरी तरह निशुल्क (फ्री) एसी कैब पिकअप व ड्रॉप की सुविधा देता है। आप इस पेज पर दिए गए फॉर्म को भरकर, व्हाट्सएप पर संदेश भेजकर या हेल्पलाइन +91-73000-07643 पर कॉल करके अपनी सुविधाजनक तारीख व समय पर साइट विजिट बुक कर सकते हैं।',
  },
];

interface ProjectFaqSectionProps {
  isHindi?: boolean;
  projectName?: string;
  items?: ProjectFaqItem[];
}

export default function ProjectFaqSection({
  isHindi = false,
  projectName = 'Shivani Vatika 11th',
  items = SHIVANI_VATIKA_FAQS,
}: ProjectFaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = useCallback((index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  }, []);

  // Format schema items for Google rich results
  const schemaQuestions = items.map((item) => ({
    question: isHindi ? item.questionHi : item.question,
    answer: isHindi ? item.answerHi : item.answer,
  }));

  return (
    <section id="project-faqs" className="mt-20 w-full scroll-mt-24">
      {/* Schema.org FAQPage structured data */}
      <FAQSchema questions={schemaQuestions} />

      <div className="container mx-auto max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-[#0c1220] via-[#080d19] to-[#050811] p-6 shadow-2xl sm:p-10">
          <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

          {/* Header */}
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-bold tracking-wider text-amber-300 uppercase">
              <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
              <span>{isHindi ? 'अक्सर पूछे जाने वाले प्रश्न' : 'Buyer FAQ & Due Diligence'}</span>
            </div>

            <h2 className="mt-3.5 font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              {isHindi
                ? `${projectName} — सामान्य जिज्ञासाएं एवं सटीक समाधान`
                : `Frequently Asked Questions About ${projectName}`}
            </h2>

            <p className="mt-2.5 text-sm leading-relaxed text-slate-300 sm:text-base">
              {isHindi
                ? 'स्थान, 90-ए दस्तावेज, खाटू धाम से दूरी, प्लॉट साइज, मूल्य निर्धारण एवं फ्री साइट विजिट से संबंधित सभी आधिकारिक जानकारियां।'
                : 'Clear, authoritative answers regarding land conversion, registry approvals, temple proximity, plot dimensions, and visiting procedures.'}
            </p>
          </div>

          {/* Accordion List */}
          <div className="relative z-10 mt-8 space-y-3.5">
            {items.map((faq, index) => {
              const isOpen = openIndex === index;
              const question = isHindi ? faq.questionHi : faq.question;
              const answer = isHindi ? faq.answerHi : faq.answer;
              const category = isHindi ? faq.categoryHi : faq.category;

              return (
                <div
                  key={faq.id}
                  className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                    isOpen
                      ? 'border-amber-400/40 bg-white/[0.06] shadow-lg shadow-amber-500/5'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faq.id}`}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left focus:outline-none sm:p-6"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                      {category && (
                        <span className="inline-block w-fit rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-amber-300 uppercase">
                          {category}
                        </span>
                      )}
                      <span className="font-serif text-base font-bold text-white transition-colors sm:text-lg">
                        {question}
                      </span>
                    </div>

                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-transform duration-200 ${
                        isOpen
                          ? 'rotate-180 border-amber-400 bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                          : 'border-white/20 bg-white/5 text-slate-300'
                      }`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      id={`faq-answer-${faq.id}`}
                      role="region"
                      aria-labelledby={`faq-question-${faq.id}`}
                      className="animate-in fade-in border-t border-white/10 px-5 pt-3 pb-6 text-sm leading-relaxed text-slate-300 duration-200 sm:px-6 sm:text-base"
                    >
                      <p>{answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Help & Free Cab Visit Footer Banner */}
          <div className="relative z-10 mt-10 flex flex-col items-center justify-between gap-6 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent p-6 backdrop-blur-md sm:flex-row">
            <div>
              <div className="flex items-center gap-2 text-amber-300">
                <ShieldCheck className="h-5 w-5 text-amber-400" />
                <h3 className="font-serif text-base font-bold text-white sm:text-lg">
                  {isHindi ? 'क्या आपके पास कोई अन्य सवाल है?' : 'Have More Specific Questions?'}
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-300 sm:text-sm">
                {isHindi
                  ? 'हमारे रियल एस्टेट विशेषज्ञों से सीधे बात करें या अपनी सुविधा अनुसार फ्री एसी कैब बुक करें।'
                  : 'Speak directly with our land advisory desk or schedule a free site tour cab from Jaipur.'}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <a
                href="tel:+917300007643"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold tracking-wider text-white uppercase backdrop-blur-md transition-colors hover:border-amber-400/50 hover:bg-white/10"
              >
                <PhoneCall className="h-4 w-4 text-amber-400" />
                <span>+91 73000-07643</span>
              </a>

              <Link
                href="/contact?project=shivani-vatika-11th"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold tracking-wider text-slate-950 uppercase shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500"
              >
                <Calendar className="h-4 w-4" />
                <span>{isHindi ? 'फ्री कैब बुक करें' : 'Schedule Free Cab'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
