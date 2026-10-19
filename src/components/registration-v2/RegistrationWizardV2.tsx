'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trash2 } from 'lucide-react';
import { useRegistrationV2 } from './useRegistrationV2';
import { StepProgressBar } from './StepProgressBar';
import { TrustBannerV2 } from './TrustBannerV2';
import { Step1Applicant } from './steps/Step1Applicant';
import { Step2KycDocuments } from './steps/Step2KycDocuments';
import { Step3PropertyScheme } from './steps/Step3PropertyScheme';
import { Step4ReviewConfirm } from './steps/Step4ReviewConfirm';
import PaymentModal from '@/src/components/registration/PaymentModal';

export interface RegistrationWizardV2Props {
  className?: string;
}

export function RegistrationWizardV2({ className = '' }: RegistrationWizardV2Props) {
  const t = useTranslations('pages.registration');

  // Translation helper with English fallback to avoid throwing on missing keys
  const translate = (key: string): string => {
    try {
      if ('has' in t && typeof t.has === 'function' && !t.has(key)) {
        return key;
      }
      return t(key as Parameters<typeof t>[0]);
    } catch {
      return key;
    }
  };

  const wizard = useRegistrationV2(translate);

  const handleProceedToPayment = () => {
    const isValid = wizard.validateStep4();
    if (isValid) {
      wizard.setIsPaymentModalOpen(true);
    }
  };

  return (
    <div className={`mx-auto max-w-5xl px-4 py-8 md:py-14 ${className}`}>
      {/* Funnel Header */}
      <header className="mb-8 text-center sm:mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-bold tracking-widest text-amber-700 uppercase dark:text-amber-400">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          <span>UP-RERA REGISTERED TOWNSHIPS • PRIORITY ALLOTMENT</span>
        </div>

        <h1 className="text-brand-navy mt-4 font-serif text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl dark:text-white">
          {translate('title') || 'Property Registration & Lottery Application'}
        </h1>

        <div className="bg-brand-gold mx-auto mt-4 mb-4 h-0.5 w-16" aria-hidden="true" />

        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
          {translate('subtitle') ||
            'Complete your verified priority allotment application in 4 straightforward steps with guaranteed allotment transparency.'}
        </p>

        <TrustBannerV2 variant="top" className="mt-6" />
      </header>

      {/* Step Progress Bar */}
      <div className="mb-8 sm:mb-10">
        <StepProgressBar currentStep={wizard.currentStep} onSelectStep={wizard.goToStep} />
      </div>

      {/* Restored Draft Alert Banner */}
      {wizard.draftRestored && (
        <div
          role="status"
          className="mb-8 flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between dark:border-amber-500/20 dark:bg-amber-950/30 dark:text-amber-300"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="text-brand-gold h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                Draft Application Restored
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                We restored your previously saved inputs so you can pick up right where you left
                off.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={wizard.clearDraft}
            className="inline-flex items-center gap-1.5 self-start rounded-lg px-3 py-1.5 text-xs font-bold text-amber-800 transition-all hover:bg-amber-500/20 active:scale-95 sm:self-auto dark:text-amber-300"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Discard Draft</span>
          </button>
        </div>
      )}

      {/* Main Step Container with Smooth Transition Animations */}
      <main className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-xl backdrop-blur-md sm:p-10 dark:border-slate-800 dark:bg-slate-900/70">
        <AnimatePresence mode="wait">
          <motion.div
            key={wizard.currentStep}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {wizard.currentStep === 1 && (
              <Step1Applicant
                formData={wizard.formData}
                errors={wizard.errors}
                touchedFields={wizard.touchedFields}
                attempted={wizard.attemptedSteps[1]}
                t={translate}
                onChange={wizard.handleChange}
                onBlur={wizard.handleBlur}
                onNext={wizard.nextStep}
              />
            )}

            {wizard.currentStep === 2 && (
              <Step2KycDocuments
                formData={wizard.formData}
                errors={wizard.errors}
                touchedFields={wizard.touchedFields}
                attempted={wizard.attemptedSteps[2]}
                t={translate}
                onChange={wizard.handleChange}
                onBlur={wizard.handleBlur}
                photoFile={wizard.photoFile}
                panCardFile={wizard.panCardFile}
                compressing={wizard.compressing}
                onFileChange={wizard.handleFileChange}
                onRemoveFile={wizard.removeFile}
                onNext={wizard.nextStep}
                onPrev={wizard.prevStep}
              />
            )}

            {wizard.currentStep === 3 && (
              <Step3PropertyScheme
                formData={wizard.formData}
                errors={wizard.errors}
                touchedFields={wizard.touchedFields}
                attempted={wizard.attemptedSteps[3]}
                t={translate}
                onChange={wizard.handleChange}
                onBlur={wizard.handleBlur}
                advisors={wizard.advisors}
                projects={wizard.projects}
                onNext={wizard.nextStep}
                onPrev={wizard.prevStep}
              />
            )}
            {wizard.currentStep === 4 && (
              <Step4ReviewConfirm
                formData={wizard.formData}
                errors={wizard.errors}
                attempted={wizard.attemptedSteps[4]}
                t={translate}
                onChange={wizard.handleChange}
                photoFile={wizard.photoFile}
                panCardFile={wizard.panCardFile}
                captchaAnswer={wizard.captchaAnswer}
                captchaError={wizard.captchaError}
                isSubmitting={wizard.isSubmitting}
                submitError={wizard.submitError}
                onCaptchaValidate={wizard.setCaptchaAnswer}
                onEditStep={wizard.goToStep}
                onProceedToPayment={handleProceedToPayment}
                onPrev={wizard.prevStep}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Trust & Support Strip */}
      <footer className="mt-10 sm:mt-14">
        <TrustBannerV2 variant="bottom" />
      </footer>

      {/* Payment Modal */}
      {wizard.isPaymentModalOpen && (
        <PaymentModal
          t={translate}
          onClose={() => wizard.setIsPaymentModalOpen(false)}
          onConfirm={wizard.handleConfirmPayment}
          isSubmitting={wizard.isSubmitting}
          submitError={wizard.submitError}
          copiedField={wizard.copiedField}
          handleCopy={wizard.handleCopy}
        />
      )}
    </div>
  );
}

export default RegistrationWizardV2;
