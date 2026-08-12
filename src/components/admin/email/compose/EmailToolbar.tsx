import { motion } from 'motion/react';
import { Loader2, Check, Send, Sparkles, Lightbulb, Paperclip, Trash2 } from 'lucide-react';
import { TemplatePicker } from './TemplatePicker';

interface EmailToolbarProps {
  sending: boolean;
  sent: boolean;
  html: string;
  templateHtml: string | null;
  selectedTemplate: string | null;
  subjectSuggesting: boolean;
  showSubjectSuggestions: boolean;
  subjectSuggestions: string[] | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onSend: () => void;
  onLoadTemplate: (templateId: string) => void;
  onShowImprove: () => void;
  onSuggestSubject: () => void;
  onApplySubject: (suggestion: string) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDiscardAll: () => void;
}

export function EmailToolbar({
  sending,
  sent,
  html,
  templateHtml,
  selectedTemplate,
  subjectSuggesting,
  showSubjectSuggestions,
  subjectSuggestions,
  fileInputRef,
  onSend,
  onLoadTemplate,
  onShowImprove,
  onSuggestSubject,
  onApplySubject,
  onFileSelect,
  onDiscardAll,
}: EmailToolbarProps) {
  return (
    <div className="flex flex-col items-stretch justify-between gap-4 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:gap-0 sm:px-6 dark:border-gray-800">
      <div className="flex items-center justify-center gap-1 sm:justify-start">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSend}
          disabled={sending || sent}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold tracking-wide shadow-sm transition-all duration-300 disabled:opacity-70 ${
            sent
              ? 'bg-emerald-500 text-white shadow-emerald-500/20'
              : 'bg-brand-gold text-brand-navy glow-gold hover:opacity-95'
          }`}
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : sent ? (
            <Check className="h-4 w-4" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {sent ? 'Sent!' : sending ? 'Sending...' : 'Send'}
        </motion.button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
        <TemplatePicker selectedTemplate={selectedTemplate} onSelect={onLoadTemplate} />

        <button
          onClick={onShowImprove}
          disabled={!html && !templateHtml}
          className="text-brand-gold hover:bg-brand-gold/10 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all disabled:opacity-50"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Improve</span>
        </button>

        <div className="relative">
          <button
            onClick={onSuggestSubject}
            disabled={!html && !templateHtml}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-amber-600 transition-all hover:bg-amber-50 disabled:opacity-50 dark:hover:bg-amber-500/10"
          >
            {subjectSuggesting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Lightbulb className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">Subject</span>
          </button>

          {showSubjectSuggestions && subjectSuggestions && (
            <div className="dark:bg-brand-dark-surface absolute right-0 bottom-full z-50 mb-2 w-72 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700">
              <div className="border-b border-gray-100 px-3 py-2 dark:border-gray-800">
                <span className="text-[10px] font-semibold tracking-wide text-gray-500 uppercase">
                  Suggested Subjects
                </span>
              </div>
              <div className="p-2">
                {subjectSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => onApplySubject(s)}
                    className="flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-gray-700 transition-colors hover:bg-amber-50 dark:text-gray-300 dark:hover:bg-amber-500/10"
                  >
                    <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-white/5"
        >
          <Paperclip className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Attach</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={onFileSelect}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.zip,.rar"
        />

        <button
          onClick={onDiscardAll}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-400 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Discard</span>
        </button>
      </div>
    </div>
  );
}
