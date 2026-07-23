import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  BellOff,
  Check,
  Clock,
  Eye,
  EyeOff,
  Info,
  Loader2,
  Mail,
  RefreshCw,
  Trash2,
  User,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Notification, FilterType, ReadFilter } from './types';

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  typeFilter: FilterType;
  readFilter: ReadFilter;
  selectedIds: Set<string>;
  toggleSelection: (id: string) => void;
  toggleSelectAll: () => void;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  deleteNotification: (id: string) => void;
  fetchNotifications: (page: number) => void;
  setTypeFilter: (val: FilterType) => void;
  setReadFilter: (val: ReadFilter) => void;
  setSearchQuery: (val: string) => void;
  setCurrentPage: (val: number) => void;
}

const TYPE_CONFIG = {
  info: {
    icon: Info,
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-l-blue-500',
  },
  success: {
    icon: Check,
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-l-emerald-500',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-l-amber-500',
  },
  error: {
    icon: X,
    bg: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-l-red-500',
  },
};

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatFullDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NotificationList({
  notifications,
  loading,
  error,
  searchQuery,
  typeFilter,
  readFilter,
  selectedIds,
  toggleSelection,
  toggleSelectAll,
  markAsRead,
  markAsUnread,
  deleteNotification,
  fetchNotifications,
  setTypeFilter,
  setReadFilter,
  setSearchQuery,
  setCurrentPage,
}: NotificationListProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="text-brand-gold mb-4 h-8 w-8 animate-spin" />
        <p className="text-sm text-gray-500">Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <X className="h-8 w-8 text-red-500" />
        </div>
        <p className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          Something went wrong
        </p>
        <p className="mb-6 max-w-md text-sm text-gray-500">{error}</p>
        <button
          onClick={() => fetchNotifications(1)}
          className="border-brand-gold text-brand-gold hover:bg-brand-gold flex items-center gap-2 rounded-lg border px-6 py-3 text-xs font-bold tracking-widest uppercase transition-colors hover:text-white"
        >
          <RefreshCw size={14} />
          Try Again
        </button>
      </motion.div>
    );
  }

  if (notifications.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
          {searchQuery || typeFilter !== 'all' || readFilter !== 'all' ? (
            <BellOff className="h-10 w-10 text-gray-400" />
          ) : (
            <Bell className="h-10 w-10 text-gray-400" />
          )}
        </div>
        <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
          {searchQuery || typeFilter !== 'all' || readFilter !== 'all'
            ? 'No matching notifications'
            : 'No notifications yet'}
        </h3>
        <p className="max-w-sm text-sm text-gray-500">
          {searchQuery || typeFilter !== 'all' || readFilter !== 'all'
            ? 'Try adjusting your filters or search query.'
            : "You're all caught up! Notifications will appear here when there's something new."}
        </p>
        {(searchQuery || typeFilter !== 'all' || readFilter !== 'all') && (
          <button
            onClick={() => {
              setTypeFilter('all');
              setReadFilter('all');
              setSearchQuery('');
              setCurrentPage(1);
            }}
            className="hover:border-brand-gold hover:text-brand-gold mt-6 flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-xs font-bold tracking-widest text-gray-700 uppercase transition-colors dark:border-gray-600 dark:text-gray-300"
          >
            <X size={14} />
            Clear All Filters
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <>
      <div className="mb-2 flex items-center gap-3 px-1">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={selectedIds.size === notifications.length && notifications.length > 0}
            onChange={toggleSelectAll}
            className="accent-brand-gold h-4 w-4 rounded border-gray-300"
          />
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
            Select All
          </span>
        </label>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {notifications.map((notification, index) => {
            const isEmail = notification.metadata?.subType === 'email';

            const config = isEmail
              ? {
                  icon: Mail,
                  bg: 'bg-amber-500/10 dark:bg-brand-gold/15',
                  text: 'text-brand-gold',
                  border: 'border-l-brand-gold',
                }
              : TYPE_CONFIG[notification.type];

            const IconComponent = config.icon;

            return (
              <motion.div
                key={notification.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25, delay: index * 0.02 }}
                className={`group relative flex items-start gap-3 rounded-lg border-l-4 p-4 transition-all md:p-5 ${
                  notification.is_read
                    ? isEmail
                      ? 'border-brand-gold/40 dark:bg-brand-gold/5 dark:hover:bg-brand-gold/10 bg-amber-500/[0.02] hover:bg-amber-500/[0.04]'
                      : 'dark:bg-brand-dark-surface border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/[0.03]'
                    : `${config.border} ${config.bg} shadow-sm`
                } ${selectedIds.has(notification.id) ? 'ring-brand-gold/50 ring-2' : ''}`}
              >
                <div className="flex-shrink-0 pt-0.5">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(notification.id)}
                    onChange={() => toggleSelection(notification.id)}
                    className="accent-brand-gold h-4 w-4 rounded border-gray-300"
                  />
                </div>

                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${config.bg}`}
                >
                  <IconComponent className={`h-4 w-4 ${config.text}`} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h4
                        className={`flex items-center gap-2 text-sm font-semibold ${
                          notification.is_read
                            ? 'text-gray-500 dark:text-gray-400'
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        <span className="truncate">{notification.title}</span>
                        {isEmail && (
                          <span className="bg-brand-gold/15 text-brand-gold border-brand-gold/20 inline-flex animate-pulse items-center rounded border px-1.5 py-0.5 text-[8px] font-bold tracking-widest uppercase">
                            Automated Email
                          </span>
                        )}
                      </h4>
                      <p
                        className={`mt-1 text-sm leading-relaxed ${
                          notification.is_read
                            ? 'text-gray-400 dark:text-gray-500'
                            : 'text-gray-600 dark:text-gray-300'
                        } line-clamp-2`}
                      >
                        {notification.message}
                      </p>
                      {isEmail && Boolean(notification.metadata?.subject) && (
                        <div className="dark:bg-brand-gold/[0.03] border-brand-gold/10 mt-3 flex max-w-xl flex-col gap-1 rounded-lg border bg-amber-500/[0.03] p-3 text-xs text-gray-500 dark:text-gray-400">
                          <span className="text-brand-gold inline-flex items-center gap-2 font-semibold">
                            <Mail className="h-3.5 w-3.5" />
                            Subject:
                            <span className="font-normal text-gray-700 dark:text-gray-300">
                              {notification.metadata!.subject as string}
                            </span>
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-gray-400" />
                            Recipient:
                            <span className="font-mono font-medium text-gray-700 dark:text-gray-300">
                              {notification.metadata!.recipient as string}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
                        <Clock size={11} />
                        {formatTime(notification.created_at)}
                      </div>
                      <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-600">
                        {formatFullDate(notification.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    {notification.is_read ? (
                      <button
                        onClick={() => markAsUnread(notification.id)}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold tracking-widest text-gray-500 uppercase transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-gray-200"
                      >
                        <EyeOff size={11} />
                        Mark Unread
                      </button>
                    ) : (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-brand-gold hover:bg-brand-gold/10 flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold tracking-widest uppercase transition-colors"
                      >
                        <Eye size={11} />
                        Mark Read
                      </button>
                    )}

                    {notification.action_url && (
                      <a
                        href={notification.action_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold tracking-widest text-blue-600 uppercase transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/20"
                      >
                        View Details
                      </a>
                    )}

                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold tracking-widest text-gray-500 uppercase transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    >
                      <Trash2 size={11} />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}
