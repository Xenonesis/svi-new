import type { LucideIcon } from 'lucide-react';
import { Train, Warehouse, Compass, TrendingUp, ShieldCheck, Building2 } from 'lucide-react';

export interface PhuleraFaqItem {
  question: string;
  answer: string;
}

export interface CommuteItem {
  landmark: string;
  landmarkHi: string;
  distance: string;
  time: string;
  route: string;
  routeHi: string;
  highlight: string;
  highlightHi: string;
}

export interface HeroPillar {
  labelEn: string;
  labelHi: string;
  subEn: string;
  subHi: string;
  icon: LucideIcon;
}

export interface PhuleraAdvantage {
  icon: LucideIcon;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
}

export interface TownshipFeature {
  textEn: string;
  textHi: string;
}

export interface LeadCapturePerk {
  textEn: string;
  textHi: string;
}

export const PHULERA_CONTACT = {
  phone: '+917300007643',
  phoneFormatted: '+91-73000-07643',
  gateImage: '/Shivani Vatika 11/gate.webp',
  brochureUrl: '/Shivani Vatika 11/ShivaniVatika 11.pdf',
};

export const PHULERA_PAGE_META = {
  titleEn: 'Plots for Sale in Phulera | Residential Plots in Phulera Smart City | SVI Infra',
  titleHi: 'फुलेरा में आवासीय प्लॉट्स | फुलेरा स्मार्ट सिटी प्लॉट्स जयपुर | SVI Infra',
  descEn:
    'Buy premium residential & commercial plots in Phulera Smart City along the Delhi-Mumbai Industrial Corridor (DMIC) & Western DFC rail junction. High-growth land with clear registry, master-planned amenities & Jaipur expressway connectivity.',
  descHi:
    'फुलेरा स्मार्ट सिटी (DMIC एवं वेस्टर्न DFC रेलवे कॉरिडोर) में 100% स्पष्ट रजिस्ट्री आवासीय व कमर्शियल प्लॉट्स। फुलेरा जंक्शन, जयपुर-अजमेर एक्सप्रेसवे से 45 मिनट, उच्च विकास क्षमता, स्पष्ट टाइटल और फ्री कैब साइट विजिट।',
};

export const PHULERA_CORRIDOR_NAME = {
  en: 'Phulera DMIC Smart City Corridor',
  hi: 'फुलेरा DMIC स्मार्ट सिटी कॉरिडोर',
};

export const PHULERA_CORRIDOR_DESC = {
  en: 'Delhi-Mumbai Industrial Corridor (DMIC) & Western Dedicated Freight Corridor mega rail logistics hub, Jaipur district, Rajasthan.',
  hi: 'दिल्ली-मुंबई इंडस्ट्रियल कॉरिडोर (DMIC) एवं वेस्टर्न DFC रेलवे हब, जयपुर जिला, राजस्थान',
};

export const PHULERA_LISTING_DESC =
  'Master-planned plots along the DMIC & Western DFC rail corridor near Phulera Junction with 80% bank loan approval, clear registry title, and logistical connectivity.';

export const PHULERA_PAGE_KEYWORDS: string[] = [
  'plots for sale in Phulera',
  'residential plots in Phulera',
  'plots for sale in Jaipur Phulera',
  'Phulera smart city plots',
  'DMIC DFC corridor plots',
  'commercial plots in Phulera',
  'industrial plots Phulera junction',
  'plots near Sambhar lake',
  'plots near Jaipur Ajmer expressway',
  'plots near Phulera railway station',
  '100 gaj plot in jaipur',
  '111 gaj plot in jaipur',
  '150 gaj plots near renwal',
  '200 gaj plots jaipur',
  '80% bank loan plots in jaipur',
  'sbi approved plot loan jaipur',
  'plots near jobner jaipur',
  'jobner renwal road plots',
  'patta registry plots in jaipur',
  'dakhil kharij plots jaipur',
  '100 गज प्लॉट जयपुर',
  'जयपुर में 100 गज का प्लॉट',
  'पट्टा रजिस्ट्री प्लॉट जयपुर',
  'SVI Infra Solutions',
  'SVI Infra',
  'फुलेरा में प्लॉट',
  'फुलेरा स्मार्ट सिटी प्लॉट',
  'डीएमआईसी कॉरिडोर फुलेरा',
];

