'use client';

import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase/client';
import { useAuthStore } from '@/src/stores/authStore';
import { useTheme } from '@/src/components/ThemeProvider';
import { getUserAgentInfo, ACCENTS } from '../helpers';

/* ─── Types ─────────────────────────────────────────────────── */

export interface Profile {
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

export interface Company {
  company_name: string;
  company_address: string;
  company_email: string;
  company_phone: string;
  company_gst: string;
  company_rera: string;
  company_website: string;
  bank_account_name: string;
  bank_account_no: string;
  bank_name: string;
  bank_ifsc: string;
}

export interface Notifications {
  emailAlerts: boolean;
  inAppAlerts: boolean;
  weeklyDigest: boolean;
}

export interface GlobalEmailSharing {
  enabled: boolean;
}

export interface EmailSettings {
  admin_email: string;
  send_user_copy: boolean;
  sender_name: string;
  sender_email: string;
  notify_on_registration: boolean;
  notify_on_contact: boolean;
  notify_on_grievance: boolean;
  bcc_advisor: boolean;
  retry_attempts: number;
}

export interface Security {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SessionDetails {
  ip: string;
  location: string;
  os: string;
  browser: string;
  isMobile: boolean;
}

export interface SystemHealth {
  supabase: 'ok' | 'error' | 'loading';
  resend: 'ok' | 'error' | 'loading' | 'unknown';
  version: string;
}

/* ─── Defaults ───────────────────────────────────────────────── */

const DEFAULT_EMAIL: EmailSettings = {
  admin_email: 'hr.sviinfrasolutions@gmail.com',
  send_user_copy: true,
  sender_name: 'SVI Infra',
  sender_email: 'noreply@sviiinfrasolutions.com',
  notify_on_registration: true,
  notify_on_contact: true,
  notify_on_grievance: true,
  bcc_advisor: true,
  retry_attempts: 3,
};

/* ─── Hook ───────────────────────────────────────────────────── */

export function useSettings() {
  const { token, userId, loading: sessionLoading } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState('overview');

  // ── Form states ──
  const [profile, setProfile] = useState<Profile>({
    fullName: '',
    email: '',
    phone: '',
    role: '',
  });
  const [company, setCompany] = useState<Company>({
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
  const [notifications, setNotifications] = useState<Notifications>({
    emailAlerts: true,
    inAppAlerts: true,
    weeklyDigest: false,
  });
  const [globalEmailSharing, setGlobalEmailSharing] = useState<GlobalEmailSharing>({
    enabled: true,
  });
  const [emailSettings, setEmailSettings] = useState<EmailSettings>(DEFAULT_EMAIL);
  const [security, setSecurity] = useState<Security>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // ── UI ui state ──
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [sessionDetails, setSessionDetails] = useState<SessionDetails>({
    ip: 'Detecting...',
    location: 'Detecting...',
    os: 'Windows PC',
    browser: 'Google Chrome',
    isMobile: false,
  });
  const [accentColor, setAccentColor] = useState('gold');
  const [uiDensity, setUiDensity] = useState('comfortable');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const isCompact = uiDensity === 'compact';

  // ── System health (real checks) ──
  const {
    data: systemHealth = { supabase: 'loading' as const, resend: 'loading' as const, version: '' },
  } = useQuery<SystemHealth>({
    queryKey: ['systemHealth', token],
    queryFn: async () => {
      const results: SystemHealth = { supabase: 'error', resend: 'unknown', version: '' };
      try {
        const { error: pingErr } = await supabase.from('portal_settings').select('key').limit(1);
        results.supabase = pingErr ? 'error' : 'ok';
      } catch {
        results.supabase = 'error';
      }
      try {
        if (!token) throw new Error('no token');
        const res = await fetch('/api/admin/email/status', {
          headers: { Authorization: `Bearer ${token}` },
        });
        results.resend = res.ok ? 'ok' : 'error';
      } catch {
        results.resend = 'error';
      }
      try {
        const pkg = await import('@/package.json' as any);
        results.version = pkg.default?.version || pkg.version || '';
      } catch {
        results.version = '';
      }
      return results;
    },
    enabled: !!token,
    staleTime: 60_000,
  });

  // ── Settings query ──
  const settingsKey = ['portalSettings', token] as const;
  const settingsQuery = useQuery({
    queryKey: settingsKey,
    queryFn: async () => {
      const authHeaders = { Authorization: `Bearer ${token}` };
      const [profileRes, companyRes, notifRes, sharingRes, emailSettingsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        fetch('/api/admin/settings?key=company_info', { headers: authHeaders }),
        fetch(`/api/admin/settings?key=notifications_${userId}`, { headers: authHeaders }),
        fetch('/api/admin/settings?key=global_email_sharing', { headers: authHeaders }),
        fetch('/api/admin/settings?key=email_settings', { headers: authHeaders }),
      ]);
      return { profileRes, companyRes, notifRes, sharingRes, emailSettingsRes };
    },
    enabled: !!token && !!userId && !sessionLoading,
    staleTime: 30_000,
  });

  // ── Load data into form state ──
  useEffect(() => {
    if (!settingsQuery.data) return;
    const { profileRes, companyRes, notifRes, sharingRes, emailSettingsRes } = settingsQuery.data;

    if (profileRes.data) {
      setProfile({
        fullName: profileRes.data.full_name || '',
        email: profileRes.data.email || '',
        phone: profileRes.data.phone || '',
        role: profileRes.data.role || 'admin',
      });
    }

    (async () => {
      try {
        if (companyRes.ok) {
          const json = await companyRes.json();
          if (json.value) setCompany(json.value);
        }
      } catch {
        /* ignore */
      }
      try {
        if (notifRes.ok) {
          const json = await notifRes.json();
          if (json.value && Object.keys(json.value).length > 0) setNotifications(json.value);
        }
      } catch {
        /* ignore */
      }
      try {
        if (sharingRes.ok) {
          const json = await sharingRes.json();
          if (json.value && Object.keys(json.value).length > 0) setGlobalEmailSharing(json.value);
        }
      } catch {
        /* ignore */
      }
      try {
        if (emailSettingsRes.ok) {
          const json = await emailSettingsRes.json();
          if (json.value && Object.keys(json.value).length > 0) {
            setEmailSettings((prev) => ({ ...prev, ...json.value }));
          }
        }
      } catch {
        /* ignore */
      }
    })();
  }, [settingsQuery.data]);

  // ── Local appearance settings ──
  useEffect(() => {
    const cachedAccent = localStorage.getItem('svi-settings-accent');
    const cachedDensity = localStorage.getItem('svi-settings-density');
    if (cachedAccent) setAccentColor(cachedAccent);
    if (cachedDensity) setUiDensity(cachedDensity);
  }, []);

  // ── Accent color CSS vars ──
  useEffect(() => {
    const c = ACCENTS.find((a) => a.id === accentColor) || ACCENTS[0];
    const root = document.documentElement;
    root.style.setProperty('--color-brand-gold', c.color);
    root.style.setProperty('--color-brand-gold-light', c.light);
    root.style.setProperty('--color-brand-gold-dark', c.dark);
  }, [accentColor]);

  // ── IP geolocation ──
  useEffect(() => {
    const uaInfo = getUserAgentInfo();
    fetch('https://ipapi.co/json/')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setSessionDetails({
          ip: d.ip || '127.0.0.1',
          location: d.city ? `${d.city}, ${d.region || d.country_name}` : 'Noida, India',
          os: uaInfo.os,
          browser: uaInfo.browser,
          isMobile: uaInfo.isMobile,
        });
      })
      .catch(() => {
        setSessionDetails({
          ip: '103.45.201.32 (Local ISP)',
          location: 'Noida, India',
          os: uaInfo.os,
          browser: uaInfo.browser,
          isMobile: uaInfo.isMobile,
        });
      });
  }, []);

