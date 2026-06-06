'use client';

import { Check } from 'lucide-react';

export const ACCENTS = [
  { id: 'gold', label: 'Imperial Gold', color: '#c9a84c', light: '#dec070', dark: '#b08f36' },
  { id: 'navy', label: 'Royal Navy', color: '#2a3b61', light: '#415582', dark: '#1a2744' },
  { id: 'emerald', label: 'Emerald Luxe', color: '#10b981', light: '#34d399', dark: '#059669' },
  { id: 'slate', label: 'Obsidian Slate', color: '#4b5563', light: '#6b7280', dark: '#374151' },
];

interface AppearanceTabProps {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  accentColor: string;
  handleSelectAccent: (accentId: string) => void;
  uiDensity: string;
  handleSelectDensity: (densityId: string) => void;
}

export function AppearanceTab({
  theme,
  setTheme,
  accentColor,
  handleSelectAccent,
  uiDensity,
  handleSelectDensity,
}: AppearanceTabProps) {
  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-brand-navy mb-1 font-sans font-serif text-xl font-bold dark:text-white">
          Appearance Preferences
        </h2>
        <p className="font-sans text-xs text-gray-500 dark:text-gray-400">
          Configure visual options, layout densities, and accent palettes.
        </p>
      </div>

      {/* Theme switch */}
      <div className="flex items-center justify-between border-b border-gray-100 py-4 dark:border-white/5">
        <div className="space-y-0.5 font-sans">
          <h3 className="font-sans text-sm font-bold text-gray-900 dark:text-white">
            Visual Mode (Theme)
          </h3>
          <p className="font-sans text-xs text-gray-500 dark:text-gray-400">
            Choose between light, deep premium dark, or OS system theme preferences.
          </p>
        </div>
        <div className="flex gap-2">
          {[
            { id: 'light', label: 'Light' },
            { id: 'dark', label: 'Dark' },
            { id: 'system', label: 'System' },
          ].map((mode) => {
            const isSelected = theme === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setTheme(mode.id as 'light' | 'dark' | 'system')}
                className={`cursor-pointer rounded-lg border px-4 py-2 text-xs font-bold uppercase transition-all duration-300 ${
                  isSelected
                    ? 'border-brand-gold bg-brand-gold/10 text-brand-gold font-sans'
                    : 'hover:bg-gray-150 border-gray-200 font-sans dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5'
                }`}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent Presets */}
      <div className="flex flex-col gap-4 border-b border-gray-100 py-4 font-sans dark:border-white/5">
        <div className="space-y-0.5">
          <h3 className="font-sans text-sm font-bold text-gray-900 dark:text-white">
            Brand Accent Color (Real-Time Override)
          </h3>
          <p className="font-sans text-xs text-gray-500 dark:text-gray-400">
            Select a premium color template to immediately transform the portal theme color scheme!
          </p>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          {ACCENTS.map((accent) => {
            const isSelected = accentColor === accent.id;
            return (
              <button
                key={accent.id}
                type="button"
                onClick={() => handleSelectAccent(accent.id)}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3.5 transition-all duration-300 ${
                  isSelected
                    ? 'border-brand-gold bg-brand-gold/10 text-brand-gold shadow-brand-gold/10 font-bold shadow-sm'
                    : 'border-gray-100 bg-white hover:border-gray-300 dark:border-white/5 dark:bg-[#111118]/40 dark:text-gray-400 dark:hover:border-white/10'
                }`}
              >
                <span
                  className="h-3 w-3 rounded-full border border-black/10"
                  style={{ backgroundColor: accent.color }}
                />
                <span className="font-sans text-xs">{accent.label}</span>
                {isSelected && <Check className="text-brand-gold ml-1 h-3 w-3" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Layout Density */}
      <div className="flex items-center justify-between py-4">
        <div className="space-y-0.5">
          <h3 className="font-sans text-sm font-bold text-gray-900 dark:text-white">
            Layout Spacing Density (Real-Time Scale)
          </h3>
          <p className="font-sans text-xs text-gray-500 dark:text-gray-400">
            Switch layout paddings between relaxed comfortable spacing or structured compact grids.
          </p>
        </div>
        <div className="flex gap-2">
          {[
            { id: 'comfortable', label: 'Comfortable' },
            { id: 'medium', label: 'Medium' },
            { id: 'compact', label: 'Compact' },
          ].map((density) => {
            const isSelected = uiDensity === density.id;
            return (
              <button
                key={density.id}
                type="button"
                onClick={() => handleSelectDensity(density.id)}
                className={`cursor-pointer rounded-lg border px-4 py-2 text-xs font-bold uppercase transition-all duration-300 ${
                  isSelected
                    ? 'border-brand-gold bg-brand-gold/10 text-brand-gold font-sans'
                    : 'hover:bg-gray-150 border-gray-200 font-sans dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5'
                }`}
              >
                {density.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
