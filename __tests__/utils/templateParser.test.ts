import { describe, it, expect } from 'vitest';
import {
  extractTemplateVars,
  getPreviewHtml,
  safeReplaceHtmlContent,
  cleanEmptyTags,
} from '@/src/lib/utils/templateParser';
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

  describe('cleanEmptyTags', () => {
    it('should clean empty paragraph and heading tags', () => {
      const html = '<div><h4></h4><p>Valid content</p><p></p></div>';
      expect(cleanEmptyTags(html)).toBe('<div><p>Valid content</p></div>');
    });

    it('should clean empty list elements', () => {
      const html = '<ol><li></li><li>Item 1</li><li></li></ol>';
      expect(cleanEmptyTags(html)).toBe('<ol><li>Item 1</li></ol>');
    });
  });

  describe('safeReplaceHtmlContent', () => {
    it('should replace exact text match', () => {
      const html = '<p>Hello World, welcome!</p>';
      const result = safeReplaceHtmlContent(html, 'World', 'SVI');
      expect(result).toBe('<p>Hello SVI, welcome!</p>');
    });

    it('should delete selected text and clean empty tag when replacement is empty', () => {
      const html = '<div><h4>📌 Next Steps:</h4><p>Details here</p></div>';
      const result = safeReplaceHtmlContent(html, '📌 Next Steps:', '');
      expect(result).toBe('<div><p>Details here</p></div>');
    });

    it('should match and replace across HTML entities and symbols', () => {
      const html = '<p>Terms &mdash; Condition &amp; Rules &ldquo;Important&rdquo;</p>';
      const selection = 'Terms — Condition & Rules “Important”';
      const result = safeReplaceHtmlContent(html, selection, '');
      expect(result).toBe('');
    });

    it('should match and delete multiline list selection from offer letter', () => {
      const html = `<div>
        <h4>📌 Next Steps to Finalize Your Onboarding:</h4>
        <ol>
          <li>Review the formal appointment letter document.</li>
          <li>Sign and return the acceptance copy within 48 hours.</li>
          <li>Submit digital copies of KYC, academic transcripts, and relieving certificate.</li>
        </ol>
      </div>`;

      const selected = `📌 Next Steps to Finalize Your Onboarding:\nReview the formal appointment letter document.\nSign and return the acceptance copy within 48 hours.\nSubmit digital copies of KYC, academic transcripts, and relieving certificate.`;

      const result = safeReplaceHtmlContent(html, selected, '');
      expect(result).not.toContain('Next Steps to Finalize Your Onboarding');
      expect(result).not.toContain('Review the formal appointment letter');
    });
  });
});
