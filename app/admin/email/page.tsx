'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  PenLine,
  Inbox,
  Send,
  Megaphone,
  FileText,
  Globe,
  Settings,
  Trash2,
  Clock,
  FileEdit,
} from 'lucide-react';
import { Toaster } from 'sonner';
import { supabase } from '@/src/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  Tab,
  ForwardData,
  ReplyData,
  TemplatePrefill,
  DraftData,
} from '@/src/components/admin/email/types';
import { ComposeTab } from '@/src/components/admin/email/ComposeTab';
import { SentTab } from '@/src/components/admin/email/SentTab';
import { RepliesTab } from '@/src/components/admin/email/RepliesTab';
import { TemplatesTab } from '@/src/components/admin/email/TemplatesTab';
import { DomainsTab } from '@/src/components/admin/email/DomainsTab';
import { SettingsTab } from '@/src/components/admin/email/SettingsTab';
import { CampaignsTab } from '@/src/components/admin/email/CampaignsTab';
import { DeletedTab } from '@/src/components/admin/email/DeletedTab';
import { ScheduledTab } from '@/src/components/admin/email/ScheduledTab';
import { DraftsTab } from '@/src/components/admin/email/DraftsTab';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'compose', label: 'Compose', icon: PenLine },
  { id: 'drafts', label: 'Drafts', icon: FileEdit },
  { id: 'replies', label: 'Inbox', icon: Inbox },
  { id: 'sent', label: 'Sent', icon: Send },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'domains', label: 'Domains', icon: Globe },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'scheduled', label: 'Scheduled', icon: Clock },
  { id: 'trash', label: 'Trash', icon: Trash2 },
];

export default function AdminEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tablistRef = useRef<HTMLDivElement>(null);

  const initialTab = (() => {
    const param = searchParams.get('tab');
    if (param && tabs.some((t) => t.id === param)) return param as Tab;
    return 'compose';
  })();

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [adminEmail, setAdminEmail] = useState('');
  const [forwardData, setForwardData] = useState<ForwardData | null>(null);
  const [replyData, setReplyData] = useState<ReplyData | null>(null);
  const [templatePrefill, setTemplatePrefill] = useState<TemplatePrefill | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<DraftData | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setAdminEmail(data.user.email);
    });
  }, []);

  // Sync tab to URL
  const switchTab = useCallback(
    (tab: Tab) => {
      setActiveTab(tab);
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', tab);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleForward = (data: ForwardData) => {
    setForwardData(data);
    setReplyData(null);
    switchTab('compose');
  };

  const handleReply = (data: ReplyData) => {
    setReplyData(data);
    setForwardData(null);
    switchTab('compose');
  };

  const clearPrefill = () => {
    setForwardData(null);
    setReplyData(null);
    setTemplatePrefill(null);
    setSelectedDraft(null);
  };

  const handleOpenDraft = (draft: DraftData) => {
    setSelectedDraft(draft);
    setForwardData(null);
    setReplyData(null);
    setTemplatePrefill(null);
    switchTab('compose');
  };

  const handleUseTemplate = useCallback(
    (subject: string, html: string) => {
      setForwardData(null);
      setReplyData(null);
      setTemplatePrefill({ subject, html });
      switchTab('compose');
    },
    [switchTab]
  );

  // Keyboard navigation for tabs
  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = tabs.findIndex((t) => t.id === activeTab);
      let nextIndex: number | null = null;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIndex = tabs.length - 1;
      }

      if (nextIndex !== null) {
        switchTab(tabs[nextIndex].id);
        const buttons = tablistRef.current?.querySelectorAll('[role="tab"]');
        (buttons?.[nextIndex] as HTMLElement)?.focus();
      }
    },
    [activeTab, switchTab]
  );

  return (
    <div className="min-h-screen">
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'font-sans text-sm',
          style: {
            background: 'var(--toast-bg, #fff)',
            border: '1px solid var(--toast-border, #e5e7eb)',
          },
        }}
      />
      {/* ─── Page Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <div className="flex items-end justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Gold accent line */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="from-brand-gold to-brand-gold/30 h-10 w-[3px] rounded-full bg-gradient-to-b" />
            </div>
            <div>
              <h1 className="font-serif text-[2rem] leading-tight tracking-tight text-gray-900 md:text-[2.5rem] dark:text-white">
                <span>Email</span>
                <span className="text-gradient-gold ml-2">Center</span>
              </h1>
              <p className="mt-1 font-mono text-[11px] tracking-wider text-gray-400 uppercase dark:text-gray-500">
                {process.env.NODE_ENV === 'development' &&
                process.env.NEXT_PUBLIC_SHOW_RESEND !== 'false'
                  ? 'resend · compose · send · track'
                  : 'compose · manage · track · deliver'}
              </p>
            </div>
          </div>

          {/* Resend badge — dev only */}
          {process.env.NODE_ENV === 'development' &&
            process.env.NEXT_PUBLIC_SHOW_RESEND !== 'false' && (
              <a
                href="https://resend.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group hover:border-brand-gold/30 hover:bg-brand-gold/5 dark:hover:border-brand-gold/20 flex items-center gap-2.5 rounded-lg border border-gray-200/60 bg-white/50 px-3.5 py-2 backdrop-blur-sm transition-all dark:border-gray-700/60 dark:bg-white/[0.02]"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded bg-gray-900 dark:bg-white">
                  <Mail className="h-2.5 w-2.5 text-white dark:text-gray-900" />
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Powered by
                </span>
                <span className="text-xs font-bold text-gray-900 dark:text-white">Resend</span>
              </a>
            )}
        </div>
      </motion.div>

      {/* ─── Tab Navigation ─── */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-800">
        <nav
          ref={tablistRef}
          className="flex gap-0.5 overflow-x-auto"
          role="tablist"
          aria-label="Email center navigation"
          onKeyDown={handleTabKeyDown}
        >
          {tabs.map((tab, i) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => switchTab(tab.id)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-brand-gold'
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-500 dark:hover:text-gray-300'
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-all ${isActive ? 'text-brand-gold' : 'text-gray-400 dark:text-gray-600'}`}
                />
                <span className="hidden sm:inline">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="emailTabIndicator"
                    className="bg-brand-gold absolute right-0 bottom-0 left-0 h-[2px] rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* ─── Tab Content ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeTab === 'compose' && (
            <ComposeTab
              adminEmail={adminEmail}
              forwardData={forwardData}
              replyData={replyData}
              templatePrefill={templatePrefill}
              draftData={selectedDraft}
              onClearPrefill={clearPrefill}
            />
          )}
          {activeTab === 'drafts' && (
            <DraftsTab onOpenDraft={handleOpenDraft} onImproveDraft={handleOpenDraft} />
          )}
          {activeTab === 'sent' && <SentTab onForward={handleForward} onReply={handleReply} />}
          {activeTab === 'replies' && (
            <RepliesTab adminEmail={adminEmail} onForward={handleForward} onReply={handleReply} />
          )}
          {activeTab === 'campaigns' && <CampaignsTab />}
          {activeTab === 'scheduled' && <ScheduledTab />}
          {activeTab === 'trash' && <DeletedTab />}
          {activeTab === 'templates' && <TemplatesTab onUseTemplate={handleUseTemplate} />}
          {activeTab === 'domains' && <DomainsTab />}
          {activeTab === 'settings' && <SettingsTab adminEmail={adminEmail} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
