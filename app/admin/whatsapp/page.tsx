'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Bot,
  CalendarClock,
  CheckCheck,
  CirclePause,
  MessageSquareText,
  RefreshCw,
  Send,
  UserRoundCheck,
} from 'lucide-react';
import { apiGet, apiPost } from '@/src/lib/api/fetcher';

type Mode = 'ai' | 'human' | 'paused';
interface Contact {
  id: string;
  phone_e164: string;
  display_name: string | null;
  provider_profile_name: string | null;
  consent_status: 'unknown' | 'opted_in' | 'opted_out';
}
interface Conversation {
  id: string;
  mode: Mode;
  summary: string | null;
  qualification: Record<string, unknown>;
  service_window_expires_at: string | null;
  last_message_at: string | null;
  contact: Contact;
  latestMessage?: {
    body: string | null;
    message_type: string;
    status: string;
    created_at: string;
  } | null;
}
interface Message {
  id: string;
  direction: 'inbound' | 'outbound';
  sender_type: 'customer' | 'ai' | 'admin' | 'system';
  message_type: string;
  body: string | null;
  template_name: string | null;
  status: string;
  provider_error_message: string | null;
  created_at: string;
}
interface FollowUp {
  id: string;
  sequence_number: number;
  status: string;
  scheduled_for: string;
  reason: string | null;
  template: { name: string; language: string; body_preview: string | null } | null;
}
interface Template {
  id: string;
  name: string;
  language: string;
  body_preview: string | null;
  parameter_count: number;
}
interface InboxResponse {
  conversations: Conversation[];
  pagination: { total: number };
}
interface DetailResponse {
  conversation: Conversation;
  messages: Message[];
  followUps: FollowUp[];
  siteVisits: Array<{
    id: string;
    status: string;
    requested_date: string | null;
    project: { name: string } | null;
  }>;
  templates: Template[];
}

