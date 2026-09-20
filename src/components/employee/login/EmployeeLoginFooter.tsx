'use client';

import React from 'react';

export interface EmployeeLoginFooterProps {
  onOpenHelp?: () => void;
  onOpenHelpModal?: () => void;
}

export function EmployeeLoginFooter({
  onOpenHelp,
  onOpenHelpModal,
}: EmployeeLoginFooterProps = {}) {
  const handleOpenHelp = onOpenHelpModal ?? onOpenHelp;

  return (
    <footer className="relative z-10 py-5 text-center text-[11px] text-slate-500">
      <div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-2">
        <p>© {new Date().getFullYear()} SVI Infra Solutions Pvt. Ltd. All rights reserved.</p>
        {handleOpenHelp ? (
          <>
            <span className="hidden text-slate-700 sm:inline">•</span>
            <button
              type="button"
              onClick={handleOpenHelp}
              className="cursor-pointer text-slate-400 transition-colors hover:text-slate-200"
            >
              System Support
            </button>
          </>
        ) : null}
      </div>
    </footer>
  );
}
