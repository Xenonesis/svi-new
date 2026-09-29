import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, buildAlternates, localizedUrl } from '@/src/lib/seo';
import { AREAS_DATA, type AreaInfo } from '@/src/data/areas';

export interface ProjectSummaryItem {
  title: string;
  type: string;
  img: string;
  status: string;
}

export const PROJECT_SUMMARIES: Record<string, ProjectSummaryItem> = {
  'shivani-vatika-11th': {
    title: 'Shivani Vatika 11th',
    type: 'Premier Residential Plots',
    img: '/Shivani Vatika 11/gate.webp',
    status: 'Ongoing',
  },
  'shyam-aangan': {
    title: 'Shyam Aangan',
    type: 'Integrated Township',
    img: '/images/project1.png',
    status: 'Under Development',
  },
  'shivani-vatika': {
    title: 'Shivani Vatika',
    type: 'Premier Residential',
    img: '/Shivani Vatika/shivani vatika6 frontgate.webp',
    status: 'Under Development',
  },
  'shivani-residency': {
    title: 'Shivani Residency',
    type: 'Residential plots',
    img: '/images/project1.png',
    status: 'Completed',
  },
};

export interface CommercialHubConfig {
  href: string;
  badge: {
    en: string;
    hi: string;
  };
  headline: {
    en: string;
    hi: string;
  };
  description: {
    en: string;
    hi: string;
  };
  ctaText: {
    en: string;
    hi: string;
  };
}

export const COMMERCIAL_HUBS: Record<string, CommercialHubConfig> = {
  'khatu-shyam-highway': {
    href: '/plots-for-sale-near-khatu-shyam-ji',
    badge: {
      en: 'Commercial & Residential Plots Corridor',
      hi: 'कमर्शियल एवं आवासीय प्लॉट्स कॉरिडोर',
    },
    headline: {
      en: 'Looking to buy plots on this corridor? Explore Commercial Plots for Sale Near Khatu Shyam Ji →',
      hi: 'क्या आप इस कॉरिडोर में आवासीय प्लॉट खरीदना चाहते हैं? खाटू श्याम जी के पास उपलब्ध प्लॉट्स देखें →',
    },
    description: {
      en: 'Section 90-A conversion approved plots with immediate highway connectivity, RIICO industrial proximity, clear registry title, and free cab site visits.',
      hi: 'रीको औद्योगिक क्षेत्र व रेणवाल स्टेशन के पास 100% स्पष्ट रजिस्ट्री, गेटेड टाउनशिप और 90-ए स्वीकृत सुनियोजित आवासीय व कमर्शियल प्लॉट्स।',
    },
    ctaText: {
      en: 'Explore Commercial Plots →',
      hi: 'उपलब्ध प्लॉट्स देखें →',
    },
  },
  'phulera-smart-city': {
    href: '/plots-for-sale-in-phulera',
    badge: {
      en: 'DMIC Corridor Investment Hub',
      hi: 'DMIC कॉरिडोर निवेश हब',
    },
    headline: {
      en: 'Explore Available Residential & Commercial Plots for Sale in Phulera Smart City →',
      hi: 'फुलेरा स्मार्ट सिटी में उपलब्ध आवासीय एवं कमर्शियल प्लॉट्स देखें →',
    },
    description: {
      en: 'High-growth plotted investment along the Delhi-Mumbai Industrial Corridor (DMIC) & Western DFC rail junction with strong capital appreciation potential.',
      hi: 'दिल्ली-मुंबई इंडस्ट्रियल कॉरिडोर (DMIC) और वेस्टर्न DFC रेलवे जंक्शन पर मजबूत पूंजी वृद्धि क्षमता वाले स्पष्ट रजिस्ट्री प्लॉट्स।',
    },
    ctaText: {
      en: 'Explore Phulera Plots →',
      hi: 'फुलेरा प्लॉट्स देखें →',
    },
  },
};

export interface AreaInformationalMeta {
  title: { en: string; hi: string };
  description: { en: string; hi: string };
}

export const AREA_INFORMATIONAL_META: Record<string, AreaInformationalMeta> = {
  'khatu-shyam-highway': {
    title: {
      en: 'Jaipur to Khatu Shyam Ji Highway (Harsholi) Corridor & Area Guide',
      hi: 'जयपुर से खाटू श्याम जी हाईवे (हरसोली) - कॉरिडोर व क्षेत्र गाइड',
    },
    description: {
      en: 'Comprehensive informational guide to the Jaipur to Khatu Shyam Ji Highway corridor at Harsholi. Explore RIICO industrial connectivity, Renwal rail transit, and regional infrastructure.',
      hi: 'जयपुर से खाटू श्याम जी हाईवे (हरसोली) कॉरिडोर की संपूर्ण सूचनात्मक गाइड: रीको औद्योगिक क्षेत्र, रेणवाल रेलवे कनेक्टिविटी और क्षेत्रीय विकास की पूरी जानकारी।',
    },
  },
  'phulera-smart-city': {
    title: {
      en: 'Phulera Smart City - DMIC Corridor & Regional Infrastructure Guide',
      hi: 'फुलेरा स्मार्ट सिटी - DMIC कॉरिडोर व क्षेत्रीय इंफ्रास्ट्रक्चर गाइड',
    },
    description: {
      en: 'Complete regional profile of Phulera Smart City along the Delhi-Mumbai Industrial Corridor (DMIC). Detailed insights on the Western DFC rail hub and regional development.',
      hi: 'दिल्ली-मुंबई इंडस्ट्रियल कॉरिडोर (DMIC) के तहत फुलेरा स्मार्ट सिटी की संपूर्ण क्षेत्रीय प्रोफाइल। वेस्टर्न DFC रेल जंक्शन और क्षेत्रीय विकास की विस्तृत जानकारी।',
    },
  },
};

export function buildAreaMetadata(slug: string, locale: string): Metadata {
  const area = AREAS_DATA[slug];
  if (!area) return { title: 'Area Not Found' };

  const path = `/areas/${slug}`;
  const isHindi = locale === 'hi';
  const infoMeta = AREA_INFORMATIONAL_META[slug];
  const title = infoMeta
    ? isHindi
      ? infoMeta.title.hi
      : infoMeta.title.en
    : isHindi && area.metaTitleHi
      ? area.metaTitleHi
      : area.metaTitle;
  const description = infoMeta
    ? isHindi
      ? infoMeta.description.hi
      : infoMeta.description.en
    : isHindi && area.metaDescriptionHi
      ? area.metaDescriptionHi
      : area.metaDescription;

  return {
    title,
    description,
    alternates: buildAlternates(path, locale),
    openGraph: {
      title,
      description,
      url: localizedUrl(path, locale),
      type: 'website',
      siteName: SITE_NAME,
      locale: isHindi ? 'hi_IN' : 'en_IN',
      images: [
        {
          url: `${SITE_URL}/images/project1.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/images/project1.png`],
    },
  };
}

export function getAreaBreadcrumbs(areaName: string, slug: string, isHindi: boolean) {
  return [
    { name: 'Home', item: '/' },
    { name: isHindi ? 'क्षेत्र' : 'Areas', item: '/areas' },
    { name: areaName, item: `/areas/${slug}` },
  ];
}

export function getAreaPlaceSchemaProps(area: AreaInfo, url: string) {
  return {
    name: area.name,
    description: area.description,
    url,
    latitude: area.geo?.latitude,
    longitude: area.geo?.longitude,
    addressLocality: area.geo?.addressLocality || area.name,
    postalCode: area.geo?.postalCode,
    addressRegion: area.geo?.addressRegion || 'Rajasthan',
  };
}
