import React, { ChangeEvent } from 'react';
import { FormInput, FormFileUpload } from '../FormElements';
import { FormData } from '@/src/types/registration';

interface DocumentsSectionProps {
  formData: FormData;
  errors: Record<string, string>;
  attempted: boolean;
  t: any;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>, type: 'photo' | 'panCard') => void;
  onRemoveFile: (type: 'photo' | 'panCard') => void;
  photoFile: File | null;
  panCardFile: File | null;
  compressing: 'photo' | 'panCard' | null;
}

export default function DocumentsSection({
  formData,
  errors,
  attempted,
  t,
  onChange,
  onFileChange,
  onRemoveFile,
  photoFile,
  panCardFile,
  compressing,
}: DocumentsSectionProps) {
  return (
    <>
      <div className="sm:col-span-2">
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-start">
            <span className="bg-white pr-4 text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase dark:bg-gray-800">
              {t('sectionDocuments')}
            </span>
          </div>
        </div>
      </div>

      <FormFileUpload
        type="photo"
        label={t('photoUpload')}
        file={photoFile}
        errors={errors}
        onFileChange={onFileChange}
        onRemoveFile={onRemoveFile}
        compressing={compressing === 'photo'}
      />
      <FormFileUpload
        type="panCard"
        label={t('panUpload')}
        file={panCardFile}
        errors={errors}
        onFileChange={onFileChange}
        onRemoveFile={onRemoveFile}
        compressing={compressing === 'panCard'}
      />

      <FormInput
        attempted={attempted}
        name="aadharNumber"
        maxLen={12}
        hint={t('aadharHint')}
        label={t('aadharNumber')}
        value={formData.aadharNumber}
        errors={errors}
        onChange={onChange}
        type="text"
        placeholder={t('aadharPlaceholder')}
      />
      <FormInput
        attempted={attempted}
        name="panNumber"
        maxLen={10}
        hint={t('panHint')}
        label={t('panNumber')}
        value={formData.panNumber}
        errors={errors}
        onChange={onChange}
        type="text"
        placeholder={t('panPlaceholder')}
      />
    </>
  );
}