  // ── Mutations ──

  const saveSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key, value }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Save failed');
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKey });
    },
  });

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.fullName.trim()) {
      showToast('error', 'Full Name is required.');
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ full_name: profile.fullName, phone: profile.phone }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update profile.');
      showToast('success', 'Profile updated successfully!');
    } catch (e) {
      showToast('error', (e as Error).message || 'Failed to save profile.');
    }
  };

  const saveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.company_name.trim()) {
      showToast('error', 'Company Name is required.');
      return;
    }
    try {
      await saveSettingMutation.mutateAsync({ key: 'company_info', value: company });
      showToast('success', 'Company details saved!');
    } catch {
      showToast('error', 'Failed to save company details.');
    }
  };

  const toggleNotification = async (field: keyof Notifications) => {
    const updated = { ...notifications, [field]: !notifications[field] };
    setNotifications(updated);
    try {
      await saveSettingMutation.mutateAsync({ key: `notifications_${userId}`, value: updated });
      showToast('success', 'Preferences updated!');
    } catch {
      setNotifications(notifications);
      showToast('error', 'Failed to save preferences.');
    }
  };

  const toggleGlobalEmailSharing = async () => {
    const updated = { enabled: !globalEmailSharing.enabled };
    setGlobalEmailSharing(updated);
    try {
      await saveSettingMutation.mutateAsync({ key: 'global_email_sharing', value: updated });
      showToast('success', 'Email sharing updated!');
    } catch {
      setGlobalEmailSharing(globalEmailSharing);
      showToast('error', 'Failed to save.');
    }
  };

  const saveEmailSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSettings.admin_email.trim()) {
      showToast('error', 'Admin email is required.');
      return;
    }
    try {
      await saveSettingMutation.mutateAsync({ key: 'email_settings', value: emailSettings });
      showToast('success', 'Email settings saved!');
    } catch {
      showToast('error', 'Failed to save email settings.');
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!security.currentPassword || !security.newPassword || !security.confirmPassword) {
      showToast('error', 'All password fields are required.');
      return;
    }
    if (security.newPassword.length < 8) {
      showToast('error', 'New password must be at least 8 chars.');
      return;
    }
    if (security.newPassword !== security.confirmPassword) {
      showToast('error', 'Passwords do not match.');
      return;
    }

    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: security.currentPassword,
      });
      if (signInErr) throw new Error('Current password is incorrect.');

      const { error: updateErr } = await supabase.auth.updateUser({
        password: security.newPassword,
      });
      if (updateErr) throw new Error(updateErr.message);

      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('success', 'Password changed securely!');
    } catch (e) {
      showToast('error', (e as Error).message || 'Failed to update password.');
    }
  };

  const selectAccent = (id: string) => {
    setAccentColor(id);
    localStorage.setItem('svi-settings-accent', id);
    showToast('success', `Accent set to ${id}!`);
  };

  const selectDensity = (id: string) => {
    setUiDensity(id);
    localStorage.setItem('svi-settings-density', id);
    showToast('success', `Density set to ${id}!`);
  };

  return {
    activeTab,
    setActiveTab,
    profile,
    setProfile,
    company,
    setCompany,
    notifications,
    setNotifications,
    globalEmailSharing,
    emailSettings,
    setEmailSettings,
    security,
    setSecurity,
    showCurrentPass,
    setShowCurrentPass,
    showNewPass,
    setShowNewPass,
    showConfirmPass,
    setShowConfirmPass,
    sessionDetails,
    accentColor,
    uiDensity,
    isCompact,
    toast,
    setToast,
    systemHealth,
    saveLoading: saveSettingMutation.isPending,
    saveProfile,
    saveCompany,
    toggleNotification,
    toggleGlobalEmailSharing,
    saveEmailSettings,
    updatePassword,
    selectAccent,
    selectDensity,
    showToast,
    theme,
    setTheme,
    token,
    userId,
  };
}
