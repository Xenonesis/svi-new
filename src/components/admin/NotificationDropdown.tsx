'use client';

import {
  Bell,
  CheckSquare,
  Trash2,
  Users,
  X,
  ArrowRight,
  ArrowUpRight,
  Mail,
  RefreshCw,
  Volume2,
  VolumeX,
  Play,
  MessageSquare,
  UserPlus,
  Settings,
  CalendarCheck,
  Sparkles,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { supabase } from '@/src/lib/supabase/client';
import { resolveNotificationUrl } from '@/src/lib/notifications/notificationNavigation';
import {
  isNotificationSoundEnabled,
  setNotificationSoundEnabled,
  playNotificationChime,
  playTestTone,
} from '@/src/lib/notifications/notificationSound';

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

type TabType = 'alerts' | 'tasks' | 'sounds';

export default function NotificationDropdown({ userId }: NotificationDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('alerts');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load sound preference on mount
  useEffect(() => {
    setSoundEnabled(isNotificationSoundEnabled());
  }, []);

  // Fetch notifications
  const fetchNotifications = async (showRefreshSpin = false) => {
    if (showRefreshSpin) setIsRefreshing(true);
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
      if (showRefreshSpin) {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  };

  // Click notification to mark read, close dropdown, and redirect to origin
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
    const targetUrl = resolveNotificationUrl(notification);
    if (targetUrl) {
      if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      } else {
        router.push(targetUrl);
      }
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

  // Toggle sound alert setting
  const toggleSoundSetting = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    setNotificationSoundEnabled(nextState);
    if (nextState) {
      playTestTone();
    }
  };

  // Helper to determine if a notification is an actionable "Task"
  const isTaskNotification = (n: Notification) => {
    const event = n.metadata?.event || '';
    const title = (n.title || '').toLowerCase();
    const msg = (n.message || '').toLowerCase();

    return (
      event.includes('register') ||
      event.includes('lead') ||
      event.includes('approval') ||
      event.includes('attendance') ||
      title.includes('registered') ||
      title.includes('registration') ||
      title.includes('lead') ||
      title.includes('follow-up') ||
      title.includes('approval') ||
      title.includes('task') ||
      msg.includes('registered as a new user') ||
      msg.includes('scheduled client follow-up')
    );
  };

  // Segregate notifications into tabs
  const taskNotifications = useMemo(
    () => notifications.filter(isTaskNotification),
    [notifications]
  );
  const taskUnreadCount = useMemo(
    () => taskNotifications.filter((n) => !n.is_read).length,
    [taskNotifications]
  );

  const displayedNotifications = useMemo(() => {
    if (activeTab === 'tasks') {
      return taskNotifications;
    }
    return notifications;
  }, [activeTab, notifications, taskNotifications]);

  // Icon with soft tinted rounded container matching the reference design
  const getNotificationIcon = (notification: Notification) => {
    const title = (notification.title || '').toLowerCase();
    const msg = (notification.message || '').toLowerCase();
    const event = (notification.metadata?.event || '').toLowerCase();
    const isEmail = notification.metadata?.subType === 'email' || title.includes('email');

    // 1. Chat & Lead
    if (title.includes('chat') || msg.includes('chatbot') || event.includes('chat')) {
      return (
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
          <MessageSquare className="h-4 w-4" />
        </div>
      );
    }

    // 2. Employee CRM Lead
    if (title.includes('lead') || msg.includes('added a new lead')) {
      return (
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
          <CheckSquare className="h-4 w-4" />
        </div>
      );
    }

    // 3. User & Registration
    if (title.includes('register') || msg.includes('registered') || event.includes('user')) {
      return (
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
          <UserPlus className="h-4 w-4" />
        </div>
      );
    }

    // 4. Email alerts
    if (isEmail) {
      return (
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
          <Mail className="h-4 w-4" />
        </div>
      );
    }

    // 5. Settings
    if (title.includes('setting') || event.includes('setting')) {
      return (
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
          <Settings className="h-4 w-4" />
        </div>
      );
    }

    // 6. Attendance & Teams
    if (title.includes('attendance') || title.includes('team')) {
      return (
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
          <CalendarCheck className="h-4 w-4" />
        </div>
      );
    }

    // 7. Announcement / Celebration
    if (title.includes('bandhan') || title.includes('diwali') || title.includes('holiday')) {
      return (
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400">
          <Sparkles className="h-4 w-4" />
        </div>
      );
    }

    // 8. Default fallback by severity
    if (notification.type === 'error') {
      return (
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
          <X className="h-4 w-4" />
        </div>
      );
    }

    return (
      <div className="bg-brand-gold/10 text-brand-gold dark:bg-brand-gold/20 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl">
        <Bell className="h-4 w-4" />
      </div>
    );
  };

  // Format timestamp (matching "2h ago", "28 Aug", etc.)
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
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  // Real-time subscription for new notifications + chime sound
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
          playNotificationChime();
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

      {/* Dropdown Popover */}
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

            {/* Dropdown Card */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="dark:border-brand-gold/15 dark:bg-brand-dark-surface fixed top-[4.5rem] right-2 left-2 z-50 mt-0 w-auto overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:absolute sm:top-full sm:right-0 sm:left-auto sm:mt-3 sm:w-[26rem] sm:max-w-[calc(100vw-2rem)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-4 pt-4 pb-3 dark:border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="bg-brand-gold/10 text-brand-gold flex h-8 w-8 items-center justify-center rounded-xl">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Notifications &amp; Alerts
                      </h3>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fetchNotifications(true)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                    aria-label="Refresh notifications"
                  >
                    <RefreshCw
                      className={`text-brand-gold h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`}
                    />
                    <span>Refresh</span>
                  </button>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-brand-gold hover:text-brand-gold/80 cursor-pointer text-xs font-semibold transition-colors"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>

              {/* Segmented Pill Tabs */}
              <div className="mx-4 mt-3 mb-2 flex items-center gap-1 rounded-xl border border-gray-200/70 bg-gray-100/80 p-1 dark:border-white/5 dark:bg-white/5">
                <button
                  type="button"
                  onClick={() => setActiveTab('alerts')}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                    activeTab === 'alerts'
                      ? 'bg-white text-gray-900 shadow-xs dark:bg-white/10 dark:text-white'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <Bell className="h-3.5 w-3.5" />
                  <span>Alerts</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('tasks')}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                    activeTab === 'tasks'
                      ? 'bg-white text-gray-900 shadow-xs dark:bg-white/10 dark:text-white'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                  <span>Tasks</span>
                  {taskUnreadCount > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white">
                      {taskUnreadCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('sounds')}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                    activeTab === 'sounds'
                      ? 'bg-white text-gray-900 shadow-xs dark:bg-white/10 dark:text-white'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  {soundEnabled ? (
                    <Volume2 className="h-3.5 w-3.5" />
                  ) : (
                    <VolumeX className="h-3.5 w-3.5 text-gray-400" />
                  )}
                  <span>Sounds</span>
                </button>
              </div>

              {/* Main Content Area */}
              <div className="max-h-[26rem] overflow-y-auto">
                {activeTab === 'sounds' ? (
                  /* Sounds Settings View */
                  <div className="space-y-4 p-5">
                    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 dark:border-white/5 dark:bg-white/[0.02]">
                      <div className="flex items-center gap-3">
                        <div className="bg-brand-gold/10 text-brand-gold flex h-9 w-9 items-center justify-center rounded-xl">
                          {soundEnabled ? (
                            <Volume2 className="h-4 w-4" />
                          ) : (
                            <VolumeX className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">
                            Alert Audio Chime
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            Play sound when new leads &amp; alerts arrive
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={toggleSoundSetting}
                        className={`relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors ${
                          soundEnabled ? 'bg-brand-gold' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                        aria-label="Toggle alert chime"
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            soundEnabled ? 'translate-x-4.5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="rounded-xl border border-gray-100 p-4 text-center dark:border-white/5">
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        Synthesized gentle corporate bell tone via Web Audio API. Zero external file
                        lag.
                      </p>
                      <button
                        type="button"
                        onClick={playTestTone}
                        className="bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Play Sample Tone</span>
                      </button>
                    </div>
                  </div>
                ) : loading ? (
                  <div className="flex items-center justify-center py-14">
                    <div className="border-t-brand-gold h-6 w-6 animate-spin rounded-full border-2 border-gray-200"></div>
                  </div>
                ) : displayedNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-white/5">
                      {activeTab === 'tasks' ? (
                        <CheckSquare className="h-5 w-5" />
                      ) : (
                        <Bell className="h-5 w-5" />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {activeTab === 'tasks' ? 'No pending tasks' : 'No notifications'}
                    </p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      {activeTab === 'tasks'
                        ? 'All registrations and follow-ups are clear!'
                        : "You're completely caught up!"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-white/5">
                    {displayedNotifications.map((notification) => {
                      const isEmail = notification.metadata?.subType === 'email';

                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => handleNotificationClick(notification)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleNotificationClick(notification);
                            }
                          }}
                          className={`group relative cursor-pointer px-4 py-3.5 transition-colors ${
                            isEmail
                              ? !notification.is_read
                                ? 'border-brand-gold dark:bg-brand-gold/15 border-l-2 bg-amber-500/10 hover:bg-amber-500/15'
                                : 'dark:hover:bg-brand-gold/5 hover:bg-amber-500/5'
                              : !notification.is_read
                                ? 'bg-brand-gold/5 hover:bg-brand-gold/10 dark:bg-brand-gold/10 dark:hover:bg-brand-gold/15'
                                : 'hover:bg-gray-50 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Soft tinted Icon Container */}
                            <div className="mt-0.5">{getNotificationIcon(notification)}</div>

                            {/* Text Content */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p
                                  className={`truncate text-xs leading-tight font-semibold ${
                                    !notification.is_read
                                      ? 'text-gray-900 dark:text-white'
                                      : 'text-gray-700 dark:text-gray-300'
                                  }`}
                                >
                                  {notification.title}
                                </p>

                                <div className="flex flex-shrink-0 items-center gap-1.5">
                                  <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                                    {formatTime(notification.created_at)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification.id);
                                    }}
                                    className="relative z-10 cursor-pointer text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
                                    aria-label="Delete notification"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                  <ArrowUpRight className="text-brand-gold h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                                </div>
                              </div>

                              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
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

                              {!notification.is_read && (
                                <div className="mt-1.5 flex items-center gap-1">
                                  <span className="bg-brand-gold h-1.5 w-1.5 rounded-full" />
                                  <span className="text-brand-gold text-[10px] font-semibold">
                                    Unread
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-2.5 dark:border-white/5 dark:bg-white/[0.01]">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                    SVI Sound &amp; Notification Center
                  </span>
                  <button
                    type="button"
                    onClick={playTestTone}
                    className="text-brand-gold hover:text-brand-gold/80 flex cursor-pointer items-center gap-1 text-[11px] font-semibold transition-colors"
                  >
                    <Play className="h-2.5 w-2.5 fill-current" />
                    <span>Test Tone</span>
                  </button>
                </div>

                <Link
                  href="/admin/notifications"
                  onClick={() => setIsOpen(false)}
                  className="text-brand-gold hover:text-brand-gold/80 flex w-full items-center justify-center gap-1.5 border-t border-gray-100 pt-2 text-center text-xs font-semibold transition-colors dark:border-white/5"
                >
                  <span>View all notifications</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