export const PHULERA_FAQS_EN: PhuleraFaqItem[] = [
  {
    question: 'Why are plots for sale in Phulera considered a high-growth real estate investment?',
    answer:
      'Phulera is the principal logistics and freight intersection of the Delhi-Mumbai Industrial Corridor (DMIC) and the Western Dedicated Freight Corridor (DFC) in Rajasthan. With inland container depots, warehousing parks, and manufacturing clusters expanding rapidly, land in the Phulera corridor has historically exhibited strong appreciation trends (illustrative 15–20% estimate; actual property values depend on market dynamics, demand, and infrastructure development).',
  },
  {
    question: 'What plot sizes and categories are available in the Phulera Smart City corridor?',
    answer:
      'Buyers can choose from demarcated residential villa plots ranging from 80 sq. yds. to 250 sq. yds., commercial frontage plots suitable for showrooms and logistics offices, as well as larger warehousing parcels with wide 30 to 60-foot arterial road access.',
  },
  {
    question: 'How connected is Phulera to Jaipur City and major economic centers?',
    answer:
      'Phulera connects seamlessly to central Jaipur in under 45 minutes via the 4-lane Jaipur-Ajmer Expressway (NH-48) and the upcoming Jaipur Ring Road Phase II. Phulera Junction is also one of North Western Railway’s largest rail nodes, offering frequent direct trains to Jaipur, Delhi, Ajmer, and Ahmedabad.',
  },
  {
    question:
      'Are residential plots in the Phulera corridor legally approved with clear registry documentation?',
    answer:
      'Yes. Plotted developments promoted by SVI Infra Solutions in this corridor feature Section 90-A land conversion approvals, sub-registrar registration readiness, verified revenue records, and assistance with due diligence.',
  },
  {
    question:
      'What is the connectivity between Phulera Junction and Shivani Vatika 11th (Harsholi)?',
    answer:
      'Shivani Vatika 11th is located approximately 34 km (~35 minutes drive) north of Phulera Junction along the Renwal-Harsholi highway link. This offers investors easy cross-corridor mobility between the industrial logistics hub of Phulera and the pilgrimage-commercial corridor of Khatu Shyam Ji Highway.',
  },
  {
    question: 'Can I visit the Phulera corridor plots with free transportation from Jaipur?',
    answer:
      'Yes. SVI Infra Solutions provides complimentary doorstep AC cab pickup and drop services from anywhere in Jaipur City, the airport, or railway stations for prospective buyers and families. You can reserve your visit online or via WhatsApp.',
  },
];

