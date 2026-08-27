'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function EmployeesRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'directory');
    router.replace(`/admin/workforce?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Loader2 className="text-brand-gold h-8 w-8 animate-spin" />
      <p className="text-xs font-medium text-slate-400">Redirecting to Workforce Directory...</p>
    </div>
  );
}

export default function EmployeesRedirect() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
          <Loader2 className="text-brand-gold h-8 w-8 animate-spin" />
          <p className="text-xs font-medium text-slate-400">
            Redirecting to Workforce Directory...
          </p>
        </div>
      }
    >
      <EmployeesRedirectContent />
    </Suspense>
  );
}
