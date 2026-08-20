export type WhatsAppMessageType =
  | 'text'
  | 'template'
  | 'image'
  | 'audio'
  | 'video'
  | 'document'
  | 'location'
  | 'contacts'
  | 'reaction'
  | 'unknown';

export type WhatsAppDeliveryStatus = 'accepted' | 'sent' | 'delivered' | 'read' | 'failed';

export interface SendTextInput {
  to: string;
  text: string;
  replyToProviderMessageId?: string;
}

export interface SendTemplateInput {
  to: string;
  name: string;
  language: string;
  parameters?: string[];
}

export interface ProviderSendResult {
  providerMessageId: string;
  status: 'accepted';
  mock: boolean;
}

export interface InboundWebhookEvent {
  kind: 'message';
  providerMessageId: string;
  phoneNumberId: string;
  from: string;
  profileName?: string;
  timestamp: Date;
  messageType: WhatsAppMessageType;
  text?: string;
  raw: Record<string, unknown>;
}

export interface StatusWebhookEvent {
  kind: 'status';
  providerMessageId: string;
  phoneNumberId: string;
  recipient: string;
  timestamp: Date;
  status: WhatsAppDeliveryStatus;
  errorCode?: string;
  errorMessage?: string;
  raw: Record<string, unknown>;
}

export type WhatsAppWebhookEvent = InboundWebhookEvent | StatusWebhookEvent;

export interface WhatsAppProvider {
  sendText(input: SendTextInput): Promise<ProviderSendResult>;
  sendTemplate(input: SendTemplateInput): Promise<ProviderSendResult>;
  markRead(providerMessageId: string): Promise<void>;
  parseWebhook(payload: unknown): WhatsAppWebhookEvent[];
}

export type MessagingDenialReason =
  | 'global_kill_switch'
  | 'test_number_not_allowed'
  | 'contact_opted_out'
  | 'missing_consent'
  | 'human_takeover'
  | 'conversation_paused'
  | 'quiet_hours'
  | 'service_window_closed'
  | 'template_required'
  | 'template_not_approved'
  | 'follow_up_cap_reached';

export interface MessagingEligibilityDecision {
  allowed: boolean;
  messageMode: 'session' | 'template' | 'none';
  denialReason?: MessagingDenialReason;
}

export interface MessagingEligibilityInput {
  now?: Date;
  recipient: string;
  businessInitiated: boolean;
  autonomous: boolean;
  conversationMode: 'ai' | 'human' | 'paused';
  consentStatus: 'unknown' | 'opted_in' | 'opted_out';
  serviceWindowExpiresAt?: string | null;
  template?: { active: boolean; providerStatus: string } | null;
  completedFollowUps?: number;
}

export interface WhatsAppContactRow {
  id: string;
  phone_e164: string;
  display_name: string | null;
  provider_profile_name: string | null;
  consent_status: 'unknown' | 'opted_in' | 'opted_out';
  opted_out_at: string | null;
  last_inbound_at: string | null;
  last_outbound_at: string | null;
}

export interface WhatsAppConversationRow {
  id: string;
  contact_id: string;
  lead_id: string | null;
  mode: 'ai' | 'human' | 'paused';
  status: 'open' | 'closed';
  assigned_to: string | null;
  service_window_expires_at: string | null;
  ai_disclosed_at: string | null;
  summary: string | null;
  qualification: Record<string, unknown>;
  last_message_at: string | null;
}

export interface WhatsAppMessageRow {
  id: string;
  conversation_id: string;
  provider_message_id: string | null;
  direction: 'inbound' | 'outbound';
  sender_type: 'customer' | 'ai' | 'admin' | 'system';
  message_type: WhatsAppMessageType;
  body: string | null;
  template_name: string | null;
  status: 'received' | 'queued' | 'accepted' | 'sent' | 'delivered' | 'read' | 'failed';
  provider_error_code: string | null;
  provider_error_message: string | null;
  created_at: string;
}

export class WhatsAppProviderError extends Error {
  constructor(
    message: string,
    public readonly retryable: boolean,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'WhatsAppProviderError';
  }
}
