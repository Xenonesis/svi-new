'use client';

import { useCallback, useState, type ChangeEvent, type FormEvent } from 'react';
// import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { MapPin, PhoneIcon, Mail, Clock, AlertCircle } from 'lucide-react';
import { SITE_URL } from '@/src/lib/seo';

const DIGIT_REGEX = /\d/g;

export default function Contact() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // LocalBusiness structured data
  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'SVI Infra Solutions Pvt. Ltd.',
    image: `${SITE_URL}/logo.png`,
    url: `${SITE_URL}/contact`,
    telephone: '+91-73000-07643',
    email: 'info@sviinfrasolutions.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'A-61 Sector 65',
      addressLocality: 'Noida',
      addressRegion: 'Uttar Pradesh',
      postalCode: '201309',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 28.6112,
      longitude: 77.382,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '19:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '17:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '10:00',
        closes: '16:00',
      },
    ],
    areaServed: [
      {
        '@type': 'City',
        name: 'Jaipur',
      },
      {
        '@type': 'City',
        name: 'Noida',
      },
      {
        '@type': 'City',
        name: 'Phulera',
      },
    ],
    priceRange: '$$$',
  };

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    else if (!/^[a-zA-Z\s]+$/.test(formData.name))
      newErrors.name = 'Name can only contain letters and spaces';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email))
      newErrors.email = 'Please enter a valid email address';

    const phoneRegex = /^\+?[\d\s-]{10,15}$/;
    const digitCount = (formData.phone.match(DIGIT_REGEX) || []).length;
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else if (!phoneRegex.test(formData.phone) || digitCount < 10 || digitCount > 15) {
      newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
    }

    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    else if (formData.subject.length < 3)
      newErrors.subject = 'Subject must be at least 3 characters';

    if (!formData.message.trim()) newErrors.message = 'Message is required';
    else if (formData.message.length < 10)
      newErrors.message = 'Message must be at least 10 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const [submitError, setSubmitError] = useState('');
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsSubmitting(true);
      setSubmitError('');
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Submission failed');
        router.push('/thank-you');
      } catch {
        setSubmitError('Failed to submit. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, formData, router]
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
    <div className="bg-brand-bg relative pt-20 pb-16 dark:bg-gray-900">
      {/* LocalBusiness Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <section className="bg-brand-bg border-b border-gray-200 py-14 text-center md:py-20 dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h1 className="text-brand-navy animate-hero-h1 mb-6 font-serif text-3xl sm:text-4xl md:text-6xl dark:text-gray-100">
            Contact Us
          </h1>
          <div className="bg-brand-gold animate-hero-divider mx-auto h-px w-16"></div>
        </div>
      </section>

      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
            <div className="lg:w-1/3">
              <div className="xs:p-6 h-full border border-gray-200 bg-white p-5 shadow-sm transition-shadow duration-500 hover:shadow-xl md:p-10 dark:border-gray-700 dark:bg-gray-800">
                <h4 className="mb-4 text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase dark:text-gray-500">
                  Reach Out
                </h4>
                <h3 className="text-brand-navy mb-10 font-serif text-3xl dark:text-gray-100">
                  Get In Touch
                </h3>

                <div className="space-y-10">
                  <div className="flex items-start gap-5">
                    <div className="border-brand-gold text-brand-gold flex h-10 w-10 flex-shrink-0 items-center justify-center border pt-1 shadow-sm">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
                        Our Office
                      </h4>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        A-61 Sector 65,
                        <br />
                        Noida, Uttar Pradesh 201309
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="border-brand-gold text-brand-gold flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm border">
                      <PhoneIcon size={20} />
                    </div>
                    <div>
                      <h4 className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
                        Phone
                      </h4>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        +91 73000 07643
                      </p>
                      <p className="text-brand-gold mt-2 text-xs font-bold tracking-widest uppercase">
                        Main Office / Sales
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="border-brand-gold text-brand-gold flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm border">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h4 className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
                        Emails
                      </h4>
                      <a
                        href="mailto:info@sviinfrasolutions.com"
                        className="text-brand-navy hover:text-brand-gold dark:hover:text-brand-gold block text-sm font-medium transition-colors dark:text-gray-300"
                      >
                        info@sviinfrasolutions.com
                      </a>
                      <a
                        href="mailto:sales@sviinfrasolutions.com"
                        className="text-brand-navy hover:text-brand-gold dark:hover:text-brand-gold mt-2 block text-sm font-medium transition-colors dark:text-gray-300"
                      >
                        sales@sviinfrasolutions.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="border-brand-gold text-brand-gold flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm border">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
                        Business Hours
                      </h4>
                      <p className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">
                        Mon-Fri: 9AM - 7PM
                      </p>
                      <p className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">
                        Sat: 9AM - 5PM
                      </p>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Sun: 10AM - 4PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 md:gap-8 lg:w-2/3">
              <div className="border border-gray-200 bg-white p-6 shadow-sm md:p-10 dark:border-gray-700 dark:bg-gray-800">
                <h4 className="mb-4 text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase dark:text-gray-500">
                  Inquiries
                </h4>
                <h3 className="text-brand-navy mb-8 font-serif text-3xl dark:text-gray-100">
                  Send a Message
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400"
                      >
                        Your Name
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
                        Email Address
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
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400"
                      >
                        Phone Number
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
                        Subject
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
                      Message
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
                      'Send Message'
                    )}
                  </button>
                </form>
              </div>

              <div className="h-[280px] overflow-hidden border border-gray-200 bg-white p-2 shadow-sm md:h-[400px] dark:border-gray-700 dark:bg-gray-800">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.2847551460337!2d77.38202521508168!3d28.61123488242598!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5b2104bd709%3A0x6b6c2a4cb8c16053!2sSector%2065%2C%20Noida%2C%20Uttar%20Pradesh%20201301%2C%20India!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  title="Google Maps - SVI Infra Solutions Office Location"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
