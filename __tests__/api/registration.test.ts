import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Define hoisted mocks to comply with Vitest's module hoisting rules
const { mockLimit, mockInsertSingle, mockInsert, mockSend } = vi.hoisted(() => {
  return {
    mockLimit: vi.fn(),
    mockInsertSingle: vi.fn(),
    mockInsert: vi.fn(),
    mockSend: vi.fn().mockResolvedValue({ data: { id: 'email-id' }, error: null }),
  };
});

vi.mock('@/src/lib/supabase/admin', () => {
  const mockOrder = vi.fn(() => ({
    limit: mockLimit,
  }));
  const mockNot = vi.fn(() => ({
    order: mockOrder,
  }));
  const mockSelect = vi.fn(() => ({
    not: mockNot,
  }));
  const mockInsertSelect = vi.fn(() => ({
    single: mockInsertSingle,
  }));

  const mockFrom = vi.fn((table) => {
    if (table === 'registrations') {
      return {
        select: mockSelect,
        insert: (payload: any) => {
          mockInsert(payload);
          return {
            select: mockInsertSelect,
          };
        },
      };
    }
    if (table === 'portal_settings') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({
                data: { value: { admin_email: 'hr.sviinfrasolutions@gmail.com' } },
                error: null,
              })
            ),
          })),
        })),
      };
    }
    if (table === 'profiles') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn(() =>
              Promise.resolve({
                data: [{ email: 'advisor@sviinfra.com', real_email: 'advisor.real@sviinfra.com' }],
                error: null,
              })
            ),
          })),
        })),
      };
    }
    return {};
  });

  return {
    supabaseAdmin: {
      from: mockFrom,
    },
  };
});

// Mock Resend to avoid sending emails during tests
vi.mock('resend', () => {
  return {
    Resend: class MockResend {
      emails = {
        send: mockSend,
      };
    },
  };
});

import { POST } from '@/app/api/registration/route';

function createMockRegistrationFormData(overrides: Record<string, string | File> = {}): FormData {
  const formData = new FormData();
  formData.append('firstName', 'John');
  formData.append('lastName', 'Doe');
  formData.append('mobileNo', '9876543210');
  formData.append('email', 'john.doe@example.com');
  formData.append('soWoDo', 'S/O Jane Doe');
  formData.append('dob', '1995-05-15');
  formData.append('aadharNumber', '123456789012');
  formData.append('panNumber', 'ABCDE1234F');
  formData.append('state', 'State');
  formData.append('city', 'City');
  formData.append('address', '123 Main St');
  formData.append('advisorName', 'Advisor Name');
  formData.append('project', 'Project Name');
  formData.append('propertySize', '1200 sqft');
  formData.append('propertyType', 'Plot');
  formData.append('plotPreference', 'Corner');
  formData.append('paymentPlan', 'Down Payment');
  formData.append('paymentMode', 'Net Banking');
  formData.append('schemeAmount', '500000');

  Object.entries(overrides).forEach(([key, val]) => {
    formData.delete(key);
    if (val) formData.append(key, val);
  });

  return formData;
}

