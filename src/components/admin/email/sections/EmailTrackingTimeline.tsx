'use client';

import { useState } from 'react';
import {
  Send,
  CheckCircle2,
  MailOpen,
  MousePointerClick,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
} from 'lucide-react';
import type { EmailTrackingTimelineData, EmailTimelineEvent } from '../types';

interface EmailTrackingTimelineProps {
  tracking?: EmailTrackingTimelineData;
  events?: EmailTimelineEvent[];
  lastEvent?: string;
  createdAt?: string;
}

function formatISTTime(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function EmailTrackingTimeline({
  tracking,
  events = [],
  lastEvent = 'delivered',
  createdAt,
}: EmailTrackingTimelineProps) {
  const [showLog, setShowLog] = useState(false);

  const status = (tracking?.status || lastEvent || 'sent').toLowerCase();
  const isBounced = status === 'bounced' || status === 'failed';
  const isDelivered = status === 'delivered' || status === 'opened' || status === 'clicked';
  const isOpened = status === 'opened' || status === 'clicked' || (tracking?.open_count || 0) > 0;
  const isClicked = status === 'clicked' || (tracking?.click_count || 0) > 0;

  const sentAt = tracking?.sent_at || createdAt;
  const deliveredAt = tracking?.delivered_at;
  const openedAt = tracking?.first_opened_at;
  const clickedAt = tracking?.first_clicked_at;
  const openCount = tracking?.open_count || 0;
  const clickCount = tracking?.click_count || 0;
  const clickedUrls = tracking?.clicked_urls || [];

  return (
    <div className="mb-6 rounded-2xl border border-gray-200/80 bg-gradient-to-b from-gray-50/80 to-white p-4 shadow-xs dark:border-white/10 dark:from-white/[0.03] dark:to-transparent">
      {/* Header */}
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="text-brand-gold h-4 w-4" />
          <h4 className="text-xs font-bold tracking-wider text-gray-800 uppercase dark:text-gray-200">
            Delivery & Engagement Audit Timeline
          </h4>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
            isBounced
              ? 'border border-rose-500/20 bg-rose-500/15 text-rose-600'
              : isClicked
                ? 'border border-indigo-500/20 bg-indigo-500/15 text-indigo-600'
                : isOpened
                  ? 'border border-purple-500/20 bg-purple-500/15 text-purple-600'
                  : 'border border-emerald-500/20 bg-emerald-500/15 text-emerald-600'
          }`}
        >
          {status}
        </span>
      </div>

      {/* 4-Step Stepper Progress */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Step 1: Dispatched */}
        <div className="flex flex-col rounded-xl border border-emerald-500/30 bg-emerald-50/40 p-2.5 dark:border-emerald-500/20 dark:bg-emerald-500/5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <Send className="h-3.5 w-3.5" />
            <span>Dispatched</span>
          </div>
          <span className="mt-1 font-mono text-[11px] text-gray-500 dark:text-gray-400">
            {formatISTTime(sentAt)}
          </span>
          <span className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">
            AWS SES / Resend API
          </span>
        </div>

        {/* Step 2: Delivered or Bounced */}
        <div
          className={`flex flex-col rounded-xl border p-2.5 ${
            isBounced
              ? 'border-rose-500/30 bg-rose-50/40 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/5 dark:text-rose-400'
              : isDelivered
                ? 'border-emerald-500/30 bg-emerald-50/40 dark:border-emerald-500/20 dark:bg-emerald-500/5'
                : 'border-gray-200 bg-gray-50/50 opacity-60 dark:border-white/5 dark:bg-white/[0.01]'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-bold">
            {isBounced ? (
              <>
                <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                <span className="text-rose-600 dark:text-rose-400">Delivery Bounced</span>
              </>
            ) : (
              <>
                <CheckCircle2
                  className={`h-3.5 w-3.5 ${isDelivered ? 'text-emerald-500' : 'text-gray-400'}`}
                />
                <span
                  className={
                    isDelivered ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-500'
                  }
                >
                  Delivered
                </span>
              </>
            )}
          </div>
          <span className="mt-1 font-mono text-[11px] text-gray-500 dark:text-gray-400">
            {isBounced
              ? formatISTTime(tracking?.bounced_at || sentAt)
              : formatISTTime(deliveredAt || sentAt)}
          </span>
          <span className="mt-0.5 text-[10px] text-gray-400">
            {isBounced ? 'Permanent / Mailbox error' : 'Accepted by mail server'}
          </span>
        </div>

        {/* Step 3: Opened */}
        <div
          className={`flex flex-col rounded-xl border p-2.5 ${
            isOpened
              ? 'border-purple-500/30 bg-purple-50/40 dark:border-purple-500/20 dark:bg-purple-500/5'
              : 'border-gray-200 bg-gray-50/50 opacity-60 dark:border-white/5 dark:bg-white/[0.01]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-400">
              <MailOpen
                className={`h-3.5 w-3.5 ${isOpened ? 'text-purple-500' : 'text-gray-400'}`}
              />
              <span className={isOpened ? 'text-purple-700 dark:text-purple-400' : 'text-gray-500'}>
                Opened
              </span>
            </div>
            {openCount > 0 && (
              <span className="py-0.2 rounded bg-purple-500/15 px-1.5 text-[9.5px] font-bold text-purple-600 dark:text-purple-300">
                {openCount}x
              </span>
            )}
          </div>
          <span className="mt-1 font-mono text-[11px] text-gray-500 dark:text-gray-400">
            {isOpened ? formatISTTime(openedAt) : 'Awaiting read'}
          </span>
          <span className="mt-0.5 text-[10px] text-gray-400">
            {isOpened ? 'Client viewed message' : 'Not yet opened'}
          </span>
        </div>

        {/* Step 4: Clicked */}
        <div
          className={`flex flex-col rounded-xl border p-2.5 ${
            isClicked
              ? 'border-indigo-500/30 bg-indigo-50/40 dark:border-indigo-500/20 dark:bg-indigo-500/5'
              : 'border-gray-200 bg-gray-50/50 opacity-60 dark:border-white/5 dark:bg-white/[0.01]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400">
              <MousePointerClick
                className={`h-3.5 w-3.5 ${isClicked ? 'text-indigo-500' : 'text-gray-400'}`}
              />
              <span
                className={isClicked ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-500'}
              >
                Clicked
              </span>
            </div>
            {clickCount > 0 && (
              <span className="py-0.2 rounded bg-indigo-500/15 px-1.5 text-[9.5px] font-bold text-indigo-600 dark:text-indigo-300">
                {clickCount}x
              </span>
            )}
          </div>
          <span className="mt-1 font-mono text-[11px] text-gray-500 dark:text-gray-400">
            {isClicked ? formatISTTime(clickedAt) : 'No links clicked'}
          </span>
          <span className="mt-0.5 text-[10px] text-gray-400">
            {isClicked ? 'Engagement detected' : 'Awaiting click'}
          </span>
        </div>
      </div>

      {/* Clicked Links Drawer (if clicked) */}
      {clickedUrls.length > 0 && (
        <div className="mt-3 rounded-lg border border-indigo-200/60 bg-indigo-50/30 p-2.5 dark:border-indigo-500/20 dark:bg-indigo-500/5">
          <span className="text-[10px] font-bold tracking-wide text-indigo-700 uppercase dark:text-indigo-300">
            Destination URLs Clicked ({clickedUrls.length}):
          </span>
          <div className="mt-1 space-y-1">
            {clickedUrls.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 truncate font-mono text-xs text-indigo-600 hover:underline dark:text-indigo-400"
              >
                <ExternalLink className="h-3 w-3 shrink-0" />
                <span className="truncate">{url}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Audit Log Accordion */}
      {events.length > 0 && (
        <div className="mt-3 border-t border-gray-100 pt-2.5 dark:border-white/5">
          <button
            type="button"
            onClick={() => setShowLog(!showLog)}
            className="flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {showLog ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            <span>
              {showLog ? 'Hide' : 'Show'} raw webhook events ({events.length})
            </span>
          </button>

          {showLog && (
            <div className="mt-2 space-y-1.5 rounded-lg bg-gray-50 p-2.5 font-mono text-[10px] text-gray-600 dark:bg-white/[0.02] dark:text-gray-400">
              {events.map((ev, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-gray-100 pb-1 last:border-0 dark:border-white/5"
                >
                  <span className="font-semibold text-gray-800 uppercase dark:text-gray-200">
                    {ev.event_type}
                  </span>
                  <span>{formatISTTime(ev.occurred_at)}</span>
                  {ev.bounce_reason && (
                    <span className="max-w-[200px] truncate text-rose-500" title={ev.bounce_reason}>
                      {ev.bounce_reason}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
