import { describe, it, expect } from 'vitest';
import {
  buildHotLeadAlertEmailHtml,
  buildDailyDigestEmailHtml,
  DEFAULT_HOT_LEAD_SETTINGS,
} from '@/src/lib/leads/hotLeadNotification';
import type { CallIntelligence } from '@/src/lib/leads/callIntelligence';

describe('Hot Lead VIP Notifications with Per-Email Customization', () => {
  it('has valid default settings with per-email delivery mode and digest time', () => {
    expect(DEFAULT_HOT_LEAD_SETTINGS.enabled).toBe(true);
    expect(DEFAULT_HOT_LEAD_SETTINGS.channels.in_app).toBe(true);
    expect(DEFAULT_HOT_LEAD_SETTINGS.recipients.length).toBeGreaterThan(0);
    const primary = DEFAULT_HOT_LEAD_SETTINGS.recipients[0];
    expect(primary.delivery_mode).toBeDefined();
    expect(primary.digest_time).toBeDefined();
    expect(primary.lead_tier).toBeDefined();
  });

  it('builds luxury email HTML containing phone, intent, Hinglish summary, and action links', () => {
    const mockIntelligence: CallIntelligence = {
      summary:
        'Customer Purshottam ji Delhi se Khatu Shyam ke paas 100 gaj plot dekhna chahte hain.',
      interest_level: 'Hot',
      sentiment: 'Positive',
      intent: 'Site Visit Requested',
      budget: '₹30-50 Lakhs',
      property_interest: '100 gaj near Khatu Shyam',
      recommended_action: 'WhatsApp par brochure bhejo aur Sunday visit confirm karo',
      quality_scorecard: {
        pitch_clarity: 9,
        objection_handling: 8,
        closing_skill: 9,
        overall_score: 8.7,
        grade: 'A',
        coaching_tip: 'Follow up promptly.',
        key_strengths: ['Great tone'],
      },
      whatsapp_recap: 'Namaste Sir, SVI Infra details...',
      dialogue: [],
      transcript: 'Full transcript...',
      duration: 261,
      analyzed_at: new Date().toISOString(),
      model_used: 'whisper-large-v3-turbo',
    };

    const { html, text } = buildHotLeadAlertEmailHtml({
      customerPhone: '7303530745',
      intelligence: mockIntelligence,
      duration: 261,
      callRecordId: 'rec_test_123',
    });

    expect(html).toContain('+91 7303530745');
    expect(html).toContain('Site Visit Requested');
    expect(html).toContain('₹30-50 Lakhs');
    expect(html).toContain('100 gaj near Khatu Shyam');
    expect(html).toContain('Purshottam ji Delhi se');
    expect(html).toContain('tel:+917303530745');
    expect(html).toContain('https://wa.me/917303530745');
    expect(html).toContain('callId=rec_test_123');

    expect(text).toContain('+91 7303530745');
    expect(text).toContain('Site Visit Requested');
  });

  it('builds luxury Daily Digest HTML with lead metrics and individual lead cards', () => {
    const mockLeads = [
      {
        customerPhone: '9873976772',
        duration: 215,
        intelligence: {
          summary: 'Customer ko Khatu Shyam ke paas 100 gaj plot chahiye, 11k rate par enquiry ki.',
          interest_level: 'Hot' as const,
          sentiment: 'Positive' as const,
          intent: 'Price Enquiry' as const,
          budget: '₹11,000 per gaj',
          property_interest: '100 gaj plot',
          recommended_action: 'WhatsApp par rate card aur location brochure share karein.',
          quality_scorecard: {
            pitch_clarity: 8,
            objection_handling: 7,
            closing_skill: 8,
            overall_score: 7.7,
            grade: 'B' as const,
            coaching_tip: 'Follow up promptly.',
            key_strengths: ['Clear voice'],
          },
          whatsapp_recap: 'Namaste Sir...',
          dialogue: [],
          transcript: 'Full transcript...',
          duration: 215,
          analyzed_at: new Date().toISOString(),
          model_used: 'whisper-large-v3-turbo',
        },
      },
      {
        customerPhone: '9540572159',
        duration: 61,
        intelligence: {
          summary: 'Customer residential investment enquiry kar rahe hain.',
          interest_level: 'Warm' as const,
          sentiment: 'Neutral' as const,
          intent: 'General Info' as const,
          budget: '₹750,000 (100 Sq. Yds)',
          property_interest: 'Residential investment',
          recommended_action: 'Confirm plot size preference.',
          quality_scorecard: {
            pitch_clarity: 7,
            objection_handling: 7,
            closing_skill: 7,
            overall_score: 7.0,
            grade: 'B' as const,
            coaching_tip: 'Follow up.',
            key_strengths: ['Polite'],
          },
          whatsapp_recap: 'Namaste Sir...',
          dialogue: [],
          transcript: 'Full transcript...',
          duration: 61,
          analyzed_at: new Date().toISOString(),
          model_used: 'whisper-large-v3-turbo',
        },
      },
    ];

    const { html, text } = buildDailyDigestEmailHtml({
      dateStr: '28 Oct 2026',
      recipientName: 'Mr. Nitin Choudhary',
      leads: mockLeads,
    });

    expect(html).toContain('Mr. Nitin Choudhary');
    expect(html).toContain('28 Oct 2026');
    expect(html).toContain('9873976772');
    expect(html).toContain('9540572159');
    expect(html).toContain('🔥 HOT');
    expect(html).toContain('☀️ WARM');
    expect(html).toContain('tel:+919873976772');
    expect(html).toContain('https://wa.me/919873976772');

    expect(text).toContain('Nitin Choudhary');
    expect(text).toContain('9873976772');
  });
});
