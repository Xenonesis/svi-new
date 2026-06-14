import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase/client';
import { useAuthStore } from '@/src/stores/authStore';

export function useAllotments() {
  const { profile } = useAuthStore();
  const userId = profile?.id;

  return useQuery({
    queryKey: ['allotments', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('allotments')
        .select(
          `
          id,
          unit_no,
          status,
          allotted_date,
          property_id,
          properties (
            name,
            location,
            image_url
          )
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });
}

export function usePaymentSchedules() {
  const { profile } = useAuthStore();
  const userId = profile?.id;

  return useQuery({
    queryKey: ['payment_schedules', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('payment_schedules')
        .select(
          `
          id,
          title,
          amount,
          due_date,
          status,
          paid_date,
          receipt_url,
          allotments (
            unit_no,
            properties (
              name
            )
          )
        `
        )
        .eq('user_id', userId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });
}

export function useDocuments() {
  const { profile } = useAuthStore();
  const userId = profile?.id;

  return useQuery({
    queryKey: ['documents', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });
}
