'use client';

import { useCallback, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { submitContactForm } from '@/src/actions/contact';
import { queueSubmission } from '@/src/lib/pwa/backgroundSync';

const DIGIT_REGEX = /\d/g;

const inputBase =
  'w-full rounded-xl border bg-white/60 px-4 py-3.5 text-sm font-medium text-gray-800 placeholder-gray-300 outline-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] dark:bg-gray-800/60 dark:text-gray-100 dark:placeholder-gray-600';
const inputValid =
  'border-gray-200 focus:border-[#d4af37] focus:bg-white focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] dark:border-gray-700 dark:focus:border-[#d4af37] dark:focus:bg-gray-800';
const inputError =
  'border-red-400 bg-red-50/40 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)] dark:bg-red-900/10 dark:border-red-500';

export default function ContactForm() {
  const router = useRouter();
  const t = useTranslations('pages.contact');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t('validation.nameRequired');
    else if (formData.name.length < 2) newErrors.name = t('validation.nameMin');
    else if (!/^[a-zA-Z\s]+$/.test(formData.name)) newErrors.name = t('validation.nameFormat');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) newErrors.email = t('validation.emailRequired');
    else if (!emailRegex.test(formData.email)) newErrors.email = t('validation.emailFormat');

    const phoneRegex = /^\+?[\d\s-]{10,15}$/;
    const digitCount = (formData.phone.match(DIGIT_REGEX) || []).length;
    if (!formData.phone) newErrors.phone = t('validation.phoneRequired');
    else if (!phoneRegex.test(formData.phone) || digitCount < 10 || digitCount > 15)
      newErrors.phone = t('validation.phoneFormat');

    if (!formData.subject.trim()) newErrors.subject = t('validation.subjectRequired');
    else if (formData.subject.length < 3) newErrors.subject = t('validation.subjectMin');

    if (!formData.message.trim()) newErrors.message = t('validation.messageRequired');
    else if (formData.message.length < 10) newErrors.message = t('validation.messageMin');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      // Mark all as touched on submit
      setTouched({ name: true, email: true, phone: true, subject: true, message: true });
      if (!validateForm()) return;

      setIsSubmitting(true);
      setSubmitError('');
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        queueSubmission('/api/contact', JSON.stringify(formData));
        router.push('/thank-you?queued=1');
        return;
      }

      try {
        const fd = new FormData();
        Object.entries(formData).forEach(([key, value]) => fd.append(key, value));
        const result = await submitContactForm(fd);
        if (!result.success) {
          setSubmitError(result.error || t('validation.submitFailed'));
          return;
        }
        router.push('/thank-you');
      } catch {
        queueSubmission('/api/contact', JSON.stringify(formData));
        router.push('/thank-you?queued=1');
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, formData, router, t]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    },
    [errors]
  );

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  }, []);

  const isFieldValid = (field: string) =>
    touched[field] && !errors[field] && formData[field as keyof typeof formData];

  return (
    <div className="overflow-hidden rounded-2xl bg-white p-1 shadow-[0_4px_32px_rgba(0,0,0,0.06)] ring-1 ring-black/5 dark:bg-gray-800/80 dark:ring-white/8">
      <div className="rounded-[14px] bg-[#FDFBF7] p-6 md:p-9 dark:bg-gray-900">
        {/* Header */}
        <p className="mb-1 text-[9px] font-bold tracking-[0.25em] text-[#b8941e] uppercase">
          {t('inquiries')}
        </p>
        <h2 className="text-brand-navy mb-8 font-serif text-2xl md:text-3xl dark:text-gray-100">
          {t('sendMessage')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Row 1: Name + Email */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 flex items-center justify-between text-[10px] font-bold tracking-[0.18em] text-gray-400 uppercase dark:text-gray-500"
              >
                {t('formName')}
                {isFieldValid('name') && <CheckCircle2 size={11} className="text-emerald-500" />}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={errors.name ? 'true' : 'false'}
                aria-describedby={errors.name ? 'name-error' : undefined}
                className={`${inputBase} ${errors.name ? inputError : inputValid}`}
              />
              {errors.name && (
                <p
                  id="name-error"
                  className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-500"
                  role="alert"
                >
                  <AlertCircle size={11} /> {errors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 flex items-center justify-between text-[10px] font-bold tracking-[0.18em] text-gray-400 uppercase dark:text-gray-500"
              >
                {t('formEmail')}
                {isFieldValid('email') && <CheckCircle2 size={11} className="text-emerald-500" />}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={`${inputBase} ${errors.email ? inputError : inputValid}`}
              />
              {errors.email && (
                <p
                  id="email-error"
                  className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-500"
                  role="alert"
                >
                  <AlertCircle size={11} /> {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Phone + Subject */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="phone"
                className="mb-1.5 flex items-center justify-between text-[10px] font-bold tracking-[0.18em] text-gray-400 uppercase dark:text-gray-500"
              >
                {t('formPhone')}
                {isFieldValid('phone') && <CheckCircle2 size={11} className="text-emerald-500" />}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="+91"
                aria-invalid={errors.phone ? 'true' : 'false'}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
                className={`${inputBase} ${errors.phone ? inputError : inputValid}`}
              />
              {errors.phone && (
                <p
                  id="phone-error"
                  className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-500"
                  role="alert"
                >
                  <AlertCircle size={11} /> {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="subject"
                className="mb-1.5 flex items-center justify-between text-[10px] font-bold tracking-[0.18em] text-gray-400 uppercase dark:text-gray-500"
              >
                {t('formSubject')}
                <span
                  id="subject-count"
                  className="font-normal tracking-normal text-gray-300 normal-case dark:text-gray-600"
                >
                  {formData.subject.length}/100
                </span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={100}
                aria-invalid={errors.subject ? 'true' : 'false'}
                aria-describedby={errors.subject ? 'subject-error' : 'subject-count'}
                className={`${inputBase} ${errors.subject ? inputError : inputValid}`}
              />
              {errors.subject && (
                <p
                  id="subject-error"
                  className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-500"
                  role="alert"
                >
                  <AlertCircle size={11} /> {errors.subject}
                </p>
              )}
            </div>
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="mb-1.5 flex items-center justify-between text-[10px] font-bold tracking-[0.18em] text-gray-400 uppercase dark:text-gray-500"
            >
              {t('formMessage')}
              <span
                id="message-count"
                className="font-normal tracking-normal text-gray-300 normal-case dark:text-gray-600"
              >
                {formData.message.length}/1000
              </span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength={1000}
              aria-invalid={errors.message ? 'true' : 'false'}
              aria-describedby={errors.message ? 'message-error' : 'message-count'}
              className={`${inputBase} resize-none ${errors.message ? inputError : inputValid}`}
            />
            {errors.message && (
              <p
                id="message-error"
                className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-500"
                role="alert"
              >
                <AlertCircle size={11} /> {errors.message}
              </p>
            )}
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-900/20">
              <AlertCircle size={14} className="flex-shrink-0 text-red-500" />
              <p className="text-[12px] text-red-600 dark:text-red-400">{submitError}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-[#1a2744] px-6 py-4 text-[11px] font-bold tracking-[0.18em] text-[#d4af37] uppercase shadow-[0_4px_16px_rgba(26,39,68,0.25)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#243560] hover:shadow-[0_6px_24px_rgba(26,39,68,0.35)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {/* Shimmer on hover */}
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-full"
            />

            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#d4af37]/30 border-t-[#d4af37]" />
                Sending…
              </>
            ) : (
              <>
                {t('formSubmit')}
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d4af37]/15 transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-[#d4af37]/25">
                  <ArrowRight size={12} strokeWidth={2.5} />
                </span>
              </>
            )}
          </button>

          {/* Trust note */}
          <p className="text-center text-[10px] text-gray-400 dark:text-gray-600">
            🔒 Your information is kept strictly confidential.
          </p>
        </form>
      </div>
    </div>
  );
}
