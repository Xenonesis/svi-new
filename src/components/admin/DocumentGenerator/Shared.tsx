'use client';

import { Download, Image as ImageIcon, Maximize2, X, FileText } from 'lucide-react';

import { ReactNode, useEffect, useState } from 'react';

interface DownloadOptionsProps {
  onDownloadPDF: () => void;
  onDownloadImage: () => void;
  disabled?: boolean;
}

export function DownloadOptions({
  onDownloadPDF,
  onDownloadImage,
  disabled = false,
}: DownloadOptionsProps) {
  return (
    <div className="mt-6">
      <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Download Options</h3>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onDownloadPDF}
          disabled={disabled}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-5 w-5" /> Download as PDF
        </button>
        <button
          onClick={onDownloadImage}
          disabled={disabled}
          className="flex items-center justify-center gap-2 rounded-lg bg-green-600 py-3 font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ImageIcon className="h-5 w-5" /> Save as Image
        </button>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'number' | 'date' | 'email' | 'tel';
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  step?: string;
  min?: string;
  disabled?: boolean;
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onFocus,
  onBlur,
  required = false,
  placeholder,
  className = '',
  step,
  min,
  disabled = false,
}: FormFieldProps) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase transition-colors duration-300 dark:text-gray-400">
        {label} {required && '*'}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        required={required}
        placeholder={placeholder}
        step={step}
        min={min}
        disabled={disabled}
        className="focus:border-brand-gold focus:ring-brand-gold/50 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-sans text-sm text-gray-900 placeholder-gray-400 transition-all focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100/70 dark:border-white/10 dark:bg-[#111118] dark:text-white dark:placeholder-gray-600 dark:disabled:bg-gray-900/40"
      />
    </div>
  );
}

interface FormSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  className?: string;
  required?: boolean;
}

export function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  className = '',
  required = false,
}: FormSelectProps) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase transition-colors duration-300 dark:text-gray-400">
        {label} {required && '*'}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="focus:border-brand-gold focus:ring-brand-gold/50 w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-sans text-sm text-gray-900 transition-all focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function PreviewContainer({
  children,
  previewId,
  hasPreview,
}: {
  children: ReactNode;
  previewId: string;
  hasPreview: boolean;
}) {
  return (
    <div className="custom-scrollbar dark:bg-brand-dark-surface/40 relative flex-1 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-inner sm:p-6 dark:border-white/10 [:fullscreen]:overflow-hidden [:fullscreen]:rounded-none [:fullscreen]:border-none [:fullscreen]:p-0">
      {!hasPreview ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <div className="border-brand-gold/30 bg-brand-gold/10 flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm">
            <FileText className="text-brand-gold h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Live Document Preview
            </p>
            <p className="mt-1 max-w-xs text-xs text-gray-500 dark:text-gray-400">
              Fill in the form details to generate and view the real-time document preview.
            </p>
          </div>
        </div>
      ) : (
        <div
          id={previewId}
          className="mx-auto h-full w-full max-w-3xl origin-top transform overflow-auto rounded-lg border border-gray-200 bg-white p-8 text-gray-800 shadow-sm [:fullscreen]:h-full [:fullscreen]:max-w-none [:fullscreen]:overflow-auto [:fullscreen]:rounded-none [:fullscreen]:border-none"
        >
          {children}
        </div>
      )}
    </div>
  );
}
