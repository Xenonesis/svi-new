'use client';

import { FormEvent } from 'react';
import {
  AlertCircle,
  Bot,
  CheckCheck,
  CirclePause,
  MessageSquareText,
  Send,
  UserRoundCheck,
} from 'lucide-react';
import {
  WhatsAppConversation,
  WhatsAppMessage,
  getWhatsAppDisplayName,
  formatWhatsAppTime,
} from './types';

interface WhatsAppChatPanelProps {
  activeId: string | null;
  selected: WhatsAppConversation | undefined;
  messages: WhatsAppMessage[] | undefined;
  isLoading: boolean;
  isError: boolean;
  reply: string;
  isActionPending: boolean;
  actionError: Error | null;
  onReplyChange: (text: string) => void;
  onSendReply: (e: FormEvent) => void;
  onRunAction: (name: string, extra?: Record<string, unknown>) => void;
}

export function WhatsAppChatPanel({
  activeId,
  selected,
  messages,
  isLoading,
  isError,
  reply,
  isActionPending,
  actionError,
  onReplyChange,
  onSendReply,
  onRunAction,
}: WhatsAppChatPanelProps) {
  if (!activeId) {
    return (
      <section
        className="flex min-h-[28rem] min-w-0 flex-col"
        aria-labelledby="conversation-heading"
      >
        <div className="m-auto max-w-sm px-6 text-center text-gray-500">
          <MessageSquareText className="mx-auto mb-4 h-10 w-10" aria-hidden="true" />
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Select a conversation</h2>
          <p className="mt-1 text-sm">Message history and controls will appear here.</p>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section
        className="flex min-h-[28rem] min-w-0 flex-col"
        aria-labelledby="conversation-heading"
      >
        <div
          className="m-5 flex-1 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5"
          aria-label="Loading conversation"
        />
      </section>
    );
  }

  if (isError || !selected) {
    return (
      <section
        className="flex min-h-[28rem] min-w-0 flex-col"
        aria-labelledby="conversation-heading"
      >
        <p role="alert" className="m-auto text-sm text-red-700 dark:text-red-300">
          Could not load this conversation.
        </p>
      </section>
    );
  }

  const optedOut = selected.contact.consent_status === 'opted_out';
  const windowOpen = Boolean(
    selected.service_window_expires_at && new Date(selected.service_window_expires_at) > new Date()
  );

  return (
    <section className="flex min-h-[28rem] min-w-0 flex-col" aria-labelledby="conversation-heading">
      {/* Conversation Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-3 dark:border-white/10">
        <div>
          <h2 id="conversation-heading" className="font-semibold text-gray-950 dark:text-white">
            {getWhatsAppDisplayName(selected.contact)}
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
              onClick={() => onRunAction('take_over')}
              className="bg-brand-navy rounded-lg px-3 py-2 text-xs font-semibold text-white"
            >
              <UserRoundCheck className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
              Take over
            </button>
          ) : (
            <button
              type="button"
              disabled={optedOut}
              onClick={() => onRunAction('return_to_ai')}
              className="bg-brand-gold text-brand-navy rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-40"
            >
              <Bot className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
              Return to AI
            </button>
          )}
          <button
            type="button"
            onClick={() => onRunAction('pause')}
            className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold dark:border-white/15"
          >
            <CirclePause className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
            Pause
          </button>
        </div>
      </header>

      {/* Messages Thread */}
      <ol
        className="flex-1 space-y-3 overflow-y-auto bg-gray-50/70 p-5 dark:bg-black/10"
        aria-label="Message history"
      >
        {messages?.map((message) => (
          <li
            key={message.id}
            className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
          >
            <article
              className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm ${
                message.direction === 'outbound'
                  ? 'bg-brand-navy dark:bg-brand-gold dark:text-brand-navy rounded-br-md text-white'
                  : 'rounded-bl-md border border-gray-200 bg-white text-gray-800 dark:border-white/10 dark:bg-white/5 dark:text-gray-100'
              }`}
            >
              <p className="break-words whitespace-pre-wrap">
                {message.body || `[${message.message_type}]`}
              </p>
              <footer className="mt-1.5 flex items-center justify-end gap-1 text-[0.65rem] opacity-65">
                {message.sender_type} · {formatWhatsAppTime(message.created_at)}
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

      {/* Message Composer */}
      <form onSubmit={onSendReply} className="border-t border-gray-200 p-4 dark:border-white/10">
        <label htmlFor="whatsapp-reply" className="sr-only">
          Reply to {getWhatsAppDisplayName(selected.contact)}
        </label>
        <div className="flex gap-2">
          <textarea
            id="whatsapp-reply"
            value={reply}
            onChange={(event) => onReplyChange(event.target.value)}
            rows={2}
            disabled={optedOut || !windowOpen || isActionPending}
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
            disabled={!reply.trim() || optedOut || !windowOpen || isActionPending}
            className="bg-brand-gold text-brand-navy self-stretch rounded-xl px-4 disabled:opacity-40"
            aria-label="Send reply"
          >
            <Send className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {actionError ? (
          <p role="alert" className="mt-2 text-xs text-red-700 dark:text-red-300">
            {actionError.message || 'Action failed'}
          </p>
        ) : null}
      </form>
    </section>
  );
}
