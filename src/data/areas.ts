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
}

export const AREAS_DATA: Record<string, AreaInfo> = {
  'khatu-shyam-highway': {
    slug: 'khatu-shyam-highway',
    name: 'Jaipur to Khatu Shyam Ji Highway - Harsholi',
    title: 'Premier Plotted Township on Jaipur – Khatu Shyam Ji Highway (Harsholi)',
    description:
      'Direct highway corridor connecting Jaipur to the sacred Khatu Shyam Dham, adjacent to RIICO Industrial Area and Renwal Railway Station.',
    metaTitle: 'Plots on Jaipur to Khatu Shyam Ji Highway Harsholi | SVI Infra',
    metaDescription:
      'Explore Shivani Vatika 11th on Jaipur to Khatu Shyam Ji Highway - Harsholi. RERA-approved plots with immediate highway connectivity, RIICO proximity, and clear documentation.',
    metaTitleHi: 'जयपुर से खाटू श्याम जी हाईवे हरसोली में प्लॉट्स | SVI Infra',
    metaDescriptionHi:
      'जयपुर से खाटू श्याम जी हाईवे - हरसोली (शिवानी वाटिका 11th) में आवासीय भूखंड। रीको औद्योगिक क्षेत्र और रेणवाल रेलवे स्टेशन के पास।',
    highlights: [
      'Direct frontage on Jaipur - Khatu Shyam Ji Highway',
      '1 km from 64-acre RIICO Industrial Area with 155+ planned units',
      '7 km from Renwal Railway Station (RNW) with direct Jaipur-Delhi trains',
      'Gated community with 24/7 security, boundary wall, and CCTV',
    ],
    content:
      'The Jaipur to Khatu Shyam Ji Highway corridor via Harsholi and Kishangarh Renwal has emerged as one of the most promising growth corridors in Rajasthan. Anchored by the expansion of the pilgrimage corridor, proximity to the RIICO Industrial Area, and seamless rail transit via Renwal Junction, property appreciation in this corridor is outperforming conventional suburbs. SVI Infra Solutions brings Shivani Vatika 11th to this strategic location with full legal documentation.',
    projects: ['shivani-vatika-11th'],
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
  },
  'phulera-smart-city': {
    slug: 'phulera-smart-city',
    name: 'Phulera Smart City, Jaipur District',
    title: 'Smart City Plots near Sambhar Lake & Phulera Junction',
    description:
      'Phulera is a mega industrial and logistics hub, situated strategically on the Delhi-Mumbai Industrial Corridor (DMIC).',
    metaTitle: 'Plots in Phulera Smart City Jaipur | DMIC Corridor',
    metaDescription:
      'Invest in Phulera Smart City, the logistics and industrial center of the Delhi-Mumbai Industrial Corridor. High ROI plots near Sambhar Lake.',
    metaTitleHi: 'फुलेरा स्मार्ट सिटी जयपुर में प्लॉट्स | DMIC कॉरिडोर | SVI Infra',
    metaDescriptionHi:
      'फुलेरा स्मार्ट सिटी (DMIC कॉरिडोर) में आवासीय और कमर्शियल प्लॉट्स में निवेश करें। सांभर लेक के नजदीक उच्च विकास दर।',
    highlights: [
      'Strategic location on the DMIC / Dedicated Freight Corridor (DFC)',
      "Near Phulera Junction, one of Rajasthan's busiest rail hubs",
      'Close to the scenic Sambhar Salt Lake region',
      'Rapidly growing industrial hub with massive job creation',
    ],
    content:
      'Phulera is positioned at the intersection of major rail and freight routes, making it the focal point of the Delhi-Mumbai Industrial Corridor (DMIC) in Rajasthan. With massive governmental push for manufacturing zones and dry ports in the area, Phulera is transitioning into a modern smart city. Real estate here offers unmatched appreciation potential due to the influx of industrial developments and logistics parks.',
    projects: ['shivani-residency'],
  },
};
