import {
  TreePine,
  Church,
  Compass,
  Building2,
  Wind,
  Users,
  Train,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

interface SV13AmenitiesSectionProps {
  isHindi?: boolean;
}

export function SV13AmenitiesSection({ isHindi = false }: SV13AmenitiesSectionProps) {
  const amenities = [
    {
      icon: TreePine,
      title: isHindi ? 'लैंडस्केप पार्क' : 'Landscaped Park',
      desc: isHindi
        ? 'बच्चों के खेलने का खुला मैदान, सुव्यवस्थित वॉकवे और प्राकृतिक हरियाली से युक्त पार्क।'
        : 'Open green recreational reserve with jogging pathways, manicured flora, and seating zones.',
      tag: isHindi ? 'स्वच्छ वातावरण' : 'Green Living',
    },
    {
      icon: Church,
      title: isHindi ? 'भव्य मंदिर' : 'Beautiful Temple',
      desc: isHindi
        ? 'टाउनशिप के अंदर स्थित पवित्र मंदिर, जो पूरे समुदाय के लिए आध्यात्मिक शांति का केंद्र है।'
        : 'Dedicated sacred sanctum inside the township offering daily spiritual peace and serenity.',
      tag: isHindi ? 'आध्यात्मिक शांति' : 'Spiritual Center',
    },
    {
      icon: Compass,
      title: isHindi ? '30 फीट आंतरिक सड़कें' : '30 Ft Internal Roads',
      desc: isHindi
        ? 'आसान दो-तरफा ट्रैफिक और आपातकालीन वाहनों के लिए 30 फीट चौड़ी पक्की सड़कें।'
        : 'Spacious 30-foot arterial thoroughfares ensuring seamless dual-lane vehicle movement.',
      tag: isHindi ? 'चौड़ी सड़कें' : 'Wide Thoroughfare',
    },
    {
      icon: Building2,
      title: isHindi ? 'नियोजित आवासीय प्लॉट्स' : 'Planned Residential Plots',
      desc: isHindi
        ? '60 स्पष्ट रूप से सीमांकित एवं समतल भूखंड, वास्तु के अनुकूल दिशाओं के साथ।'
        : 'Precisely demarcated 60 residential parcels with optimized dimensions and directional facings.',
      tag: isHindi ? 'वास्तु सम्मत' : 'Vastu Oriented',
    },
    {
      icon: Wind,
      title: isHindi ? 'शांत व प्रदूषण मुक्त वातावरण' : 'Peaceful Environment',
      desc: isHindi
        ? 'शहर के शोर-शराबे और प्रदूषण से दूर, सांभर झील के शांत और प्राकृतिक परिवेश में जीवन।'
        : 'Escape congested city stress with crisp, pollution-free air and pristine natural surroundings.',
      tag: isHindi ? 'शुद्ध हवा' : 'Zero Pollution',
    },
    {
      icon: Users,
      title: isHindi ? 'पारिवारिक सुरक्षा व योजना' : 'Family-Friendly Planning',
      desc: isHindi
        ? 'गेटेड सुरक्षा बाउंड्री, सुगम आवागमन और बच्चों व वरिष्ठ नागरिकों के लिए सुरक्षित माहौल।'
        : 'Designed with secure perimeter enclosure and pedestrian-safe streets for children and elders.',
      tag: isHindi ? 'सुरक्षित समुदाय' : 'Gated Security',
    },
    {
      icon: Train,
      title: isHindi ? 'क्षेत्रीय कनेक्टिविटी' : 'Regional Connectivity',
      desc: isHindi
        ? 'फुलेरा रेलवे जंक्शन, NH-48 एक्सप्रेसवे और जयपुर तक त्वरित एवं सुगम पहुंच।'
        : 'Direct road access to Phulera Junction rail node, NH-48 Expressway, and Jaipur city.',
      tag: isHindi ? 'तीव्र पहुंच' : 'Direct Transit',
    },
    {
      icon: TrendingUp,
      title: isHindi ? 'भविष्य की विकास क्षमता' : 'Future Growth Potential',
      desc: isHindi
        ? 'DMIC और वेस्टर्न फ्रेट कॉरिडोर के विकास के साथ पूंजी वृद्धि का सुनहरा अवसर।'
        : 'Positioned in the Western DFC and DMIC logistics hub for exceptional long-term capital ROI.',
      tag: isHindi ? 'उच्च रिटर्न' : 'High ROI Node',
    },
  ];

  return (
    <section
      id="amenities"
      className="scroll-mt-20 bg-slate-50 py-20 text-slate-900 dark:bg-slate-900 dark:text-white"
    >
      <div className="container mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-amber-600 uppercase dark:text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            {isHindi ? 'सुविधाएं एवं विशेषताएं' : 'Township Amenities & Features'}
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
            {isHindi
              ? 'आधुनिक जीवन शैली के लिए हर सुविधा'
              : 'Crafted for Harmonious Community Living'}
          </h2>
          <p className="mt-4 text-base text-slate-600 sm:text-lg dark:text-slate-300">
            {isHindi
              ? 'शिवानी वाटिका 13th में हर सुविधा आपके परिवार के स्वास्थ्य, सुरक्षा और मानसिक शांति को ध्यान में रखकर तैयार की गई है।'
              : 'Every facility at Shivani Vatika 13th is purposefully integrated to elevate your daily quality of life, security, and tranquility.'}
          </p>
        </div>

        {/* 8-Item Responsive Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {amenities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl dark:border-white/10 dark:bg-slate-800/90"
              >
                {/* Top glow hover accent */}
                <div className="pointer-events-none absolute -top-12 -right-12 h-24 w-24 rounded-full bg-amber-400/10 blur-xl transition-all duration-500 group-hover:scale-150 group-hover:bg-amber-400/20" />

                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 transition-colors group-hover:bg-amber-400 group-hover:text-slate-950">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="font-sans text-lg font-bold text-slate-900 transition-colors group-hover:text-amber-500 dark:text-white dark:group-hover:text-amber-400">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
                  <span>{isHindi ? 'शामिल सुविधा' : 'Included Amenity'}</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
