import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';
import { NextRequest as ConcreteNextRequest } from 'next/server';

interface MockInboxEmail {
  id: string;
  email_id: string;
  thread_id?: string;
  subject: string;
  from_email: string;
  from_name?: string | null;
  to_emails?: string[];
  received_at: string;
  text_content?: string;
  html_content?: string;
  opened?: boolean;
  clicked?: boolean;
  attachments?: unknown[];
  is_read?: boolean;
  is_archived?: boolean;
  is_starred?: boolean;
  tags?: string[];
}

interface SupabaseQueryResult<T> {
  data: T | null;
  error: { message: string; code?: string } | null;
}

interface MockEmailResponseItem {
  id: string;
  email_id: string;
  thread_id?: string;
  subject: string;
  from: string;
  from_email: string;
  from_name?: string | null;
  to: string[];
  created_at: string;
  snippet: string;
  html?: string;
  html_content?: string;
  text?: string;
  is_starred: boolean;
  is_read: boolean;
  is_archived: boolean;
  tags: string[];
  last_event: string;
  has_attachments: boolean;
}

interface MockListResponseBody {
  emails: MockEmailResponseItem[];
  unreadCount: number;
  totalCount: number;
  error?: string;
}

interface MockDetailResponseBody {
  email?: {
    id: string;
    email_id: string;
    thread_id?: string;
    subject: string;
    from: string;
    from_email: string;
    from_name?: string | null;
    to: string[];
    created_at: string;
    html?: string;
    text?: string;
    opened?: boolean;
    clicked?: boolean;
    is_read: boolean;
    is_archived: boolean;
    is_starred: boolean;
    tags?: string[];
    attachments?: unknown[];
  };
  error?: string;
}

const heavyHtmlParagraph =
  '<p>This is a repetitive block of heavy styled HTML markup with tracking pixels and styling.</p>';
const heavyHtmlContent = `<!DOCTYPE html><html><body><h1>Notice</h1>${heavyHtmlParagraph.repeat(250)}</body></html>`;
const sampleTextContent =
  'Important Notice: This is the plain text version of the message designed for fast snippet generation.';

const mockInboxData: MockInboxEmail[] = [
  {
    id: 'inbox-rec-001',
    email_id: 're_inbound_001',
    thread_id: 'thread_001',
    subject: 'Project Milestone Update',
    from_email: 'client@example.com',
    from_name: 'Client Partner',
    to_emails: ['admin@sviinfrasolutions.com'],
    received_at: '2026-09-22T10:00:00.000Z',
    text_content: sampleTextContent,
    html_content: heavyHtmlContent,
    opened: false,
    clicked: false,
    attachments: [],
    is_read: false,
    is_archived: false,
    is_starred: true,
    tags: ['milestone', 'vip'],
  },
  {
    id: 'inbox-rec-002',
    email_id: 're_inbound_002',
    thread_id: 'thread_002',
    subject: 'Contract Signing Inquiry',
    from_email: 'legal@partner.com',
    from_name: 'Legal Counsel',
    to_emails: ['admin@sviinfrasolutions.com'],
    received_at: '2026-09-22T09:30:00.000Z',
    text_content:
      'Please find attached the signed contract paperwork for review and countersignature.',
    html_content: `<div><h2>Contract Agreement</h2><p>Attached contract.</p>${heavyHtmlParagraph.repeat(100)}</div>`,
    opened: true,
    clicked: false,
    attachments: [{ filename: 'contract.pdf', size: 1024 }],
    is_read: true,
    is_archived: false,
    is_starred: false,
    tags: ['legal'],
  },
];

class MockQueryBuilder<T> implements PromiseLike<SupabaseQueryResult<T>> {
  private _data: T | null;
  private _error: { message: string; code?: string } | null;

  constructor(data: T | null, error: { message: string; code?: string } | null = null) {
    this._data = data;
    this._error = error;
  }

  select(_columns?: string): this {
    return this;
  }

  order(_col: string, _opts?: { ascending?: boolean }): this {
    return this;
  }

  eq(_col: string, _val: unknown): this {
    return this;
  }

  or(_filter: string): this {
    return this;
  }

  contains(_col: string, _val: unknown[]): this {
    return this;
  }

  limit(_count: number): this {
    return this;
  }

  single(): Promise<SupabaseQueryResult<T>> {
    return Promise.resolve({ data: this._data, error: this._error });
  }

