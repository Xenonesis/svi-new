import { describe, it, expect } from 'vitest';
import rawTemplates from '@/src/data/email-templates.json';
import { EMAIL_TEMPLATES } from '@/src/components/admin/email/constants';

describe('Ganesh Chaturthi Email Template', () => {
  it('should exist in email-templates.json with valid structure', () => {
    const tpl = rawTemplates.find((t) => t.id === 'ganesh_chaturthi_wishes');
    expect(tpl).toBeDefined();
    expect(tpl?.name).toBe('Ganesh Chaturthi Wishes');
    expect(tpl?.category).toBe('Greetings');
    expect(tpl?.icon).toBe('Star');
    expect(tpl?.subject).toContain('गणेश चतुर्थी');
    expect(tpl?.subject).toContain('SVI Infra Solutions');
  });

  it('should contain all the requested user Hindi text', () => {
    const tpl = rawTemplates.find((t) => t.id === 'ganesh_chaturthi_wishes');
    expect(tpl?.html).toContain(
      'SVI Infra Solutions Pvt. Ltd. की ओर से आप सभी को गणेश चतुर्थी की हार्दिक शुभकामनाएँ।'
    );
    expect(tpl?.html).toContain(
      'विघ्नहर्ता भगवान श्री गणेश आपके जीवन में सुख, समृद्धि, सफलता और नई ऊर्जा लेकर आएँ।'
    );
    expect(tpl?.html).toContain(
      'आपके सभी कार्य निर्विघ्न पूर्ण हों और आपका परिवार सदैव खुशहाल रहे।'
    );
    expect(tpl?.html).toContain(
      'आइए, इस पावन अवसर पर भगवान गणेश का आशीर्वाद लेकर नई शुरुआत और नई उपलब्धियों की ओर कदम बढ़ाएँ।'
    );
    expect(tpl?.html).toContain('गणपति बप्पा मोरया!');
  });

  it('should strictly comply with brand guidelines: official logo and no cartoon emojis', () => {
    const tpl = rawTemplates.find((t) => t.id === 'ganesh_chaturthi_wishes');
    expect(tpl?.html).toContain('https://www.sviinfrasolutions.com/logo.png');
    // Check absence of low quality / 3D cartoonish emojis
    expect(tpl?.html).not.toMatch(
      /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u
    );
  });

  it('should contain corporate office address and official contact info with updated phone', () => {
    const tpl = rawTemplates.find((t) => t.id === 'ganesh_chaturthi_wishes');
    expect(tpl?.html).toContain('Block E-220, 2nd Floor, Sector 63, Noida, Uttar Pradesh 201309');
    expect(tpl?.html).toContain('www.sviinfrasolutions.com');
    expect(tpl?.html).toContain('hr.sviinfrasolutions@gmail.com');
    expect(tpl?.html).toContain('9214014579');
    expect(tpl?.html).not.toContain('98114 43084');
  });

  it('should be loaded correctly in EMAIL_TEMPLATES in constants.ts', () => {
    const tpl = EMAIL_TEMPLATES.find((t) => t.id === 'ganesh_chaturthi_wishes');
    expect(tpl).toBeDefined();
    expect(tpl?.id).toBe('ganesh_chaturthi_wishes');
    expect(tpl?.icon).toBeDefined();
  });
});
