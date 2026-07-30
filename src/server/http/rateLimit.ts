/**
 * Tiny in-process token bucket for dev/test usage.
 * Production should back this with edge-config, Upstash or KV.
 */
interface BucketState {
  tokens: number;
  refillAt: number;
}

const buckets = new Map<string, BucketState>();

export interface RateLimitConfig {
  /** Identifier, e.g. actor.id + action. */
  key: string;
  /** Maximum tokens in the bucket. */
  capacity: number;
  /** Tokens refilled per windowMs. */
  refillTokens?: number;
  /** Bucket window in ms. */
  windowMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

export function rateLimit({
  key,
  capacity,
  refillTokens = capacity,
  windowMs = 10_000,
}: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const state = buckets.get(key) ?? { tokens: capacity, refillAt: now + windowMs };

  if (now >= state.refillAt) {
    state.tokens = Math.min(capacity, state.tokens + refillTokens);
    state.refillAt = now + windowMs;
  }

  if (state.tokens <= 0) {
    buckets.set(key, state);
    return { allowed: false, remaining: 0, resetMs: state.refillAt - now };
  }

  state.tokens -= 1;
  buckets.set(key, state);
  return { allowed: true, remaining: state.tokens - 1, resetMs: windowMs };
}

/** Reset all buckets (used by tests). */
export function _resetRateLimits() {
  buckets.clear();
}
