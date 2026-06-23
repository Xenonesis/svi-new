'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Trash2,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '@/src/lib/supabase/client';

interface SiteVisitLead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  project_interest: string | null;
  preferred_date: string | null;
  source: string;
  created_at: string;
}

export default function SiteVisitsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [token, setToken] = useState('');

  // Get token
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setToken(session.access_token);
    });
  }, []);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['siteVisits', token, page],
    queryFn: async () => {
      const res = await fetch(`/api/site-visit?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/site-visit?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteVisits'] });
    },
  });

  const leads: SiteVisitLead[] = data?.leads || [];
  const total = data?.total || 0;
  const hasMore = data?.hasMore || false;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-brand-gold/10 flex h-12 w-12 items-center justify-center rounded-xl">
            <Calendar className="text-brand-gold h-6 w-6" />
          </div>
          <div>
            <h1 className="text-brand-navy font-serif text-2xl font-bold dark:text-white">
              Site Visits
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {total} booking{total !== 1 ? 's' : ''} received
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold tracking-wider text-gray-600 uppercase transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="border-brand-gold h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      ) : leads.length === 0 ? (
        <div className="py-16 text-center">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No site visit bookings yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leads.map((lead, i) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="dark:border-brand-gold/15 dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-lg"
            >
              <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="text-brand-navy font-serif text-lg font-semibold dark:text-white">
                    {lead.name}
                  </h3>
                  {lead.project_interest && (
                    <span className="bg-brand-gold/10 text-brand-gold mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                      {lead.project_interest}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => deleteMutation.mutate(lead.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  <a href={`tel:${lead.phone}`} className="hover:text-brand-gold transition-colors">
                    {lead.phone}
                  </a>
                </div>
                {lead.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    <a
                      href={`mailto:${lead.email}`}
                      className="hover:text-brand-gold truncate transition-colors"
                    >
                      {lead.email}
                    </a>
                  </div>
                )}
                {lead.preferred_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    Visit:{' '}
                    {new Date(lead.preferred_date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                )}
              </div>

              <div className="mt-4 border-t border-gray-100 pt-3 dark:border-white/5">
                <p className="text-[10px] font-medium tracking-wider text-gray-400 uppercase">
                  Submitted{' '}
                  {new Date(lead.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
