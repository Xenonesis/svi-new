import { describe, it, expect } from 'vitest';
import templates from '@/src/data/email-templates.json';

describe('SVI Luxury Email Templates', () => {
  const requiredTemplates = [
    'official_allotment_dossier',
    'winner_priority_pass',
    'urgent_payment_demand',
    'site_visit_invitation',
  ];

  it('contains all 4 new luxury corporate templates', () => {
    const ids = templates.map((t) => t.id);
    for (const reqId of requiredTemplates) {
      expect(ids).toContain(reqId);
    }
  });

  it('enforces official Noida Sec 63 corporate office address in new templates', () => {
    const officialAddress = 'Block E-220, 2nd Floor, Sector 63, Noida';
    for (const reqId of requiredTemplates) {
      const tpl = templates.find((t) => t.id === reqId);
      expect(tpl).toBeDefined();
      expect(tpl?.html).toContain(officialAddress);
    }
  });

  it('enforces official sviiinfrasolutions.com domain branding', () => {
    for (const reqId of requiredTemplates) {
      const tpl = templates.find((t) => t.id === reqId);
      expect(tpl?.html).toContain('sviiinfrasolutions.com');
    }
  });
});
