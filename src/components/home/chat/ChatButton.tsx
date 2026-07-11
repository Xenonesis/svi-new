'use client';

import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ChatButton({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  const tc = useTranslations('common');

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          onClick={onToggle}
          className="bg-brand-navy dark:bg-brand-gold dark:text-brand-navy fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl md:bottom-8 md:left-8 md:h-16 md:w-16"
          aria-label={tc('openChatAssistant')}
        >
          <MessageCircle className="h-6 w-6 md:h-7 md:w-7" />
          <span className="bg-brand-gold dark:bg-brand-navy absolute inline-flex h-full w-full animate-ping rounded-full opacity-20" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
