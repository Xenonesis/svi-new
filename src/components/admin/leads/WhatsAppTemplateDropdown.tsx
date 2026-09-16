'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, FileText, Car, Calculator } from 'lucide-react';
import { WHATSAPP_TEMPLATES, buildWhatsAppLink } from '@/src/lib/utils/whatsappTemplates';
import { toast } from 'sonner';

interface WhatsAppTemplateDropdownProps {
  phone: string;
  clientName?: string;
  advisorName?: string;
}

export function WhatsAppTemplateDropdown({
  phone,
  clientName,
  advisorName,
}: WhatsAppTemplateDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectTemplate = async (templateId: 'brochure' | 'site_visit' | 'pricing') => {
    const link = buildWhatsAppLink(phone, templateId, {
      clientName,
      advisorName,
    });

    // Open WhatsApp
    window.open(link, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    toast.success(`WhatsApp opened with ${WHATSAPP_TEMPLATES[templateId].title}`);

    // Silently log interaction
    try {
      await fetch(`/api/admin/leads/${phone}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'whatsapp_sent',
          content: `Sent ${WHATSAPP_TEMPLATES[templateId].title} on WhatsApp`,
          advisor_name: advisorName || 'Advisor',
          metadata: { template_id: templateId },
        }),
      });
    } catch {
      // Ignored
    }
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Send WhatsApp template to ${phone}`}
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 transition-colors hover:bg-emerald-500/20 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-500/30"
        title="Send 1-Click WhatsApp Template"
      >
        <MessageCircle className="h-3.5 w-3.5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 z-40 mt-1.5 w-72 rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-[#12121a]"
          >
            <div className="border-b border-gray-100 px-2 py-1.5 text-[11px] font-bold text-gray-400 uppercase dark:border-white/5 dark:text-gray-500">
              1-Click WhatsApp Templates
            </div>

            <div className="mt-1 space-y-1">
              <button
                type="button"
                onClick={() => handleSelectTemplate('brochure')}
                className="flex w-full items-start gap-2.5 rounded-xl p-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-gray-900 dark:text-white">
                    Brochure & Maps Location
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">
                    Township brochure PDF + Google Map pin
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTemplate('site_visit')}
                className="flex w-full items-start gap-2.5 rounded-xl p-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Car className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-gray-900 dark:text-white">
                    Free Site Visit (Pick & Drop)
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">
                    Complimentary AC cab weekend invitation
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTemplate('pricing')}
                className="flex w-full items-start gap-2.5 rounded-xl p-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Calculator className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-gray-900 dark:text-white">
                    Plot Sizes & Price List
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">
                    50 to 200 gaj dimensions & loan options
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
