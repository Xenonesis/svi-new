'use client';

import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Users,
  ShieldCheck,
  CreditCard,
  Building2,
  Ruler,
  Wallet,
  IndianRupee,
  Pencil,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
  Loader2,
  FileText,
  MapPin,
} from 'lucide-react';
import Captcha from '@/src/components/Captcha';
import { calculateSchemeDetails } from '../schemeCalculator';
import type { Step4ReviewConfirmProps } from '../types';

export type { Step4ReviewConfirmProps };

function formatDob(raw: string): string {
  if (!raw) return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split('-');
    return `${d}/${m}/${y}`;
  }
  return raw;
}

function maskAadhaar(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length >= 4) {
    return `•••• •••• ${digits.slice(-4)}`;
  }
  return '•••• •••• ••••';
}

const PROJECT_LABELS: Record<string, string> = {
  'shivani-vatika': 'Shivani Vatika',
  'shayam-angan': 'Shayam Angan',
  'svi-emerald-enclave': 'SVI Emerald Enclave',
};

const PAYMENT_MODE_LABELS: Record<string, string> = {
  online: 'Online (UPI / Net Banking / Card)',
  cheque: 'Cheque / Demand Draft',
  neft: 'NEFT / RTGS Transfer',
  cash: 'Cash / Branch Deposit',
};

