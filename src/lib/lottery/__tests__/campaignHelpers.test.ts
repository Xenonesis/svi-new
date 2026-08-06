import { describe, it, expect } from 'vitest';
import {
  buildLotteryCampaignBody,
  lotteryCampaignTitle,
  lotteryCampaignSubject,
  buildLotteryCampaignPayload,
} from '../campaignHelpers';

describe('lotteryCampaignTitle', () => {
  it('prefixes lottery title with "Lottery —"', () => {
    expect(lotteryCampaignTitle('Mega Draw')).toBe('Lottery — Mega Draw');
  });
});

describe('lotteryCampaignSubject', () => {
  it('builds subject line with title and brand', () => {
    expect(lotteryCampaignSubject('Mega Draw')).toBe("You're In! Mega Draw — SVI Infra");
  });
});

describe('buildLotteryCampaignBody', () => {
  it('includes title and description', () => {
    const body = buildLotteryCampaignBody('Mega Draw', 'Win a flat in Sector 62');
    expect(body).toContain('Mega Draw');
    expect(body).toContain('Win a flat in Sector 62');
  });

  it('falls back to default description when empty', () => {
    const body = buildLotteryCampaignBody('Mega Draw', '');
    expect(body).toContain('Stay tuned for the live draw. Best of luck!');
  });

  it('falls back when description is null', () => {
    const body = buildLotteryCampaignBody('Mega Draw', null);
    expect(body).toContain('Stay tuned for the live draw. Best of luck!');
  });

  it('escapes HTML in title and description (XSS guard)', () => {
    const body = buildLotteryCampaignBody(
      '<script>alert(1)</script>',
      '<img src=x onerror=alert(2)>'
    );
    expect(body).not.toContain('<script>');
    expect(body).not.toContain('<img src=x');
    expect(body).toContain('&lt;script&gt;');
    expect(body).toContain('&lt;img src=x onerror=alert(2)&gt;');
  });

  it('trims whitespace around description', () => {
    const body = buildLotteryCampaignBody('Draw', '  padded  ');
    expect(body).toContain('>padded</p>');
    expect(body).not.toContain('  padded  ');
  });
});

describe('buildLotteryCampaignPayload', () => {
  it('assembles full campaign payload with lottery_id', () => {
    const payload = buildLotteryCampaignPayload({
      id: 'lot-1',
      title: 'Mega Draw',
      description: 'Big prizes',
    });
    expect(payload).toEqual({
      title: 'Lottery — Mega Draw',
      subject: "You're In! Mega Draw — SVI Infra",
      body_html: expect.stringContaining('Big prizes'),
      recipient_group: 'lottery_participants',
      lottery_id: 'lot-1',
    });
  });
});
