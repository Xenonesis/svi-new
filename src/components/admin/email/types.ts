export interface Recipient {
  email: string;
  name?: string;
  type: 'manual' | 'employee' | 'client' | 'admin';
  valid: boolean;
}

export type AudienceSegment =
  'lucky_draw_winners' | 'allotment_done' | 'token_holders' | 'hot_calling_leads';

export interface ContactRealEstateMeta {
  plot_no?: string;
  allotted_date?: string;
  total_cost?: number;
  pending_amount?: number;
  advisor_name?: string;
  ticket_id?: string;
  projectName?: string;
  temperature?: 'hot' | 'warm' | 'cold';
}

export interface Contact {
  id: string;
  full_name: string;
  email: string;
  real_email: string | null;
  role: 'admin' | 'employee' | 'client';
  segments?: AudienceSegment[];
  phone?: string | null;
  metadata?: ContactRealEstateMeta;
}
export interface SentEmail {
  id: string;
  from: string;
  to: string[];
  cc?: string[];
  attachments?: any[];
  subject: string;
  created_at: string;
  last_event: string;
  status?: string;
  delivered_at?: string | null;
  first_opened_at?: string | null;
  first_clicked_at?: string | null;
  bounced_at?: string | null;
  complained_at?: string | null;
  is_starred?: boolean;
  is_read?: boolean;
  is_archived?: boolean;
  tags?: string[];
  is_scheduled?: boolean;
  scheduled_at?: string;
}

export interface InboxEmailItem {
  id: string;
  email_id: string;
  thread_id?: string;
  subject: string;
  from: string;
  from_email?: string;
  from_name?: string;
  to: string[];
  created_at: string;
  snippet: string;
  is_starred: boolean;
  is_read: boolean;
  is_archived: boolean;
  tags: string[];
  has_attachments?: boolean;
  html?: string;
  text?: string;
  last_event?: string;
}
export interface EmailTimelineEvent {
  id: string | number;
  event_type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | string;
  occurred_at: string;
  ip?: string | null;
  user_agent?: string | null;
  url?: string | null;
  bounce_type?: string | null;
  bounce_reason?: string | null;
}

export interface EmailTrackingTimelineData {
  status: string;
  sent_at?: string | null;
  delivered_at?: string | null;
  first_opened_at?: string | null;
  first_clicked_at?: string | null;
  bounced_at?: string | null;
  complained_at?: string | null;
  open_count: number;
  click_count: number;
  clicked_urls?: string[];
  events: EmailTimelineEvent[];
}

export interface EmailDetail {
  id: string;
  from: string;
  to: string[];
  subject: string;
  html?: string;
  text?: string;
  created_at: string;
  last_event: string;
  headers?: Record<string, string>[];
  cc?: string[];
  bcc?: string[];
  reply_to?: string[];
  /** Inbox-specific & state fields */
  email_id?: string;
  thread_id?: string;
  from_email?: string;
  from_name?: string;
  to_emails?: string[];
  received_at?: string;
  opened?: boolean;
  clicked?: boolean;
  attachments?: any[];
  is_read?: boolean;
  is_archived?: boolean;
  is_starred?: boolean;
  tags?: string[];
  tracking?: EmailTrackingTimelineData;
  events?: EmailTimelineEvent[];
}
export interface Domain {
  id: string;
  name: string;
  status: string;
  created_at: string;
  region: string;
  records?: DnsRecord[];
  open_tracking?: boolean;
  click_tracking?: boolean;
}

export interface DnsRecord {
  record: string;
  name: string;
  type: string;
  ttl: string;
  status: string;
  value: string;
  priority?: number;
}

export type Tab =
  | 'compose'
  | 'drafts'
  | 'sent'
  | 'replies'
  | 'templates'
  | 'domains'
  | 'settings'
  | 'campaigns'
  | 'trash'
  | 'scheduled';

export interface DeletedEmail {
  id: string;
  email_id: string;
  subject: string;
  from: string;
  to: string[];
  created_at: string;
  last_event: string;
  deleted_at: string;
}

export interface ScheduledEmail {
  id: string;
  to_emails: string[];
  cc_emails?: string[] | null;
  bcc_emails?: string[] | null;
  subject: string;
  html_body: string;
  reply_to?: string | null;
  in_reply_to?: string | null;
  scheduled_at: string;
  status: 'pending' | 'sent' | 'cancelled' | 'failed';
  metadata?: {
    from: string;
    has_attachments?: boolean;
  };
  created_at: string;
}

export interface ForwardData {
  subject: string;
  html: string;
  originalFrom: string;
  originalTo: string[];
  originalDate: string;
  originalSubject: string;
  attachments?: any[];
}

export interface ReplyData {
  to: string;
  subject: string;
  html?: string;
  quotedHtml?: string;
  originalFrom: string;
  originalDate: string;
  originalSubject: string;
  cc?: string[];
  originalMessageId?: string;
  attachments?: EmailAttachment[];
}

export interface DraftRecipientData {
  email: string;
  name?: string;
  type?: 'manual' | 'employee' | 'client' | 'admin';
}

export interface DraftData {
  id: string;
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  html: string;
  quotedHtml?: string;
  replyTo: string;
  fromName: string;
  savedAt: number;
  /** Structured recipient data for preserving names */
  toRecipients?: DraftRecipientData[];
  ccRecipients?: DraftRecipientData[];
  bccRecipients?: DraftRecipientData[];
  templateHtml?: string | null;
  selectedTemplate?: string | null;
  templateVars?: Record<string, string>;
  previewMode?: boolean;
  subjectTemplate?: string;
  inReplyToMessageId?: string | null;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  file?: File;
  name: string;
  size: number;
  base64?: string;
  url?: string;
}

export interface TemplatePrefill {
  subject: string;
  html: string;
  templateId?: string;
  name?: string;
}

export interface CustomEmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  description?: string;
  icon?: string;
  html: string;
  variables?: string[];
  isCustom: true;
  createdAt: string;
  updatedAt: string;
}

export interface ContactGroup {
  id: string;
  name: string;
  description: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  member_count?: number;
  members?: ContactGroupMember[];
}

export interface ContactGroupMember {
  id: string;
  group_id: string;
  contact_email: string;
  contact_name?: string;
  added_at: string;
}

export type RecipientGroup =
  | 'all_users'
  | 'lottery_participants'
  | 'lottery_winners'
  | 'allotment_holders'
  | 'workforce'
  | 'hot_leads'
  | 'custom';

export interface Campaign {
  id: string;
  title: string;
  subject: string;
  recipient_group: RecipientGroup;
  custom_emails: string[] | null;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  scheduled_at: string | null;
  reminder_at: string | null;
  reminder_sent_at: string | null;
  sent_at: string | null;
  recipient_count: number;
  created_at: string;
  lottery_id: string | null;
  lottery_title?: string | null;
  target_count?: number;
  attempted_count?: number;
  successful_count?: number;
  failed_count?: number;
}
