import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';

vi.mock('@/src/lib/supabase/verifyAdmin', () => ({
  verifyAdmin: vi.fn().mockResolvedValue({ id: 'admin-123', email: 'admin@test.com' }),
}));

const mockInsert = vi.fn();
const mockUpsert = vi.fn();
const mockSelect = vi.fn();
const mockIn = vi.fn();

vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn(() => ({
            in: mockIn.mockResolvedValue({
              data: [
                { id: 'uuid-shivam', full_name: 'Shivam yadav', phone: '9218300593' },
                { id: 'uuid-shikha', full_name: 'Shikha Tomar', phone: '9675792683' },
                { id: 'uuid-khushi', full_name: 'KHUSHI PAl', phone: '9218300589' },
                { id: 'uuid-manish', full_name: 'Manish Sharma', phone: '9217085407' },
              ],
              error: null,
            }),
          })),
        };
      }
      if (table === 'ivr_call_records') {
        return {
          select: vi.fn(() => ({
            in: vi.fn().mockResolvedValue({ data: [], error: null }),
          })),
          insert: mockInsert.mockResolvedValue({ data: null, error: null }),
        };
      }
      if (table === 'chat_leads') {
        return {
          upsert: mockUpsert.mockResolvedValue({ data: null, error: null }),
        };
      }
      return {
        select: mockSelect,
        insert: mockInsert,
        upsert: mockUpsert,
      };
    }),
  },
}));

import { POST } from '@/app/api/admin/leads/ivr-upload/route';

describe('POST /api/admin/leads/ivr-upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthorized requests with 401', async () => {
    (verifyAdmin as Mock).mockResolvedValueOnce(null);

    const req = new NextRequest('http://localhost/api/admin/leads/ivr-upload', {
      method: 'POST',
      body: JSON.stringify({ csvText: '' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('processes valid CSV text and returns accurate summary statistics', async () => {
    const csvContent = `Number,AgentNumber,AgentName,Dialtime,CustomerAnstime,CustHangTime,Call Duration,Dialstatus,PressedKey
8744875331,9311290543,Shivam Yadav,2026-09-15 15:55:29,2026-09-15 15:55:39,2026-09-15 15:57:22,103,NOANSWER,2
8920260621,9870345702,Shikha Tomar,2026-09-15 15:55:10,2026-09-15 15:55:42,2026-09-15 15:57:01,79,ANSWER,1
7088399647,9315964031,Khushi Pal,2026-09-15 15:56:10,2026-09-15 15:56:19,2026-09-15 15:56:39,20,NOANSWER,1
8057493106,9217085407,Manish,2026-09-15 15:55:56,2026-09-15 15:56:16,2026-09-15 15:56:38,22,NOANSWER,`;

    const req = new NextRequest('http://localhost/api/admin/leads/ivr-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvText: csvContent, campaignName: 'Test Sep 15' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.processed_calls).toBe(4);
    expect(json.unique_leads).toBe(4);
    expect(json.answered_calls).toBe(1);
    expect(json.missed_calls).toBe(3);
    expect(json.hot_leads).toBe(3);
    expect(json.warm_leads).toBe(1);
  });
});
