import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import { toast } from 'sonner';
import { playNotificationChime } from '@/src/lib/notifications/notificationSound';

export function useEmailRealtime() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { count } = await supabase
        .from('email_inbox')
        .select('*', { count: 'exact', head: true })
        .eq('is_archived', false)
        .eq('is_read', false);
      setUnreadCount(count || 0);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Global Realtime listener for incoming emails across all tabs
  useEffect(() => {
    const channel = supabase
      .channel('email-center-global-inbox-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'email_inbox' }, (payload) => {
        fetchUnreadCount();
        if (payload.eventType === 'INSERT') {
          playNotificationChime();
          toast.info('New incoming email received in Inbox!');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUnreadCount]);

  return { unreadCount, fetchUnreadCount };
}
