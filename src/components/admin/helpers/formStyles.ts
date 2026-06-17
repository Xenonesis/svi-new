/**
 * Shared Tailwind class strings for admin form elements and modal overlays.
 * Import these instead of copy-pasting the long strings into each component.
 */

/** Standard modal overlay backdrop — used by all admin modals. */
export const MODAL_OVERLAY_CLASS =
  'fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-md dark:bg-black/85';

/** Standard styled text input for admin modals. */
export const INPUT_CLS =
  'w-full bg-white dark:bg-[#111118] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 transition-all font-sans';

/** Standard label style for admin modal form fields. */
export const LABEL_CLS =
  'text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mb-1.5 block transition-colors duration-300';
