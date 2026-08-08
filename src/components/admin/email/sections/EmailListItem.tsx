import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Star, MoreVertical, Check } from 'lucide-react';
import { formatTime } from '../helpers';
import { getInitials, getAvatarColor, StatusDot, getStatusLabel, itemVariants } from './constants';
import type { SentEmail } from '../types';

interface EmailListItemProps {
  email: SentEmail;
  isSelected: boolean;
  isStarred: boolean;
  isChecked: boolean;
  onSelect: (id: string) => void;
  onToggleStar: (id: string, e: React.MouseEvent | React.KeyboardEvent) => void;
  onToggleCheck: (id: string) => void;
  onOpenMenu?: (id: string, e: React.MouseEvent) => void;
  onForward?: (email: SentEmail) => void;
  onReply?: (email: SentEmail) => void;
  onDelete?: (email: SentEmail) => void;
}

export function EmailListItem({
  email,
  isSelected,
  isStarred,
  isChecked,
  onSelect,
  onToggleStar,
  onToggleCheck,
  onOpenMenu,
  onForward,
  onReply,
  onDelete,
}: EmailListItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const firstTo = email.to?.[0] || '';
  const initials = getInitials(firstTo);
  const avatarColor = getAvatarColor(firstTo);

  /* ─── Row click handler: select email for detail view ─── */
  const handleRowClick = () => {
    onSelect(email.id);
  };

  /* ─── Checkbox click: toggle multi-select ─── */
  const handleCheckClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleCheck(email.id);
  };

  const handleCheckKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.stopPropagation();
      onToggleCheck(email.id);
    }
  };

  return (
    <motion.div variants={itemVariants} key={email.id}>
      <div className="group relative" ref={containerRef}>
        {/* Row wrapper — clickable without using <button> so we can nest interactive checkbox */}
        <div
          role="button"
          tabIndex={0}
          onClick={handleRowClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleRowClick();
            }
          }}
          className={`flex w-full cursor-pointer touch-manipulation items-start gap-2.5 px-5 py-4 text-left transition-all active:scale-[0.99] active:bg-gray-100 dark:active:bg-white/[0.03] ${
            isSelected
              ? 'bg-brand-gold/[0.06] dark:bg-brand-gold/[0.04]'
              : 'hover:bg-gray-50/80 dark:hover:bg-white/[0.015]'
          }`}
        >
          {isSelected && (
            <div className="bg-brand-gold absolute top-0 bottom-0 left-0 w-[3px] rounded-r-full" />
          )}

          {/* Checkbox for multi-select */}
          <div
            onClick={handleCheckClick}
            onKeyDown={handleCheckKeyDown}
            role="checkbox"
            aria-checked={isChecked}
            tabIndex={0}
            className={`relative z-10 mt-1 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border-2 transition-all ${
              isChecked
                ? 'border-brand-gold bg-brand-gold text-white'
                : 'hover:border-brand-gold/50 dark:hover:border-brand-gold/50 border-gray-300 dark:border-gray-600'
            }`}
          >
            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
          </div>

          {/* Avatar */}
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${avatarColor}`}
          >
            {initials}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <StatusDot status={email.last_event} />
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                {email.subject || '(no subject)'}
              </p>
              {isStarred && <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />}
            </div>

            {/* Recipients */}
            <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-500">
              {email.to && email.to.length > 0 ? `To: ${email.to.join(', ')}` : '(no recipients)'}
            </p>

            {/* Meta info */}
            <div className="mt-1.5 flex items-center gap-3">
              <span className="font-mono text-[10px] text-gray-400">
                {formatTime(email.created_at)}
              </span>
              <span className="text-[10px] font-medium text-gray-400 capitalize">
                {getStatusLabel(email.last_event)}
              </span>
            </div>
          </div>

          {/* Star quick-toggle (visible when starred) */}
          {isStarred && (
            <Star
              className="mt-1 h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400"
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(email.id, e);
              }}
            />
          )}
        </div>

        {/* Actions menu button (visible on hover) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
            onOpenMenu?.(email.id, e);
          }}
          className={`absolute top-1/2 right-3 z-10 -translate-y-1/2 rounded-lg p-1 text-gray-400 transition-opacity hover:text-gray-600 dark:hover:text-gray-300 ${
            menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute top-8 right-8 z-30 min-w-[120px] rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg dark:border-gray-800 dark:bg-gray-900">
            {onReply && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReply(email);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Reply
              </button>
            )}
            {onForward && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onForward(email);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Forward
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(email.id, e);
                setMenuOpen(false);
              }}
              className="flex w-full items-center px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
            >
              {isStarred ? 'Unstar' : 'Star'}
            </button>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(email);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
