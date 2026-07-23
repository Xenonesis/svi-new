import React from 'react';
import { CheckCheck, RefreshCw } from 'lucide-react';

interface NotificationHeaderProps {
  totalCount: number;
  unreadCount: number;
  bulkActionLoading: boolean;
  loading: boolean;
  markAllAsRead: () => void;
  fetchNotifications: () => void;
}

export function NotificationHeader({
  totalCount,
  unreadCount,
  bulkActionLoading,
  loading,
  markAllAsRead,
  fetchNotifications,
}: NotificationHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-3xl text-gray-900 md:text-4xl dark:text-white">
            Notifications
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {totalCount} notification{totalCount !== 1 ? 's' : ''}
            {unreadCount > 0 && (
              <span className="text-brand-gold ml-1">· {unreadCount} unread</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={bulkActionLoading}
              className="hover:border-brand-gold hover:text-brand-gold flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-xs font-bold tracking-widest text-gray-700 uppercase transition-colors disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
            >
              <CheckCheck size={14} />
              Mark All Read
            </button>
          )}
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="hover:border-brand-gold hover:text-brand-gold flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-xs font-bold tracking-widest text-gray-700 uppercase transition-colors disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
