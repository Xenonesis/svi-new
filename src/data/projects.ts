export type NearbyPlaceItem = {
  name: string;
  nameHi: string;
  distance?: string;
  distanceHi?: string;
  time: string;
  timeHi: string;
  category: 'industry' | 'railway' | 'logistics' | 'temple' | 'highway' | 'corridor' | 'civic';
  tag?: string;
  tagHi?: string;
  description: string;
  descriptionHi: string;
  image?: string;
  featured?: boolean;
};

export type ProjectData = {
  title: string;
  titleHi?: string;
  location: string;
  locationHi?: string;
  headerSubtitle?: string;
  headerSubtitleHi?: string;
  status: string;
  type: string;
  typeHi?: string;
  heroImage: string;
  gallery: string[];
  amenities: string[];
  amenitiesHi?: string[];
  totalPlots?: string;
  startingSize?: string;
  startingSizeHi?: string;
  availableSizes?: string[];
  mapEmbedUrl?: string;
  mapUrl?: string;
  description: string;
  descriptionHi?: string;
  brochureUrl?: string;
  nearbyPlaces?: NearbyPlaceItem[];
};

export const PROJECTS_DB: Record<string, ProjectData> = {
  'shivani-vatika-11th': {
    title: 'Shivani Vatika 11th',
    titleHi: 'शिवानी वाटिका 11th',
    location: 'Jaipur to Khatu Shyam Ji Highway - Harsholi',
    locationHi: 'जयपुर से खाटू श्याम जी हाईवे - हरसोली',
    headerSubtitle: 'Jaipur to Khatu Shyam Ji Highway - Harsholi',
    headerSubtitleHi: 'जयपुर से खाटू श्याम जी हाईवे - हरसोली',
    status: 'Ongoing',
    type: 'Premier Residential Plots',
    typeHi: 'प्रीमियर आवासीय प्लॉट्स',
    heroImage: '/Shivani Vatika 11/gate.webp',
    gallery: [
      '/Shivani Vatika 11/gate.webp',
      '/Shivani Vatika 11/plot.webp',
      '/Shivani Vatika 11/middle.webp',
      '/Shivani Vatika 11/middle2.webp',
      '/Shivani Vatika 11/middle3.webp',
      '/Shivani Vatika 11/middle4.webp',
      '/Shivani Vatika 11/middle5.webp',
      '/Shivani Vatika 11/middle6.webp',
    ],
    amenities: [
      'Society Boundary',
      'Main Gate',
      'CCTV Camera',
      '24/7 Security',
      'Park',
      'Guard Room',
      'Electricity',
      'Water Supply',
      'Road',
      'Care-Taker',
    ],
    amenitiesHi: [
      'सोसाइटी बाउंड्री',
      'मेन गेट',
      'सीसीटीवी कैमरा',
      '24/7 सुरक्षा',
      'पार्क',
      'गार्ड रूम',
      'बिजली',
      'पानी की आपूर्ति',
      'सड़क',
      'केयरटेकर',
    ],
    totalPlots: '230',
    startingSize: '80-250 Sqyrds',
    startingSizeHi: '80-250 वर्ग गज',
    availableSizes: ['80-150 Sq. Yds.', '150-200 Sq. Yds.', '200-250 Sq. Yds.'],
    mapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m13!1m8!1m3!1d1620.527332206488!2d75.422285!3d27.130247!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjfCsDA3JzUxLjIiTiA3NcKwMjUnMTkuMCJF!5e1!3m2!1sen!2sus!4v1784202961766!5m2!1sen!2sus',
    description:
      'Shivani Vatika 11th – A Promising Residential Society Near Khatu Shyam Ji. Shivani Vatika 11th is a well-planned residential project spread over 11.5 bigha (approx. 30,480 sq. yds.), developed with clear documentation and complete transparency for buyers. The township offers 230 residential plots ranging from 80 sq. yds. to 250 sq. yds., giving families the flexibility to choose according to their needs. Designed with modern infrastructure, secure society boundary, grand main gate, CCTV cameras, 24/7 security, and essential facilities.',
    descriptionHi:
      'शिवानी वाटिका 11th – खाटू श्याम जी के पास एक शानदार आवासीय टाउनशिप। शिवानी वाटिका 11th एक सुनियोजित आवासीय परियोजना है जो 11.5 बीघा (लगभग 30,480 वर्ग गज) में फैली हुई है, जिसे पूर्णतः स्पष्ट दस्तावेज़ों और पारदर्शिता के साथ विकसित किया गया है, जो खरीदारों के लिए पूर्ण विश्वास सुनिश्चित करता है। टाउनशिप में 80 वर्ग गज से 250 वर्ग गज तक के 230 आवासीय भूखंड हैं, जो परिवारों को अपनी आवश्यकता के अनुसार चुनने की सुविधा देते हैं। सुरक्षित सोसाइटी बाउंड्री, भव्य मेन गेट, सीसीटीवी कैमरा, 24/7 सुरक्षा, आधुनिक बुनियादी ढांचे और आवश्यक सुविधाओं के साथ डिज़ाइन किया गया है।',
    brochureUrl: '/Shivani Vatika 11/ShivaniVatika 11.pdf',
    nearbyPlaces: [
      {
        name: 'RIICO Industrial Area',
        nameHi: 'रीको इंडस्ट्रियल एरिया (रेणवाल)',
        distance: '1 km away',
        distanceHi: '1 किमी दूर',
        time: '~2 mins drive',
        timeHi: '~2 मिनट',
        category: 'industry',
        tag: 'Industrial Growth Zone',
        tagHi: 'औद्योगिक विकास क्षेत्र',
        description:
          '64+ acres operational RIICO industrial hub with 155+ planned units driving employment, commercial infrastructure, and high rental demand.',
        descriptionHi:
          '64+ एकड़ में विस्तृत रीको औद्योगिक क्षेत्र, 155+ नियोजित इकाइयों के साथ स्थानीय रोजगार और मजबूत रेंटल डिमांड सुनिश्चित करता है।',
        image: '/images/landmarks/riico-industrial.webp',
        featured: true,
      },
      {
        name: 'Renwal Railway Station (RNW)',
        nameHi: 'रेणवाल रेलवे स्टेशन (RNW)',
        distance: '7 km',
        distanceHi: '7 किमी',
        time: '5 mins drive',
        timeHi: '5 मिनट',
        category: 'railway',
        tag: 'Express Rail Transit',
        tagHi: 'एक्सप्रेस रेल ट्रांजिट',
        description:
          'Direct North Western Railway station on the Phulera–Ringas–Rewari line with regular passenger and express train connectivity to Jaipur and Delhi.',
        descriptionHi:
          'फुलेरा-रींगस-रेवाड़ी रेल लाइन पर स्थित उत्तर पश्चिम रेलवे स्टेशन, जयपुर और दिल्ली के लिए नियमित ट्रेनों की सुगम सुविधा।',
        image: '/images/landmarks/renwal-railway.webp',
        featured: true,
      },
      {
        name: 'Ambani & Adani Warehouses',
        nameHi: 'अंबानी एवं अडानी वेयरहाउस',
        distance: 'Next to 7 kms',
        distanceHi: 'अगले 7 किमी में',
        time: '~6 mins drive',
        timeHi: '~6 मिनट',
        category: 'logistics',
        tag: 'Mega Logistics Corridor',
        tagHi: 'लॉजिस्टिक्स कॉरिडोर',
        description:
          'Corporate mega warehousing and national supply-chain distribution hubs driving institutional capital and massive land valuation.',
        descriptionHi:
          'अग्रणी कॉरपोरेट वेयरहाउसिंग एवं नेशनल सप्लाई-चेन हब, जो इस पूरे रीजन में भूमि के तेजी से बढ़ते पूंजीगत मूल्य को गति दे रहे हैं।',
        image: '/images/landmarks/corporate-warehouses.webp',
        featured: true,
      },
      {
        name: 'Shree Khatu Shyam Ji Mandir',
        nameHi: 'श्री खाटू श्याम जी मंदिर',
        time: '20–25 mins',
        timeHi: '20–25 मिनट',
        category: 'temple',
        tag: 'Sacred Tourism Axis',
        tagHi: 'पवित्र तीर्थ कॉरिडोर',
        description:
          'Direct highway corridor to the world-renowned pilgrimage dham, ensuring round-the-year commercial footfall, hospitality, and sustained appreciation.',
        descriptionHi:
          'विश्व प्रसिद्ध खाटू श्याम जी धाम के लिए सीधा हाईवे मार्ग, जो साल भर तीर्थयात्रियों के आवागमन और हाईवे कमर्शियल वैल्यू को बढ़ाता है।',
        image: '/images/landmarks/khatu-shyam-mandir.webp',
        featured: true,
      },
      {
        name: 'Jaipur – Khatu Shyam Ji Highway',
        nameHi: 'जयपुर - खाटू श्याम जी हाईवे',
        distance: '0 km (Frontage)',
        distanceHi: '0 किमी (मेन हाईवे)',
        time: 'Direct Access',
        timeHi: 'सीधा प्रवेश',
        category: 'highway',
        tag: 'Arterial Highway',
        tagHi: 'मुख्य राजमार्ग',
        description:
          'Instant, smooth highway connectivity directly connecting Jaipur City with the holy shrine corridor without navigating unpaved roads.',
        descriptionHi:
          'जयपुर शहर और खाटू धाम को जोड़ने वाले मुख्य राजमार्ग पर प्रत्यक्ष प्रवेश, बिना किसी कच्ची सड़क के निर्बाध आवागमन।',
        image: '/images/landmarks/jaipur-highway.webp',
      },
      {
        name: 'Phulera Junction & DMIC Corridor',
        nameHi: 'फुलेरा जंक्शन एवं DMIC कॉरिडोर',
        distance: '~34 km',
        distanceHi: '~34 किमी',
        time: '~35 mins drive',
        timeHi: '~35 मिनट',
        category: 'corridor',
        tag: 'Dedicated Freight Corridor',
        tagHi: 'स्मार्ट सिटी / DFC',
        description:
          'Major Western Dedicated Freight Corridor (DFC) junction and proposed multi-modal smart logistics city.',
        descriptionHi:
          'वेस्टर्न डेडिकेटेड फ्रेट कॉरिडोर (DFC) का मुख्य जंक्शन एवं मेगा स्मार्ट लॉजिस्टिक्स औद्योगिक कॉरिडोर।',
        image: '/images/landmarks/phulera-dmic.webp',
      },
      {
        name: 'Colleges, Schools & Hospitals',
        nameHi: 'कॉलेज, स्कूल एवं CHC अस्पताल',
        distance: '5–7 km',
        distanceHi: '5–7 किमी',
        time: '5–8 mins drive',
        timeHi: '5–8 मिनट',
        category: 'civic',
        tag: 'Civic Infrastructure',
        tagHi: 'नागरिक सुविधाएं',
        description:
          'Govt. Degree College Kishangarh Renwal, Senior Secondary Schools, 24/7 CHC Hospital, SBI, PNB, and IDFC First Bank branches.',
        descriptionHi:
          'राजकीय महाविद्यालय किशनगढ़ रेणवाल, सीनियर सेकेंडरी स्कूल, 24/7 सामुदायिक स्वास्थ्य केंद्र (CHC), एसबीआई व आईडीएफसी बैंक।',
        image: '/images/landmarks/civic-institutions.webp',
      },
    ],
  },
  'shyam-aangan': {
    title: 'Shyam Aangan',
    titleHi: 'श्याम आंगन',
    location: 'Basri Khurd, Jaipur',
    locationHi: 'बासंडी खुर्द, जयपुर',
    status: 'Ready to Move',
    type: 'Integrated Township',
    typeHi: 'इंटीग्रेटेड टाउनशिप',
    heroImage: '/images/project1.png',
    gallery: ['/images/project1.png', '/images/hero1.png'],
    amenities: [
      'Clubhouse',
      'Swimming Pool',
      '24/7 Security',
      'Parks & Gardens',
      'Temple',
      'Commercial Center',
    ],
    amenitiesHi: [
      'क्लब हाउस',
      'स्वीमिंग पूल',
      '24/7 सुरक्षा',
      'पार्क और गार्डन',
      'मंदिर',
      'व्यावसायिक केंद्र',
    ],
    totalPlots: '250+',
    startingSize: '150 Sq. Yds.',
    startingSizeHi: '150 वर्ग गज',
    availableSizes: ['150-200 Sq. Yds.', 'Above 200 Sq. Yds.'],
    mapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3557.07!2d76.0052071!3d26.9215965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDU1JzE3LjgiTiA3NsKwMDAnMjguMCJF!5e0!3m2!1sen!2sin!4v1789632000000!5m2!1sen!2sin',
    mapUrl: 'https://www.google.com/maps?q=26.92159652709961,76.00778198242188&z=17&hl=en',
    description:
      'Shyam Aangan offers a premium integrated township experience in the heart of Jaipur. Designed for modern families, it features world-class amenities and 100% Vastu compliant plots.',
    descriptionHi:
      'श्याम आंगन जयपुर के मध्य में एक प्रीमियम एकीकृत टाउनशिप का अनुभव प्रदान करता है। आधुनिक परिवारों के लिए डिज़ाइन किया गया, इसमें विश्व स्तरीय सुविधाएँ और 100% वास्तु अनुकूल भूखंड हैं।',
  },
  'shivani-vatika': {
    title: 'Shivani Vatika',
    titleHi: 'शिवानी वाटिका',
    location: 'Nayla, Jaipur',
    locationHi: 'नायला, जयपुर',
    status: 'Under Construction',
    type: 'Premier Residential',
    typeHi: 'प्रीमियर आवासीय',
    heroImage: '/Shivani Vatika/shivani vatika6 frontgate.webp',
    gallery: [
      '/Shivani Vatika/shivani vatika6 frontgate.webp',
      '/Shivani Vatika/shivani vatika.webp',
      '/Shivani Vatika/shivani vatik both.webp',
      '/Shivani Vatika/shivani vatika3.webp',
      '/Shivani Vatika/shivani vatika4.webp',
      '/Shivani Vatika/shivani vatika5.webp',
      '/Shivani Vatika/shivani vatika7.webp',
    ],
    amenities: ['Gated Community', 'Kids Play Area', 'Gymnasium', 'Rainwater Harvesting'],
    amenitiesHi: ['गेटेड कम्युनिटी', 'बच्चों के खेलने का क्षेत्र', 'जिम', 'रेनवाटर हार्वेस्टिंग'],
    totalPlots: '100+',
    startingSize: '100 Sq. Yds.',
    startingSizeHi: '100 वर्ग गज',
    availableSizes: ['100-150 Sq. Yds.'],
    mapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3557.07!2d76.0052071!3d26.9215965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDU1JzE3LjgiTiA3NsKwMDAnMjguMCJF!5e0!3m2!1sen!2sin!4v1789632000000!5m2!1sen!2sin',
    mapUrl:
      "https://www.google.com/maps/place/26%C2%B055'17.8%22N+76%C2%B000'28.0%22E/@26.9215965,76.0052071,845m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d26.9215965!4d76.007782?hl=en&entry=ttu&g_ep=EgoyMDI2MDkxNC4wIKXMDSoASAFQAw%3D%3D",
    description:
      "Located in the serene landscapes of Nayla, Shivani Vatika is redefining modern community living. Offering uniquely crafted residential spaces equipped with essential urban facilities, this project reflects SVI Infra Solutions' commitment to quality, timely delivery, and producing environments that foster active and peaceful lifestyles. With excellent connectivity and promising growth potential, Shivani Vatika is an ideal choice for families seeking a balanced lifestyle.",
    descriptionHi:
      'नायला के शांत और मनोरम परिवेश में स्थित, शिवानी वाटिका आधुनिक सामुदायिक जीवन को पुनर्परिभाषित कर रही है। आवश्यक शहरी सुविधाओं से युक्त विशिष्ट रूप से तैयार किए गए आवासीय स्थान प्रदान करते हुए, यह प्रोजेक्ट एसवीआई इंफ्रा सॉल्यूशंस की गुणवत्ता, समय पर डिलीवरी और सक्रिय व शांतिपूर्ण जीवनशैली को बढ़ावा देने वाले वातावरण के निर्माण की प्रतिबद्धता को दर्शाता है। बेहतरीन कनेक्टिविटी और विकास की आशाजनक संभावनाओं के साथ, शिवानी वाटिका संतुलित जीवनशैली चाहने वाले परिवारों के लिए एक आदर्श विकल्प है।',
  },
};