function ReviewField({
  label,
  value,
  subvalue,
  icon: Icon,
  badge,
  className = '',
}: {
  label: string;
  value: React.ReactNode;
  subvalue?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  badge?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
        {Icon && <Icon className="text-brand-gold h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
        <span>{label}</span>
      </span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold break-words text-slate-900 dark:text-slate-100">
          {value || '—'}
        </span>
        {badge}
      </div>
      {subvalue && <div className="text-xs text-slate-500 dark:text-slate-400">{subvalue}</div>}
    </div>
  );
}

export function Step4ReviewConfirm({
  formData,
  errors,
  attempted: _attempted,
  t,
  onChange: _onChange,
  photoFile,
  panCardFile,
  captchaAnswer: _captchaAnswer,
  captchaError,
  isSubmitting,
  submitError,
  onCaptchaValidate,
  onEditStep,
  onProceedToPayment,
  onPrev,
}: Step4ReviewConfirmProps) {
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Safe translation helper with English fallback
  const tr = (key: string, fallback: string): string => {
    if (typeof t !== 'function') return fallback;
    try {
      const val = t(key);
      return val && val !== key ? val : fallback;
    } catch {
      return fallback;
    }
  };

  const schemeDetails = calculateSchemeDetails(
    formData.propertySize,
    formData.project,
    formData.paymentPlan
  );

  const effectiveTokenAmount = Number(formData.schemeAmount) || schemeDetails.tokenAmount;
  const fullName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || '—';

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-amber-700 uppercase dark:text-amber-400">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Step 4 of 4 • Final Verification</span>
        </div>
        <h2 className="text-brand-navy mt-3 font-serif text-2xl font-bold tracking-tight sm:text-3xl dark:text-white">
          Review & Confirm Application
        </h2>
        <p className="mt-1.5 text-sm text-slate-600 sm:text-base dark:text-slate-400">
          Please carefully verify your information below before proceeding to secure allotment token
          payment.
        </p>
      </div>

      {/* Global Submit Error Banner */}
      {submitError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
        >
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <p className="font-semibold">{tr('validation.submitError', 'Submission Error')}</p>
            <p className="text-xs text-red-700 dark:text-red-300/90">{submitError}</p>
          </div>
        </div>
      )}

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Card 1: Applicant Details Card */}
        <section
          aria-labelledby="card-applicant-heading"
          className="hover:border-brand-gold/30 dark:hover:border-brand-gold/20 relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-sm transition-all dark:border-slate-800 dark:bg-slate-900/90"
        >
          <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold dark:bg-brand-gold/20 dark:text-brand-gold-light flex h-10 w-10 items-center justify-center rounded-xl border">
                <User className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <span className="text-brand-gold text-[10px] font-bold tracking-widest uppercase">
                  Section 01 • Applicant Dossier
                </span>
                <h3
                  id="card-applicant-heading"
                  className="text-base font-bold text-slate-900 dark:text-white"
                >
                  {tr('sectionPersonal', 'Applicant Personal Details')}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onEditStep(1)}
              aria-label="Edit Applicant Details"
              className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 dark:text-brand-gold-light inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors active:scale-95"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <ReviewField label={tr('applicantName', 'Full Name')} value={fullName} icon={User} />
            <ReviewField
              label={tr('mobileNo', 'Mobile Number')}
              value={formData.mobileNo ? `+91 ${formData.mobileNo}` : '—'}
              icon={Phone}
            />
            <ReviewField label={tr('email', 'Email Address')} value={formData.email} icon={Mail} />
            <ReviewField
              label={tr('soWoDo', 'Father / Husband / Guardian')}
              value={formData.soWoDo}
              icon={Users}
            />
            <ReviewField
              label={tr('dob', 'Date of Birth')}
              value={formatDob(formData.dob)}
              icon={Calendar}
            />
          </div>
        </section>

        {/* Card 2: KYC & Address Card */}
        <section
          aria-labelledby="card-kyc-heading"
          className="hover:border-brand-gold/30 dark:hover:border-brand-gold/20 relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-sm transition-all dark:border-slate-800 dark:bg-slate-900/90"
        >
          <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase dark:text-emerald-400">
                  Section 02 • Identity & Domicile
                </span>
                <h3
                  id="card-kyc-heading"
                  className="text-base font-bold text-slate-900 dark:text-white"
                >
                  {tr('sectionDocuments', 'KYC & Residential Address')}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onEditStep(2)}
              aria-label="Edit KYC & Address"
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-500/20 active:scale-95 dark:text-emerald-300"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <ReviewField
              label={tr('aadharNumber', 'Aadhaar Card (Masked)')}
              value={maskAadhaar(formData.aadharNumber)}
              icon={ShieldCheck}
              badge={
                formData.aadharNumber ? (
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Verified
                  </span>
                ) : undefined
              }
            />
            <ReviewField
              label={tr('panNumber', 'PAN Card Number')}
              value={formData.panNumber ? formData.panNumber.toUpperCase() : '—'}
              icon={FileText}
            />
            <ReviewField
              label={tr('state', 'State / Union Territory')}
              value={formData.state}
              icon={MapPin}
            />
            <ReviewField
              label={tr('city', 'City / District')}
              value={formData.city}
              icon={MapPin}
            />
            <ReviewField label={tr('pincode', 'PIN Code')} value={formData.pincode} icon={MapPin} />
            <ReviewField
              label={tr('address', 'Permanent Address')}
              value={formData.address}
              icon={MapPin}
              className="sm:col-span-2 md:col-span-3"
            />
          </div>

          {/* Document Upload Status Bar */}
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Attached Documents:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">Passport Photo:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {photoFile ? photoFile.name : 'Not provided (Optional)'}
              </span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">PAN Card Copy:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {panCardFile ? panCardFile.name : 'Not provided (Optional)'}
              </span>
            </div>
          </div>
        </section>

        {/* Card 3: Property Details Card */}
        <section
          aria-labelledby="card-property-heading"
          className="hover:border-brand-gold/30 dark:hover:border-brand-gold/20 relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-sm transition-all dark:border-slate-800 dark:bg-slate-900/90"
        >
          <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest text-blue-600 uppercase dark:text-blue-400">
                  Section 03 • Property Allocation
                </span>
                <h3
                  id="card-property-heading"
                  className="text-base font-bold text-slate-900 dark:text-white"
                >
                  {tr('sectionProperty', 'Property & Scheme Details')}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onEditStep(3)}
              aria-label="Edit Property & Scheme"
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-500/20 active:scale-95 dark:text-blue-300"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <ReviewField
              label={tr('selectProjects', 'Project')}
              value={PROJECT_LABELS[formData.project] || formData.project || '—'}
              icon={Building2}
            />
            <ReviewField
              label={tr('propertySize', 'Plot Area / Dimensions')}
              value={formData.propertySize ? `${formData.propertySize} Sq. Yd` : '—'}
              subvalue={
                formData.propertySize
                  ? `≈ ${schemeDetails.sqFeet.toLocaleString('en-IN')} Sq. Ft`
                  : undefined
              }
              icon={Ruler}
            />
            {formData.plotPreference && (
              <ReviewField
                label={tr('plotPreference', 'Plot Preference')}
                value={formData.plotPreference}
                icon={Building2}
              />
            )}
            {formData.advisorName && (
              <ReviewField label="Assigned Advisor" value={formData.advisorName} icon={User} />
            )}
          </div>
        </section>

        {/* Card 4: Payment Summary Dossier Card */}
        <section
          aria-labelledby="card-payment-heading"
          className="border-brand-gold/30 hover:border-brand-gold/50 dark:border-brand-gold/30 relative overflow-hidden rounded-2xl border bg-white/95 p-6 shadow-sm backdrop-blur-sm transition-all dark:bg-slate-900/90"
        >
          <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold dark:bg-brand-gold/20 dark:text-brand-gold-light flex h-10 w-10 items-center justify-center rounded-xl border">
                <Wallet className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <span className="text-brand-gold text-[10px] font-bold tracking-widest uppercase">
                  Section 04 • Financial Summary
                </span>
                <h3
                  id="card-payment-heading"
                  className="text-base font-bold text-slate-900 dark:text-white"
                >
                  Allotment Token Payment Summary
                </h3>
              </div>
            </div>

            <span className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold dark:text-brand-gold-light inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold">
              <CheckCircle2 className="h-3 w-3" /> Priority Queue
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <ReviewField
              label={tr('schemeAmount', 'Allotment Token Fee')}
              value={`₹${effectiveTokenAmount.toLocaleString('en-IN')}`}
              badge={
                <span className="bg-brand-gold/15 text-brand-gold dark:text-brand-gold-light inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold">
                  Priority Allotment
                </span>
              }
              icon={IndianRupee}
              className="border-brand-gold/30 bg-brand-gold/5 dark:bg-brand-gold/10"
            />
            <ReviewField
              label={tr('paymentPlan', 'Payment Plan')}
              value={schemeDetails.planDescription || formData.paymentPlan || '—'}
              icon={CreditCard}
            />
            <ReviewField
              label={tr('paymentMode', 'Payment Mode')}
              value={PAYMENT_MODE_LABELS[formData.paymentMode] || formData.paymentMode || '—'}
              icon={Wallet}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-50/50 p-3 text-xs text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              Booking token fee of <strong>₹{effectiveTokenAmount.toLocaleString('en-IN')}</strong>{' '}
              is 100% adjustable against final property allotment price. Instant digital receipt
              will be generated.
            </span>
          </div>
        </section>
      </div>

      {/* Security & Captcha Section */}
      <section
        aria-labelledby="captcha-section-heading"
        className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3
              id="captcha-section-heading"
              className="text-base font-bold text-slate-900 dark:text-white"
            >
              Security & Verification
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Solve the mathematical challenge below to confirm human submission.
            </p>
          </div>
        </div>

        <div className="max-w-md">
          <Captcha
            onValidate={onCaptchaValidate}
            error={captchaError || errors.captcha}
            placeholder="Enter sum (e.g. 12)"
          />
        </div>

        {/* Clear Terms Checkbox */}
        <div className="mt-6 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <label className="flex cursor-pointer items-start gap-3 select-none">
            <input
              type="checkbox"
              id="termsAccepted"
              name="termsAccepted"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="text-brand-gold focus:ring-brand-gold/40 mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-700 dark:bg-slate-900"
            />
            <span className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              I hereby declare that all details provided in this application are authentic. I agree
              to the{' '}
              <span className="text-brand-gold dark:text-brand-gold-light font-semibold underline underline-offset-2">
                Priority Allotment Terms & Conditions
              </span>{' '}
              and confirm that the booking token amount is 100% adjustable against the final
              property allotment.
            </span>
          </label>
        </div>

        <div className="mt-4 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="text-brand-gold mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            Your allotment application data is encrypted with bank-grade 256-bit SSL protocols.
            Allotment queue priority is timestamped upon confirmed token receipt.
          </p>
        </div>
      </section>

      {/* Navigation Controls */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200/80 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <button
          type="button"
          onClick={onPrev}
          disabled={isSubmitting}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.99] disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>{tr('prevStep', 'Back to Property')}</span>
        </button>

        <button
          type="button"
          onClick={onProceedToPayment}
          disabled={isSubmitting || !termsAccepted}
          aria-label={isSubmitting ? 'Processing Application...' : 'Proceed to Payment'}
          className="from-brand-gold via-brand-gold-light to-brand-gold shadow-brand-gold/25 hover:shadow-brand-gold/40 inline-flex min-h-[46px] items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r px-8 py-3.5 text-sm font-bold text-slate-950 shadow-lg transition-all duration-200 hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Processing Application...</span>
            </>
          ) : (
            <>
              <span>Proceed to Token Payment</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default Step4ReviewConfirm;
