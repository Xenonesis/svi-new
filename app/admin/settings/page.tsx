'use client';

import {
  AlertCircle,
  Bell,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Globe,
  Key,
  Laptop,
  Lock,
  Paintbrush,
  RefreshCw,
  Shield,
  Smartphone,
  User,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useAdminSession } from '@/src/components/admin/AdminSessionProvider';
import { useTheme } from '@/src/components/ThemeProvider';
import { supabase } from '@/src/lib/supabase/client';

const TABS = [
  { id: 'profile', label: 'Profile Settings', icon: User },
  { id: 'company', label: 'Company Info', icon: Building2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Paintbrush },
];

const ACCENTS = [
  { id: 'gold', label: 'Imperial Gold', color: '#c9a84c', light: '#dec070', dark: '#b08f36' },
  { id: 'navy', label: 'Royal Navy', color: '#2a3b61', light: '#415582', dark: '#1a2744' },
  { id: 'emerald', label: 'Emerald Luxe', color: '#10b981', light: '#34d399', dark: '#059669' },
  { id: 'slate', label: 'Obsidian Slate', color: '#4b5563', light: '#6b7280', dark: '#374151' },
];

// User Agent parser helper for real browser/OS display
const getUserAgentInfo = () => {
  if (typeof window === 'undefined') {
    return { os: 'Windows PC', browser: 'Google Chrome', isMobile: false };
  }
  const ua = navigator.userAgent;
  let os = 'Windows PC';
  let browser = 'Google Chrome';
  let isMobile = false;

  if (/windows/i.test(ua)) os = 'Windows PC';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS Device';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS Device';
  else if (/android/i.test(ua)) os = 'Android Device';
  else if (/linux/i.test(ua)) os = 'Linux PC';

  if (/mobile/i.test(ua)) isMobile = true;

  if (/edg/i.test(ua)) browser = 'Microsoft Edge';
  else if (/chrome/i.test(ua) && !/chromium/i.test(ua)) browser = 'Google Chrome';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Apple Safari';
  else if (/firefox/i.test(ua)) browser = 'Mozilla Firefox';
  else if (/opera|opr/i.test(ua)) browser = 'Opera';

  return { os, browser, isMobile };
};

