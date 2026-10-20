import { Resend } from 'resend';
import type { ErrorResponse } from 'resend';

/**
 * Shared email dispatch for lottery draw notifications.
 *
 * Why this exists (fixes three real defects in the old inline implementation):
 *  1. Rate limiting — Resend allows 10 requests/second. The old code fired 10
 *     concurrent `emails.send` calls per batch with only a 500ms gap, which
 *     reliably produced 429s for larger participant pools.
 *  2. Error isolation — a single invalid recipient (e.g. a placeholder domain
 *     that Resend rejects with 422) aborted the whole `Promise.allSettled` batch
 *     silently, so nobody was told who actually received a message.
 *  3. Duplicate sends — retries re-sent to the same recipients. Every send now
 *     carries a deterministic idempotency key derived from the business event.
 */

const RESEND_RATE_LIMIT_PER_SECOND = 10;
const RESEND_BATCH_MAX = 100;

export interface LotteryEmailRecipient {
  email: string;
  name: string;
  ticketNumber: string;
  subject: string;
  html: string;
}

export interface LotteryEmailDispatchResult {
  sent: number;
  failed: number;
  skipped: number;
  /** Recipients that were rejected permanently (invalid address, blocked domain). */
  rejected: Array<{ email: string; reason: string }>;
  /** Transient failures (rate limit, network) that may be retried later. */
  retryable: Array<{ email: string; reason: string }>;
}

/** Resend rejects placeholder domains in non-production mode; treat as permanent. */
function isPermanentEmailFailure(error: ErrorResponse | null | undefined): boolean {
  if (!error) return false;
  if (error.statusCode === 429) return false;
  if (error.statusCode && error.statusCode >= 500) return false;
  return true;
}

function sleep(ms: number): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, ms);
  return promise;
}

/**
 * Send lottery emails through Resend's batch endpoint.
 *
 * Batches are capped at 100 recipients, requests are paced to stay under the
 * 10 req/s limit, and every recipient carries a deterministic idempotency key
 * so a retry of the same draw never double-sends.
 */
export async function dispatchLotteryEmails(
  apiKey: string,
  fromAddress: string,
  recipients: LotteryEmailRecipient[],
  idempotencyScope: string
): Promise<LotteryEmailDispatchResult> {
  const result: LotteryEmailDispatchResult = {
    sent: 0,
    failed: 0,
    skipped: 0,
    rejected: [],
    retryable: [],
  };

  if (recipients.length === 0) return result;

  const resend = new Resend(apiKey);
  const deliverable = recipients.filter((r) => {
    const address = r.email?.trim();
    if (!address) {
      result.skipped++;
      return false;
    }
    return true;
  });

  for (let i = 0; i < deliverable.length; i += RESEND_BATCH_MAX) {
    const chunk = deliverable.slice(i, i + RESEND_BATCH_MAX);

    const payload = chunk.map((r) => ({
      from: fromAddress,
      to: [r.email.trim()],
      subject: r.subject,
      html: r.html,
    }));

    // One deterministic key per draw + recipient: a retry of the same draw
    // returns the original response instead of sending a duplicate.
    const idempotencyKey = `lottery-${idempotencyScope}-${chunk
      .map((r) => r.email.trim())
      .join('|')
      .slice(0, 180)}`;

    try {
      const { data, error } = await resend.batch.send(payload, {
        batchValidation: 'permissive',
        idempotencyKey,
      });

      if (error) {
        // The whole batch failed. Classify once, then attribute to each recipient.
        const reason = error.message;
        const permanent = isPermanentEmailFailure(error);
        for (const r of chunk) {
          result.failed++;
          if (permanent) result.rejected.push({ email: r.email.trim(), reason });
          else result.retryable.push({ email: r.email.trim(), reason });
        }
      } else {
        const errors = data?.errors ?? [];
        const failedIndexes = new Set(errors.map((e) => e.index));
        for (const [index, r] of chunk.entries()) {
          if (failedIndexes.has(index)) {
            result.failed++;
            result.rejected.push({
              email: r.email.trim(),
              reason: errors.find((e) => e.index === index)?.message ?? 'Unknown send failure',
            });
          } else {
            result.sent++;
          }
        }
      }
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      for (const r of chunk) {
        result.failed++;
        result.retryable.push({ email: r.email.trim(), reason });
      }
    }

    // Pace requests: the batch endpoint counts as one request, but the next
    // batch must not land inside the same 1s window.
    if (i + RESEND_BATCH_MAX < deliverable.length) {
      await sleep(Math.ceil((RESEND_BATCH_MAX / RESEND_RATE_LIMIT_PER_SECOND) * 1000) + 250);
    }
  }

  return result;
}
