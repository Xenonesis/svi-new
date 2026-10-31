export interface ExclusiveOfferSpotlightConfig {
  enabled: boolean;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  perks: string[];
  primaryCtaText: string;
  primaryCtaLink: string;
  phone: string;
  targetDate: string;
}

export const defaultSpotlightConfig: ExclusiveOfferSpotlightConfig = {
  enabled: true,
  badge: 'DIWALI SPECIAL OFFER 🪔',
  title: 'Plot Ki Registry Par FREE SCOOTY & Exciting Gifts!',
  subtitle: 'Shivani Vatika 11th • Near Khatu Shyam Ji, Rajasthan',
  description:
    'Book your residential plot this festive season and get a brand-new Scooty on Registry. Complimentary doorstep AC cab site visit from Delhi & Noida!',
  perks: [
    'Free Scooty on Registry',
    'Free AC Cab from Delhi/Noida',
    'Auspicious 24K Gold Coin',
    'Immediate Demarcated Plots',
  ],
  primaryCtaText: 'Claim Diwali Offer',
  primaryCtaLink: '/exclusive-offers',
  phone: '+91 73000 07643',
  targetDate: '2026-11-15T23:59:59',
};
