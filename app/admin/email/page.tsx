'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Globe,
  Hash,
  Inbox,
  Mail,
  PenLine,
  Settings,
  ExternalLink,
  Megaphone,
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase/client';

import { Tab, ForwardData, ReplyData } from '@/src/components/admin/email/types';
import { TabButton } from '@/src/components/admin/email/TabButton';
import { ComposeTab } from '@/src/components/admin/email/ComposeTab';
import { SentTab } from '@/src/components/admin/email/SentTab';
import { TemplatesTab } from '@/src/components/admin/email/TemplatesTab';
import { DomainsTab } from '@/src/components/admin/email/DomainsTab';
import { SettingsTab } from '@/src/components/admin/email/SettingsTab';
import { CampaignsTab } from '@/src/components/admin/email/CampaignsTab';

export default function AdminEmailPage() {
  const [activeTab, setActiveTab] = useState<Tab>('compose');
  const [adminEmail, setAdminEmail] = useState('');
  const [forwardData, setForwardData] = useState<ForwardData | null>(null);
  const [replyData, setReplyData] = useState<ReplyData | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setAdminEmail(data.user.email);
    });
  }, []);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'compose', label: 'Compose', icon: PenLine },
    { id: 'sent', label: 'Sent', icon: Inbox },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'domains', label: 'Domains', icon: Globe },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleForward = (data: ForwardData) => {
    setForwardData(data);
    setReplyData(null);
    setActiveTab('compose');
  };

  const handleReply = (data: ReplyData) => {
    setReplyData(data);
    setForwardData(null);
    setActiveTab('compose');
  };

  const clearPrefill = () => {
    setForwardData(null);
    setReplyData(null);
  };

  return (
    <div className="min-h-screen font-sans">
      {/* ─── Page Header ─── */}
      <div className="mb-8 font-sans">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-sans font-serif text-3xl text-gray-900 md:text-4xl dark:text-white">
                Email Center
              </h1>
              <p className="mt-1 font-sans text-sm text-gray-500 dark:text-gray-400">
                {process.env.NODE_ENV === 'development' &&
                process.env.NEXT_PUBLIC_SHOW_RESEND !== 'false'
                  ? 'Manage emails via Resend · Compose, send & track'
                  : 'Manage administrative emails, system alerts & communications.'}
              </p>
            </div>
          </div>

          {/* Resend badge */}
          {process.env.NODE_ENV === 'development' &&
            process.env.NEXT_PUBLIC_SHOW_RESEND !== 'false' && (
              <a
                href="https://resend.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-sans text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-[#0e0e14] dark:text-gray-300 dark:hover:border-gray-600"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded bg-black">
                  <Hash className="h-3 w-3 text-white" />
                </div>
                Powered by Resend
                <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
              </a>
            )}
        </div>
      </div>

      {/* ─── Tab Navigation ─── */}
      <div className="mb-6 flex items-center gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1.5 dark:border-gray-700 dark:bg-[#0e0e14]">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            id={tab.id}
            label={tab.label}
            icon={tab.icon}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>

      {/* ─── Tab Content ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === 'compose' && (
            <ComposeTab
              adminEmail={adminEmail}
              forwardData={forwardData}
              replyData={replyData}
              onClearPrefill={clearPrefill}
            />
          )}
          {activeTab === 'sent' && <SentTab onForward={handleForward} onReply={handleReply} />}
          {activeTab === 'campaigns' && <CampaignsTab />}
          {activeTab === 'templates' && <TemplatesTab />}
          {activeTab === 'domains' && <DomainsTab />}
          {activeTab === 'settings' && <SettingsTab adminEmail={adminEmail} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
