'use client';

import {
  Bell,
  Building2,
  Calculator,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Gift,
  Mail,
  MessageCircle,
  Receipt,
  Settings,
  X,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/src/lib/supabase/client';
import { useState } from 'react';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const documentItems = [
  { name: 'Allotment Letter', path: '/admin/allotment-letter', icon: FileText },
  { name: 'Allotment Records', path: '/admin/allotment-records', icon: ClipboardList },
  { name: 'Payment Receipt', path: '/admin/payment-receipt', icon: Receipt },
  { name: 'Receipt Records', path: '/admin/payment-receipts', icon: ClipboardList },
  { name: 'Payment Plan', path: '/admin/payment-plan', icon: Calculator },
  { name: 'Offer Letter', path: '/admin/offer-letter', icon: FileText },
  { name: 'Offer Letter Records', path: '/admin/offer-letter-records', icon: ClipboardList },
  { name: 'BBA', path: '/admin/bba', icon: FileText },
  { name: 'BBA Records', path: '/admin/bba-records', icon: ClipboardList },
];

const managementItems = [
  { name: 'Registrations', path: '/admin/registrations', icon: ClipboardList },
  { name: 'Attendance', path: '/admin/attendance', icon: CheckSquare },
  { name: 'Properties', path: '/admin/properties', icon: Building2 },
  { name: 'Notifications', path: '/admin/notifications', icon: Bell },
  { name: 'Email Center', path: '/admin/email', icon: Mail },
  { name: 'Lottery Manager', path: '/admin/lottery', icon: Gift },
  { name: 'Chat Logs', path: '/admin/chat-logs', icon: MessageCircle },
];

// ─── Shared sidebar content ────────────────────────────────────────────────────
function SidebarContent({
  collapsed,
  setCollapsed,
  pathname,
  handleLogout,
  isMobile = false,
  onLinkClick,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  pathname: string;
  handleLogout: () => void;
  isMobile?: boolean;
  onLinkClick?: () => void;
}) {
  const labelClass = `text-sm font-medium whitespace-nowrap transition-opacity duration-300 ${
    collapsed && !isMobile ? 'opacity-0' : 'opacity-100'
  }`;

  return (
    <>
      {/* Collapse toggle — desktop only */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="bg-brand-gold text-brand-navy absolute top-6 -right-3 z-50 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      )}

      {/* Logo */}
      <div className="flex h-20 items-center gap-3 overflow-hidden border-b border-gray-100 p-6 whitespace-nowrap dark:border-white/5">
        <div className="bg-brand-gold text-brand-navy flex h-8 w-8 shrink-0 items-center justify-center rounded font-serif text-xl leading-none font-bold">
          S
        </div>
        <motion.div animate={{ opacity: collapsed && !isMobile ? 0 : 1 }} className="flex flex-col">
          <h1 className="text-brand-navy font-serif text-lg leading-tight font-bold dark:text-white">
            SVI Infra
          </h1>
          <p className="text-brand-gold text-[10px] font-bold tracking-widest uppercase">
            Admin Portal
          </p>
        </motion.div>
      </div>

      {/* Nav */}
      <div className="custom-scrollbar flex flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto px-3 py-6">
        {/* Dashboard */}
        <Link
          href="/admin/dashboard"
          onClick={onLinkClick}
          className={`group flex items-center gap-3 overflow-hidden rounded-xl px-3 py-3 transition-all ${
            pathname === '/admin/dashboard'
              ? 'bg-brand-gold/10 text-brand-gold'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
          }`}
          title={collapsed && !isMobile ? 'Dashboard' : ''}
        >
          <div className="relative flex shrink-0 items-center justify-center">
            {pathname === '/admin/dashboard' && (
              <motion.div
                layoutId="active-nav"
                className="bg-brand-gold absolute -left-3 h-8 w-1 rounded-r-full"
              />
            )}
            <LayoutDashboard
              className={`h-5 w-5 ${pathname === '/admin/dashboard' ? 'text-brand-gold' : 'group-hover:text-brand-gold transition-colors'}`}
            />
          </div>
          <span className={labelClass}>Dashboard</span>
        </Link>

        {/* Documents section */}
        <div
          className={`mt-6 mb-2 px-4 pb-0.5 text-[10px] font-bold tracking-[0.15em] whitespace-nowrap text-gray-400 uppercase transition-opacity duration-300 dark:text-gray-500 ${
            collapsed && !isMobile ? 'opacity-0' : 'opacity-100'
          }`}
        >
          Documents
        </div>

        {documentItems.map((item) => {
          const active = pathname === item.path || pathname.startsWith(`${item.path}/`);
          return (
            <Link
              key={item.name}
              href={item.path}
              onClick={onLinkClick}
              className={`group flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 transition-all ${
                active
                  ? 'bg-brand-gold/10 text-brand-gold'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
              }`}
              title={collapsed && !isMobile ? item.name : ''}
            >
              <div className="relative flex shrink-0 items-center justify-center">
                {active && (
                  <motion.div
                    layoutId="active-nav"
                    className="bg-brand-gold absolute -left-3 h-8 w-1 rounded-r-full"
                  />
                )}
                <item.icon
                  className={`h-4.5 w-4.5 ${active ? 'text-brand-gold' : 'group-hover:text-brand-gold transition-colors'}`}
                />
              </div>
              <span className={labelClass}>{item.name}</span>
            </Link>
          );
        })}

        {/* Management section */}
        <div
          className={`mt-6 mb-2 px-4 pb-0.5 text-[10px] font-bold tracking-[0.15em] whitespace-nowrap text-gray-400 uppercase transition-opacity duration-300 dark:text-gray-500 ${
            collapsed && !isMobile ? 'opacity-0' : 'opacity-100'
          }`}
        >
          Management
        </div>

        {managementItems.map((item) => {
          const active = pathname === item.path || pathname.startsWith(`${item.path}/`);
          return (
            <Link
              key={item.name}
              href={item.path}
              onClick={onLinkClick}
              className={`group flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 transition-all ${
                active
                  ? 'bg-brand-gold/10 text-brand-gold'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
              }`}
              title={collapsed && !isMobile ? item.name : ''}
            >
              <div className="relative flex shrink-0 items-center justify-center">
                {active && (
                  <motion.div
                    layoutId="active-nav"
                    className="bg-brand-gold absolute -left-3 h-8 w-1 rounded-r-full"
                  />
                )}
                <item.icon
                  className={`h-4.5 w-4.5 ${active ? 'text-brand-gold' : 'group-hover:text-brand-gold transition-colors'}`}
                />
              </div>
              <span className={labelClass}>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="dark:border-brand-gold/15 overflow-x-hidden border-t border-gray-200 p-3">
        <Link
          href="/admin/settings"
          onClick={onLinkClick}
          className={`group flex items-center gap-3 overflow-hidden rounded-xl px-3 py-3 transition-all ${
            pathname.startsWith('/admin/settings')
              ? 'bg-brand-gold/10 text-brand-gold'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
          }`}
          title={collapsed && !isMobile ? 'Settings' : ''}
        >
          <div className="relative flex shrink-0 items-center justify-center">
            {pathname.startsWith('/admin/settings') && (
              <motion.div
                layoutId="active-nav"
                className="bg-brand-gold absolute -left-3 h-8 w-1 rounded-r-full"
              />
            )}
            <Settings
              className={`h-5 w-5 ${pathname.startsWith('/admin/settings') ? 'text-brand-gold' : 'group-hover:text-brand-gold transition-colors'}`}
            />
          </div>
          <span className={labelClass}>Settings</span>
        </Link>

        <button
          onClick={handleLogout}
          className="group mt-1 flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
          title={collapsed && !isMobile ? 'Logout' : ''}
        >
          <div className="flex shrink-0 items-center justify-center">
            <LogOut className="h-5 w-5 transition-transform group-hover:scale-110" />
          </div>
          <span className={labelClass}>Logout</span>
        </button>
      </div>
    </>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

const AdminSidebar = ({ mobileOpen = false, onMobileClose }: AdminSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/admin');
  };

  return (
    <>
      {/* Desktop sidebar — hidden on mobile */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 224 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="dark:border-brand-gold/15 relative z-40 hidden h-screen flex-col border-r border-gray-200 bg-white/90 backdrop-blur-xl transition-colors duration-300 md:flex dark:bg-[#0e0e14]/90"
      >
        <SidebarContent
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          pathname={pathname}
          handleLogout={handleLogout}
        />
      </motion.aside>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            />

            {/* Drawer */}
            <motion.aside
              key="mobile-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              className="dark:border-brand-gold/15 fixed top-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-gray-200 bg-white/95 backdrop-blur-xl md:hidden dark:bg-[#0e0e14]/95"
            >
              {/* Close button */}
              <button
                onClick={onMobileClose}
                className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>

              <SidebarContent
                collapsed={false}
                setCollapsed={() => {}}
                pathname={pathname}
                handleLogout={handleLogout}
                isMobile
                onLinkClick={onMobileClose}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminSidebar;
