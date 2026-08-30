'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, X, Building2, Send } from 'lucide-react';

interface EmployeeLoginHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmployeeLoginHelpModal({ isOpen, onClose }: EmployeeLoginHelpModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
          />
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 10 }}
            className="relative w-full max-w-sm rounded-2xl border border-slate-800 bg-[#0d121c] p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Employee Support</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs leading-relaxed text-slate-400">
              If you have forgotten your password or require a new account, please contact the SVI
              Administration or HR desk.
            </p>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-300">
              <div className="flex items-center gap-2 font-medium text-white">
                <Building2 size={14} className="text-amber-400" />
                <span>HR &amp; Admin Desk</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Password resets are issued securely by system administrators.
              </p>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 cursor-pointer rounded-xl border border-slate-800 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800"
              >
                Close
              </button>
              <a
                href="https://wa.me/?text=Hello%20HR%20Admin,%20I%20need%20assistance%20with%20my%20SVI%20Employee%20Portal%20credentials."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                <Send size={13} />
                <span>Contact HR</span>
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
