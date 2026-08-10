import React, { ChangeEvent } from 'react';
import { FormInput, FormSelect } from '../FormElements';
import { FormData } from '@/src/types/registration';

interface PropertySectionProps {
  formData: FormData;
  errors: Record<string, string>;
  attempted: boolean;
  t: any;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  advisors: string[];
  projects: { value: string; label: string }[];
}

export default function PropertySection({
  formData,
  errors,
  attempted,
  t,
  onChange,
  advisors,
  projects,
}: PropertySectionProps) {
  const propertySizes = [
    { value: '50-100', label: t('sizes.50-100') },
    { value: '100-200', label: t('sizes.100-200') },
    { value: '200-400', label: t('sizes.200-400') },
    { value: '400-700', label: t('sizes.400-700') },
    { value: '700-1000', label: t('sizes.700-1000') },
    { value: '1000-1500', label: t('sizes.1000-1500') },
    { value: '1500-2000', label: t('sizes.1500-2000') },
  ];

  const propertyTypes = [
    { value: 'residential-plot', label: t('types.residential-plot') },
    { value: 'commercial-shop', label: t('types.commercial-shop') },
    { value: 'luxury-farm-house', label: t('types.luxury-farm-house') },
  ];

  const plotPreferences = [
    { value: 'main-road', label: t('preferences.main-road') },
    { value: 'park', label: t('preferences.park') },
    { value: 'corner', label: t('preferences.corner') },
    { value: 'none', label: t('preferences.none') },
  ];

  const paymentPlans = [
    { value: 'one-time', label: t('plans.one-time') },
    { value: '3-months', label: t('plans.3-months') },
    { value: '6-months', label: t('plans.6-months') },
    { value: '12-months', label: t('plans.12-months') },
    { value: '18-months', label: t('plans.18-months') },
    { value: '24-months', label: t('plans.24-months') },
  ];

  const paymentModes = [
    { value: 'online', label: t('modes.online') },
    { value: 'cash', label: t('modes.cash') },
    { value: 'net-banking', label: t('modes.net-banking') },
  ];

  return (
    <>
      <div className="sm:col-span-2">
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-start">
            <span className="bg-white pr-4 text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase dark:bg-gray-800">
              {t('sectionProperty')}
            </span>
          </div>
        </div>
      </div>

      <FormSelect
        attempted={attempted}
        name="advisorName"
        label={t('advisorName')}
        value={formData.advisorName}
        options={advisors}
        errors={errors}
        onChange={onChange}
        placeholder={t('advisorPlaceholder')}
      />

      <FormSelect
        attempted={attempted}
        name="project"
        label={t('selectProjects')}
        value={formData.project}
        options={projects}
        errors={errors}
        onChange={onChange}
        placeholder={t('projectPlaceholder')}
      />
      <FormSelect
        attempted={attempted}
        name="propertySize"
        label={t('propertySize')}
        value={formData.propertySize}
        options={propertySizes}
        errors={errors}
        onChange={onChange}
        placeholder={t('sizePlaceholder')}
      />

      <FormSelect
        attempted={attempted}
        name="propertyType"
        label={t('propertyType')}
        value={formData.propertyType}
        options={propertyTypes}
        errors={errors}
        onChange={onChange}
        placeholder={t('typePlaceholder')}
      />
      <FormSelect
        attempted={attempted}
        name="plotPreference"
        label={t('plotPreference')}
        value={formData.plotPreference}
        options={plotPreferences}
        errors={errors}
        onChange={onChange}
        placeholder={t('preferencePlaceholder')}
      />

      <FormSelect
        attempted={attempted}
        name="paymentPlan"
        label={t('paymentPlan')}
        value={formData.paymentPlan}
        options={paymentPlans}
        errors={errors}
        onChange={onChange}
        placeholder={t('planPlaceholder')}
      />
      <FormSelect
        attempted={attempted}
        name="paymentMode"
        label={t('paymentMode')}
        value={formData.paymentMode}
        options={paymentModes}
        errors={errors}
        onChange={onChange}
        placeholder={t('modePlaceholder')}
      />

      <div className="sm:col-span-2">
        <FormInput
          attempted={attempted}
          name="schemeAmount"
          hint={t('schemeAmountHint')}
          label={t('schemeAmount')}
          value={formData.schemeAmount}
          errors={errors}
          onChange={onChange}
          type="text"
          placeholder={t('schemeAmountPlaceholder')}
        />
      </div>
    </>
  );
}
