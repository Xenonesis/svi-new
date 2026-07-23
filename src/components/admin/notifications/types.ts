export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  action_url?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export type FilterType = 'all' | 'info' | 'success' | 'warning' | 'error';
export type ReadFilter = 'all' | 'read' | 'unread';
export type SortOption = 'newest' | 'oldest' | 'unread-first';
