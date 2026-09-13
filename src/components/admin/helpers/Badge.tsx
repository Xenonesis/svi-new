'use client';

import { Shield, Users, Briefcase } from 'lucide-react';

export function Badge({ role }: { role: string }) {
  if (role === 'admin') {
    return (
      <span className="bg-brand-gold/10 text-brand-gold border-brand-gold/20 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[9px] font-bold tracking-widest uppercase">
        <Shield className="text-brand-gold h-3 w-3" />
        Admin
      </span>
    );
  }

  if (role === 'employee') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold tracking-widest text-emerald-600 uppercase dark:bg-emerald-500/20 dark:text-emerald-400">
        <Briefcase className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
        Employee
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[9px] font-bold tracking-widest text-blue-600 uppercase dark:bg-blue-500/15 dark:text-blue-400">
      <Users className="h-3 w-3 text-blue-600 dark:text-blue-400" />
      Client
    </span>
  );
}
