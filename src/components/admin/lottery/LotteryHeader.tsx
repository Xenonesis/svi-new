'use client';

import { Plus, RefreshCw } from 'lucide-react';

interface LotteryHeaderProps {
  activeTab: 'dashboard' | 'create';
  onTabChange: (tab: 'dashboard' | 'create') => void;
  onNewLottery: () => void;
  onSyncExisting: () => void;
  syncing: boolean;
  canSync: boolean;
}

export function LotteryHeader({
  activeTab,
  onTabChange,
  onNewLottery,
  onSyncExisting,
  syncing,
  canSync,
}: LotteryHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end dark:border-white/5">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Command Center: <span className="text-brand-gold italic">Lottery</span>
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
          Launch massive lucky draws, manage high-stakes prizes, and broadcast live winner reveals.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`cursor-pointer rounded-xl border px-5 py-2.5 text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
            activeTab === 'dashboard'
              ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/30 shadow-[0_0_15px_rgba(212, 175, 55,0.1)]'
              : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:border-white/5 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={onNewLottery}
          className={`flex cursor-pointer items-center gap-2 rounded-xl border px-5 py-2.5 text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
            activeTab === 'create'
              ? 'bg-brand-gold text-brand-navy border-brand-gold shadow-[0_0_20px_rgba(212, 175, 55,0.3)]'
              : 'bg-brand-gold/10 text-brand-gold border-brand-gold/20 hover:bg-brand-gold/20'
          }`}
        >
          <Plus className="h-4 w-4" /> New Lottery
        </button>
        <button
          onClick={onSyncExisting}
          disabled={syncing || !canSync}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-blue-300 bg-blue-50 px-5 py-2.5 text-xs font-bold tracking-wider text-blue-700 uppercase transition-all duration-300 hover:bg-blue-100 disabled:opacity-50 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
        >
          {syncing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" /> Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" /> Sync to EmailCenter
            </>
          )}
        </button>
      </div>
    </div>
  );
}
