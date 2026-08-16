export interface AreaInfo {
  slug: string;
  name: string;
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  highlights: string[];
  projects: string[]; // matching project IDs
}

export const AREAS_DATA: Record<string, AreaInfo> = {
  'tonk-road-jaipur': {
    slug: 'tonk-road-jaipur',
    name: 'Tonk Road, Jaipur',
    title: 'Investment Hub on Tonk Road (NH-12), Jaipur',
    description:
      "Tonk Road (NH-12) is one of Jaipur's fastest-growing residential and commercial corridors, offering rapid appreciation and excellent connectivity.",
    metaTitle: 'Properties in Tonk Road Jaipur | SVI Infra Solutions',
    metaDescription:
      'Explore premium residential and commercial projects on Tonk Road, Jaipur. Master-planned townships near IT parks and the upcoming ring road.',
    highlights: [
      'Direct connectivity to Jaipur International Airport (15 mins)',
      'Close proximity to Chokhi Dhani and upcoming Ring Road',
      'Near major education hubs and IT SEZs',
      'Master-planned developments with secure land titles',
    ],
    content:
      "Tonk Road (NH-12) has emerged as the prime growth engine of Jaipur's real estate. With massive infrastructure investments including the Jaipur Ring Road and proximity to the Sitapura Industrial Area, this region has seen property values appreciate steadily over the last decade. It offers a balanced mix of residential townships, luxury apartments, and commercial complexes, making it a hotspot for both end-users and long-term investors.",
    projects: ['shyam-aangan'],
  },
  'nayla-jaipur': {
    slug: 'nayla-jaipur',
    name: 'Nayla, Jaipur',
    title: 'Serene Residential living in Nayla, Jaipur',
    description:
      "Nayla offers a peaceful, pollution-free living environment nestled in nature while remaining fully connected to Jaipur's main city.",
    metaTitle: 'Plots and Residential Properties in Nayla Jaipur | SVI Infra',
    metaDescription:
      'Find your dream home or plot in Nayla, Jaipur. Peaceful community living with essential urban utilities and high ROI potential.',
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
    metaTitle: 'Plots in Phulera Smart City Jaipur | DMIC Corridor Properties',
    metaDescription:
      'Invest in Phulera Smart City, the logistics and industrial center of the Delhi-Mumbai Industrial Corridor. High ROI plots near Sambhar Lake.',
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
