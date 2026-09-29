export interface JaipurProject {
  id: string;
  title: string;
  titleHi: string;
  corridor: string;
  corridorHi: string;
  type: string;
  typeHi: string;
  size: string;
  priceBadge: string;
  img: string;
  highlights: string[];
  href: string;
  brochureUrl: string;
}

export interface JaipurFaqItem {
  question: string;
  answer: string;
}

export interface CorridorLink {
  title: string;
  titleHi: string;
  href: string;
  desc: string;
  descHi: string;
  badge: string;
  badgeHi?: string;
}

export interface JaipurTrustBadge {
  labelEn: string;
  labelHi: string;
  subEn: string;
  subHi: string;
}

export interface JaipurHeroQuickLink {
  href: string;
  label: string;
}

export const JAIPUR_CONTACT = {
  phone: '+917300007643',
  displayPhone: '+91-73000-07643',
} as const;

export const JAIPUR_PAGE_META = {
  titleEn: 'Plots in Jaipur - Verified Residential Plots & Gated Townships for Sale',
  titleHi: 'जयपुर में प्लॉट्स और आवासीय भूमि | 100% स्पष्ट रजिस्ट्री टाउनशिप',
  descEn:
    'Buy verified residential plots and gated township land in Jaipur across prime growth corridors: Khatu Shyam Highway, Nayla & Phulera DMIC. Clear registry, bank loan assistance, and complimentary cab site visits.',
  descHi:
    'जयपुर में खाटू श्याम जी हाईवे, नायला और फुलेरा स्मार्ट सिटी कॉरिडोर पर 100% स्पष्ट रजिस्ट्री आवासीय प्लॉट्स खरीदें। ईएमआई सुविधा और फ्री कैब साइट विजिट उपलब्ध।',
} as const;

export const JAIPUR_PAGE_KEYWORDS: string[] = [
  'Plots in Jaipur',
  'Jaipur Plots',
  'Residential Plots in Jaipur',
  'Residential Land in Jaipur',
  'Plots for sale in Jaipur',
  'Buy Plot in Jaipur',
  'Plots in Jaipur Under 20 Lakhs',
  'Plots in Jaipur Below 10 Lakhs',
  'Gated township Jaipur',
  'Gated Community Plots Jaipur',
  'Freehold Plots Jaipur',
  'Khatu Shyam Highway Plots',
  'Plots Near Renwal Railway Station',
  'Plots in Phulera Smart City',
  'Nayla Jaipur Plots',
  'JDA approved plots Jaipur',
  'Section 90A Plots Jaipur',
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
  'जयपुर में प्लॉट',
  'जयपुर में सस्ते प्लॉट',
  'खाटू श्याम हाईवे प्लॉट',
];

export const JAIPUR_PROJECTS: JaipurProject[] = [
  {
    id: 'shivani-vatika-11th',
    title: 'Shivani Vatika 11th',
    titleHi: 'शिवानी वाटिका 11th',
    corridor: 'Jaipur - Khatu Shyam Ji Highway (Harsholi)',
    corridorHi: 'जयपुर - खाटू श्याम जी हाईवे (हरसोली)',
    type: 'Premier Gated Residential Plots',
    typeHi: 'प्रीमियर आवासीय प्लॉट्स',
    size: '80 - 250 Sq. Yds.',
    priceBadge: 'From ₹ 15 Lakhs*',
    img: '/Shivani Vatika 11/gate.webp',
    highlights: [
      'Adjacent to RIICO Industrial Area',
      '10 mins to Renwal Railway Station',
      'Grand Gate & 24/7 Security',
      'Wide Interlocked Roads',
    ],
    href: '/projects/shivani-vatika-11th',
    brochureUrl: '/Shivani Vatika 11/ShivaniVatika 11.pdf',
  },
  {
    id: 'shivani-vatika',
    title: 'Shivani Vatika',
    titleHi: 'शिवानी वाटिका',
    corridor: 'Nayla, Foothills of Jaipur',
    corridorHi: 'नायला, जयपुर',
    type: 'Luxury Eco-Living Plots',
    typeHi: 'लक्जरी आवासीय प्लॉट्स',
    size: '100 - 300 Sq. Yds.',
    priceBadge: 'From ₹ 22 Lakhs*',
    img: '/Shivani Vatika/shivani vatika6 frontgate.webp',
    highlights: [
      'Serene Natural Foothill Surroundings',
      'Underground Water Supply',
      'Landscaped Green Parks',
      'Quick Connect to Agra Road / Jaipur Bypass',
    ],
    href: '/projects/shivani-vatika',
    brochureUrl: '/Shivani Vatika/shivani-vatika-11th-brochure.pdf',
  },
  {
    id: 'shyam-aangan',
    title: 'Shyam Aangan',
    titleHi: 'श्याम आंगन',
    corridor: 'Basri Khurd, Jaipur',
    corridorHi: 'बासंडी खुर्द, जयपुर',
    type: 'Integrated Modern Township (40 Bigha)',
    typeHi: 'इंटीग्रेटेड टाउनशिप',
    size: '50 - 750 Sq. Yds.',
    priceBadge: 'From ₹ 18 Lakhs*',
    img: '/images/project1.png',
    highlights: [
      '100% Vastu-Compliant Masterplan',
      'Clubhouse & Temple Complex',
      '40-Foot Wide Arterial Roads',
      'Commercial Hub & Daily Needs',
    ],
    href: '/projects/shyam-aangan',
    brochureUrl: '/Shivani Vatika 11/ShivaniVatika 11.pdf',
  },
];

