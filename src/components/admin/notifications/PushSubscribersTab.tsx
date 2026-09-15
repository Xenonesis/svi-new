'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import { useAuthStore } from '@/src/stores/authStore';
import {
  Bell,
  Smartphone,
  Monitor,
  Send,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

interface SubscriberItem {
  id: string;
  endpoint: string;
  browser: string;
  os: string;
  isMobile: boolean;
  createdAt: string;
}

interface SubscriberStats {
  total: number;
  mobile: number;
  desktop: number;
  recent: number;
}

async function getAuthToken(): Promise<string> {
  const storeToken = useAuthStore.getState().token;
  if (storeToken) return storeToken;

  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) return data.session.access_token;

  if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const hashToken = params.get('access_token');
    if (hashToken) return hashToken;
  }

  return '';
}

export function PushSubscribersTab() {
  const [stats, setStats] = useState<SubscriberStats>({
    total: 0,
    mobile: 0,
    desktop: 0,
    recent: 0,
  });
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Broadcast form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('/projects/current');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    message: string;
    details?: { total: number; sent: number; failed: number; cleaned: number };
  } | null>(null);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();

      const res = await fetch('/api/admin/push/subscribers', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok) {
        const msg =
          typeof data.error === 'object' && data.error?.message
            ? data.error.message
            : typeof data.error === 'string'
              ? data.error
              : 'Failed to fetch subscribers';
        throw new Error(msg);
      }
      setStats(data.stats || { total: 0, mobile: 0, desktop: 0, recent: 0 });
      setSubscribers(data.subscribers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching subscribers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const handleBroadcast = async (testOnly = false) => {
    if (!title.trim() || !body.trim()) {
      setSendResult({
        success: false,
        message: 'Please provide both title and message.',
      });
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      let specificEndpoint: string | undefined;

      if (testOnly && 'serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          specificEndpoint = sub.endpoint;
        } else {
          throw new Error('Your current device is not subscribed to push notifications yet.');
        }
      }

      const token = await getAuthToken();

      const res = await fetch('/api/admin/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title,
          body,
          url,
          endpoint: specificEndpoint,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg =
          typeof data.error === 'object' && data.error?.message
            ? data.error.message
            : typeof data.error === 'string'
              ? data.error
              : 'Failed to send notification';
        throw new Error(msg);
      }

      setSendResult({
        success: true,
        message: testOnly
          ? 'Test notification sent to this device!'
          : data.message || 'Notification broadcasted successfully.',
        details: data.result,
      });

      if (!testOnly) {
        fetchSubscribers();
      }
    } catch (err) {
      setSendResult({
        success: false,
        message: err instanceof Error ? err.message : 'Send failed',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Top Stat Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Total Subscribers
            </span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Bell size={18} />
            </div>
          </div>
          <p className="mt-3 font-serif text-3xl font-bold text-gray-900 dark:text-white">
            {loading ? '...' : stats.total}
          </p>
          <p className="mt-1 text-xs text-gray-400">Registered devices</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Mobile Devices
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Smartphone size={18} />
            </div>
          </div>
          <p className="mt-3 font-serif text-3xl font-bold text-gray-900 dark:text-white">
            {loading ? '...' : stats.mobile}
          </p>
          <p className="mt-1 text-xs text-gray-400">Android & iOS phones</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Desktop Devices
            </span>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <Monitor size={18} />
            </div>
          </div>
          <p className="mt-3 font-serif text-3xl font-bold text-gray-900 dark:text-white">
            {loading ? '...' : stats.desktop}
          </p>
          <p className="mt-1 text-xs text-gray-400">Windows, Mac, Linux</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Last 7 Days
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Clock size={18} />
            </div>
          </div>
          <p className="mt-3 font-serif text-3xl font-bold text-gray-900 dark:text-white">
            {loading ? '...' : stats.recent}
          </p>
          <p className="mt-1 text-xs text-gray-400">New subscribers joined</p>
        </div>
      </div>

      {/* ── Broadcast Form ── */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
              Broadcast Web Push Notification
            </h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Delivered immediately to all subscribed mobile and desktop devices.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
            <ShieldCheck size={13} /> Vercel Safe Chunking
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
              Notification Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. New Project Launch - Shivani Vatika"
              className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 transition-colors focus:border-amber-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
              Message Body
            </label>
            <textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="e.g. 100-yard residential plots now open for booking near Ring Road. Limited units!"
              className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 transition-colors focus:border-amber-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
              Target Click URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/projects/current"
              className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 transition-colors focus:border-amber-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {sendResult && (
            <div
              className={`flex items-start gap-3 rounded-lg p-4 text-xs ${
                sendResult.success
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'border border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300'
              }`}
            >
              {sendResult.success ? (
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              ) : (
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
              )}
              <div>
                <p className="font-semibold">{sendResult.message}</p>
                {sendResult.details && (
                  <p className="mt-1 opacity-80">
                    Delivered: {sendResult.details.sent} · Failed: {sendResult.details.failed} ·
                    Dead tokens pruned: {sendResult.details.cleaned}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => handleBroadcast(false)}
              disabled={sending || loading || stats.total === 0}
              className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-xs font-bold tracking-widest text-white uppercase transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-amber-500"
            >
              <Send size={14} className={sending ? 'animate-pulse' : ''} />
              {sending ? 'Sending...' : `Broadcast to All (${stats.total})`}
            </button>

            <button
              onClick={() => handleBroadcast(true)}
              disabled={sending || loading}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-xs font-bold tracking-widest text-gray-700 uppercase transition-colors hover:border-amber-500 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
            >
              Send Test to This Browser
            </button>
          </div>
        </div>
      </div>

      {/* ── Subscribers List Table ── */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-800">
          <div>
            <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">
              Subscribed Devices
            </h3>
            <p className="text-xs text-gray-400">Live tokens stored in database</p>
          </div>
          <button
            onClick={fetchSubscribers}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {error ? (
          <div className="p-8 text-center text-xs text-red-500">{error}</div>
        ) : loading ? (
          <div className="p-8 text-center text-xs text-gray-400">Loading subscribers...</div>
        ) : subscribers.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="mx-auto mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              No subscribers yet
            </p>
            <p className="mt-1 text-xs text-gray-400">
              When users click &quot;ENABLE&quot; on the website prompt, their devices will appear
              here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                <tr>
                  <th className="px-5 py-3.5">#</th>
                  <th className="px-5 py-3.5">Device & OS</th>
                  <th className="px-5 py-3.5">Browser</th>
                  <th className="px-5 py-3.5">Subscribed Date</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {subscribers.map((item, idx) => (
                  <tr key={item.endpoint} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                    <td className="px-5 py-3.5 text-gray-400">{idx + 1}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        {item.isMobile ? (
                          <Smartphone size={14} className="text-blue-500" />
                        ) : (
                          <Monitor size={14} className="text-purple-500" />
                        )}
                        <span>{item.os}</span>
                        {item.isMobile && (
                          <span className="rounded-sm bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                            Mobile
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">{item.browser}</td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
