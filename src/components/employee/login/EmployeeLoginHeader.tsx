'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, HelpCircle } from 'lucide-react';

export interface EmployeeLoginHeaderProps {
  onOpenHelp?: () => void;
  onOpenHelpModal?: () => void;
}

export function EmployeeLoginHeader({ onOpenHelp, onOpenHelpModal }: EmployeeLoginHeaderProps) {
  const handleOpenHelp = onOpenHelpModal ?? onOpenHelp;

  return (
    <header className="relative z-20 flex items-center justify-between px-5 py-5 sm:px-10">
      <Link
        href="/"
        className="group inline-flex items-center gap-2 text-xs font-medium text-slate-400 transition-colors hover:text-slate-200"
      >
        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
        <span>Back to Website</span>
      </Link>

      <button
        onClick={handleOpenHelp}
        type="button"
        className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-slate-200"
      >
        <HelpCircle size={14} />
        <span>Support &amp; Access</span>
      </button>
    </header>
  );
}
