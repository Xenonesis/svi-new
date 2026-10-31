import Image from 'next/image';
import { Compass, Sparkles, MapPin } from 'lucide-react';

interface SV13AttractionsSectionProps {
  isHindi?: boolean;
}

export function SV13AttractionsSection({ isHindi = false }: SV13AttractionsSectionProps) {
  const attractions = [
    {
      title: isHindi ? 'सांभर सॉल्ट लेक' : 'Sambhar Salt Lake',
      subtitle: isHindi
        ? 'भारत की सबसे बड़ी अंतर्देशीय नमक झील'
        : "India's Largest Inland Salt Lake",
      desc: isHindi
        ? 'विश्व प्रसिद्ध रामसर आर्द्रभूमि जो प्रतिवर्ष हजारों प्रवासी राजहंसों (फ्लेमिंगो) और पर्यटकों को आकर्षित करती है।'
        : 'World-renowned Ramsar ecological wetland sanctuary hosting thousands of migratory pink flamingos.',
      image: '/Shivani Vatika 11/middle3.webp',
      distance: '10 km • ~12 Mins',
      tag: 'Eco-Tourism & Ramsar Site',
    },
    {
      title: isHindi ? 'ऐतिहासिक साल्ट हेरिटेज' : 'Salt Heritage & Historic Train',
      subtitle: isHindi
        ? 'ब्रिटिश कालीन हेरिटेज और साल्ट ट्रेन'
        : 'Colonial Era Salt Railway & Heritage',
      desc: isHindi
        ? 'औपनिवेशिक काल की हेरिटेज साल्ट ट्रेन, ऐतिहासिक नमक संग्रहालय और विशालकाय साल्ट पैन का अनूठा अनुभव।'
        : 'Experience the operational British-era narrow-gauge salt train, historic museum, and crystalline salt pans.',
      image: '/Shivani Vatika 11/middle2.webp',
      distance: '11 km • ~14 Mins',
      tag: 'Heritage Tourism',
    },
    {
      title: isHindi ? 'मां शाकंभरी माता मंदिर' : 'Shakambhari Mata Temple',
      subtitle: isHindi
        ? 'झील के तट पर स्थित पावन शक्तिपीठ'
        : 'Ancient Sacred Shoreline Pilgrimage',
      desc: isHindi
        ? 'सांभर झील के तट पर स्थित सदियों पुराना पवित्र शक्तिपीठ मंदिर, जहां प्रतिवर्ष लाखों श्रद्धालु दर्शन करने आते हैं।'
        : 'Centuries-old revered Hindu Shaktipeeth shrine situated directly on the tranquil banks of Sambhar Lake.',
      image: '/Shivani Vatika 11/middle5.webp',
      distance: '12 km • ~15 Mins',
      tag: 'Sacred Pilgrimage',
    },
    {
      title: isHindi ? 'देवयानी कुंड व शर्मिष्ठा सरोवर' : 'Devyani Kund & Sharmishtha Sarovar',
      subtitle: isHindi
        ? 'राजस्थान का "छोटा पुष्कर" पावन तीर्थ'
        : '"Chhota Pushkar" Sacred Stepwells',
      desc: isHindi
        ? 'प्राचीन ऐतिहासिक बावड़ी और पवित्र सरोवर, जिसे आस्था और धार्मिक दृष्टि से राजस्थान का "छोटा पुष्कर" माना जाता है।'
        : 'Mythological sacred stepwells and holy sarovar revered as "Chhota Pushkar" with architectural stone ghats.',
      image: '/Shivani Vatika 11/middle4.webp',
      distance: '8 km • ~10 Mins',
      tag: 'Historic Stepwell',
    },
  ];

  return (
    <section id="attractions" className="scroll-mt-20 bg-slate-900 py-20 text-white">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-amber-300 uppercase">
            <Compass className="h-3.5 w-3.5" />
            {isHindi ? 'सांस्कृतिक एवं प्राकृतिक परिवेश' : 'Regional Attractions & Heritage'}
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {isHindi ? 'शिवानी वाटिका के आसपास का जीवन' : 'Life Around Shivani Vatika'}
          </h2>
          <p className="mt-4 text-base text-slate-300 sm:text-lg">
            {isHindi
              ? 'सांभर झील की प्राकृतिक सुंदरता, ऐतिहासिक धरोहर और पावन मंदिरों से घिरा एक अनूठा सांस्कृतिक परिवेश।'
              : 'Immerse your family in an enriching setting surrounded by historic salt wetlands, heritage railways, and sacred pilgrimage sanctuaries.'}
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {attractions.map((item, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-800/80 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-amber-400 hover:shadow-2xl"
            >
              {/* Image with Vignette */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="rounded-full border border-white/20 bg-slate-950/80 px-2.5 py-1 text-[10px] font-bold tracking-wider text-amber-300 uppercase backdrop-blur-md">
                    {item.tag}
                  </span>
                </div>
              </div>

              {/* Text Body */}
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{item.distance}</span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-white transition-colors group-hover:text-amber-300">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-xs font-medium text-slate-300">{item.subtitle}</p>

                  <p className="mt-3 text-xs leading-relaxed text-slate-400">{item.desc}</p>
                </div>

                <div className="mt-6 flex items-center gap-1 text-[11px] font-bold tracking-wider text-amber-400 uppercase">
                  <Sparkles className="h-3 w-3" />
                  <span>{isHindi ? 'निकटतम पर्यटन स्थल' : 'Nearby Destination'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
