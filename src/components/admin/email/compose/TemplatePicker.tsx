'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, ChevronDown, LayoutTemplate, Check } from 'lucide-react';
import { EMAIL_TEMPLATES } from '../constants';

interface TemplatePickerProps {
  selectedTemplate: string | null;
  onSelect: (templateId: string) => void;
}

export function TemplatePicker({ selectedTemplate, onSelect }: TemplatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredTemplates = EMAIL_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(EMAIL_TEMPLATES.map((t) => t.category))];

  const selectedName = selectedTemplate
    ? EMAIL_TEMPLATES.find((t) => t.id === selectedTemplate)?.name || 'Template'
    : null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
          selectedTemplate
            ? 'text-brand-gold bg-brand-gold/5'
            : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-white/5'
        }`}
      >
        <LayoutTemplate className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{selectedName || 'Templates'}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${showPicker ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 bottom-full z-50 mb-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-[#0e0e14]"
          >
            <div className="border-b border-gray-100 p-3 dark:border-gray-800">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search templates..."
                  autoFocus
                  className="focus:border-brand-gold focus:ring-brand-gold/20 w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-3 pl-9 text-xs text-gray-900 placeholder-gray-400 outline-none focus:ring-1 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-500"
                />
              </div>
            </div>
            <div className="scrollbar-gold max-h-72 overflow-y-auto">
              {categories.map((cat) => {
                const catTemplates = filteredTemplates.filter((t) => t.category === cat);
                if (catTemplates.length === 0) return null;
                return (
                  <div key={cat}>
                    <div className="bg-gray-50/80 px-4 py-2 dark:bg-gray-800/30">
                      <span className="font-mono text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                        {cat}
                      </span>
                    </div>
                    {catTemplates.map((tpl) => {
                      const TplIcon = tpl.icon;
                      const isActive = selectedTemplate === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          onClick={() => {
                            onSelect(tpl.id);
                            setShowPicker(false);
                          }}
                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            isActive
                              ? 'bg-brand-gold/5'
                              : 'hover:bg-gray-50 dark:hover:bg-white/[0.02]'
                          }`}
                        >
                          <TplIcon
                            className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-brand-gold' : 'text-gray-400'}`}
                          />
                          <div className="min-w-0 flex-1">
                            <p
                              className={`truncate text-xs font-medium ${isActive ? 'text-brand-gold' : 'text-gray-700 dark:text-gray-300'}`}
                            >
                              {tpl.name}
                            </p>
                            <p className="truncate text-[10px] text-gray-400">{tpl.subject}</p>
                          </div>
                          {isActive && <Check className="text-brand-gold h-3.5 w-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
              {filteredTemplates.length === 0 && (
                <div className="px-4 py-8 text-center text-xs text-gray-400">
                  No templates match your search
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
