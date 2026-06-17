'use client';

import { Shield, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { getSettingsDensity, getSettingsInputClass, SETTINGS_LABEL_CLASS } from './helpers';

interface Profile {
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

interface ProfileTabProps {
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  saveLoading: boolean;
  handleSaveProfile: (e: React.FormEvent) => Promise<void>;
  isCompact: boolean;
}

export function ProfileTab({
  profile,
  setProfile,
  saveLoading,
  handleSaveProfile,
  isCompact,
}: ProfileTabProps) {
  const { densityPadding, densityGridGap, densitySecSpacing } = getSettingsDensity(isCompact);
  const inputClass = getSettingsInputClass(densityPadding);
  const disabledInputClass = `w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50/50 text-sm text-gray-400 dark:border-gray-800 dark:bg-white/2 font-sans ${densityPadding}`;
  const labelClass = SETTINGS_LABEL_CLASS;

  return (
    <form onSubmit={handleSaveProfile} className={densitySecSpacing}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-brand-navy mb-1 font-sans font-serif text-xl font-bold dark:text-white">
          Profile Information
        </h2>
        <p className="font-sans text-xs text-gray-500 dark:text-gray-400">
          Update your system details, personal records and communication accounts.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className={`grid gap-5 md:grid-cols-2 ${densityGridGap}`}
      >
        <div className="flex items-center gap-4 py-2 md:col-span-2">
          <div className="border-brand-gold/20 bg-brand-gold/5 text-brand-gold relative flex h-16 w-16 items-center justify-center rounded-2xl border text-2xl font-bold shadow-inner">
            {profile.fullName.slice(0, 2).toUpperCase() || 'AD'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-sans text-sm font-bold text-gray-900 dark:text-white">
                {profile.fullName || 'Admin User'}
              </h3>
              <span className="bg-brand-gold/15 border-brand-gold/25 text-brand-gold inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[8px] font-bold tracking-widest uppercase">
                <Shield className="h-2 w-2" /> {profile.role}
              </span>
            </div>
            <p className="mt-0.5 font-sans text-xs text-gray-500 dark:text-gray-400">
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
          <p className="mt-1 font-sans text-[10px] text-gray-400 dark:text-gray-600">
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex justify-end pt-4"
      >
        <motion.button
          type="submit"
          disabled={saveLoading}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex cursor-pointer items-center justify-center gap-2 rounded-lg px-6 py-3.5 font-sans text-xs font-bold tracking-widest uppercase shadow-md transition-all disabled:opacity-60"
        >
          {saveLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Save Changes'}
        </motion.button>
      </motion.div>
    </form>
  );
}
