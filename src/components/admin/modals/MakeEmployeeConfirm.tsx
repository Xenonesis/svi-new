'use client';

import { motion } from 'motion/react';
import { Briefcase } from 'lucide-react';
import type { UserProfile } from '@/src/lib/supabase/types';

interface MakeEmployeeConfirmProps {
  user: UserProfile;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}

export function MakeEmployeeConfirm({
  user,
  onConfirm,
  onClose,
  loading,
}: MakeEmployeeConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-md dark:bg-black/85">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="dark:border-brand-gold/20 relative w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-2xl transition-colors duration-300 dark:bg-[#0e0e14]"
      >
        <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />
        <div className="border-brand-gold/20 bg-brand-gold/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border">
          <Briefcase className="text-brand-gold h-5 w-5" />
        </div>
        <h3 className="text-brand-navy mb-2 font-serif text-lg tracking-tight transition-colors duration-300 dark:text-white">
          Make Employee?
        </h3>
        <p className="mb-6 font-sans text-sm text-gray-500 transition-colors duration-300 dark:text-gray-400">
          This will upgrade{' '}
          <span className="text-brand-navy font-medium dark:text-white">{user.full_name}</span> to
          an Employee. They will gain access to the employee portal.
        </p>
        <div className="flex gap-3 font-sans">
          <button
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-lg border border-gray-200 bg-gray-100 py-3 text-xs font-bold tracking-widest text-gray-700 uppercase transition-all hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-3 text-xs font-bold tracking-widest uppercase shadow-lg transition-all"
          >
            {loading ? (
              <span className="border-brand-navy/30 border-t-brand-navy h-4 w-4 animate-spin rounded-full border-2" />
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
