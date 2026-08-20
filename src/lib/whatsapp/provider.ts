import 'server-only';

import { randomUUID } from 'node:crypto';
import { normalizeE164, toMetaRecipient } from './phone';
import type {
  ProviderSendResult,
  SendTemplateInput,
  SendTextInput,
  StatusWebhookEvent,
  WhatsAppDeliveryStatus,
  WhatsAppMessageType,
  WhatsAppProvider,
  WhatsAppWebhookEvent,
} from './types';
import { WhatsAppProviderError } from './types';

type UnknownRecord = Record<string, unknown>;

const MESSAGE_TYPES = new Set<WhatsAppMessageType>([
  'text',
  'image',
  'audio',
  'video',
  'document',
  'location',
  'contacts',
  'reaction',
]);
const STATUSES = new Set<WhatsAppDeliveryStatus>(['sent', 'delivered', 'read', 'failed']);

function record(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function records(value: unknown): UnknownRecord[] {
  return Array.isArray(value)
    ? value.map(record).filter((item): item is UnknownRecord => Boolean(item))
    : [];
}

function providerDate(timestamp: unknown): Date {
  const seconds = Number(timestamp);
  return Number.isFinite(seconds) ? new Date(seconds * 1000) : new Date();
}

function extractError(
  status: UnknownRecord
): Pick<StatusWebhookEvent, 'errorCode' | 'errorMessage'> {
  const error = records(status.errors)[0];
  return {
    errorCode: error?.code ? String(error.code) : undefined,
    errorMessage: error?.message ? String(error.message).slice(0, 500) : undefined,
  };
}

export class MetaCloudWhatsAppProvider implements WhatsAppProvider {
  private readonly mock: boolean;
  private readonly phoneNumberId?: string;
  private readonly accessToken?: string;
  private readonly apiVersion?: string;

  constructor() {
    this.mock = process.env.WHATSAPP_MOCK_SEND !== 'false';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.apiVersion = process.env.WHATSAPP_GRAPH_API_VERSION;

    if (!this.mock && (!this.phoneNumberId || !this.accessToken || !this.apiVersion)) {
      throw new Error(
        'Production WhatsApp sends require WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN, and WHATSAPP_GRAPH_API_VERSION'
      );
    }
  }

  async sendText(input: SendTextInput): Promise<ProviderSendResult> {
    const body: UnknownRecord = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: toMetaRecipient(input.to),
      type: 'text',
      text: { preview_url: false, body: input.text.slice(0, 4096) },
    };
    if (input.replyToProviderMessageId) {
      body.context = { message_id: input.replyToProviderMessageId };
    }
    return this.send(body);
  }

  async sendTemplate(input: SendTemplateInput): Promise<ProviderSendResult> {
    const parameters = (input.parameters ?? []).map((text) => ({ type: 'text', text }));
    return this.send({
      messaging_product: 'whatsapp',
      to: toMetaRecipient(input.to),
      type: 'template',
      template: {
        name: input.name,
        language: { code: input.language },
        ...(parameters.length > 0 ? { components: [{ type: 'body', parameters }] } : {}),
      },
    });
  }

  async markRead(providerMessageId: string): Promise<void> {
    if (this.mock) return;
    await this.request({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: providerMessageId,
    });
  }

  parseWebhook(payload: unknown): WhatsAppWebhookEvent[] {
    const root = record(payload);
    if (!root || root.object !== 'whatsapp_business_account') return [];
    const events: WhatsAppWebhookEvent[] = [];

    for (const entry of records(root.entry)) {
      for (const change of records(entry.changes)) {
        const value = record(change.value);
        if (!value) continue;
        const metadata = record(value.metadata);
        const phoneNumberId = String(metadata?.phone_number_id ?? '');
        const contact = records(value.contacts)[0];
        const profileName = String(record(contact?.profile)?.name ?? '').trim() || undefined;

        for (const message of records(value.messages)) {
          const providerMessageId = String(message.id ?? '');
          const phone = normalizeE164(String(message.from ?? ''));
          if (!providerMessageId || !phone || !phoneNumberId) continue;
          const rawType = String(message.type ?? 'unknown') as WhatsAppMessageType;
          const messageType = MESSAGE_TYPES.has(rawType) ? rawType : 'unknown';
          const text =
            messageType === 'text' ? String(record(message.text)?.body ?? '') : undefined;
          events.push({
            kind: 'message',
            providerMessageId,
            phoneNumberId,
            from: phone,
            profileName,
            timestamp: providerDate(message.timestamp),
            messageType,
            text,
            raw: message,
          });
        }

        for (const status of records(value.statuses)) {
          const providerMessageId = String(status.id ?? '');
          const recipient = normalizeE164(String(status.recipient_id ?? ''));
          const rawStatus = String(status.status ?? '');
          if (
            !providerMessageId ||
            !recipient ||
            !STATUSES.has(rawStatus as WhatsAppDeliveryStatus)
          )
            continue;
          events.push({
            kind: 'status',
            providerMessageId,
            phoneNumberId,
            recipient,
            timestamp: providerDate(status.timestamp),
            status: rawStatus as WhatsAppDeliveryStatus,
            ...extractError(status),
            raw: status,
          });
        }
      }
    }
    return events;
  }

  private async send(body: UnknownRecord): Promise<ProviderSendResult> {
    if (this.mock) {
      return { providerMessageId: `mock-${randomUUID()}`, status: 'accepted', mock: true };
    }
    const response = await this.request(body);
    const providerMessageId = String(record(records(response.messages)[0])?.id ?? '');
    if (!providerMessageId)
      throw new WhatsAppProviderError('Meta response omitted message ID', true);
    return { providerMessageId, status: 'accepted', mock: false };
  }

  private async request(body: UnknownRecord): Promise<UnknownRecord> {
    const response = await fetch(
      `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
      }
    );
    const payload = record(await response.json().catch(() => ({}))) ?? {};
    if (!response.ok) {
      const error = record(payload.error);
      throw new WhatsAppProviderError(
        String(error?.message ?? `Meta API returned ${response.status}`).slice(0, 500),
        response.status === 408 || response.status === 429 || response.status >= 500,
        error?.code ? String(error.code) : String(response.status)
      );
    }
    return payload;
  }
}

export function getWhatsAppProvider(): WhatsAppProvider {
  return new MetaCloudWhatsAppProvider();
}