export const JAIPUR_FAQS_EN: JaipurFaqItem[] = [
  {
    question: 'Are residential plots in Jaipur legally verified with clear registry documentation?',
    answer:
      'Yes, plotted developments delivered by SVI Infra Solutions in the Jaipur region feature clear registry documentation, verified ownership titles, Section 90-A revenue clearances, and demarcated boundaries with boundary walls and individual plot numbering.',
  },
  {
    question:
      'What is the starting price for residential plots near Jaipur on Khatu Shyam Ji Highway?',
    answer:
      'Plot sizes at Shivani Vatika 11th start from 80 sq. yds. up to 250 sq. yds., with prices beginning around ₹ 15 Lakhs*. We also offer flexible interest-free payment installments and bank loan assistance.',
  },
  {
    question: 'How can I book a free cab site visit to inspect plots in Jaipur?',
    answer:
      'We offer complimentary chauffeured AC cab pickup and drop from your doorstep anywhere in Jaipur. Simply click the "Book Free Site Visit Cab" button or WhatsApp us at +91-73000-07643 to reserve your timing.',
  },
  {
    question:
      'Why is Khatu Shyam Ji Highway Harsholi one of the highest appreciation corridors in Rajasthan?',
    answer:
      'The corridor benefits from massive pilgrimage footfall expansion, proximity to the RIICO Industrial Area at Renwal, and direct freight and passenger transit connectivity, generating rapid commercial and residential capital appreciation.',
  },
  {
    question: 'Can NRIs and outstation buyers book plots in Jaipur remotely?',
    answer:
      'Yes, SVI Infra provides dedicated virtual walkthroughs, digital allotment ledger access, remote documentation coordination, and RBI-compliant payment processing for outstation and NRI buyers.',
  },
];

export const JAIPUR_FAQS_HI: JaipurFaqItem[] = [
  {
    question:
      'क्या जयपुर में आवासीय प्लॉट्स कानूनी रूप से सत्यापित और स्पष्ट रजिस्ट्री दस्तावेज़ों के साथ हैं?',
    answer:
      'हाँ, जयपुर क्षेत्र में एसवीआई इन्फ्रा सॉल्यूशंस द्वारा विकसित सभी आवासीय प्लॉट्स 100% स्पष्ट रजिस्ट्री, सत्यापित मालिकाना हक, धारा 90-ए राजस्व स्वीकृति और चारदीवारी व व्यक्तिगत प्लॉट नंबरिंग के साथ उपलब्ध हैं।',
  },
  {
    question: 'खाटू श्याम जी हाईवे पर जयपुर के पास आवासीय प्लॉट्स की शुरुआती कीमत क्या है?',
    answer:
      'शिवानी वाटिका 11th में प्लॉट का आकार 80 वर्ग गज से 250 वर्ग गज तक है, जिसकी कीमतें लगभग ₹ 15 लाख* से शुरू होती हैं। हम आसान किश्तों और बैंक लोन की सुविधा भी प्रदान करते हैं।',
  },
  {
    question: 'जयपुर में प्लॉट्स देखने के लिए फ्री कैब साइट विजिट कैसे बुक करें?',
    answer:
      'हम जयपुर में आपके घर से निःशुल्क एसी कैब पिकअप और ड्रॉप की सुविधा प्रदान करते हैं। अपनी विजिट बुक करने के लिए साइट पर दिए गए बटन पर क्लिक करें या +91-73000-07643 पर संपर्क करें।',
  },
  {
    question:
      'खाटू श्याम जी हाईवे हरसोली राजस्थान में सबसे तेजी से बढ़ते निवेश गलियारों में से क्यों है?',
    answer:
      'यह कॉरिडोर धार्मिक पर्यटन विस्तार, रेनवाल रीको इंडस्ट्रियल एरिया की समीपता और सीधी रेल व सड़क कनेक्टिविटी के कारण आवासीय और व्यावसायिक पूंजी वृद्धि का प्रमुख केंद्र बन चुका है।',
  },
  {
    question: 'क्या एनआरआई (NRI) और बाहरी खरीदार दूर से जयपुर में प्लॉट बुक कर सकते हैं?',
    answer:
      'हाँ, एसवीआई इन्फ्रा बाहर रहने वाले और एनआरआई खरीदारों के लिए वर्चुअल वॉकथ्रू, डिजिटल अलॉटमेंट और ऑनलाइन दस्तावेज़ीकरण समन्वय की पूरी सुविधा प्रदान करता है।',
  },
];

