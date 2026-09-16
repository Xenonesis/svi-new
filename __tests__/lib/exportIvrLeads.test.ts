import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  exportIvrLeadsToExcel,
  exportIvrLeadsToPdf,
  exportIvrLeadsToCsv,
} from '@/src/lib/leads/exportIvrLeads';
import type { IvrRecordItem } from '@/app/api/admin/leads/ivr-records/route';

const mockRecords: IvrRecordItem[] = [
  {
    id: '1',
    customer_phone: '8744875331',
    agent_name: 'Shivam Yadav',
    dial_status: 'ANSWER',
    call_duration: 112,
    pressed_key: '1',
    temperature: 'hot',
    dial_time: '2026-09-15T15:50:33Z',
    campaign_name: 'IVR Campaign',
    created_at: '2026-09-15T15:50:33Z',
  },
  {
    id: '2',
    customer_phone: '8920260621',
    agent_name: 'Shikha Tomar',
    dial_status: 'NOANSWER',
    call_duration: 15,
    pressed_key: null,
    temperature: 'cold',
    dial_time: '2026-09-15T15:50:10Z',
    campaign_name: 'IVR Campaign',
    created_at: '2026-09-15T15:50:10Z',
  },
];

describe('exportIvrLeads Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('exports records to Excel (.xlsx) successfully', async () => {
    await expect(exportIvrLeadsToExcel(mockRecords)).resolves.not.toThrow();
  });

  it('exports records to PDF (.pdf) successfully', async () => {
    await expect(exportIvrLeadsToPdf(mockRecords)).resolves.not.toThrow();
  });

  it('exports records to CSV (.csv) successfully', () => {
    expect(() => exportIvrLeadsToCsv(mockRecords)).not.toThrow();
  });
});
