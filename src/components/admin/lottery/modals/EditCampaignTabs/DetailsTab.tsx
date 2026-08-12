import { RefreshCw } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

export interface DetailsTabProps {
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  description: string;
  setDescription: Dispatch<SetStateAction<string>>;
  status: 'active' | 'completed' | 'inactive';
  setStatus: Dispatch<SetStateAction<'active' | 'completed' | 'inactive'>>;
  saving: boolean;
  onClose: () => void;
  handleSave: () => void;
}

export function DetailsTab({
  title,
  setTitle,
  description,
  setDescription,
  status,
  setStatus,
  saving,
  onClose,
  handleSave,
}: DetailsTabProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-gray-400">
          Campaign Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-gray-400">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-gray-400">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as 'active' | 'completed' | 'inactive')}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-white/10">
        <button
          onClick={onClose}
          className="cursor-pointer rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="bg-brand-gold text-brand-navy inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all hover:opacity-90 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
