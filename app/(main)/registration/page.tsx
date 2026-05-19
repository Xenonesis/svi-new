'use client';

import { useCallback, useState, type ChangeEvent, type FormEvent } from 'react';
// import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Building2, User, Phone, Mail, MessageSquare, AlertCircle } from 'lucide-react';

const GRADIENT_STYLE = {
  backgroundImage:
    'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)',
  backgroundSize: '40px 40px',
};
const DIGIT_REGEX = /\d/g;

export default function Registration() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyInterest: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    if (!formData.propertyInterest)
      newErrors.propertyInterest = 'Please select a property interest';

    if (formData.message && formData.message.length > 500) {
      newErrors.message = 'Message cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
    },
    [errors]
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        router.push('/thank-you');
      }, 1500);
    },
    [validateForm, router]
  );

  return (
    <div className="bg-brand-bg min-h-screen pt-32 pb-24 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mx-auto flex max-w-5xl flex-col border border-gray-200 bg-white shadow-2xl md:flex-row dark:border-gray-700 dark:bg-gray-800">
          <div className="bg-brand-navy relative flex flex-col justify-between overflow-hidden p-12 text-white md:w-5/12 lg:p-16">
            <div
              className="pointer-events-none absolute top-0 left-0 h-full w-full opacity-10"
              style={GRADIENT_STYLE}
            ></div>

            <div className="relative z-10 block">
              <h4 className="text-brand-gold mb-4 text-[10px] font-bold tracking-[0.3em] uppercase">
                Invest With Us
              </h4>
              <h2 className="mb-6 font-serif text-4xl leading-tight">
                Register
                <br />
                Interest
              </h2>
              <p className="mb-10 text-sm leading-relaxed text-gray-300">
                Take the first step towards your dream property. Fill out the form and our property
                agents will get back to you with exclusive options.
              </p>

              <ul className="space-y-6">
                <li className="flex items-center gap-4 text-sm font-medium tracking-wide">
                  <div className="border-brand-gold text-brand-gold flex h-6 w-6 items-center justify-center border text-xs">
                    ✓
                  </div>
                  Early bird pricing
                </li>
                <li className="flex items-center gap-4 text-sm font-medium tracking-wide">
                  <div className="border-brand-gold text-brand-gold flex h-6 w-6 items-center justify-center border text-xs">
                    ✓
                  </div>
                  Priority site visits
                </li>
                <li className="flex items-center gap-4 text-sm font-medium tracking-wide">
                  <div className="border-brand-gold text-brand-gold flex h-6 w-6 items-center justify-center border text-xs">
                    ✓
                  </div>
                  Exclusive project updates
                </li>
              </ul>
            </div>

            <div className="relative z-10 mt-16 border-t border-white/10 pt-8">
              <p className="font-serif text-sm text-gray-300 italic">
                "Investing with SVI Infra was the best decision for my family's future."
              </p>
              <p className="text-brand-gold mt-4 text-[10px] font-bold tracking-widest uppercase">
                - Recent Buyer
              </p>
            </div>
          </div>

          <div className="p-12 md:w-7/12 lg:p-16">
            <h3 className="text-brand-navy mb-8 font-serif text-2xl dark:text-gray-100">
              Your Details
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">
                  Full Name
                </label>
                <div className="relative">
                  <div className="text-brand-gold pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full border bg-gray-50/50 py-3 pr-4 pl-12 text-sm transition-colors outline-none focus:ring-0 dark:bg-gray-900 dark:text-white ${errors.name ? 'border-red-500 focus:border-red-500' : 'focus:border-brand-gold dark:focus:border-brand-gold border-gray-200 dark:border-gray-700'}`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle size={12} /> {errors.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="text-brand-gold pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full border bg-gray-50/50 py-3 pr-4 pl-12 text-sm transition-colors outline-none focus:ring-0 dark:bg-gray-900 dark:text-white ${errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-brand-gold dark:focus:border-brand-gold border-gray-200 dark:border-gray-700'}`}
                      placeholder="john@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle size={12} /> {errors.email}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="text-brand-gold pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Phone size={16} />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full border bg-gray-50/50 py-3 pr-4 pl-12 text-sm transition-colors outline-none focus:ring-0 dark:bg-gray-900 dark:text-white ${errors.phone ? 'border-red-500 focus:border-red-500' : 'focus:border-brand-gold dark:focus:border-brand-gold border-gray-200 dark:border-gray-700'}`}
                      placeholder="+91"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle size={12} /> {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">
                  Property Interest
                </label>
                <div className="relative">
                  <div className="text-brand-gold pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Building2 size={16} />
                  </div>
                  <select
                    name="propertyInterest"
                    value={formData.propertyInterest}
                    onChange={handleChange}
                    className={`w-full appearance-none rounded-none border bg-gray-50/50 py-3 pr-4 pl-12 text-sm transition-colors outline-none focus:ring-0 dark:bg-gray-900 dark:text-white ${errors.propertyInterest ? 'border-red-500 focus:border-red-500' : 'focus:border-brand-gold dark:focus:border-brand-gold border-gray-200 dark:border-gray-700'}`}
                  >
                    <option value="" disabled>
                      Select an option
                    </option>
                    <option value="residential_3bhk">Residential 3BHK</option>
                    <option value="residential_4bhk">Residential 4BHK</option>
                    <option value="residential_plot">Residential Plot</option>
                    <option value="commercial">Commercial Property</option>
                    <option value="investment">Investment / General Inquiry</option>
                  </select>
                </div>
                {errors.propertyInterest && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle size={12} /> {errors.propertyInterest}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">
                  Additional Message
                </label>
                <div className="relative">
                  <div className="text-brand-gold pointer-events-none absolute top-4 left-4">
                    <MessageSquare size={16} />
                  </div>
                  <textarea
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    maxLength={500}
                    className={`w-full resize-none border bg-gray-50/50 py-3 pr-4 pl-12 text-sm transition-colors outline-none focus:ring-0 dark:bg-gray-900 dark:text-white ${errors.message ? 'border-red-500 focus:border-red-500' : 'focus:border-brand-gold dark:focus:border-brand-gold border-gray-200 dark:border-gray-700'}`}
                    placeholder="Tell us about your requirements... (optional)"
                  ></textarea>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  {errors.message ? (
                    <p className="flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle size={12} /> {errors.message}
                    </p>
                  ) : (
                    <span></span>
                  )}
                  <span className="text-[10px] text-gray-400">{formData.message.length}/500</span>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-navy hover:bg-brand-gold text-brand-gold hover:text-brand-navy border-brand-navy flex w-full items-center justify-center gap-2 border py-4 text-xs font-bold tracking-widest uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-600 dark:bg-gray-700"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 animate-spin border-2 border-current border-t-transparent"></div>
                  ) : (
                    'Submit Registration'
                  )}
                </button>
              </div>
              <p className="mt-6 text-center text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                By submitting, you agree to our terms and privacy policy.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
