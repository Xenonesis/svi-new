'use client';

import React from 'react';
import Link from 'next/link';
import { BarChart3, PhoneCall, Globe, Users, Clock, RotateCcw, Flame } from 'lucide-react';

export type LeadsTab = 'dashboard' | 'ivr' | 'queue' | 'redial' | 'chatbot' | 'all' | 'unassigned';
export type LeadsTabType = LeadsTab;

export interface LeadsTabNavProps {
  activeTab: LeadsTabType;
  onTabChange: (tab: LeadsTabType) => void;
  ivrTotalCount: number;
  websiteCount?: number;
}

export function LeadsTabNav({
  activeTab,
  onTabChange,
  ivrTotalCount,
  websiteCount,
}: LeadsTabNavProps): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-2 dark:border-white/5">
      <button
        type="button"
        onClick={() => onTabChange('dashboard')}
        className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
          activeTab === 'dashboard'
            ? 'bg-brand-navy dark:text-brand-navy text-white shadow-md dark:bg-white'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
        }`}
      >
        <BarChart3 className="text-brand-gold h-3.5 w-3.5" />
        <span>Telecalling Dashboard</span>
        <span className="py-0.2 rounded-full bg-emerald-500/10 px-1.5 text-[9px] font-extrabold text-emerald-600 uppercase dark:text-emerald-400">
          Live
        </span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('ivr')}
        className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
          activeTab === 'ivr'
            ? 'bg-brand-navy dark:text-brand-navy text-white shadow-md dark:bg-white'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
        }`}
      >
        <PhoneCall className="h-3.5 w-3.5" />
        <span>IVR Campaign Leads</span>
        <span className="bg-brand-gold/20 py-0.2 text-brand-gold rounded-full px-1.5 text-[10px] font-bold">
          {ivrTotalCount}
        </span>
      </button>
      <button
        type="button"
        onClick={() => onTabChange('redial')}
        className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
          activeTab === 'queue' || activeTab === 'redial'
            ? 'bg-brand-navy dark:text-brand-navy text-white shadow-md dark:bg-white'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
        }`}
      >
        <RotateCcw className="h-3.5 w-3.5 text-rose-500" />
        <span>Smart Redial Queue</span>
        <span className="rounded-full bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-extrabold text-rose-600 dark:text-rose-400">
          Action
        </span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('chatbot')}
        className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
          activeTab === 'chatbot'
            ? 'bg-brand-navy dark:text-brand-navy text-white shadow-md dark:bg-white'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
        }`}
      >
        <Globe className="h-3.5 w-3.5" />
        <span>Website Inquiries</span>
        {websiteCount !== undefined && websiteCount > 0 && (
          <span className="bg-brand-gold/20 py-0.2 text-brand-gold rounded-full px-1.5 text-[10px] font-bold">
            {websiteCount}
          </span>
        )}
      </button>
      <button
        type="button"
        onClick={() => onTabChange('all')}
        className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
          activeTab === 'all'
            ? 'bg-brand-navy dark:text-brand-navy text-white shadow-md dark:bg-white'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
        }`}
      >
        <Users className="h-3.5 w-3.5" />
        <span>All Consolidated Pipeline</span>
      </button>

      <div className="ml-auto flex items-center">
        <Link
          href="/admin/settings?tab=notifications"
          className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 transition-all hover:bg-amber-500/20 active:scale-95 dark:text-amber-400"
          title="Manage who receives instant email & in-app alerts on Hot Leads"
        >
          <Flame className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
          <span>Hot Lead Alerts</span>
        </Link>
      </div>
    </div>
  );
}
