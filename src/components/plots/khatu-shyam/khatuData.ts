import type { LucideIcon } from 'lucide-react';
import {
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Train,
  Landmark,
  Compass,
  TrendingUp,
  FileText,
  Scale,
  Award,
} from 'lucide-react';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface TransitNode {
  destination: string;
  destinationHi: string;
  time: string;
  distance: string;
  route: string;
  routeHi: string;
  icon: LucideIcon;
  badge: string;
  badgeHi: string;
  desc: string;
  descHi: string;
}

export interface HeroPill {
  icon: LucideIcon;
  textEn: string;
  textHi: string;
}

export interface HeroStat {
  labelEn: string;
  labelHi: string;
  subEn: string;
  subHi: string;
}

export interface StrategicGrowthCard {
  icon: LucideIcon;
  titleEn: string;
  titleHi: string;
  subtitleEn: string;
  subtitleHi: string;
  textEn: string;
  textHi: string;
}

export interface TownshipSpecItem {
  labelEn: string;
  labelHi: string;
  value: string;
  highlight?: boolean;
}

export interface TownshipAmenity {
  en: string;
  hi: string;
}

export interface DueDiligenceStep {
  step: string;
  icon: LucideIcon;
  titleEn: string;
  titleHi: string;
  detailEn: string;
  detailHi: string;
}

export const KHATU_PAGE_KEYWORDS: string[] = [
  'plots for sale near Khatu Shyam Ji',
  'residential plots near Khatu Shyam Ji',
  'plots near Khatu Shyam Mandir',
  'plots on Jaipur Khatu Shyam Ji Highway',
  'plots on Ringas Road Khatu Shyam',
  'plots near Khatu Shyam Ji Temple',
  'government approved plots near Khatu Shyam Ji',
  'JDA approved plots near Khatu Shyam Ji',
  'Shivani Vatika 11th',
  'Shivani Vatika Harsholi',
  'Harsholi Renwal plots',
  'plots near Renwal railway station',
  '7500 per sq yard plots',
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
  'खाटू श्याम जी मंदिर के पास प्लॉट',
  'खाटू श्याम हाईवे प्लॉट',
  'रिंगस रोड प्लॉट',
];

export const KHATU_PAGE_META = {
  titleEn: 'Plots for Sale Near Khatu Shyam Ji | Residential Plots on Highway | SVI Infra',
  titleHi: 'खाटू श्याम जी के पास आवासीय प्लॉट्स | जयपुर खाटू हाईवे प्लॉट्स | SVI Infra',
  descEn:
    'Buy verified residential plots for sale near Khatu Shyam Ji on the 4-lane Jaipur-Khatu Highway corridor. Just 20-25 mins from temple, featuring Shivani Vatika 11th with 230 master-planned plots (80-250 sq. yds.), clear 90-A registry, and free cab site visits.',
  descHi:
    'खाटू श्याम जी मंदिर से मात्र 20-25 मिनट की दूरी पर 4-लेन जयपुर-खाटू हाईवे पर 100% स्पष्ट रजिस्ट्री आवासीय प्लॉट्स। शिवानी वाटिका 11th में 80 से 250 वर्ग गज के 230 सुनियोजित प्लॉट्स, 4.5+ करोड़ तीर्थयात्री फुटफॉल कॉरिडोर और फ्री कैब साइट विजिट।',
};

export const KHATU_CONTACT = {
  phone: '+917300007643',
  phoneDisplay: '+91-73000-07643',
  brochurePdf: '/Shivani Vatika 11/ShivaniVatika 11.pdf',
  gateImage: '/Shivani Vatika 11/gate.webp',
  whatsappInquiryUrl:
    'https://wa.me/917300007643?text=Namaste%20SVI%20Infra,%20I%20am%20interested%20in%20residential%20plots%20at%20Shivani%20Vatika%2011th%20near%20Khatu%20Shyam%20Ji.%20Please%20share%20available%20plot%20inventory%20and%20price%20list.',
  whatsappCabUrl:
    'https://wa.me/917300007643?text=Namaste%20SVI%20Infra,%20I%20want%20to%20book%20a%20Free%20Cab%20Site%20Visit%20for%20Shivani%20Vatika%2011th%20on%20Khatu%20Shyam%20Ji%20Highway.',
  projectPath: '/projects/shivani-vatika-11th',
};

