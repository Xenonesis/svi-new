'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/src/lib/supabase/client';
import type {
  Tab,
  ForwardData,
  ReplyData,
  TemplatePrefill,
  DraftData,
} from '@/src/components/admin/email/types';
import { EmailHeader } from '@/src/components/admin/email/EmailHeader';
import { EmailTabNav, EMAIL_TABS } from '@/src/components/admin/email/EmailTabNav';
import { EmailTabContent } from '@/src/components/admin/email/EmailTabContent';
import { useEmailRealtime } from '@/src/components/admin/email/useEmailRealtime';

export default function AdminEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = (() => {
    const param = searchParams.get('tab');
    if (param && EMAIL_TABS.some((t) => t.id === param)) return param as Tab;
    return 'compose';
  })();

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [adminEmail, setAdminEmail] = useState('');
  const [forwardData, setForwardData] = useState<ForwardData | null>(null);
  const [replyData, setReplyData] = useState<ReplyData | null>(null);
  const [templatePrefill, setTemplatePrefill] = useState<TemplatePrefill | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<DraftData | null>(null);

  const { unreadCount } = useEmailRealtime();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setAdminEmail(data.user.email);
    });
  }, []);

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

  return (
    <div className="min-h-screen">
      <EmailHeader />
      <EmailTabNav activeTab={activeTab} onTabChange={switchTab} unreadCount={unreadCount} />
      <EmailTabContent
        activeTab={activeTab}
        adminEmail={adminEmail}
        forwardData={forwardData}
        replyData={replyData}
        templatePrefill={templatePrefill}
        selectedDraft={selectedDraft}
        onClearPrefill={clearPrefill}
        onOpenDraft={handleOpenDraft}
        onForward={handleForward}
        onReply={handleReply}
        onUseTemplate={handleUseTemplate}
      />
    </div>
  );
}
