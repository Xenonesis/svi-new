import Image from 'next/image';
import {
  Compass,
  CheckCircle,
  Building2,
  TreePine,
  Church,
  Shield,
  FileCheck,
  TrendingUp,
} from 'lucide-react';

interface SV13OverviewSectionProps {
  isHindi?: boolean;
}

export function SV13OverviewSection({ isHindi = false }: SV13OverviewSectionProps) {
  const features = [
    {
      icon: Building2,
      title: isHindi ? '60 नियोजित भूखंड' : '60 Demarcated Plots',
      desc: isHindi
        ? 'विशिष्ट बुटीक टाउनशिप में स्पष्ट सीमांकन और लचीले साइज़।'
        : 'Carefully plotted layout ensuring spacious setbacks and privacy.',
    },
    {
      icon: Compass,
      title: isHindi ? '30 फीट चौड़ी सड़कें' : '30 Ft Wide Roads',
      desc: isHindi
        ? 'आंतरिक पक्की 30 फीट चौड़ी सड़कें जो सुगम आवागमन प्रदान करती हैं।'
        : 'All-weather wide arterial roads connecting every residential unit smoothly.',
    },
    {
      icon: TreePine,
      title: isHindi ? 'लैंडस्केप पार्क' : 'Landscaped Green Park',
      desc: isHindi
        ? 'बच्चों के खेलने का क्षेत्र, हरियाली और वॉकवे के साथ खुला पार्क।'
        : 'Dedicated family recreation zone with walking paths and lush trees.',
    },
    {
      icon: Church,
      title: isHindi ? 'भव्य मंदिर परिसर' : 'Community Temple',
      desc: isHindi
        ? 'टाउनशिप के भीतर शांतिपूर्ण वातावरण में स्थित सुंदर मंदिर।'
        : 'A sacred sanctum within the township providing serene spiritual ambiance.',
    },
  ];

  return (
    <section
      id="overview"
      className="scroll-mt-20 bg-white py-20 text-slate-900 dark:bg-slate-950 dark:text-white"
    >
      <div className="container mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-amber-600 uppercase dark:text-amber-400">
            <Compass className="h-3.5 w-3.5" />
            {isHindi ? 'प्रोजेक्ट अवलोकन' : 'Project Overview'}
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
            {isHindi ? 'शिवानी वाटिका 13th में आपका स्वागत है' : 'Welcome to Shivani Vatika 13th'}
          </h2>
          <p className="mt-4 text-base text-slate-600 sm:text-lg dark:text-slate-300">
            {isHindi
              ? 'सांभर-फुलेरा के तेजी से बढ़ते विकास गलियारे में स्थित एक सुनियोजित बुटीक आवासीय परियोजना, जहां शांति, सुरक्षा और समृद्धि का संगम है।'
              : 'A master-planned boutique residential development in the rapid-growth Sambhar-Phulera corridor, uniting serene nature, modern infrastructure, and tremendous capital appreciation.'}
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column: Visual Showcase Card */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-xl dark:border-white/10 dark:bg-slate-900">
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src="/Shivani Vatika 11/plot.webp"
                alt="Shivani Vatika 13th - Demarcated Residential Plots"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between text-white">
                <div>
                  <span className="text-xs font-semibold text-amber-400 uppercase">
                    {isHindi ? 'साइट का दृश्य' : 'Actual Site View'}
                  </span>
                  <p className="text-sm font-bold sm:text-base">
                    {isHindi
                      ? 'समतल, सीमांकित एवं विकसित प्लॉट्स'
                      : 'Leveled, Demarcated & Developed Plots'}
                  </p>
                </div>
                <div className="rounded-xl border border-white/20 bg-black/40 px-3 py-1.5 text-xs font-bold backdrop-blur-md">
                  60 Plots Only
                </div>
              </div>
            </div>

            {/* Bottom mini-banner */}
            <div className="grid grid-cols-2 border-t border-slate-200 p-6 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isHindi ? 'दस्तावेजीकरण' : 'Documentation'}
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {isHindi ? 'पक्की रजिस्ट्री' : 'Clear Registry'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 border-l border-slate-200 pl-4 dark:border-white/10">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isHindi ? 'निवेश लाभ' : 'Growth Potential'}
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {isHindi ? 'हाई एप्रिसिएशन' : 'High ROI Node'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Narrative and Feature Cards */}
          <div className="flex flex-col">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 uppercase dark:text-amber-400">
              <Shield className="h-3.5 w-3.5" />
              {isHindi ? 'विश्वसनीय बुनियादी ढांचा' : 'Rigorously Planned Infrastructure'}
            </div>

            <h3 className="font-serif text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
              {isHindi
                ? 'पारिवारिक सुख-शांति और सुरक्षित निवेश के लिए समर्पित'
                : 'Engineered for Peaceful Family Living & Secure Future Wealth'}
            </h3>

            <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
              {isHindi
                ? 'शिवानी वाटिका 13th सांभर-फुलेरा क्षेत्र में 60 विशेष आवासीय भूखंडों की गेटेड टाउनशिप है। यहाँ 30 फीट चौड़ी आंतरिक पक्की सड़कें, समर्पित पार्क और मंदिर जैसी मूलभूत सुविधाएं पहले से नियोजित हैं। यह टाउनशिप फुलेरा रेलवे जंक्शन और वेस्टर्न डेडिकेटेड फ्रेट कॉरिडोर (DFC) के निकट होने से तीव्र गति से विकास की ओर अग्रसर है।'
                : 'Shivani Vatika 13th is a meticulously engineered 60-plot residential community designed for discerning buyers seeking affordable land ownership without compromising on infrastructure. Featuring 30-foot internal arterial roads, community landscaping, and dedicated temple spaces, this township offers peaceful living in proximity to the burgeoning Phulera DMIC logistics and railway junction.'}
            </p>

            {/* Feature Cards Grid */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {features.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-all hover:border-amber-400/50 hover:shadow-md dark:border-white/10 dark:bg-slate-900/60"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h4 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Verification Checklist */}
            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-slate-200 pt-6 text-xs text-slate-600 dark:border-white/10 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                {isHindi ? '30 फीट चौड़ा मुख्य प्रवेश द्वार' : '30 Ft Wide Grand Entrance'}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                {isHindi ? 'सीमांकित एवं नंबरीकृत भूखंड' : 'Demarcated Plot Numbers'}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                {isHindi ? 'आसान मासिक किस्त विकल्प' : 'Flexible Monthly Installment Plan'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
