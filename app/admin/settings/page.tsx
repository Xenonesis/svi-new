'use client';

import {
  Activity,
  AlertCircle,
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  History,
  Mail,
  Paintbrush,
  Shield,
  User,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { OverviewTab } from '@/src/components/admin/settings/OverviewTab';
import { ProfileTab } from '@/src/components/admin/settings/ProfileTab';
import { CompanyTab } from '@/src/components/admin/settings/CompanyTab';
import { PropertiesTab } from '@/src/components/admin/settings/PropertiesTab';
import { NotificationsTab } from '@/src/components/admin/settings/NotificationsTab';
import { SecurityTab } from '@/src/components/admin/settings/SecurityTab';
import { AppearanceTab } from '@/src/components/admin/settings/AppearanceTab';
import { EmailTab } from '@/src/components/admin/settings/EmailTab';
import { LogsTab } from '@/src/components/admin/settings/LogsTab';
import { useSettings } from '@/src/components/admin/settings/hooks/useSettings';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'profile', label: 'Profile Settings', icon: User },
  { id: 'company', label: 'Company Info', icon: Building2 },
  { id: 'properties', label: 'Property List', icon: Building2 },
  { id: 'email', label: 'Email Settings', icon: Mail },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Paintbrush },
  { id: 'logs', label: 'Activity Logs', icon: History },
];

export default function AdminSettings() {
  const s = useSettings();

  return (
    <div className="relative mx-auto w-full max-w-6xl font-sans">
      {/* Background illumination */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="bg-brand-gold/5 absolute top-1/4 right-0 h-[300px] w-[300px] rounded-full blur-[90px]" />
        <div className="bg-brand-navy-light/10 absolute bottom-1/4 left-0 h-[400px] w-[400px] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        <div className="mb-8">
          <h1 className="text-brand-navy mb-2 font-serif text-4xl tracking-tight dark:text-white">
            Portal{' '}
            <span
              className="text-gradient-gold animate-bg-pan inline-block italic"
              style={{
                backgroundSize: '200% 200%',
                backgroundImage:
                  'linear-gradient(135deg, #d4af37, #f0d080, #b08f36, #dec070, #d4af37)',
              }}
            >
              Settings
            </span>
          </h1>
          <p className="text-xs tracking-wider text-gray-600 dark:text-gray-400">
            Configure system configurations, custom document parameters, profile properties, and
            appearance details.
          </p>
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          {/* Navigation Sidebar */}
          <aside className="w-full shrink-0 md:w-64">
            <nav className="flex flex-row gap-2 overflow-x-auto pb-4 md:flex-col md:pb-0">
              {TABS.map((tab) => {
                const isActive = s.activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => s.setActiveTab(tab.id)}
                    className={`group relative flex cursor-pointer items-center justify-between rounded-xl px-4 py-3.5 whitespace-nowrap transition-colors duration-300 md:w-full ${
                      isActive
                        ? 'text-brand-navy shadow-brand-gold/15 font-bold shadow-sm'
                        : 'hover:text-brand-gold font-semibold text-gray-600 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeSettingsTab"
                        className="bg-brand-gold absolute inset-0 rounded-xl"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <div className="relative z-10 flex items-center gap-3">
                      <tab.icon
                        className={`h-4.5 w-4.5 transition-colors ${
                          isActive ? 'text-brand-navy' : 'group-hover:text-brand-gold text-gray-500'
                        }`}
                      />
                      <span className="text-sm">{tab.label}</span>
                    </div>
                    <ChevronRight
                      className={`relative z-10 hidden h-3.5 w-3.5 transition-transform duration-300 md:block ${
                        isActive
                          ? 'text-brand-navy translate-x-0.5'
                          : 'text-gray-400 opacity-0 group-hover:opacity-100 dark:text-gray-600'
                      }`}
                    />
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1">
            <div className="dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl md:p-8 dark:border-white/8">
              <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={s.activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  {s.activeTab === 'overview' && (
                    <OverviewTab
                      systemHealth={s.systemHealth}
                      profile={s.profile}
                      sessionDetails={s.sessionDetails}
                      isCompact={s.isCompact}
                    />
                  )}
                  {s.activeTab === 'profile' && (
                    <ProfileTab
                      profile={s.profile}
                      setProfile={s.setProfile}
                      saveLoading={s.saveLoading}
                      handleSaveProfile={s.saveProfile}
                      isCompact={s.isCompact}
                    />
                  )}
                  {s.activeTab === 'company' && (
                    <CompanyTab
                      company={s.company}
                      setCompany={s.setCompany}
                      saveLoading={s.saveLoading}
                      handleSaveCompany={s.saveCompany}
                      isCompact={s.isCompact}
                    />
                  )}
                  {s.activeTab === 'notifications' && (
                    <NotificationsTab
                      notifications={s.notifications}
                      handleToggleNotification={s.toggleNotification}
                      globalEmailSharing={s.globalEmailSharing}
                      handleToggleGlobalEmailSharing={s.toggleGlobalEmailSharing}
                      isCompact={s.isCompact}
                    />
                  )}
                  {s.activeTab === 'email' && (
                    <EmailTab
                      emailSettings={s.emailSettings}
                      setEmailSettings={s.setEmailSettings}
                      saveLoading={s.saveLoading}
                      handleSaveEmailSettings={s.saveEmailSettings}
                      isCompact={s.isCompact}
                    />
                  )}
                  {s.activeTab === 'security' && (
                    <SecurityTab
                      security={s.security}
                      setSecurity={s.setSecurity}
                      showCurrentPass={s.showCurrentPass}
                      setShowCurrentPass={s.setShowCurrentPass}
                      showNewPass={s.showNewPass}
                      setShowNewPass={s.setShowNewPass}
                      showConfirmPass={s.showConfirmPass}
                      setShowConfirmPass={s.setShowConfirmPass}
                      saveLoading={s.saveLoading}
                      handleUpdatePassword={s.updatePassword}
                      sessionDetails={s.sessionDetails}
                      showToast={s.showToast}
                      isCompact={s.isCompact}
                    />
                  )}
                  {s.activeTab === 'appearance' && (
                    <AppearanceTab
                      theme={s.theme}
                      setTheme={s.setTheme}
                      accentColor={s.accentColor}
                      handleSelectAccent={s.selectAccent}
                      uiDensity={s.uiDensity}
                      handleSelectDensity={s.selectDensity}
                    />
                  )}
                  {s.activeTab === 'properties' && (
                    <PropertiesTab
                      token={s.token}
                      isCompact={s.isCompact}
                      showToast={s.showToast}
                    />
                  )}
                  {s.activeTab === 'logs' && (
                    <LogsTab token={s.token} isCompact={s.isCompact} showToast={s.showToast} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {s.toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-xl border px-5 py-3.5 text-sm font-semibold shadow-2xl ${
              s.toast.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-950/95 dark:text-emerald-300'
                : 'border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-950/95 dark:text-red-300'
            }`}
          >
            {s.toast.type === 'success' ? (
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4.5 w-4.5 text-red-400" />
            )}
            <span>{s.toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
