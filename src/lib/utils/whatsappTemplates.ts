/**
 * SVI Corporate WhatsApp Quick Templates Engine
 * Generates pre-formatted, high-converting WhatsApp messages & direct wa.me links.
 */

export interface WhatsAppTemplate {
  id: 'brochure' | 'site_visit' | 'pricing';
  title: string;
  badge: string;
  description: string;
  generateText: (params: {
    clientName?: string;
    advisorName?: string;
    advisorPhone?: string;
  }) => string;
}

export const WHATSAPP_TEMPLATES: Record<string, WhatsAppTemplate> = {
  brochure: {
    id: 'brochure',
    title: 'Brochure & Project Location',
    badge: 'Brochure',
    description: 'Shivani Vatika-11 brochure PDF link and Google Maps location pin',
    generateText: ({ clientName, advisorName }) => {
      const greeting = clientName ? `Namaste ${clientName} ji,` : 'Namaste ji,';
      const advisorSign = advisorName
        ? `\n\n— *${advisorName}*\nSVI Infra Solutions`
        : '\n\n— *SVI Infra Solutions*';

      return `${greeting}

SVI Infra Solutions ki taraf se Shivani Vatika (Kankerkhera, Meerut) project ki details neeche di gayi hain:

🌟 *Shivani Vatika - 11 Highlights:*
• 143 Approved Gated Township
• Immediate Registry & Dakhil Kharij
• 24/7 Security with CCTV Surveillance
• 30 ft. & 25 ft. Wide Concrete Roads
• Complete Underground Sewerage & Electricity

📄 *Official Brochure & Layout Map:*
https://sviinfra.com/brochure/shivani-vatika-11

📍 *Google Maps Location:*
https://maps.app.goo.gl/svi-shivani-vatika-11

Agar aapko plot size ya pricing se related koi sawaal ho to isi WhatsApp par reply kar sakte hain.${advisorSign}`;
    },
  },

  site_visit: {
    id: 'site_visit',
    title: 'Free Site Visit Invitation',
    badge: 'Site Visit',
    description: 'Weekend site visit invite with complimentary AC cab pick & drop',
    generateText: ({ clientName, advisorName }) => {
      const greeting = clientName ? `Namaste ${clientName} ji,` : 'Namaste ji,';
      const advisorSign = advisorName
        ? `\n\n— *${advisorName}*\nSVI Infra Solutions`
        : '\n\n— *SVI Infra Solutions*';

      return `${greeting}

Aapko aur aapki family ko SVI Infra Solutions ki taraf se *Shivani Vatika* par complimentary site visit ke liye invite karte hain! 🚗✨

🌟 *Site Visit Facility:*
• Free AC Cab Pick & Drop (Ghar se Site tak)
• Direct On-Site Plot Selection & Map Inspection
• Legal Documents (Registry/Khatauni/143) Verification

Aap is Saturday ya Sunday kab free hain? Humein confirm karein taaki hum aapke liye vehicle schedule kar sakein.${advisorSign}`;
    },
  },

  pricing: {
    id: 'pricing',
    title: 'Plot Sizes & Payment Plan',
    badge: 'Prices',
    description: 'Overview of 50, 100, 150, 200 sq. yard plots with bank loan guidance',
    generateText: ({ clientName, advisorName }) => {
      const greeting = clientName ? `Namaste ${clientName} ji,` : 'Namaste ji,';
      const advisorSign = advisorName
        ? `\n\n— *${advisorName}*\nSVI Infra Solutions`
        : '\n\n— *SVI Infra Solutions*';

      return `${greeting}

*Shivani Vatika - Plot Sizes & Investment Options:*

📐 *Available Plot Sizes:*
• 50 Sq. Yards (Front 15 ft x Depth 30 ft)
• 100 Sq. Yards (Front 20 ft x Depth 45 ft)
• 150 Sq. Yards (Front 25 ft x Depth 54 ft)
• 200 Sq. Yards (Corner & Park Facing)

💳 *Payment & Loan Benefits:*
• Starting from ₹18,000 / Sq. Yard*
• Up to 80% Bank Loan Available (SBI / PNB / HDFC)
• Easy 3-Stage Construction Friendly Payment Plan

Aapko kitne gaj ka plot dekhna hai? Humein batayein hum accurate quotation share karenge.${advisorSign}`;
    },
  },
};

/**
 * Builds a direct wa.me link with phone normalization and URL encoded message text
 */
export function buildWhatsAppLink(
  phone: string,
  templateId: 'brochure' | 'site_visit' | 'pricing',
  params?: { clientName?: string; advisorName?: string }
): string {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const fullPhone = `91${cleanPhone}`;
  const template = WHATSAPP_TEMPLATES[templateId] || WHATSAPP_TEMPLATES.brochure;
  const text = template.generateText(params || {});

  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`;
}
