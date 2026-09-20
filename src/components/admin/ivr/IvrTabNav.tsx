import React from 'react';
import { motion } from 'motion/react';
import { PhoneIncoming, PhoneOutgoing, PhoneCall, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type IvrTab = 'incoming' | 'outgoing' | 'dialer' | 'docs';

export interface TabItem {
  id: IvrTab;
  label: string;
  icon: LucideIcon;
}

export interface IvrTabNavProps {
  activeTab: IvrTab;
  onTabChange: (tab: IvrTab) => void;
}

export const IVR_TABS: TabItem[] = [
  { id: 'incoming', label: 'Incoming Call History', icon: PhoneIncoming },
  { id: 'outgoing', label: 'Outgoing Call History', icon: PhoneOutgoing },
  { id: 'dialer', label: 'Manual Dialout', icon: PhoneCall },
  { id: 'docs', label: 'IVR API Reference', icon: FileText },
];

export function IvrTabNav({ activeTab, onTabChange }: IvrTabNavProps) {
  return (
    <div
      role="tablist"
      aria-label="IVR Telephony Navigation"
      className="mb-8 flex border-b border-gray-200 dark:border-white/10"
    >
      {IVR_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={`group relative flex items-center gap-2 px-6 py-4.5 text-xs font-bold tracking-widest uppercase transition-all ${
              isActive
                ? 'text-brand-gold'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <Icon
              className={`h-4 w-4 ${isActive ? 'text-brand-gold' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'}`}
            />
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="active-ivr-tab"
                className="bg-brand-gold absolute right-0 bottom-0 left-0 h-0.5"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
