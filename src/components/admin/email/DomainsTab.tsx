'use client';

import { useEffect, useState, useCallback } from 'react';
import { ExternalLink, RefreshCw, Loader2, AlertTriangle, Globe } from 'lucide-react';
import { Domain } from './types';
import { getDomainStatusColor, getToken } from './helpers';

export function DomainsTab() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDomains = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/email?action=domains', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch domains');
      setDomains(Array.isArray(data.domains) ? data.domains : []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-[#0e0e14]">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-sans font-semibold text-gray-900 dark:text-white">
              Verified Domains
            </h3>
            <p className="mt-1 font-sans text-sm text-gray-500">
              Domains verified in your Resend account for sending emails.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://resend.com/domains"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 font-sans text-xs font-medium text-gray-600 transition-all hover:border-gray-300 dark:border-gray-600 dark:text-gray-400"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Resend Dashboard
            </a>
            <button
              onClick={fetchDomains}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 font-sans text-xs font-medium text-gray-600 transition-all hover:border-gray-300 dark:border-gray-600 dark:text-gray-400"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 font-sans">
          <Loader2 className="text-brand-gold h-7 w-7 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center font-sans">
          <AlertTriangle className="mb-3 h-8 w-8 text-amber-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
          <button onClick={fetchDomains} className="mt-3 font-sans text-xs text-gray-500 underline">
            Retry
          </button>
        </div>
      ) : domains.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center font-sans dark:border-gray-700">
          <Globe className="mb-3 h-8 w-8 text-gray-300" />
          <p className="font-sans text-sm font-medium text-gray-500">No domains found</p>
          <p className="mt-1 font-sans text-xs text-gray-400">
            Add a domain in your{' '}
            <a
              href="https://resend.com/domains"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-gold underline"
            >
              Resend Dashboard
            </a>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 font-sans sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((domain) => {
            const statusStyle = getDomainStatusColor(domain.status);
            return (
              <div
                key={domain.id}
                className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-[#0e0e14]"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                    <Globe className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <span
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${statusStyle.bg} ${statusStyle.text}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                    {domain.status}
                  </span>
                </div>
                <h4 className="font-sans font-semibold text-gray-900 dark:text-white">
                  {domain.name}
                </h4>
                <p className="mt-0.5 font-sans text-xs text-gray-400">
                  Region: {domain.region || 'us-east-1'}
                </p>
                <p className="mt-0.5 font-sans text-[11px] text-gray-400">
                  Added: {new Date(domain.created_at).toLocaleDateString('en-IN')}
                </p>

                {/* DNS Records */}
                {domain.records && domain.records.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      DNS Records
                    </p>
                    <div className="space-y-2">
                      {domain.records.map((rec, i) => {
                        const recStatus =
                          rec.status === 'verified'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400';
                        return (
                          <div key={i} className="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-800/50">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-gray-500 uppercase">
                                {rec.type} · {rec.record}
                              </span>
                              <span className={`text-[10px] font-bold ${recStatus}`}>
                                {rec.status}
                              </span>
                            </div>
                            <p className="mt-1 font-mono text-[10px] break-all text-gray-500">
                              {rec.value}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
