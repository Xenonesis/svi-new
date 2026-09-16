'use client';

import React from 'react';
import { motion } from 'motion/react';
import { useAdminLogin } from '@/src/components/admin/login/useAdminLogin';
import { AdminLoginBackground } from '@/src/components/admin/login/AdminLoginBackground';
import { AdminLoginHeader } from '@/src/components/admin/login/AdminLoginHeader';
import { AdminLoginForm } from '@/src/components/admin/login/AdminLoginForm';

export default function AdminLogin() {
  const loginState = useAdminLogin();

  return (
    <div className="dark:bg-brand-dark-bg relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 p-4 font-sans transition-colors duration-300">
      <AdminLoginBackground />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={loginState.shake ? { x: [0, -8, 8, -6, 6, -4, 4, 0], y: 0 } : { opacity: 1, y: 0 }}
        transition={
          loginState.shake ? { duration: 0.5 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        }
        onAnimationComplete={() => loginState.setShake(false)}
        className="relative z-10 w-full max-w-md"
      >
        <div className="dark:border-brand-gold/15 dark:bg-brand-dark-surface/75 relative overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-10 shadow-2xl backdrop-blur-xl transition-colors duration-300">
          <div className="via-brand-gold/60 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />
          <AdminLoginHeader />
          <AdminLoginForm {...loginState} />
        </div>
      </motion.div>
    </div>
  );
}
