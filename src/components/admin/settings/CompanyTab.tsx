'use client';

import { RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { getSettingsDensity, getSettingsInputClass, SETTINGS_LABEL_CLASS } from './helpers';

interface Company {
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

interface CompanyTabProps {
  company: Company;
  setCompany: React.Dispatch<React.SetStateAction<Company>>;
  saveLoading: boolean;
  handleSaveCompany: (e: React.FormEvent) => Promise<void>;
  isCompact: boolean;
}

export function CompanyTab({
  company,
  setCompany,
  saveLoading,
  handleSaveCompany,
  isCompact,
}: CompanyTabProps) {
  const { densityPadding, densityGridGap, densitySecSpacing } = getSettingsDensity(isCompact);
  const inputClass = getSettingsInputClass(densityPadding);
  const labelClass = SETTINGS_LABEL_CLASS;

  return (
    <form onSubmit={handleSaveCompany} className={densitySecSpacing}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-brand-navy mb-1 font-sans font-serif text-xl font-bold dark:text-white">
          Company Metadata Settings
        </h2>
        <p className="font-sans text-xs text-gray-500 dark:text-gray-400">
          Configure SVI Infra metadata injected dynamically into payment plans, receipts and
          letters.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className={`grid gap-5 md:grid-cols-2 ${densityGridGap}`}
      >
        <div className="md:col-span-2">
          <label className={labelClass}>Company Registered Name</label>
          <input
            type="text"
            value={company.company_name}
            onChange={(e) => setCompany({ ...company, company_name: e.target.value })}
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
            onChange={(e) => setCompany({ ...company, company_address: e.target.value })}
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
            onChange={(e) => setCompany({ ...company, company_email: e.target.value })}
            placeholder="info@sviinfra.com"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Official Contact Phone</label>
          <input
            type="text"
            value={company.company_phone}
            onChange={(e) => setCompany({ ...company, company_phone: e.target.value })}
            placeholder="+91 98765 43210"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>GST Identification Number (GSTIN)</label>
          <input
            type="text"
            value={company.company_gst}
            onChange={(e) => setCompany({ ...company, company_gst: e.target.value })}
            placeholder="09AAECS1234F1Z5"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>State RERA Registration No.</label>
          <input
            type="text"
            value={company.company_rera}
            onChange={(e) => setCompany({ ...company, company_rera: e.target.value })}
            placeholder="UPRERAPRJ123456"
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Corporate Website Address</label>
          <input
            type="url"
            value={company.company_website}
            onChange={(e) => setCompany({ ...company, company_website: e.target.value })}
            placeholder="https://sviinfra.com"
            className={inputClass}
          />
        </div>
      </motion.div>

      {/* Bank Account Details Grouped Container */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="border-brand-gold/15 bg-brand-gold/[0.015] dark:border-brand-gold/25 dark:bg-brand-gold/[0.005] shadow-[0_4px_20px_rgba(212, 175, 55,0.03)] rounded-2xl border p-5"
      >
        <div className="mb-4">
          <h3 className="text-brand-gold font-sans text-xs font-extrabold tracking-widest uppercase">
            Bank Account Details (For Documents)
          </h3>
          <p className="mt-0.5 font-sans text-[10px] text-gray-400">
            Billing details automatically added to invoices and plan layouts.
          </p>
        </div>

        <div className={`grid gap-4 md:grid-cols-2 ${densityGridGap}`}>
          <div>
            <label className={labelClass}>Bank Account Name</label>
            <input
              type="text"
              value={company.bank_account_name || ''}
              onChange={(e) => setCompany({ ...company, bank_account_name: e.target.value })}
              placeholder="Svi Infra Solutions Pvt. Ltd"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Bank Account Number</label>
            <input
              type="text"
              value={company.bank_account_no || ''}
              onChange={(e) => setCompany({ ...company, bank_account_no: e.target.value })}
              placeholder="0894102000013837"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Bank Name</label>
            <input
              type="text"
              value={company.bank_name || ''}
              onChange={(e) => setCompany({ ...company, bank_name: e.target.value })}
              placeholder="IDBI BANK"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>IFSC Code</label>
            <input
              type="text"
              value={company.bank_ifsc || ''}
              onChange={(e) => setCompany({ ...company, bank_ifsc: e.target.value })}
              placeholder="IBKL0000894"
              className={inputClass}
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="flex justify-end pt-4"
      >
        <motion.button
          type="submit"
          disabled={saveLoading}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex cursor-pointer items-center justify-center gap-2 rounded-lg px-6 py-3.5 font-sans text-xs font-bold tracking-widest uppercase shadow-md transition-all disabled:opacity-60"
        >
          {saveLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Save Company Info'}
        </motion.button>
      </motion.div>
    </form>
  );
}
