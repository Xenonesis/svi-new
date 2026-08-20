'use client';

import { MessageSquareText } from 'lucide-react';
import {
  WhatsAppConversation,
  MODE_COPY,
  getWhatsAppDisplayName,
  formatWhatsAppTime,
} from './types';

interface WhatsAppConversationListProps {
  conversations: WhatsAppConversation[] | undefined;
  activeId: string | null;
  isLoading: boolean;
  isError: boolean;
  onSelect: (id: string) => void;
}

export function WhatsAppConversationList({
  conversations,
  activeId,
  isLoading,
  isError,
  onSelect,
}: WhatsAppConversationListProps) {
  return (
    <aside
      className="min-h-0 border-b border-gray-200 lg:border-r lg:border-b-0 dark:border-white/10"
      aria-label="WhatsApp conversations"
    >
      <div className="border-b border-gray-200 px-4 py-3 dark:border-white/10">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Conversations</h2>
      </div>
      <div className="max-h-56 overflow-y-auto lg:h-[calc(100%-3rem)] lg:max-h-none">
        {isLoading ? (
          <div className="space-y-3 p-4" aria-label="Loading conversations">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5"
              />
            ))}
          </div>
        ) : isError ? (
          <p role="alert" className="p-5 text-sm text-red-700 dark:text-red-300">
            Could not load the inbox.
          </p>
        ) : !conversations || conversations.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            <MessageSquareText className="mx-auto mb-3 h-8 w-8" aria-hidden="true" />
            No WhatsApp conversations yet.
          </div>
        ) : (
          <ul role="list" className="divide-y divide-gray-100 dark:divide-white/5">
            {conversations.map((conversation) => {
              const active = conversation.id === activeId;
              return (
                <li key={conversation.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(conversation.id)}
                    aria-current={active ? 'true' : undefined}
                    className={`focus-visible:outline-inset focus-visible:outline-brand-gold w-full px-4 py-3 text-left transition-colors focus-visible:outline-2 ${
                      active ? 'bg-brand-gold/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <strong className="truncate text-sm text-gray-900 dark:text-white">
                        {getWhatsAppDisplayName(conversation.contact)}
                      </strong>
                      <span className="shrink-0 text-[0.68rem] text-gray-400">
                        {formatWhatsAppTime(conversation.last_message_at)}
                      </span>
                    </span>
                    <span className="mt-1 block truncate text-xs text-gray-500 dark:text-gray-400">
                      {conversation.latestMessage?.body ||
                        `[${conversation.latestMessage?.message_type ?? 'No message'}]`}
                    </span>
                    <span className="mt-2 inline-flex items-center gap-1 text-[0.7rem] font-semibold text-gray-500">
                      <span className="bg-brand-gold h-1.5 w-1.5 rounded-full" />
                      {MODE_COPY[conversation.mode]}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
