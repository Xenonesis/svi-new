import { z } from 'zod';
import { normalizeIndianPhone } from '@/src/lib/utils/phone';

/** Letters in any script (Latin, Devanagari, …) plus spaces */
const NAME_REGEX = /^[\p{L}\s]+$/u;

export const ALLOWED_SIZES = [
  '50-100',
  '100-200',
  '200-400',
  '400-700',
  '700-1000',
  '1000-1500',
  '1500-2000',
] as const;

export const ALLOWED_TYPES = ['residential-plot', 'commercial-shop', 'luxury-farm-house'] as const;

export const ALLOWED_PREFS = ['main-road', 'park', 'corner', 'none'] as const;

export const ALLOWED_PLANS = [
  'one-time',
  '3-months',
  '6-months',
  '12-months',
  '18-months',
  '24-months',
] as const;

export const ALLOWED_MODES = ['online', 'cash', 'net-banking'] as const;

export const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'tempmail.com',
  'temp-mail.org',
  'throwaway.email',
  'yopmail.com',
  'sharklasers.com',
  'grr.la',
  '10minutemail.com',
  'burner.email',
  'mailnator.com',
  'trashmail.com',
]);

export const RegistrationSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be ≤ 50 chars')
    .regex(NAME_REGEX, 'First name must contain only letters and spaces'),
  lastName: z
    .string()
    .trim()
    .max(50, 'Last name must be ≤ 50 chars')
    .regex(/^[\p{L}\s]*$/u, 'Last name must contain only letters and spaces')
    .optional()
    .default(''),
  mobileNo: z
    .string()
    .transform((v) => normalizeIndianPhone(v) ?? v.trim().replace(/\D/g, ''))
    .pipe(
      z.string().regex(/^[6-9]\d{9}$/, 'Mobile must be a 10-digit Indian number starting with 6-9')
    ),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email format')
    .max(254, 'Email too long')
    .refine((email) => {
      const domain = email.split('@')[1];
      return !DISPOSABLE_DOMAINS.has(domain);
    }, 'Please use a permanent email address (disposable domains not allowed)'),
  soWoDo: z
    .string()
    .trim()
    .min(1, 'S/O, W/O, D/O is required')
    .max(50, 'S/O, W/O, D/O must be ≤ 50 chars'),
  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'DOB must be YYYY-MM-DD')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      if (birthDate > today) return false;
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      return age >= 18 && age <= 100;
    }, 'You must be at least 18 years old'),
  aadharNumber: z
    .string()
    .transform((v) => v.replace(/\s+/g, '').trim())
    .pipe(z.string().regex(/^[2-9]\d{11}$/, 'Aadhar must be 12 digits starting with 2-9')),
  panNumber: z
    .string()
    .trim()
    .transform((v) => v.toUpperCase())
    .refine((v) => !v || /^[A-Z]{5}\d{4}[A-Z]$/.test(v), {
      message: 'PAN must be in format ABCDE1234F',
    })
    .optional()
    .default(''),
  state: z.string().trim().min(2, 'State is required').max(50, 'State must be ≤ 50 chars'),
  city: z.string().trim().min(2, 'City is required').max(50, 'City must be ≤ 50 chars'),
  address: z
    .string()
    .trim()
    .min(5, 'Address must be at least 5 characters')
    .max(500, 'Address must be ≤ 500 chars'),
  advisorName: z.string().trim().min(1, 'Advisor is required').max(100, 'Advisor name too long'),
  project: z.string().min(1, 'Project is required'),
  propertySize: z.enum(ALLOWED_SIZES, 'Invalid property size'),
  propertyType: z.enum(ALLOWED_TYPES, 'Invalid property type'),
  plotPreference: z.enum(ALLOWED_PREFS, 'Invalid plot preference'),
  paymentPlan: z.enum(ALLOWED_PLANS, 'Invalid payment plan'),
  paymentMode: z.enum(ALLOWED_MODES, 'Invalid payment mode'),
  schemeAmount: z
    .string()
    .transform((v) => v.replace(/[,\s₹]/g, '').trim())
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0 && num <= 10_000_000;
    }, 'Scheme amount must be a positive number up to ₹10,000,000'),
  captchaAnswer: z.string().optional().default(''),
});

export type RegistrationInput = z.infer<typeof RegistrationSchema>;
