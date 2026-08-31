'use client';

import { useState } from 'react';
import { PenLine, LayoutTemplate, Trash2, Sparkles, Check, Wand2, HelpCircle } from 'lucide-react';
import { EMAIL_TEMPLATES } from '../constants';
import { SmartTemplateSuggestion } from './SmartTemplateSuggestion';

interface TemplateBannerProps {
  selectedTemplate: string | null;
  templateVars: Record<string, string>;
  templateName?: string; // override for AI-generated templates
  recipientEmail?: string;
  onEditTemplate: () => void;
  onClearTemplate: () => void;
  onVariableChange: (key: string, value: string) => void;
  onRemoveVariable?: (key: string) => void;
  onApplySuggestions?: (suggestions: Record<string, string>) => void;
}

export function TemplateBanner({
  selectedTemplate,
  templateVars,
  templateName: explicitName,
  recipientEmail,
  onEditTemplate,
  onClearTemplate,
  onVariableChange,
  onRemoveVariable,
  onApplySuggestions,
}: TemplateBannerProps) {
  const [showSmartFill, setShowSmartFill] = useState(false);
  if (!selectedTemplate) return null;

  const templateName =
    explicitName ||
    EMAIL_TEMPLATES.find((t) => t.id === selectedTemplate)?.name ||
    'Corporate Template';

  const varEntries = Object.entries(templateVars);
  const totalVars = varEntries.length;
  const filledVars = varEntries.filter(([, v]) => v && v.trim().length > 0).length;
  const allFilled = totalVars > 0 && filledVars === totalVars;

  // Auto-Fill Smart Defaults for unfilled variables
  const handleQuickAutoFill = () => {
    varEntries.forEach(([key, value]) => {
      if (!value || !value.trim()) {
        if (key === 'name') {
          const fallback = recipientEmail?.split('@')[0]?.replace(/[._]/g, ' ') || 'Sanu Mishra';
          onVariableChange(
            key,
            fallback.replace(/\b\w/g, (c) => c.toUpperCase())
          );
        } else if (key.includes('date') || key === 'start_date') {
          const d = new Date();
          d.setDate(d.getDate() + 7);
          onVariableChange(
            key,
            d.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          );
        } else if (key === 'role' || key.includes('designation')) {
          onVariableChange(key, 'Freelance Consultant');
        } else if (key === 'project' || key === 'projectName') {
          onVariableChange(key, 'Shivani Vatika 11th');
        } else if (key === 'compensation') {
          onVariableChange(key, '₹45,000 / month');
        } else if (key === 'helpdeskName') {
          onVariableChange(key, 'SVI Helpdesk:');
        } else if (key === 'helpdeskPhone') {
          onVariableChange(key, '+91-73000-07643');
        } else if (key === 'helpdeskEmail') {
          onVariableChange(key, 'info@sviinfrasolutions.com');
        } else if (key === 'helpdeskTitle') {
          onVariableChange(key, 'Need assistance?');
        } else if (key.includes('url') || key.includes('portal') || key.includes('link')) {
          onVariableChange(key, 'https://www.sviinfrasolutions.com');
        } else {
          onVariableChange(
            key,
            key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
          );
        }
      }
    });
  };

  return (
    <div className="border-brand-gold/20 bg-brand-gold/5 dark:border-brand-gold/15 dark:bg-brand-gold/[0.03] border-b px-4 py-3 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="bg-brand-gold/15 text-brand-gold flex h-6 w-6 items-center justify-center rounded-md">
            <LayoutTemplate className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wide text-gray-900 uppercase dark:text-white">
                {templateName}
              </span>
              {totalVars > 0 && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    allFilled
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {allFilled ? <Check className="h-3 w-3" /> : null}
                  {filledVars}/{totalVars} fields filled
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleQuickAutoFill}
            className="text-brand-gold hover:bg-brand-gold/15 flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors"
            title="Auto-fill empty fields with smart defaults"
          >
            <Wand2 className="h-3 w-3" />
            <span>Auto-Fill</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSmartFill(!showSmartFill)}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/20"
          >
            <Sparkles className="h-3 w-3" />
            <span>AI Suggest</span>
          </button>
          <button
            type="button"
            onClick={onEditTemplate}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/20"
          >
            <PenLine className="h-3 w-3" />
            <span>Edit HTML</span>
          </button>
          <button
            type="button"
            onClick={onClearTemplate}
            className="rounded-lg px-2.5 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/20"
            title="Clear template and switch to blank editor"
          >
            Clear
          </button>
        </div>
      </div>

      {totalVars > 0 && (
        <div className="mt-3">
          <SmartTemplateSuggestion
            open={showSmartFill}
            templateId={selectedTemplate}
            variables={Object.keys(templateVars)}
            recipientEmail={recipientEmail}
            onClose={() => setShowSmartFill(false)}
            onApply={(suggestions) => {
              Object.entries(suggestions).forEach(([key, value]) => {
                onVariableChange(key, value);
              });
              onApplySuggestions?.(suggestions);
            }}
          />

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {varEntries.map(([key, value]) => {
              const isFilled = Boolean(value && value.trim());
              return (
                <div key={key} className="flex flex-col">
                  <label className="mb-1 flex items-center justify-between text-[10px] font-bold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                    <span className="truncate">
                      {key === 'helpdeskName'
                        ? 'Helpdesk Name / Desk'
                        : key === 'helpdeskPhone'
                          ? 'Helpdesk Phone / Mobile'
                          : key === 'helpdeskEmail'
                            ? 'Helpdesk Email Address'
                            : key === 'helpdeskTitle'
                              ? 'Assistance Title'
                              : key.replace(/_/g, ' ')}
                    </span>
                    {isFilled ? (
                      <span className="shrink-0 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                        ✓ Ready
                      </span>
                    ) : (
                      <span className="shrink-0 text-[9px] font-medium text-amber-500">
                        Required
                      </span>
                    )}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => onVariableChange(key, e.target.value)}
                      placeholder={`Enter ${key.replace(/_/g, ' ')}...`}
                      className={`focus-gold flex-1 rounded-lg border bg-white px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 transition-colors outline-none dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 ${
                        isFilled
                          ? 'border-gray-200 dark:border-gray-700'
                          : 'border-amber-300 bg-amber-50/30 dark:border-amber-500/40 dark:bg-amber-950/10'
                      }`}
                    />
                    {onRemoveVariable && (
                      <button
                        type="button"
                        onClick={() => onRemoveVariable(key)}
                        title={`Delete ${key}`}
                        className="rounded-md p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
