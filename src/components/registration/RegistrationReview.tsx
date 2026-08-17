import React from 'react';
import { motion } from 'motion/react';
import { ReviewRow } from './FormElements';
import { FormData } from '@/src/types/registration';

interface RegistrationReviewProps {
  formData: FormData;
  photoFile: File | null;
  panCardFile: File | null;
  t: any;
  onEdit: () => void;
  onConfirm: () => void;
}

export default function RegistrationReview({
  formData,
  photoFile,
  panCardFile,
  t,
  onEdit,
  onConfirm,
}: RegistrationReviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gray-200 bg-white p-8 shadow-2xl md:p-12 dark:border-gray-700 dark:bg-gray-800"
    >
      <h2 className="mb-1 font-serif text-2xl text-[#1e293b] dark:text-white">
        {t('paymentModal.title')}
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Please review your details before proceeding to payment
      </p>

      {/* Personal Details */}
      <div className="mb-6">
        <h3 className="mb-3 text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
          {t('sectionPersonal')}
        </h3>
        <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
          <ReviewRow label={t('firstName')} value={formData.firstName} />
          <ReviewRow label={t('lastName')} value={formData.lastName} />
          <ReviewRow label={t('mobileNo')} value={formData.mobileNo} />
          <ReviewRow label={t('email')} value={formData.email} />
          <ReviewRow label={t('soWoDo')} value={formData.soWoDo} />
          <ReviewRow label={t('dob')} value={formData.dob} />
        </div>
      </div>

      {/* Identity Documents */}
      <div className="mb-6">
        <h3 className="mb-3 text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
          {t('sectionDocuments')}
        </h3>
        <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
          <ReviewRow label={t('aadharNumber')} value={formData.aadharNumber} />
          <ReviewRow label={t('panNumber')} value={formData.panNumber} />
          <ReviewRow label={t('photoUpload')} value={photoFile?.name || 'Not uploaded'} />
          <ReviewRow label={t('panUpload')} value={panCardFile?.name || 'Not uploaded'} />
        </div>
      </div>

      {/* Address */}
      <div className="mb-6">
        <h3 className="mb-3 text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
          {t('sectionAddress')}
        </h3>
        <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
          <ReviewRow label={t('state')} value={formData.state} />
          <ReviewRow label={t('city')} value={formData.city} />
          <ReviewRow label={t('address')} value={formData.address} className="sm:col-span-2" />
        </div>
      </div>

      {/* Property & Payment */}
      <div className="mb-8">
        <h3 className="mb-3 text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
          {t('sectionProperty')}
        </h3>
        <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
          <ReviewRow label={t('advisorName')} value={formData.advisorName} />
          <ReviewRow label={t('selectProjects')} value={formData.project} />
          <ReviewRow label={t('propertySize')} value={formData.propertySize} />
          <ReviewRow label={t('propertyType')} value={formData.propertyType} />
          <ReviewRow label={t('plotPreference')} value={formData.plotPreference} />
          <ReviewRow label={t('paymentPlan')} value={formData.paymentPlan} />
          <ReviewRow label={t('paymentMode')} value={formData.paymentMode} />
          <ReviewRow
            label={t('schemeAmount')}
            value={'\u20B9 ' + Number(formData.schemeAmount).toLocaleString('en-IN')}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onEdit}
          className="border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-brand-gold order-2 border px-8 py-3 text-xs font-bold tracking-widest uppercase transition-colors sm:order-1 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Edit Details
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="bg-brand-navy hover:bg-brand-gold text-brand-gold hover:text-brand-navy border-brand-navy order-1 border px-8 py-3 text-xs font-bold tracking-widest uppercase transition-colors sm:order-2"
        >
          Continue to Payment
        </button>
      </div>
    </motion.div>
  );
}
