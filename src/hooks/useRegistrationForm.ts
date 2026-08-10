import { useState, useCallback, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FormData, INITIAL_FORM } from '@/src/types/registration';
import { compressImage } from '@/src/lib/image-compression';
import { saveFormDraft, loadFormDraft, clearFormDraft } from '@/src/lib/form-persistence';

export function useRegistrationForm(t: any) {
  const router = useRouter();
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

  useEffect(() => {
    const draft = loadFormDraft();
    if (draft && Object.values(draft).some((v) => v !== '')) {
      setFormData((prev) => ({ ...prev, ...draft }));
      setDraftRestored(true);
      setTimeout(() => setDraftRestored(false), 5000);
    }
  }, []);

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
    } else if (!/^[a-zA-Z\\s]+$/.test(formData.firstName)) {
      newErrors.firstName = t('validation.firstNameFormat');
    }

    if (!formData.mobileNo.trim()) {
      newErrors.mobileNo = t('validation.mobileRequired');
    } else {
      const cleanMobile = formData.mobileNo.replace(/\\s/g, '');
      if (!/^[6-9]\\d{9}$/.test(cleanMobile)) {
        newErrors.mobileNo = t('validation.mobileFormat');
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = t('validation.emailRequired');
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/.test(formData.email.trim())) {
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
      const cleanAadhar = formData.aadharNumber.replace(/\\s/g, '');
      if (!/^[2-9]\\d{11}$/.test(cleanAadhar)) {
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

    const errorFields = Object.keys(newErrors);
    if (errorFields.length > 0) {
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
      let formatted = value;

      if (name === 'panNumber') {
        formatted = value.toUpperCase();
      } else if (name === 'aadharNumber' || name === 'mobileNo') {
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

      if (file.size > 150 * 1024 && file.type.startsWith('image/')) {
        setCompressing(type);
        try {
          const compressed = await compressImage(file, 150 * 1024);
          if (type === 'photo') setPhotoFile(compressed);
          else setPanCardFile(compressed);
          setErrors((prev) => ({ ...prev, [type]: '' }));
        } catch {
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
    (e: FormEvent<HTMLFormElement>) => {
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
      const body = new window.FormData();
      Object.entries(formData).forEach(([key, value]) => {
        body.append(key, value);
      });
      if (photoFile) body.append('photo', photoFile);
      if (panCardFile) body.append('panCard', panCardFile);

      const csrfMatch = document.cookie.match(/(?:^|;\\s*)csrf=([^;]+)/);
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
    captchaValid,
    setCaptchaValid,
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
