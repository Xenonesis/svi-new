'use client';

import React, { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Check, Copy, X, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { FormInput, FormSelect, FormFileUpload, ReviewRow } from './FormElements';
import Captcha from '@/src/components/Captcha';
import { compressImage } from '@/src/lib/image-compression';
import {
  saveFormDraft,
  loadFormDraft,
  clearFormDraft,
  getDraftAge,
} from '@/src/lib/form-persistence';
import dynamic from 'next/dynamic';

const RegistrationFAQ = dynamic(() => import('@/src/components/faq/RegistrationFAQ'), {
  ssr: false,
});

const PROPERTY_SIZES = [
  { value: '50-100', label: '50 to 100 (Sq.Yrd)' },
  { value: '100-200', label: '100 to 200 (Sq.Yrd)' },
  { value: '200-400', label: '200 to 400 (Sq.Yrd)' },
  { value: '400-700', label: '400 to 700 (Sq.Yrd)' },
  { value: '700-1000', label: '700 to 1000 (Sq.Yrd)' },
  { value: '1000-1500', label: '1000 to 1500 (Sq.Yrd)' },
  { value: '1500-2000', label: '1500 to 2000 (Sq.Yrd)' },
];

const PROPERTY_TYPES = [
  { value: 'residential-plot', label: 'Residential Plot' },
  { value: 'commercial-shop', label: 'Commercial shop' },
  { value: 'luxury-farm-house', label: 'Luxury Farm House' },
];

const PLOT_PREFERENCES = [
  { value: 'main-road', label: 'Main Road' },
  { value: 'park', label: 'Park' },
  { value: 'corner', label: 'Corner' },
  { value: 'none', label: 'None' },
];

const PAYMENT_PLANS = [
  { value: '3-months', label: '3 Months' },
  { value: '6-months', label: '6 Months' },
  { value: '12-months', label: '12 Months' },
  { value: '18-months', label: '18 Months' },
  { value: '24-months', label: '24 Months' },
];

const PAYMENT_MODES = [
  { value: 'online', label: 'Online' },
  { value: 'cash', label: 'Cash' },
  { value: 'net-banking', label: 'Net Banking' },
];

interface FormData {
  firstName: string;
  lastName: string;
  mobileNo: string;
  email: string;
  soWoDo: string;
  dob: string;
  aadharNumber: string;
  panNumber: string;
  state: string;
  city: string;
  address: string;
  advisorName: string;
  project: string;
  propertySize: string;
  propertyType: string;
  plotPreference: string;
  paymentPlan: string;
  paymentMode: string;
  schemeAmount: string;
}

const INITIAL_FORM: FormData = {
  firstName: '',
  lastName: '',
  mobileNo: '',
  email: '',
  soWoDo: '',
  dob: '',
  aadharNumber: '',
  panNumber: '',
  state: '',
  city: '',
  address: '',
  advisorName: '',
  project: '',
  propertySize: '',
  propertyType: '',
  plotPreference: '',
  paymentPlan: '',
  paymentMode: '',
  schemeAmount: '',
};

export default function RegistrationForm() {
  const router = useRouter();
  const t = useTranslations('pages.registration');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [panCardFile, setPanCardFile] = useState<File | null>(null);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaError, setCaptchaError] = useState('');
  const [compressing, setCompressing] = useState<'photo' | 'panCard' | null>(null);
  const [advisors, setAdvisors] = useState<string[]>([]);
  const [projects, setProjects] = useState<{ value: string; label: string }[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [attempted, setAttempted] = useState(false);

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

  const handleCopy = useCallback((text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  useEffect(() => {
    let active = true;

    Promise.all([
      fetch('/api/registration').then((res) => res.json()),
      fetch('/api/properties').then((res) => res.json()),
    ])
      .then(([registrationData, propertiesData]) => {
        if (!active) return;
        if (registrationData.advisors) setAdvisors(registrationData.advisors);
        if (propertiesData.properties) {
          setProjects(
            propertiesData.properties.map((p: any) => ({
              value: p.slug,
              label: p.name,
            }))
          );
        }
      })
      .catch((err) => {
        console.error('Failed to fetch initial data:', err);
      });

    return () => {
      active = false;
    };
  }, []);

  // Restore form draft from localStorage on mount
  useEffect(() => {
    const draft = loadFormDraft();
    if (draft && Object.values(draft).some((v) => v !== '')) {
      setFormData((prev) => ({ ...prev, ...draft }));
      setDraftRestored(true);
      setTimeout(() => setDraftRestored(false), 5000);
    }
  }, []);

  // Warn before leaving if form has data
  useEffect(() => {
    const hasData = Object.values(formData).some((v) => v !== '');
    if (!hasData) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [formData]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('validation.firstNameRequired');
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = t('validation.firstNameMin');
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
      newErrors.firstName = t('validation.firstNameFormat');
    }

    if (!formData.mobileNo.trim()) {
      newErrors.mobileNo = t('validation.mobileRequired');
    } else {
      const cleanMobile = formData.mobileNo.replace(/\s/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
        newErrors.mobileNo = t('validation.mobileFormat');
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = t('validation.emailRequired');
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email.trim())) {
      newErrors.email = t('validation.emailFormat');
    }

    if (!formData.soWoDo.trim()) {
      newErrors.soWoDo = t('validation.soWoDoRequired');
    }

    if (!formData.dob) {
      newErrors.dob = t('validation.dobRequired');
    } else {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (birthDate > today) {
        newErrors.dob = t('validation.dobFuture');
      } else if (age < 18) {
        newErrors.dob = t('validation.dobAge');
      } else if (age > 100) {
        newErrors.dob = t('validation.dobInvalid');
      }
    }

    if (!formData.aadharNumber.trim()) {
      newErrors.aadharNumber = t('validation.aadharRequired');
    } else {
      const cleanAadhar = formData.aadharNumber.replace(/\s/g, '');
      if (!/^[2-9]\d{11}$/.test(cleanAadhar)) {
        newErrors.aadharNumber = t('validation.aadharFormat');
      }
    }

    if (formData.panNumber.trim()) {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.panNumber.trim())) {
        newErrors.panNumber = t('validation.panFormat');
      }
    }

    if (!formData.state.trim()) newErrors.state = t('validation.stateRequired');
    if (!formData.city.trim()) newErrors.city = t('validation.cityRequired');
    if (!formData.address.trim()) newErrors.address = t('validation.addressRequired');
    if (!formData.advisorName) newErrors.advisorName = t('validation.advisorRequired');
    if (!formData.project) newErrors.project = t('validation.projectRequired');
    if (!formData.propertySize) newErrors.propertySize = t('validation.sizeRequired');
    if (!formData.propertyType) newErrors.propertyType = t('validation.typeRequired');
    if (!formData.plotPreference) newErrors.plotPreference = t('validation.preferenceRequired');
    if (!formData.paymentPlan) newErrors.paymentPlan = t('validation.planRequired');
    if (!formData.paymentMode) newErrors.paymentMode = t('validation.modeRequired');

    if (!formData.schemeAmount.trim()) {
      newErrors.schemeAmount = t('validation.amountRequired');
    } else {
      const amount = Number(formData.schemeAmount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.schemeAmount = t('validation.amountPositive');
      }
    }

    if (!captchaValid) {
      newErrors.captcha = t('validation.captchaRequired');
      setCaptchaError(t('validation.captchaRequired'));
    } else {
      setCaptchaError('');
    }

    setErrors(newErrors);
    setAttempted(true);

    // Scroll to the first error field
    const errorFields = Object.keys(newErrors);
    if (errorFields.length > 0) {
      // Small delay to let React render errors
      setTimeout(() => {
        const firstErrorEl = document.getElementById(errorFields[0]);
        firstErrorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorEl?.focus();
      }, 100);
    }

    return Object.keys(newErrors).length === 0;
  }, [formData, captchaValid, t]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;

      // Auto-format specific fields
      let formatted = value;
      if (name === 'panNumber') {
        formatted = value.toUpperCase();
      } else if (name === 'aadharNumber') {
        formatted = value.replace(/[^0-9]/g, '');
      } else if (name === 'mobileNo') {
        formatted = value.replace(/[^0-9]/g, '');
      }

      setFormData((prev) => ({ ...prev, [name]: formatted }));
      saveFormDraft({ ...formData, [name]: formatted });
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
    },
    [errors, formData]
  );

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>, type: 'photo' | 'panCard') => {
      const file = e.target.files?.[0];
      if (!file) return;

      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/pdf',
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, [type]: t('validation.fileType') }));
        return;
      }

      // Auto-compress oversized images
      if (file.size > 150 * 1024 && file.type.startsWith('image/')) {
        setCompressing(type);
        try {
          const compressed = await compressImage(file, 150 * 1024);
          if (type === 'photo') setPhotoFile(compressed);
          else setPanCardFile(compressed);
          setErrors((prev) => ({ ...prev, [type]: '' }));
        } catch {
          // Compression failed — keep the original, show a warning
          if (type === 'photo') setPhotoFile(file);
          else setPanCardFile(file);
          setErrors((prev) => ({ ...prev, [type]: t('validation.fileCompressFailed') }));
        } finally {
          setCompressing(null);
        }
        return;
      }

      if (file.size > 150 * 1024) {
        setErrors((prev) => ({ ...prev, [type]: t('validation.fileSize') }));
        return;
      }

      if (type === 'photo') setPhotoFile(file);
      else setPanCardFile(file);
      setErrors((prev) => ({ ...prev, [type]: '' }));
    },
    [t]
  );

  const removeFile = useCallback((type: 'photo' | 'panCard') => {
    if (type === 'photo') setPhotoFile(null);
    else setPanCardFile(null);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!validateForm()) return;
      setShowReview(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [validateForm]
  );

  const handleConfirmPayment = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const body = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        body.append(key, value);
      });
      if (photoFile) body.append('photo', photoFile);
      if (panCardFile) body.append('panCard', panCardFile);

      // CSRF token from cookie
      const csrfMatch = document.cookie.match(/(?:^|;\s*)csrf=([^;]+)/);
      if (csrfMatch) body.append('csrf', decodeURIComponent(csrfMatch[1]));

      const res = await fetch('/api/registration', { method: 'POST', body });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Submission failed');
      }
      setIsPaymentModalOpen(false);
      clearFormDraft();
      router.push('/thank-you?registered=1');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('validation.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, photoFile, panCardFile, router, t]);

  return (
    <>
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <form
            onSubmit={handleSubmit}
            className="border border-gray-200 bg-white p-8 shadow-2xl md:p-12 dark:border-gray-700 dark:bg-gray-800"
            noValidate
          >
            {attempted && Object.keys(errors).length > 0 && (
              <div
                className="mb-6 rounded border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950"
                role="alert"
              >
                <p className="flex items-center gap-1 text-sm font-medium text-red-800 dark:text-red-200">
                  <AlertCircle size={16} />
                  {Object.keys(errors).length} field{Object.keys(errors).length > 1 ? 's' : ''} need
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
              <FormInput
                attempted={attempted}
                name="firstName"
                hint={t('firstNameHint')}
                autoComplete="given-name"
                label={t('firstName')}
                value={formData.firstName}
                errors={errors}
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
                type="date"
              />

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
                onFileChange={handleFileChange}
                onRemoveFile={removeFile}
                compressing={compressing === 'photo'}
              />
              <FormFileUpload
                type="panCard"
                label={t('panUpload')}
                file={panCardFile}
                errors={errors}
                onFileChange={handleFileChange}
                onRemoveFile={removeFile}
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
                onChange={handleChange}
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
                onChange={handleChange}
                type="text"
                placeholder={t('panPlaceholder')}
              />

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
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
                type="text"
                placeholder={t('addressPlaceholder')}
              />
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
                onChange={handleChange}
                placeholder={t('advisorPlaceholder')}
              />

              <FormSelect
                attempted={attempted}
                name="project"
                label={t('selectProjects')}
                value={formData.project}
                options={projects}
                errors={errors}
                onChange={handleChange}
                placeholder={t('projectPlaceholder')}
              />
              <FormSelect
                attempted={attempted}
                name="propertySize"
                label={t('propertySize')}
                value={formData.propertySize}
                options={propertySizes}
                errors={errors}
                onChange={handleChange}
                placeholder={t('sizePlaceholder')}
              />

              <FormSelect
                attempted={attempted}
                name="propertyType"
                label={t('propertyType')}
                value={formData.propertyType}
                options={propertyTypes}
                errors={errors}
                onChange={handleChange}
                placeholder={t('typePlaceholder')}
              />
              <FormSelect
                attempted={attempted}
                name="plotPreference"
                label={t('plotPreference')}
                value={formData.plotPreference}
                options={plotPreferences}
                errors={errors}
                onChange={handleChange}
                placeholder={t('preferencePlaceholder')}
              />

              <FormSelect
                attempted={attempted}
                name="paymentPlan"
                label={t('paymentPlan')}
                value={formData.paymentPlan}
                options={paymentPlans}
                errors={errors}
                onChange={handleChange}
                placeholder={t('planPlaceholder')}
              />
              <FormSelect
                attempted={attempted}
                name="paymentMode"
                label={t('paymentMode')}
                value={formData.paymentMode}
                options={paymentModes}
                errors={errors}
                onChange={handleChange}
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
                  onChange={handleChange}
                  type="text"
                  placeholder={t('schemeAmountPlaceholder')}
                />
              </div>

              <div className="sm:col-span-2">
                <Captcha onValidate={setCaptchaValid} error={captchaError} />
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

          {showReview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 border border-gray-200 bg-white p-6 shadow-xl md:p-10 dark:border-gray-700 dark:bg-gray-800"
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
                  <ReviewRow
                    label={t('address')}
                    value={formData.address}
                    className="sm:col-span-2"
                  />
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
                  onClick={() => {
                    setShowReview(false);
                    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
                  }}
                  className="border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-brand-gold order-2 border px-8 py-3 text-xs font-bold tracking-widest uppercase transition-colors sm:order-1 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Edit Details
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReview(false);
                    setIsPaymentModalOpen(true);
                  }}
                  className="bg-brand-navy hover:bg-brand-gold text-brand-gold hover:text-brand-navy border-brand-navy order-1 border px-8 py-3 text-xs font-bold tracking-widest uppercase transition-colors sm:order-2"
                >
                  Continue to Payment
                </button>
              </div>
            </motion.div>
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
        <div className="xs:p-4 fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="xs:p-6 relative max-h-[90vh] w-full max-w-[660px] overflow-y-auto rounded-[2rem] border bg-white p-4 shadow-2xl md:p-8 dark:border-gray-700 dark:bg-gray-900"
          >
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute top-6 right-6 rounded-full bg-gray-50 p-2 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>

            <div className="mt-2 mb-6">
              <h2 className="mb-1 font-serif text-[28px] text-[#1e293b] dark:text-white">
                {t('paymentModal.title')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('paymentModal.subtitle')}
              </p>
            </div>

            <div className="flex flex-col items-start gap-8 md:flex-row">
              <div className="mx-auto flex w-full max-w-[240px] shrink-0 flex-col items-center min-[380px]:max-w-[280px] md:w-[270px] md:max-w-none">
                <div className="group relative w-full">
                  <div className="absolute inset-0 translate-x-1 translate-y-2 transform rounded-2xl bg-black/10 blur-lg transition-transform duration-300 group-hover:translate-y-3"></div>

                  <div className="relative z-10 flex w-full flex-col overflow-hidden rounded-t-2xl border border-[#004d28] bg-[#005c30] p-3 text-white shadow-lg">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10"></div>
                    <div className="absolute -inset-x-24 -inset-y-12 -translate-x-full rotate-45 transform bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-[1500ms] ease-out group-hover:translate-x-full"></div>

                    <div className="mb-1.5 text-center font-sans text-[8px] font-bold tracking-widest uppercase opacity-95">
                      Secure Gateway
                    </div>

                    <div className="mb-3 border border-white/95 bg-[#005c30] p-[2px]">
                      <div className="flex items-center justify-center border border-white/95 bg-[#005c30] px-3 py-1.5">
                        <ShieldCheck className="mr-2 h-5 w-5 shrink-0 text-white" />
                        <span className="font-serif text-[14px] leading-none font-bold tracking-wider text-white">
                          VERIFIED SCANNER
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center rounded-xl bg-white p-3 text-black shadow-inner">
                      <div className="mb-2.5 flex w-full items-center justify-between px-0.5">
                        <svg viewBox="0 0 100 28" className="h-6 w-[45%] shrink-0">
                          <g transform="skewX(-10)">
                            <text
                              x="2"
                              y="16"
                              fontFamily="sans-serif"
                              fontWeight="900"
                              fontSize="16"
                              fill="#1b365d"
                            >
                              BHIM
                            </text>
                          </g>
                          <g transform="translate(48, 2)">
                            <path d="M0 0 L8 5.5 L0 11 Z" fill="#005c30" />
                            <path d="M0 0 L8 5.5 L2.5 2.5 Z" fill="#e35205" />
                          </g>
                          <text
                            x="2"
                            y="24"
                            fontFamily="sans-serif"
                            fontWeight="700"
                            fontSize="3.5"
                            fill="#6B7280"
                            letterSpacing="0.3"
                          >
                            SMART INTERFACE FOR MONEY
                          </text>
                        </svg>

                        <div className="h-6 w-[1px] bg-gray-200"></div>

                        <svg viewBox="0 0 100 28" className="h-6 w-[45%] shrink-0">
                          <g transform="skewX(-10)">
                            <text
                              x="2"
                              y="16"
                              fontFamily="sans-serif"
                              fontWeight="900"
                              fontSize="16"
                              fill="#1E293B"
                            >
                              UPI
                            </text>
                          </g>
                          <g transform="translate(36, 2)">
                            <path d="M0 0 L8 5.5 L0 11 Z" fill="#09733c" />
                            <path d="M0 0 L8 5.5 L2.5 2.5 Z" fill="#e35205" />
                            <path d="M0 0 L2.5 1.7 L0 3.4 Z" fill="#1b365d" />
                          </g>
                          <text
                            x="2"
                            y="24"
                            fontFamily="sans-serif"
                            fontWeight="700"
                            fontSize="4"
                            fill="#6B7280"
                            letterSpacing="0.1"
                          >
                            UNIFIED PAYMENTS INTERFACE
                          </text>
                        </svg>
                      </div>

                      <div className="mb-1.5 font-sans text-[10px] font-extrabold tracking-widest text-[#1e293b] uppercase">
                        {t('paymentModal.scanPay')}
                      </div>

                      <div className="border-gray-150 mb-2 flex aspect-square w-full items-center justify-center rounded-lg border bg-white p-1.5 shadow-sm">
                        <img
                          src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi%3A%2F%2Fpay%3Fpa%3D1000221207001410.7300007643%40idbi%26pn%3DSVI%20INFRA%20SOLUTIONS%20PVT.%20LTD."
                          alt="UPI QR Code"
                          className="aspect-square h-auto w-full object-contain"
                        />
                      </div>

                      <div className="mb-2.5 text-center font-mono text-[9px] font-bold tracking-wide break-all text-[#9b722d]">
                        1000221207001410.7300007643@idbi
                      </div>

                      <div className="mb-2.5 w-full rounded-sm bg-[#005c30] px-2 py-1.5 text-center font-sans text-[9px] font-bold tracking-wide text-white uppercase">
                        SVI INFRA SOLUTIONS PVT. LTD.
                      </div>

                      <div className="mb-2.5 space-y-1 text-center">
                        <div className="font-sans text-[8px] leading-tight font-extrabold text-[#1e293b]">
                          {t('paymentModal.acceptUpi')}
                        </div>
                        <div className="text-[8.5px] leading-tight font-bold text-gray-700">
                          सभी UPI Apps से भुगतान स्वीकृत किया जाता है।
                        </div>
                      </div>

                      <div className="border-gray-150 mt-1.5 flex w-full justify-between border-t px-0.5 pt-2">
                        <div className="flex h-6 w-[46%] shrink-0 origin-left scale-[0.9] items-center justify-center rounded-sm border border-[#b89551] bg-[#005c30] p-[1px]">
                          <div className="flex flex-col items-center justify-center text-center font-sans leading-none text-white">
                            <span className="text-[3px] font-semibold tracking-tighter uppercase opacity-90">
                              IDBI BANK
                            </span>
                            <span className="my-[0.5px] text-[7px] font-black tracking-wide text-white">
                              GO
                            </span>
                            <span className="text-[3px] font-semibold tracking-tighter opacity-90">
                              Mobile
                            </span>
                          </div>
                        </div>

                        <div className="flex h-6 w-[46%] shrink-0 origin-right scale-[0.9] items-center justify-center rounded-sm border border-[#b89551] bg-black p-[1px]">
                          <div className="flex flex-col items-center justify-center text-center font-sans leading-none">
                            <span className="text-[3px] leading-none font-semibold tracking-tighter text-white uppercase opacity-80">
                              IDBI BANK
                            </span>
                            <span className="mt-[1px] text-[6.5px] font-extrabold tracking-tight text-[#b89551] italic">
                              PayWiz
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-col items-center">
                    <div className="z-0 h-3 w-[94%] rounded-b-xl border-t border-gray-600/50 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 shadow-md"></div>
                    <div className="mt-0.5 h-1.5 w-[84%] rounded-full bg-black/25 blur-[1.5px]"></div>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-1 flex-col space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('paymentModal.accountName')}
                  </span>
                  <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#f8fafc] p-3.5 dark:border-gray-700 dark:bg-gray-800">
                    <span className="mr-2 font-mono text-[13px] leading-tight tracking-wider break-words text-[#1e293b] uppercase dark:text-white">
                      SVI INFRA SOLUTIONS PVT. LTD.
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('SVI INFRA SOLUTIONS PVT. LTD.', 'name')}
                      className="text-brand-navy hover:text-brand-gold shrink-0 p-1 transition-colors"
                      title="Copy"
                    >
                      {copiedField === 'name' ? (
                        <Check size={18} className="text-green-600" />
                      ) : (
                        <Copy size={18} className="text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('paymentModal.accountNumber')}
                  </span>
                  <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#f8fafc] p-3.5 dark:border-gray-700 dark:bg-gray-800">
                    <span className="font-mono text-[13px] tracking-wider text-[#1e293b] dark:text-white">
                      0894102000013837
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('0894102000013837', 'account')}
                      className="text-brand-navy hover:text-brand-gold shrink-0 p-1 transition-colors"
                      title="Copy"
                    >
                      {copiedField === 'account' ? (
                        <Check size={18} className="text-green-600" />
                      ) : (
                        <Copy size={18} className="text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('paymentModal.ifscCode')}
                  </span>
                  <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#f8fafc] p-3.5 dark:border-gray-700 dark:bg-gray-800">
                    <span className="font-mono text-[13px] tracking-wider text-[#1e293b] dark:text-white">
                      IBKL0000894
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('IBKL0000894', 'ifsc')}
                      className="text-brand-navy hover:text-brand-gold shrink-0 p-1 transition-colors"
                      title="Copy"
                    >
                      {copiedField === 'ifsc' ? (
                        <Check size={18} className="text-green-600" />
                      ) : (
                        <Copy size={18} className="text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {submitError && (
                  <p className="flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle size={12} /> {submitError}
                  </p>
                )}

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmPayment}
                  className="bg-brand-gold text-brand-navy hover:bg-brand-navy hover:text-brand-gold mt-4 flex w-full items-center justify-center gap-2 py-4 text-sm font-bold tracking-widest uppercase transition-colors disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="border-brand-navy h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"></span>
                  ) : (
                    t('paymentModal.completeButton')
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      <RegistrationFAQ />
    </>
  );
}
