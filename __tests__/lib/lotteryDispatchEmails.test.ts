import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const sendMock = vi.fn();
const batchSendMock = vi.fn();

vi.mock('resend', () => ({
  Resend: class {
    batch = { send: batchSendMock };
    emails = { send: sendMock };
  },
}));

import {
  dispatchLotteryEmails,
  type LotteryEmailRecipient,
} from '@/src/lib/lottery/dispatchEmails';

function recipient(overrides: Partial<LotteryEmailRecipient> = {}): LotteryEmailRecipient {
  return {
    email: 'winner@sviinfra.in',
    name: 'Test Winner',
    ticketNumber: 'SVI6001',
    subject: 'You won!',
    html: '<p>Congrats</p>',
    ...overrides,
  };
}

describe('dispatchLotteryEmails', () => {
  beforeEach(() => {
    batchSendMock.mockReset();
    sendMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns an empty result when there are no recipients', async () => {
    const result = await dispatchLotteryEmails('key', 'from@x.com', [], 'scope');

    expect(batchSendMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      sent: 0,
      failed: 0,
      skipped: 0,
      rejected: [],
      retryable: [],
    });
  });

  it('counts a successful batch as sent and reports no failures', async () => {
    batchSendMock.mockResolvedValue({
      data: { data: [{ id: 'a' }, { id: 'b' }], errors: [] },
      error: null,
    });

    const result = await dispatchLotteryEmails(
      'key',
      'from@x.com',
      [recipient({ email: 'a@sviinfra.in' }), recipient({ email: 'b@sviinfra.in' })],
      'scope'
    );

    expect(result.sent).toBe(2);
    expect(result.failed).toBe(0);
    expect(result.rejected).toEqual([]);
  });

  it('isolates a rejected recipient instead of failing the whole batch', async () => {
    batchSendMock.mockResolvedValue({
      data: {
        data: [{ id: 'a' }],
        errors: [{ index: 1, message: 'Invalid `to` field.' }],
      },
      error: null,
    });

    const result = await dispatchLotteryEmails(
      'key',
      'from@x.com',
      [recipient({ email: 'good@sviinfra.in' }), recipient({ email: 'bad@example.com' })],
      'scope'
    );

    expect(result.sent).toBe(1);
    expect(result.failed).toBe(1);
    expect(result.rejected).toEqual([{ email: 'bad@example.com', reason: 'Invalid `to` field.' }]);
    expect(result.retryable).toEqual([]);
  });

  it('marks a 429 batch failure as retryable, not permanent', async () => {
    batchSendMock.mockResolvedValue({
      data: null,
      error: { message: 'Too many requests', statusCode: 429, name: 'rate_limit_exceeded' },
    });

    const result = await dispatchLotteryEmails(
      'key',
      'from@x.com',
      [recipient({ email: 'a@sviinfra.in' })],
      'scope'
    );

    expect(result.sent).toBe(0);
    expect(result.failed).toBe(1);
    expect(result.rejected).toEqual([]);
    expect(result.retryable).toHaveLength(1);
    expect(result.retryable[0].reason).toBe('Too many requests');
  });

  it('marks a 422 batch failure as a permanent rejection', async () => {
    batchSendMock.mockResolvedValue({
      data: null,
      error: { message: 'Invalid `to` field', statusCode: 422, name: 'validation_error' },
    });

    const result = await dispatchLotteryEmails(
      'key',
      'from@x.com',
      [recipient({ email: 'a@example.com' })],
      'scope'
    );

    expect(result.rejected).toHaveLength(1);
    expect(result.retryable).toEqual([]);
  });

  it('skips recipients without an email address', async () => {
    batchSendMock.mockResolvedValue({ data: { data: [{ id: 'a' }], errors: [] }, error: null });

    const result = await dispatchLotteryEmails(
      'key',
      'from@x.com',
      [recipient({ email: '   ' }), recipient({ email: 'a@sviinfra.in' })],
      'scope'
    );

    expect(result.skipped).toBe(1);
    expect(result.sent).toBe(1);
    expect(batchSendMock.mock.calls[0][0]).toHaveLength(1);
  });

  it('sends a deterministic idempotency key derived from the scope and recipients', async () => {
    batchSendMock.mockResolvedValue({ data: { data: [{ id: 'a' }], errors: [] }, error: null });

    await dispatchLotteryEmails('key', 'from@x.com', [recipient()], 'lottery-123');
    await dispatchLotteryEmails('key', 'from@x.com', [recipient()], 'lottery-123');

    const first = batchSendMock.mock.calls[0][1].idempotencyKey;
    const second = batchSendMock.mock.calls[1][1].idempotencyKey;

    expect(first).toBe(second);
    expect(first).toContain('lottery-123');
    expect(batchSendMock.mock.calls[0][1].batchValidation).toBe('permissive');
  });

  it('uses a different idempotency key for a different draw scope', async () => {
    batchSendMock.mockResolvedValue({ data: { data: [{ id: 'a' }], errors: [] }, error: null });

    await dispatchLotteryEmails('key', 'from@x.com', [recipient()], 'lottery-123');
    await dispatchLotteryEmails('key', 'from@x.com', [recipient()], 'lottery-456');

    expect(batchSendMock.mock.calls[0][1].idempotencyKey).not.toBe(
      batchSendMock.mock.calls[1][1].idempotencyKey
    );
  });
});