export const HERO_PILLS: HeroPill[] = [
  {
    icon: Landmark,
    textEn: '20–25 Mins to Temple',
    textHi: 'मंदिर से 20–25 मिनट',
  },
  {
    icon: MapPin,
    textEn: '4-Lane Highway Frontage',
    textHi: '4-लेन मुख्य हाईवे फ्रंट',
  },
  {
    icon: Building2,
    textEn: '80–250 Sq. Yds. Plots',
    textHi: '80–250 वर्ग गज प्लॉट्स',
  },
  {
    icon: ShieldCheck,
    textEn: '100% Registry Ready (90-A)',
    textHi: '100% पक्की रजिस्ट्री (90-A)',
  },
];

export const HERO_STATS: HeroStat[] = [
  {
    labelEn: '4.5+ Crore',
    labelHi: '4.5+ करोड़',
    subEn: 'Annual Temple Pilgrims',
    subHi: 'वार्षिक तीर्थयात्री फुटफॉल',
  },
  {
    labelEn: '230 Plots',
    labelHi: '230 प्लॉट्स',
    subEn: 'Shivani Vatika 11th',
    subHi: 'शिवानी वाटिका 11th',
  },
  {
    labelEn: '11.5 Bigha',
    labelHi: '11.5 बीघा',
    subEn: '~30,480 Sq. Yds. Layout',
    subHi: '~30,480 वर्ग गज टाउनशिप',
  },
  {
    labelEn: '100% Clear',
    labelHi: '100% स्पष्ट',
    subEn: '90-A & Sub-Registrar Title',
    subHi: '90-A व उप-पंजीयक रजिस्ट्री',
  },
];

export const STRATEGIC_GROWTH_CARDS: StrategicGrowthCard[] = [
  {
    icon: Landmark,
    titleEn: '4.5+ Crore Devotees',
    titleHi: '4.5+ करोड़ तीर्थयात्री',
    subtitleEn: 'Perpetual Pilgrimage Footfall',
    subtitleHi: 'स्थायी हॉस्पिटैलिटी मांग',
    textEn:
      'Unprecedented round-the-year pilgrimage traffic to Khatu Shyam Dham creates massive sustained demand for guest houses, holiday homes, dharamshalas, and residential rentals.',
    textHi:
      'श्री खाटू श्याम जी धाम के लिए निरंतर बढ़ता श्रद्धालु प्रवाह धर्मशालाओं, अतिथि गृहों, भोजनालयों और आवासीय कॉलोनियों के लिए भारी मांग पैदा करता है।',
  },
  {
    icon: TrendingUp,
    titleEn: '4-Lane Highway Expansion',
    titleHi: '4-लेन हाईवे विस्तार',
    subtitleEn: 'Signal-Free Mobility',
    subtitleHi: 'सुगम एक्सप्रेसवे ट्रांजिट',
    textEn:
      'Upgradation into a high-capacity 4-lane expressway cuts travel times to 20-25 minutes to Khatu Dham and 45 minutes to Jaipur bypass, driving immediate commercial appreciation.',
    textHi:
      'जयपुर से खाटू श्याम जी मार्ग को आधुनिक 4-लेन एक्सप्रेसवे में बदले जाने से मंदिर तक 20-25 मिनट और जयपुर तक मात्र 45 मिनट में सुगम यात्रा संभव है।',
  },
  {
    icon: Building2,
    titleEn: 'RIICO & Logistics Belt',
    titleHi: 'रीको व वेयरहाउसिंग हब',
    subtitleEn: '1 km to 64-Acre RIICO',
    subtitleHi: '1 किमी दूरी पर औद्योगिक क्षेत्र',
    textEn:
      'Proximity to 64-acre operational RIICO Industrial Area Renwal and corporate logistics parks (Adani & Ambani) secures permanent tenant occupancy and job creation.',
    textHi:
      'रीको इंडस्ट्रियल एरिया रेणवाल (155+ इकाइयां) और पास में अडानी-अंबानी वेयरहाउसिंग हब स्थानीय रोजगार और निरंतर आवासीय प्लॉटिंग मांग को गति दे रहे हैं।',
  },
  {
    icon: Award,
    titleEn: 'High Capital Growth',
    titleHi: 'उच्च पूंजीगत वृद्धि',
    subtitleEn: 'High-Appreciation Corridor',
    subtitleHi: 'दीर्घकालिक मूल्य वृद्धि',
    textEn:
      'Accessible entry prices starting around ₹ 15 Lakhs* offer strong growth potential compared to overvalued city suburbs, backed by freehold ownership and bank loans.',
    textHi:
      'जयपुर के सैचुरेटेड उपनगरों की तुलना में किफायती शुरुआती दरों (₹ 15 लाख*) पर स्पष्ट रजिस्ट्री प्लॉट्स, जो मजबूत बुनियादी मांग और इंफ्रास्ट्रक्चर से संचालित हैं।',
  },
];

