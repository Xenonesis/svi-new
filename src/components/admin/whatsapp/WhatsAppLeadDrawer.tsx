'use client';

import { FormEvent } from 'react';
import { CalendarClock } from 'lucide-react';
import {
  WhatsAppConversation,
  WhatsAppFollowUp,
  WhatsAppTemplate,
  formatWhatsAppTime,
} from './types';

interface WhatsAppLeadDrawerProps {
  selected: WhatsAppConversation | undefined;
  followUps: WhatsAppFollowUp[] | undefined;
  siteVisits:
    | Array<{
        id: string;
        status: string;
        requested_date: string | null;
        project: { name: string } | null;
      }>
    | undefined;
  templates: WhatsAppTemplate[] | undefined;
  templateId: string;
  scheduledFor: string;
  isActionPending: boolean;
  onTemplateIdChange: (id: string) => void;
  onScheduledForChange: (val: string) => void;
  onScheduleFollowUp: (e: FormEvent) => void;
  onRunAction: (name: string, extra?: Record<string, unknown>) => void;
}

export function WhatsAppLeadDrawer({
  selected,
  followUps,
  siteVisits,
  templates,
  templateId,
  scheduledFor,
  isActionPending,
  onTemplateIdChange,
  onScheduledForChange,
  onScheduleFollowUp,
  onRunAction,
}: WhatsAppLeadDrawerProps) {
  if (!selected) {
    return (
      <aside
        className="hidden min-h-0 overflow-y-auto border-l border-gray-200 p-5 lg:block dark:border-white/10"
        aria-label="Lead and automation details"
      >
        <p className="text-sm text-gray-500">Select a conversation to view lead controls.</p>
      </aside>
    );
  }

  const optedOut = selected.contact.consent_status === 'opted_out';

  return (
    <aside
      className="hidden min-h-0 overflow-y-auto border-l border-gray-200 p-5 lg:block dark:border-white/10"
      aria-label="Lead and automation details"
    >
      <div className="space-y-6">
        {/* Lead Summary */}
        <section>
          <h2 className="text-sm font-semibold text-gray-950 dark:text-white">Lead summary</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
            {selected.summary ||
              'No summary yet. Qualification details appear as the customer shares them.'}
          </p>
        </section>

        {/* Consent */}
        <section>
          <h2 className="text-sm font-semibold text-gray-950 dark:text-white">Consent</h2>
          <p
            className={`mt-2 inline-flex rounded-md px-2 py-1 text-xs font-semibold ${
              optedOut
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-200'
            }`}
          >
            {selected.contact.consent_status.replace('_', ' ')}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                onRunAction('record_consent', {
                  consentStatus: 'opted_in',
                  source: 'admin_confirmed',
                })
              }
              disabled={isActionPending}
              className="rounded-lg border border-gray-300 px-2 py-2 text-xs font-semibold disabled:opacity-40 dark:border-white/15"
            >
              Record opt-in
            </button>
            <button
              type="button"
              onClick={() =>
                onRunAction('record_consent', {
                  consentStatus: 'opted_out',
                  source: 'admin_confirmed',
                })
              }
              disabled={isActionPending}
              className="rounded-lg border border-red-300 px-2 py-2 text-xs font-semibold text-red-700 disabled:opacity-40 dark:text-red-300"
            >
              Record opt-out
            </button>
          </div>
        </section>

        {/* Site visit requests */}
        <section>
          <h2 className="text-sm font-semibold text-gray-950 dark:text-white">
            Site visit requests
          </h2>
          {siteVisits && siteVisits.length > 0 ? (
            <ul role="list" className="mt-2 space-y-2">
              {siteVisits.map((visit) => (
                <li key={visit.id} className="rounded-lg bg-gray-50 p-2 text-xs dark:bg-white/5">
                  <strong>{visit.project?.name || 'Project to confirm'}</strong>
                  <span className="mt-1 block text-gray-500">
                    {visit.status} · {formatWhatsAppTime(visit.requested_date)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-gray-500">No site visit requests.</p>
          )}
        </section>

        {/* Follow-ups */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-950 dark:text-white">Follow-ups</h2>
            <button
              type="button"
              onClick={() => onRunAction('cancel_followups')}
              className="text-xs font-semibold text-red-700 dark:text-red-300"
            >
              Cancel all
            </button>
          </div>
          <ul role="list" className="mt-2 space-y-2">
            {followUps?.map((followUp) => (
              <li key={followUp.id} className="rounded-lg bg-gray-50 p-2 text-xs dark:bg-white/5">
                <strong>{followUp.template?.name || 'Template'}</strong>
                <span className="mt-1 block text-gray-500">
                  {followUp.status} · {formatWhatsAppTime(followUp.scheduled_for)}
                </span>
                {followUp.reason ? (
                  <span className="mt-1 block text-red-600">{followUp.reason}</span>
                ) : null}
              </li>
            ))}
          </ul>

          <form onSubmit={onScheduleFollowUp} className="mt-3 space-y-2">
            <label htmlFor="followup-template" className="text-xs font-medium">
              Approved template
            </label>
            <select
              id="followup-template"
              value={templateId}
              onChange={(event) => onTemplateIdChange(event.target.value)}
              className="dark:bg-brand-dark-surface w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs dark:border-white/15"
            >
              <option value="">Select template</option>
              {templates
                ?.filter((template) => template.parameter_count === 0)
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
              onChange={(event) => onScheduledForChange(event.target.value)}
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
    </aside>
  );
}
