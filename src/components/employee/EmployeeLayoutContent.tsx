'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import EmployeeGuard from '@/src/components/employee/EmployeeGuard';
import EmployeeHeader from '@/src/components/employee/EmployeeHeader';
import EmployeeBottomNav from '@/src/components/employee/EmployeeBottomNav';

interface EmployeeLayoutContentProps {
  children: React.ReactNode;
}

export default function EmployeeLayoutContent({ children }: EmployeeLayoutContentProps) {
  const pathname = usePathname();

  // If on the employee login page, completely bypass the outer dashboard frame (header, sidebar & padding)
  if (pathname === '/employee/login') {
    return (
      <EmployeeGuard>
        <div className="min-h-screen w-full">{children}</div>
      </EmployeeGuard>
    );
  }

  return (
    <EmployeeGuard>
      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased transition-colors dark:bg-slate-950 dark:text-slate-100">
        <EmployeeHeader />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 pb-24 sm:px-6 md:pb-12 lg:px-8">
          {children}
        </main>
        <EmployeeBottomNav />
      </div>
    </EmployeeGuard>
  );
}
