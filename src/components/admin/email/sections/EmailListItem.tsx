'use client';

import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { formatTime } from '../helpers';
import { getInitials, getAvatarColor, StatusDot, getStatusLabel, itemVariants } from './constants';
import type { SentEmail } from '../types';

interface EmailListItemProps {
  email: SentEmail;
  isSelected: boolean;
  isStarred: boolean;
  onSelect: (id: string) => void;
  onToggleStar: (id: string, e: React.MouseEvent | React.KeyboardEvent) => void;
}

export function EmailListItem({
  email,
  isSelected,
  isStarred,
  onSelect,
  onToggleStar,
}: EmailListItemProps) {
  const firstTo = email.to?.[0] || '';

  return (
    <motion.div variants={itemVariants} key={email.id}>
      <button
        onClick={() => onSelect(email.id)}
        className={`group relative flex w-full items-start gap-3.5 px-5 py-4 text-left transition-all ${
          isSelected
            ? 'bg-brand-gold/[0.04] dark:bg-brand-gold/[0.03]'
            : 'hover:bg-gray-50/80 dark:hover:bg-white/[0.015]'
        }`}
      >
        {isSelected && (
          <div className="bg-brand-gold absolute top-0 bottom-0 left-0 w-[3px] rounded-r-full" />
        )}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${getAvatarColor(firstTo)}`}
        >
          {getInitials(firstTo)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <StatusDot status={email.last_event} />
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {email.subject || '(no subject)'}
            </p>
          </div>
          <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-500">
            To: {email.to?.join(', ')}
          </p>
          <div className="mt-1.5 flex items-center gap-3">
            <span className="font-mono text-[10px] text-gray-400">
              {formatTime(email.created_at)}
            </span>
            <span className="text-[10px] font-medium text-gray-400 capitalize">
              {getStatusLabel(email.last_event)}
            </span>
          </div>
        </div>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => onToggleStar(email.id, e)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onToggleStar(email.id, e);
          }}
          className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Star
            className={`h-3.5 w-3.5 ${isStarred ? 'fill-amber-400 text-amber-400 opacity-100' : 'text-gray-300 dark:text-gray-600'}`}
          />
        </span>
      </button>
    </motion.div>
  );
}
