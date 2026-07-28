'use client';

import { AlertCircle } from 'lucide-react';

export const INPUT_CLASS = (field: string, errors: Record<string, string>, attempted?: boolean) => {
  if (errors[field])
    return 'w-full border bg-gray-50/50 px-4 py-3 text-sm transition-colors outline-none focus:ring-0 dark:bg-gray-900 dark:text-white border-red-500';
  if (attempted)
    return 'w-full border bg-gray-50/50 px-4 py-3 text-sm transition-colors outline-none focus:ring-0 dark:bg-gray-900 dark:text-white border-green-500 focus:border-green-500 dark:border-green-500 dark:focus:border-green-500';
  return 'w-full border bg-gray-50/50 px-4 py-3 text-sm transition-colors outline-none focus:ring-0 dark:bg-gray-900 dark:text-white border-gray-200 focus:border-brand-gold dark:border-gray-700 dark:focus:border-brand-gold';
};

export const LABEL_CLASS = 'text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase';

interface FieldErrorProps {
  field: string;
  errors: Record<string, string>;
}

export function FieldError({ field, errors }: FieldErrorProps) {
  if (!errors[field]) return null;
  return (
    <p id={`${field}-error`} className="mt-1 flex items-center gap-1 text-xs text-red-500">
      <AlertCircle size={12} /> {errors[field]}
    </p>
  );
}

interface FormInputProps {
  name: string;
  label: string;
  value: string;
  errors: Record<string, string>;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  type?: string;
  placeholder?: string;
  attempted?: boolean;
}

export function FormInput({
  name,
  label,
  value,
  errors,
  onChange,
  type = 'text',
  placeholder = '',
  attempted,
}: FormInputProps) {
  const errorId = `${name}-error`;
  return (
    <div className="space-y-2">
      <label htmlFor={name} className={LABEL_CLASS}>
        {label} *
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={INPUT_CLASS(name, errors, attempted)}
        placeholder={placeholder}
        aria-invalid={errors[name] ? 'true' : undefined}
        aria-describedby={errors[name] ? errorId : undefined}
      />
      <FieldError field={name} errors={errors} />
    </div>
  );
}

interface FormSelectProps {
  name: string;
  label: string;
  value: string;
  options: { value: string; label: string }[] | string[];
  errors: Record<string, string>;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  placeholder: string;
  attempted?: boolean;
}

export function FormSelect({
  name,
  label,
  value,
  options,
  errors,
  onChange,
  placeholder,
  attempted,
}: FormSelectProps) {
  const errorId = `${name}-error`;
  return (
    <div className="space-y-2">
      <label htmlFor={name} className={LABEL_CLASS}>
        {label} *
      </label>
      <div className="relative">
        <select
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          className={`appearance-none ${INPUT_CLASS(name, errors, attempted)} pr-10`}
          aria-invalid={errors[name] ? 'true' : undefined}
          aria-describedby={errors[name] ? errorId : undefined}
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
      <FieldError field={name} errors={errors} />
    </div>
  );
}

interface FormFileUploadProps {
  type: 'photo' | 'panCard';
  label: string;
  file: File | null;
  errors: Record<string, string>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'panCard') => void;
  onRemoveFile: (type: 'photo' | 'panCard') => void;
  compressing?: boolean;
}

export function FormFileUpload({
  type,
  label,
  file,
  errors,
  onFileChange,
  onRemoveFile,
  compressing,
}: FormFileUploadProps) {
  // Show a "Compressing..." state while client-side image compression runs
  if (compressing) {
    return (
      <div className="space-y-2">
        <label className={LABEL_CLASS}>{label}</label>
        <div className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50/50 px-4 py-5 dark:border-gray-700 dark:bg-gray-900">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
          <span className="text-sm text-gray-500">
            Compressing... Reducing file size automatically...
          </span>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <label className={LABEL_CLASS}>{label}</label>
      {file ? (
        <div className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50/50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
          <span className="flex-1 truncate text-sm">
            {file.name}
            <span className="ml-2 text-[10px] text-gray-400">
              ({(file.size / 1024).toFixed(0)} KB)
            </span>
          </span>
          <button
            type="button"
            onClick={() => onRemoveFile(type)}
            className="text-gray-400 hover:text-red-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ) : (
        <label className="hover:border-brand-gold hover:text-brand-gold flex cursor-pointer flex-col items-center gap-1 rounded border border-dashed border-gray-300 bg-gray-50/50 px-4 py-5 text-sm text-gray-400 transition-colors dark:border-gray-700 dark:bg-gray-900">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>Choose file</span>
          <span className="text-[10px] text-gray-400">Photo or PDF under 150 KB</span>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => onFileChange(e, type)}
            className="hidden"
          />
        </label>
      )}
      <FieldError field={type} errors={errors} />
    </div>
  );
}
