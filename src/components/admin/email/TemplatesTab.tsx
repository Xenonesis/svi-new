'use client';

import { useState } from 'react';
import { Check, Copy, ChevronRight, FileText } from 'lucide-react';
import { EMAIL_TEMPLATES } from './constants';

export function TemplatesTab() {
  const [selected, setSelected] = useState<(typeof EMAIL_TEMPLATES)[0] | null>(null);
  const [copied, setCopied] = useState(false);

  const copyHtml = () => {
    if (!selected) return;
    navigator.clipboard.writeText(selected.html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 gap-6 font-sans lg:grid-cols-3">
      {/* Template list */}
      <div className="space-y-3 lg:col-span-1">
        {EMAIL_TEMPLATES.map((tpl) => {
          const TplIcon = tpl.icon;
          return (
            <button
              key={tpl.id}
              onClick={() => setSelected(tpl)}
              className={`w-full rounded-xl border p-4 text-left transition-all ${
                selected?.id === tpl.id
                  ? 'border-brand-gold/40 bg-brand-gold/5'
                  : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-[#0e0e14] dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${selected?.id === tpl.id ? 'bg-brand-gold/15 text-brand-gold' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}
                >
                  <TplIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {tpl.name}
                  </p>
                  <p className="text-xs text-gray-400">{tpl.category}</p>
                </div>
                <ChevronRight
                  className={`ml-auto h-4 w-4 shrink-0 text-gray-400 transition-transform ${selected?.id === tpl.id ? 'text-brand-gold rotate-90' : ''}`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Template detail */}
      <div className="lg:col-span-2">
        {!selected ? (
          <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 text-center dark:border-gray-700">
            <FileText className="mb-3 h-8 w-8 text-gray-300" />
            <p className="font-sans text-sm text-gray-400">Select a template to preview</p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-[#0e0e14]">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{selected.name}</h3>
                <p className="mt-0.5 text-xs text-gray-400">
                  Subject:{' '}
                  <span className="text-gray-600 dark:text-gray-300">{selected.subject}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyHtml}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:border-gray-300 dark:border-gray-600 dark:text-gray-400"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? 'Copied!' : 'Copy HTML'}
                </button>
              </div>
            </div>
            <div className="p-4">
              <p className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Visual Preview
              </p>
              <div
                className="max-h-[500px] overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
                dangerouslySetInnerHTML={{ __html: selected.html }}
              />
            </div>
            <div className="border-t border-gray-100 px-4 pb-4 dark:border-gray-700">
              <p className="mt-4 mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Available Variables
              </p>
              <div className="flex flex-wrap gap-1.5">
                {Array.from(selected.html.matchAll(/\{\{(\w+)\}\}/g)).map(([, v], i) => (
                  <span
                    key={i}
                    className="rounded-md bg-amber-50 px-2 py-0.5 font-mono text-[11px] text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                  >
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
