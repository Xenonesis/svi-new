'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Sparkles,
  Wand2,
  Eye,
  Code2,
  Smartphone,
  Monitor,
  Check,
  Copy,
  Send,
  Save,
  RotateCcw,
  Tag,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAIEmail } from '../hooks/useAIEmail';
import { extractTemplateVars, sanitizeEmailHtml } from '@/src/lib/utils/templateParser';
import type { CustomEmailTemplate } from '../types';
import { getToken } from '../helpers';

interface AITemplateStudioModalProps {
  open: boolean;
  onClose: () => void;
  initialTemplate?: CustomEmailTemplate | null;
  onSaved: (template: CustomEmailTemplate) => void;
  onUseTemplate?: (subject: string, html: string) => void;
}

const CATEGORIES = [
  'Sales & Offers',
  'Site Visits & Inquiries',
  'Legal & Allotment',
  'Transactions & Payment',
  'Customer Support',
  'Festival & Special',
  'HR & Corporate',
  'General',
];

const TONES = [
  { id: 'luxury', label: 'Luxury Executive' },
  { id: 'urgent', label: 'Urgent & Assertive' },
  { id: 'festive', label: 'Warm Festive' },
  { id: 'formal', label: 'Formal Legal' },
  { id: 'marketing', label: 'Marketing Promotional' },
];

const PROMPT_CHIPS = [
  {
    label: 'Diwali Plot Offer',
    prompt:
      'Diwali special festival offer for prime villa plots at Shivani Vatika 11 with 10% instant discount on down payment, limited to next 10 days, with site visit booking and relationship manager contact details.',
    category: 'Festival & Offers',
    tone: 'luxury',
  },
  {
    label: 'VIP Site Visit',
    prompt:
      'VIP invitation for an exclusive site visit to Shivani Vatika township near Khatu Shyam Ji with complimentary chauffeur pick-up, guided walkthrough, and special on-spot booking benefits.',
    category: 'Site Visits & Inquiries',
    tone: 'luxury',
  },
  {
    label: 'Payment Milestone Due',
    prompt:
      'Formal executive payment reminder for upcoming development milestone on plot {{plot_no}} in {{project_name}} with breakdown of amount due {{amount}}, due date {{due_date}}, bank IFSC details, and online receipt generation link.',
    category: 'Transactions & Payment',
    tone: 'urgent',
  },
  {
    label: 'Allotment Letter Dispatch',
    prompt:
      'Congratulations and formal dispatch notice of provisional Allotment Letter for unit {{plot_no}} in {{project_name}} with registration reference {{ref_id}}, BBA signing schedule, and key dates.',
    category: 'Legal & Allotment',
    tone: 'formal',
  },
];

