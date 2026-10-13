'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Copy,
  FileText,
  ArrowRight,
  ExternalLink,
  Send,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Search,
  Monitor,
  Smartphone,
  Tag,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';
import { EMAIL_TEMPLATES } from './constants';
import { useCustomTemplates } from './hooks/useCustomTemplates';
import { AITemplateStudioModal } from './templates/AITemplateStudioModal';
import { ConfirmDialog } from './ConfirmDialog';
import { extractTemplateVars } from '@/src/lib/utils/templateParser';
import type { ElementType } from 'react';
import type { CustomEmailTemplate } from './types';

export interface DisplayTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  html: string;
  icon?: ElementType;
  isCustom?: boolean;
  description?: string;
  variables?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface TemplatesTabProps {
  onUseTemplate?: (subject: string, html: string) => void;
}

export function TemplatesTab({ onUseTemplate }: TemplatesTabProps) {
  const { customTemplates, deleteTemplate } = useCustomTemplates();

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  // Modal states
  const [showStudioModal, setShowStudioModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CustomEmailTemplate | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Combine custom templates + built-in templates
  const allTemplates: DisplayTemplate[] = useMemo(() => {
    const customList: DisplayTemplate[] = customTemplates.map((t) => ({
      ...t,
      isCustom: true,
      icon: Sparkles,
    }));
    const builtInList: DisplayTemplate[] = EMAIL_TEMPLATES.map((t) => ({
      ...t,
      isCustom: false,
    }));
    return [...customList, ...builtInList];
  }, [customTemplates]);

  // Selected template
  const selected = useMemo(() => {
    if (selectedId) {
      const found = allTemplates.find((t) => t.id === selectedId);
      if (found) return found;
    }
    return allTemplates[0] || null;
  }, [selectedId, allTemplates]);

  // Search filter
  const filteredTemplates = useMemo(() => {
    if (!search.trim()) return allTemplates;
    const q = search.toLowerCase();
    return allTemplates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [allTemplates, search]);

  // Split into custom and standard
  const customFiltered = useMemo(
    () => filteredTemplates.filter((t) => t.isCustom),
    [filteredTemplates]
  );
  const standardFiltered = useMemo(
    () => filteredTemplates.filter((t) => !t.isCustom),
    [filteredTemplates]
  );

  const standardCategories = useMemo(() => {
    return [...new Set(standardFiltered.map((t) => t.category))];
  }, [standardFiltered]);

  // Detected variables for selected template
  const detectedVariables = useMemo(() => {
    if (!selected?.html) return [];
    return extractTemplateVars(selected.html);
  }, [selected?.html]);

  const copyHtml = () => {
    if (!selected) return;
    navigator.clipboard.writeText(selected.html);
    setCopied(true);
    toast.success('Template HTML copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const useTemplate = () => {
    if (!selected || !onUseTemplate) return;
    onUseTemplate(selected.subject, selected.html);
    toast.success(`Loaded "${selected.name}" template in Compose`);
  };

  const openPreview = () => {
    if (!selected) return;
    const win = window.open('', '_blank');
    if (win) {
      win.document.open();
      win.document.write(selected.html);
      win.document.close();
    }
  };

  const copyVar = (v: string) => {
    navigator.clipboard.writeText(`{{${v}}}`);
    setCopiedVar(v);
    toast.success(`Copied {{${v}}}`);
    setTimeout(() => setCopiedVar(null), 1800);
  };

  const handleEditCustom = (t: DisplayTemplate) => {
    const customMatch = customTemplates.find((ct) => ct.id === t.id);
    if (customMatch) {
      setEditingTemplate(customMatch);
      setShowStudioModal(true);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    const ok = await deleteTemplate(deletingId);
    if (ok) {
      if (selectedId === deletingId) {
        setSelectedId(null);
      }
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & AI Studio Action Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:flex-row sm:items-center dark:border-gray-800 dark:bg-[#0c101a]">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 shadow-inner">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-gray-900 sm:text-lg dark:text-white">
                Email Templates & AI Studio
              </h2>
              <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-amber-600 dark:text-amber-300">
                {customTemplates.length} Custom AI &bull; {EMAIL_TEMPLATES.length} Standard
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Create, customize, preview, and save luxury corporate email layouts with SVI AI
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setEditingTemplate(null);
              setShowStudioModal(true);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700/80"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Blank Template</span>
          </button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => {
              setEditingTemplate(null);
              setShowStudioModal(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-gray-950 shadow-md shadow-amber-500/20 transition-all hover:opacity-95"
          >
            <Wand2 className="h-4 w-4 text-gray-950" />
            <span>Create with AI</span>
          </motion.button>
        </div>
      </div>

      {/* Main Two-Column Hub: List + Detail */}
      <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm lg:grid-cols-12 dark:border-gray-700/60 dark:bg-[#0c101a]">
        {/* Left Column: Template Library List (4 cols) */}
        <div
          className="scrollbar-gold border-b border-gray-100 lg:col-span-4 lg:border-r lg:border-b-0 dark:border-gray-800"
          style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}
        >
          <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 p-3.5 backdrop-blur-md dark:border-gray-800 dark:bg-[#0c101a]/95">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates or subjects..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pr-3 pl-9 text-xs text-gray-900 placeholder-gray-400 transition-colors outline-none focus:border-amber-400 focus:bg-white focus:ring-1 focus:ring-amber-400/20 dark:border-gray-800 dark:bg-gray-900/60 dark:text-white dark:placeholder-gray-500 dark:focus:bg-gray-900"
              />
            </div>
          </div>

          <div className="space-y-4 p-3.5">
            {/* Custom AI Templates Section (Pinned at Top) */}
            {customFiltered.length > 0 && (
              <div>
                <div className="mb-2 flex items-center justify-between px-2">
                  <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider text-amber-500 uppercase">
                    <Sparkles className="h-3 w-3" />
                    Custom AI Templates ({customFiltered.length})
                  </span>
                  <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-500">
                    Saved
                  </span>
                </div>

                <div className="space-y-1">
                  {customFiltered.map((tpl) => {
                    const isActive = selected?.id === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 transition-all ${
                          isActive
                            ? 'border border-amber-500/40 bg-amber-500/10 text-amber-500 shadow-sm'
                            : 'border border-transparent text-gray-700 hover:border-gray-200 hover:bg-gray-50 dark:text-gray-300 dark:hover:border-gray-800 dark:hover:bg-white/[0.03]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedId(tpl.id)}
                          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                        >
                          <Sparkles
                            className={`h-4 w-4 shrink-0 ${
                              isActive ? 'text-amber-500' : 'text-amber-400/80'
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate text-xs font-semibold">{tpl.name}</p>
                              <span className="py-0.2 rounded bg-amber-500/20 px-1 font-mono text-[9px] font-bold text-amber-500">
                                AI
                              </span>
                            </div>
                            <p className="truncate text-[10px] text-gray-400 dark:text-gray-500">
                              {tpl.subject}
                            </p>
                          </div>
                        </button>

                        {/* Quick Action Icons */}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            type="button"
                            title="Edit Custom Template"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCustom(tpl);
                            }}
                            className="rounded-lg p-1 text-gray-400 hover:bg-amber-500/20 hover:text-amber-400"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            title="Delete Custom Template"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingId(tpl.id);
                            }}
                            className="rounded-lg p-1 text-gray-400 hover:bg-red-500/20 hover:text-red-400"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Standard Built-in Categories */}
            {standardCategories.map((cat) => {
              const catTemplates = standardFiltered.filter((t) => t.category === cat);
              if (catTemplates.length === 0) return null;

              return (
                <div key={cat}>
                  <p className="mb-2 px-2 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                    {cat} ({catTemplates.length})
                  </p>
                  <div className="space-y-1">
                    {catTemplates.map((tpl) => {
                      const TplIcon = tpl.icon || FileText;
                      const isActive = selected?.id === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => setSelectedId(tpl.id)}
                          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all ${
                            isActive
                              ? 'border border-amber-500/30 bg-amber-500/5 font-medium text-amber-500'
                              : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/[0.02]'
                          }`}
                        >
                          <TplIcon
                            className={`h-4 w-4 shrink-0 ${
                              isActive ? 'text-amber-500' : 'text-gray-400'
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs">{tpl.name}</p>
                          </div>
                          {isActive && <ArrowRight className="h-3 w-3 shrink-0 text-amber-500" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {filteredTemplates.length === 0 && (
              <div className="py-12 text-center text-xs text-gray-400">
                No templates found matching &ldquo;{search}&rdquo;
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Template Detail & Visual Preview Stage (8 cols) */}
        <div
          className="scrollbar-gold flex flex-col lg:col-span-8"
          style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}
        >
          <AnimatePresence mode="wait">
            {!selected ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full min-h-80 flex-col items-center justify-center p-12 text-center"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                  <FileText className="h-7 w-7 text-gray-400" />
                </div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Select a template to preview
                </p>
                <p className="mt-1 max-w-sm text-xs text-gray-400">
                  Choose any standard corporate template or create a tailored luxury layout with AI.
                </p>
                <button
                  type="button"
                  onClick={() => setShowStudioModal(true)}
                  className="mt-4 flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/20"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Launch AI Template Studio
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="flex h-full flex-col"
              >
                {/* Header Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-5 dark:border-gray-800">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-base font-bold text-gray-900 dark:text-white">
                        {selected.name}
                      </h3>
                      <span className="rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {selected.category}
                      </span>
                      {selected.isCustom && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-amber-500 dark:text-amber-300">
                          <Sparkles className="h-3 w-3" />
                          AI Custom
                        </span>
                      )}
                    </div>
                    <p className="mt-1 font-mono text-xs text-gray-500 dark:text-gray-400">
                      Subject:{' '}
                      <span className="text-gray-800 dark:text-gray-200">{selected.subject}</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {onUseTemplate && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={useTemplate}
                        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 text-xs font-bold text-gray-950 shadow-md shadow-amber-500/20 transition-all hover:opacity-95"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Use Template</span>
                      </motion.button>
                    )}

                    {selected.isCustom && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleEditCustom(selected)}
                          className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-white"
                        >
                          <Pencil className="h-3.5 w-3.5 text-amber-500" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(selected.id)}
                          className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 dark:border-gray-700 dark:text-red-400 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </>
                    )}

                    {/* Viewport switch */}
                    <div className="flex items-center gap-0.5 rounded-xl border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-800 dark:bg-gray-900">
                      <button
                        type="button"
                        onClick={() => setPreviewDevice('desktop')}
                        className={`rounded-lg p-1.5 transition-colors ${
                          previewDevice === 'desktop'
                            ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-amber-400'
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                        title="Desktop view"
                      >
                        <Monitor className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDevice('mobile')}
                        className={`rounded-lg p-1.5 transition-colors ${
                          previewDevice === 'mobile'
                            ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-amber-400'
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                        title="Mobile view"
                      >
                        <Smartphone className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={openPreview}
                      className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>New Tab</span>
                    </button>

                    <button
                      type="button"
                      onClick={copyHtml}
                      className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>{copied ? 'Copied!' : 'Copy HTML'}</span>
                    </button>
                  </div>
                </div>

                {/* Preview Container */}
                <div className="flex-1 bg-gray-50/60 p-5 dark:bg-[#070b12]">
                  <div className="flex min-h-[480px] items-start justify-center">
                    <div
                      className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl transition-all duration-300 dark:border-gray-800 ${
                        previewDevice === 'mobile' ? 'w-[375px]' : 'w-full max-w-[620px]'
                      }`}
                    >
                      <iframe
                        srcDoc={selected.html}
                        title={selected.name}
                        sandbox="allow-same-origin"
                        className="h-[580px] w-full border-0 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Variables Bar */}
                <div className="border-t border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-[#0c101a]">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      <Tag className="h-3.5 w-3.5 text-amber-500" />
                      Detected Template Placeholders ({detectedVariables.length})
                    </span>
                    <span className="text-[10px] text-gray-400">Click variable to copy</span>
                  </div>

                  {detectedVariables.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No variables in this template</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {detectedVariables.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => copyVar(v)}
                          className="group flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-50/60 px-2.5 py-1 font-mono text-[11px] text-amber-800 transition-colors hover:border-amber-400 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20"
                        >
                          <span>&#123;&#123;{v}&#125;&#125;</span>
                          {copiedVar === v ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3 opacity-40 group-hover:opacity-100" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* AI Template Studio Modal */}
      <AITemplateStudioModal
        open={showStudioModal}
        onClose={() => {
          setShowStudioModal(false);
          setEditingTemplate(null);
        }}
        initialTemplate={editingTemplate}
        onSaved={(saved) => {
          setSelectedId(saved.id);
        }}
        onUseTemplate={onUseTemplate}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deletingId)}
        title="Delete Custom Template"
        message="Are you sure you want to delete this custom template? This action cannot be undone."
        confirmLabel="Delete Template"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
