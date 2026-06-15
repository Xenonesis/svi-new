'use client';

// This handles catastrophic errors that crash even the root layout
// It must include its own <html> and <body> tags

import { RefreshCw, Home, AlertOctagon } from 'lucide-react';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Critical Error]', error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Critical Error | SVI Infra Solutions</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #0e1628; font-family: ui-sans-serif, system-ui, sans-serif; color: white; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </head>
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: `
              radial-gradient(ellipse 70% 60% at 50% 40%, rgba(220,60,60,0.06) 0%, rgba(212, 175, 55,0.03) 50%, transparent 80%),
              #0e1628
            `,
            textAlign: 'center',
            animation: 'fadeUp 0.6s ease both',
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(220,60,60,0.1)',
              border: '1px solid rgba(220,60,60,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <AlertOctagon size={36} color="#f87171" />
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <div style={{ height: '1px', width: '32px', background: 'rgba(212, 175, 55,0.4)' }} />
            <div
              style={{
                height: '6px',
                width: '6px',
                background: '#d4af37',
                transform: 'rotate(45deg)',
              }}
            />
            <div style={{ height: '1px', width: '32px', background: 'rgba(212, 175, 55,0.4)' }} />
          </div>

          <p
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#f87171',
              marginBottom: '0.75rem',
            }}
          >
            Critical Error
          </p>

          <h1
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              color: 'white',
              marginBottom: '0.75rem',
            }}
          >
            Application{' '}
            <span style={{ color: '#d4af37', fontStyle: 'italic' }}>Encountered a Problem</span>
          </h1>

          <p
            style={{
              maxWidth: '380px',
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '2rem',
              lineHeight: '1.7',
            }}
          >
            A critical error occurred that prevented the page from loading. Our team has been
            notified. Please try again or visit our home page.
          </p>

          {error.digest && (
            <div
              style={{
                marginBottom: '1.5rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '999px',
                padding: '6px 16px',
                fontSize: '11px',
                color: '#6b7280',
                fontFamily: 'monospace',
              }}
            >
              Error ID: {error.digest}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#d4af37',
                color: '#111827',
                border: 'none',
                padding: '14px 28px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} />
              Try Again
            </button>
            <a
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.8)',
                padding: '14px 28px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              <Home size={14} />
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
