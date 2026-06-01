'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Copy, FileText, ArrowRight, ExternalLink, Send } from 'lucide-react';
import { toast } from 'sonner';
import { EMAIL_TEMPLATES } from './constants';

interface TemplatesTabProps {
  onUseTemplate?: (subject: string, html: string) => void;
}

export function TemplatesTab({ onUseTemplate }: TemplatesTabProps) {
  const [selected, setSelected] = useState<(typeof EMAIL_TEMPLATES)[0] | null>(null);
  const [copied, setCopied] = useState(false);

  const copyHtml = () => {
    if (!selected) return;
    navigator.clipboard.writeText(selected.html);
    setCopied(true);
    toast.success('Template HTML copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const useTemplate = () => {
    if (!selected || !onUseTemplate) return;
    onUseTemplate(selected.subject, selected.html);
    toast.success(`Using "${selected.name}" template`);
  };

  const openPreview = () => {
    if (!selected) return;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(selected.html);
      win.document.close();
    }
  };

  const categories = [...new Set(EMAIL_TEMPLATES.map((t) => t.category))];

  return (
    <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm lg:grid-cols-3 dark:border-gray-700/60 dark:bg-[#0e0e14]">
      {/* Template list */}
      <div
        className="scrollbar-gold overflow-y-auto border-r border-gray-100 lg:col-span-1 dark:border-gray-800"
        style={{ maxHeight: 'calc(100vh - 260px)' }}
      >
        <div className="p-4">
          <p className="mb-3 font-mono text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
            Email Templates
          </p>
          {categories.map((cat) => {
            const catTemplates = EMAIL_TEMPLATES.filter((t) => t.category === cat);
            return (
              <div key={cat} className="mb-4">
                <p className="mb-2 px-2 text-[10px] font-semibold tracking-wider text-gray-400/70 uppercase">
                  {cat}
                </p>
                <div className="space-y-1">
                  {catTemplates.map((tpl) => {
                    const TplIcon = tpl.icon;
                    const isActive = selected?.id === tpl.id;
                    return (
                      <motion.button
                        key={tpl.id}
                        onClick={() => setSelected(tpl)}
                        whileHover={{ x: 2 }}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                          isActive
                            ? 'bg-brand-gold/5 text-brand-gold'
                            : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/[0.02]'
                        }`}
                      >
                        <TplIcon
                          className={`h-4 w-4 shrink-0 ${isActive ? 'text-brand-gold' : 'text-gray-400'}`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium">{tpl.name}</p>
                        </div>
                        {isActive && <ArrowRight className="text-brand-gold h-3 w-3 shrink-0" />}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Template detail */}
      <div className="scrollbar-gold lg:col-span-2" style={{ maxHeight: 'calc(100vh - 260px)' }}>
        <AnimatePresence mode="wait">
          {!selected ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full min-h-64 flex-col items-center justify-center p-8 text-center"
            >
              <FileText className="mb-3 h-8 w-8 text-gray-300 dark:text-gray-700" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Select a template to preview
              </p>
              <p className="mt-1 text-xs text-gray-400">Choose from the list on the left</p>
            </motion.div>
          ) : (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {selected.name}
                  </h3>
                  <p className="mt-0.5 font-mono text-[11px] text-gray-500">
                    Subject:{' '}
                    <span className="text-gray-700 dark:text-gray-300">{selected.subject}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {onUseTemplate && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={useTemplate}
                      className="bg-brand-gold text-brand-navy glow-gold flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all hover:opacity-90"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Use Template
                    </motion.button>
                  )}
                  <button
                    onClick={openPreview}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:border-gray-300 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Preview
                  </button>
                  <button
                    onClick={copyHtml}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:border-gray-300 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600"
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

              {/* Preview */}
              <div className="p-6">
                <p className="mb-2 font-mono text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                  Preview
                </p>
                <div
                  className="scrollbar-gold max-h-[400px] overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/20"
                  dangerouslySetInnerHTML={{ __html: selected.html }}
                />
              </div>

              {/* Variables */}
              <div className="border-t border-gray-100 px-6 py-4 dark:border-gray-800">
                <p className="mb-2 font-mono text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                  Variables
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(selected.html.matchAll(/\{\{(\w+)\}\}/g)).map(([, v], i) => (
                    <span
                      key={i}
                      className="rounded-md border border-amber-200/60 bg-amber-50 px-2.5 py-1 font-mono text-[11px] text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-400"
                    >
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
