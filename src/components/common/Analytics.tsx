"use client";

import { useEffect } from 'react';

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

export default function Analytics() {
  useEffect(() => {
    const trackingId = process.env.NEXT_PUBLIC_ANALYTICS_ID;
    if (!trackingId) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', trackingId);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
}
