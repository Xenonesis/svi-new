'use client';

import { Bell, Check, FileText, Info, Trash2, Users, X, ArrowRight, Mail } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

import Link from 'next/link';
import { supabase } from '@/src/lib/supabase/client';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  action_url?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

interface NotificationDropdownProps {
  userId: string;
}

export default function NotificationDropdown({ userId }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', notificationId);

      if (error) throw error;

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      const deletedNotification = notifications.find((n) => n.id === notificationId);
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Get icon based on notification type
  const getTypeIcon = (notification: Notification) => {
    const isEmail = notification.metadata?.subType === 'email';
    if (isEmail) {
      return <Mail className="text-brand-gold h-4 w-4" />;
    }

    switch (notification.type) {
      case 'success':
        return <Check className="h-4 w-4 text-emerald-500" />;
      case 'warning':
        return <Info className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  // Format timestamp
  const formatTime = (dateString: string) => {
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
    return date.toLocaleDateString();
  };

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  // Real-time subscription for new notifications
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:text-brand-gold relative cursor-pointer p-2 text-gray-500 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-red-500 text-[9px] font-bold text-white dark:border-[#0d0d14]"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="dark:border-brand-gold/15 dark:bg-brand-dark-surface fixed top-[4.5rem] right-2 left-2 z-50 mt-0 w-auto overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl sm:absolute sm:top-full sm:right-0 sm:left-auto sm:mt-3 sm:w-96 sm:max-w-[calc(100vw-2rem)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-brand-gold hover:text-brand-gold/80 text-xs font-medium transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="max-h-[28rem] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="border-t-brand-gold h-6 w-6 animate-spin rounded-full border-2 border-gray-200"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Bell className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      No notifications
                    </p>
                    <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                      You're all caught up!
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-white/5">
                    {notifications.map((notification) => {
                      const isEmail = notification.metadata?.subType === 'email';

                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`group relative px-4 py-3 transition-colors ${
                            isEmail
                              ? !notification.is_read
                                ? 'border-brand-gold dark:bg-brand-gold/15 border-l-2 bg-amber-500/10'
                                : 'dark:hover:bg-brand-gold/5 border-brand-gold/40 border-l-2 hover:bg-amber-500/5'
                              : !notification.is_read
                                ? 'bg-brand-gold/5 dark:bg-brand-gold/10'
                                : 'hover:bg-gray-50 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="flex gap-3">
                            {/* Icon */}
                            <div className="mt-1 flex-shrink-0">{getTypeIcon(notification)}</div>

                            {/* Content */}
                            <div className="min-w-0 flex-1 pr-8">
                              <div className="flex items-start justify-between gap-2">
                                <p
                                  className={`flex items-center gap-1.5 text-sm leading-tight font-semibold ${
                                    !notification.is_read
                                      ? 'text-gray-900 dark:text-white'
                                      : 'text-gray-700 dark:text-gray-300'
                                  }`}
                                >
                                  <span className="truncate">{notification.title}</span>
                                  {isEmail && (
                                    <span className="bg-brand-gold/15 text-brand-gold border-brand-gold/20 inline-flex scale-90 animate-pulse items-center rounded border px-1.5 py-0.5 text-[8px] font-bold tracking-widest uppercase">
                                      Email
                                    </span>
                                  )}
                                </p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="cursor-pointer text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
                                  aria-label="Delete notification"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                                {notification.message}
                              </p>
                              {isEmail && notification.metadata?.subject && (
                                <div className="dark:bg-brand-gold/5 border-brand-gold/10 mt-1.5 flex flex-col gap-0.5 rounded-md border bg-amber-500/5 p-2 text-[10px] leading-tight text-gray-500 dark:text-gray-400">
                                  <span className="text-brand-gold inline-flex items-center gap-1.5 truncate font-semibold">
                                    <Mail className="h-3 w-3" />
                                    Subject: {notification.metadata.subject}
                                  </span>
                                  <span className="inline-flex items-center gap-1.5 truncate">
                                    <Users className="h-3 w-3 text-gray-400" />
                                    Recipient: {notification.metadata.recipient}
                                  </span>
                                </div>
                              )}
                              <div className="mt-2.5 flex items-center gap-2">
                                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                                  {formatTime(notification.created_at)}
                                </span>
                                {!notification.is_read && (
                                  <span className="bg-brand-gold h-2 w-2 rounded-full"></span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Click to mark as read */}
                          {!notification.is_read && (
                            <div
                              className="absolute inset-0 cursor-pointer"
                              onClick={() => markAsRead(notification.id)}
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t border-gray-100 px-5 py-3 dark:border-white/5">
                  <Link
                    href="/admin/notifications"
                    className="text-brand-gold hover:text-brand-gold/80 flex w-full items-center justify-center gap-1.5 text-center text-xs font-medium transition-colors"
                  >
                    View all notifications
                    <ArrowRight size={12} />
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
