import React from 'react';
import EmployeeLayoutContent from '@/src/components/employee/EmployeeLayoutContent';

export const metadata = {
  title: 'SVI Workspace | Employee Portal',
  description: 'Employee work tracking, site visits, task management, and attendance portal.',
};

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return <EmployeeLayoutContent>{children}</EmployeeLayoutContent>;
}
