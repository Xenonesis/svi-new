export interface Recipient {
  email: string;
  name?: string;
  type: 'manual' | 'employee' | 'client' | 'admin';
  valid: boolean;
}

export interface Contact {
  id: string;
  full_name: string;
  email: string;
  real_email: string | null;
  role: 'admin' | 'employee' | 'client';
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
  is_starred?: boolean;
  is_read?: boolean;
  is_archived?: boolean;
  tags?: string[];
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
}

export interface Domain {
  id: string;
  name: string;
  status: string;
  created_at: string;
  region: string;
  records?: DnsRecord[];
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

export interface Campaign {
  id: string;
  title: string;
  subject: string;
  recipient_group: 'all_users' | 'lottery_participants' | 'custom';
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
}