const STARTER_LUXURY_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SVI Infra Solutions</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f1f5f9;padding:40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#07111e 0%,#0d1e36 50%,#0a1628 100%);padding:36px 30px 28px;text-align:center;border-bottom:3px solid #D4AF37;">
              <div style="display:inline-block;background-color:#ffffff;padding:8px 22px;border-radius:24px;box-shadow:0 4px 14px rgba(0,0,0,0.25);margin-bottom:14px;">
                <img src="https://www.sviinfrasolutions.com/logo.png" alt="SVI Infra Solutions" width="145" height="auto" style="display:block;max-height:36px;border:0;" />
              </div>
              <br>
              <div style="display:inline-block;padding:4px 14px;background:rgba(212,175,55,0.15);border:1px solid #D4AF37;border-radius:20px;color:#D4AF37;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">
                Exclusive Update
              </div>
              <p style="color:#e2e8f0;font-size:13px;margin:10px 0 0;font-weight:400;">Premier Living & Investment Opportunities</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 28px;color:#1e293b;line-height:1.65;font-size:14px;">
              <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#0f172a;">Dear {{name}},</p>
              <p style="margin:0 0 16px;color:#334155;">We are pleased to present an exclusive update regarding your property interests with SVI Infra Solutions.</p>
              <div style="background-color:#f8fafc;border-left:4px solid #D4AF37;padding:16px 20px;margin:24px 0;border-radius:0 8px 8px 0;">
                <p style="margin:0;color:#0f172a;font-weight:600;">Plot Reference: {{plot_no}}</p>
                <p style="margin:6px 0 0;color:#64748b;font-size:13px;">Township: {{project_name}}</p>
              </div>
              <div style="text-align:center;margin:32px 0 16px;">
                <a href="https://www.sviinfrasolutions.com" style="background:linear-gradient(135deg,#D4AF37 0%,#f3e5ab 50%,#b08f36 100%);color:#0f172a;padding:12px 34px;border-radius:30px;text-decoration:none;font-weight:800;font-size:12.5px;display:inline-block;letter-spacing:0.5px;box-shadow:0 4px 14px rgba(212,175,55,0.35);text-transform:uppercase;">Explore Details</a>
              </div>
              <p style="margin:28px 0 0;color:#475569;font-size:13px;">Warm regards,<br><strong style="color:#0f172a;">SVI Client Relations Team</strong><br>SVI Infra Solutions Pvt. Ltd.</p>
            </td>
          </tr>
          <!-- Helpdesk Bar -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:14px 28px;font-size:12px;color:#64748b;">
              <strong style="color:#0f172a;">Need assistance?</strong>&nbsp;&nbsp;SVI Helpdesk: <a href="tel:+917300007643" style="color:#0f172a;font-weight:700;text-decoration:none;">+91 73000-07643</a> &bull; <a href="mailto:info@sviinfrasolutions.com" style="color:#D4AF37;text-decoration:none;font-weight:600;">info@sviinfrasolutions.com</a>
            </td>
          </tr>
          <!-- Legal Footer -->
          <tr>
            <td style="background-color:#f1f5f9;padding:24px 20px;text-align:center;">
              <p style="margin:0 0 4px;color:#475569;font-size:12px;font-weight:700;">SVI Infra Solutions Pvt. Ltd.</p>
              <p style="margin:0 0 8px;color:#94a3b8;font-size:11px;line-height:1.6;">Corporate Office: Block E-220, 2nd Floor, Sector 63, Noida, Uttar Pradesh 201309<br>Official Website: <a href="https://www.sviinfrasolutions.com" style="color:#64748b;text-decoration:underline;">www.sviinfrasolutions.com</a></p>
              <p style="margin:0;color:#cbd5e1;font-size:10px;">&copy; 2026 SVI Infra Solutions Pvt. Ltd. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export function AITemplateStudioModal({
  open,
  onClose,
  initialTemplate,
  onSaved,
  onUseTemplate,
}: AITemplateStudioModalProps) {
  const { generateCustomTemplate, loading: isAILoading } = useAIEmail();

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Sales & Offers');
  const [description, setDescription] = useState('');
  const [html, setHtml] = useState(STARTER_LUXURY_HTML);
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('luxury');
  const [refineInstruction, setRefineInstruction] = useState('');

  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  // Initialize or reset when opened
  useEffect(() => {
    if (initialTemplate) {
      setName(initialTemplate.name);
      setSubject(initialTemplate.subject);
      setCategory(initialTemplate.category || 'Sales & Offers');
      setDescription(initialTemplate.description || '');
      setHtml(initialTemplate.html);
      setPrompt('');
    } else {
      setName('New Custom Template');
      setSubject('Exclusive Update from SVI Infra Solutions');
      setCategory('Sales & Offers');
      setDescription('');
      setHtml(STARTER_LUXURY_HTML);
      setPrompt('');
    }
    setRefineInstruction('');
    setViewMode('preview');
  }, [initialTemplate, open]);

  // Detected variables
  const detectedVariables = useMemo(() => {
    return extractTemplateVars(html);
  }, [html]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description or prompt for the AI');
      return;
    }

    const res = await generateCustomTemplate({
      prompt: prompt.trim(),
      name: name !== 'New Custom Template' ? name : undefined,
      category,
      tone,
    });

    if (res) {
      if (res.name) setName(res.name);
      if (res.subject) setSubject(res.subject);
      if (res.category) setCategory(res.category);
      if (res.description) setDescription(res.description);
      if (res.html) setHtml(res.html);
      toast.success('Custom luxury template generated successfully.');
    }
  };

  const handleRefine = async () => {
    if (!refineInstruction.trim()) {
      toast.error('Please describe how you want to refine this template');
      return;
    }

    const res = await generateCustomTemplate({
      currentHtml: html,
      refinementInstruction: refineInstruction.trim(),
      name,
      category,
    });

    if (res) {
      if (res.name) setName(res.name);
      if (res.subject) setSubject(res.subject);
      if (res.html) setHtml(res.html);
      setRefineInstruction('');
      toast.success('Template refined successfully.');
    }
  };

  const handleSave = async (andUse = false) => {
    if (!name.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    if (!subject.trim()) {
      toast.error('Please enter a subject line');
      return;
    }
    if (!html.trim()) {
      toast.error('Template HTML cannot be empty');
      return;
    }

    try {
      setSaving(true);
      const sanitized = sanitizeEmailHtml(html);
      const payload = {
        id: initialTemplate?.id,
        name: name.trim(),
        subject: subject.trim(),
        category: category.trim(),
        description: description.trim(),
        html: sanitized,
        icon: 'Sparkles',
      };

      const res = await fetch('/api/admin/email/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save template');
      }

      const savedTpl: CustomEmailTemplate = data.template;
      onSaved(savedTpl);
      toast.success(initialTemplate ? 'Template updated' : 'Custom template saved to library!');

      if (andUse && onUseTemplate) {
        onUseTemplate(savedTpl.subject, savedTpl.html);
        onClose();
      } else {
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving template';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const copyVar = (v: string) => {
    navigator.clipboard.writeText(`{{${v}}}`);
    setCopiedVar(v);
    toast.success(`Copied {{${v}}}`);
    setTimeout(() => setCopiedVar(null), 1800);
  };

  const openFullscreenPreview = () => {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-amber-500/20 bg-[#0b0f17] text-white shadow-2xl"
      >
        {/* Header Bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-800 bg-[#0d131f] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-400 shadow-inner">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white sm:text-lg">
                  AI Email Template Studio
                </h2>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-300">
                  {initialTemplate ? 'Editing Custom Template' : 'Luxury ERP Suite'}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Design, preview, fine-tune, and save responsive SVI Infra corporate email templates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openFullscreenPreview}
              title="Open pure HTML in new tab"
              className="flex items-center gap-1.5 rounded-lg border border-gray-700/80 bg-gray-800/60 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:border-gray-600 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Tab</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Split Left (Controls & Prompt) / Right (Live Preview & Code) */}
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-12">
          {/* Left Column: Generation & Metadata Controls */}
          <div className="scrollbar-gold flex flex-col gap-4 overflow-y-auto border-r border-gray-800/80 bg-[#090d15] p-5 lg:col-span-5">
            {/* AI Generator Panel */}
            <div className="rounded-xl border border-amber-500/25 bg-gradient-to-b from-amber-500/[0.08] to-transparent p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider text-amber-400 uppercase">
                  <Wand2 className="h-3.5 w-3.5" />
                  Generate with AI
                </span>
                <span className="font-mono text-[10px] text-gray-500">Groq SVI-LLM</span>
              </div>

              {/* Prompt textarea */}
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your ideal email template (e.g. Diwali discount on plots at Shivani Vatika 11, site visit booking, payment schedule...)"
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-700/80 bg-[#0d131f] p-3 text-xs text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none"
              />

              {/* Quick inspiration chips */}
              <div className="mt-2.5">
                <p className="mb-1.5 font-mono text-[10px] font-semibold text-gray-400 uppercase">
                  Quick Ideas:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {PROMPT_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPrompt(chip.prompt);
                        setCategory(chip.category);
                        setTone(chip.tone);
                      }}
                      className="rounded-md border border-gray-800 bg-gray-900/80 px-2 py-1 text-[11px] text-gray-300 transition-colors hover:border-amber-400/40 hover:text-amber-300"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone & Category selectors */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block font-mono text-[10px] font-semibold text-gray-400 uppercase">
                    Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full rounded-md border border-gray-700 bg-[#0d131f] px-2.5 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    {TONES.map((t) => (
                      <option key={t.id} value={t.id} className="bg-gray-900 text-white">
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-mono text-[10px] font-semibold text-gray-400 uppercase">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-md border border-gray-700 bg-[#0d131f] px-2.5 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-gray-900 text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Generate button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleGenerate}
                disabled={isAILoading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 py-2.5 text-xs font-bold text-gray-950 shadow-lg shadow-amber-500/20 transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAILoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-gray-950" />
                    <span>Designing Template with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-gray-950" />
                    <span>Generate Template</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Template Metadata Editor */}
            <div className="space-y-3 rounded-xl border border-gray-800 bg-[#0d131f] p-4">
              <div>
                <label className="mb-1 block font-mono text-[10px] font-semibold text-gray-400 uppercase">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Diwali Villa Plot Offer 2026"
                  className="w-full rounded-lg border border-gray-700 bg-[#090d15] px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-mono text-[10px] font-semibold text-gray-400 uppercase">
                  Subject Line *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Happy Diwali {{name}}! 10% Off on Shivani Vatika Plots"
                  className="w-full rounded-lg border border-gray-700 bg-[#090d15] px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-mono text-[10px] font-semibold text-gray-400 uppercase">
                  Description / Internal Notes
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short note on when to use this template"
                  className="w-full rounded-lg border border-gray-700 bg-[#090d15] px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* AI Refine Bar */}
            <div className="rounded-xl border border-gray-800 bg-[#0d131f] p-4">
              <span className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-bold text-gray-300 uppercase">
                <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                Refine Existing HTML with AI
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={refineInstruction}
                  onChange={(e) => setRefineInstruction(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRefine();
                  }}
                  placeholder="e.g. 'Add a table for bank IFSC details', 'Make it shorter'"
                  className="flex-1 rounded-lg border border-gray-700 bg-[#090d15] px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleRefine}
                  disabled={isAILoading || !refineInstruction.trim()}
                  className="flex items-center gap-1 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/20 disabled:opacity-40"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  Refine
                </button>
              </div>
            </div>

            {/* Detected Variables Tag Cloud */}
            <div className="rounded-xl border border-gray-800 bg-[#0d131f] p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-gray-300 uppercase">
                  <Tag className="h-3.5 w-3.5 text-amber-400" />
                  Dynamic Placeholders ({detectedVariables.length})
                </span>
                <span className="text-[10px] text-gray-500">Click to copy</span>
              </div>
              {detectedVariables.length === 0 ? (
                <p className="text-[11px] text-gray-500 italic">
                  No placeholders detected. You can add variables like &#123;&#123;name&#125;&#125;
                  in the subject or HTML.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {detectedVariables.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => copyVar(v)}
                      className="group flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/5 px-2 py-1 font-mono text-[11px] text-amber-300 transition-colors hover:border-amber-400/50 hover:bg-amber-500/15"
                    >
                      <span>&#123;&#123;{v}&#125;&#125;</span>
                      {copiedVar === v ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3 opacity-40 group-hover:opacity-100" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Responsive Preview & HTML Source Editor */}
          <div className="flex flex-col overflow-hidden bg-[#070b12] lg:col-span-7">
            {/* View Mode & Device Switcher Toolbar */}
            <div className="flex shrink-0 items-center justify-between border-b border-gray-800 bg-[#0d131f] px-5 py-2.5">
              {/* Tab Switcher: Preview vs Code */}
              <div className="flex items-center gap-1 rounded-lg border border-gray-800 bg-[#090d15] p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                    viewMode === 'preview'
                      ? 'bg-amber-400 text-gray-950 shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Visual Preview
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('code')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                    viewMode === 'code'
                      ? 'bg-amber-400 text-gray-950 shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Code2 className="h-3.5 w-3.5" />
                  HTML Source
                </button>
              </div>

              {/* Device Preview Switcher (Only in Preview mode) */}
              {viewMode === 'preview' && (
                <div className="flex items-center gap-1 rounded-lg border border-gray-800 bg-[#090d15] p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                      previewDevice === 'desktop'
                        ? 'bg-gray-800 text-amber-300'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                      previewDevice === 'mobile'
                        ? 'bg-gray-800 text-amber-300'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Mobile (375px)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Subject Preview Bar */}
            <div className="border-b border-gray-800/80 bg-[#0a0f1a] px-5 py-2 font-mono text-xs text-gray-300">
              <span className="text-gray-500">Subject: </span>
              <span className="font-semibold text-white">{subject || '(Untitled Subject)'}</span>
            </div>

            {/* Main Stage */}
            <div className="scrollbar-gold flex-1 overflow-auto bg-[#05070d] p-4">
              {viewMode === 'preview' ? (
                <div className="flex min-h-full items-start justify-center">
                  <div
                    className={`overflow-hidden rounded-xl border border-gray-800 bg-white shadow-2xl transition-all duration-300 ${
                      previewDevice === 'mobile' ? 'w-[375px]' : 'w-full max-w-[620px]'
                    }`}
                  >
                    {/* Device bezel label */}
                    <div className="flex items-center justify-between border-b border-gray-200 bg-gray-100 px-3 py-1.5 font-mono text-[10px] text-gray-500">
                      <span>
                        {previewDevice === 'mobile'
                          ? 'Mobile Frame (375px)'
                          : 'Desktop Frame (600px)'}
                      </span>
                      <span className="rounded bg-emerald-100 px-1 font-semibold text-emerald-800">
                        Live Render
                      </span>
                    </div>
                    {/* Rendered HTML */}
                    <iframe
                      srcDoc={html}
                      title="Email Preview"
                      sandbox="allow-same-origin"
                      className="h-[650px] w-full border-0 bg-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full">
                  <textarea
                    value={html}
                    onChange={(e) => setHtml(e.target.value)}
                    spellCheck={false}
                    className="scrollbar-gold h-full min-h-[500px] w-full resize-none rounded-xl border border-gray-800 bg-[#0c101a] p-4 font-mono text-xs leading-relaxed text-amber-100/90 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-gray-800 bg-[#0d131f] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-700/80 px-4 py-2 text-xs font-semibold text-gray-300 transition-colors hover:border-gray-600 hover:text-white"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2.5">
            {onUseTemplate && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSave(true)}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg border border-amber-400/60 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-300 transition-colors hover:bg-amber-500/20 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Save & Use in Compose</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-2 text-xs font-bold text-gray-950 shadow-lg shadow-amber-500/20 transition-opacity hover:opacity-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Template</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