export const TOWNSHIP_SPECS: TownshipSpecItem[] = [
  {
    labelEn: 'Total Area',
    labelHi: 'कुल क्षेत्रफल',
    value: '11.5 Bigha (~30,480 Sq. Yds.)',
  },
  {
    labelEn: 'Plot Sizes',
    labelHi: 'प्लॉट साइज़',
    value: '80, 100, 150, 200, 250 Sq. Yds.',
  },
  {
    labelEn: 'Internal Roads',
    labelHi: 'आंतरिक सड़कें',
    value: '30 Feet Wide Pavers',
  },
  {
    labelEn: 'Legal Approval',
    labelHi: 'स्वीकृति व रजिस्ट्री',
    value: 'Section 90-A & Sub-Registrar',
    highlight: true,
  },
];

export const TOWNSHIP_AMENITIES: TownshipAmenity[] = [
  {
    en: 'Grand Gate & Guard Room',
    hi: 'भव्य प्रवेश द्वार व गार्ड रूम',
  },
  {
    en: 'Perimeter Boundary & 24/7 Security',
    hi: 'चारदीवारी व 24/7 सुरक्षा',
  },
  {
    en: 'Water Supply & Electricity Lines',
    hi: 'भूमिगत पेयजल व बिजली खंभे',
  },
  {
    en: 'Green Landscaped Parks',
    hi: 'हरित सामुदायिक पार्क',
  },
];

