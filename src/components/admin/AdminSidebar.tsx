'use client';

import {
  Bell,
  Briefcase,
  Building2,
  Calculator,
  Calendar,
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
  ReceiptText,
  Settings,
  X,
  Users,
  Phone,
  Sparkles,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/src/lib/supabase/client';
import { useUIStore } from '@/src/stores/uiStore';
interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const documentItems = [
  { name: 'Allotment Letter', path: '/admin/allotment-letter', icon: FileText },
  { name: 'Allotment Records', path: '/admin/allotment-records', icon: ClipboardList },
  { name: 'Quotation', path: '/admin/quotation', icon: ReceiptText },
  { name: 'Quotation Records', path: '/admin/quotation-records', icon: ClipboardList },
  { name: 'Payment Receipt', path: '/admin/payment-receipt', icon: Receipt },
  { name: 'Receipt Records', path: '/admin/payment-receipts', icon: ClipboardList },
  { name: 'Payment Plan', path: '/admin/payment-plan', icon: Calculator },
  { name: 'Offer Letter', path: '/admin/offer-letter', icon: FileText },
  { name: 'Offer Letter Records', path: '/admin/offer-letter-records', icon: ClipboardList },
  { name: 'BBA', path: '/admin/bba', icon: FileText },
  { name: 'BBA Records', path: '/admin/bba-records', icon: ClipboardList },
];

const managementItems = [
  { name: 'Portal Allotments', path: '/admin/portal-allotments', icon: Building2 },
  { name: 'Registrations', path: '/admin/registrations', icon: ClipboardList },
  { name: 'Site Visits', path: '/admin/site-visits', icon: Calendar },
  { name: 'Workforce & HR', path: '/admin/workforce', icon: Users },
  { name: 'Properties', path: '/admin/properties', icon: Building2 },
  { name: 'Careers', path: '/admin/careers', icon: Briefcase },
  { name: 'Notifications', path: '/admin/notifications', icon: Bell },
  { name: 'Email Center', path: '/admin/email', icon: Mail },
  { name: 'WhatsApp Inbox', path: '/admin/whatsapp', icon: MessageCircle },
  { name: 'Lottery Manager', path: '/admin/lottery', icon: Gift },
  { name: 'Chat Logs', path: '/admin/chat-logs', icon: MessageCircle },
  { name: 'IVR Call Logs', path: '/admin/ivr', icon: Phone },
  { name: 'System Updates', path: '/admin/updates', icon: Sparkles },
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
  const labelClass = `text-sm font-medium whitespace-nowrap transition-all duration-300 overflow-hidden ${
    collapsed && !isMobile ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'
  }`;

  const getLinkClass = (active: boolean) =>
    `group relative flex items-center rounded-xl py-2.5 transition-all ${
      collapsed && !isMobile ? 'justify-center px-0 gap-0' : 'gap-3 px-3'
    } ${
      active
        ? 'bg-brand-gold/10 text-brand-gold'
        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
    }`;

  const renderTooltip = (name: string) => {
    if (!collapsed || isMobile) return null;
    return (
      <div className="pointer-events-none invisible absolute left-full z-50 ml-4 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-sm transition-all group-hover:visible group-hover:opacity-100 dark:bg-white dark:text-gray-900">
        {name}
      </div>
    );
  };

  return (
    <>
      {/* Logo */}
      <div
        className={`flex h-16 items-center border-b border-gray-100 transition-all duration-300 dark:border-white/5 ${
          collapsed && !isMobile ? 'justify-center px-2' : 'px-4'
        }`}
      >
        {collapsed && !isMobile ? (
          <Link
            href="/admin/dashboard"
            className="group border-brand-gold/30 hover:border-brand-gold relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br from-amber-500/20 to-amber-600/10 p-1 shadow-xs transition-all duration-300 outline-none hover:scale-105 hover:shadow-md active:scale-95"
            aria-label="SVI Infra Solutions Pvt. Ltd."
          >
            <span className="font-serif text-xs font-black tracking-tight text-amber-600 dark:text-amber-400">
              SVI
            </span>
            {renderTooltip('SVI Infra Solutions')}
          </Link>
        ) : (
          <Link
            href="/admin/dashboard"
            className="group relative inline-flex max-w-[170px] shrink-0 items-center justify-center rounded-[20px] bg-white px-3 py-1.5 shadow-sm ring-1 ring-black/5 transition-all duration-300 outline-none hover:scale-[1.02] hover:shadow-md active:scale-[0.98] dark:ring-white/10"
            aria-label="SVI Infra Solutions Pvt. Ltd."
          >
            <Image
              src="/logo.png"
              alt="SVI Infra Solutions"
              width={282}
              height={83}
              quality={100}
              priority
              className="h-7 w-auto max-w-full object-contain transition-all duration-300 sm:h-8"
            />
          </Link>
        )}
      </div>
      {/* Nav */}
      <div
        className={`flex flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto py-6 ${collapsed && !isMobile ? 'scrollbar-none px-2' : 'scrollbar-gold px-3'}`}
      >
        {/* Dashboard */}
        <Link
          href="/admin/dashboard"
          onClick={onLinkClick}
          className={getLinkClass(pathname === '/admin/dashboard')}
        >
          <div className="relative flex shrink-0 items-center justify-center">
            {pathname === '/admin/dashboard' && (
              <motion.div
                layoutId="active-nav"
                className={`bg-brand-gold absolute h-8 w-1 rounded-r-full ${collapsed && !isMobile ? '-left-2' : '-left-3'}`}
              />
            )}
            <LayoutDashboard
              className={`h-5 w-5 ${pathname === '/admin/dashboard' ? 'text-brand-gold' : 'group-hover:text-brand-gold transition-colors'}`}
            />
          </div>
          <span className={labelClass}>Dashboard</span>
          {renderTooltip('Dashboard')}
        </Link>

        {/* Documents section */}
        <div
          className={`mt-6 mb-2 px-4 pb-0.5 text-[10px] font-bold tracking-[0.15em] whitespace-nowrap text-gray-400 uppercase transition-all duration-300 dark:text-gray-500 ${
            collapsed && !isMobile
              ? 'm-0 max-h-0 overflow-hidden p-0 opacity-0'
              : 'max-h-[20px] opacity-100'
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
              className={getLinkClass(active)}
            >
              <div className="relative flex shrink-0 items-center justify-center">
                {active && (
                  <motion.div
                    layoutId="active-nav"
                    className={`bg-brand-gold absolute h-8 w-1 rounded-r-full ${collapsed && !isMobile ? '-left-2' : '-left-3'}`}
                  />
                )}
                <item.icon
                  className={`h-4 w-4 shrink-0 ${active ? 'text-brand-gold' : 'group-hover:text-brand-gold transition-colors'}`}
                />
              </div>
              <span className={labelClass}>{item.name}</span>
              {renderTooltip(item.name)}
            </Link>
          );
        })}

        {/* Management section */}
        <div
          className={`mt-6 mb-2 px-4 pb-0.5 text-[10px] font-bold tracking-[0.15em] whitespace-nowrap text-gray-400 uppercase transition-all duration-300 dark:text-gray-500 ${
            collapsed && !isMobile
              ? 'm-0 max-h-0 overflow-hidden p-0 opacity-0'
              : 'max-h-[20px] opacity-100'
          }`}
        >
          Management
        </div>

        {managementItems.map((item) => {
          const isWorkforce = item.path === '/admin/workforce';
          const active = isWorkforce
            ? pathname.startsWith('/admin/workforce') ||
              pathname.startsWith('/admin/employees') ||
              pathname.startsWith('/admin/attendance') ||
              pathname.startsWith('/admin/payroll')
            : pathname === item.path || pathname.startsWith(`${item.path}/`);
          return (
            <Link
              key={item.name}
              href={item.path}
              onClick={onLinkClick}
              className={getLinkClass(active)}
            >
              <div className="relative flex shrink-0 items-center justify-center">
                {active && (
                  <motion.div
                    layoutId="active-nav"
                    className={`bg-brand-gold absolute h-8 w-1 rounded-r-full ${collapsed && !isMobile ? '-left-2' : '-left-3'}`}
                  />
                )}
                <item.icon
                  className={`h-4 w-4 shrink-0 ${active ? 'text-brand-gold' : 'group-hover:text-brand-gold transition-colors'}`}
                />
              </div>
              <span className={labelClass}>{item.name}</span>
              {renderTooltip(item.name)}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className={`dark:border-brand-gold/15 overflow-visible border-t border-gray-200 ${collapsed && !isMobile ? 'p-2' : 'p-3'}`}
      >
        <Link
          href="/admin/settings"
          onClick={onLinkClick}
          className={getLinkClass(pathname.startsWith('/admin/settings'))}
        >
          <div className="relative flex shrink-0 items-center justify-center">
            {pathname.startsWith('/admin/settings') && (
              <motion.div
                layoutId="active-nav"
                className={`bg-brand-gold absolute h-8 w-1 rounded-r-full ${collapsed && !isMobile ? '-left-2' : '-left-3'}`}
              />
            )}
            <Settings
              className={`h-5 w-5 ${pathname.startsWith('/admin/settings') ? 'text-brand-gold' : 'group-hover:text-brand-gold transition-colors'}`}
            />
          </div>
          <span className={labelClass}>Settings</span>
          {renderTooltip('Settings')}
        </Link>

        <button
          onClick={handleLogout}
          className={`group relative mt-1 flex w-full cursor-pointer items-center rounded-xl py-2.5 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 ${
            collapsed && !isMobile ? 'justify-center gap-0 px-0' : 'gap-3 px-3'
          }`}
        >
          <div className="flex shrink-0 items-center justify-center">
            <LogOut className="h-5 w-5 transition-transform group-hover:scale-110" />
          </div>
          <span className={labelClass}>Logout</span>
          {renderTooltip('Logout')}
        </button>
      </div>
    </>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

const AdminSidebar = ({ mobileOpen = false, onMobileClose }: AdminSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const setCollapsed = useUIStore((s) => s.setSidebarCollapsed);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/admin');
  };

  return (
    <>
      {/* Desktop sidebar — hidden on mobile */}
      <motion.aside
        animate={{ width: collapsed ? 76 : 224 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="dark:border-brand-gold/15 dark:bg-brand-dark-surface/90 relative z-40 hidden h-screen flex-col border-r border-gray-200 bg-white/90 backdrop-blur-xl transition-colors duration-300 md:flex"
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
              transition={{ duration: 0.25, ease: 'easeOut' }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0.6, right: 0.05 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60 || info.velocity.x < -300) {
                  onMobileClose?.();
                }
              }}
              className="dark:border-brand-gold/15 dark:bg-brand-dark-surface/95 fixed top-0 left-0 z-50 flex h-dvh w-72 max-w-[85vw] flex-col border-r border-gray-200 bg-white/95 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] backdrop-blur-xl md:hidden"
            >
              {/* Close button */}
              <button
                onClick={onMobileClose}
                className="touch-target absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20"
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
