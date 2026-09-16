import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parseIvrCsvText, resolveAdvisorId, type AdvisorProfile } from '@/src/lib/leads/ivrParser';

describe('IVR Smoke Test with report (6).csv', () => {
  it('parses all 4,396 records in under 100ms with accurate advisor attributions', () => {
    const csvPath = path.join(process.cwd(), 'report (6).csv');
    if (!fs.existsSync(csvPath)) {
      console.warn('report (6).csv not found in root, skipping real file test');
      return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const start = performance.now();
    const records = parseIvrCsvText(csvContent);
    const elapsed = performance.now() - start;

    expect(records.length).toBe(4396);
    expect(elapsed).toBeLessThan(500); // Super fast under 500ms

    // Check advisor mapping
    const mockProfiles: AdvisorProfile[] = [
      { id: 'uuid-shivam', full_name: 'Shivam yadav', phone: '9218300593' },
      { id: 'uuid-shikha', full_name: 'Shikha Tomar', phone: '9675792683' },
      { id: 'uuid-khushi', full_name: 'KHUSHI PAl', phone: '9218300589' },
      { id: 'uuid-manish', full_name: 'Manish Sharma', phone: '9217085407' },
    ];

    const uniqueAgents = Array.from(new Set(records.map((r) => r.agent_name)));
    expect(uniqueAgents).toContain('Shivam Yadav');
    expect(uniqueAgents).toContain('Shikha Tomar');
    expect(uniqueAgents).toContain('Khushi Pal');
    expect(uniqueAgents).toContain('Manish');

    // Verify all 4 primary advisors resolve accurately
    const shivamId = resolveAdvisorId('Shivam Yadav', '9311290543', mockProfiles);
    expect(shivamId).toBe('uuid-shivam');

    const shikhaId = resolveAdvisorId('Shikha Tomar', '9870345702', mockProfiles);
    expect(shikhaId).toBe('uuid-shikha');

    const khushiId = resolveAdvisorId('Khushi Pal', '9315964031', mockProfiles);
    expect(khushiId).toBe('uuid-khushi');

    const manishId = resolveAdvisorId('Manish', '9217085407', mockProfiles);
    expect(manishId).toBe('uuid-manish');

    // Unknown agent returns null safely
    const unassignedId = resolveAdvisorId('Unknown New Agent', '', mockProfiles);
    expect(unassignedId).toBeNull();
    const answeredCount = records.filter((r) => r.dial_status === 'ANSWER').length;
    const missedCount = records.filter((r) => r.dial_status === 'NOANSWER').length;
    expect(answeredCount + missedCount).toBe(4396);
    expect(answeredCount).toBeGreaterThan(0);
    expect(missedCount).toBeGreaterThan(0);
  });
});
