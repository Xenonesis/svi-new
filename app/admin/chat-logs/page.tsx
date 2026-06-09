'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  MessageCircle,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Bot,
  User,
} from 'lucide-react';
import { useAdminSession } from '@/src/components/admin/AdminSessionProvider';

interface ChatLog {
  id: string;
  session_id: string;
  messages: string;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ChatLogsPage() {
  const { token, loading: authLoading } = useAdminSession();
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchLogs = useCallback(
    async (page: number) => {
      if (!token) return;
      setLoading(true);
      setError('');

      try {
        const params = new URLSearchParams({ page: String(page), limit: '20' });
        const res = await fetch(`/api/chat/log?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch');

        const data = await res.json();
        setLogs(data.logs);
        setPagination(data.pagination);
      } catch {
        setError('Failed to load chat logs');
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (token && mounted) fetchLogs(1);
  }, [token, mounted, fetchLogs]);

  // Filter logs by search
  const filteredLogs = search.trim()
    ? logs.filter((log) => {
        const msgs = JSON.parse(log.messages || '[]');
        return msgs.some((m: any) =>
          m.parts?.some((p: any) => p.text?.toLowerCase().includes(search.toLowerCase()))
        );
      })
    : logs;

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chat Logs</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View conversations from the AI chatbot
          </p>
        </div>

        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="focus:border-brand-gold focus:ring-brand-gold/20 w-full rounded-lg border border-gray-200 bg-white py-2 pr-4 pl-10 text-sm outline-none focus:ring-2 sm:w-72 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs font-medium text-gray-500 uppercase">Total Conversations</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {pagination.total}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs font-medium text-gray-500 uppercase">This Page</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{logs.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs font-medium text-gray-500 uppercase">Page</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {pagination.page} / {pagination.totalPages || 1}
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="border-brand-gold h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filteredLogs.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
            <MessageCircle className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">
            {search ? 'No conversations match your search.' : 'No chat logs yet.'}
          </p>
        </div>
      )}

      {/* Log List */}
      {!loading && !error && filteredLogs.length > 0 && (
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            let msgs: any[] = [];
            try {
              msgs = JSON.parse(log.messages || '[]');
            } catch {
              msgs = [];
            }

            const lastMsg = msgs.filter((m: any) => m.role === 'assistant').slice(-1)[0];
            const preview = lastMsg?.parts?.[0]?.text?.slice(0, 120) || '(empty)';
            const userMsgs = msgs.filter((m: any) => m.role === 'user').length;
            const assistantMsgs = msgs.filter((m: any) => m.role === 'assistant').length;
            const totalMsgs = userMsgs + assistantMsgs;

            const isSelected = selectedLog === log.id;

            return (
              <div
                key={log.id}
                className={`cursor-pointer rounded-xl border bg-white p-4 transition-all dark:bg-gray-800 ${
                  isSelected
                    ? 'border-brand-gold shadow-md'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                }`}
                onClick={() => setSelectedLog(isSelected ? null : log.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-brand-gold/10 rounded-full p-2">
                      <MessageCircle className="text-brand-gold h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Session {log.session_id.slice(0, 8)}...
                      </p>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(log.updated_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span>{totalMsgs} messages</span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {userMsgs}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bot className="h-3 w-3" />
                          {assistantMsgs}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500">{preview}</p>

                {/* Expanded messages */}
                {isSelected && (
                  <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 dark:border-gray-700">
                    {msgs.map((m: any, i: number) => (
                      <div
                        key={i}
                        className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                            m.role === 'user'
                              ? 'bg-brand-navy text-white'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {m.parts?.map((p: any, j: number) =>
                            p.type === 'text' ? <span key={j}>{p.text}</span> : null
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => fetchLogs(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <span className="px-4 text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            onClick={() => fetchLogs(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
