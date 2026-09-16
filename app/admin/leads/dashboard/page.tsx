'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/src/stores/authStore';
import { TelecallingDashboard } from '@/src/components/admin/leads/TelecallingDashboard';
import { ArrowLeft, PhoneCall } from 'lucide-react';

export default function TelecallingDashboardPage() {
  const router = useRouter();
  const { token, isAdmin, loading: authLoading } = useAuthStore();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/login');
    }
  }, [isAdmin, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-t-brand-gold h-8 w-8 animate-spin rounded-full border-2 border-gray-200" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      {/* Breadcrumb / Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/leads?tab=ivr"
          className="hover:text-brand-navy dark:hover:text-brand-gold inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-[#13131c] dark:text-gray-300 dark:hover:bg-white/5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to IVR Leads Hub</span>
        </Link>

        <Link
          href="/admin/leads?tab=ivr"
          className="text-brand-gold inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
        >
          <PhoneCall className="h-3.5 w-3.5" />
          <span>View Detailed Call Records &rarr;</span>
        </Link>
      </div>

      {/* Full Telecalling Command Center Dashboard */}
      <TelecallingDashboard
        token={token || undefined}
        onNavigateToLeads={(advisorId) => {
          if (advisorId) {
            router.push(`/admin/leads?tab=ivr&advisor_id=${advisorId}`);
          } else {
            router.push('/admin/leads?tab=ivr');
          }
        }}
      />
    </div>
  );
}
