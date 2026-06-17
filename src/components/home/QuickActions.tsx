'use client';

import { Phone, Calendar, FileText } from 'lucide-react';
import { memo } from 'react';
import { PHONE_HREF } from '@/src/lib/constants';

const QUICK_ACTIONS = [
  {
    label: 'Schedule Visit',
    icon: Calendar,
    href: '/contact?subject=Site%20Visit',
    className:
      'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50',
  },
  {
    label: 'Call Back',
    icon: Phone,
    href: PHONE_HREF,
    className:
      'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400 dark:hover:bg-green-950/50',
  },
  {
    label: 'Get Brochure',
    icon: FileText,
    href: '/contact?subject=Brochure%20Request',
    className:
      'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-950/50',
  },
];

function QuickActions() {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <a
            key={action.label}
            href={action.href}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${action.className}`}
          >
            <Icon className="h-3 w-3" />
            {action.label}
          </a>
        );
      })}
    </div>
  );
}

export default memo(QuickActions);
