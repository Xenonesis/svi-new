import { describe, it, expect } from 'vitest';
import { extractTemplateVars, getPreviewHtml } from '@/src/lib/utils/templateParser';

describe('templateParser', () => {
  describe('extractTemplateVars', () => {
    it('should extract variables from double curly braces', () => {
      const html = '<div>Hello {{name}}, your balance is {{balance}}</div>';
      const result = extractTemplateVars(html);
      expect(result).toEqual(['name', 'balance']);
    });

    it('should extract and clean variables with conditional block symbols', () => {
      const html = `
        <p>Dear {{salutation}} {{clientName}}</p>
        {{#advisorEmail}}
          <p>Advisor Email: {{advisorEmail}}</p>
        {{/advisorEmail}}
      `;
      const result = extractTemplateVars(html);
      expect(result).toContain('salutation');
      expect(result).toContain('clientName');
      expect(result).toContain('advisorEmail');
      expect(result.length).toBe(3);
    });

    it('should deduplicate template variables', () => {
      const html = '{{name}} matches {{name}} and {{#name}}{{name}}{{/name}}';
      const result = extractTemplateVars(html);
      expect(result).toEqual(['name']);
    });

    it('should return empty array when no matches', () => {
      const html = '<div>No variables here</div>';
      const result = extractTemplateVars(html);
      expect(result).toEqual([]);
    });
  });

  describe('getPreviewHtml', () => {
    it('should replace standard template variables', () => {
      const source = 'Hello {{name}}! Welcome to {{project}}.';
      const vars = { name: 'John Doe', project: 'SVI Heights' };
      const result = getPreviewHtml(source, vars);
      expect(result).toBe('Hello John Doe! Welcome to SVI Heights.');
    });

    it('should render conditional block content when value is truthy and not empty', () => {
      const source = 'Contact: {{#email}}Email is {{email}}{{/email}}';
      const vars = { email: 'test@example.com' };
      const result = getPreviewHtml(source, vars);
      expect(result).toBe('Contact: Email is test@example.com');
    });

    it('should omit conditional block content when value is falsy/empty', () => {
      const source = 'Contact: {{#email}}Email is {{email}}{{/email}}';
      const vars = { email: '' };
      const result = getPreviewHtml(source, vars);
      expect(result).toBe('Contact: ');
    });

    it('should omit conditional block content when value is missing', () => {
      const source = 'Contact: {{#email}}Email is {{email}}{{/email}}';
      const vars = {};
      const result = getPreviewHtml(source, vars);
      expect(result).toBe('Contact: ');
    });

    it('should support multiple conditional blocks', () => {
      const source = '{{#name}}Name: {{name}}{{/name}} | {{#phone}}Phone: {{phone}}{{/phone}}';
      const vars = { name: 'Alice', phone: '' };
      const result = getPreviewHtml(source, vars);
      expect(result).toBe('Name: Alice | ');
    });

    it('should leave unknown variables unreplaced', () => {
      const source = 'Hello {{name}} and {{unknown}}';
      const vars = { name: 'John' };
      const result = getPreviewHtml(source, vars);
      expect(result).toBe('Hello John and {{unknown}}');
    });

    it('should handle null/undefined source gracefully', () => {
      expect(getPreviewHtml(null, {})).toBe('');
    });
  });
});
