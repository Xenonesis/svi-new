'use client';

import {
  AlertCircle,
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  Mail,
  Paintbrush,
  RefreshCw,
  Shield,
  User,
  History,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

import { useAuthStore } from '@/src/stores/authStore';
import { useTheme } from '@/src/components/ThemeProvider';
import { supabase } from '@/src/lib/supabase/client';

import { ProfileTab } from '@/src/components/admin/settings/ProfileTab';
import { CompanyTab } from '@/src/components/admin/settings/CompanyTab';
import { PropertiesTab } from '@/src/components/admin/settings/PropertiesTab';
import { NotificationsTab } from '@/src/components/admin/settings/NotificationsTab';
import { SecurityTab } from '@/src/components/admin/settings/SecurityTab';
import { AppearanceTab, ACCENTS } from '@/src/components/admin/settings/AppearanceTab';
import { EmailTab } from '@/src/components/admin/settings/EmailTab';
import { LogsTab } from '@/src/components/admin/settings/LogsTab';
import { getUserAgentInfo } from '@/src/components/admin/settings/helpers';

const TABS = [
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
  const { token, userId, loading: sessionLoading } = useAuthStore();
  const { theme, setTheme } = useTheme();

  // Tab State
  const [activeTab, setActiveTab] = useState('profile');

  // Loading States
  const [pageLoading, setPageLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  // Profile Form States
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
  });

  // Company Form States
  const [company, setCompany] = useState({
    company_name: '',
    company_address: '',
    company_email: '',
    company_phone: '',
    company_gst: '',
    company_rera: '',
    company_website: '',
    bank_account_name: '',
    bank_account_no: '',
    bank_name: '',
    bank_ifsc: '',
  });

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    inAppAlerts: true,
    weeklyDigest: false,
  });

  const [globalEmailSharing, setGlobalEmailSharing] = useState({
    enabled: true,
  });

  const [emailSettings, setEmailSettings] = useState({
    admin_email: 'hr.sviinfrasolutions@gmail.com',
    send_user_copy: true,
    sender_name: 'SVI Infra',
    sender_email: 'noreply@sviiinfrasolutions.com',
    notify_on_registration: true,
    notify_on_contact: true,
    notify_on_grievance: true,
    bcc_advisor: true,
    retry_attempts: 3,
  });

  // Password Update States
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Real Active Session details
  const [sessionDetails, setSessionDetails] = useState({
    ip: 'Detecting...',
    location: 'Detecting...',
    os: 'Windows PC',
    browser: 'Google Chrome',
    isMobile: false,
  });

  // Appearance Local Settings
  const [accentColor, setAccentColor] = useState('gold');
  const [uiDensity, setUiDensity] = useState('comfortable');

  // Interactive Toast State
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Data Fetcher on mount & session loaded
  useEffect(() => {
    if (sessionLoading) return;
    if (!userId || !token) {
      setPageLoading(false);
      return;
    }

    async function loadData() {
      setPageLoading(true);
      try {
        const authHeaders = { Authorization: `Bearer ${token}` };

        // Parallel Fetch Profile, Company settings, Notification preferences, Global email sharing, and Email settings
        const [profileRes, companyRes, notifRes, sharingRes, emailSettingsRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', userId).single(),
          fetch('/api/admin/settings?key=company_info', { headers: authHeaders }),
          fetch(`/api/admin/settings?key=notifications_${userId}`, { headers: authHeaders }),
          fetch('/api/admin/settings?key=global_email_sharing', { headers: authHeaders }),
          fetch('/api/admin/settings?key=email_settings', { headers: authHeaders }),
        ]);

        // Load Profile
        if (profileRes.data) {
          setProfile({
            fullName: profileRes.data.full_name || '',
            email: profileRes.data.email || '',
            phone: profileRes.data.phone || '',
            role: profileRes.data.role || 'admin',
          });
        }

        // Load Company
        if (companyRes.ok) {
          const json = await companyRes.json();
          if (json.value) {
            setCompany(json.value);
          }
        }

        // Load Notifications
        if (notifRes.ok) {
          const json = await notifRes.json();
          if (json.value && Object.keys(json.value).length > 0) {
            setNotifications(json.value);
          }
        }

        // Load Global Email Sharing
        if (sharingRes.ok) {
          const json = await sharingRes.json();
          if (json.value && Object.keys(json.value).length > 0) {
            setGlobalEmailSharing(json.value);
          }
        }

        // Load Email Settings
        if (emailSettingsRes.ok) {
          const json = await emailSettingsRes.json();
          if (json.value && Object.keys(json.value).length > 0) {
            setEmailSettings({
              admin_email: json.value.admin_email || 'hr.sviinfrasolutions@gmail.com',
              send_user_copy:
                json.value.send_user_copy !== undefined ? !!json.value.send_user_copy : true,
              sender_name: json.value.sender_name || 'SVI Infra',
              sender_email: json.value.sender_email || 'noreply@sviiinfrasolutions.com',
              notify_on_registration:
                json.value.notify_on_registration !== undefined
                  ? !!json.value.notify_on_registration
                  : true,
              notify_on_contact:
                json.value.notify_on_contact !== undefined ? !!json.value.notify_on_contact : true,
              notify_on_grievance:
                json.value.notify_on_grievance !== undefined
                  ? !!json.value.notify_on_grievance
                  : true,
              bcc_advisor: json.value.bcc_advisor !== undefined ? !!json.value.bcc_advisor : true,
              retry_attempts:
                typeof json.value.retry_attempts === 'number' ? json.value.retry_attempts : 3,
            });
          }
        }

        // Load Local Settings (Appearance)
        const cachedAccent = localStorage.getItem('svi-settings-accent');
        const cachedDensity = localStorage.getItem('svi-settings-density');
        if (cachedAccent) setAccentColor(cachedAccent);
        if (cachedDensity) setUiDensity(cachedDensity);
      } catch (err) {
        console.error('Failed to load setting details:', err);
        showToast('error', 'Failed to retrieve some setting parameters.');
      } finally {
        setPageLoading(false);
      }
    }

    loadData();
  }, [userId, token, sessionLoading]);

  // 2. Real browser user-agent & live IP geo-location loader
  useEffect(() => {
    const uaInfo = getUserAgentInfo();

    // Fetch real administrative user IP address and geo-details
    fetch('https://ipapi.co/json/')
      .then((res) => {
        if (!res.ok) throw new Error('IP service down');
        return res.json();
      })
      .then((data) => {
        setSessionDetails({
          ip: data.ip || '127.0.0.1',
          location: data.city
            ? `${data.city}, ${data.region || data.country_name}`
            : 'Noida, India',
          os: uaInfo.os,
          browser: uaInfo.browser,
          isMobile: uaInfo.isMobile,
        });
      })
      .catch((err) => {
        console.warn('IP lookup failed, using local fallback:', err);
        setSessionDetails({
          ip: '103.45.201.32 (Local ISP)',
          location: 'Noida, India',
          os: uaInfo.os,
          browser: uaInfo.browser,
          isMobile: uaInfo.isMobile,
        });
      });
  }, []);

  // 3. Dynamic Accent Color Applicator to DOM document root
  useEffect(() => {
    const cachedAccent = localStorage.getItem('svi-settings-accent') || 'gold';
    const accent = ACCENTS.find((a) => a.id === cachedAccent) || ACCENTS[0];

    // Apply accent CSS overrides dynamically to Document root
    document.documentElement.style.setProperty('--color-brand-gold', accent.color);
    document.documentElement.style.setProperty('--color-brand-gold-light', accent.light);
    document.documentElement.style.setProperty('--color-brand-gold-dark', accent.dark);
  }, [accentColor]);

  // 4. Profile Saver Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.fullName.trim()) {
      showToast('error', 'Full Name is required.');
      return;
    }

    setSaveLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: profile.fullName,
          phone: profile.phone,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update profile.');

      showToast('success', 'Profile information updated successfully!');
    } catch (err: any) {
      showToast('error', err.message || 'An error occurred while saving profile.');
    } finally {
      setSaveLoading(false);
    }
  };

  // 5. Company Settings Saver Handler
  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.company_name.trim()) {
      showToast('error', 'Company Name is required.');
      return;
    }

    setSaveLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: 'company_info',
          value: company,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save company settings.');

      showToast('success', 'Company details saved successfully!');
    } catch (err: any) {
      showToast('error', err.message || 'An error occurred while saving company details.');
    } finally {
      setSaveLoading(false);
    }
  };

  // 6. Notification Toggle Saver Handler
  const handleToggleNotification = async (field: keyof typeof notifications) => {
    const updated = {
      ...notifications,
      [field]: !notifications[field],
    };
    setNotifications(updated);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: `notifications_${userId}`,
          value: updated,
        }),
      });

      if (!res.ok) throw new Error('API reported rejection.');
      showToast('success', 'Preferences updated in real-time!');
    } catch (err) {
      console.error('Failed to auto-save preferences:', err);
      // Revert in case of failure
      setNotifications(notifications);
      showToast('error', 'Failed to save notification preferences.');
    }
  };

  // 6b. Global Email Sharing Toggle Saver Handler
  const handleToggleGlobalEmailSharing = async () => {
    const updated = {
      enabled: !globalEmailSharing.enabled,
    };
    setGlobalEmailSharing(updated);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: 'global_email_sharing',
          value: updated,
        }),
      });

      if (!res.ok) throw new Error('API reported rejection.');
      showToast('success', 'Global email sharing settings updated!');
    } catch (err) {
      console.error('Failed to auto-save global email sharing settings:', err);
      // Revert in case of failure
      setGlobalEmailSharing(globalEmailSharing);
      showToast('error', 'Failed to save global settings.');
    }
  };

  // 6c. Email Settings Saver Handler
  const handleSaveEmailSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSettings.admin_email.trim()) {
      showToast('error', 'Admin recipient email is required.');
      return;
    }

    setSaveLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: 'email_settings',
          value: emailSettings,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save email settings.');

      showToast('success', 'Email settings updated successfully!');
    } catch (err: any) {
      showToast('error', err.message || 'An error occurred while saving email settings.');
    } finally {
      setSaveLoading(false);
    }
  };

  // 7. Password Update Handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!security.currentPassword || !security.newPassword || !security.confirmPassword) {
      showToast('error', 'All password fields are required.');
      return;
    }
    if (security.newPassword.length < 8) {
      showToast('error', 'New password must be at least 8 characters long.');
      return;
    }
    if (security.newPassword !== security.confirmPassword) {
      showToast('error', 'New passwords do not match.');
      return;
    }

    setSaveLoading(true);
    try {
      // Step A: Re-authenticate to ensure security
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: security.currentPassword,
      });

      if (signInErr) {
        throw new Error('Current password is incorrect. Authentication failed.');
      }

      // Step B: Perform password change
      const { error: updateErr } = await supabase.auth.updateUser({
        password: security.newPassword,
      });

      if (updateErr) throw new Error(updateErr.message);

      // Clear password states
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('success', 'Your password has been changed securely!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update security credentials.');
    } finally {
      setSaveLoading(false);
    }
  };

  // 8. Local Settings Savers (Appearance)
  const handleSelectAccent = (colorId: string) => {
    setAccentColor(colorId);
    localStorage.setItem('svi-settings-accent', colorId);
    showToast('success', `Accent tone changed to ${colorId}!`);
  };

  const handleSelectDensity = (densityId: string) => {
    setUiDensity(densityId);
    localStorage.setItem('svi-settings-density', densityId);
    showToast('success', `Layout density updated to ${densityId}!`);
  };

  const isCompact = uiDensity === 'compact';

  return (
    <div className="relative mx-auto w-full max-w-6xl font-sans">
      {/* Background illumination */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="bg-brand-gold/5 absolute top-1/4 right-0 h-[300px] w-[300px] rounded-full blur-[90px]" />
        <div className="bg-brand-navy-light/10 absolute bottom-1/4 left-0 h-[400px] w-[400px] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 font-sans">
        <div className="mb-8 font-sans">
          <h1 className="text-brand-navy mb-2 font-sans font-serif text-4xl tracking-tight transition-colors duration-300 dark:text-white">
            Portal{' '}
            <span
              className="text-gradient-gold animate-bg-pan inline-block font-sans italic"
              style={{
                backgroundSize: '200% 200%',
                backgroundImage:
                  'linear-gradient(135deg, #d4af37, #f0d080, #b08f36, #dec070, #d4af37)',
              }}
            >
              Settings
            </span>
          </h1>
          <p className="font-sans text-xs tracking-wider text-gray-600 transition-colors duration-300 dark:text-gray-400">
            Configure system configurations, custom document parameters, profile properties, and
            appearance details.
          </p>
        </div>

        {pageLoading ? (
          <div className="flex flex-col gap-8 font-sans md:flex-row">
            {/* Skeleton Navigation Sidebar */}
            <aside className="w-full shrink-0 font-sans md:w-64">
              <div className="flex flex-row gap-2 overflow-x-auto pb-4 font-sans md:flex-col md:pb-0">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-[52px] w-32 shrink-0 animate-pulse rounded-xl bg-gray-200/60 md:w-full dark:bg-white/5"
                    style={{ animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            </aside>

            {/* Skeleton Content Container */}
            <main className="flex-1 font-sans">
              <div className="dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 md:p-8 dark:border-white/8">
                {/* Header Skeleton */}
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="space-y-3">
                    <div className="h-7 w-48 animate-pulse rounded-lg bg-gray-200/80 dark:bg-white/10" />
                    <div className="h-4 w-64 animate-pulse rounded-lg bg-gray-200/50 sm:w-80 dark:bg-white/5" />
                  </div>
                  <div className="h-10 w-28 animate-pulse rounded-lg bg-gray-200/80 dark:bg-white/10" />
                </div>

                {/* Form Fields Skeleton */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={`field-${i}`} className="space-y-2">
                      <div className="h-4 w-24 animate-pulse rounded-md bg-gray-200/60 dark:bg-white/5" />
                      <div className="h-[46px] w-full animate-pulse rounded-xl bg-gray-200/50 dark:bg-white/5" />
                    </div>
                  ))}
                </div>

                {/* Footer Skeleton */}
                <div className="mt-8 flex justify-end">
                  <div className="h-[46px] w-40 animate-pulse rounded-xl bg-gray-200/80 dark:bg-white/10" />
                </div>
              </div>
            </main>
          </div>
        ) : (
          <div className="flex flex-col gap-8 font-sans md:flex-row">
            {/* Settings Navigation Sidebar */}
            <aside className="w-full shrink-0 font-sans md:w-64">
              <nav className="flex flex-row gap-2 overflow-x-auto pb-4 font-sans md:flex-col md:pb-0">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group relative flex cursor-pointer items-center justify-between rounded-xl px-4 py-3.5 font-sans whitespace-nowrap transition-colors duration-300 md:w-full ${
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
                            isActive
                              ? 'text-brand-navy'
                              : 'group-hover:text-brand-gold text-gray-500 dark:text-gray-500'
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

            {/* Settings Content Container */}
            <main className="flex-1 font-sans">
              <div className="dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 md:p-8 dark:border-white/8">
                {/* Accent Gold top line */}
                <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* TAB A: PROFILE SETTINGS */}
                    {activeTab === 'profile' && (
                      <ProfileTab
                        profile={profile}
                        setProfile={setProfile}
                        saveLoading={saveLoading}
                        handleSaveProfile={handleSaveProfile}
                        isCompact={isCompact}
                      />
                    )}

                    {/* TAB B: COMPANY INFO */}
                    {activeTab === 'company' && (
                      <CompanyTab
                        company={company}
                        setCompany={setCompany}
                        saveLoading={saveLoading}
                        handleSaveCompany={handleSaveCompany}
                        isCompact={isCompact}
                      />
                    )}

                    {/* TAB C: NOTIFICATIONS */}
                    {activeTab === 'notifications' && (
                      <NotificationsTab
                        notifications={notifications}
                        handleToggleNotification={handleToggleNotification}
                        globalEmailSharing={globalEmailSharing}
                        handleToggleGlobalEmailSharing={handleToggleGlobalEmailSharing}
                        isCompact={isCompact}
                      />
                    )}

                    {/* TAB G: EMAIL SETTINGS */}
                    {activeTab === 'email' && (
                      <EmailTab
                        emailSettings={emailSettings}
                        setEmailSettings={setEmailSettings}
                        saveLoading={saveLoading}
                        handleSaveEmailSettings={handleSaveEmailSettings}
                        isCompact={isCompact}
                      />
                    )}

                    {/* TAB D: SECURITY SETTINGS */}
                    {activeTab === 'security' && (
                      <SecurityTab
                        security={security}
                        setSecurity={setSecurity}
                        showCurrentPass={showCurrentPass}
                        setShowCurrentPass={setShowCurrentPass}
                        showNewPass={showNewPass}
                        setShowNewPass={setShowNewPass}
                        showConfirmPass={showConfirmPass}
                        setShowConfirmPass={setShowConfirmPass}
                        saveLoading={saveLoading}
                        handleUpdatePassword={handleUpdatePassword}
                        sessionDetails={sessionDetails}
                        showToast={showToast}
                        isCompact={isCompact}
                      />
                    )}

                    {/* TAB E: APPEARANCE SETTINGS */}
                    {activeTab === 'appearance' && (
                      <AppearanceTab
                        theme={theme}
                        setTheme={setTheme}
                        accentColor={accentColor}
                        handleSelectAccent={handleSelectAccent}
                        uiDensity={uiDensity}
                        handleSelectDensity={handleSelectDensity}
                      />
                    )}

                    {/* TAB F: PROPERTIES SETTINGS */}
                    {activeTab === 'properties' && (
                      <PropertiesTab token={token} isCompact={isCompact} showToast={showToast} />
                    )}

                    {/* TAB H: ACTIVITY LOGS */}
                    {activeTab === 'logs' && (
                      <LogsTab token={token} isCompact={isCompact} showToast={showToast} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>
          </div>
        )}
      </div>

      {/* Floating dynamic status toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-xl border px-5 py-3.5 font-sans text-sm font-semibold shadow-2xl transition-all duration-300 ${
              toast.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-950/95 dark:text-emerald-300'
                : 'border-red-200 bg-red-50 font-sans text-red-600 dark:border-red-500/30 dark:bg-red-950/95 dark:text-red-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-4.5 w-4.5 font-sans text-emerald-400" />
            ) : (
              <AlertCircle className="h-4.5 w-4.5 font-sans text-red-400" />
            )}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