export const PHULERA_FAQS_HI: PhuleraFaqItem[] = [
  {
    question: 'फुलेरा में प्लॉट्स खरीदना भविष्य के लिए सबसे बेहतरीन निवेश क्यों है?',
    answer:
      'फुलेरा दिल्ली-मुंबई इंडस्ट्रियल कॉरिडोर (DMIC) और वेस्टर्न डेडिकेटेड फ्रेट कॉरिडोर (DFC) का प्रमुख रणनीतिक केंद्र है। वेयरहाउसिंग, इनलैंड कंटेनर डिपो (ICD) और लॉजिस्टिक्स पार्क्स के तीव्र विस्तार के चलते इस क्षेत्र में मजबूत विकास क्षमता देखी गई है (सांकेतिक 15–20% अनुमान; वास्तविक कीमतें बाजार परिस्थितियों और विकास पर निर्भर करती हैं)।',
  },
  {
    question: 'फुलेरा स्मार्ट सिटी कॉरिडोर में किस साइज के प्लॉट्स उपलब्ध हैं?',
    answer:
      'यहाँ 80 से 250 वर्ग गज तक के सुव्यवस्थित आवासीय भूखंड (विला प्लॉट्स), लॉजिस्टिक्स एवं व्यावसायिक प्रतिष्ठानों के लिए कमर्शियल प्लॉट्स तथा वेयरहाउसिंग हेतु उपयुक्त बड़े भूखंड 30 से 60 फीट चौड़ी सड़कों के साथ उपलब्ध हैं।',
  },
  {
    question: 'फुलेरा से जयपुर शहर और प्रमुख व्यापारिक केंद्रों की कनेक्टिविटी कैसी है?',
    answer:
      'फुलेरा 4-लेन जयपुर-अजमेर एक्सप्रेसवे (NH-48) और जयपुर रिंग रोड फ़ेज़-2 के माध्यम से जयपुर शहर से मात्र 45 मिनट की दूरी पर है। फुलेरा जंक्शन उत्तर पश्चिम रेलवे का विशालतम रेलवे जंक्शन है, जहाँ से जयपुर, दिल्ली, अजमेर और मुंबई के लिए नियमित ट्रेनें उपलब्ध हैं।',
  },
  {
    question: 'क्या फुलेरा के आवासीय प्लॉट्स की रजिस्ट्री और दस्तावेज 100% स्पष्ट हैं?',
    answer:
      'हाँ! SVI Infra Solutions द्वारा प्रस्तुत सभी प्लॉट्स 100% स्पष्ट दस्तावेजों, धारा 90-ए (Section 90-A) रूपांतरण, सब-रजिस्ट्रार कार्यालय में पक्की रजिस्ट्री और तुरंत नामांतरण (दाखिल-खारिज) की कानूनी सुरक्षा के साथ उपलब्ध कराए जाते हैं।',
  },
  {
    question: 'फुलेरा जंक्शन से शिवानी वाटिका 11th (हरसोली) की कनेक्टिविटी कैसी है?',
    answer:
      'शिवानी वाटिका 11th फुलेरा जंक्शन से मात्र 34 किमी (लगभग 35 मिनट) की दूरी पर रेनवाल-हरसोली मार्ग पर स्थित है। यह कॉरिडोर फुलेरा के औद्योगिक लॉजिस्टिक्स हब को खाटू श्याम जी हाईवे कॉरिडोर से सीधे जोड़ता है।',
  },
  {
    question: 'क्या जयपुर से फ्री साइट विजिट कैब की सुविधा उपलब्ध है?',
    answer:
      'हाँ! SVI Infra Solutions जयपुर के किसी भी हिस्से, रेलवे स्टेशन या एयरपोर्ट से खरीदारों के लिए पूर्णतः निःशुल्क (फ्री) एसी कैब पिकअप एवं ड्रॉप की सुविधा प्रदान करता है।',
  },
];

export const COMMUTE_MATRIX: CommuteItem[] = [
  {
    landmark: 'Phulera Junction (NWR & DFC Hub)',
    landmarkHi: 'फुलेरा जंक्शन (उत्तर पश्चिम रेलवे व DFC हब)',
    distance: '3–5 km',
    time: '5–8 Mins',
    route: 'Direct Town Arterial Road',
    routeHi: 'मुख्य शहर संपर्क मार्ग',
    highlight: 'Major 4-way railway freight interchange',
    highlightHi: 'प्रमुख चार-तरफा रेलवे फ्रेट जंक्शन',
  },
  {
    landmark: 'Sambhar Salt Lake & Eco-Tourism',
    landmarkHi: 'सांभर सॉल्ट लेक एवं पर्यटन क्षेत्र',
    distance: '10 km',
    time: '12–15 Mins',
    route: 'Phulera-Sambhar Highway (SH-19)',
    routeHi: 'फुलेरा-सांभर राजमार्ग (SH-19)',
    highlight: 'Historic salt production belt & tourist hub',
    highlightHi: 'सांभर नमक उद्योग एवं हेरिटेज पर्यटन केंद्र',
  },
  {
    landmark: 'Jaipur-Ajmer Expressway (NH-48)',
    landmarkHi: 'जयपुर-अजमेर एक्सप्रेसवे (NH-48)',
    distance: '18 km',
    time: '18–20 Mins',
    route: '6-Lane National Expressway Corridor',
    routeHi: '6-लेन राष्ट्रीय एक्सप्रेसवे कॉरिडोर',
    highlight: 'Direct signal-free high-speed corridor',
    highlightHi: 'सिग्नल-फ्री हाई-स्पीड हाईवे संपर्क',
  },
  {
    landmark: 'RIICO Industrial Area Renwal',
    landmarkHi: 'रीको इंडस्ट्रियल एरिया किशनगढ़ रेनवाल',
    distance: '32 km',
    time: '30–32 Mins',
    route: 'Phulera - Renwal Arterial Link',
    routeHi: 'फुलेरा - रेनवाल लिंक मार्ग',
    highlight: '64-Acre operational manufacturing zone',
    highlightHi: '64 एकड़ में विस्तृत सक्रिय मैन्युफैक्चरिंग ज़ोन',
  },
  {
    landmark: 'Shivani Vatika 11th (Harsholi)',
    landmarkHi: 'शिवानी वाटिका 11th (हरसोली टाउनशिप)',
    distance: '34 km',
    time: '~35 Mins',
    route: 'Jaipur-Khatu Highway Extension',
    routeHi: 'जयपुर-खाटू श्याम जी हाईवे',
    highlight: '230 demarcated residential plots (11.5 Bigha)',
    highlightHi: '11.5 बीघा में 230 सुनियोजित आवासीय प्लॉट्स',
  },
  {
    landmark: 'Jaipur Ring Road (Phase II Interchange)',
    landmarkHi: 'जयपुर रिंग रोड (फ़ेज़-2 इंटरचेंज)',
    distance: '35 km',
    time: '35 Mins',
    route: 'Access-Controlled Ring Expressway',
    routeHi: 'नियंत्रित एक्सेस रिंग एक्सप्रेसवे',
    highlight: 'Direct bypass avoiding city congestion',
    highlightHi: 'जयपुर शहर के ट्रैफिक से मुक्त सीधा बाईपास',
  },
  {
    landmark: 'Central Jaipur (200 Ft Bypass / Ajmer Rd)',
    landmarkHi: 'जयपुर सिटी (200 फीट बाईपास / अजमेर रोड)',
    distance: '55 km',
    time: '45–50 Mins',
    route: 'NH-48 Expressway Express Flow',
    routeHi: 'NH-48 एक्सप्रेसवे सीधा आवागमन',
    highlight: 'Rapid commute to Jaipur commercial centers',
    highlightHi: 'जयपुर के मुख्य व्यावसायिक केंद्रों तक त्वरित पहुँच',
  },
  {
    landmark: 'Jaipur International Airport (JAI)',
    landmarkHi: 'जयपुर इंटरनेशनल एयरपोर्ट (सांगानेर)',
    distance: '65 km',
    time: '60–65 Mins',
    route: 'Via Ring Road & Tonk Road Expressway',
    routeHi: 'रिंग रोड व टोंक रोड एक्सप्रेसवे द्वारा',
    highlight: 'Terminal 2 air connectivity',
    highlightHi: 'टर्मिनल 2 सीधी घरेलू व अंतरराष्ट्रीय उड़ानें',
  },
];

