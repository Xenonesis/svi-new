'use client';

import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Upload, X } from 'lucide-react';
import Captcha from '@/src/components/Captcha';

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

      // File Size limit: 5MB
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, [type]: 'File size must be under 5MB' }));
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
    async (e: FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsSubmitting(true);
      setSubmitError('');
      try {
        const body = new FormData();
        Object.entries(formData).forEach(([key, value]) => body.append(key, value));
        if (photoFile) body.append('photo', photoFile);
        if (panCardFile) body.append('panCard', panCardFile);

        const res = await fetch('/api/registration', { method: 'POST', body });
        if (!res.ok) throw new Error('Submission failed');
        router.push('/thank-you');
      } catch {
        setSubmitError('Failed to submit. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, formData, photoFile, panCardFile, router]
  );

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
      <select
        name={name}
        id={name}
        value={formData[name as keyof FormData]}
        onChange={handleChange}
        className={`appearance-none ${inputClass(name)}`}
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
              accept="image/*"
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
    <div className="bg-brand-bg min-h-screen pt-32 pb-24 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-brand-navy mb-4 font-serif text-4xl font-medium tracking-wide capitalize md:text-5xl lg:text-6xl dark:text-white">
              fill the booking form
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-500 md:text-lg">
              Please fill out the form below to register with SVI Infra Solutions Pvt. Ltd
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="border border-gray-200 bg-white p-8 shadow-2xl md:p-12 dark:border-gray-700 dark:bg-gray-800"
            noValidate
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

              <div className="md:col-span-2">
                {renderInput('schemeAmount', 'Scheme Amount', 'text', 'Enter scheme amount')}
              </div>

              <div className="md:col-span-2">
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
                href="/registration"
                className="bg-brand-gold text-brand-navy hover:bg-brand-gold/90 px-8 py-3 text-xs font-bold tracking-widest uppercase transition-colors"
              >
                Registration Now
              </a>
              <a
                href="/contact-us"
                className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-navy border px-8 py-3 text-xs font-bold tracking-widest uppercase transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
