'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Shield, Users, Briefcase, Check } from 'lucide-react';

export interface RoleOption {
  id: 'client' | 'employee' | 'admin';
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  boxBg: string;
  activeBorder: string;
  activeBg: string;
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'client',
    label: 'Client',
    description: 'Standard client / customer',
    icon: Users,
    color: 'text-blue-500 dark:text-blue-400',
    boxBg: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-500',
    activeBorder: 'border-blue-500/40',
    activeBg: 'bg-blue-500/10 dark:bg-[#0c1f38] border border-blue-500/30',
  },
  {
    id: 'employee',
    label: 'Employee',
    description: 'Staff & employee access',
    icon: Briefcase,
    color: 'text-emerald-500 dark:text-emerald-400',
    boxBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500',
    activeBorder: 'border-emerald-500/40',
    activeBg: 'bg-emerald-500/10 dark:bg-[#083325] border border-emerald-500/40',
  },
  {
    id: 'admin',
    label: 'Admin',
    description: 'Full management controls',
    icon: Shield,
    color: 'text-brand-gold',
    boxBg: 'bg-brand-gold/10 dark:bg-brand-gold/20 text-brand-gold',
    activeBorder: 'border-brand-gold/40',
    activeBg: 'bg-brand-gold/10 dark:bg-[#2e260c] border border-brand-gold/40',
  },
];

interface RoleSelectProps {
  role: string;
  onRoleChange: (newRole: string) => void;
  disabled?: boolean;
  label?: string;
}

export function RoleSelect({
  role,
  onRoleChange,
  disabled = false,
  label = 'Role *',
}: RoleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedRole =
    ROLE_OPTIONS.find((r) => r.id === (role || 'client').toLowerCase()) || ROLE_OPTIONS[0];
  const SelectedIcon = selectedRole.icon;

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-400">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`focus:border-brand-gold relative flex w-full cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-left text-sm transition-all duration-200 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white ${
          disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-brand-gold/50'
        } ${isOpen ? 'border-brand-gold ring-brand-gold/30 ring-1' : ''}`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${selectedRole.boxBg}`}
          >
            <SelectedIcon className={`h-4 w-4 ${selectedRole.color}`} />
          </div>
          <div className="flex flex-col truncate">
            <span className="text-xs font-semibold text-gray-900 dark:text-white">
              {selectedRole.label}
            </span>
            <span className="truncate text-[11px] text-gray-500 dark:text-gray-400">
              {selectedRole.description}
            </span>
          </div>
        </div>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'text-brand-gold rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#14141e]"
          >
            <div className="px-3 pt-1.5 pb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
              SELECT ROLE
            </div>

            <div className="space-y-1">
              {ROLE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedRole.id === opt.id;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onRoleChange(opt.id);
                      setIsOpen(false);
                    }}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all duration-150 ${
                      isSelected
                        ? `${opt.activeBg} text-gray-900 shadow-xs dark:text-white`
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          isSelected
                            ? 'bg-white/10 dark:bg-white/15'
                            : 'bg-gray-100 dark:bg-white/5'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${opt.color}`} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold">{opt.label}</span>
                        <span className="text-[11px] font-normal text-gray-500 dark:text-gray-400">
                          {opt.description}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="text-brand-gold dark:text-brand-gold h-4 w-4 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
