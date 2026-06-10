import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface UIState {
  /** Mobile sidebar open state */
  mobileSidebarOpen: boolean;
  /** Whether dark mode is currently active (resolved from theme) */
  isDark: boolean;
  /** Theme preference */
  theme: Theme;

  setMobileSidebarOpen: (open: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setIsDark: (dark: boolean) => void;
}

function applyThemeClass(theme: Theme) {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  if (theme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(isDark ? 'dark' : 'light');
  } else {
    root.classList.add(theme);
  }
}

function themeToIsDark(theme: Theme): boolean {
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      mobileSidebarOpen: false,
      isDark: false,
      theme: 'system',

      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

      toggleTheme: () => {
        const { theme } = get();
        const next: Theme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
        const isDark = themeToIsDark(next);
        applyThemeClass(next);
        set({ theme: next, isDark });
      },

      setTheme: (theme) => {
        applyThemeClass(theme);
        set({ theme, isDark: themeToIsDark(theme) });
      },

      setIsDark: (dark) => set({ isDark: dark }),
    }),
    {
      name: 'svi-ui-store',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        // Apply theme on store rehydration
        if (state) {
          const isDark = themeToIsDark(state.theme);
          state.isDark = isDark;
          applyThemeClass(state.theme);
        }
      },
    }
  )
);
