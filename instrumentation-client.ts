const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const isSentryActive = Boolean(
  dsn &&
  process.env.NODE_ENV === 'production' &&
  (process.env.SENTRY_AUTH_TOKEN || process.env.VERCEL)
);

if (isSentryActive && typeof window !== 'undefined') {
  import('@sentry/nextjs').then((Sentry) => {
    Sentry.init({
      dsn,
      enabled: true,
      tracesSampleRate: 0.05,
      integrations: [],
      tunnel: '/monitoring',
    });
  });
}

export const onRouterTransitionStart = () => {};