describe('POST /api/registration - Automatic Submission ID Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = 're_mock_key';
  });

  it('should handle the base case of an empty database by assigning SVI2200 to the first user', async () => {
    // Empty database returns no existing submission IDs
    mockLimit.mockResolvedValueOnce({ data: [], error: null });

    // DB insert succeeds
    mockInsertSingle.mockResolvedValueOnce({
      data: {
        id: 'user-uuid-1',
        submission_id: 'SVI2200',
        name: 'John',
        last_name: 'Doe',
        created_at: '2026-05-29T12:00:00Z',
      },
      error: null,
    });

    const formData = createMockRegistrationFormData();
    const req = new NextRequest('http://localhost/api/registration', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.submissionId).toBe('SVI2200');
    expect(body.id).toBe('user-uuid-1');

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        submission_id: 'SVI2200',
      })
    );
  });

  it('should increment the highest submission ID correctly', async () => {
    // Existing highest ID is SVI2200
    mockLimit.mockResolvedValueOnce({ data: [{ submission_id: 'SVI2200' }], error: null });

    mockInsertSingle.mockResolvedValueOnce({
      data: {
        id: 'user-uuid-2',
        submission_id: 'SVI2201',
        name: 'John',
        created_at: '2026-05-29T12:05:00Z',
      },
      error: null,
    });

    const formData = createMockRegistrationFormData();
    const req = new NextRequest('http://localhost/api/registration', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.submissionId).toBe('SVI2201');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        submission_id: 'SVI2201',
      })
    );
  });

  it('should maintain consistent padding and expand lengths if necessary (e.g. SVI9999 -> SVI10000)', async () => {
    // Existing highest ID is SVI9999
    mockLimit.mockResolvedValueOnce({ data: [{ submission_id: 'SVI9999' }], error: null });

    mockInsertSingle.mockResolvedValueOnce({
      data: {
        id: 'user-uuid-3',
        submission_id: 'SVI10000',
        name: 'John',
        created_at: '2026-05-29T12:10:00Z',
      },
      error: null,
    });

    const formData = createMockRegistrationFormData();
    const req = new NextRequest('http://localhost/api/registration', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.submissionId).toBe('SVI10000');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        submission_id: 'SVI10000',
      })
    );
  });

  it('should handle concurrent collision errors using a retry loop and optimistic concurrency control', async () => {
    // First attempt: Highest is SVI2205. Code tries to insert SVI2206.
    mockLimit.mockResolvedValueOnce({ data: [{ submission_id: 'SVI2205' }], error: null });
    // Simulate unique constraint violation error (23505) on the first insertion
    mockInsertSingle.mockResolvedValueOnce({
      data: null,
      error: { code: '23505', message: 'duplicate key value violates unique constraint' },
    });

    // Second attempt: Fetch highest again. Now another process succeeded, so highest is SVI2206. Code tries to insert SVI2207.
    mockLimit.mockResolvedValueOnce({ data: [{ submission_id: 'SVI2206' }], error: null });
    // Second insertion succeeds
    mockInsertSingle.mockResolvedValueOnce({
      data: {
        id: 'user-uuid-4',
        submission_id: 'SVI2207',
        name: 'John',
        created_at: '2026-05-29T12:15:00Z',
      },
      error: null,
    });

    const formData = createMockRegistrationFormData();
    const req = new NextRequest('http://localhost/api/registration', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.submissionId).toBe('SVI2207');

    // Verify it attempted to fetch twice
    expect(mockLimit).toHaveBeenCalledTimes(2);
    // Verify it attempted to insert twice, first with SVI2206 and second with SVI2207
    expect(mockInsert).toHaveBeenCalledTimes(2);
    expect(mockInsert).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ submission_id: 'SVI2206' })
    );
    expect(mockInsert).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ submission_id: 'SVI2207' })
    );
  });

  it('should handle database connection failures during ID retrieval gracefully by returning 500', async () => {
    // Mock fetch error
    mockLimit.mockResolvedValueOnce({
      data: null,
      error: { message: 'Database unreachable' },
    });

    const formData = createMockRegistrationFormData();
    const req = new NextRequest('http://localhost/api/registration', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.error).toBe('Database connection failure during ID generation');
  });

  it('should handle other insertion failures gracefully by returning 500', async () => {
    mockLimit.mockResolvedValueOnce({ data: [{ submission_id: 'SVI2205' }], error: null });
    // Mock non-concurrency insertion error
    mockInsertSingle.mockResolvedValueOnce({
      data: null,
      error: { code: 'some-other-code', message: 'Foreign key violation' },
    });

    const formData = createMockRegistrationFormData();
    const req = new NextRequest('http://localhost/api/registration', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.error).toBe('Failed to submit registration');
  });

  describe('Email Notification Enhancements', () => {
    it('should query the advisor database and include applicant, admin, and advisor in the email dispatch list', async () => {
      mockLimit.mockResolvedValueOnce({ data: [], error: null });
      mockInsertSingle.mockResolvedValueOnce({
        data: {
          id: 'user-uuid-email-1',
          submission_id: 'SVI2208',
          name: 'John',
          last_name: 'Doe',
          created_at: '2026-05-30T12:00:00Z',
        },
        error: null,
      });

      mockSend.mockResolvedValueOnce({ data: { id: 'email-sent-success-1' }, error: null });

      const formData = createMockRegistrationFormData({
        email: 'applicant@example.com',
        advisorName: 'John Advisor',
      });
      const req = new NextRequest('http://localhost/api/registration', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.emailStatus.sent).toBe(true);
      expect(body.emailStatus.error).toBeNull();

      // Verify that Resend was called with correct recipients (to: applicant, bcc: admin and advisor)
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'applicant@example.com',
          bcc: expect.arrayContaining([
            'hr.sviinfrasolutions@gmail.com',
            'advisor.real@sviinfra.com',
          ]),
        })
      );
    });

    it('should fallback routing to Admin recipient if applicant email is missing or invalid', async () => {
      mockLimit.mockResolvedValueOnce({ data: [], error: null });
      mockInsertSingle.mockResolvedValueOnce({
        data: {
          id: 'user-uuid-email-2',
          submission_id: 'SVI2209',
          name: 'John',
          last_name: 'Doe',
          created_at: '2026-05-30T12:05:00Z',
        },
        error: null,
      });

      mockSend.mockResolvedValueOnce({ data: { id: 'email-sent-success-2' }, error: null });

      // Missing or invalid applicant email
      const formData = createMockRegistrationFormData({
        email: 'invalid-email-format',
      });
      const req = new NextRequest('http://localhost/api/registration', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.emailStatus.sent).toBe(true);

      // Should route primary email "to" the admin email, and only copy the advisor in bcc (if advisor is present)
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'hr.sviinfrasolutions@gmail.com',
        })
      );
    });

    it('should trigger retry mechanisms for transient failures and capture error feedback if it ultimately fails', async () => {
      mockLimit.mockResolvedValueOnce({ data: [], error: null });
      mockInsertSingle.mockResolvedValueOnce({
        data: {
          id: 'user-uuid-email-3',
          submission_id: 'SVI2210',
          name: 'John',
          last_name: 'Doe',
          created_at: '2026-05-30T12:10:00Z',
        },
        error: null,
      });

      // Force mockSend to fail to trigger retry loop (exponential backoff)
      mockSend.mockRejectedValue(new Error('SMTP transient outage'));

      const formData = createMockRegistrationFormData();
      const req = new NextRequest('http://localhost/api/registration', {
        method: 'POST',
        body: formData,
      });

      // Avoid long timeouts in tests by temporarily stubbing setTimeout
      const originalSetTimeout = global.setTimeout;
      const mockSetTimeout = vi.fn((cb) => cb());
      global.setTimeout = mockSetTimeout as any;

      try {
        const res = await POST(req);
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body.emailStatus.sent).toBe(false);
        expect(body.emailStatus.error).toContain('SMTP transient outage');
      } finally {
        global.setTimeout = originalSetTimeout;
      }
    });
  });
});
