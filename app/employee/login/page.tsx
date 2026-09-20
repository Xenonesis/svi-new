'use client';

import React from 'react';
import { useEmployeeLoginForm } from '@/src/components/employee/login/useEmployeeLoginForm';
import { EmployeeLoginHelpModal } from '@/src/components/employee/login/EmployeeLoginHelpModal';
import { EmployeeLoginHeader } from '@/src/components/employee/login/EmployeeLoginHeader';
import { EmployeeLoginForm } from '@/src/components/employee/login/EmployeeLoginForm';
import { EmployeeLoginFooter } from '@/src/components/employee/login/EmployeeLoginFooter';

export default function EmployeeLogin() {
  const form = useEmployeeLoginForm();

  return (
    <div className="relative flex min-h-[100dvh] flex-col justify-between bg-[#080b11] pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] text-slate-100 antialiased">
      {/* Background Subtle Gradient & Micro-Grid */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.06)_0%,rgba(8,11,17,0)_70%)]" />
        <div className="absolute right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.6)_0%,rgba(8,11,17,0)_70%)]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <EmployeeLoginHeader onOpenHelp={() => form.setShowHelpModal(true)} />

      <main className="relative z-10 mx-auto flex w-full max-w-[440px] flex-1 items-center justify-center px-4 py-8">
        <EmployeeLoginForm {...form} onOpenHelp={() => form.setShowHelpModal(true)} />
      </main>

      <EmployeeLoginFooter onOpenHelp={() => form.setShowHelpModal(true)} />

      <EmployeeLoginHelpModal
        isOpen={form.showHelpModal}
        onClose={() => form.setShowHelpModal(false)}
      />
    </div>
  );
}
