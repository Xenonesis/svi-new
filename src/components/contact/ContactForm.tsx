'use client';

import { useCallback, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { submitContactForm } from '@/src/actions/contact';
import { queueSubmission } from '@/src/lib/pwa/backgroundSync';

const DIGIT_REGEX = /\d/g;

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
    else if (!phoneRegex.test(formData.phone) || digitCount < 10 || digitCount > 15) {
      newErrors.phone = t('validation.phoneFormat');
    }

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
      if (!validateForm()) return;

      setIsSubmitting(true);
      setSubmitError('');
      // If offline, queue for background sync
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        const payload = JSON.stringify(formData);
        queueSubmission('/api/contact', payload);
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
        // Queue on network error too
        const payload = JSON.stringify(formData);
        queueSubmission('/api/contact', payload);
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
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
    },
    [errors]
  );

  return (
    <div className="border border-gray-200 bg-white p-6 shadow-sm md:p-10 dark:border-gray-700 dark:bg-gray-800">
      <h4 className="mb-4 text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase dark:text-gray-500">
        {t('inquiries')}
      </h4>
      <h3 className="text-brand-navy mb-8 font-serif text-3xl dark:text-gray-100">
        {t('sendMessage')}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400"
            >
              {t('formName')}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              aria-invalid={errors.name ? 'true' : 'false'}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={`w-full border bg-gray-50/50 px-4 py-3 text-sm transition-colors outline-none focus:ring-0 dark:bg-gray-900 dark:text-white ${errors.name ? 'border-red-500 focus:border-red-500' : 'focus:border-brand-gold dark:focus:border-brand-gold border-gray-200 dark:border-gray-700'}`}
            />
            {errors.name && (
              <p
                id="name-error"
                className="mt-1 flex items-center gap-1 text-xs text-red-500"
                role="alert"
              >
                <AlertCircle size={12} /> {errors.name}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400"
            >
              {t('formEmail')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={`w-full border bg-gray-50/50 px-4 py-3 text-sm transition-colors outline-none focus:ring-0 dark:bg-gray-900 dark:text-white ${errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-brand-gold dark:focus:border-brand-gold border-gray-200 dark:border-gray-700'}`}
            />
            {errors.email && (
              <p
                id="email-error"
                className="mt-1 flex items-center gap-1 text-xs text-red-500"
                role="alert"
              >
                <AlertCircle size={12} /> {errors.email}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400"
            >
              {t('formPhone')}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              aria-invalid={errors.phone ? 'true' : 'false'}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              className={`w-full border bg-gray-50/50 px-4 py-3 text-sm transition-colors outline-none focus:ring-0 dark:bg-gray-900 dark:text-white ${errors.phone ? 'border-red-500 focus:border-red-500' : 'focus:border-brand-gold dark:focus:border-brand-gold border-gray-200 dark:border-gray-700'}`}
              placeholder="+91"
            />
            {errors.phone && (
              <p
                id="phone-error"
                className="mt-1 flex items-center gap-1 text-xs text-red-500"
                role="alert"
              >
                <AlertCircle size={12} /> {errors.phone}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="subject"
              className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400"
            >
              {t('formSubject')}
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              maxLength={100}
              aria-invalid={errors.subject ? 'true' : 'false'}
              aria-describedby={errors.subject ? 'subject-error' : 'subject-count'}
              className={`w-full border bg-gray-50/50 px-4 py-3 text-sm transition-colors outline-none focus:ring-0 dark:bg-gray-900 dark:text-white ${errors.subject ? 'border-red-500 focus:border-red-500' : 'focus:border-brand-gold dark:focus:border-brand-gold border-gray-200 dark:border-gray-700'}`}
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.subject ? (
                <p
                  id="subject-error"
                  className="flex items-center gap-1 text-xs text-red-500"
                  role="alert"
                >
                  <AlertCircle size={12} /> {errors.subject}
                </p>
              ) : (
                <span></span>
              )}
              <span id="subject-count" className="text-[10px] text-gray-400">
                {formData.subject.length}/100
              </span>
            </div>
          </div>
        </div>
        <div>
          <label
            htmlFor="message"
            className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400"
          >
            {t('formMessage')}
          </label>
          <textarea
            id="message"
            rows={5}
            name="message"
            value={formData.message}
            onChange={handleChange}
            maxLength={1000}
            aria-invalid={errors.message ? 'true' : 'false'}
            aria-describedby={errors.message ? 'message-error' : 'message-count'}
            className={`w-full resize-none border bg-gray-50/50 px-4 py-3 text-sm transition-colors outline-none focus:ring-0 dark:bg-gray-900 dark:text-white ${errors.message ? 'border-red-500 focus:border-red-500' : 'focus:border-brand-gold dark:focus:border-brand-gold border-gray-200 dark:border-gray-700'}`}
          ></textarea>
          <div className="mt-1 flex items-center justify-between">
            {errors.message ? (
              <p
                id="message-error"
                className="flex items-center gap-1 text-xs text-red-500"
                role="alert"
              >
                <AlertCircle size={12} /> {errors.message}
              </p>
            ) : (
              <span></span>
            )}
            <span id="message-count" className="text-[10px] text-gray-400">
              {formData.message.length}/1000
            </span>
          </div>
        </div>
        {submitError && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle size={12} /> {submitError}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-navy hover:bg-brand-gold text-brand-gold hover:text-brand-navy border-brand-navy flex w-full items-center justify-center gap-2 border py-4 text-xs font-bold tracking-widest uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <div className="h-4 w-4 animate-spin border-2 border-current border-t-transparent"></div>
          ) : (
            t('formSubmit')
          )}
        </button>
      </form>
    </div>
  );
}
