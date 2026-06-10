'use client';

import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ChevronDown,
  Upload,
  X,
  ShieldCheck,
  CreditCard,
  Landmark,
  Copy,
  Check,
} from 'lucide-react';
import { motion } from 'motion/react';
import Captcha from '@/src/components/Captcha';
import dynamic from 'next/dynamic';

const RegistrationFAQ = dynamic(() => import('@/src/components/common/RegistrationFAQ'), {
  ssr: false,
});

// Projects are fetched dynamically from the database

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

const GRADIENT_STYLE = {
  backgroundImage:
    'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)',
  backgroundSize: '40px 40px',
};

export default function Registration() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const needRegistration = searchParams.get('needRegistration');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [panCardFile, setPanCardFile] = useState<File | null>(null);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaError, setCaptchaError] = useState('');
  const [advisors, setAdvisors] = useState<string[]>([]);
  const [projects, setProjects] = useState<{ value: string; label: string }[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = useCallback((text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  useEffect(() => {
    let active = true;

    // Fetch advisors
    fetch('/api/registration')
      .then((res) => res.json())
      .then((data) => {
        if (active && data.advisors) {
          setAdvisors(data.advisors);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch advisors list:', err);
      });

    // Fetch projects from database
    fetch('/api/properties')
      .then((res) => res.json())
      .then((data) => {
        if (active && data.properties) {
          const mapped = data.properties.map((p: any) => ({
            value: p.slug,
            label: p.name,
          }));
          setProjects(mapped);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch projects list:', err);
      });

    return () => {
      active = false;
    };
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    // First Name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters long';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
      newErrors.firstName = 'First name should only contain letters';
    }

    // Mobile Number (Indian standards: 10 digits starting with 6-9)
    if (!formData.mobileNo.trim()) {
      newErrors.mobileNo = 'Mobile number is required';
    } else {
      const cleanMobile = formData.mobileNo.replace(/\s/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
        newErrors.mobileNo = 'Please enter a valid 10-digit Indian mobile number (starts with 6-9)';
      }
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // S/O, W/O, D/O Relation
    if (!formData.soWoDo.trim()) {
      newErrors.soWoDo = 'Relation name (S/O, W/O, D/O) is required';
    }

    // Date of Birth (Must be 18+ years old)
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (birthDate > today) {
        newErrors.dob = 'Date of birth cannot be in the future';
      } else if (age < 18) {
        newErrors.dob = 'You must be at least 18 years old to register';
      } else if (age > 100) {
        newErrors.dob = 'Please select a valid date of birth';
      }
    }

    // Aadhar Number (12 digits, does not start with 0 or 1)
    if (!formData.aadharNumber.trim()) {
      newErrors.aadharNumber = 'Aadhar number is required';
    } else {
      const cleanAadhar = formData.aadharNumber.replace(/\s/g, '');
      if (!/^[2-9]\d{11}$/.test(cleanAadhar)) {
        newErrors.aadharNumber =
          'Please enter a valid 12-digit Indian Aadhar number (starts with 2-9)';
      }
    }

    // PAN Number (Optional, but if entered, must be valid)
    if (formData.panNumber.trim()) {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.panNumber.trim())) {
        newErrors.panNumber = 'Please enter a valid PAN number format (e.g., ABCDE1234F)';
      }
    }

    // Address & Location fields
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.address.trim()) newErrors.address = 'Full address is required';
    if (!formData.advisorName) newErrors.advisorName = 'Please select an advisor';
    if (!formData.project) newErrors.project = 'Please select a project';
    if (!formData.propertySize) newErrors.propertySize = 'Please select property size';
    if (!formData.propertyType) newErrors.propertyType = 'Please select property type';
    if (!formData.plotPreference) newErrors.plotPreference = 'Please select plot preference';
    if (!formData.paymentPlan) newErrors.paymentPlan = 'Please select payment plan';
    if (!formData.paymentMode) newErrors.paymentMode = 'Please select payment mode';

    // Scheme Amount
    if (!formData.schemeAmount.trim()) {
      newErrors.schemeAmount = 'Scheme amount is required';
    } else {
      const amount = Number(formData.schemeAmount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.schemeAmount = 'Scheme amount must be a positive number';
      }
    }

    if (!captchaValid) {
      newErrors.captcha = 'Please solve the verification';
      setCaptchaError('Please solve the verification');
    } else {
      setCaptchaError('');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, captchaValid]);

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

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>, type: 'photo' | 'panCard') => {
      const file = e.target.files?.[0];
      if (!file) return;

      // File Size limit: 150KB
      if (file.size > 150 * 1024) {
        setErrors((prev) => ({ ...prev, [type]: 'File size must be under 150KB' }));
        return;
      }

      // File Type validation
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/pdf',
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, [type]: 'Only JPG, PNG, WEBP, or PDF files are allowed' }));
        return;
      }

      if (type === 'photo') setPhotoFile(file);
      else setPanCardFile(file);
      setErrors((prev) => ({ ...prev, [type]: '' }));
    },
    []
  );

  const removeFile = useCallback((type: 'photo' | 'panCard') => {
    if (type === 'photo') setPhotoFile(null);
    else setPanCardFile(null);
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;
      setIsPaymentModalOpen(true);
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

      const res = await fetch('/api/registration', { method: 'POST', body });
      if (!res.ok) throw new Error('Submission failed');
      setIsPaymentModalOpen(false);
      router.push('/thank-you?registered=1');
    } catch (err) {
      setSubmitError('Failed to submit registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, photoFile, panCardFile, router]);

  const inputClass = (field: string) =>
    `w-full border bg-gray-50/50 py-3 pr-4 pl-4 text-sm transition-colors outline-none focus:ring-0 dark:bg-gray-900 dark:text-white ${
      errors[field]
        ? 'border-red-500 focus:border-red-500'
        : 'focus:border-brand-gold dark:focus:border-brand-gold border-gray-200 dark:border-gray-700'
    }`;

  const labelClass = 'text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase';

  const renderError = (field: string) =>
    errors[field] ? (
      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
        <AlertCircle size={12} /> {errors[field]}
      </p>
    ) : null;

  const renderSelect = (
    name: string,
    label: string,
    options: { value: string; label: string }[] | string[],
    placeholder: string
  ) => (
    <div className="space-y-2">
      <label htmlFor={name} className={labelClass}>
        {label} *
      </label>
      <div className="relative">
        <select
          name={name}
          id={name}
          value={formData[name as keyof FormData]}
          onChange={handleChange}
          className={`appearance-none ${inputClass(name)} pr-10`}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) =>
            typeof opt === 'string' ? (
              <option key={opt} value={opt.toLowerCase().replace(/\s+/g, '-')}>
                {opt}
              </option>
            ) : (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            )
          )}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400">
          <ChevronDown size={16} />
        </div>
      </div>
      {renderError(name)}
    </div>
  );

  const renderInput = (
    name: string,
    label: string,
    type: string = 'text',
    placeholder: string = ''
  ) => (
    <div className="space-y-2">
      <label htmlFor={name} className={labelClass}>
        {label} *
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name as keyof FormData]}
        onChange={handleChange}
        className={inputClass(name)}
        placeholder={placeholder}
      />
      {renderError(name)}
    </div>
  );

  const renderFileUpload = (type: 'photo' | 'panCard', label: string) => {
    const file = type === 'photo' ? photoFile : panCardFile;
    return (
      <div className="space-y-2">
        <label className={labelClass}>{label}</label>
        {file ? (
          <div className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50/50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
            <span className="flex-1 truncate text-sm">{file.name}</span>
            <button
              type="button"
              onClick={() => removeFile(type)}
              className="text-gray-400 hover:text-red-500"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label className="hover:border-brand-gold hover:text-brand-gold flex cursor-pointer items-center gap-2 rounded border border-dashed border-gray-300 bg-gray-50/50 px-4 py-6 text-sm text-gray-400 transition-colors dark:border-gray-700 dark:bg-gray-900">
            <Upload size={16} />
            <span>Choose file</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => handleFileChange(e, type)}
              className="hidden"
            />
          </label>
        )}
        {renderError(type)}
      </div>
    );
  };

  return (
    <div className="bg-brand-bg min-h-screen pt-20 pb-24 dark:bg-gray-900">
      <section className="bg-brand-bg border-b border-gray-200 py-14 text-center md:py-20 dark:border-gray-700 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h1 className="text-brand-navy animate-hero-h1 mb-6 font-serif text-3xl leading-tight sm:text-4xl md:text-6xl dark:text-gray-100">
            Online Registration
          </h1>
          <div className="bg-brand-gold animate-hero-divider mx-auto mb-6 h-px w-16"></div>
          <p className="animate-hero-subtitle mx-auto max-w-2xl text-base leading-relaxed text-gray-500 md:text-lg dark:text-gray-400">
            Please fill out the form below to register with SVI Infra Solutions Pvt. Ltd.
          </p>

          {needRegistration && (
            <div className="mx-auto mt-6 max-w-xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
              Please complete the registration form first before accessing the confirmation page.
            </div>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-5xl">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="border border-gray-200 bg-white p-8 shadow-2xl md:p-12 dark:border-gray-700 dark:bg-gray-800"
            noValidate
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {renderInput('firstName', 'First Name', 'text', 'Enter first name')}
              <div className="space-y-2">
                <label htmlFor="lastName" className={labelClass}>
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={inputClass('lastName')}
                  placeholder="Enter last name"
                />
              </div>

              {renderInput('mobileNo', 'Mobile No', 'tel', 'Enter mobile number')}
              {renderInput('email', 'Email', 'email', 'Enter email address')}

              {renderInput('soWoDo', 'S/O, W/O, D/O', 'text', 'Enter relation')}
              {renderInput('dob', 'Date', 'date')}

              {renderFileUpload('photo', 'Photo Upload')}
              {renderFileUpload('panCard', 'PAN Card Upload')}

              {renderInput('aadharNumber', 'Aadhar Number', 'text', 'Enter 12-digit Aadhar')}
              <div className="space-y-2">
                <label htmlFor="panNumber" className={labelClass}>
                  PAN Number
                </label>
                <input
                  type="text"
                  id="panNumber"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleChange}
                  className={inputClass('panNumber')}
                  placeholder="Enter PAN number"
                />
              </div>

              {renderInput('state', 'State', 'text', 'Enter state')}
              {renderInput('city', 'City', 'text', 'Enter city')}

              {renderInput('address', 'Address', 'text', 'Enter full address')}
              {renderSelect('advisorName', 'Advisor Name', advisors, 'Select advisor')}

              {renderSelect('project', 'Select Projects', projects, 'Select project')}
              {renderSelect('propertySize', 'Property Size', PROPERTY_SIZES, 'Select size')}

              {renderSelect('propertyType', 'Property Type', PROPERTY_TYPES, 'Select type')}
              {renderSelect(
                'plotPreference',
                'Plot Preference',
                PLOT_PREFERENCES,
                'Select preference'
              )}

              {renderSelect('paymentPlan', 'Payment Plan', PAYMENT_PLANS, 'Select plan')}
              {renderSelect('paymentMode', 'Payment Mode', PAYMENT_MODES, 'Select mode')}

              <div className="sm:col-span-2">
                {renderInput('schemeAmount', 'Scheme Amount', 'text', 'Enter scheme amount')}
              </div>

              <div className="sm:col-span-2">
                <Captcha onValidate={setCaptchaValid} error={captchaError} />
              </div>
            </div>

            {/* Submit */}
            <div className="mt-8">
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
                  'Submit Registration'
                )}
              </button>
            </div>
          </form>

          {/* Notes */}
          <div className="mt-6 space-y-2 text-center">
            <p className="text-[11px] text-gray-500">
              Note: Please fill all the details properly and upload the correct documents, otherwise
              application can be rejected without notice.
            </p>
            <p className="text-[11px] text-gray-500">
              Registration amount of 2100 and 5100 will be refunded to Applicants whose name will
              not be picked in the draw.
            </p>
          </div>

          {/* CTA Section */}
          <div className="bg-brand-navy mt-16 p-12 text-center text-white">
            <h2 className="mb-4 font-serif text-3xl">Ready to Find Your Dream Home?</h2>
            <p className="mb-8 text-sm text-gray-300">
              Let our expert team help you navigate the real estate market and find the perfect
              property for you.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/projects/current"
                className="bg-brand-gold text-brand-navy hover:bg-brand-gold/90 px-8 py-3 text-xs font-bold tracking-widest uppercase transition-colors"
              >
                View Projects
              </a>
              <a
                href="/contact"
                className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-navy border px-8 py-3 text-xs font-bold tracking-widest uppercase transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details Modal */}
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
                For Application Amount
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Payment Details</p>
            </div>

            <div className="flex flex-col items-start gap-8 md:flex-row">
              {/* Left Column: Beautiful Recreated 3D IDBI Bank Scanner Stand */}
              <div className="mx-auto flex w-full max-w-[240px] shrink-0 flex-col items-center min-[380px]:max-w-[280px] md:w-[270px] md:max-w-none">
                {/* Main Stand Container */}
                <div className="group relative w-full">
                  {/* Subtle 3D shadow behind the stand */}
                  <div className="absolute inset-0 translate-x-1 translate-y-2 transform rounded-2xl bg-black/10 blur-lg transition-transform duration-300 group-hover:translate-y-3"></div>

                  {/* Green Card Body */}
                  <div className="relative z-10 flex w-full flex-col overflow-hidden rounded-t-2xl border border-[#004d28] bg-[#005c30] p-3 text-white shadow-lg">
                    {/* Glossy Acrylic Reflection Effect */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10"></div>
                    <div className="absolute -inset-x-24 -inset-y-12 -translate-x-full rotate-45 transform bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-[1500ms] ease-out group-hover:translate-x-full"></div>

                    {/* IDBI Brand Header */}
                    <div className="mb-1.5 text-center font-sans text-[8px] font-bold tracking-widest uppercase opacity-95">
                      Powered by
                    </div>

                    {/* Double Border IDBI Box */}
                    <div className="mb-3 border border-white/95 bg-[#005c30] p-[2px]">
                      <div className="flex items-center justify-center border border-white/95 bg-[#005c30] px-3 py-1.5">
                        <svg viewBox="0 0 100 100" className="mr-2 h-5 w-5 shrink-0">
                          <circle cx="50" cy="50" r="46" fill="#e35205" />
                          <circle cx="50" cy="30" r="7" fill="#ffffff" />
                          <path d="M46 42h8v35h-8z" fill="#ffffff" />
                          <path
                            d="M50 42c-10 0-16 6-16 16v17h6V58c0-6 4-10 10-10s10 4 10 10v17h6V58c0-10-6-16-16-16z"
                            fill="#ffffff"
                          />
                        </svg>
                        <span className="font-serif text-[14px] leading-none font-bold tracking-wider text-white">
                          IDBI BANK
                        </span>
                      </div>
                    </div>

                    {/* Inner White Container */}
                    <div className="flex flex-col items-center rounded-xl bg-white p-3 text-black shadow-inner">
                      {/* BHIM / UPI Logos Row */}
                      <div className="mb-2.5 flex w-full items-center justify-between px-0.5">
                        {/* BHIM SVG Logo */}
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

                        {/* Vertical Separator */}
                        <div className="h-6 w-[1px] bg-gray-200"></div>

                        {/* UPI SVG Logo */}
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

                      {/* SCAN & PAY Label */}
                      <div className="mb-1.5 font-sans text-[10px] font-extrabold tracking-widest text-[#1e293b] uppercase">
                        SCAN & PAY
                      </div>

                      {/* QR Code Container */}
                      <div className="border-gray-150 mb-2 flex aspect-square w-full items-center justify-center rounded-lg border bg-white p-1.5 shadow-sm">
                        <img
                          src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=1000221207001410.7300007643@idbi&pn=SVI%20INFRA%20SOLUTIONS%20PVT.%20LTD."
                          alt="UPI QR Code"
                          className="aspect-square h-auto w-full object-contain"
                        />
                      </div>

                      {/* UPI VPA (Ochre Gold Color, Centered, No background card) */}
                      <div className="mb-2.5 text-center font-mono text-[9px] font-bold tracking-wide break-all text-[#9b722d]">
                        1000221207001410.7300007643@idbi
                      </div>

                      {/* Company Green Bar (Sharp-edged, exact match) */}
                      <div className="mb-2.5 w-full rounded-sm bg-[#005c30] px-2 py-1.5 text-center font-sans text-[9px] font-bold tracking-wide text-white uppercase">
                        SVI INFRA SOLUTIONS PVT. LTD.
                      </div>

                      {/* Bilingual Acceptance Subtext */}
                      <div className="mb-2.5 space-y-1 text-center">
                        <div className="font-sans text-[8px] leading-tight font-extrabold text-[#1e293b]">
                          Payment Accepted from all UPI Apps.
                        </div>
                        <div className="text-[8.5px] leading-tight font-bold text-gray-700">
                          सभी UPI Apps से भुगतान स्वीकृत किया जाता है।
                        </div>
                      </div>

                      {/* Bottom Badges Row */}
                      <div className="border-gray-150 mt-1.5 flex w-full justify-between border-t px-0.5 pt-2">
                        {/* IDBI GO Mobile Badge */}
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

                        {/* IDBI BANK PayWiz Badge */}
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

                  {/* 3D Acrylic Base Stand Foot */}
                  <div className="flex w-full flex-col items-center">
                    <div className="z-0 h-3 w-[94%] rounded-b-xl border-t border-gray-600/50 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 shadow-md"></div>
                    <div className="mt-0.5 h-1.5 w-[84%] rounded-full bg-black/25 blur-[1.5px]"></div>
                  </div>
                </div>
              </div>

              {/* Right Column: Bank Details */}
              <div className="flex w-full flex-1 flex-col space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Account Name
                  </span>
                  <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#f8fafc] p-3.5 dark:border-gray-700 dark:bg-gray-800">
                    <span className="mr-2 font-mono text-[13px] leading-tight tracking-wider break-words text-[#1e293b] uppercase dark:text-white">
                      Svi Infra Solutions Pvt. Ltd
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('Svi Infra Solutions Pvt. Ltd', 'name')}
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
                    Account Number
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
                    IFSC Code
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

                <div className="flex flex-col space-y-1.5">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Bank / Branch
                  </span>
                  <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#f8fafc] p-3.5 dark:border-gray-700 dark:bg-gray-800">
                    <span className="font-mono text-[13px] tracking-wider text-[#1e293b] dark:text-white">
                      IDBI BANK
                    </span>
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
                    'I have paid - Complete Registration'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      <RegistrationFAQ />
    </div>
  );
}
