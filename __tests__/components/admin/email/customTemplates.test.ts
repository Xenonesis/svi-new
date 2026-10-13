import { describe, it, expect } from 'vitest';
import {
  extractTemplateVars,
  getPreviewHtml,
  sanitizeEmailHtml,
} from '@/src/lib/utils/templateParser';
import type { CustomEmailTemplate } from '@/src/components/admin/email/types';

describe('Custom Email Templates - Utilities & State', () => {
  it('extracts unique template variables from custom luxury template HTML', () => {
    const customHtml = `
      <div style="background:#07111e;">
        <h1>Dear {{name}},</h1>
        <p>Your plot {{plot_no}} in {{project_name}} has reached milestone {{milestone_name}}.</p>
        <p>Please pay {{amount}} before {{due_date}}.</p>
        <p>Reference: {{plot_no}} (repeated)</p>
      </div>
    `;

    const vars = extractTemplateVars(customHtml);
    expect(vars).toEqual([
      'name',
      'plot_no',
      'project_name',
      'milestone_name',
      'amount',
      'due_date',
    ]);
  });

  it('renders preview HTML with substituted template variables', () => {
    const customHtml = `<p>Hello {{name}}, Plot: {{plot_no}} in {{project}}</p>`;
    const vars = {
      name: 'Dr. Ramesh Sharma',
      plot_no: 'B-104',
      project: 'Shivani Vatika 11',
    };

    const rendered = getPreviewHtml(customHtml, vars);
    expect(rendered).toContain('Hello Dr. Ramesh Sharma, Plot: B-104 in Shivani Vatika 11');
  });

  it('sanitizes and wraps logo in luxury white capsule if naked logo is detected', () => {
    const rawHtml = `
      <td style="background:linear-gradient(135deg,#07111e,#0d1e36);">
        <img src="/logo.png" alt="SVI Infra Solutions" />
      </td>
    `;

    const sanitized = sanitizeEmailHtml(rawHtml);
    expect(sanitized).toContain('https://www.sviinfrasolutions.com/logo.png');
    expect(sanitized).toContain('background-color:#ffffff');
  });

  it('maintains strict typing for CustomEmailTemplate objects', () => {
    const customTemplate: CustomEmailTemplate = {
      id: 'custom_1729000000_abc',
      name: 'Diwali Special Plot Offer',
      subject: '✨ Exclusive Diwali Offer on Villa Plots for {{name}}',
      category: 'Festival & Offers',
      description: 'Diwali campaign template with 10% instant rebate',
      icon: 'Sparkles',
      html: '<html><body>Diwali Offer</body></html>',
      variables: ['name', 'discount'],
      isCustom: true,
      createdAt: '2026-10-13T10:00:00.000Z',
      updatedAt: '2026-10-13T10:00:00.000Z',
    };

    expect(customTemplate.isCustom).toBe(true);
    expect(customTemplate.name).toBe('Diwali Special Plot Offer');
    expect(customTemplate.variables).toContain('name');
  });
});
