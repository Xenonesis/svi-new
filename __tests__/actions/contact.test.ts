import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before importing submitContactForm
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({
    get: (header: string) => {
      if (header === 'x-forwarded-for') return '192.168.1.100';
      return null;
    },
  }),
}));

const mockCheckRateLimit = vi.fn();
vi.mock('@/src/lib/api/rateLimit', () => ({
  checkRateLimit: (...args: any[]) => mockCheckRateLimit(...args),
}));

const mockInsert = vi.fn();
vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: () => ({
      insert: (...args: any[]) => ({
        select: () => ({
          single: () => mockInsert(...args),
        }),
      }),
    }),
  },
}));

vi.mock('@/src/lib/supabase/notifications', () => ({
  NotificationHelper: {
    create: vi.fn(),
  },
}));

import { submitContactForm } from '@/src/actions/contact';

describe('submitContactForm Server Action Security & Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('silently drops bot submissions when honeypot field is filled', async () => {
    const formData = new FormData();
    formData.append('name', 'Bot Scraper');
    formData.append('email', 'bot@spammer.com');
    formData.append('phone', '+919876543210');
    formData.append('subject', 'Spamming your inbox');
    formData.append('message', 'This is an automated spam payload.');
    formData.append('website', 'http://spam-link.ru'); // Honeypot filled!

    const result = await submitContactForm(formData);

    expect(result.success).toBe(true);
    // Rate limit and database should NOT even be invoked
    expect(mockCheckRateLimit).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('blocks submissions when rate limit is exceeded', async () => {
    mockCheckRateLimit.mockResolvedValueOnce({ allowed: false, retryAfter: 45 });

    const formData = new FormData();
    formData.append('name', 'John Doe');
    formData.append('email', 'john@example.com');
    formData.append('phone', '+919876543210');
    formData.append('subject', 'Inquiry about Villa Plots');
    formData.append('message', 'I am interested in buying a residential plot.');

    const result = await submitContactForm(formData);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Too many submissions');
    expect(result.error).toContain('45 seconds');
    expect(mockCheckRateLimit).toHaveBeenCalledWith('contact-action:192.168.1.100', 5, 60);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('successfully processes valid submission when within rate limits', async () => {
    mockCheckRateLimit.mockResolvedValueOnce({ allowed: true, retryAfter: 60 });
    mockInsert.mockResolvedValueOnce({ data: { id: 'contact-test-123' }, error: null });

    const formData = new FormData();
    formData.append('name', 'Rajesh Sharma');
    formData.append('email', 'rajesh.sharma@example.com');
    formData.append('phone', '+919876543210');
    formData.append('subject', 'Shivani Vatika 11 Inquiry');
    formData.append('message', 'Please share the price list and payment plans.');

    const result = await submitContactForm(formData);

    expect(result.success).toBe(true);
    expect(result.id).toBe('contact-test-123');
    expect(mockCheckRateLimit).toHaveBeenCalledWith('contact-action:192.168.1.100', 5, 60);
    expect(mockInsert).toHaveBeenCalled();
  });
});
