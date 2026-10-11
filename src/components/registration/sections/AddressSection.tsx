import React, { ChangeEvent, useState, useEffect } from 'react';
import { FormInput, FormSelect, FormCityInput } from '../FormElements';
import { FormData } from '@/src/types/registration';
import { INDIAN_STATES_AND_UTS } from '@/src/lib/constants';
import { lookupPincode } from '@/src/lib/postal';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface AddressSectionProps {
  formData: FormData;
  errors: Record<string, string>;
  attempted: boolean;
  t: (key: string) => string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function AddressSection({
  formData,
  errors,
  attempted,
  t,
  onChange,
}: AddressSectionProps) {
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeSuccess, setPincodeSuccess] = useState(false);

  // When 6 digits are typed in pincode, trigger auto-lookup for State & City
  useEffect(() => {
    const cleanedPin = formData.pincode.replace(/\D/g, '');
    if (cleanedPin.length !== 6) {
      setPincodeSuccess(false);
      return;
    }

    let active = true;
    setPincodeLoading(true);

    lookupPincode(cleanedPin)
      .then((info) => {
        if (!active) return;
        setPincodeLoading(false);
        if (info) {
          setPincodeSuccess(true);
          // Auto-fill state if matched with list
          const matchedState = INDIAN_STATES_AND_UTS.find(
            (s) => s.value.toLowerCase() === info.state.toLowerCase()
          );
          if (matchedState && matchedState.value !== formData.state) {
            const stateEvent = {
              target: {
                name: 'state',
                value: matchedState.value,
              },
            } as unknown as ChangeEvent<HTMLSelectElement>;
            onChange(stateEvent);
          }

          // Auto-fill city/district if present
          const cityToSet = info.district || info.postOffices[0];
          if (cityToSet && cityToSet !== formData.city) {
            const cityEvent = {
              target: {
                name: 'city',
                value: cityToSet,
              },
            } as unknown as ChangeEvent<HTMLInputElement>;
            onChange(cityEvent);
          }
        } else {
          setPincodeSuccess(false);
        }
      })
      .catch(() => {
        if (active) {
          setPincodeLoading(false);
          setPincodeSuccess(false);
        }
      });

    return () => {
      active = false;
    };
  }, [formData.pincode, formData.state, formData.city, onChange]);

  const handlePincodeChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 6);
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'pincode',
        value: digitsOnly,
      },
    } as unknown as ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  const handleStateChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    onChange(e);
    // When state manually changes, reset city to avoid cross-state mismatch
    if (formData.city) {
      const resetCityEvent = {
        target: {
          name: 'city',
          value: '',
        },
      } as unknown as ChangeEvent<HTMLInputElement>;
      onChange(resetCityEvent);
    }
  };

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

      {/* 1. PIN Code first for smart location detection */}
      <div className="relative">
        <FormInput
          attempted={attempted}
          name="pincode"
          hint={pincodeSuccess ? t('pincodeVerified') : t('pincodeHint')}
          autoComplete="postal-code"
          label={t('pincode')}
          value={formData.pincode}
          errors={errors}
          onChange={handlePincodeChange}
          type="text"
          placeholder={t('pincodePlaceholder')}
          maxLen={6}
          required={false}
        />
        {pincodeLoading && (
          <div className="pointer-events-none absolute top-9 right-3 flex items-center text-amber-500">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
        {!pincodeLoading && pincodeSuccess && (
          <div className="pointer-events-none absolute top-9 right-3 flex items-center text-emerald-500">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* 2. State */}
      <FormSelect
        attempted={attempted}
        name="state"
        hint={t('stateHint')}
        label={t('state')}
        value={formData.state}
        options={INDIAN_STATES_AND_UTS}
        errors={errors}
        onChange={handleStateChange}
        placeholder={t('statePlaceholder')}
      />

      {/* 3. City */}
      <FormCityInput
        attempted={attempted}
        name="city"
        hint={t('cityHint')}
        label={t('city')}
        value={formData.city}
        errors={errors}
        onChange={onChange}
        placeholder={t('cityPlaceholder')}
        customCityPlaceholder={t('customCityPlaceholder')}
        otherOptionLabel={t('otherCityOption')}
        stateValue={formData.state}
      />

      {/* 4. House / Street Address */}
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
