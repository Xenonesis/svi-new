'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ShareHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [info, setInfo] = useState<{ title: string; text: string; url: string } | null>(null);

  useEffect(() => {
    const title = searchParams.get('title') || '';
    const text = searchParams.get('text') || '';
    const url = searchParams.get('url') || '';

    if (url) {
      setInfo({ title, text, url });
      // Extract path from shared URL and redirect
      try {
        const sharedUrl = new URL(url);
        // If it's our domain, navigate directly
        if (
          sharedUrl.hostname === window.location.hostname ||
          sharedUrl.hostname.endsWith('.sviinfrasolutions.com')
        ) {
          router.replace(sharedUrl.pathname + sharedUrl.search);
        } else {
          // External URL — redirect home
          router.replace('/');
        }
      } catch {
        // Invalid URL, search text or go home
        if (text && text.startsWith('/')) {
          router.replace(text);
        } else {
          router.replace('/');
        }
      }
    } else {
      // No URL shared — redirect home after brief display
      const timer = setTimeout(() => router.replace('/'), 2000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="mx-auto max-w-md p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <svg
            className="h-8 w-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </div>
        <h1 className="mb-2 text-xl font-semibold text-gray-900">
          {info ? 'Opening shared link…' : 'Redirecting…'}
        </h1>
        <p className="text-sm text-gray-500">
          {info ? info.text || info.url : 'SVI Infra Solutions'}
        </p>
      </div>
    </div>
  );
}
