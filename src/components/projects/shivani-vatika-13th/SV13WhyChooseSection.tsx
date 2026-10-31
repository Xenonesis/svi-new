import {
  Compass,
  TreePine,
  TrendingUp,
  ShieldCheck,
  Coins,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface SV13WhyChooseSectionProps {
  isHindi?: boolean;
}

export function SV13WhyChooseSection({ isHindi = false }: SV13WhyChooseSectionProps) {
  const benefits = [
    {
      num: '01',
      icon: Compass,
      title: isHindi ? 'विचारशील एवं व्यवस्थित योजना' : 'Thoughtful Planning',
      headline: isHindi
        ? '60 सीमांकित प्लॉट्स व 30 फीट चौड़ी सड़कें'
        : '60 Demarcated Plots with 30 Ft Wide Arterial Roads',
      desc: isHindi
        ? 'हर भूखंड तक सीधी 30 फीट चौड़ी पहुंच, वास्तु सम्मत दिशाएं और भविष्य के निर्माण के लिए आदर्श लेआउट।'
        : 'Engineered master planning providing direct 30-foot road access to every plot, clear boundary stones, and optimal ventilation.',
    },
    {
      num: '02',
      icon: TreePine,
      title: isHindi ? 'शांत व प्राकृतिक परिवेश' : 'Peaceful Environment',
      headline: isHindi
        ? 'शहर के प्रदूषण और भीड़ से मुक्त जीवन'
        : 'Pollution-Free Serene Living Near Sambhar Lake',
      desc: isHindi
        ? 'सांभर झील के प्राकृतिक वेटलैंड और पक्षी अभयारण्य के नजदीक स्वच्छ, ताजी हवा और सुकून भरा वातावरण।'
        : 'Breathe clean, rejuvenating air surrounded by pristine nature and the scenic horizons of Sambhar salt wetland.',
    },
    {
      num: '03',
      icon: TrendingUp,
      title: isHindi ? 'तेजी से बढ़ता रणनीतिक स्थान' : 'Growing Location',
      headline: isHindi
        ? 'फुलेरा जंक्शन एवं DMIC लॉजिस्टिक्स हब'
        : 'Phulera Junction & Western DFC Logistics Growth',
      desc: isHindi
        ? 'उत्तर पश्चिम रेलवे का प्रमुख जंक्शन और दिल्ली-मुंबई औद्योगिक कॉरिडोर से जुड़ने वाला प्रमुख आर्थिक केंद्र।'
        : 'Prime transit geography backed by North Western Railway junction infrastructure and surging commercial freight corridors.',
    },
    {
      num: '04',
      icon: ShieldCheck,
      title: isHindi ? 'पारिवारिक सुरक्षा व समुदाय' : 'Family-Friendly Development',
      headline: isHindi
        ? 'गेटेड सोसाइटी, पार्क और मंदिर परिसर'
        : 'Gated Security, Green Park & Community Temple',
      desc: isHindi
        ? 'चारों तरफ सुरक्षित बाउंड्री वॉल, बच्चों के खेलने के लिए पार्क और प्रतिदिन दर्शन के लिए मंदिर की सुविधा।'
        : 'A self-contained safe haven featuring perimeter boundary, secure entrance gate, and a central devotion sanctuary.',
    },
    {
      num: '05',
      icon: Coins,
      title: isHindi ? 'दीर्घकालिक पूंजी मूल्य लाभ' : 'Long-Term Value Potential',
      headline: isHindi
        ? 'मात्र ₹9,999 प्रति माह का आसान प्लान'
        : 'Easy ₹9,999/Month Terms with Exponential Capital Appreciation',
      desc: isHindi
        ? 'कम लागत में अपनी जमीन का मालिकाना हक, 40 महीने की आसान किस्तें और भविष्य में मजबूत रिटर्न की गारंटी।'
        : 'Zero-pressure 40-month phased installments ensuring immediate asset ownership with lucrative long-term appreciation.',
    },
  ];

  return (
    <section id="why-choose" className="scroll-mt-20 bg-slate-900 py-20 text-white">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-amber-300 uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            {isHindi ? 'विशेष लाभ एवं विशेषताएं' : 'Core Value Propositions'}
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {isHindi ? 'शिवानी वाटिका 13th क्यों चुनें?' : 'Why Choose Shivani Vatika 13th?'}
          </h2>
          <p className="mt-4 text-base text-slate-300 sm:text-lg">
            {isHindi
              ? 'पांच ठोस कारण जो शिवानी वाटिका 13th को आपके परिवार के भविष्य और निवेश के लिए सर्वोत्तम बनाते हैं।'
              : 'Five definitive pillars that make Shivani Vatika 13th an unmatched residential and wealth-building destination.'}
          </p>
        </div>

        {/* 5 Benefits Cards Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-800/80 p-8 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-amber-400 hover:shadow-2xl"
              >
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-400 transition-colors group-hover:bg-amber-400 group-hover:text-slate-950">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-mono text-2xl font-black text-slate-600 transition-colors group-hover:text-amber-400">
                      {item.num}
                    </span>
                  </div>

                  <span className="text-xs font-bold tracking-wider text-amber-300 uppercase">
                    {item.title}
                  </span>

                  <h3 className="mt-2 font-serif text-xl font-bold text-white transition-colors group-hover:text-amber-300">
                    {item.headline}
                  </h3>

                  <p className="mt-3 text-xs leading-relaxed text-slate-400">{item.desc}</p>
                </div>

                <div className="mt-8 flex items-center gap-2 border-t border-white/10 pt-4 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isHindi ? 'गारंटीकृत सुविधा' : 'Guaranteed Feature'}</span>
                </div>
              </div>
            );
          })}

          {/* 6th Card: SVI Infra Corporate Commitment Card */}
          <div className="relative flex flex-col justify-between rounded-3xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/15 via-slate-800 to-amber-700/15 p-8 shadow-xl">
            <div>
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300 uppercase">
                <ShieldCheck className="h-4 w-4" />
                <span>SVI Trust Assurance</span>
              </div>

              <h3 className="font-serif text-2xl font-bold text-white">
                {isHindi ? 'एसवीआई इंफ्रा का अटूट भरोसा' : 'The SVI Infra Commitment'}
              </h3>

              <p className="mt-4 text-xs leading-relaxed text-slate-300">
                {isHindi
                  ? 'समय पर डिलीवरी, पक्के कानूनी दस्तावेज, दाखिल-खारिज सहयोग और पारदर्शी लेन-देन। हजारों संतुष्ट ग्राहकों का विश्वास हमारी असली पहचान है।'
                  : 'Timely execution, transparent registries, mutation assistance, and clear titles backed by years of dedicated infrastructure leadership in Rajasthan.'}
              </p>
            </div>

            <div className="mt-8">
              <a
                href="#enquiry"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3.5 text-xs font-extrabold tracking-wider text-slate-950 uppercase transition-colors hover:bg-amber-300"
              >
                <span>{isHindi ? 'अभी प्लॉट बुक करें' : 'Reserve Your Plot Today'}</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