export const JAIPUR_FAQS: JaipurFaqItem[] = JAIPUR_FAQS_EN;

export const CORRIDORS_LIST: CorridorLink[] = [
  {
    badge: 'NHAI 4-Lane Belt',
    badgeHi: 'एनएचएआई 4-लेन बेल्ट',
    title: 'Plots Near Khatu Shyam Ji',
    titleHi: 'खाटू श्याम जी के पास प्लॉट्स',
    href: '/plots-for-sale-near-khatu-shyam-ji',
    desc: '20-25 mins from sacred temple, 4-lane expressway corridor, Shivani Vatika 11th.',
    descHi: '4-लेन जयपुर-खाटू हाईवे, 20-25 मिनट मंदिर से दूरी, शिवानी वाटिका 11th टाउनशिप।',
  },
  {
    badge: 'DMIC & DFC Freight Hub',
    badgeHi: 'डीएमआईसी व डीएफसी फ्रेट हब',
    title: 'Plots in Phulera Smart City',
    titleHi: 'फुलेरा स्मार्ट सिटी में प्लॉट्स',
    href: '/plots-for-sale-in-phulera',
    desc: 'Western DFC freight junction, industrial logistics corridor, plots from ₹ 15 Lakhs*.',
    descHi: 'वेस्टर्न DFC रेलवे जंक्शन और सांभर लॉजिस्टिक्स पार्क के निकट आवासीय व औद्योगिक भूखंड।',
  },
  {
    badge: 'RIICO Industrial Zone',
    badgeHi: 'रीको इंडस्ट्रियल ज़ोन',
    title: 'Plots Near Renwal Station',
    titleHi: 'रेनवाल रेलवे स्टेशन के पास प्लॉट्स',
    href: '/plots-near-renwal-railway-station',
    desc: '35 mins express train to Jaipur Junction, 1 km from 64-acre operational RIICO hub.',
    descHi: 'जयपुर जंक्शन तक 35 मिनट की ट्रेन, 64 एकड़ रीको इंडस्ट्रियल एरिया से मात्र 1 किमी।',
  },
];

export const JAIPUR_TRUST_BADGES: JaipurTrustBadge[] = [
  {
    labelEn: '100% Clear Title',
    labelHi: '100% स्पष्ट दस्तावेज़',
    subEn: 'Zero Dispute',
    subHi: 'सुरक्षित निवेश',
  },
  {
    labelEn: 'Free AC Cab Visit',
    labelHi: 'फ्री कैब साइट विजिट',
    subEn: 'Doorstep Pickup',
    subHi: 'घर से पिकअप',
  },
  {
    labelEn: 'Easy Installments',
    labelHi: 'आसान किश्तें',
    subEn: 'Bank Loan Help',
    subHi: 'बैंक सहायता',
  },
  {
    labelEn: '17+ Years Legacy',
    labelHi: '17+ वर्षों का अनुभव',
    subEn: 'Trusted Developer',
    subHi: 'विश्वसनीय बिल्डर',
  },
];

export const JAIPUR_HERO_QUICK_LINKS: JaipurHeroQuickLink[] = [
  {
    href: '/plots-near-renwal-railway-station',
    label: '📍 Plots Near Renwal Station →',
  },
  {
    href: '/plots-in-jaipur-under-20-lakhs',
    label: '💰 Budget Plots Under ₹ 20 Lakhs →',
  },
  {
    href: '/blog/jaipur-to-khatu-shyam-highway-land-rates-roi-2026',
    label: '📊 Highway Land Rates Report 2026 →',
  },
];

export const JAIPUR_PLACE_SCHEMA = {
  name: 'Jaipur Residential Townships & Land Developments',
  description:
    'Verified residential plots, gated communities, and highway investment lands across Jaipur district.',
  latitude: 26.9124,
  longitude: 75.7873,
  addressLocality: 'Jaipur',
  addressRegion: 'Rajasthan',
  postalCode: '302001',
} as const;

export const JAIPUR_LISTING_SCHEMA = {
  name: 'Residential Plots & Gated Townships in Jaipur',
  description:
    'Verified residential plots (80 to 250 sq. yds.) in master-planned gated townships across Jaipur, Khatu Shyam Highway, Renwal, and Phulera DMIC.',
  image: '/images/project1.png',
  location: 'Jaipur, Rajasthan',
  status: 'InStock',
  lowPrice: '600000',
  highPrice: '2500000',
  offerCount: 230,
} as const;
