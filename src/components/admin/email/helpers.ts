import { supabase } from '@/src/lib/supabase/client';

export async function getToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || '';
}

export function formatTime(dateString: string): string {
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

export function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-500/15',
        text: 'text-emerald-700 dark:text-emerald-400',
      };
    case 'sent':
      return { bg: 'bg-blue-100 dark:bg-blue-500/15', text: 'text-blue-700 dark:text-blue-400' };
    case 'opened':
      return {
        bg: 'bg-violet-100 dark:bg-violet-500/15',
        text: 'text-violet-700 dark:text-violet-400',
      };
    case 'clicked':
      return {
        bg: 'bg-indigo-100 dark:bg-indigo-500/15',
        text: 'text-indigo-700 dark:text-indigo-400',
      };
    case 'bounced':
    case 'failed':
      return { bg: 'bg-red-100 dark:bg-red-500/15', text: 'text-red-700 dark:text-red-400' };
    case 'complained':
      return {
        bg: 'bg-amber-100 dark:bg-amber-500/15',
        text: 'text-amber-700 dark:text-amber-400',
      };
    default:
      return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400' };
  }
}

export function getDomainStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'verified':
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-500/15',
        text: 'text-emerald-700 dark:text-emerald-400',
        dot: 'bg-emerald-500',
      };
    case 'pending':
      return {
        bg: 'bg-amber-100 dark:bg-amber-500/15',
        text: 'text-amber-700 dark:text-amber-400',
        dot: 'bg-amber-500',
      };
    case 'failed':
      return {
        bg: 'bg-red-100 dark:bg-red-500/15',
        text: 'text-red-700 dark:text-red-400',
        dot: 'bg-red-500',
      };
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-600 dark:text-gray-400',
        dot: 'bg-gray-400',
      };
  }
}
