import React from 'react';
import EmployeeGuard from '@/src/components/employee/EmployeeGuard';
import EmployeeHeader from '@/src/components/employee/EmployeeHeader';
import EmployeeBottomNav from '@/src/components/employee/EmployeeBottomNav';

export const metadata = {
  title: 'SVI Workspace | Employee Portal',
  description: 'Employee work tracking, site visits, task management, and attendance portal.',
};

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <EmployeeGuard>
      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <EmployeeHeader />
        <main className="mx-auto w-full max-w-lg flex-1 px-4 py-4 pb-24">{children}</main>
        <EmployeeBottomNav />
      </div>
    </EmployeeGuard>
  );
}
