import { describe, it, expect } from 'vitest';
import rawTemplates from '@/src/data/email-templates.json';
import { EMAIL_TEMPLATES } from '@/src/components/admin/email/constants';

describe('Quotation Email Template', () => {
  it('should exist in email-templates.json with valid structure', () => {
    const tpl = rawTemplates.find((t) => t.id === 'quotation_document');
    expect(tpl).toBeDefined();
    expect(tpl?.name).toBe('Quotation Document');
    expect(tpl?.category).toBe('Documents');
    expect(tpl?.icon).toBe('Receipt');
    expect(tpl?.subject).toContain('{{projectName}}');
    expect(tpl?.subject).toContain('{{quotationNo}}');
  });

  it('should contain all necessary placeholders for quotation data in HTML', () => {
    const tpl = rawTemplates.find((t) => t.id === 'quotation_document');
    expect(tpl?.html).toContain('{{quotationNo}}');
    expect(tpl?.html).toContain('{{customerName}}');
    expect(tpl?.html).toContain('{{projectName}}');
    expect(tpl?.html).toContain('{{plotNo}}');
    expect(tpl?.html).toContain('{{area}}');
    expect(tpl?.html).toContain('{{basicRate}}');
    expect(tpl?.html).toContain('{{basicPrice}}');
    expect(tpl?.html).toContain('{{edcRate}}');
    expect(tpl?.html).toContain('{{edcAmount}}');
    expect(tpl?.html).toContain('{{plcPercent}}');
    expect(tpl?.html).toContain('{{plcAmount}}');
    expect(tpl?.html).toContain('{{grandTotal}}');
    expect(tpl?.html).toContain('{{effectiveRate}}');
    expect(tpl?.html).toContain('{{validUntil}}');
    expect(tpl?.html).toContain('{{portal_url}}');
  });

  it('should be mapped into EMAIL_TEMPLATES in constants.ts', () => {
    const tpl = EMAIL_TEMPLATES.find((t) => t.id === 'quotation_document');
    expect(tpl).toBeDefined();
    expect(tpl?.id).toBe('quotation_document');
    expect(tpl?.icon).toBeDefined();
  });
});
