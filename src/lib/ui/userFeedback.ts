import { toast } from 'sonner';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';

/**
 * Standard Executive Toast Style matching SVI Luxury Obsidian & Warm Gold standard.
 */
const LUXURY_TOAST_STYLE = {
  background: '#070b14',
  color: '#f8fafc',
  border: '1px solid rgba(212, 175, 55, 0.25)',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
};

/**
 * Display a user-friendly error toast with intelligent database & security error translation.
 */
export function showUserError(
  error: unknown,
  fallback = 'Operation could not be completed'
): string {
  const message = extractApiErrorMessage(error, fallback);
  toast.error(message, {
    duration: 5000,
    style: {
      ...LUXURY_TOAST_STYLE,
      border: '1px solid rgba(239, 68, 68, 0.4)',
    },
  });
  return message;
}

/**
 * Display a user-friendly success toast.
 */
export function showUserSuccess(message: string, description?: string): void {
  toast.success(message, {
    description,
    duration: 3500,
    style: LUXURY_TOAST_STYLE,
  });
}

/**
 * Display a user-friendly warning or caution toast.
 */
export function showUserWarning(message: string, description?: string): void {
  toast.warning(message, {
    description,
    duration: 4500,
    style: {
      ...LUXURY_TOAST_STYLE,
      border: '1px solid rgba(245, 158, 11, 0.4)',
    },
  });
}

/**
 * Display an informative status toast.
 */
export function showUserInfo(message: string, description?: string): void {
  toast.info(message, {
    description,
    duration: 4000,
    style: LUXURY_TOAST_STYLE,
  });
}
