'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { apiGet, apiPost } from '@/src/lib/api/fetcher';
import {
  WhatsAppInboxResponse,
  WhatsAppDetailResponse,
  WhatsAppConversationList,
  WhatsAppChatPanel,
  WhatsAppLeadDrawer,
} from '@/src/components/admin/whatsapp';

export default function WhatsAppInboxPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');

  const inbox = useQuery({
    queryKey: ['whatsapp-inbox'],
    queryFn: () => apiGet<WhatsAppInboxResponse>('/api/admin/whatsapp'),
    refetchInterval: 15_000,
  });

  const activeId = selectedId ?? inbox.data?.conversations[0]?.id ?? null;

  const detail = useQuery({
    queryKey: ['whatsapp-conversation', activeId],
    queryFn: () =>
      apiGet<WhatsAppDetailResponse>('/api/admin/whatsapp', {
        params: { conversation_id: activeId },
      }),
    enabled: Boolean(activeId),
    refetchInterval: 10_000,
  });

  const action = useMutation({
    mutationFn: (body: Record<string, unknown>) => apiPost('/api/admin/whatsapp', body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['whatsapp-inbox'] }),
        queryClient.invalidateQueries({ queryKey: ['whatsapp-conversation', activeId] }),
      ]);
    },
  });

  const runAction = (name: string, extra: Record<string, unknown> = {}) => {
    if (activeId) action.mutate({ action: name, conversationId: activeId, ...extra });
  };

  const sendReply = (event: FormEvent) => {
    event.preventDefault();
    const text = reply.trim();
    if (!text || !activeId) return;
    action.mutate(
      { action: 'send_text', conversationId: activeId, text },
      { onSuccess: () => setReply('') }
    );
  };

  const scheduleFollowUp = (event: FormEvent) => {
    event.preventDefault();
    if (!templateId || !scheduledFor) return;
    runAction('schedule_follow_up', {
      templateId,
      scheduledFor: new Date(scheduledFor).toISOString(),
    });
  };

  const selected = detail.data?.conversation;

  return (
    <main id="whatsapp-inbox" className="mx-auto flex h-full max-w-[1500px] flex-col" tabIndex={-1}>
      {/* Header */}
      <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-brand-gold text-sm font-semibold">Sales operations</p>
          <h1 className="text-brand-navy font-serif text-3xl font-bold dark:text-white">
            WhatsApp inbox
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {inbox.data?.pagination.total ?? 0} conversations · outbound automation off by default
          </p>
        </div>
        <button
          type="button"
          onClick={() => void inbox.refetch()}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold dark:border-white/15 dark:bg-white/5"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Refresh
        </button>
      </header>

      {/* Main 3-Column Grid */}
      <div className="dark:bg-brand-dark-surface grid min-h-0 flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl lg:grid-cols-[20rem_minmax(0,1fr)_19rem] dark:border-white/10">
        {/* Left: Conversation List */}
        <WhatsAppConversationList
          conversations={inbox.data?.conversations}
          activeId={activeId}
          isLoading={inbox.isLoading}
          isError={inbox.isError}
          onSelect={(id) => setSelectedId(id)}
        />

        {/* Center: Active Chat & Composer */}
        <WhatsAppChatPanel
          activeId={activeId}
          selected={selected}
          messages={detail.data?.messages}
          isLoading={detail.isLoading}
          isError={detail.isError}
          reply={reply}
          isActionPending={action.isPending}
          actionError={action.isError && action.error instanceof Error ? action.error : null}
          onReplyChange={setReply}
          onSendReply={sendReply}
          onRunAction={runAction}
        />

        {/* Right: Lead Drawer & Automation Controls */}
        <WhatsAppLeadDrawer
          selected={selected}
          followUps={detail.data?.followUps}
          siteVisits={detail.data?.siteVisits}
          templates={detail.data?.templates}
          templateId={templateId}
          scheduledFor={scheduledFor}
          isActionPending={action.isPending}
          onTemplateIdChange={setTemplateId}
          onScheduledForChange={setScheduledFor}
          onScheduleFollowUp={scheduleFollowUp}
          onRunAction={runAction}
        />
      </div>

      <p className="sr-only" aria-live="polite">
        {action.isSuccess ? 'WhatsApp conversation updated.' : ''}
      </p>
    </main>
  );
}
