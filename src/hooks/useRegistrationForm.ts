import { useState, useCallback, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FormData, INITIAL_FORM } from '@/src/types/registration';
import { compressImage } from '@/src/lib/image-compression';
import { saveFormDraft, loadFormDraft, clearFormDraft } from '@/src/lib/form-persistence';
import { normalizeIndianPhone } from '@/src/lib/utils/phone';
const FALLBACK_ADVISORS = [
  'Direct / SVI Official',
  'Ajeet Kumar',
  'Sanjay Sharma',
  'Pooja Singh',
  'Vikram Rathore',
];

const FALLBACK_PROJECTS = [
  { value: 'shivani-vatika', label: 'Shivani Vatika' },
  { value: 'shayam-angan', label: 'Shayam Angan' },
  { value: 'svi-emerald-enclave', label: 'SVI Emerald Enclave' },
];

/** Letters in any script (Latin, Devanagari, …) plus spaces */
const NAME_REGEX = /^[\p{L}\s]+$/u;
async function refreshCsrfToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/csrf-refresh', { method: 'POST' });
    if (!res.ok) return null;
    const { token } = await res.json();
    if (!token) return null;
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `csrf=${token}; path=/; max-age=86400; SameSite=Lax${secure}`;
    return token;
  } catch {
    return null;
  }
}

export function useRegistrationForm(t: (key: string) => string) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [panCardFile, setPanCardFile] = useState<File | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [compressing, setCompressing] = useState<'photo' | 'panCard' | null>(null);
  const [advisors, setAdvisors] = useState<string[]>(FALLBACK_ADVISORS);
  const [projects, setProjects] = useState<{ value: string; label: string }[]>(FALLBACK_PROJECTS);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [attempted, setAttempted] = useState(false);
  // Honeypot: hidden field, must stay empty for real users
  const [website, setWebsite] = useState('');
  const formOpenedAt = useRef(Date.now());

  useEffect(() => {
    let active = true;

    Promise.all([
      fetch('/api/registration').then((res) => res.json()),
      fetch('/api/properties').then((res) => res.json()),
    ])
      .then(([registrationData, propertiesData]) => {
        if (!active) return;
        if (registrationData?.advisors?.length) {
          setAdvisors(registrationData.advisors);
        }
        if (propertiesData?.properties?.length) {
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

  useEffect(() => {
    const draft = loadFormDraft();
    if (draft && Object.values(draft).some((v) => v !== '')) {
      setFormData((prev) => ({ ...prev, ...draft }));
      setDraftRestored(true);
      setTimeout(() => setDraftRestored(false), 5000);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(
      () => saveFormDraft(formData as unknown as Record<string, string>),
      500
    );
    return () => clearTimeout(timer);
  }, [formData]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('validation.firstNameRequired');
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = t('validation.firstNameMin');
    } else if (!NAME_REGEX.test(formData.firstName.trim())) {
      newErrors.firstName = t('validation.firstNameFormat');
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

    if (!captchaAnswer.trim()) {
      newErrors.captcha = t('validation.captchaRequired');
      setCaptchaError(t('validation.captchaRequired'));
    } else {
      setCaptchaError('');
    }

    setErrors(newErrors);
    setAttempted(true);

    const errorFields = Object.keys(newErrors);
    if (errorFields.length > 0) {
      setTimeout(() => {
        const firstErrorEl = document.getElementById(errorFields[0]);
        firstErrorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorEl?.focus();
      }, 100);
    }

    return Object.keys(newErrors).length === 0;
  }, [formData, captchaAnswer, t]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      if (name === 'website') {
        setWebsite(value);
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>, type: 'photo' | 'panCard') => {
      const file = e.target.files?.[0];
      if (!file) return;

      const MAX_SIZE = 150 * 1024; // 150KB
      const ALLOWED_TYPES = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/pdf',
      ];

      if (!ALLOWED_TYPES.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          [type]: t('validation.fileType'),
        }));
        return;
      }

      if (file.size > MAX_SIZE) {
        setCompressing(type);
        try {
          if (file.type === 'application/pdf') {
            setErrors((prev) => ({
              ...prev,
              [type]: t('validation.fileSize'),
            }));
            return;
          }
          const compressed = await compressImage(file, MAX_SIZE);
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
            [type]: t('validation.fileSize'),
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

  const removeFile = useCallback((type: 'photo' | 'panCard') => {
    if (type === 'photo') setPhotoFile(null);
    else setPanCardFile(null);
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!validateForm()) return;
      setShowReview(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [validateForm]
  );

  const buildBody = useCallback(() => {
    const body = new window.FormData();
    Object.entries(formData).forEach(([key, value]) => {
      body.append(key, value);
    });
    if (photoFile) body.append('photo', photoFile);
    if (panCardFile) body.append('panCard', panCardFile);
    body.append('captchaAnswer', captchaAnswer.trim());
    body.append('website', website);
    body.append('formOpenedAt', String(formOpenedAt.current));

    const csrfMatch = document.cookie.match(/(?:^|;\s*)csrf=([^;]+)/);
    if (csrfMatch) body.append('csrf', decodeURIComponent(csrfMatch[1]));
    return body;
  }, [formData, photoFile, panCardFile, captchaAnswer, website]);

  const handleConfirmPayment = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      let res = await fetch('/api/registration', { method: 'POST', body: buildBody() });

      // CSRF token expired while the form was open → refresh once and retry
      if (res.status === 403) {
        const errData = await res.json().catch(() => ({}));
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
        const errData = await res.json().catch(() => ({}));
        if (errData.code === 'CAPTCHA_INVALID') {
          setCaptchaError(t('validation.captchaRequired'));
          setIsPaymentModalOpen(false);
          setShowReview(false);
          throw new Error(errData.error || 'Captcha verification failed');
        }
        if (errData.issues && typeof errData.issues === 'object') {
          const issueMessages = Object.entries(errData.issues)
            .map(
              ([field, msgs]: [string, any]) =>
                `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`
            )
            .join(' | ');
          throw new Error(issueMessages || errData.error || 'Submission failed');
        }
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
  }, [buildBody, router, t]);

  const handleCopy = useCallback((text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  return {
    isSubmitting,
    formData,
    errors,
    submitError,
    photoFile,
    panCardFile,
    captchaAnswer,
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
  };
}
