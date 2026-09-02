'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from './Badge';
import { ChevronDown, Shield, Users, Briefcase, Check } from 'lucide-react';

interface RoleSwitcherProps {
  role: string;
  onRoleChange: (newRole: string) => void;
  disabled?: boolean;
}

const ROLES = [
  {
    id: 'client',
    label: 'User',
    description: 'Standard client / customer',
    icon: Users,
    color: 'text-gray-500 dark:text-gray-400',
    activeBg: 'bg-gray-100 dark:bg-white/10',
  },
  {
    id: 'employee',
    label: 'Employee',
    description: 'Staff & employee access',
    icon: Briefcase,
    color: 'text-emerald-600 dark:text-emerald-400',
    activeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
  },
  {
    id: 'admin',
    label: 'Admin',
    description: 'Full management controls',
    icon: Shield,
    color: 'text-brand-gold',
    activeBg: 'bg-brand-gold/10 dark:bg-brand-gold/20',
  },
];

export function RoleSwitcher({ role, onRoleChange, disabled }: RoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (disabled) {
    return (
      <div className="inline-flex items-center opacity-70">
        <Badge role={role} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group focus-visible:ring-brand-gold/50 inline-flex cursor-pointer items-center gap-1 rounded-lg transition-all focus:outline-none focus-visible:ring-2"
        title="Click to change role"
      >
        <Badge role={role} />
        <ChevronDown
          className={`h-3 w-3 text-gray-400 transition-transform duration-200 group-hover:text-gray-600 dark:group-hover:text-white ${
            isOpen ? 'text-brand-gold dark:text-brand-gold rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full left-0 z-50 mt-1.5 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#14141e]"
          >
            <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-gray-400 uppercase dark:text-gray-500">
              Select Role
            </div>

            <div className="space-y-0.5">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const isSelected = (role || 'client').toLowerCase() === r.id;

                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      onRoleChange(r.id);
                      setIsOpen(false);
                    }}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors ${
                      isSelected
                        ? `${r.activeBg} font-semibold text-gray-900 dark:text-white`
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                          isSelected
                            ? 'bg-white shadow-xs dark:bg-white/10'
                            : 'bg-gray-100 dark:bg-white/5'
                        }`}
                      >
                        <Icon className={`h-3.5 w-3.5 ${r.color}`} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs">{r.label}</span>
                        <span className="text-[10px] font-normal text-gray-400 dark:text-gray-500">
                          {r.description}
                        </span>
                      </div>
                    </div>

                    {isSelected && <Check className="text-brand-gold h-3.5 w-3.5 shrink-0" />}
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
