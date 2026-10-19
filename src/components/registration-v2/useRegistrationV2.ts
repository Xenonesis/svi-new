'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FormData, INITIAL_FORM_DATA, RegistrationV2Step, UseRegistrationV2Return } from './types';
import { isValidPan } from './schemeCalculator';
import { normalizeIndianPhone } from '@/src/lib/utils/phone';
import { compressImage } from '@/src/lib/image-compression';

export const DRAFT_STORAGE_KEY = 'svi_reg_draft_v2';

export const FALLBACK_ADVISORS: string[] = [
  'Direct / SVI Official',
  'Ajeet Kumar',
  'Sanjay Sharma',
  'Pooja Singh',
  'Vikram Rathore',
];

export const FALLBACK_PROJECTS: { value: string; label: string }[] = [
  { value: 'shivani-vatika', label: 'Shivani Vatika' },
  { value: 'shayam-angan', label: 'Shayam Angan' },
  { value: 'svi-emerald-enclave', label: 'SVI Emerald Enclave' },
];

export const UPPERCASE_FIELDS: Record<string, true> = {
  firstName: true,
  lastName: true,
  soWoDo: true,
  email: true,
  address: true,
  city: true,
  state: true,
  panNumber: true,
  advisorName: true,
};

const NAME_REGEX = /^[\p{L}\s]+$/u;
const MAX_FILE_SIZE = 150 * 1024; // 150 KB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const STEP_FIELDS: Record<RegistrationV2Step, string[]> = {
  1: ['firstName', 'lastName', 'mobileNo', 'email', 'soWoDo', 'dob'],
  2: ['aadharNumber', 'panNumber', 'pincode', 'state', 'city', 'address'],
  3: [
    'project',
    'propertySize',
    'propertyType',
    'plotPreference',
    'paymentPlan',
    'paymentMode',
    'schemeAmount',
  ],
  4: ['captcha'],
};

async function refreshCsrfToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/csrf-refresh', { method: 'POST' });
    if (!res.ok) return null;
    const data = (await res.json()) as { token?: string };
    const token = data?.token;
    if (!token) return null;
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `csrf=${token}; path=/; max-age=86400; SameSite=Lax${secure}`;
    }
    return token;
  } catch {
    return null;
  }
}

