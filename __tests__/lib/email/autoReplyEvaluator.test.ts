import { describe, it, expect } from 'vitest';
import {
  isWithinBusinessHours,
  getISTDateTime,
  buildAutoReplyHtml,
  DEFAULT_AUTO_REPLY_SETTINGS,
} from '@/src/lib/email/autoReplyEvaluator';

describe('autoReplyEvaluator', () => {
  it('correctly calculates IST day of week and times', () => {
    // 2026-10-16 is a Friday
    const date = new Date('2026-10-16T05:00:00.000Z'); // 10:30 AM IST
    const ist = getISTDateTime(date);
    expect(ist.dayOfWeek).toBe(5); // Friday
    expect(ist.hours).toBe(10);
    expect(ist.minutes).toBe(30);
  });

  it('determines within business hours on a weekday morning (10:30 AM IST)', () => {
    const morning = new Date('2026-10-16T05:00:00.000Z'); // 10:30 AM IST
    expect(isWithinBusinessHours(morning)).toBe(true);
  });

  it('determines outside business hours on a weekday night (9:00 PM IST)', () => {
    const night = new Date('2026-10-16T15:30:00.000Z'); // 21:00 IST
    expect(isWithinBusinessHours(night)).toBe(false);
  });

  it('determines outside business hours on Sunday', () => {
    // 2026-10-18 is Sunday
    const sundayAfternoon = new Date('2026-10-18T06:30:00.000Z'); // 12:00 PM IST Sunday
    expect(isWithinBusinessHours(sundayAfternoon)).toBe(false);
  });

  it('generates corporate luxury auto-reply HTML template with brand elements', () => {
    const html = buildAutoReplyHtml({
      senderName: 'Rohit Sharma',
      subject: 'Inquiry for Shivani Vatika 11th',
    });

    expect(html).toContain('SVI INFRA SOLUTIONS');
    expect(html).toContain('Dear Rohit Sharma');
    expect(html).toContain('Monday – Saturday: 9:30 AM to 6:30 PM IST');
    expect(html).toContain(DEFAULT_AUTO_REPLY_SETTINGS.emergency_phone);
  });
});
