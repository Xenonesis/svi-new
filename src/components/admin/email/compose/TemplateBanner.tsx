'use client';

import { PenLine, LayoutTemplate, Trash2 } from 'lucide-react';
import { EMAIL_TEMPLATES } from '../constants';

interface TemplateBannerProps {
  selectedTemplate: string | null;
  templateVars: Record<string, string>;
  onEditTemplate: () => void;
  onClearTemplate: () => void;
  onVariableChange: (key: string, value: string) => void;
  onRemoveVariable?: (key: string) => void;
}

export function TemplateBanner({
  selectedTemplate,
  templateVars,
  onEditTemplate,
  onClearTemplate,
  onVariableChange,
  onRemoveVariable,
}: TemplateBannerProps) {
  if (!selectedTemplate) return null;

  const templateName = EMAIL_TEMPLATES.find((t) => t.id === selectedTemplate)?.name;
  if (!templateName) return null;

  return (
    <div className="border-b border-gray-100 bg-blue-50/50 px-6 py-3 dark:border-gray-800 dark:bg-blue-900/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="h-4 w-4 text-blue-500" />
          <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
            Template: {templateName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEditTemplate}
            className="flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
          >
            <PenLine className="h-3.5 w-3.5" /> Edit Template
          </button>
          <button
            onClick={onClearTemplate}
            className="text-xs font-medium text-blue-500 hover:text-blue-700 dark:text-blue-300"
          >
            ✏️ Write Custom
          </button>
        </div>
      </div>
      {Object.keys(templateVars).length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {Object.entries(templateVars).map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <label className="mb-1 text-[10px] font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                {key.replace(/_/g, ' ')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onVariableChange(key, e.target.value)}
                  placeholder={`Enter ${key.replace(/_/g, ' ')}...`}
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 transition-colors outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                />
                {onRemoveVariable && (
                  <button
                    onClick={() => onRemoveVariable(key)}
                    title={`Delete ${key}`}
                    className="rounded-md p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
