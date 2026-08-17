'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { AlertCircle } from 'lucide-react';
import Captcha from '@/src/components/Captcha';
import { useRegistrationForm } from '@/src/hooks/useRegistrationForm';

import PersonalInfoSection from './sections/PersonalInfoSection';
import DocumentsSection from './sections/DocumentsSection';
import AddressSection from './sections/AddressSection';
import PropertySection from './sections/PropertySection';
import RegistrationReview from './RegistrationReview';
import PaymentModal from './PaymentModal';

export default function RegistrationForm() {
  const t = useTranslations('pages.registration');
  const {
    isSubmitting,
    formData,
    errors,
    submitError,
    photoFile,
    panCardFile,
    setCaptchaAnswer,
    captchaError,
    compressing,
    advisors,
    projects,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    showReview,
    setShowReview,
    copiedField,
    draftRestored,
    attempted,
    handleChange,
    handleFileChange,
    removeFile,
    handleSubmit,
    handleConfirmPayment,
    handleCopy,
  } = useRegistrationForm(t);

  return (
    <>
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-5xl">
          {!showReview ? (
            <form
              onSubmit={handleSubmit}
              className="relative border border-gray-200 bg-white p-8 shadow-2xl md:p-12 dark:border-gray-700 dark:bg-gray-800"
              noValidate
            >
              {/* Honeypot: hidden from humans, bots fill it and get rejected */}
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <label htmlFor="website">Leave this field empty</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  onChange={handleChange}
                />
              </div>
              {attempted && Object.keys(errors).length > 0 && (
                <div
                  className="mb-6 rounded border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950"
                  role="alert"
                >
                  <p className="flex items-center gap-1 text-sm font-medium text-red-800 dark:text-red-200">
                    <AlertCircle size={16} />
                    {Object.keys(errors).length} field{Object.keys(errors).length > 1 ? 's' : ''}{' '}
                    need
                    {Object.keys(errors).length === 1 ? 's' : ''} your attention
                  </p>
                  <ul className="mt-2 list-inside list-disc text-xs text-red-600 dark:text-red-300">
                    {Object.entries(errors).map(([field, msg]) => (
                      <li key={field}>
                        <button
                          type="button"
                          onClick={() => {
                            document
                              .getElementById(field)
                              ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            document.getElementById(field)?.focus();
                          }}
                          className="underline hover:no-underline"
                        >
                          {msg}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <PersonalInfoSection
                  formData={formData}
                  errors={errors}
                  attempted={attempted}
                  t={t}
                  onChange={handleChange}
                />

                <DocumentsSection
                  formData={formData}
                  errors={errors}
                  attempted={attempted}
                  t={t}
                  onChange={handleChange}
                  onFileChange={handleFileChange}
                  onRemoveFile={removeFile}
                  photoFile={photoFile}
                  panCardFile={panCardFile}
                  compressing={compressing}
                />

                <AddressSection
                  formData={formData}
                  errors={errors}
                  attempted={attempted}
                  t={t}
                  onChange={handleChange}
                />

                <PropertySection
                  formData={formData}
                  errors={errors}
                  attempted={attempted}
                  t={t}
                  onChange={handleChange}
                  advisors={advisors}
                  projects={projects}
                />

                <div className="sm:col-span-2">
                  <Captcha onValidate={setCaptchaAnswer} error={captchaError} />
                </div>
              </div>

              <div className="mt-8">
                {draftRestored && (
                  <p className="mb-4 flex items-center gap-1 text-xs text-amber-600">
                    <AlertCircle size={12} /> Draft recovered from your last session
                  </p>
                )}
                {submitError && (
                  <p className="mb-4 flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle size={12} /> {submitError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-navy hover:bg-brand-gold text-brand-gold hover:text-brand-navy border-brand-navy flex w-full items-center justify-center gap-2 border py-4 text-xs font-bold tracking-widest uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-600 dark:bg-gray-700"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 animate-spin border-2 border-current border-t-transparent"></div>
                  ) : (
                    t('submitButton')
                  )}
                </button>
              </div>
            </form>
          ) : (
            <RegistrationReview
              formData={formData}
              photoFile={photoFile}
              panCardFile={panCardFile}
              t={t}
              onEdit={() => {
                setShowReview(false);
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
              }}
              onConfirm={() => {
                setIsPaymentModalOpen(true);
              }}
            />
          )}

          <div className="mt-6 space-y-2 text-center">
            <p className="text-[11px] text-gray-500">
              {t('noteTitle')} {t('note1')}
            </p>
            <p className="text-[11px] text-gray-500">{t('note2')}</p>
          </div>

          <div className="bg-brand-bg text-brand-navy dark:bg-brand-dark-bg mt-16 p-12 text-center dark:text-white">
            <h2 className="mb-4 font-serif text-3xl">{t('dreamHomeTitle')}</h2>
            <p className="mb-8 text-sm text-gray-600 dark:text-gray-300">{t('dreamHomeDesc')}</p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/projects/current"
                className="bg-brand-gold text-brand-navy hover:bg-brand-gold/90 px-8 py-3 text-xs font-bold tracking-widest uppercase transition-colors"
              >
                {t('viewProjects')}
              </a>
              <a
                href="/contact"
                className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-navy border px-8 py-3 text-xs font-bold tracking-widest uppercase transition-colors"
              >
                {t('contactUs')}
              </a>
            </div>
          </div>
        </div>
      </div>

      {isPaymentModalOpen && (
        <PaymentModal
          t={t}
          onClose={() => setIsPaymentModalOpen(false)}
          onConfirm={handleConfirmPayment}
          isSubmitting={isSubmitting}
          submitError={submitError}
          copiedField={copiedField}
          handleCopy={handleCopy}
        />
      )}
    </>
  );
}
