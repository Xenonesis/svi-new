import { describe, it, expect } from 'vitest';
import { WHATSAPP_TEMPLATES, buildWhatsAppLink } from '@/src/lib/utils/whatsappTemplates';

describe('WhatsApp Templates Engine', () => {
  it('generates brochure message with correct links', () => {
    const text = WHATSAPP_TEMPLATES.brochure.generateText({
      clientName: 'Rajesh Sharma',
      advisorName: 'Shivam Yadav',
    });

    expect(text).toContain('Namaste Rajesh Sharma ji,');
    expect(text).toContain('https://sviinfra.com/brochure/shivani-vatika-11');
    expect(text).toContain('Shivam Yadav');
  });

  it('generates site visit invitation template', () => {
    const text = WHATSAPP_TEMPLATES.site_visit.generateText({
      clientName: 'Amit Verma',
    });

    expect(text).toContain('Namaste Amit Verma ji,');
    expect(text).toContain('Free AC Cab Pick & Drop');
  });

  it('generates pricing template', () => {
    const text = WHATSAPP_TEMPLATES.pricing.generateText({});
    expect(text).toContain('Namaste ji,');
    expect(text).toContain('50 Sq. Yards');
    expect(text).toContain('100 Sq. Yards');
  });

  it('builds wa.me link with 91 country code prefix and encoded text', () => {
    const url = buildWhatsAppLink('8744875331', 'brochure', {
      clientName: 'Rajesh',
      advisorName: 'Kajal Vishu',
    });

    expect(url).toContain('https://wa.me/918744875331?text=');
    expect(url).toContain(encodeURIComponent('Namaste Rajesh ji,'));
  });
});
