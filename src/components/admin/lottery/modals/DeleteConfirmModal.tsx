'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from '@/src/lib/supabase/client';
import { deleteLinkedCampaigns } from '@/src/lib/lottery/campaignHelpers';

interface DeleteConfirmModalProps {
  open: boolean;
  lotteryId: string | null;
  onClose: () => void;
  token: string;
  onSuccess: (msg: string | null) => void;
  onError: (msg: string | null) => void;
  onDeleted: () => void;
}

export function DeleteConfirmModal({
  open,
  lotteryId,
  onClose,
  token,
  onSuccess,
  onError,
  onDeleted,
}: DeleteConfirmModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (open) {
      setConfirmText('');
      setInputValue('');
    }
  }, [open]);

  const handleDelete = async () => {
    if (!lotteryId || confirmText !== 'DELETE') return;
    setLoading(true);
    try {
      await supabase.from('lottery_participants').delete().eq('lottery_id', lotteryId);
      await supabase.from('scheduled_draws').delete().eq('lottery_id', lotteryId);
      const linkedDeleted = await deleteLinkedCampaigns(token, lotteryId);
      const { error } = await supabase.from('lotteries').delete().eq('id', lotteryId);
      if (error) throw error;
      const linkedMsg =
        typeof linkedDeleted === 'number' && linkedDeleted > 0
          ? ` ${linkedDeleted} linked email campaign(s) also removed.`
          : '';
      onSuccess(`Lottery deleted permanently.${linkedMsg}`);
      setConfirmText('');
      onClose();
      onDeleted();
    } catch (err: any) {
      onError(err.message || 'Failed to delete campaign.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && lotteryId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="dark:bg-brand-dark-bg flex w-full max-w-md flex-col rounded-lg border border-red-200 bg-white shadow-sm dark:border-red-500/30"
          >
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
                <Trash2 className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                  Delete Campaign
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
                  This action <strong className="text-red-500">cannot</strong> be undone. The
                  campaign, all participants, and any scheduled draws will be permanently removed.
                </p>
              </div>

              <div className="w-full">
                <label className="mb-2 block text-center text-xs font-bold tracking-wider text-slate-400 uppercase dark:text-gray-500">
                  <AlertTriangle className="mr-1 inline h-3.5 w-3.5 text-red-400" />
                  Type <span className="text-red-500">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setConfirmText(e.target.value);
                  }}
                  placeholder="DELETE"
                  className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-700 focus:border-red-400 focus:outline-none dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:placeholder-red-400/50"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="cursor-pointer rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading || confirmText !== 'DELETE'}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-xs font-bold text-white transition-all hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  {loading ? 'Deleting…' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