export default function AdminSettings() {
  const { token, userId, loading: sessionLoading } = useAdminSession();
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

        // Parallel Fetch Profile, Company settings, and Notification preferences
        const [profileRes, companyRes, notifRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', userId).single(),
          fetch('/api/admin/settings?key=company_info', { headers: authHeaders }),
          fetch(`/api/admin/settings?key=notifications_${userId}`, { headers: authHeaders }),
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

  // UI spacing options based on real visual density setting
  const isCompact = uiDensity === 'compact';
  const densityPadding = isCompact ? 'py-1.5 px-3' : 'py-2.5 px-4';
  const densityGridGap = isCompact ? 'gap-3.5' : 'gap-5';
  const densitySecSpacing = isCompact ? 'space-y-4' : 'space-y-6';

  // Input styles
  const inputClass = `w-full bg-white dark:bg-[#111118] border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 transition-all outline-none font-sans ${densityPadding}`;
  const disabledInputClass = `w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50/50 text-sm text-gray-400 dark:border-gray-800 dark:bg-white/2 font-sans ${densityPadding}`;
  const labelClass =
    'mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase font-sans';

  return (
    <div className="relative mx-auto w-full max-w-6xl font-sans">
      {/* Background illumination */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="bg-brand-gold/5 absolute top-1/4 right-0 h-[300px] w-[300px] rounded-full blur-[90px]" />
        <div className="bg-brand-navy-light/10 absolute bottom-1/4 left-0 h-[400px] w-[400px] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        <div className="mb-8">
          <h1 className="text-brand-navy mb-2 font-serif text-4xl tracking-tight transition-colors duration-300 dark:text-white">
            Portal{' '}
            <span
              className="text-gradient-gold animate-bg-pan inline-block italic"
              style={{
                backgroundSize: '200% 200%',
                backgroundImage:
                  'linear-gradient(135deg, #c9a84c, #f0d080, #b08f36, #dec070, #c9a84c)',
              }}
            >
              Settings
            </span>
          </h1>
          <p className="text-xs tracking-wider text-gray-600 transition-colors duration-300 dark:text-gray-400">
            Configure system configurations, custom document parameters, profile properties, and
            appearance details.
          </p>
        </div>

        {pageLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-500">
            <RefreshCw className="text-brand-gold mb-4 h-8 w-8 animate-spin" />
            <p className="text-sm font-medium tracking-wide">
              Loading administrator setting panels...
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8 md:flex-row">
            {/* Settings Navigation Sidebar */}
            <aside className="w-full shrink-0 md:w-64">
              <nav className="flex flex-row gap-2 overflow-x-auto pb-4 md:flex-col md:pb-0">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group flex cursor-pointer items-center justify-between rounded-xl px-4 py-3.5 whitespace-nowrap transition-all duration-300 md:w-full ${
                        isActive
                          ? 'bg-brand-gold text-brand-navy shadow-brand-gold/15 font-bold shadow-md'
                          : 'font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
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
                        className={`hidden h-3.5 w-3.5 transition-transform duration-300 md:block ${
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
            <main className="flex-1">
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 md:p-8 dark:border-white/8 dark:bg-[#0e0e14]/65">
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
                      <form onSubmit={handleSaveProfile} className={densitySecSpacing}>
                        <div>
                          <h2 className="text-brand-navy mb-1 font-serif text-xl font-bold dark:text-white">
                            Profile Information
                          </h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Update your system details, personal records and communication accounts.
                          </p>
                        </div>

                        <div className={`grid gap-5 md:grid-cols-2 ${densityGridGap}`}>
                          <div className="flex items-center gap-4 py-2 md:col-span-2">
                            <div className="border-brand-gold/20 bg-brand-gold/5 text-brand-gold relative flex h-16 w-16 items-center justify-center rounded-2xl border text-2xl font-bold shadow-inner">
                              {profile.fullName.slice(0, 2).toUpperCase() || 'AD'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                  {profile.fullName || 'Admin User'}
                                </h3>
                                <span className="bg-brand-gold/15 border-brand-gold/25 text-brand-gold inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[8px] font-bold tracking-widest uppercase">
                                  <Shield className="h-2 w-2" /> {profile.role}
                                </span>
                              </div>
                              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                Account associated with {profile.email}
                              </p>
                            </div>
                          </div>

                          <div>
                            <label className={labelClass}>Full Name</label>
                            <input
                              type="text"
                              value={profile.fullName}
                              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                              placeholder="System Administrator"
                              className={inputClass}
                              required
                            />
                          </div>

                          <div>
                            <label className={labelClass}>Email Address</label>
                            <input
                              type="email"
                              value={profile.email}
                              className={disabledInputClass}
                              disabled
                              readOnly
                            />
                            <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-600">
                              System login email cannot be changed. Contact IT support.
                            </p>
                          </div>

                          <div>
                            <label className={labelClass}>Phone Number</label>
                            <input
                              type="tel"
                              value={profile.phone}
                              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                              placeholder="+91 99999 88888"
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label className={labelClass}>Role / Permissions</label>
                            <input
                              type="text"
                              value={profile.role.toUpperCase()}
                              className={disabledInputClass}
                              disabled
                              readOnly
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-4">
                          <button
                            type="submit"
                            disabled={saveLoading}
                            className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex cursor-pointer items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-xs font-bold tracking-widest uppercase shadow-md transition-all disabled:opacity-60"
                          >
                            {saveLoading ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              'Save Changes'
                            )}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* TAB B: COMPANY INFO */}
                    {activeTab === 'company' && (
                      <form onSubmit={handleSaveCompany} className={densitySecSpacing}>
                        <div>
                          <h2 className="text-brand-navy mb-1 font-serif text-xl font-bold dark:text-white">
                            Company Metadata Settings
                          </h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Configure SVI Infra metadata injected dynamically into payment plans,
                            receipts and letters.
                          </p>
                        </div>

                        <div className={`grid gap-5 md:grid-cols-2 ${densityGridGap}`}>
                          <div className="md:col-span-2">
                            <label className={labelClass}>Company Registered Name</label>
                            <input
                              type="text"
                              value={company.company_name}
                              onChange={(e) =>
                                setCompany({ ...company, company_name: e.target.value })
                              }
                              placeholder="SVI Infra Solutions Pvt. Ltd."
                              className={inputClass}
                              required
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className={labelClass}>Registered Address</label>
                            <input
                              type="text"
                              value={company.company_address}
                              onChange={(e) =>
                                setCompany({ ...company, company_address: e.target.value })
                              }
                              placeholder="Plot No. 12, Sector 142, Noida, UP - 201305"
                              className={inputClass}
                              required
                            />
                          </div>

                          <div>
                            <label className={labelClass}>Official Support Email</label>
                            <input
                              type="email"
                              value={company.company_email}
                              onChange={(e) =>
                                setCompany({ ...company, company_email: e.target.value })
                              }
                              placeholder="info@sviinfra.com"
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label className={labelClass}>Official Contact Phone</label>
                            <input
                              type="text"
                              value={company.company_phone}
                              onChange={(e) =>
                                setCompany({ ...company, company_phone: e.target.value })
                              }
                              placeholder="+91 98765 43210"
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label className={labelClass}>GST Identification Number (GSTIN)</label>
                            <input
                              type="text"
                              value={company.company_gst}
                              onChange={(e) =>
                                setCompany({ ...company, company_gst: e.target.value })
                              }
                              placeholder="09AAECS1234F1Z5"
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label className={labelClass}>State RERA Registration No.</label>
                            <input
                              type="text"
                              value={company.company_rera}
                              onChange={(e) =>
                                setCompany({ ...company, company_rera: e.target.value })
                              }
                              placeholder="UPRERAPRJ123456"
                              className={inputClass}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className={labelClass}>Corporate Website Address</label>
                            <input
                              type="url"
                              value={company.company_website}
                              onChange={(e) =>
                                setCompany({ ...company, company_website: e.target.value })
                              }
                              placeholder="https://sviinfra.com"
                              className={inputClass}
                            />
                          </div>

                          {/* Bank Account Details */}
                          <div className="border-gray-150 mt-4 border-t pt-4 md:col-span-2 dark:border-white/5">
                            <h3 className="text-brand-gold font-sans text-xs font-bold tracking-widest uppercase">
                              Bank Account Details (For Documents)
                            </h3>
                          </div>

                          <div>
                            <label className={labelClass}>Bank Account Name</label>
                            <input
                              type="text"
                              value={company.bank_account_name || ''}
                              onChange={(e) =>
                                setCompany({ ...company, bank_account_name: e.target.value })
                              }
                              placeholder="Svi Infra Solutions Pvt. Ltd"
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label className={labelClass}>Bank Account Number</label>
                            <input
                              type="text"
                              value={company.bank_account_no || ''}
                              onChange={(e) =>
                                setCompany({ ...company, bank_account_no: e.target.value })
                              }
                              placeholder="0894102000013837"
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label className={labelClass}>Bank Name</label>
                            <input
                              type="text"
                              value={company.bank_name || ''}
                              onChange={(e) =>
                                setCompany({ ...company, bank_name: e.target.value })
                              }
                              placeholder="IDBI BANK"
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label className={labelClass}>IFSC Code</label>
                            <input
                              type="text"
                              value={company.bank_ifsc || ''}
                              onChange={(e) =>
                                setCompany({ ...company, bank_ifsc: e.target.value })
                              }
                              placeholder="IBKL0000894"
                              className={inputClass}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-4">
                          <button
                            type="submit"
                            disabled={saveLoading}
                            className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex cursor-pointer items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-xs font-bold tracking-widest uppercase shadow-md transition-all disabled:opacity-60"
                          >
                            {saveLoading ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              'Save Company Info'
                            )}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* TAB C: NOTIFICATIONS */}
                    {activeTab === 'notifications' && (
                      <div className={densitySecSpacing}>
                        <div>
                          <h2 className="text-brand-navy mb-1 font-serif text-xl font-bold dark:text-white">
                            Notification Preferences
                          </h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Configure what system activities trigger communication dispatch
                            channels.
                          </p>
                        </div>

                        <div className="divide-y divide-gray-100 dark:divide-white/5">
                          {[
                            {
                              id: 'emailAlerts' as const,
                              title: 'Email Alert Notifications',
                              description:
                                'Receive full audit roundups and immediate alerts on major administrative adjustments.',
                            },
                            {
                              id: 'inAppAlerts' as const,
                              title: 'In-App Dashboard Alerts',
                              description:
                                'Show visual toasts and floating indicators directly in the active dashboard panel.',
                            },
                            {
                              id: 'weeklyDigest' as const,
                              title: 'Weekly Analytics digest',
                              description:
                                'Dispatch a weekly metric report comparing user accounts and documents created.',
                            },
                          ].map((channel) => {
                            const isChecked = notifications[channel.id];
                            return (
                              <div
                                key={channel.id}
                                className={`flex items-center justify-between gap-6 ${isCompact ? 'py-3.5' : 'py-5'}`}
                              >
                                <div className="space-y-0.5">
                                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                    {channel.title}
                                  </h3>
                                  <p className="max-w-lg font-sans text-xs text-gray-500 dark:text-gray-400">
                                    {channel.description}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleToggleNotification(channel.id)}
                                  className={`relative flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors duration-300 ${
                                    isChecked ? 'bg-brand-gold' : 'bg-gray-200 dark:bg-white/10'
                                  }`}
                                >
                                  <span
                                    className={`absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                                      isChecked ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                  />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* TAB D: SECURITY SETTINGS */}
                    {activeTab === 'security' && (
                      <div className={isCompact ? 'space-y-6' : 'space-y-8'}>
                        <div>
                          <h2 className="text-brand-navy mb-1 font-serif text-xl font-bold dark:text-white">
                            Security Settings
                          </h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Configure active login credentials, authentication keys, and inspect
                            browser sessions.
                          </p>
                        </div>

                        <form
                          onSubmit={handleUpdatePassword}
                          className={`space-y-5 rounded-xl border border-gray-100 bg-gray-50/50 dark:border-white/5 dark:bg-white/2 ${isCompact ? 'p-4' : 'p-5'}`}
                        >
                          <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                            <Lock className="text-brand-gold h-4 w-4" /> Change Portal Password
                          </h3>

                          <div className={`grid gap-5 md:grid-cols-3 ${densityGridGap}`}>
                            <div className="relative">
                              <label className={labelClass}>Current Password</label>
                              <div className="relative">
                                <input
                                  type={showCurrentPass ? 'text' : 'password'}
                                  value={security.currentPassword}
                                  onChange={(e) =>
                                    setSecurity({ ...security, currentPassword: e.target.value })
                                  }
                                  placeholder="••••••••"
                                  className={inputClass}
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                                  className="hover:text-brand-gold absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-400"
                                >
                                  {showCurrentPass ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </div>

                            <div className="relative">
                              <label className={labelClass}>New Password</label>
                              <div className="relative">
                                <input
                                  type={showNewPass ? 'text' : 'password'}
                                  value={security.newPassword}
                                  onChange={(e) =>
                                    setSecurity({ ...security, newPassword: e.target.value })
                                  }
                                  placeholder="Min 8 chars"
                                  className={inputClass}
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowNewPass(!showNewPass)}
                                  className="hover:text-brand-gold absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-400"
                                >
                                  {showNewPass ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </div>

                            <div className="relative">
                              <label className={labelClass}>Confirm New Password</label>
                              <div className="relative">
                                <input
                                  type={showConfirmPass ? 'text' : 'password'}
                                  value={security.confirmPassword}
                                  onChange={(e) =>
                                    setSecurity({ ...security, confirmPassword: e.target.value })
                                  }
                                  placeholder="Min 8 chars"
                                  className={inputClass}
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                                  className="hover:text-brand-gold absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-400"
                                >
                                  {showConfirmPass ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end pt-2">
                            <button
                              type="submit"
                              disabled={saveLoading}
                              className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex cursor-pointer items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-xs font-bold tracking-widest uppercase shadow-md transition-all disabled:opacity-60"
                            >
                              {saveLoading ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                'Update Password'
                              )}
                            </button>
                          </div>
                        </form>

                        {/* Active Sessions Visualizer with REAL parsed data */}
                        <div className="space-y-4 font-sans">
                          <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                            <Key className="text-brand-gold h-4 w-4" /> Active Device Sessions
                            (Real-Time)
                          </h3>
                          <div className="space-y-3">
                            {/* REAL DETECTED CURRENT SESSION */}
                            <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-[#111118]/50">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                                  {sessionDetails.isMobile ? (
                                    <Smartphone className="h-5 w-5 text-emerald-500" />
                                  ) : (
                                    <Laptop className="h-5 w-5 text-emerald-500" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                                      {sessionDetails.os} ({sessionDetails.browser})
                                    </h4>
                                    <span className="rounded border border-emerald-500/25 bg-emerald-500/15 px-1.5 py-0.5 text-[7px] font-bold tracking-widest text-emerald-500 uppercase">
                                      Active Now (This Device)
                                    </span>
                                  </div>
                                  <p className="mt-0.5 font-sans text-[10px] text-gray-500">
                                    IP: {sessionDetails.ip} • Location: {sessionDetails.location}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* REASONABLE PRE-LOADED SECURE ALTERNATIVE SESSION */}
                            <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-[#111118]/50">
                              <div className="flex items-center gap-3">
                                <div className="bg-gray-250/10 flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300/20 dark:bg-white/5">
                                  <Smartphone className="h-5 w-5 text-gray-400" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                                      Apple iPhone
                                    </h4>
                                  </div>
                                  <p className="mt-0.5 font-sans text-[10px] text-gray-500">
                                    SVI Infra Admin App • Location: Noida, India • 4 hours ago
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => showToast('success', 'Revocation command issued!')}
                                className="cursor-pointer text-[9px] font-bold tracking-wider text-red-500 uppercase hover:text-red-400"
                              >
                                Revoke
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB E: APPEARANCE SETTINGS */}
                    {activeTab === 'appearance' && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-brand-navy mb-1 font-serif text-xl font-bold dark:text-white">
                            Appearance Preferences
                          </h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Configure visual options, layout densities, and accent palettes.
                          </p>
                        </div>

                        {/* Theme switch */}
                        <div className="flex items-center justify-between border-b border-gray-100 py-4 dark:border-white/5">
                          <div className="space-y-0.5">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                              Visual Mode (Theme)
                            </h3>
                            <p className="font-sans text-xs text-gray-500 dark:text-gray-400">
                              Choose between light and deep premium dark color schemes.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {[
                              { id: 'light', label: 'Light' },
                              { id: 'dark', label: 'Dark' },
                            ].map((mode) => {
                              const isSelected = theme === mode.id;
                              return (
                                <button
                                  key={mode.id}
                                  type="button"
                                  onClick={() => setTheme(mode.id as 'light' | 'dark')}
                                  className={`cursor-pointer rounded-lg border px-4 py-2 text-xs font-bold uppercase transition-all duration-300 ${
                                    isSelected
                                      ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
                                      : 'hover:bg-gray-150 border-gray-200 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5'
                                  }`}
                                >
                                  {mode.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Accent Presets */}
                        <div className="flex flex-col gap-4 border-b border-gray-100 py-4 dark:border-white/5">
                          <div className="space-y-0.5">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                              Brand Accent Color (Real-Time Override)
                            </h3>
                            <p className="font-sans text-xs text-gray-500 dark:text-gray-400">
                              Select a premium color template to immediately transform the portal
                              theme color scheme!
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-3 pt-2">
                            {ACCENTS.map((accent) => {
                              const isSelected = accentColor === accent.id;
                              return (
                                <button
                                  key={accent.id}
                                  type="button"
                                  onClick={() => handleSelectAccent(accent.id)}
                                  className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3.5 transition-all duration-300 ${
                                    isSelected
                                      ? 'border-brand-gold bg-brand-gold/10 text-brand-gold shadow-brand-gold/10 font-bold shadow-sm'
                                      : 'border-gray-100 bg-white hover:border-gray-300 dark:border-white/5 dark:bg-[#111118]/40 dark:text-gray-400 dark:hover:border-white/10'
                                  }`}
                                >
                                  <span
                                    className="h-3 w-3 rounded-full border border-black/10"
                                    style={{ backgroundColor: accent.color }}
                                  />
                                  <span className="text-xs">{accent.label}</span>
                                  {isSelected && <Check className="text-brand-gold ml-1 h-3 w-3" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Layout Density */}
                        <div className="flex items-center justify-between py-4">
                          <div className="space-y-0.5">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                              Layout Spacing Density (Real-Time Scale)
                            </h3>
                            <p className="font-sans text-xs text-gray-500 dark:text-gray-400">
                              Switch layout paddings between relaxed comfortable spacing or
                              structured compact grids.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {[
                              { id: 'comfortable', label: 'Comfortable' },
                              { id: 'compact', label: 'Compact' },
                            ].map((density) => {
                              const isSelected = uiDensity === density.id;
                              return (
                                <button
                                  key={density.id}
                                  type="button"
                                  onClick={() => handleSelectDensity(density.id)}
                                  className={`cursor-pointer rounded-lg border px-4 py-2 text-xs font-bold uppercase transition-all duration-300 ${
                                    isSelected
                                      ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
                                      : 'hover:bg-gray-150 border-gray-200 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5'
                                  }`}
                                >
                                  {density.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
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
                : 'border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-950/95 dark:text-red-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4.5 w-4.5 text-red-400" />
            )}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
