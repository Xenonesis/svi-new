'use client';

import { type ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme | ((prev: Theme) => Theme)) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const THEME_STORAGE_KEY = 'svi-theme-v1';

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = THEME_STORAGE_KEY,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (t: Theme) => {
      root.classList.remove('light', 'dark');
      if (t === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(t);
      }
    };

    applyTheme(theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        applyTheme('system');
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else {
        mediaQuery.addListener(handleChange);
      }

      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleChange);
        } else {
          mediaQuery.removeListener(handleChange);
        }
      };
    }
  }, [theme]);

  const setTheme = useMemo(
    () => (newTheme: Theme | ((prev: Theme) => Theme)) => {
      const resolved = typeof newTheme === 'function' ? newTheme(theme) : newTheme;
      localStorage.setItem(storageKey, resolved);
      setThemeState(resolved);
    },
    [theme, storageKey]
  );

  const value = useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme, setTheme]
  );

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

import { useServerInsertedHTML } from 'next/navigation';

export function ThemeScript() {
  useServerInsertedHTML(() => {
    return (
      <script
        id="theme-init"
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=document.documentElement,e=localStorage.getItem('svi-theme-v1');if(e==='dark'||e==='light')t.classList.add(e);else if(e==='system'||!e){if(window.matchMedia('(prefers-color-scheme:dark)').matches)t.classList.add('dark');else t.classList.add('light')}else{t.classList.add('light')}}catch(e){}})();`,
        }}
      />
    );
  });
  return null;
}
