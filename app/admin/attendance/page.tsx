'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function AttendanceRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const rawTab = searchParams.get('tab');
    let targetTab = 'attendance';
    if (rawTab === 'report' || rawTab === 'reports') {
      targetTab = 'reports';
    } else if (rawTab === 'approvals') {
      targetTab = 'approvals';
    } else if (rawTab === 'settings') {
      targetTab = 'settings';
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', targetTab);
    router.replace(`/admin/workforce?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Loader2 className="text-brand-gold h-8 w-8 animate-spin" />
      <p className="text-xs font-medium text-slate-400">Redirecting to Workforce Attendance...</p>
    </div>
  );
}

export default function AttendanceRedirect() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
          <Loader2 className="text-brand-gold h-8 w-8 animate-spin" />
          <p className="text-xs font-medium text-slate-400">
            Redirecting to Workforce Attendance...
          </p>
        </div>
      }
    >
      <AttendanceRedirectContent />
    </Suspense>
  );
}
