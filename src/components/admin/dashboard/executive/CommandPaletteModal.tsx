'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  PhoneCall,
  Briefcase,
  Receipt,
  FileText,
  Settings,
  Shield,
  X,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Action' | 'Records';
  href?: string;
  icon: LucideIcon;
  shortcut?: string;
}

export const COMMANDS: CommandItem[] = [
  {
    id: '1',
    title: 'Leads Hub & Telecalling',
    category: 'Navigation',
    href: '/admin/leads',
    icon: PhoneCall,
  },
  {
    id: '2',
    title: 'Workforce & Attendance Hub',
    category: 'Navigation',
    href: '/admin/workforce',
    icon: Briefcase,
  },
  {
    id: '3',
    title: 'Generate Payment Receipt',
    category: 'Action',
    href: '/admin/payment-receipt',
    icon: Receipt,
  },
  {
    id: '4',
    title: 'Create Allotment Letter',
    category: 'Action',
    href: '/admin/allotment-letter',
    icon: FileText,
  },
  {
    id: '5',
    title: 'Allotment Records Ledger',
    category: 'Records',
    href: '/admin/allotment-records',
    icon: FileText,
  },
  {
    id: '6',
    title: 'Admin Settings & Preferences',
    category: 'Navigation',
    href: '/admin/settings',
    icon: Settings,
  },
  {
    id: '7',
    title: 'User Access & Permissions',
    category: 'Navigation',
    href: '/admin/dashboard2',
    icon: Shield,
  },
];

export function CommandPaletteModal({ isOpen, onClose }: CommandPaletteModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset search and selection whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return COMMANDS;
    const lower = query.toLowerCase();
    return COMMANDS.filter(
      (c) => c.title.toLowerCase().includes(lower) || c.category.toLowerCase().includes(lower)
    );
  }, [query]);

  const handleSelect = useCallback(
    (item: CommandItem) => {
      if (item.href) {
        router.push(item.href);
        onClose();
      }
    },
    [router, onClose]
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (filteredCommands.length > 0) {
          setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
        }
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (filteredCommands.length > 0) {
          setSelectedIndex((prev) => (prev === 0 ? filteredCommands.length - 1 : prev - 1));
        }
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected) {
          handleSelect(selected);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, filteredCommands, selectedIndex, handleSelect]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20 sm:pt-28">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            data-testid="command-palette-backdrop"
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            role="dialog"
            aria-modal="true"
            aria-label="Command Palette"
            className="border-brand-gold/30 shadow-brand-gold/10 relative w-full max-w-2xl overflow-hidden rounded-2xl border bg-[#080d16] p-0 shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
              <Search className="text-brand-gold h-5 w-5" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command or search (e.g. Leads, Receipts)..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="w-full bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close command palette"
                className="rounded-lg p-1 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {filteredCommands.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  No commands or records found for &quot;{query}&quot;
                </div>
              ) : (
                filteredCommands.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition-colors ${
                        isSelected
                          ? 'bg-brand-gold/15 text-brand-gold'
                          : 'text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-lg p-2 ${
                            isSelected
                              ? 'bg-brand-gold/20 text-brand-gold'
                              : 'bg-white/5 text-gray-400'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{item.title}</div>
                          <span className="text-[10px] tracking-wider text-gray-500 uppercase">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 opacity-60" />
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/5 bg-[#050910] px-4 py-2 text-[11px] text-gray-400">
              <span>
                Navigation: <kbd className="rounded bg-white/10 px-1 py-0.5 text-gray-300">↑</kbd>{' '}
                <kbd className="rounded bg-white/10 px-1 py-0.5 text-gray-300">↓</kbd>
              </span>
              <span>
                Open: <kbd className="rounded bg-white/10 px-1 py-0.5 text-gray-300">Enter</kbd>
              </span>
              <span>
                Close: <kbd className="rounded bg-white/10 px-1 py-0.5 text-gray-300">Esc</kbd>
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