export const TRANSIT_MATRIX: TransitNode[] = [
  {
    destination: 'Shree Khatu Shyam Ji Mandir',
    destinationHi: 'श्री खाटू श्याम जी मंदिर',
    time: '20–25 Mins',
    distance: '~25 km',
    route: '4-Lane Highway Corridor',
    routeHi: '4-लेन सीधा मुख्य हाईवे',
    icon: Landmark,
    badge: 'Spiritual Epicenter',
    badgeHi: 'पवित्र तीर्थ धाम',
    desc: 'Direct four-lane expressway access with 4.5+ crore annual pilgrims driving year-round commercial and hospitality demand.',
    descHi:
      '4-लेन एक्सप्रेसवे द्वारा सीधा मार्ग, जहां 4.5+ करोड़ वार्षिक श्रद्धालुओं का आवागमन कमर्शियल व हॉस्पिटैलिटी मांग को बढ़ाता है।',
  },
  {
    destination: 'RIICO Industrial Area (Renwal)',
    destinationHi: 'रीको इंडस्ट्रियल एरिया (रेणवाल)',
    time: '2 Mins',
    distance: '1 km',
    route: 'Direct Highway Link',
    routeHi: 'सीधा हाईवे संपर्क',
    icon: Building2,
    badge: 'Manufacturing Hub',
    badgeHi: 'औद्योगिक विकास केंद्र',
    desc: '64+ acres operational industrial zone with 155+ planned units driving permanent employment and local housing demand.',
    descHi:
      '64+ एकड़ में सक्रिय रीको हब, 155+ इकाइयों के साथ हजारों रोजगार और निरंतर रेंटल मांग सुनिश्चित करता है।',
  },
  {
    destination: 'Renwal Railway Station (RNW)',
    destinationHi: 'रेणवाल रेलवे स्टेशन (RNW)',
    time: '5 Mins',
    distance: '7 km',
    route: 'Kishangarh Renwal Road',
    routeHi: 'किशनगढ़ रेणवाल मुख्य मार्ग',
    icon: Train,
    badge: 'Express Rail Transit',
    badgeHi: 'एक्सप्रेस रेल कनेक्टिविटी',
    desc: 'Direct North Western Railway station on the Phulera–Ringas–Rewari line with 35-min daily trains to Jaipur Junction.',
    descHi:
      'उत्तर पश्चिम रेलवे का मुख्य स्टेशन; जयपुर जंक्शन मात्र 35 मिनट में और दिल्ली के लिए नियमित सुपरफास्ट ट्रेनें।',
  },
  {
    destination: 'Corporate Warehousing Hubs',
    destinationHi: 'अंबानी एवं अडानी वेयरहाउसिंग हब',
    time: '6 Mins',
    distance: '~7 km',
    route: 'Harsholi Logistics Belt',
    routeHi: 'हरसोली लॉजिस्टिक्स बेल्ट',
    icon: Compass,
    badge: 'Mega Logistics',
    badgeHi: 'नेशनल सप्लाई चेन',
    desc: 'National corporate warehousing and supply-chain logistics centers driving institutional land valuations in the vicinity.',
    descHi:
      'राष्ट्रीय स्तर के आधुनिक वेयरहाउसिंग और सप्लाई-चेन हब, जो आसपास की भूमि के पूंजीगत मूल्य में भारी वृद्धि कर रहे हैं।',
  },
  {
    destination: 'Phulera Junction & DMIC Belt',
    destinationHi: 'फुलेरा जंक्शन एवं DMIC कॉरिडोर',
    time: '35 Mins',
    distance: '~34 km',
    route: 'State Highway 19A Link',
    routeHi: 'स्टेट हाईवे 19A लिंक',
    icon: TrendingUp,
    badge: 'Freight Corridor',
    badgeHi: 'वेस्टर्न DFC जंक्शन',
    desc: 'Major Western Dedicated Freight Corridor (DFC) rail junction and proposed multi-modal smart logistics city.',
    descHi:
      'वेस्टर्न डेडिकेटेड फ्रेट कॉरिडोर (DFC) का प्रमुख रेलवे जंक्शन और उभरता हुआ स्मार्ट औद्योगिक लॉजिस्टिक्स हब।',
  },
  {
    destination: 'Jaipur City (Ring Road / Bypass)',
    destinationHi: 'जयपुर शहर (रिंग रोड / बाईपास)',
    time: '45 Mins',
    distance: 'Direct Highway',
    route: 'Jaipur-Khatu 4-Lane Highway',
    routeHi: 'जयपुर-खाटू 4-लेन हाईवे',
    icon: MapPin,
    badge: 'Capital Metro Access',
    badgeHi: 'राजधानी जयपुर संपर्क',
    desc: 'Rapid signal-free highway route connecting into Jaipur’s arterial road networks, hospitals, and educational centers.',
    descHi:
      'सुगम फोर-लेन हाईवे मार्ग जो सीधे जयपुर रिंग रोड, मेडिकल कॉलेज, अस्पताल और प्रमुख व्यावसायिक केंद्रों से जोड़ता है।',
  },
];

export const DUE_DILIGENCE_STEPS: DueDiligenceStep[] = [
  {
    step: '01',
    icon: FileText,
    titleEn: 'Section 90-A Conversion',
    titleHi: 'धारा 90-A रूपांतरण',
    detailEn:
      'Certified land conversion from agricultural to residential under Section 90-A of the Rajasthan Land Revenue Act, permitting legal township layout and construction.',
    detailHi:
      'राजस्थान भू-राजस्व अधिनियम की धारा 90-A के तहत कृषि भूमि का विधिवत गैर-कृषि (आवासीय) रूपांतरण, जिससे मकान निर्माण व बैंक ऋण की पूर्ण कानूनी वैधता मिलती है।',
  },
  {
    step: '02',
    icon: Scale,
    titleEn: 'Verified Jamabandi Record',
    titleHi: 'स्वच्छ जमाबंदी नकल',
    detailEn:
      'Authenticated Record of Rights (Jamabandi) verified with the local revenue office, confirming zero bank mortgages, legal encumbrances, or agricultural tenancy claims.',
    detailHi:
      'तहसीलदार और पटवारी द्वारा प्रमाणित निर्विवाद जमाबंदी एवं खसरा नक्शा, जो यह प्रमाणित करता है कि भूमि पर कोई बैंक भार, विवाद या सीलिंग का केस नहीं है।',
  },
  {
    step: '03',
    icon: ShieldCheck,
    titleEn: 'Mutation (Namantaran)',
    titleHi: 'दाखिल खारिज / नामांतरण',
    detailEn:
      'Complete mutation recorded in Rajasthan revenue ledgers establishing an unbroken chain of ownership title transferred cleanly to the development entity.',
    detailHi:
      'राजस्व रिकॉर्ड में पूर्ण दाखिल-खारिज नामांतरण, जिससे स्वामित्व की अटूट कड़ी (chain of title) डेवलपर के पक्ष में कानूनी रूप से दर्ज रहती है।',
  },
  {
    step: '04',
    icon: CheckCircle2,
    titleEn: 'Sub-Registrar Registry',
    titleHi: 'उप-पंजीयक पक्की रजिस्ट्री',
    detailEn:
      'Executed individual registered sale deed (Bainama) directly at the Sub-Registrar office with physical boundary pillars, plot marking, and immediate possession.',
    detailHi:
      'स्थानीय उप-पंजीयक कार्यालय में व्यक्तिगत बैनामा रजिस्ट्री, खूंटाबंदी (डिमार्केशन) और तुरंत कब्जा सुपुर्दगी।',
  },
];

