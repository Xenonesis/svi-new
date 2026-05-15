import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

const CONSENT_KEY = 'svi-cookie-consent-v1';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsent = localStorage.getItem(CONSENT_KEY);
    if (!hasConsent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setIsVisible(false);
  }, []);

  const handleDecline = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setIsVisible(false);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-xl">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <button
            onClick={handleDecline}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors mt-1 shrink-0"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              We use cookies to enhance your browsing experience and analyze website traffic. By clicking "Accept", you consent to our use of cookies.
            </p>
            <Link to="/privacy-policy" className="text-xs text-brand-gold hover:underline mt-1 inline-block">
              Learn more in our Privacy Policy
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleDecline}
            className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-brand-navy dark:hover:text-gray-200 transition-colors px-4 py-2"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="bg-brand-gold text-brand-navy text-xs font-bold uppercase tracking-widest px-6 py-2 transition-colors hover:bg-brand-navy hover:text-brand-gold border border-brand-gold"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
