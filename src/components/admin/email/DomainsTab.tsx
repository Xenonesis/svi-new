'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  ExternalLink,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Globe,
  Shield,
  Check,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { Domain } from './types';
import { getDomainStatusColor, getToken } from './helpers';

export function DomainsTab() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedDns, setCopiedDns] = useState<string | null>(null);

  const copyDnsValue = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedDns(value);
    toast.success('DNS value copied');
    setTimeout(() => setCopiedDns(null), 2000);
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200/80 bg-white px-6 py-4 dark:border-gray-700/60 dark:bg-[#0e0e14]">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Verified Domains</h3>
          <p className="mt-0.5 font-mono text-[10px] tracking-wider text-gray-400 uppercase">
            {process.env.NODE_ENV === 'development' &&
            process.env.NEXT_PUBLIC_SHOW_RESEND !== 'false'
              ? 'resend · verified sending domains'
              : 'verified sending domains'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {process.env.NODE_ENV === 'development' &&
            process.env.NEXT_PUBLIC_SHOW_RESEND !== 'false' && (
              <a
                href="https://resend.com/domains"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:border-gray-300 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Resend
              </a>
            )}
          <button
            onClick={fetchDomains}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-white/5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="text-brand-gold h-6 w-6 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle className="mb-3 h-7 w-7 text-amber-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
          <button onClick={fetchDomains} className="text-brand-gold mt-3 text-xs underline">
            Retry
          </button>
        </div>
      ) : domains.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center dark:border-gray-800">
          <Globe className="mx-auto mb-3 h-8 w-8 text-gray-300 dark:text-gray-700" />
          <p className="text-sm font-medium text-gray-500">No domains found</p>
          <p className="mt-1 text-xs text-gray-400">
            {process.env.NODE_ENV === 'development' &&
            process.env.NEXT_PUBLIC_SHOW_RESEND !== 'false' ? (
              <>
                Add a domain in your{' '}
                <a
                  href="https://resend.com/domains"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-gold underline"
                >
                  Resend Dashboard
                </a>
              </>
            ) : (
              'Contact your system administrator to add a domain.'
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((domain, i) => {
            const statusStyle = getDomainStatusColor(domain.status);
            return (
              <motion.div
                key={domain.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className="rounded-xl border border-gray-200/80 bg-white p-5 dark:border-gray-700/60 dark:bg-[#0e0e14]"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                    <Shield className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${statusStyle.bg} ${statusStyle.text}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                    {domain.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{domain.name}</h4>
                <div className="mt-1 flex items-center gap-3 font-mono text-[10px] text-gray-400">
                  <span>{domain.region || 'us-east-1'}</span>
                  <span>{new Date(domain.created_at).toLocaleDateString('en-IN')}</span>
                </div>

                {/* DNS Records */}
                {domain.records && domain.records.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="font-mono text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                      DNS Records
                    </p>
                    {domain.records.map((rec, ri) => (
                      <div
                        key={ri}
                        className="rounded-lg border border-gray-100 bg-gray-50/80 p-3 dark:border-gray-800 dark:bg-gray-800/30"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-semibold text-gray-500 uppercase">
                            {rec.type} · {rec.record}
                          </span>
                          <span
                            className={`font-mono text-[10px] font-bold ${
                              rec.status === 'verified'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-start gap-2">
                          <p className="min-w-0 flex-1 font-mono text-[10px] break-all text-gray-500 dark:text-gray-400">
                            {rec.value}
                          </p>
                          <button
                            onClick={() => copyDnsValue(rec.value)}
                            aria-label="Copy DNS value"
                            className="shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                          >
                            {copiedDns === rec.value ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
