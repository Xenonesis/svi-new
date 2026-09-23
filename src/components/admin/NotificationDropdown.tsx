'use client';

import {
  Bell,
  Check,
  CheckSquare,
  Loader2,
  RotateCcw,
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
  Phone,
  MessageCircle,
  Calendar,
  AlertTriangle,
  Receipt,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import type React from 'react';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { supabase } from '@/src/lib/supabase/client';
import { resolveNotificationUrl } from '@/src/lib/notifications/notificationNavigation';
import {
  isNotificationSoundEnabled,
  setNotificationSoundEnabled,
  getNotificationSoundTone,
  setNotificationSoundTone,
  SOUND_OPTIONS,
  type SoundTone,
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

export interface PaymentDueItem {
  id: string;
  customer_name: string;
  plot_number: string;
  amount_due: number;
  due_date: string;
  is_overdue: boolean;
  document_type: 'bba' | 'quotation';
  project_name?: string;
  contact_phone?: string;
  contact_email?: string;
}

type TabType = 'alerts' | 'leads' | 'dues' | 'tasks' | 'sounds';

export default function NotificationDropdown({ userId }: NotificationDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('alerts');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedTone, setSelectedTone] = useState<SoundTone>('chime');
  const [revertingId, setRevertingId] = useState<string | null>(null);
  const [paymentDues, setPaymentDues] = useState<PaymentDueItem[]>([]);
  const [duesLoading, setDuesLoading] = useState(false);
  const [remindedDueIds, setRemindedDueIds] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Close dropdown on click outside or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleRevertAssignment = async (notificationId: string) => {
    setRevertingId(notificationId);
    try {
      const res = await fetch('/api/admin/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'revert',
          notification_id: notificationId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Successfully reverted assignment for ${data.restored_count} leads`);
        fetchNotifications();
      } else {
        toast.error(data.message || 'Failed to revert assignment');
      }
    } catch {
      toast.error('Failed to revert assignment');
    } finally {
      setRevertingId(null);
    }
  };

  // Load sound preference on mount
  useEffect(() => {
    setSoundEnabled(isNotificationSoundEnabled());
    setSelectedTone(getNotificationSoundTone());
  }, []);

  // Fetch notifications and payment dues
  const fetchNotifications = async (showRefreshSpin = false) => {
    if (showRefreshSpin) setIsRefreshing(true);
    try {
      const [notificationsRes, duesRes] = await Promise.all([
        supabase
          .from('notifications')
          .select('id, user_id, title, message, type, is_read, action_url, metadata, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50),
        fetch('/api/admin/dues').then((r) => (r.ok ? r.json() : { paymentDues: [] })),
      ]);

      if (notificationsRes.error) throw notificationsRes.error;

      setNotifications(notificationsRes.data || []);
      setUnreadCount(notificationsRes.data?.filter((n) => !n.is_read).length || 0);
      if (duesRes && Array.isArray(duesRes.paymentDues)) {
        setPaymentDues(duesRes.paymentDues);
      }
    } catch (error) {
      console.error('Error fetching notifications & dues:', error);
    } finally {
      setLoading(false);
      if (showRefreshSpin) {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  };

  const handleDueReminder = (due: PaymentDueItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setRemindedDueIds((prev) => new Set(prev).add(due.id));
    toast.success(`Payment reminder sent to ${due.customer_name}`, {
      description: `Plot ${due.plot_number} • ₹${(due.amount_due / 1000).toFixed(0)}k Due: ${due.due_date}`,
    });
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

  // Handle tone selection
  const handleSelectTone = (tone: SoundTone) => {
    setSelectedTone(tone);
    setNotificationSoundTone(tone);
    playTestTone(tone);
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
  // Lead notifications filter & unread badge
  const isLeadNotification = (n: Notification) => {
    const event = (n.metadata?.event || '').toLowerCase();
    const title = (n.title || '').toLowerCase();
    const msg = (n.message || '').toLowerCase();

    return (
      event.includes('chat') ||
      event.includes('lead') ||
      title.includes('lead') ||
      title.includes('chat') ||
      msg.includes('chatbot') ||
      msg.includes('shared their contact info')
    );
  };

  const leadNotifications = useMemo(
    () => notifications.filter(isLeadNotification),
    [notifications]
  );
  const leadUnreadCount = useMemo(
    () => leadNotifications.filter((n) => !n.is_read).length,
    [leadNotifications]
  );

  const overdueDuesCount = useMemo(
    () => paymentDues.filter((d) => d.is_overdue).length,
    [paymentDues]
  );
  // Extract phone & name for 1-click Call / WhatsApp actions
  const extractLeadContact = (message: string) => {
    if (!message) return null;
    const phoneMatch = message.match(/\(?(\+?91[\-\s]?)?([6-9]\d{9})\)?/);
    if (!phoneMatch) return null;

    const rawDigits = phoneMatch[2];
    const displayPhone = phoneMatch[1]
      ? `${phoneMatch[1].trim()} ${rawDigits}`
      : `+91 ${rawDigits}`;
    const waPhone = `91${rawDigits}`;

    const nameMatch = message.match(/^([A-Za-z\s]{2,30})\s*\(/);
    const name = nameMatch ? nameMatch[1].trim() : undefined;

    return { name, phone: displayPhone, waPhone };
  };

  // Convert raw hashes e.g. "registration 4cfe6cbf..." to clean ticket format "#REG-4CFE"
  const formatNotificationMessage = (message: string) => {
    if (!message) return '';
    return message.replace(
      /registration\s+([0-9a-fA-F]{4})[0-9a-fA-F\-]+(\.{3})?/gi,
      'registration #REG-$1'
    );
  };

  const displayedNotifications = useMemo(() => {
    if (activeTab === 'leads') {
      return leadNotifications;
    }
    if (activeTab === 'tasks') {
      return taskNotifications;
    }
    return notifications;
  }, [activeTab, notifications, leadNotifications, taskNotifications]);

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
    <div className="relative" ref={dropdownRef}>
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
              className="dark:border-brand-gold/20 fixed top-[4.5rem] right-2 left-2 z-50 mt-0 w-auto overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl backdrop-blur-xl sm:absolute sm:top-full sm:right-0 sm:left-auto sm:mt-3 sm:w-[28.5rem] sm:max-w-[calc(100vw-2rem)] dark:bg-[#070b14]"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-3 dark:border-white/5">
                <div className="flex min-w-0 shrink-0 items-center gap-2.5">
                  <div className="border-brand-gold/20 bg-brand-gold/10 text-brand-gold flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex min-w-0 items-center gap-2">
                    <h3 className="text-sm font-semibold whitespace-nowrap text-gray-900 dark:text-white">
                      Notifications &amp; Alerts
                    </h3>
                    {unreadCount > 0 && (
                      <span className="border-brand-gold/30 bg-brand-gold/15 text-brand-gold inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-bold whitespace-nowrap">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleSoundSetting}
                    className="hover:border-brand-gold/40 hover:text-brand-gold dark:hover:border-brand-gold/40 dark:hover:text-brand-gold flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5"
                    title={soundEnabled ? 'Mute alert chime' : 'Enable alert chime'}
                    aria-label={soundEnabled ? 'Mute alert chime' : 'Enable alert chime'}
                  >
                    {soundEnabled ? (
                      <Volume2 className="text-brand-gold h-3.5 w-3.5" />
                    ) : (
                      <VolumeX className="h-3.5 w-3.5 text-gray-400" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => fetchNotifications(true)}
                    className="hover:border-brand-gold/40 hover:text-brand-gold dark:hover:border-brand-gold/40 dark:hover:text-brand-gold flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5"
                    title="Refresh notifications"
                    aria-label="Refresh notifications"
                  >
                    <RefreshCw
                      className={`text-brand-gold h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                    />
                  </button>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold hover:border-brand-gold/50 hover:bg-brand-gold/20 inline-flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-lg border px-2.5 text-xs font-semibold whitespace-nowrap transition-colors"
                      title="Mark all notifications as read"
                    >
                      <Check className="h-3 w-3" />
                      <span>Mark read</span>
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
                      ? 'bg-white text-gray-900 shadow-xs dark:bg-white/10 dark:text-white dark:shadow-none'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <Bell className="h-3.5 w-3.5" />
                  <span>Alerts</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('leads')}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                    activeTab === 'leads'
                      ? 'bg-white text-gray-900 shadow-xs dark:bg-white/10 dark:text-white dark:shadow-none'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Leads</span>
                  {leadUnreadCount > 0 && (
                    <span className="bg-brand-gold flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-slate-900">
                      {leadUnreadCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('dues')}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                    activeTab === 'dues'
                      ? 'bg-white text-gray-900 shadow-xs dark:bg-white/10 dark:text-white dark:shadow-none'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Dues</span>
                  {overdueDuesCount > 0 ? (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-xs">
                      {overdueDuesCount}
                    </span>
                  ) : paymentDues.length > 0 ? (
                    <span className="bg-brand-gold/20 text-brand-gold flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold">
                      {paymentDues.length}
                    </span>
                  ) : null}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('tasks')}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                    activeTab === 'tasks'
                      ? 'bg-white text-gray-900 shadow-xs dark:bg-white/10 dark:text-white dark:shadow-none'
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
                      ? 'bg-white text-gray-900 shadow-xs dark:bg-white/10 dark:text-white dark:shadow-none'
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
              <div className="hover:[&::-webkit-scrollbar-thumb]:bg-brand-gold/40 max-h-[27rem] scrollbar-thin [scrollbar-color:rgba(212,175,55,0.25)_transparent] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent">
                {activeTab === 'dues' ? (
                  /* Payment Dues Radar View matching dashboard page */
                  <div className="space-y-2.5 p-3.5">
                    <div className="flex items-center justify-between px-1 pb-1">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-1.5 text-rose-400">
                          <Calendar className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-gray-900 dark:text-white">
                            Payment Dues Radar
                          </h4>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            Upcoming client installments
                          </p>
                        </div>
                      </div>
                      {overdueDuesCount > 0 && (
                        <span className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400">
                          {overdueDuesCount} Overdue
                        </span>
                      )}
                    </div>

                    {paymentDues.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                          <Check className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          No pending client dues
                        </p>
                        <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
                          All client installments are up to date!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {paymentDues.map((due) => {
                          const isReminded = remindedDueIds.has(due.id);
                          return (
                            <div
                              key={due.id}
                              onClick={() => {
                                setIsOpen(false);
                                router.push('/admin/payment-receipt');
                              }}
                              className={`group hover:border-brand-gold/30 flex cursor-pointer items-center justify-between rounded-xl border p-3 text-xs transition-all ${
                                due.is_overdue
                                  ? 'border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10'
                                  : 'border-gray-200/80 bg-gray-50/50 hover:bg-gray-100/60 dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]'
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-white">
                                  <span className="truncate">{due.customer_name}</span>
                                  {due.is_overdue && (
                                    <span className="flex shrink-0 items-center gap-0.5 rounded px-1 text-[10px] font-semibold text-rose-500 dark:text-rose-400">
                                      <AlertTriangle className="h-3 w-3" /> Overdue
                                    </span>
                                  )}
                                </div>
                                <div className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                                  Plot {due.plot_number} • Due: {due.due_date}
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-2">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  ₹{(due.amount_due / 1000).toFixed(0)}k
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => handleDueReminder(due, e)}
                                  className={`rounded-lg border p-1.5 transition-colors ${
                                    isReminded
                                      ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-500 dark:text-emerald-400'
                                      : 'hover:border-brand-gold/40 hover:text-brand-gold border-gray-300 bg-white text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300'
                                  }`}
                                  title={isReminded ? 'Reminder Sent' : 'Send Reminder'}
                                  aria-label={`Send reminder to ${due.customer_name}`}
                                >
                                  {isReminded ? (
                                    <Check className="h-3.5 w-3.5" />
                                  ) : (
                                    <Bell className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : activeTab === 'sounds' ? (
                  <div className="space-y-3.5 p-4">
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

                    {/* Tone Selection Cards */}
                    <div>
                      <div className="mb-2 flex items-center justify-between px-0.5">
                        <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200">
                          Select Notification Tone
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                          6 Luxury Styles
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {SOUND_OPTIONS.map((option) => {
                          const isSelected = selectedTone === option.id;
                          return (
                            <div
                              key={option.id}
                              onClick={() => handleSelectTone(option.id)}
                              className={`group flex cursor-pointer items-center justify-between rounded-xl border p-2.5 transition-all ${
                                isSelected
                                  ? 'border-brand-gold/60 bg-brand-gold/[0.07] dark:border-brand-gold/50 dark:bg-brand-gold/[0.08] shadow-xs'
                                  : 'border-gray-100 bg-white/60 hover:border-gray-200 hover:bg-gray-50 dark:border-white/5 dark:bg-white/[0.01] dark:hover:border-white/10 dark:hover:bg-white/[0.03]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${
                                    isSelected
                                      ? 'border-brand-gold bg-brand-gold'
                                      : 'border-gray-300 group-hover:border-gray-400 dark:border-gray-600'
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="h-1.5 w-1.5 rounded-full bg-gray-950" />
                                  )}
                                </div>

                                <div className="text-left">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`text-xs ${
                                        isSelected
                                          ? 'text-brand-gold font-bold'
                                          : 'font-medium text-gray-800 dark:text-gray-200'
                                      }`}
                                    >
                                      {option.name}
                                    </span>
                                    <span
                                      className={`rounded px-1.5 py-0.5 text-[9px] font-medium tracking-wide ${
                                        isSelected
                                          ? 'bg-brand-gold/20 text-brand-gold'
                                          : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400'
                                      }`}
                                    >
                                      {option.badge}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                    {option.description}
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectTone(option.id);
                                }}
                                title={`Play ${option.name}`}
                                aria-label={`Play ${option.name}`}
                                className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border transition-colors ${
                                  isSelected
                                    ? 'border-brand-gold/40 bg-brand-gold/20 text-brand-gold hover:bg-brand-gold/30'
                                    : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:border-white/10 dark:text-gray-400 dark:hover:border-white/20 dark:hover:text-white'
                                }`}
                              >
                                <Play className="ml-0.5 h-3 w-3 fill-current" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-center dark:border-white/5 dark:bg-white/[0.01]">
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Synthesized gentle corporate bell tone via Web Audio API. Zero external file
                        lag.
                      </p>
                      <button
                        type="button"
                        onClick={() => playTestTone(selectedTone)}
                        className="bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold mt-2.5 inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors"
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
                      const isLead = isLeadNotification(notification);
                      const leadContact = isLead ? extractLeadContact(notification.message) : null;
                      const formattedMsg = formatNotificationMessage(notification.message);

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
                          className={`group relative cursor-pointer px-4 py-3.5 transition-all ${
                            isEmail
                              ? !notification.is_read
                                ? 'border-brand-gold bg-brand-gold/10 hover:bg-brand-gold/15 dark:bg-brand-gold/15 border-l-2'
                                : 'border-l-2 border-transparent hover:bg-gray-50/80 dark:hover:bg-white/[0.03]'
                              : !notification.is_read
                                ? 'border-brand-gold bg-brand-gold/[0.06] hover:bg-brand-gold/[0.12] dark:bg-brand-gold/[0.08] border-l-2'
                                : 'border-l-2 border-transparent hover:bg-gray-50/80 dark:hover:bg-white/[0.03]'
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
                                  {!notification.is_read && (
                                    <span
                                      className="bg-brand-gold ring-brand-gold/20 h-2 w-2 flex-shrink-0 rounded-full shadow-[0_0_8px_rgba(212,175,55,0.7)] ring-2"
                                      title="Unread"
                                      aria-label="Unread"
                                    />
                                  )}
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
                                {formattedMsg}
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
                              {notification.metadata?.action_type === 'bulk_reassign' && (
                                <div
                                  className="mt-2"
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => e.stopPropagation()}
                                >
                                  {notification.metadata?.reverted ? (
                                    <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase dark:bg-emerald-500/10 dark:text-emerald-400">
                                      <Check className="h-3 w-3" /> Reverted
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={revertingId === notification.id}
                                      onClick={() => handleRevertAssignment(notification.id)}
                                      className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase transition-colors hover:bg-amber-100 hover:text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20"
                                      title="Revert leads back to previous advisors"
                                    >
                                      {revertingId === notification.id ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <RotateCcw className="h-3 w-3" />
                                      )}
                                      <span>Revert Assignment</span>
                                    </button>
                                  )}
                                </div>
                              )}
                              {leadContact && (
                                <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-2 dark:border-white/5">
                                  <a
                                    href={`tel:${leadContact.phone.replace(/\s+/g, '')}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-400"
                                    title={`Call ${leadContact.phone}`}
                                  >
                                    <Phone className="h-3 w-3" />
                                    <span>Call {leadContact.phone}</span>
                                  </a>
                                  <a
                                    href={`https://wa.me/${leadContact.waPhone}?text=${encodeURIComponent(
                                      `Namaste ${leadContact.name || ''}, thank you for contacting SVI Infra Solutions. How may we assist you today?`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#25D366]/20 bg-[#25D366]/10 px-2.5 py-1 text-[11px] font-semibold text-[#128C7E] transition-colors hover:bg-[#25D366]/20 dark:text-[#25D366]"
                                    title={`Chat on WhatsApp with ${leadContact.phone}`}
                                  >
                                    <MessageCircle className="h-3 w-3" />
                                    <span>WhatsApp</span>
                                  </a>
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
                    onClick={() => playTestTone(selectedTone)}
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
