import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    // Never send to Sentry in development — local errors are noise and the
    // ingest domain gets blocked by browser tracking prevention anyway.
    enabled: process.env.NODE_ENV !== 'development',
    tracesSampleRate: process.env.NODE_ENV === 'development' ? 0 : 0.1,
    enableLogs: false,
    integrations: [],
  });
}

export const onRouterTransitionStart = dsn ? Sentry.captureRouterTransitionStart : () => {};
