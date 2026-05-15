import { useEffect } from 'react';

declare global {
  interface Window {
    dataLayer: unknown[];
  }
  interface ImportMetaEnv {
    readonly VITE_ANALYTICS_ID?: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export default function Analytics() {
  useEffect(() => {
    const trackingId = import.meta.env.VITE_ANALYTICS_ID;
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