export const HERO_PILLARS: HeroPillar[] = [
  {
    labelEn: 'DFC Western Rail Hub',
    labelHi: 'DFC वेस्टर्न रेल हब',
    subEn: 'Quad-Track Freight Hub',
    subHi: 'क्वाड-ट्रैक फ्रेट जंक्शन',
    icon: Train,
  },
  {
    labelEn: 'DMIC Freight Corridor',
    labelHi: 'DMIC इंडस्ट्रियल कॉरिडोर',
    subEn: 'Dry Ports & Warehouses',
    subHi: 'ड्राई पोर्ट्स व वेयरहाउसिंग',
    icon: Warehouse,
  },
  {
    labelEn: '45 Mins to Jaipur',
    labelHi: 'जयपुर से 45 मिनट',
    subEn: 'Jaipur-Ajmer Expressway',
    subHi: 'जयपुर-अजमेर एक्सप्रेसवे',
    icon: Compass,
  },
  {
    labelEn: 'High Growth Corridor',
    labelHi: 'उच्च विकास क्षमता',
    subEn: 'Logistics & DMIC Hub',
    subHi: 'लॉजिस्टिक्स व DMIC हब',
    icon: TrendingUp,
  },
];

export const PHULERA_ADVANTAGES: PhuleraAdvantage[] = [
  {
    icon: Warehouse,
    titleEn: 'Industrial Warehousing & Container Depots',
    titleHi: 'औद्योगिक वेयरहाउसिंग व कंटेनर डिपो',
    descEn:
      'Massive warehousing complexes, dry ports, and multi-modal logistics parks (MMLP) operate along the freight rail corridor.',
    descHi:
      'इनलैंड कंटेनर डिपो (ICD) और बहु-आयामी लॉजिस्टिक्स पार्क्स के कारण बड़े पैमाने पर भंडारण एवं कार्गो केंद्र स्थापित हो रहे हैं।',
  },
  {
    icon: Train,
    titleEn: 'Triple Rail Connectivity & NWR Hub',
    titleHi: 'त्रिकोणीय रेलवे जंक्शन कनेक्टिविटी',
    descEn:
      'Direct non-stop passenger and heavy freight rail movement connecting Delhi-NCR, Jaipur, Ajmer, and western Indian sea ports.',
    descHi:
      'फुलेरा जंक्शन से जयपुर, दिल्ली, अजमेर, अहमदाबाद व बीकानेर के लिए चौबीसों घंटे सीधी रेल कनेक्टिविटी और वेस्टर्न DFC फ्रेट लाइन उपलब्ध है।',
  },
  {
    icon: Compass,
    titleEn: 'Expressway & Ring Road Arteries',
    titleHi: 'एक्सप्रेसवे व रिंग रोड से सुगम सफर',
    descEn:
      'Direct 4-lane access to NH-48 (Jaipur-Ajmer Expressway) and Jaipur Ring Road Phase II bypasses all inner-city traffic bottlenecks.',
    descHi:
      'जयपुर-अजमेर 4-लेन राष्ट्रीय राजमार्ग (NH-48) और जयपुर रिंग रोड फ़ेज़-2 के जरिए केवल 45 मिनट में जयपुर शहर पहुँचा जा सकता है।',
  },
  {
    icon: ShieldCheck,
    titleEn: '100% Clear Titles & 90-A Conversion',
    titleHi: '100% स्पष्ट रजिस्ट्री एवं धारा 90-ए',
    descEn:
      'Every plotted development adheres to Section 90-A conversion with clean revenue mutation, freehold deeds, and verified documentation.',
    descHi:
      'सभी टाउनशिप कानूनी रूप से रूपांतरित, मास्टर प्लान स्वीकृत और सब-रजिस्ट्रार कार्यालय में तुरंत रजिस्ट्री व म्यूटेशन के साथ उपलब्ध हैं।',
  },
  {
    icon: Building2,
    titleEn: 'Smart City Infrastructure & Paved Roads',
    titleHi: 'स्मार्ट सिटी बुनियादी ढांचा व सड़कें',
    descEn:
      'Engineered master-planned layouts featuring 30–60 ft wide paved roads, boundary walls, street lighting, and underground utilities.',
    descHi:
      '30 से 60 फीट चौड़ी इंटरलॉकिंग पक्की सड़कें, भूमिगत पानी की पाइपलाइन, विद्युतीकरण, भव्य प्रवेश द्वार और 24/7 सुरक्षा बाउंड्री।',
  },
  {
    icon: TrendingUp,
    titleEn: 'High Rental Yield & Sustained Appreciation',
    titleHi: 'लाखों का रोजगार एवं आवास की भारी मांग',
    descEn:
      'Sustained industrial employment drives steady residential rental yields and robust long-term land valuation growth.',
    descHi:
      'मैन्युफैक्चरिंग इकाइयों और लॉजिस्टिक्स कंपनियों से नए कर्मियों का आगमन आवासीय किराये और ज़मीन के मूल्यों को निरंतर गति प्रदान कर रहा है।',
  },
];