export const KHATU_FAQS_EN: FAQItem[] = [
  {
    question: 'How far are these residential plots from Shree Khatu Shyam Ji Temple?',
    answer:
      'Shivani Vatika 11th at Harsholi is located just 20 to 25 minutes drive (approximately 25 km) from Shree Khatu Shyam Ji Mandir via the smooth 4-lane Jaipur to Khatu Shyam Ji Highway. Devotees and investors enjoy direct, congestion-free highway access straight toward the holy shrine.',
  },
  {
    question:
      'Are the plots on Jaipur - Khatu Shyam Ji Highway legally converted and registry ready?',
    answer:
      'Yes, plots at Shivani Vatika 11th are legally converted under Section 90-A of the Rajasthan Land Revenue Act for residential use. Each plot comes with verified Jamabandi land records, clean government revenue mutation (नामांतरण), and individual sub-registrar registry.',
  },
  {
    question: 'What plot sizes and configurations are available near Khatu Shyam Ji?',
    answer:
      'The township offers demarcated residential plots ranging from 80 sq. yds. to 250 sq. yds. (including 80, 100, 150, 200, and 250 sq. yd. units) in an 11.5 Bigha (approx. 30,480 sq. yds.) gated society of 230 master-planned plots, served by 30-foot wide paved interlocked roads.',
  },
  {
    question: 'What is the starting price for residential plots near Khatu Shyam Ji Highway?',
    answer:
      'Residential plots start at an accessible price point from ₹ 15 Lakhs* for 80 sq. yd. units. SVI Infra Solutions provides transparent pricing, flexible 12 to 24-month interest-free monthly installment schemes, and comprehensive bank loan facilitation.',
  },
  {
    question:
      'Why is the Jaipur–Khatu Shyam Ji Highway corridor experiencing rapid property appreciation?',
    answer:
      'The corridor benefits from substantial pilgrimage footfall (estimated up to 4–4.5 crore annual devotees during peak mela cycles), the ongoing 4-lane highway expansion, and its strategic location adjacent to the 64-acre operational RIICO Industrial Area Renwal (1 km) and corporate logistics hubs. These factors have historically driven strong capital appreciation trends (often estimated at 15% to 20% in market surveys, though actual property values depend on market dynamics, demand, and infrastructure delivery) along with consistent rental yield interest.',
  },
  {
    question:
      'How far is Renwal Railway Station and RIICO Industrial Area from Shivani Vatika 11th?',
    answer:
      'The project is situated just 1 km (~2 minutes drive) from the RIICO Industrial Area Renwal and 7 km (~5 minutes drive) from Renwal Railway Station (North Western Railway), offering direct express train transit to Jaipur Junction in just 35 minutes.',
  },
  {
    question: 'How do I book a free cab site visit from Jaipur?',
    answer:
      'SVI Infra Solutions provides complimentary doorstep chauffeured private AC cab pickup and drop from anywhere in Jaipur directly to Shivani Vatika 11th and back. You can reserve your visit by clicking the "Book Free Site Visit Cab" button on this page or contacting our sales desk at +91-73000-07643.',
  },
];

