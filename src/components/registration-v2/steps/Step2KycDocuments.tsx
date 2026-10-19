'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  FileText,
  Trash2,
  Loader2,
  CreditCard,
  MapPin,
  Building2,
  Check,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatAadhaarNumber, isValidPan } from '../schemeCalculator';
import { lookupPincode } from '@/src/lib/postal';
import { INDIAN_STATES_AND_UTS } from '@/src/lib/constants';
import { KycPreviewCard } from '../KycPreviewCard';
import type { Step2KycDocumentsProps } from '../types';

export type { Step2KycDocumentsProps };

export function Step2KycDocuments({
  formData,
  errors,
  touchedFields,
  attempted,
  t,
  onChange,
  onBlur,
  photoFile,
  panCardFile,
  compressing,
  onFileChange,
  onRemoveFile,
  onNext,
  onPrev,
}: Step2KycDocumentsProps) {
  // Mobile pass preview toggle state
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Drag & drop highlight states
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [isDraggingPan, setIsDraggingPan] = useState(false);

  // Postal lookup states
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeSuccess, setPincodeSuccess] = useState(false);
  const [pincodeNotFound, setPincodeNotFound] = useState(false);

  // Object URL for passport photo preview inside the uploader
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreviewUrl(null);
      return;
    }

    let url: string | null = null;
    try {
      if (
        typeof window !== 'undefined' &&
        typeof URL !== 'undefined' &&
        typeof URL.createObjectURL === 'function'
      ) {
        url = URL.createObjectURL(photoFile);
        setPhotoPreviewUrl(url);
      }
    } catch {
      setPhotoPreviewUrl(null);
    }

    return () => {
      if (url && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // Safe ignore
        }
      }
    };
  }, [photoFile]);

  // Safe translation helper
  const tr = (key: string, fallback: string): string => {
    if (typeof t !== 'function') return fallback;
    try {
      const val = t(key);
      return val && val !== key ? val : fallback;
    } catch {
      return fallback;
    }
  };

  // Smart Aadhaar: Auto-spaced XXXX XXXX 1234
  const handleAadhaarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAadhaarNumber(e.target.value);
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'aadharNumber',
        value: formatted,
      },
    } as ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  // Smart PAN: Auto-uppercase
  const handlePanChange = (e: ChangeEvent<HTMLInputElement>) => {
    const upper = e.target.value.toUpperCase().slice(0, 10);
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'panNumber',
        value: upper,
      },
    } as ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  // Smart PIN Code: Digits only, max 6
  const handlePincodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 6);
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'pincode',
        value: digitsOnly,
      },
    } as ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  // City Uppercase Sanitizer
  const handleCityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const upper = e.target.value.toUpperCase();
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'city',
        value: upper,
      },
    } as ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  // House / Street Address Uppercase Sanitizer
  const handleAddressChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const upper = e.target.value.toUpperCase();
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'address',
        value: upper,
      },
    } as ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  // Postal auto-lookup effect
  useEffect(() => {
    const cleanPin = (formData.pincode || '').replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setPincodeSuccess(false);
      setPincodeNotFound(false);
      return;
    }

    let active = true;
    setPincodeLoading(true);
    setPincodeNotFound(false);

    const promise = lookupPincode(cleanPin);
    if (!promise || typeof promise.then !== 'function') {
      setPincodeLoading(false);
      return;
    }
    promise
      .then((info) => {
        if (!active) return;
        setPincodeLoading(false);
        if (info) {
          setPincodeSuccess(true);
          setPincodeNotFound(false);

          // Auto-fill matched state
          const matchedState = INDIAN_STATES_AND_UTS.find(
            (s) => s.value.toLowerCase() === info.state.toLowerCase()
          );
          if (matchedState && matchedState.value !== formData.state) {
            const stateEvent = {
              target: {
                name: 'state',
                value: matchedState.value,
              },
            } as unknown as ChangeEvent<HTMLSelectElement>;
            onChange(stateEvent);
          }

          // Auto-fill city/district
          const cityToSet = (info.district || info.postOffices[0] || '').toUpperCase();
          if (cityToSet && cityToSet !== formData.city) {
            const cityEvent = {
              target: {
                name: 'city',
                value: cityToSet,
              },
            } as unknown as ChangeEvent<HTMLInputElement>;
            onChange(cityEvent);
          }
        } else {
          setPincodeSuccess(false);
          setPincodeNotFound(true);
        }
      })
      .catch(() => {
        if (active) {
          setPincodeLoading(false);
          setPincodeSuccess(false);
          setPincodeNotFound(true);
        }
      });

    return () => {
      active = false;
    };
  }, [formData.pincode, onChange]);

  // Drag and Drop handlers for file uploads
  const handleDrop = (e: DragEvent<HTMLElement>, type: 'photo' | 'panCard') => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'photo') setIsDraggingPhoto(false);
    else setIsDraggingPan(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const syntheticEvent = {
        target: {
          files: e.dataTransfer.files,
          value: '',
        },
      } as unknown as ChangeEvent<HTMLInputElement>;
      onFileChange(syntheticEvent, type);
    }
  };

  // Helper for input styles
  const getInputClasses = (field: string) => {
    const hasError = Boolean(errors[field]);
    const isTouched = Boolean(touchedFields && touchedFields[field]);
    const isSuccess =
      (attempted || isTouched) && !hasError && Boolean(formData[field as keyof typeof formData]);

    return `w-full min-h-[44px] h-12 px-4 rounded-xl text-sm transition-all outline-hidden ${
      hasError
        ? 'border-2 border-red-500 bg-red-50/30 text-red-950 dark:bg-red-950/20 dark:text-red-100 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
        : isSuccess
          ? 'border-2 border-emerald-500/70 bg-emerald-50/10 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 dark:border-emerald-500/50 dark:bg-emerald-950/10 dark:text-white'
          : 'border border-slate-200 bg-white text-slate-900 hover:border-slate-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/25 dark:border-slate-700/80 dark:bg-[#0c101a] dark:text-white dark:hover:border-slate-600 dark:focus:border-brand-gold'
    }`;
  };

  const cleanAadhaar = (formData.aadharNumber || '').replace(/\D/g, '');
  const panValid = isValidPan(formData.panNumber);
  const fullName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
          <span>KYC & Address Verification</span>
        </h2>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
          Government-issued identification and address details required for official priority
          allotment certification.
        </p>
      </div>

      {/* Mobile Live ID Pass Preview Accordion (Hidden on Desktop) */}
      <div className="block lg:hidden">
        <button
          type="button"
          onClick={() => setShowMobilePreview(!showMobilePreview)}
          aria-expanded={showMobilePreview}
          className="border-brand-gold/40 flex min-h-[44px] w-full items-center justify-between rounded-xl border bg-slate-900/90 px-4 py-3 text-left text-sm font-semibold text-white shadow-md backdrop-blur-md transition-all active:scale-[0.99]"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="text-brand-gold h-4 w-4" aria-hidden="true" />
            <span>
              {showMobilePreview ? 'Hide Live ID Pass Preview' : 'Show Live ID Pass Preview'}
            </span>
          </span>
          <span className="text-brand-gold-light flex items-center gap-1 text-xs font-normal">
            <span>{showMobilePreview ? 'Collapse' : 'Preview'}</span>
            {showMobilePreview ? (
              <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </span>
        </button>

        {showMobilePreview && (
          <div className="mt-3">
            <KycPreviewCard
              fullName={fullName}
              photoFile={photoFile}
              panCardFile={panCardFile}
              aadharNumber={formData.aadharNumber}
              panNumber={formData.panNumber}
              city={formData.city}
              state={formData.state}
            />
          </div>
        )}
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: KYC & Address Inputs */}
        <div className="space-y-8 lg:col-span-7">
          {/* Section 1: Government Identity Documents */}
          <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-6 dark:border-slate-800/80 dark:bg-slate-900/40">
            <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3 dark:border-slate-800">
              <CreditCard className="text-brand-gold h-4 w-4" aria-hidden="true" />
              <h3 className="text-sm font-bold tracking-wider text-slate-800 uppercase dark:text-slate-200">
                1. Government Identity Cards
              </h3>
            </div>

            {/* Smart Aadhaar Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="aadharNumber"
                className="flex items-center justify-between text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
              >
                <span className="flex items-center gap-1.5">
                  <span>Aadhaar Card Number (12 Digits)</span>
                  <span className="text-red-500">*</span>
                </span>
                {cleanAadhaar.length === 12 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                    <Check className="h-3 w-3" /> 12 Digits Verified
                  </span>
                )}
              </label>

              <div className="relative">
                <input
                  id="aadharNumber"
                  name="aadharNumber"
                  type="text"
                  inputMode="numeric"
                  required
                  maxLength={14}
                  autoComplete="off"
                  placeholder="XXXX XXXX 1234"
                  value={formData.aadharNumber}
                  onChange={handleAadhaarChange}
                  onBlur={onBlur}
                  aria-invalid={errors.aadharNumber ? 'true' : 'false'}
                  aria-describedby={errors.aadharNumber ? 'aadharNumber-error' : undefined}
                  className={`${getInputClasses('aadharNumber')} pr-10 font-mono tracking-wider`}
                />
                {cleanAadhaar.length === 12 && !errors.aadharNumber && (
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                  </div>
                )}
              </div>
              {errors.aadharNumber && (
                <p
                  id="aadharNumber-error"
                  role="alert"
                  className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{errors.aadharNumber}</span>
                </p>
              )}
            </div>

            {/* Smart PAN Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="panNumber"
                className="flex items-center justify-between text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
              >
                <span className="flex items-center gap-1.5">
                  <span>PAN Card Number</span>
                  <span className="text-red-500">*</span>
                </span>
                {panValid && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                    <CheckCircle2 className="h-3 w-3" /> Format Verified
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  id="panNumber"
                  name="panNumber"
                  type="text"
                  required
                  maxLength={10}
                  autoComplete="off"
                  placeholder="ABCDE1234F"
                  value={formData.panNumber}
                  onChange={handlePanChange}
                  onBlur={onBlur}
                  aria-describedby={errors.panNumber ? 'panNumber-error' : undefined}
                  className={`${getInputClasses('panNumber')} font-mono tracking-widest uppercase`}
                />
                {panValid && (
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                  </div>
                )}
              </div>

              {errors.panNumber && (
                <p
                  id="panNumber-error"
                  role="alert"
                  className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{errors.panNumber}</span>
                </p>
              )}
            </div>
          </div>

          {/* Section 2: Document Upload Studio */}
          <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-6 dark:border-slate-800/80 dark:bg-slate-900/40">
            <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3 dark:border-slate-800">
              <UploadCloud className="text-brand-gold h-4 w-4" aria-hidden="true" />
              <h3 className="text-sm font-bold tracking-wider text-slate-800 uppercase dark:text-slate-200">
                2. Document Uploads
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Passport Photo Upload Zone */}
              <div className="space-y-1.5">
                <span className="block text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                  Applicant Passport Photo
                </span>
                <input
                  id="photo-upload"
                  data-testid="photo-upload-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => onFileChange(e, 'photo')}
                  className="hidden"
                />

                {compressing === 'photo' ? (
                  <div className="border-brand-gold/60 bg-brand-gold/5 flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-4 text-center">
                    <Loader2 className="text-brand-gold h-6 w-6 animate-spin" />
                    <span className="text-brand-gold text-xs font-medium">
                      Compressing passport photo...
                    </span>
                  </div>
                ) : photoFile ? (
                  <div className="relative flex min-h-[140px] items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 dark:bg-emerald-950/20">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-emerald-500/40 bg-slate-800">
                      {photoPreviewUrl ? (
                        <img
                          src={photoPreviewUrl}
                          alt="Photo Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <FileText className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                        {photoFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {(photoFile.size / 1024).toFixed(1)} KB
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Ready
                      </span>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove passport photo"
                      onClick={() => onRemoveFile('photo')}
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-red-200 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 dark:border-red-900/40 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="photo-upload"
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingPhoto(true);
                    }}
                    onDragLeave={() => setIsDraggingPhoto(false)}
                    onDrop={(e) => handleDrop(e, 'photo')}
                    className={`group flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition-all ${
                      isDraggingPhoto
                        ? 'border-brand-gold bg-brand-gold/10 scale-[1.01]'
                        : 'hover:border-brand-gold dark:hover:border-brand-gold/60 border-slate-300 bg-white hover:bg-slate-50/80 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:bg-slate-900/90'
                    }`}
                  >
                    <div className="group-hover:bg-brand-gold/10 group-hover:text-brand-gold dark:group-hover:bg-brand-gold/20 dark:group-hover:text-brand-gold flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors dark:bg-slate-800 dark:text-slate-300">
                      <UploadCloud className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Click or drag passport photo to upload
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Supports JPG, PNG, WEBP up to 5MB
                      </p>
                    </div>
                  </label>
                )}
              </div>

              {/* PAN Card Document Upload Zone */}
              <div className="space-y-1.5">
                <span className="block text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                  PAN Card Copy
                </span>
                <input
                  id="pancard-upload"
                  data-testid="pancard-upload-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => onFileChange(e, 'panCard')}
                  className="hidden"
                />

                {compressing === 'panCard' ? (
                  <div className="border-brand-gold/60 bg-brand-gold/5 flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-4 text-center">
                    <Loader2 className="text-brand-gold h-6 w-6 animate-spin" />
                    <span className="text-brand-gold text-xs font-medium">
                      Compressing PAN document...
                    </span>
                  </div>
                ) : panCardFile ? (
                  <div className="relative flex min-h-[140px] items-center gap-3 rounded-xl border border-sky-500/30 bg-sky-500/5 p-3 dark:bg-sky-950/20">
                    <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-lg border border-sky-500/40 bg-slate-800 text-sky-400">
                      <FileText className="h-8 w-8" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                        {panCardFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {(panCardFile.size / 1024).toFixed(1)} KB
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                        <CheckCircle2 className="h-3 w-3" /> Attached
                      </span>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove PAN document"
                      onClick={() => onRemoveFile('panCard')}
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-red-200 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 dark:border-red-900/40 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="pancard-upload"
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingPan(true);
                    }}
                    onDragLeave={() => setIsDraggingPan(false)}
                    onDrop={(e) => handleDrop(e, 'panCard')}
                    className={`group flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition-all ${
                      isDraggingPan
                        ? 'border-brand-gold bg-brand-gold/10 scale-[1.01]'
                        : 'hover:border-brand-gold dark:hover:border-brand-gold/60 border-slate-300 bg-white hover:bg-slate-50/80 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:bg-slate-900/90'
                    }`}
                  >
                    <div className="group-hover:bg-brand-gold/10 group-hover:text-brand-gold dark:group-hover:bg-brand-gold/20 dark:group-hover:text-brand-gold flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors dark:bg-slate-800 dark:text-slate-300">
                      <UploadCloud className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Click or drag PAN card to upload
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Supports JPG, PNG, WEBP, PDF up to 5MB
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Permanent Residential Address */}
          <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-6 dark:border-slate-800/80 dark:bg-slate-900/40">
            <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3 dark:border-slate-800">
              <Building2 className="text-brand-gold h-4 w-4" aria-hidden="true" />
              <h3 className="text-sm font-bold tracking-wider text-slate-800 uppercase dark:text-slate-200">
                3. Permanent Residential Address
              </h3>
            </div>

            {/* Smart PIN Code with Auto-lookup */}
            <div className="space-y-1.5">
              <label
                htmlFor="pincode"
                className="flex items-center justify-between text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
              >
                <span className="flex items-center gap-1.5">
                  <MapPin className="text-brand-gold h-3.5 w-3.5" aria-hidden="true" />
                  <span>PIN Code (6 Digits)</span>
                  <span className="text-red-500">*</span>
                </span>
                {pincodeLoading && (
                  <span className="text-brand-gold inline-flex items-center gap-1 text-[11px]">
                    <Loader2 className="h-3 w-3 animate-spin" /> Auto-looking up...
                  </span>
                )}
                {pincodeSuccess && !pincodeLoading && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                    <Check className="h-3 w-3" /> State & City Resolved
                  </span>
                )}
                {pincodeNotFound && !pincodeLoading && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-500">
                    PIN not found — select State & City below
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  inputMode="numeric"
                  required
                  maxLength={6}
                  autoComplete="postal-code"
                  placeholder="e.g. 201301"
                  value={formData.pincode}
                  onChange={handlePincodeChange}
                  onBlur={onBlur}
                  aria-describedby={errors.pincode ? 'pincode-error' : undefined}
                  className={`${getInputClasses('pincode')} font-mono tracking-widest`}
                />
                {pincodeLoading && (
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <Loader2 className="text-brand-gold h-4 w-4 animate-spin" />
                  </div>
                )}
                {pincodeSuccess && !pincodeLoading && (
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                )}
              </div>

              {errors.pincode && (
                <p
                  id="pincode-error"
                  role="alert"
                  className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{errors.pincode}</span>
                </p>
              )}
            </div>

            {/* State and City Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* State Selector */}
              <div className="space-y-1.5">
                <label
                  htmlFor="state"
                  className="flex items-center justify-between text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
                >
                  <span className="flex items-center gap-1.5">
                    <span>State / Union Territory</span>
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                <select
                  id="state"
                  name="state"
                  required
                  value={
                    INDIAN_STATES_AND_UTS.find(
                      (st) => st.value.toLowerCase() === (formData.state || '').toLowerCase()
                    )?.value || ''
                  }
                  onChange={onChange}
                  onBlur={onBlur}
                  aria-describedby={errors.state ? 'state-error' : undefined}
                  className={getInputClasses('state')}
                >
                  <option value="">Select State / UT</option>
                  {INDIAN_STATES_AND_UTS.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>

                {errors.state && (
                  <p
                    id="state-error"
                    role="alert"
                    className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
                  >
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{errors.state}</span>
                  </p>
                )}
              </div>

              {/* City Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="city"
                  className="flex items-center justify-between text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
                >
                  <span className="flex items-center gap-1.5">
                    <span>City / District</span>
                    <span className="text-red-500">*</span>
                  </span>
                </label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  autoComplete="address-level2"
                  placeholder="e.g. Gautam Buddha Nagar / Noida"
                  value={formData.city}
                  onChange={handleCityChange}
                  onBlur={onBlur}
                  aria-describedby={errors.city ? 'city-error' : undefined}
                  className={`${getInputClasses('city')} uppercase`}
                />

                {errors.city && (
                  <p
                    id="city-error"
                    role="alert"
                    className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
                  >
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{errors.city}</span>
                  </p>
                )}
              </div>
            </div>

            {/* House / Flat & Street Address */}
            <div className="space-y-1.5">
              <label
                htmlFor="address"
                className="flex items-center justify-between text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
              >
                <span className="flex items-center gap-1.5">
                  <span>House / Flat & Street Address</span>
                  <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                id="address"
                name="address"
                type="text"
                required
                autoComplete="street-address"
                placeholder="e.g. House No. 12, Sector 62, Noida"
                value={formData.address}
                onChange={handleAddressChange}
                onBlur={onBlur}
                aria-describedby={errors.address ? 'address-error' : undefined}
                className={`${getInputClasses('address')} uppercase`}
              />

              {errors.address && (
                <p
                  id="address-error"
                  role="alert"
                  className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{errors.address}</span>
                </p>
              )}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onPrev}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.99] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>{tr('prevStep', 'Back to Applicant')}</span>
            </button>

            <button
              type="button"
              onClick={onNext}
              className="from-brand-gold via-brand-gold-light to-brand-gold shadow-brand-gold/20 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-8 py-3 text-sm font-bold text-slate-950 shadow-lg transition-all hover:brightness-105 active:scale-[0.99]"
            >
              <span>{tr('nextStep', 'Next: Property Preferences')}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Right Column: Sticky Live ID Pass Preview (Desktop) */}
        <div className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-8 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Live Digital Pass Preview
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Real-time Sync
              </span>
            </div>

            <KycPreviewCard
              fullName={fullName}
              photoFile={photoFile}
              panCardFile={panCardFile}
              aadharNumber={formData.aadharNumber}
              panNumber={formData.panNumber}
              city={formData.city}
              state={formData.state}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
