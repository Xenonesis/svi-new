'use client';

import { Download, Image as ImageIcon, Maximize2, X } from 'lucide-react';

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
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder,
  className = '',
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
        required={required}
        placeholder={placeholder}
        className="focus:border-brand-gold focus:ring-brand-gold/50 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-sans text-sm text-gray-900 placeholder-gray-400 transition-all focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white dark:placeholder-gray-600"
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
}

export function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  className = '',
}: FormSelectProps) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase transition-colors duration-300 dark:text-gray-400">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
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
    <div className="custom-scrollbar relative max-h-[800px] flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-inner sm:p-6 dark:border-white/10 dark:bg-[#0e0e14]">
      {!hasPreview ? (
        <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-400 dark:text-gray-600">
          Fill the form to generate a preview.
        </div>
      ) : (
        <div
          id={previewId}
          className="mx-auto w-full max-w-3xl origin-top transform rounded-lg border border-gray-200 bg-white p-8 text-gray-800 shadow-sm"
        >
          {children}
        </div>
      )}
    </div>
  );
}
