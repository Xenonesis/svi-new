'use client';

import React from 'react';
import LeaveAndRegularizationCenter from '@/src/components/admin/attendance/LeaveAndRegularizationCenter';

interface WorkforceApprovalsTabProps {
  token: string;
}

export function WorkforceApprovalsTab({ token }: WorkforceApprovalsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-brand-navy font-serif text-2xl font-bold dark:text-white">
          Approvals &amp; Regularization Center
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Review and action employee leave requests and biometric attendance regularizations.
        </p>
      </div>
      <LeaveAndRegularizationCenter token={token} />
    </div>
  );
}