export const KHATU_FAQS_HI: FAQItem[] = [
  {
    question: 'खाटू श्याम जी मंदिर से ये आवासीय प्लॉट्स कितनी दूरी पर हैं?',
    answer:
      'हरसोली स्थित शिवानी वाटिका 11th, श्री खाटू श्याम जी मंदिर से 4-लेन जयपुर-खाटू हाईवे के माध्यम से मात्र 20 से 25 मिनट (लगभग 25 किमी) की ड्राइव पर स्थित है। यह बिना किसी जाम के सुगम और सीधा आवागमन प्रदान करता है।',
  },
  {
    question:
      'क्या जयपुर-खाटू श्याम जी हाईवे पर स्थित प्लॉट्स कानूनी रूप से रूपांतरित और रजिस्ट्री योग्य हैं?',
    answer:
      'जी हाँ, शिवानी वाटिका 11th के प्लॉट्स राजस्थान भू-राजस्व अधिनियम की धारा 90-A के तहत आवासीय प्रयोजन हेतु पूर्णतः रूपांतरित हैं। सभी भूखंडों की स्पष्ट जमाबंदी, सरकारी नामांतरण और उप-पंजीयक कार्यालय में रजिस्ट्री उपलब्ध है।',
  },
  {
    question: 'खाटू श्याम जी के पास कौन-से साइज के प्लॉट्स उपलब्ध हैं?',
    answer:
      'टाउनशिप में 80 वर्ग गज से 250 वर्ग गज (80, 100, 150, 200 व 250 वर्ग गज) तक के सुनियोजित आवासीय प्लॉट्स उपलब्ध हैं। यह 11.5 बीघा (लगभग 30,480 वर्ग गज) में 230 प्लॉट्स की भव्य गेटेड टाउनशिप है जिसमें 30 फीट चौड़ी पक्की इंटरलॉकिंग सड़कें हैं।',
  },
  {
    question: 'खाटू श्याम जी हाईवे पर आवासीय प्लॉट्स की शुरुआती कीमत क्या है?',
    answer:
      'शिवानी वाटिका 11th में 80 वर्ग गज के प्लॉट्स ₹ 15 लाख* से शुरू होते हैं। पारदर्शी कागजात के साथ SVI Infra द्वारा 12 से 24 महीने की आसान ब्याज-मुक्त किस्तों (EMI) और बैंक लोन की पूरी सहायता प्रदान की जाती है।',
  },
  {
    question:
      'जयपुर-खाटू श्याम जी हाईवे कॉरिडोर में प्रॉपर्टी की कीमतें तेजी से क्यों बढ़ रही हैं?',
    answer:
      'खाटू धाम में प्रतिवर्ष करोड़ों श्रद्धालुओं का आगमन (मेला चक्रों में 4-4.5 करोड़ तक अनुमानित), 4-लेन हाईवे का विस्तार, 1 किमी पर 64 एकड़ में विस्तृत रीको इंडस्ट्रियल एरिया, 5 मिनट पर रेणवाल रेलवे स्टेशन और पास में वेयरहाउसिंग हब इस कॉरिडोर में मजबूत निवेश मांग पैदा करते हैं (मार्केट अध्ययनों के अनुसार 15-20% की ऐतिहासिक वृद्धि दर, हालांकि भविष्य की कीमतें बाजार परिस्थितियों और इंफ्रास्ट्रक्चर प्रगति पर निर्भर करती हैं)।',
  },
  {
    question: 'शिवानी वाटिका 11th से रेणवाल रेलवे स्टेशन और रीको इंडस्ट्रियल एरिया कितना दूर है?',
    answer:
      'प्रोजेक्ट रीको इंडस्ट्रियल एरिया से मात्र 1 किमी (2 मिनट) और रेणवाल रेलवे स्टेशन से केवल 7 किमी (5 मिनट) की दूरी पर स्थित है, जहाँ से जयपुर जंक्शन के लिए केवल 35 मिनट की नियमित ट्रेन सुविधा उपलब्ध है।',
  },
  {
    question: 'जयपुर से फ्री कैब साइट विजिट कैसे बुक करें?',
    answer:
      'SVI Infra Solutions जयपुर में आपके घर से प्रोजेक्ट साइट तक और वापस आने के लिए पूर्णतः निःशुल्क प्राइवेट एसी कैब की सुविधा देता है। आप "फ्री कैब साइट विजिट" बटन पर क्लिक करके या हमारे फोन नंबर +91-73000-07643 पर संपर्क करके अपनी विजिट बुक कर सकते हैं।',
  },
];

export function getKhatuFaqs(isHindi: boolean): FAQItem[] {
  return isHindi ? KHATU_FAQS_HI : KHATU_FAQS_EN;
}
