export type ProjectData = {
  title: string;
  titleHi?: string;
  location: string;
  locationHi?: string;
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
  description: string;
  descriptionHi?: string;
  brochureUrl?: string;
};

export const PROJECTS_DB: Record<string, ProjectData> = {
  'shivani-vatika-11th': {
    title: 'Shivani Vatika 11th',
    titleHi: 'शिवानी वाटिका 11th',
    location: 'Near Khatu Shyam Ji',
    locationHi: 'खाटू श्याम जी के पास',
    status: 'Ongoing',
    type: 'Premier Residential Plots',
    typeHi: 'प्रीमियर आवासीय प्लॉट्स',
    heroImage: '/images/shivani-vatika-11th.png',
    gallery: [
      '/images/shivani-vatika-11th.png',
      '/images/shivani-vatika-11th-gallery-1.png',
      '/images/shivani-vatika-11th-gallery-2.png',
      '/images/shivani-vatika-11th-gallery-3.png',
      '/images/shivani-vatika-11th-gallery-4.webp',
      '/images/shivani-vatika-11th-gallery-5.jpeg',
    ],
    amenities: [
      'Park',
      'Guard Room',
      'Electricity',
      'Water Supply',
      'Boundary',
      'Road',
      'Care-Taker',
    ],
    amenitiesHi: ['पार्क', 'गार्ड रूम', 'बिजली', 'पानी की आपूर्ति', 'बाउंड्री', 'सड़क', 'केयरटेकर'],
    totalPlots: '230',
    startingSize: '100-150 Sq. Yds.',
    startingSizeHi: '100-150 वर्ग गज',
    availableSizes: ['100-150 Sq. Yds.', '150-200 Sq. Yds.', 'Above 200 Sq. Yds.'],
    mapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m13!1m8!1m3!1d1620.527332206488!2d75.422285!3d27.130247!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjfCsDA3JzUxLjIiTiA3NcKwMjUnMTkuMCJF!5e1!3m2!1sen!2sus!4v1784202961766!5m2!1sen!2sus',
    description:
      'Shivani Vatika 11th – A Promising Residential Society Near Khatu Shyam Ji. Shivani Vatika 11th is a well-planned residential project spread over 11.5 bigha (approx. 30,480 sq. yds.), developed with clear documentation and complete transparency for buyers. The township offers 230 residential plots ranging from 50 sq. yds. to 200 sq. yds., giving families the flexibility to choose according to their needs. Designed with modern infrastructure and essential facilities.',
    descriptionHi:
      'शिवानी वाटिका 11th – खाटू श्याम जी के पास एक शानदार आवासीय टाउनशिप। शिवानी वाटिका 11th एक सुनियोजित आवासीय परियोजना है जो 11.5 बीघा (लगभग 30,480 वर्ग गज) में फैली हुई है, जिसे पूर्णतः स्पष्ट दस्तावेज़ों और पारदर्शिता के साथ विकसित किया गया है, जो खरीदारों के लिए पूर्ण विश्वास सुनिश्चित करता है। टाउनशिप में 50 वर्ग गज से 200 वर्ग गज तक के 230 आवासीय भूखंड हैं, जो परिवारों को अपनी आवश्यकता के अनुसार चुनने की सुविधा देते हैं। आधुनिक बुनियादी ढांचे और आवश्यक सुविधाओं के साथ डिज़ाइन किया गया है।',
    brochureUrl: '/Shivani Vatika/shivani-vatika-11th-brochure.pdf',
  },
  'shyam-aangan': {
    title: 'Shyam Aangan',
    titleHi: 'श्याम आंगन',
    location: 'Basri Khurd, Jaipur',
    locationHi: 'बांसड़ी खुर्द, जयपुर',
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
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113645.72763327663!2d75.75055239726563!3d26.8503923!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396c4adf4c57e281%3A0xce1c63a0cf22e09!2sJaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    description:
      'Shyam Aangan offers a premium integrated township experience in the heart of Jaipur. Designed for modern families, it features world-class amenities and 100% Vastu compliant plots.',
    descriptionHi:
      'श्याम आंगन जयपुर के मध्य में एक प्रीमियम एकीकृत टाउनशिप का अनुभव प्रदान करता है। आधुनिक परिवारों के लिए डिज़ाइन किया गया, इसमें विश्व स्तरीय सुविधाएँ और 100% वास्तु अनुकूल भूखंड हैं।',
  },
  'shivani-vatika': {
    title: 'Shivani Vatika',
    titleHi: 'शिवानी वाटिका',
    location: 'Manpura Machedi',
    locationHi: 'मानपुरा माचेड़ी',
    status: 'Under Construction',
    type: 'Premier Residential',
    typeHi: 'प्रीमियर आवासीय',
    heroImage: '/images/project2.png',
    gallery: ['/images/project2.png', '/images/hero2.png'],
    amenities: ['Gated Community', 'Kids Play Area', 'Gymnasium', 'Rainwater Harvesting'],
    amenitiesHi: ['गेटेड कम्युनिटी', 'बच्चों के खेलने का क्षेत्र', 'जिम', 'रेनवाटर हार्वेस्टिंग'],
    totalPlots: '100+',
    startingSize: '100 Sq. Yds.',
    startingSizeHi: '100 वर्ग गज',
    availableSizes: ['100-150 Sq. Yds.'],
    mapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113645.72763327663!2d75.75055239726563!3d26.8503923!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396c4adf4c57e281%3A0xce1c63a0cf22e09!2sJaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    description:
      'Shivani Vatika brings premier residential living to Manpura Machedi. Surrounded by lush greenery, it provides a serene escape from the city bustle while maintaining excellent connectivity.',
    descriptionHi:
      'शिवानी वाटिका मानपुरा माचेड़ी में प्रमुख आवासीय जीवन लाती है। हरियाली से घिरा, यह बेहतरीन कनेक्टिविटी बनाए रखते हुए शहर की हलचल से दूर एक शांत जगह प्रदान करता है।',
  },
};