const modeCopy: Record<Mode, string> = { ai: 'AI active', human: 'Human', paused: 'Paused' };
function displayName(contact: Contact): string {
  return contact.display_name || contact.provider_profile_name || contact.phone_e164;
}
function timeLabel(value: string | null): string {
  if (!value) return 'No messages';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function WhatsAppInboxPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const inbox = useQuery({
    queryKey: ['whatsapp-inbox'],
    queryFn: () => apiGet<InboxResponse>('/api/admin/whatsapp'),
    refetchInterval: 15_000,
  });
  const activeId = selectedId ?? inbox.data?.conversations[0]?.id ?? null;
  const detail = useQuery({
    queryKey: ['whatsapp-conversation', activeId],
    queryFn: () =>
      apiGet<DetailResponse>('/api/admin/whatsapp', { params: { conversation_id: activeId } }),
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
  const optedOut = selected?.contact.consent_status === 'opted_out';
  const windowOpen = Boolean(
    selected?.service_window_expires_at && new Date(selected.service_window_expires_at) > new Date()
  );
  return (
    <main id="whatsapp-inbox" className="mx-auto flex h-full max-w-[1500px] flex-col" tabIndex={-1}>
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
      <div className="dark:bg-brand-dark-surface grid min-h-0 flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl lg:grid-cols-[20rem_minmax(0,1fr)_19rem] dark:border-white/10">
        <aside
          className="min-h-0 border-b border-gray-200 lg:border-r lg:border-b-0 dark:border-white/10"
          aria-label="WhatsApp conversations"
        >
          <div className="border-b border-gray-200 px-4 py-3 dark:border-white/10">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Conversations</h2>
          </div>
          <div className="max-h-56 overflow-y-auto lg:h-[calc(100%-3rem)] lg:max-h-none">
            {inbox.isLoading ? (
              <div className="space-y-3 p-4" aria-label="Loading conversations">
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5"
                  />
                ))}
              </div>
            ) : inbox.isError ? (
              <p role="alert" className="p-5 text-sm text-red-700 dark:text-red-300">
                Could not load the inbox.
              </p>
            ) : inbox.data?.conversations.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                <MessageSquareText className="mx-auto mb-3 h-8 w-8" aria-hidden="true" />
                No WhatsApp conversations yet.
              </div>
            ) : (
              <ul role="list" className="divide-y divide-gray-100 dark:divide-white/5">
                {inbox.data?.conversations.map((conversation) => {
                  const active = conversation.id === activeId;
                  return (
                    <li key={conversation.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(conversation.id)}
                        aria-current={active ? 'true' : undefined}
                        className={`focus-visible:outline-inset focus-visible:outline-brand-gold w-full px-4 py-3 text-left transition-colors focus-visible:outline-2 ${active ? 'bg-brand-gold/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <strong className="truncate text-sm text-gray-900 dark:text-white">
                            {displayName(conversation.contact)}
                          </strong>
                          <span className="shrink-0 text-[0.68rem] text-gray-400">
                            {timeLabel(conversation.last_message_at)}
                          </span>
                        </span>
                        <span className="mt-1 block truncate text-xs text-gray-500 dark:text-gray-400">
                          {conversation.latestMessage?.body ||
                            `[${conversation.latestMessage?.message_type ?? 'No message'}]`}
                        </span>
                        <span className="mt-2 inline-flex items-center gap-1 text-[0.7rem] font-semibold text-gray-500">
                          <span className="bg-brand-gold h-1.5 w-1.5 rounded-full" />
                          {modeCopy[conversation.mode]}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>
        <section
          className="flex min-h-[28rem] min-w-0 flex-col"
          aria-labelledby="conversation-heading"
        >
          {!activeId ? (
            <div className="m-auto max-w-sm px-6 text-center text-gray-500">
              <MessageSquareText className="mx-auto mb-4 h-10 w-10" aria-hidden="true" />
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                Select a conversation
              </h2>
              <p className="mt-1 text-sm">Message history and controls will appear here.</p>
            </div>
          ) : detail.isLoading ? (
            <div
              className="m-5 flex-1 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5"
              aria-label="Loading conversation"
            />
          ) : detail.isError || !selected ? (
            <p role="alert" className="m-auto text-sm text-red-700 dark:text-red-300">
              Could not load this conversation.
            </p>
          ) : (
            <>
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-3 dark:border-white/10">
                <div>
                  <h2
                    id="conversation-heading"
                    className="font-semibold text-gray-950 dark:text-white"
                  >
                    {displayName(selected.contact)}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {selected.contact.phone_e164} ·{' '}
                    {windowOpen ? 'Service window open' : 'Template required'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selected.mode !== 'human' ? (
                    <button
                      type="button"
                      onClick={() => runAction('take_over')}
                      className="bg-brand-navy rounded-lg px-3 py-2 text-xs font-semibold text-white"
                    >
                      <UserRoundCheck className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
                      Take over
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={optedOut}
                      onClick={() => runAction('return_to_ai')}
                      className="bg-brand-gold text-brand-navy rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-40"
                    >
                      <Bot className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
                      Return to AI
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => runAction('pause')}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold dark:border-white/15"
                  >
                    <CirclePause className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
                    Pause
                  </button>
                </div>
              </header>
              <ol
                className="flex-1 space-y-3 overflow-y-auto bg-gray-50/70 p-5 dark:bg-black/10"
                aria-label="Message history"
              >
                {detail.data?.messages.map((message) => (
                  <li
                    key={message.id}
                    className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                  >
                    <article
                      className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm ${message.direction === 'outbound' ? 'bg-brand-navy dark:bg-brand-gold dark:text-brand-navy rounded-br-md text-white' : 'rounded-bl-md border border-gray-200 bg-white text-gray-800 dark:border-white/10 dark:bg-white/5 dark:text-gray-100'}`}
                    >
                      <p className="break-words whitespace-pre-wrap">
                        {message.body || `[${message.message_type}]`}
                      </p>
                      <footer className="mt-1.5 flex items-center justify-end gap-1 text-[0.65rem] opacity-65">
                        {message.sender_type} · {timeLabel(message.created_at)}
                        {message.direction === 'outbound' ? (
                          <CheckCheck className="h-3 w-3" aria-hidden="true" />
                        ) : null}
                      </footer>
                      {message.status === 'failed' ? (
                        <p className="mt-2 flex items-center gap-1 text-xs text-red-300 dark:text-red-800">
                          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          {message.provider_error_message || 'Delivery failed'}
                        </p>
                      ) : null}
                    </article>
                  </li>
                ))}
              </ol>
              <form
                onSubmit={sendReply}
                className="border-t border-gray-200 p-4 dark:border-white/10"
              >
                <label htmlFor="whatsapp-reply" className="sr-only">
                  Reply to {displayName(selected.contact)}
                </label>
                <div className="flex gap-2">
                  <textarea
                    id="whatsapp-reply"
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    rows={2}
                    disabled={optedOut || !windowOpen || action.isPending}
                    placeholder={
                      optedOut
                        ? 'Contact opted out'
                        : windowOpen
                          ? 'Write a human reply…'
                          : '24-hour window closed — use an approved template'
                    }
                    className="focus:border-brand-gold min-h-12 flex-1 resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-white/15 dark:bg-white/5"
                  />
                  <button
                    type="submit"
                    disabled={!reply.trim() || optedOut || !windowOpen || action.isPending}
                    className="bg-brand-gold text-brand-navy self-stretch rounded-xl px-4 disabled:opacity-40"
                    aria-label="Send reply"
                  >
                    <Send className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                {action.isError ? (
                  <p role="alert" className="mt-2 text-xs text-red-700 dark:text-red-300">
                    {action.error instanceof Error ? action.error.message : 'Action failed'}
                  </p>
                ) : null}
              </form>
            </>
          )}
        </section>
        <aside
          className="hidden min-h-0 overflow-y-auto border-l border-gray-200 p-5 lg:block dark:border-white/10"
          aria-label="Lead and automation details"
        >
          {selected ? (
            <div className="space-y-6">
              <section>
                <h2 className="text-sm font-semibold text-gray-950 dark:text-white">
                  Lead summary
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  {selected.summary ||
                    'No summary yet. Qualification details appear as the customer shares them.'}
                </p>
              </section>
              <section>
                <h2 className="text-sm font-semibold text-gray-950 dark:text-white">Consent</h2>
                <p
                  className={`mt-2 inline-flex rounded-md px-2 py-1 text-xs font-semibold ${optedOut ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-200'}`}
                >
                  {selected.contact.consent_status.replace('_', ' ')}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      runAction('record_consent', {
                        consentStatus: 'opted_in',
                        source: 'admin_confirmed',
                      })
                    }
                    disabled={action.isPending}
                    className="rounded-lg border border-gray-300 px-2 py-2 text-xs font-semibold disabled:opacity-40 dark:border-white/15"
                  >
                    Record opt-in
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      runAction('record_consent', {
                        consentStatus: 'opted_out',
                        source: 'admin_confirmed',
                      })
                    }
                    disabled={action.isPending}
                    className="rounded-lg border border-red-300 px-2 py-2 text-xs font-semibold text-red-700 disabled:opacity-40 dark:text-red-300"
                  >
                    Record opt-out
                  </button>
                </div>
              </section>
              <section>
                <h2 className="text-sm font-semibold text-gray-950 dark:text-white">
                  Site visit requests
                </h2>
                {detail.data?.siteVisits.length ? (
                  <ul role="list" className="mt-2 space-y-2">
                    {detail.data.siteVisits.map((visit) => (
                      <li
                        key={visit.id}
                        className="rounded-lg bg-gray-50 p-2 text-xs dark:bg-white/5"
                      >
                        <strong>{visit.project?.name || 'Project to confirm'}</strong>
                        <span className="mt-1 block text-gray-500">
                          {visit.status} · {timeLabel(visit.requested_date)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-gray-500">No site visit requests.</p>
                )}
              </section>
              <section>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-950 dark:text-white">
                    Follow-ups
                  </h2>
                  <button
                    type="button"
                    onClick={() => runAction('cancel_followups')}
                    className="text-xs font-semibold text-red-700 dark:text-red-300"
                  >
                    Cancel all
                  </button>
                </div>
                <ul role="list" className="mt-2 space-y-2">
                  {detail.data?.followUps.map((followUp) => (
                    <li
                      key={followUp.id}
                      className="rounded-lg bg-gray-50 p-2 text-xs dark:bg-white/5"
                    >
                      <strong>{followUp.template?.name || 'Template'}</strong>
                      <span className="mt-1 block text-gray-500">
                        {followUp.status} · {timeLabel(followUp.scheduled_for)}
                      </span>
                      {followUp.reason ? (
                        <span className="mt-1 block text-red-600">{followUp.reason}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <form onSubmit={scheduleFollowUp} className="mt-3 space-y-2">
                  <label htmlFor="followup-template" className="text-xs font-medium">
                    Approved template
                  </label>
                  <select
                    id="followup-template"
                    value={templateId}
                    onChange={(event) => setTemplateId(event.target.value)}
                    className="dark:bg-brand-dark-surface w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs dark:border-white/15"
                  >
                    <option value="">Select template</option>
                    {detail.data?.templates
                      .filter((template) => template.parameter_count === 0)
                      .map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name} ({template.language})
                        </option>
                      ))}
                  </select>
                  <label htmlFor="followup-time" className="text-xs font-medium">
                    Send between 09:00 and 20:00 IST
                  </label>
                  <input
                    id="followup-time"
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(event) => setScheduledFor(event.target.value)}
                    className="dark:bg-brand-dark-surface w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs dark:border-white/15"
                  />
                  <button
                    type="submit"
                    disabled={!templateId || !scheduledFor || optedOut}
                    className="border-brand-gold text-brand-gold w-full rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-40"
                  >
                    <CalendarClock className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
                    Schedule follow-up
                  </button>
                </form>
              </section>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Select a conversation to view lead controls.</p>
          )}
        </aside>
      </div>
      <p className="sr-only" aria-live="polite">
        {action.isSuccess ? 'WhatsApp conversation updated.' : ''}
      </p>
    </main>
  );
}
