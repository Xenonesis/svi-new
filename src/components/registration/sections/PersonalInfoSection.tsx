import React, { ChangeEvent } from 'react';
import { FormInput } from '../FormElements';
import { FormData } from '@/src/types/registration';

interface PersonalInfoSectionProps {
  formData: FormData;
  errors: Record<string, string>;
  attempted: boolean;
  t: any;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function PersonalInfoSection({
  formData,
  errors,
  attempted,
  t,
  onChange,
}: PersonalInfoSectionProps) {
  return (
    <>
      <FormInput
        attempted={attempted}
        name="firstName"
        hint={t('firstNameHint')}
        autoComplete="given-name"
        label={t('firstName')}
        value={formData.firstName}
        errors={errors}
        onChange={onChange}
        type="text"
        placeholder={t('firstNamePlaceholder')}
      />
      <FormInput
        attempted={attempted}
        name="lastName"
        hint={t('lastNameHint')}
        autoComplete="family-name"
        label={t('lastName')}
        value={formData.lastName}
        errors={errors}
        onChange={onChange}
        type="text"
        placeholder={t('lastNamePlaceholder')}
      />

      <FormInput
        attempted={attempted}
        name="mobileNo"
        maxLen={10}
        hint={t('mobileHint')}
        autoComplete="tel-national"
        label={t('mobileNo')}
        value={formData.mobileNo}
        errors={errors}
        onChange={onChange}
        type="tel"
        placeholder={t('mobilePlaceholder')}
      />
      <FormInput
        attempted={attempted}
        name="email"
        hint={t('emailHint')}
        autoComplete="email"
        label={t('email')}
        value={formData.email}
        errors={errors}
        onChange={onChange}
        type="email"
        placeholder={t('emailPlaceholder')}
      />

      <FormInput
        attempted={attempted}
        name="soWoDo"
        hint={t('soWoDoHint')}
        label={t('soWoDo')}
        value={formData.soWoDo}
        errors={errors}
        onChange={onChange}
        type="text"
        placeholder={t('soWoDoPlaceholder')}
      />
      <FormInput
        attempted={attempted}
        name="dob"
        label={t('dob')}
        autoComplete="bday"
        value={formData.dob}
        errors={errors}
        onChange={onChange}
        type="date"
      />
    </>
  );
}
