export interface AreaInfo {
  slug: string;
  name: string;
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  metaTitleHi?: string;
  metaDescriptionHi?: string;
  content: string;
  highlights: string[];
  projects: string[]; // matching project IDs
  geo?: {
    latitude: number;
    longitude: number;
    addressLocality: string;
    postalCode?: string;
    addressRegion: string;
  };
}

export const AREAS_DATA: Record<string, AreaInfo> = {
  'khatu-shyam-highway': {
    slug: 'khatu-shyam-highway',
    name: 'Jaipur to Khatu Shyam Ji Highway - Harsholi',
    title: 'Premier Plotted Township on Jaipur – Khatu Shyam Ji Highway (Harsholi)',
    description:
      'Direct highway corridor connecting Jaipur to the sacred Khatu Shyam Dham, adjacent to RIICO Industrial Area and Renwal Railway Station.',
    metaTitle: 'Jaipur to Khatu Shyam Ji Highway (Harsholi) Corridor & Area Guide',
    metaDescription:
      'Comprehensive informational guide to the Jaipur to Khatu Shyam Ji Highway corridor at Harsholi. Explore RIICO industrial connectivity, Renwal rail transit, and regional infrastructure.',
    metaTitleHi: 'जयपुर से खाटू श्याम जी हाईवे (हरसोली) - कॉरिडोर व क्षेत्र गाइड',
    metaDescriptionHi:
      'जयपुर से खाटू श्याम जी हाईवे (हरसोली) कॉरिडोर की संपूर्ण सूचनात्मक गाइड: रीको औद्योगिक क्षेत्र, रेणवाल रेलवे कनेक्टिविटी और क्षेत्रीय विकास की पूरी जानकारी।',
    highlights: [
      'Direct frontage on Jaipur - Khatu Shyam Ji Highway',
      '1 km from 64-acre RIICO Industrial Area with 155+ planned units',
      '7 km from Renwal Railway Station (RNW) with direct Jaipur-Delhi trains',
      'Gated community with 24/7 security, boundary wall, and CCTV',
    ],
    content:
      'The Jaipur to Khatu Shyam Ji Highway corridor via Harsholi and Kishangarh Renwal has emerged as one of the most promising growth corridors in Rajasthan. Anchored by the expansion of the pilgrimage corridor, proximity to the RIICO Industrial Area, and seamless rail transit via Renwal Junction, property appreciation in this corridor is outperforming conventional suburbs. SVI Infra Solutions brings Shivani Vatika 11th to this strategic location with full legal documentation.',
    projects: ['shivani-vatika-11th'],
    geo: {
      latitude: 27.130247,
      longitude: 75.422285,
      addressLocality: 'Harsholi, Kishangarh Renwal',
      postalCode: '303603',
      addressRegion: 'Rajasthan',
    },
  },
  'tonk-road-jaipur': {
    slug: 'tonk-road-jaipur',
    name: 'Nayla, Jaipur • Premier Residential',
    title: 'Premier Residential Living in Nayla, Jaipur',
    description:
      "Located in the serene landscapes of Nayla, Shivani Vatika is redefining modern community living. Offering uniquely crafted residential spaces equipped with essential urban facilities, this project reflects SVI Infra Solutions' commitment to quality, timely delivery, and producing environments that foster active and peaceful lifestyles. With excellent connectivity and promising growth potential, Shivani Vatika is an ideal choice for families seeking a balanced lifestyle.",
    metaTitle: 'Shivani Vatika in Nayla, Jaipur - Premier Residential Plots | SVI Infra',
    metaDescription:
      'Located in the serene landscapes of Nayla, Shivani Vatika offers uniquely crafted residential spaces with essential urban facilities, excellent connectivity and growth potential.',
    metaTitleHi: 'शिवानी वाटिका नायला, जयपुर - प्रीमियर आवासीय प्लॉट्स | SVI Infra',
    metaDescriptionHi:
      'नायला, जयपुर में शिवानी वाटिका - आधुनिक सुविधाओं, उत्कृष्ट कनेक्टिविटी और प्राकृतिक शांत परिवेश में प्रीमियम आवासीय प्लॉट्स।',
    highlights: [
      'Pollution-free, scenic natural surroundings in Nayla',
      'Uniquely crafted residential plots with essential urban utilities',
      'Active community environment with kids play area & gymnasium',
      'High appreciation potential in a serene developing suburb',
    ],
    content:
      "Located in the serene landscapes of Nayla, Shivani Vatika is redefining modern community living. Offering uniquely crafted residential spaces equipped with essential urban facilities, this project reflects SVI Infra Solutions' commitment to quality, timely delivery, and producing environments that foster active and peaceful lifestyles. With excellent connectivity and promising growth potential, Shivani Vatika is an ideal choice for families seeking a balanced lifestyle.",
    projects: [],
  },
  'nayla-jaipur': {
    slug: 'nayla-jaipur',
    name: 'Nayla, Jaipur • Premier Residential',
    title: 'Premier Residential Living in Nayla, Jaipur',
    description:
      "Located in the serene landscapes of Nayla, Shivani Vatika is redefining modern community living. Offering uniquely crafted residential spaces equipped with essential urban facilities, this project reflects SVI Infra Solutions' commitment to quality, timely delivery, and producing environments that foster active and peaceful lifestyles. With excellent connectivity and promising growth potential, Shivani Vatika is an ideal choice for families seeking a balanced lifestyle.",
    metaTitle: 'Plots and Residential Properties in Nayla Jaipur',
    metaDescription:
      'Find your dream home or plot in Nayla, Jaipur. Peaceful community living with essential urban utilities and high ROI potential.',
    metaTitleHi: 'नायला जयपुर में प्लॉट्स और आवासीय प्रॉपर्टीज | SVI Infra',
    metaDescriptionHi:
      'नायला, जयपुर में शांतिपूर्ण और प्राकृतिक वातावरण में गेटेड टाउनशिप प्लॉट्स। बेहतर कनेक्टिविटी और उच्च रिटर्न की गारंटी।',
    highlights: [
      'Pollution-free, scenic natural surroundings',
      'Well-developed roads and reliable water supply',
      'Affordable entry price with high appreciation potential',
      'Gated communities with active lifestyle facilities',
    ],
    content:
      "Nayla is rapidly gaining popularity as a peaceful suburb of Jaipur. Surrounded by hills and greenery, it provides a perfect escape from city noise. SVI Infra's projects in this region focus on developing premium yet affordable gated residential plots equipped with modern infrastructure like paved roads, water connections, and landscaped parks, offering investors a secure asset in a beautiful setting.",
    projects: ['shivani-vatika'],
    geo: {
      latitude: 26.85,
      longitude: 76.0,
      addressLocality: 'Nayla, Jaipur',
      postalCode: '303012',
      addressRegion: 'Rajasthan',
    },
  },
  'phulera-smart-city': {
    slug: 'phulera-smart-city',
    name: 'Phulera Smart City, Jaipur District',
    title: 'Smart City Plots near Sambhar Lake & Phulera Junction',
    description:
      'Phulera is a mega industrial and logistics hub, situated strategically on the Delhi-Mumbai Industrial Corridor (DMIC).',
    metaTitle: 'Phulera Smart City - DMIC Corridor & Regional Infrastructure Guide',
    metaDescription:
      'Complete regional profile of Phulera Smart City along the Delhi-Mumbai Industrial Corridor (DMIC). Detailed insights on the Western DFC rail hub and regional development.',
    metaTitleHi: 'फुलेरा स्मार्ट सिटी - DMIC कॉरिडोर व क्षेत्रीय इंफ्रास्ट्रक्चर गाइड',
    metaDescriptionHi:
      'दिल्ली-मुंबई इंडस्ट्रियल कॉरिडोर (DMIC) के तहत फुलेरा स्मार्ट सिटी की संपूर्ण क्षेत्रीय प्रोफाइल। वेस्टर्न DFC रेल जंक्शन और क्षेत्रीय विकास की विस्तृत जानकारी।',
    highlights: [
      'Strategic location on the DMIC / Dedicated Freight Corridor (DFC)',
      "Near Phulera Junction, one of Rajasthan's busiest rail hubs",
      'Close to the scenic Sambhar Salt Lake region',
      'Rapidly growing industrial hub with massive job creation',
    ],
    content:
      'Phulera is positioned at the intersection of major rail and freight routes, making it the focal point of the Delhi-Mumbai Industrial Corridor (DMIC) in Rajasthan. With massive governmental push for manufacturing zones and dry ports in the area, Phulera is transitioning into a modern smart city. Real estate here offers unmatched appreciation potential due to the influx of industrial developments and logistics parks.',
    projects: ['shivani-residency'],
    geo: {
      latitude: 26.9,
      longitude: 75.18,
      addressLocality: 'Phulera DMIC Corridor, Jaipur District',
      postalCode: '303338',
      addressRegion: 'Rajasthan',
    },
  },
};
