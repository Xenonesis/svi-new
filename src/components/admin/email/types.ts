export interface SentEmail {
  id: string;
  from: string;
  to: string[];
  subject: string;
  created_at: string;
  last_event: string;
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

export type Tab = 'compose' | 'sent' | 'templates' | 'domains' | 'settings';
