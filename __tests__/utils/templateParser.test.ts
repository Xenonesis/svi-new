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

    it('should strip embedded HTML tags from inside variable braces', () => {
      const html =
        '<p>Leave from {{<strong>leaveStartDate</strong>}} to {{<em>leaveEndDate</em>}} for {{reason}}</p>';
      const result = extractTemplateVars(html);
      expect(result).toEqual(['leaveStartDate', 'leaveEndDate', 'reason']);
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

    it('should replace variables even if inner tags were inside curly braces in source HTML', () => {
      const source =
        '<p>Leave from {{<strong>leaveStartDate</strong>}} to {{<em>leaveEndDate</em>}}</p>';
      const vars = { leaveStartDate: '1 Sep 2026', leaveEndDate: '5 Sep 2026' };
      const result = getPreviewHtml(source, vars);
      expect(result).toBe('<p>Leave from 1 Sep 2026 to 5 Sep 2026</p>');
    });
    it('should handle null/undefined source gracefully', () => {
      expect(getPreviewHtml(null, {})).toBe('');
    });
  });
});