export const TOWNSHIP_FEATURES: TownshipFeature[] = [
  {
    textEn: '1 km (2 mins) to RIICO Industrial Area & 7 km (5 mins) to Renwal Station',
    textHi: 'रीको इंडस्ट्रियल एरिया (1 किमी / 2 मिनट) और रेनवाल स्टेशन (7 किमी / 5 मिनट)',
  },
  {
    textEn: 'Smooth 20-25 minutes drive to Shri Khatu Shyam Ji Temple',
    textHi: 'श्री खाटू श्याम जी मंदिर तक मात्र 20-25 मिनट की सुगम ड्राइव',
  },
  {
    textEn: '30 ft wide interlocked roads, grand entry arch & 24/7 gated security',
    textHi: '30 फीट चौड़ी इंटरलॉकिंग पक्की सड़कें व 24/7 सुरक्षा',
  },
];

export const LEAD_CAPTURE_PERKS: LeadCapturePerk[] = [
  {
    textEn: 'Verified legal papers & zero spam guarantee',
    textHi: '100% सत्यापित दस्तावेज एवं जीरो स्पैम गारंटी',
  },
  {
    textEn: 'Complimentary chauffeured AC cab site visit from Jaipur',
    textHi: 'जयपुर से निःशुल्क एसी कैब साइट विजिट सुविधा',
  },
  {
    textEn: 'Direct developer booking with zero third-party brokerage fees',
    textHi: 'सीधे डेवलपर से संपर्क — बिना किसी बिचौलिए या ब्रोकरेज के',
  },
];
