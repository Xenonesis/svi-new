"use client";

import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, X } from 'lucide-react';

const WHATSAPP_NUMBER = '917300007643';
const WHATSAPP_MESSAGE = encodeURIComponent('Hi! I am interested in SVI Infra Solutions properties. Can you help me?');

export default function WhatsAppChat() {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = useCallback(() => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`, '_blank');
    setIsOpen(false);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      {isOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-xs animate-in">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <MessageCircle size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-navy dark:text-gray-100">SVI Infra Solutions</p>
                <p className="text-xs text-green-500">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Close chat"
            >
              <X size={14} />
            </button>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-3">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              👋 Hi! How can we help you? Chat with us on WhatsApp for instant support.
            </p>
          </div>
          <button
            onClick={handleClick}
            className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle size={16} />
            Start Chat
          </button>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={28} />
      </button>
    </div>
  );
}
