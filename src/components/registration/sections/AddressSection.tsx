import React, { ChangeEvent } from 'react';
import { FormInput } from '../FormElements';
import { FormData } from '@/src/types/registration';

interface AddressSectionProps {
  formData: FormData;
  errors: Record<string, string>;
  attempted: boolean;
  t: any;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function AddressSection({
  formData,
  errors,
  attempted,
  t,
  onChange,
}: AddressSectionProps) {
  return (
    <>
      <div className="sm:col-span-2">
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-start">
            <span className="bg-white pr-4 text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase dark:bg-gray-800">
              {t('sectionAddress')}
            </span>
          </div>
        </div>
      </div>

      <FormInput
        attempted={attempted}
        name="state"
        hint={t('stateHint')}
        autoComplete="address-level1"
        label={t('state')}
        value={formData.state}
        errors={errors}
        onChange={onChange}
        type="text"
        placeholder={t('statePlaceholder')}
      />
      <FormInput
        attempted={attempted}
        name="city"
        hint={t('cityHint')}
        autoComplete="address-level2"
        label={t('city')}
        value={formData.city}
        errors={errors}
        onChange={onChange}
        type="text"
        placeholder={t('cityPlaceholder')}
      />

      <FormInput
        attempted={attempted}
        name="address"
        hint={t('addressHint')}
        autoComplete="street-address"
        label={t('address')}
        value={formData.address}
        errors={errors}
        onChange={onChange}
        type="text"
        placeholder={t('addressPlaceholder')}
      />
    </>
  );
}