  maybeSingle(): Promise<SupabaseQueryResult<T>> {
    return Promise.resolve({ data: this._data, error: this._error });
  }

  update(_values: Record<string, unknown>): this {
    return this;
  }

  then<TResult1 = SupabaseQueryResult<T>, TResult2 = never>(
    onfulfilled?: ((value: SupabaseQueryResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve({ data: this._data, error: this._error }).then(onfulfilled, onrejected);
  }
}

let simulatedDbError: { message: string; code?: string } | null = null;
let fallbackCalled = false;

vi.mock('@/src/lib/supabase/verifyAdmin', () => ({
  verifyAdmin: vi.fn().mockResolvedValue({
    id: 'admin-uuid-001',
    email: 'admin@sviinfrasolutions.com',
    role: 'admin',
  }),
}));

vi.mock('@/src/lib/email/inboundSync', () => ({
  syncInboundEmails: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('resend', () => {
  class MockResend {
    emails = {
      get: vi.fn().mockResolvedValue({ data: null }),
      list: vi.fn().mockResolvedValue({ data: [] }),
    };
    domains = {
      list: vi.fn().mockResolvedValue({ data: [] }),
      get: vi.fn().mockResolvedValue({ data: null }),
    };
  }
  return {
    Resend: MockResend,
  };
});

vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn((table: string) => {
      if (table === 'email_deletions') {
        return new MockQueryBuilder<{ email_id: string }[]>([]);
      }
      if (table === 'email_stars') {
        return new MockQueryBuilder<{ email_id: string }[]>([{ email_id: 'inbox-rec-001' }]);
      }
      if (table === 'email_attachments') {
        return new MockQueryBuilder<unknown[]>([]);
      }
      if (table === 'email_messages') {
        return new MockQueryBuilder<null>(null);
      }
      if (table === 'email_inbox') {
        if (simulatedDbError) {
          fallbackCalled = true;
          const err = simulatedDbError;
          simulatedDbError = null;
          return new MockQueryBuilder<MockInboxEmail[]>(null, err);
        }
        return {
          select: (cols?: string) => {
            if (cols === '*') {
              return {
                or: (_filter: string) => ({
                  single: () =>
                    Promise.resolve({
                      data: mockInboxData[0],
                      error: null,
                    }),
                  maybeSingle: () =>
                    Promise.resolve({
                      data: mockInboxData[0],
                      error: null,
                    }),
                }),
              };
            }
            return new MockQueryBuilder<MockInboxEmail[]>(mockInboxData);
          },
          update: () => new MockQueryBuilder<null>(null),
        };
      }
      return new MockQueryBuilder<unknown[]>([]);
    }),
  },
}));

vi.mock('@/src/lib/supabase/notifications', () => ({
  NotificationHelper: {
    settingsUpdated: vi.fn().mockResolvedValue(undefined),
  },
}));

process.env.RESEND_API_KEY = 're_mock_test_key_12345';

import { GET } from '@/app/api/admin/email/route';

describe('Admin Email Route Payload Optimization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    simulatedDbError = null;
    fallbackCalled = false;
  });

  it('excludes heavy HTML payloads from inbox list view response', async () => {
    const request = new ConcreteNextRequest('http://localhost:3000/api/admin/email?action=inbox');
    const response = await GET(request as NextRequest);
    expect(response.status).toBe(200);

    const body: MockListResponseBody = await response.json();
    expect(Array.isArray(body.emails)).toBe(true);
    expect(body.emails.length).toBe(2);

    const firstEmail = body.emails[0];
    expect(firstEmail.id).toBe('inbox-rec-001');
    expect(firstEmail.subject).toBe('Project Milestone Update');
    expect(firstEmail.from_email).toBe('client@example.com');
    expect(firstEmail.snippet).toBe(sampleTextContent.substring(0, 100));
    expect(firstEmail.snippet.length).toBeLessThanOrEqual(100);

    // Verify HTML content is stripped from the list item
    expect(firstEmail.html).toBeUndefined();
    expect(firstEmail.html_content).toBeUndefined();

    // Verify raw JSON serialization does NOT contain the heavy HTML content
    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain(heavyHtmlParagraph);
    expect(serialized).not.toContain('<!DOCTYPE html>');
    expect(serialized).not.toContain('repeating paragraph');

    // Confirm payload size is lightweight (under 2KB for both items combined)
    expect(serialized.length).toBeLessThan(2000);
  });

  it('works with replies action and omits HTML payloads', async () => {
    const request = new ConcreteNextRequest('http://localhost:3000/api/admin/email?action=replies');
    const response = await GET(request as NextRequest);
    expect(response.status).toBe(200);

    const body: MockListResponseBody = await response.json();
    expect(body.emails.length).toBe(2);

    for (const email of body.emails) {
      expect(email.html).toBeUndefined();
      expect(email.html_content).toBeUndefined();
      expect(typeof email.snippet).toBe('string');
      expect(email.snippet.length).toBeLessThanOrEqual(100);
    }
  });

  it('returns full html and text content when fetching a single email with action=email', async () => {
    const request = new ConcreteNextRequest(
      'http://localhost:3000/api/admin/email?action=email&id=inbox-rec-001'
    );
    const response = await GET(request as NextRequest);
    expect(response.status).toBe(200);

    const body: MockDetailResponseBody = await response.json();
    expect(body.email).toBeDefined();
    expect(body.email?.id).toBe('inbox-rec-001');
    expect(body.email?.subject).toBe('Project Milestone Update');

    // Single email lookup MUST preserve full HTML and text
    expect(body.email?.html).toBe(heavyHtmlContent);
    expect(body.email?.html).toContain('<!DOCTYPE html>');
    expect(body.email?.html).toContain(heavyHtmlParagraph);
    expect(body.email?.text).toBe(sampleTextContent);
  });

  it('returns full html and text content when fetching a single email with action=inbox_detail', async () => {
    const request = new ConcreteNextRequest(
      'http://localhost:3000/api/admin/email?action=inbox_detail&id=inbox-rec-001'
    );
    const response = await GET(request as NextRequest);
    expect(response.status).toBe(200);

    const body: MockDetailResponseBody = await response.json();
    expect(body.email).toBeDefined();
    expect(body.email?.id).toBe('inbox-rec-001');
    expect(body.email?.html).toBe(heavyHtmlContent);
    expect(body.email?.text).toBe(sampleTextContent);
  });

  it('handles database fallback gracefully and excludes HTML content', async () => {
    simulatedDbError = {
      message: 'column is_read does not exist',
      code: '42703',
    };

    const request = new ConcreteNextRequest('http://localhost:3000/api/admin/email?action=inbox');
    const response = await GET(request as NextRequest);
    expect(response.status).toBe(200);
    expect(fallbackCalled).toBe(true);

    const body: MockListResponseBody = await response.json();
    expect(body.emails.length).toBe(2);
    for (const email of body.emails) {
      expect(email.html).toBeUndefined();
      expect(email.html_content).toBeUndefined();
      expect(typeof email.snippet).toBe('string');
      expect(email.snippet.length).toBeLessThanOrEqual(100);
    }
  });

  it('verifies dramatic payload size reduction (greater than 90% savings)', async () => {
    const request = new ConcreteNextRequest('http://localhost:3000/api/admin/email?action=inbox');
    const response = await GET(request as NextRequest);
    const body: MockListResponseBody = await response.json();

    const optimizedPayloadSize = JSON.stringify(body).length;

    // Construct what the unoptimized payload with heavy HTML would have weighed
    const unoptimizedBody = {
      ...body,
      emails: body.emails.map((email, idx) => ({
        ...email,
        html: mockInboxData[idx].html_content,
      })),
    };
    const unoptimizedPayloadSize = JSON.stringify(unoptimizedBody).length;

    const reductionPercentage =
      ((unoptimizedPayloadSize - optimizedPayloadSize) / unoptimizedPayloadSize) * 100;

    // Expect significant payload reduction (>90%)
    expect(reductionPercentage).toBeGreaterThan(90);
    expect(optimizedPayloadSize).toBeLessThan(2000);
    expect(unoptimizedPayloadSize).toBeGreaterThan(25000);
  });

  it('supports search filtering by text content while keeping payload slim', async () => {
    const request = new ConcreteNextRequest(
      'http://localhost:3000/api/admin/email?action=inbox&search=milestone'
    );
    const response = await GET(request as NextRequest);
    expect(response.status).toBe(200);

    const body: MockListResponseBody = await response.json();
    expect(body.emails.length).toBe(1);
    expect(body.emails[0].subject).toBe('Project Milestone Update');
    expect(body.emails[0].html).toBeUndefined();
    expect(body.emails[0].snippet).toBe(sampleTextContent.substring(0, 100));
  });
});
