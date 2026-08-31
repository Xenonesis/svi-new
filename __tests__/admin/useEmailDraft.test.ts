/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/src/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi
        .fn()
        .mockResolvedValue({ data: { session: { access_token: 'test-token' } }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-123' } }, error: null }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockResolvedValue({ data: null, error: null }),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}));

import { saveDraft, loadDraft, clearDraft } from '@/src/components/admin/email/helpers';

describe('Email Draft & Template Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and restores full template state from local storage immediately on refresh', async () => {
    const draftPayload = {
      to: 'candidate@example.com',
      cc: '',
      bcc: '',
      subject: 'Offer Letter – BDM | SVI Infra Solutions',
      subjectTemplate: 'Offer Letter – {{designation}} | SVI Infra Solutions',
      html: '',
      templateHtml: '<html><body>Offer for {{name}} as {{designation}}</body></html>',
      selectedTemplate: 'offer_letter',
      templateVars: {
        name: 'Kajal',
        designation: 'BDM',
        salaryCtc: '22,000',
        appointmentDate: '01/09/2026',
      },
      previewMode: true,
      replyTo: 'info@sviinfrasolutions.com',
      fromName: 'SVI Infra',
    };

    await saveDraft(draftPayload);

    // Simulate page refresh & loading draft
    const restored = await loadDraft();

    expect(restored).not.toBeNull();
    expect(restored?.to).toBe('candidate@example.com');
    expect(restored?.selectedTemplate).toBe('offer_letter');
    expect(restored?.templateHtml).toContain('Offer for {{name}}');
    expect(restored?.templateVars?.name).toBe('Kajal');
    expect(restored?.templateVars?.designation).toBe('BDM');
    expect(restored?.previewMode).toBe(true);
  });

  it('clears active local draft when clearDraft is called', async () => {
    await saveDraft({
      to: 'test@example.com',
      cc: '',
      bcc: '',
      subject: 'Test',
      html: '<p>Hello</p>',
      replyTo: '',
      fromName: 'SVI Infra',
    });

    expect(localStorage.getItem('svi-email-active-draft')).not.toBeNull();

    await clearDraft();

    expect(localStorage.getItem('svi-email-active-draft')).toBeNull();
  });
});
