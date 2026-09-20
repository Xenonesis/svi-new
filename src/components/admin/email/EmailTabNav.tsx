import { useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import {
  PenLine,
  Inbox,
  Send,
  Megaphone,
  FileText,
  Globe,
  Settings,
  Trash2,
  Clock,
  FileEdit,
} from 'lucide-react';
import type { Tab } from './types';

export interface TabItem {
  id: Tab;
  label: string;
  icon: LucideIcon;
}

export const EMAIL_TABS: TabItem[] = [
  { id: 'compose', label: 'Compose', icon: PenLine },
  { id: 'drafts', label: 'Drafts', icon: FileEdit },
  { id: 'replies', label: 'Inbox', icon: Inbox },
  { id: 'sent', label: 'Sent', icon: Send },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'domains', label: 'Domains', icon: Globe },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'scheduled', label: 'Scheduled', icon: Clock },
  { id: 'trash', label: 'Trash', icon: Trash2 },
];

export interface EmailTabNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  unreadCount?: number;
}

export function EmailTabNav({ activeTab, onTabChange, unreadCount = 0 }: EmailTabNavProps) {
  const tablistRef = useRef<HTMLDivElement>(null);

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = EMAIL_TABS.findIndex((t) => t.id === activeTab);
      let nextIndex: number | null = null;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % EMAIL_TABS.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + EMAIL_TABS.length) % EMAIL_TABS.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIndex = EMAIL_TABS.length - 1;
      }

      if (nextIndex !== null) {
        onTabChange(EMAIL_TABS[nextIndex].id);
        const buttons = tablistRef.current?.querySelectorAll('[role="tab"]');
        (buttons?.[nextIndex] as HTMLElement)?.focus();
      }
    },
    [activeTab, onTabChange]
  );

  return (
    <div className="mb-6 border-b border-[#EAEAEA] dark:border-gray-800">
      <nav
        ref={tablistRef}
        className="flex gap-2 overflow-x-auto pb-2 sm:pb-0"
        role="tablist"
        aria-label="Email center navigation"
        onKeyDown={handleTabKeyDown}
      >
        {EMAIL_TABS.map((tab, i) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className={`relative flex shrink-0 touch-manipulation items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                  : 'text-[#787774] hover:bg-[#F7F6F3] dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <Icon
                className={`h-4 w-4 ${isActive ? 'text-white dark:text-[#111111]' : 'text-gray-400'}`}
              />
              <span>{tab.label}</span>
              {tab.id === 'replies' && unreadCount > 0 && (
                <span
                  className={`py-0.2 ml-1 rounded-full px-1.5 font-mono text-[10px] font-bold ${
                    isActive
                      ? 'bg-white/20 text-white dark:bg-black/20 dark:text-[#111111]'
                      : 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}
