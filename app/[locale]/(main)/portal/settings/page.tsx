'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useAuthStore } from '@/src/stores/authStore';
import { supabase } from '@/src/lib/supabase/client';
import { Loader2, User, Mail, Lock, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function PortalSettings() {
  const t = useTranslations('pages.portalSettings');
  const { profile, userId, setProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    email: profile?.email || '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    try {
      // Update Auth Email & Password if changed
      const updates: { email?: string; password?: string } = {};
      if (formData.email !== profile?.email && formData.email) {
        updates.email = formData.email;
      }
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error(t('passwordsDoNotMatch'));
          setLoading(false);
          return;
        }
        updates.password = formData.newPassword;
      }

      if (Object.keys(updates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(updates);
        if (authError) throw authError;

        if (updates.email) {
          toast.success(t('emailConfirmationSent'));
        }
      }

      // Update Profile Name if changed
      if (formData.fullName !== profile?.full_name) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ full_name: formData.fullName })
          .eq('id', userId);

        if (profileError) throw profileError;

        // Update local store
        if (profile) {
          setProfile({ ...profile, full_name: formData.fullName });
        }
      }

      toast.success(t('updateSuccess'));
      setFormData((prev) => ({ ...prev, newPassword: '', confirmPassword: '' }));
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || t('updateError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 lg:space-y-8">
      <div>
        <h1 className="flex items-center gap-3 font-serif text-2xl font-bold text-gray-900 lg:text-3xl dark:text-white">
          {t('title')}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">{t('subtitle')}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700/50 dark:bg-gray-800"
      >
        <div className="p-6 lg:p-8">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-4">
              <h2 className="border-b border-gray-100 pb-2 text-xl font-bold text-gray-900 dark:border-gray-700/50 dark:text-white">
                {t('sections.personal.title')}
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('sections.personal.fullName')}
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pl-10 text-gray-900 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#0256B4] dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:ring-[#E8D17A]"
                      placeholder={t('sections.personal.fullNamePlaceholder')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('sections.personal.email')}
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pl-10 text-gray-900 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#0256B4] dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:ring-[#E8D17A]"
                      placeholder={t('sections.personal.emailPlaceholder')}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <h2 className="border-b border-gray-100 pb-2 text-xl font-bold text-gray-900 dark:border-gray-700/50 dark:text-white">
                {t('sections.security.title')}
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('sections.security.newPassword')}
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pl-10 text-gray-900 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#0256B4] dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:ring-[#E8D17A]"
                      placeholder={t('sections.security.newPasswordPlaceholder')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('sections.security.confirmPassword')}
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <ShieldCheck className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pl-10 text-gray-900 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#0256B4] dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:ring-[#E8D17A]"
                      placeholder={t('sections.security.confirmPasswordPlaceholder')}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl bg-[#0256B4] px-6 py-3 font-medium text-white transition-colors hover:bg-[#02428A] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#E8D17A] dark:text-gray-900 dark:hover:bg-[#d4be66]"
              >
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {t('saveChanges')}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
