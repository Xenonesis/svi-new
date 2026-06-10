'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { MessageCircle, Trash2, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

interface ChatLog {
  id: string;
  session_id: string;
  message_count: number;
  user_message_count: number;
  created_at: string;
  updated_at: string;
  user_agent: string;
  messages: string;
}

interface ChatDetail {
  role: string;
  content?: string;
  parts?: { type: string; text?: string }[];
}

export default function AdminChatLogs() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState<ChatLog | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatDetail[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/admin');
        return;
      }
      setToken(session.access_token);
    });
  }, [router]);

  useEffect(() => {
    if (!token) return;
    fetchLogs();
  }, [token, page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/chat/log?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setLogs(data.logs || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const viewLog = (log: ChatLog) => {
    setSelectedLog(log);
    try {
      const parsed = JSON.parse(log.messages);
      setChatMessages(Array.isArray(parsed) ? parsed : []);
    } catch {
      setChatMessages([]);
    }
  };

  const clearLogs = async () => {
    if (!confirm('Clear all chat logs?')) return;
    try {
      await fetch(`/api/chat/log?all=true`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLogs();
    } catch {
      // Silently handle errors
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-brand-gold/10 flex h-12 w-12 items-center justify-center rounded-xl">
            <MessageCircle className="text-brand-gold h-6 w-6" />
          </div>
          <div>
            <h1 className="text-brand-navy font-serif text-2xl font-bold dark:text-white">
              Chat Logs
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View all chatbot conversations
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchLogs}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold tracking-wider text-gray-600 uppercase transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button
            onClick={clearLogs}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-bold tracking-wider text-red-600 uppercase transition-all hover:bg-red-50 dark:border-red-800 dark:bg-gray-800 dark:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Log List */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="border-brand-gold h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
              </div>
            ) : logs.length === 0 ? (
              <div className="py-16 text-center">
                <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <p className="text-gray-500">No chat logs yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {logs.map((log) => (
                  <button
                    key={log.id}
                    onClick={() => viewLog(log)}
                    className={`flex w-full cursor-pointer items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      selectedLog?.id === log.id ? 'bg-brand-gold/5 dark:bg-brand-gold/5' : ''
                    }`}
                  >
                    <div className="bg-brand-gold/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                      <MessageCircle className="text-brand-gold h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-brand-navy truncate text-sm font-medium dark:text-white">
                        Session: {log.session_id.slice(0, 20)}...
                      </p>
                      <p className="text-xs text-gray-500">
                        {log.message_count} msgs &middot; {log.user_message_count} from user
                        &middot;{' '}
                        {new Date(log.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                  </button>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-5 py-3 dark:border-gray-800">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex cursor-pointer items-center gap-1 text-sm text-gray-500 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex cursor-pointer items-center gap-1 text-sm text-gray-500 disabled:opacity-30"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            {!selectedLog ? (
              <div className="flex flex-col items-center py-20 text-center">
                <MessageCircle className="mb-4 h-12 w-12 text-gray-300" />
                <p className="text-sm text-gray-500">Select a conversation to view details</p>
              </div>
            ) : (
              <div className="flex h-[500px] flex-col">
                <div className="border-b border-gray-100 px-5 py-3 dark:border-gray-800">
                  <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Chat Messages
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {chatMessages.length} messages in this session
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`mb-3 rounded-lg px-3 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-brand-navy ml-4 text-white dark:bg-gray-700'
                          : 'mr-4 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <p className="text-[10px] font-bold tracking-wider uppercase opacity-60">
                        {msg.role === 'user' ? 'User' : 'Assistant'}
                      </p>
                      <p className="mt-0.5 leading-relaxed">
                        {msg.parts
                          ? msg.parts.map((p) => p.text || '').join(' ')
                          : msg.content || ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
