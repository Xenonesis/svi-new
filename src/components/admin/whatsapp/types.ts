export type WhatsAppMode = 'ai' | 'human' | 'paused';

export interface WhatsAppContact {
  id: string;
  phone_e164: string;
  display_name: string | null;
  provider_profile_name: string | null;
  consent_status: 'unknown' | 'opted_in' | 'opted_out';
}

export interface WhatsAppConversation {
  id: string;
  mode: WhatsAppMode;
  summary: string | null;
  qualification: Record<string, unknown>;
  service_window_expires_at: string | null;
  last_message_at: string | null;
  contact: WhatsAppContact;
  latestMessage?: {
    body: string | null;
    message_type: string;
    status: string;
    created_at: string;
  } | null;
}

export interface WhatsAppMessage {
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

export interface WhatsAppFollowUp {
  id: string;
  sequence_number: number;
  status: string;
  scheduled_for: string;
  reason: string | null;
  template: { name: string; language: string; body_preview: string | null } | null;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  language: string;
  body_preview: string | null;
  parameter_count: number;
}

export interface WhatsAppInboxResponse {
  conversations: WhatsAppConversation[];
  pagination: { total: number };
}

export interface WhatsAppDetailResponse {
  conversation: WhatsAppConversation;
  messages: WhatsAppMessage[];
  followUps: WhatsAppFollowUp[];
  siteVisits: Array<{
    id: string;
    status: string;
    requested_date: string | null;
    project: { name: string } | null;
  }>;
  templates: WhatsAppTemplate[];
}

export const MODE_COPY: Record<WhatsAppMode, string> = {
  ai: 'AI active',
  human: 'Human',
  paused: 'Paused',
};

export function getWhatsAppDisplayName(contact: WhatsAppContact): string {
  return contact.display_name || contact.provider_profile_name || contact.phone_e164;
}

export function formatWhatsAppTime(value: string | null): string {
  if (!value) return 'No messages';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