export function useRegistrationV2(t: (key: string) => string): UseRegistrationV2Return {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<RegistrationV2Step>(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [panCardFile, setPanCardFile] = useState<File | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [compressing, setCompressing] = useState<'photo' | 'panCard' | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [attemptedSteps, setAttemptedSteps] = useState<Record<RegistrationV2Step, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
  });

  const [advisors, setAdvisors] = useState<string[]>(FALLBACK_ADVISORS);
  const [projects, setProjects] = useState<{ value: string; label: string }[]>(FALLBACK_PROJECTS);

  // Honeypot field for bot protection
  const [website, setWebsite] = useState('');
  const formOpenedAt = useRef<number>(Date.now());

  // Fetch advisors and projects
  useEffect(() => {
    let active = true;

    const fetchMetadata = async () => {
      try {
        let advList: string[] | null = null;
        try {
          const advRes = await fetch('/api/registration/advisors');
          if (advRes.ok) {
            const data = (await advRes.json()) as { advisors?: string[] };
            if (data?.advisors?.length) advList = data.advisors;
          } else {
            const fbRes = await fetch('/api/registration');
            if (fbRes.ok) {
              const data = (await fbRes.json()) as { advisors?: string[] };
              if (data?.advisors?.length) advList = data.advisors;
            }
          }
        } catch {
          // Keep fallback advisors
        }

        if (active && advList && advList.length > 0) {
          setAdvisors(advList);
        }

        let projList: { value: string; label: string }[] | null = null;
        try {
          const projRes = await fetch('/api/registration/projects');
          if (projRes.ok) {
            const data = (await projRes.json()) as {
              projects?: { value: string; label: string }[];
            };
            if (data?.projects?.length) projList = data.projects;
          } else {
            const fbRes = await fetch('/api/properties');
            if (fbRes.ok) {
              const data = (await fbRes.json()) as {
                properties?: Array<{
                  slug?: string;
                  value?: string;
                  name?: string;
                  label?: string;
                }>;
              };
              if (data?.properties?.length) {
                projList = data.properties.map((p) => ({
                  value: p.slug || p.value || '',
                  label: p.name || p.label || '',
                }));
              }
            }
          }
        } catch {
          // Keep fallback projects
        }

        if (active && projList && projList.length > 0) {
          setProjects(projList);
        }
      } catch (err) {
        console.error('Failed to load registration metadata:', err);
      }
    };

    fetchMetadata();

    return () => {
      active = false;
    };
  }, []);

  // Restore draft from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const savedData = (parsed?.formData || parsed) as Partial<FormData>;
      if (savedData && typeof savedData === 'object') {
        const hasValues = Object.values(savedData).some((v) => v !== '');
        if (hasValues) {
          setFormData((prev) => ({ ...prev, ...savedData }));
          setDraftRestored(true);
          const timer = setTimeout(() => setDraftRestored(false), 5000);
          return () => clearTimeout(timer);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Debounced auto-save to localStorage['svi_reg_draft_v2']
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined') {
          const hasValues = Object.values(formData).some((v) => v !== '');
          if (hasValues) {
            localStorage.setItem(
              DRAFT_STORAGE_KEY,
              JSON.stringify({ formData, savedAt: Date.now() })
            );
          }
        }
      } catch {
        // Storage quota full or disabled
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData]);

  const clearDraft = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  // Step 1 Validation
  const validateStep1 = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('validation.firstNameRequired');
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = t('validation.firstNameMin');
    } else if (!NAME_REGEX.test(formData.firstName.trim())) {
      newErrors.firstName = t('validation.firstNameFormat');
    }

    if (formData.lastName?.trim() && !NAME_REGEX.test(formData.lastName.trim())) {
      newErrors.lastName = t('validation.lastNameFormat');
    }

    if (!formData.mobileNo.trim()) {
      newErrors.mobileNo = t('validation.mobileRequired');
    } else if (!normalizeIndianPhone(formData.mobileNo)) {
      newErrors.mobileNo = t('validation.mobileFormat');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('validation.emailRequired');
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email.trim())) {
      newErrors.email = t('validation.emailFormat');
    }

    if (!formData.soWoDo.trim()) {
      newErrors.soWoDo = t('validation.soWoDoRequired');
    } else if (formData.soWoDo.trim().length > 50) {
      newErrors.soWoDo = t('validation.soWoDoFormat');
    }

    if (!formData.dob) {
      newErrors.dob = t('validation.dobRequired');
    } else {
      const [y, m, d] = formData.dob.split('-').map(Number);
      if (!y || !m || !d || isNaN(y) || isNaN(m) || isNaN(d)) {
        newErrors.dob = t('validation.dobInvalid');
      } else {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();

        let age = currentYear - y;
        if (currentMonth < m || (currentMonth === m && currentDay < d)) {
          age--;
        }

        if (
          y > currentYear ||
          (y === currentYear && (m > currentMonth || (m === currentMonth && d > currentDay)))
        ) {
          newErrors.dob = t('validation.dobFuture');
        } else if (age < 18) {
          newErrors.dob = t('validation.dobAge');
        } else if (age > 100) {
          newErrors.dob = t('validation.dobInvalid');
        }
      }
    }

    setErrors((prev) => {
      const next = { ...prev };
      STEP_FIELDS[1].forEach((f) => delete next[f]);
      return { ...next, ...newErrors };
    });

    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  // Step 2 Validation
  const validateStep2 = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    const cleanAadhar = formData.aadharNumber.replace(/\s+/g, '');
    if (!formData.aadharNumber.trim()) {
      newErrors.aadharNumber = t('validation.aadharRequired');
    } else if (!/^\d{12}$/.test(cleanAadhar)) {
      newErrors.aadharNumber = t('validation.aadharFormat');
    }

    if (formData.panNumber.trim() && !isValidPan(formData.panNumber)) {
      newErrors.panNumber = t('validation.panFormat');
    }

    const cleanPin = formData.pincode.trim();
    if (!cleanPin || !/^\d{6}$/.test(cleanPin)) {
      newErrors.pincode = t('validation.pincodeFormat');
    }

    if (!formData.state.trim()) {
      newErrors.state = t('validation.stateRequired');
    }

    if (!formData.city.trim()) {
      newErrors.city = t('validation.cityRequired');
    }

    if (!formData.address.trim()) {
      newErrors.address = t('validation.addressRequired');
    }

    setErrors((prev) => {
      const next = { ...prev };
      STEP_FIELDS[2].forEach((f) => delete next[f]);
      return { ...next, ...newErrors };
    });

    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  // Step 3 Validation
  const validateStep3 = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.project.trim()) newErrors.project = t('validation.projectRequired');
    if (!formData.propertySize.trim()) newErrors.propertySize = t('validation.sizeRequired');
    if (!formData.propertyType.trim()) newErrors.propertyType = t('validation.typeRequired');
    if (!formData.paymentPlan.trim()) newErrors.paymentPlan = t('validation.planRequired');
    if (!formData.paymentMode.trim()) newErrors.paymentMode = t('validation.modeRequired');

    if (!formData.schemeAmount.trim()) {
      newErrors.schemeAmount = t('validation.amountRequired');
    } else {
      const amount = Number(formData.schemeAmount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.schemeAmount = t('validation.amountPositive');
      }
    }

    setErrors((prev) => {
      const next = { ...prev };
      STEP_FIELDS[3].forEach((f) => delete next[f]);
      return { ...next, ...newErrors };
    });

    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  // Step 4 Validation
  const validateStep4 = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!captchaAnswer.trim()) {
      newErrors.captcha = t('validation.captchaRequired');
      setCaptchaError(t('validation.captchaRequired'));
    } else {
      setCaptchaError('');
    }

    setErrors((prev) => {
      const next = { ...prev };
      STEP_FIELDS[4].forEach((f) => delete next[f]);
      return { ...next, ...newErrors };
    });

    return Object.keys(newErrors).length === 0;
  }, [captchaAnswer, t]);

  // Generic Step Validator
  const validateStep = useCallback(
    (step: RegistrationV2Step): boolean => {
      switch (step) {
        case 1:
          return validateStep1();
        case 2:
          return validateStep2();
        case 3:
          return validateStep3();
        case 4:
          return validateStep4();
        default:
          return true;
      }
    },
    [validateStep1, validateStep2, validateStep3, validateStep4]
  );

  // Navigation: Next Step
  const nextStep = useCallback((): boolean => {
    const isValid = validateStep(currentStep);
    setAttemptedSteps((prev) => ({ ...prev, [currentStep]: true }));

    if (!isValid) return false;

    if (currentStep < 4) {
      const next = (currentStep + 1) as RegistrationV2Step;
      setCurrentStep(next);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    return true;
  }, [currentStep, validateStep]);

  // Navigation: Previous Step
  const prevStep = useCallback((): void => {
    setCurrentStep((prev) => Math.max(1, prev - 1) as RegistrationV2Step);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Navigation: Jump to Arbitrary Step
  const goToStep = useCallback(
    (targetStep: RegistrationV2Step): boolean => {
      if (targetStep === currentStep) return true;

      // Going backwards is always allowed
      if (targetStep < currentStep) {
        setCurrentStep(targetStep);
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return true;
      }

      // Jumping forward: validate intervening steps
      for (let s = currentStep; s < targetStep; s++) {
        const stepNum = s as RegistrationV2Step;
        const isValid = validateStep(stepNum);
        if (!isValid) {
          setAttemptedSteps((prev) => ({ ...prev, [stepNum]: true }));
          return false;
        }
      }

      setCurrentStep(targetStep);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return true;
    },
    [currentStep, validateStep]
  );

  // Form field changes with uppercase transform and error clearing
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      if (name === 'website') {
        setWebsite(value);
        return;
      }

      const transformedValue =
        UPPERCASE_FIELDS[name] && typeof value === 'string' ? value.toUpperCase() : value;

      setFormData((prev) => ({ ...prev, [name]: transformedValue }));

      if (errors[name]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }
    },
    [errors]
  );

  // Client-side image compression & file upload
  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>, type: 'photo' | 'panCard') => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          [type]: t('validation.fileType'),
        }));
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        if (file.type === 'application/pdf') {
          setErrors((prev) => ({
            ...prev,
            [type]: t('validation.fileSize'),
          }));
          return;
        }

        setCompressing(type);
        try {
          const compressed = await compressImage(file, MAX_FILE_SIZE);
          if (type === 'photo') setPhotoFile(compressed);
          else setPanCardFile(compressed);

          setErrors((prev) => {
            const next = { ...prev };
            delete next[type];
            return next;
          });
        } catch {
          setErrors((prev) => ({
            ...prev,
            [type]: t('validation.fileCompressFailed') || t('validation.fileSize'),
          }));
        } finally {
          setCompressing(null);
        }
        return;
      }

      if (type === 'photo') setPhotoFile(file);
      else setPanCardFile(file);

      setErrors((prev) => {
        const next = { ...prev };
        delete next[type];
        return next;
      });
    },
    [t]
  );

  // Clear file
  const removeFile = useCallback((type: 'photo' | 'panCard') => {
    if (type === 'photo') setPhotoFile(null);
    else setPanCardFile(null);
  }, []);

  // Build FormData for API submission
  const buildBody = useCallback(() => {
    const body = new window.FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'email' && typeof value === 'string') {
        body.append(key, value.trim().toLowerCase());
      } else {
        body.append(key, value);
      }
    });

    if (photoFile) body.append('photo', photoFile);
    if (panCardFile) body.append('panCard', panCardFile);
    body.append('captchaAnswer', captchaAnswer.trim());
    body.append('website', website);
    body.append('formOpenedAt', String(formOpenedAt.current));

    if (typeof document !== 'undefined') {
      const csrfMatch = document.cookie.match(/(?:^|;\s*)csrf=([^;]+)/);
      if (csrfMatch) {
        body.append('csrf', decodeURIComponent(csrfMatch[1]));
      }
    }

    return body;
  }, [formData, photoFile, panCardFile, captchaAnswer, website]);

  // Submission handler
  const handleConfirmPayment = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      let res = await fetch('/api/registration', {
        method: 'POST',
        body: buildBody(),
      });

      // Handle expired CSRF token
      if (res.status === 403) {
        const errData = (await res.json().catch(() => ({}))) as {
          code?: string;
          error?: string;
        };
        if (errData.code === 'CSRF_EXPIRED') {
          const newToken = await refreshCsrfToken();
          if (newToken) {
            const retryBody = buildBody();
            retryBody.set('csrf', newToken);
            res = await fetch('/api/registration', { method: 'POST', body: retryBody });
          }
        }
      }

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as {
          code?: string;
          error?: string;
          issues?: Record<string, string[] | string>;
        };

        if (errData.code === 'CAPTCHA_INVALID') {
          setCaptchaError(t('validation.captchaRequired'));
          setIsPaymentModalOpen(false);
          throw new Error(errData.error || 'Captcha verification failed');
        }

        if (errData.issues && typeof errData.issues === 'object') {
          const issueMessages = Object.entries(errData.issues)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join(' | ');
          throw new Error(issueMessages || errData.error || 'Submission failed');
        }

        throw new Error(errData.error || 'Submission failed');
      }

      setIsPaymentModalOpen(false);
      clearDraft();
      router.push('/thank-you?registered=1');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('validation.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  }, [buildBody, clearDraft, router, t]);

  // Copy helper for modal banking/UPI info
  const handleCopy = useCallback((text: string, fieldId: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    }
  }, []);

  return {
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    errors,
    setErrors,
    isSubmitting,
    submitError,
    photoFile,
    panCardFile,
    captchaAnswer,
    setCaptchaAnswer,
    captchaError,
    compressing,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    draftRestored,
    attemptedSteps,
    advisors,
    projects,
    validateStep1,
    validateStep2,
    validateStep3,
    validateStep4,
    validateStep,
    nextStep,
    prevStep,
    goToStep,
    handleChange,
    handleFileChange,
    removeFile,
    handleConfirmPayment,
    clearDraft,
    copiedField,
    handleCopy,
  };
}
