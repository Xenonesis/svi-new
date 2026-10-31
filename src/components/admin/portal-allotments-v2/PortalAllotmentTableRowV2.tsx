'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Share2,
  MoreHorizontal,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  Receipt,
  FileText,
} from 'lucide-react';
import type { AllotmentRecord, AllotmentFinancials } from '../portal-allotments/types';
import type { SavedReceipt } from '../payment-receipts/ReceiptTypes';

export interface PortalAllotmentTableRowV2Props {
  allotment: AllotmentRecord;
  financials?: AllotmentFinancials;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOpenLedger?: (allotment: AllotmentRecord) => void;
  onEdit: (allotment: AllotmentRecord) => void;
  onDelete: (id: string) => void;
  onShareWhatsApp?: (receipt: SavedReceipt) => void;
  children?: React.ReactNode;
  variant?: 'card' | 'table-row';
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}
const ADVISOR_COLOR_PALETTES = [
  {
    badge:
      'bg-indigo-500/10 text-indigo-700 border-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-400/25',
    dot: 'bg-indigo-500 dark:bg-indigo-400',
  },
  {
    badge:
      'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/25',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
  },
  {
    badge:
      'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/25',
    dot: 'bg-amber-500 dark:bg-amber-400',
  },
  {
    badge:
      'bg-purple-500/10 text-purple-700 border-purple-500/20 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-400/25',
    dot: 'bg-purple-500 dark:bg-purple-400',
  },
  {
    badge:
      'bg-sky-500/10 text-sky-700 border-sky-500/20 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/25',
    dot: 'bg-sky-500 dark:bg-sky-400',
  },
  {
    badge:
      'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-400/25',
    dot: 'bg-rose-500 dark:bg-rose-400',
  },
  {
    badge:
      'bg-teal-500/10 text-teal-700 border-teal-500/20 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-400/25',
    dot: 'bg-teal-500 dark:bg-teal-400',
  },
  {
    badge:
      'bg-violet-500/10 text-violet-700 border-violet-500/20 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-400/25',
    dot: 'bg-violet-500 dark:bg-violet-400',
  },
  {
    badge:
      'bg-cyan-500/10 text-cyan-700 border-cyan-500/20 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-400/25',
    dot: 'bg-cyan-500 dark:bg-cyan-400',
  },
  {
    badge:
      'bg-fuchsia-500/10 text-fuchsia-700 border-fuchsia-500/20 dark:bg-fuchsia-500/15 dark:text-fuchsia-300 dark:border-fuchsia-400/25',
    dot: 'bg-fuchsia-500 dark:bg-fuchsia-400',
  },
];

function getAdvisorColorPalette(advisorName?: string | null) {
  if (!advisorName || !advisorName.trim()) return null;
  const clean = advisorName.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash * 31 + clean.charCodeAt(i)) >>> 0;
  }
  return ADVISOR_COLOR_PALETTES[hash % ADVISOR_COLOR_PALETTES.length];
}

export function PortalAllotmentTableRowV2({
  allotment,
  financials,
  isExpanded,
  onToggleExpand,
  onOpenLedger,
  onEdit,
  onDelete,
  onShareWhatsApp,
  children,
  variant = 'table-row',
  isSelected,
  onToggleSelect,
}: PortalAllotmentTableRowV2Props) {
  const [showMenu, setShowMenu] = useState(false);

  // Financial calculations
  const totalCost = Number(allotment.metadata?.total_cost ?? allotment.total_cost) || 0;
  const dealValue = financials?.dealValue ?? totalCost;
  const totalPaid = financials?.totalPaid ?? 0;
  const balanceDue =
    financials?.balanceDue ?? (dealValue > 0 ? Math.max(0, dealValue - totalPaid) : 0);
  const percentPaid = dealValue > 0 ? Math.min(100, Math.round((totalPaid / dealValue) * 100)) : 0;

  // Metadata
  const bookingDate = (allotment.metadata?.booking_date as string) || allotment.booking_date;
  const rawUnit = allotment.unit_no || allotment.unit_number || '—';
  const plotPreference =
    (allotment.metadata?.plot_preference as string) ||
    (allotment.metadata?.plotPreference as string) ||
    '';
  const isParkOnly = String(rawUnit).trim().toLowerCase() === 'park';
  const unitNumber = isParkOnly ? (plotPreference ? '—' : 'Unassigned') : rawUnit;
  const effectivePreference = plotPreference || (isParkOnly ? 'park' : '');
  const propertyName = allotment.properties?.name || 'Assigned Property';
  const area = allotment.metadata?.area ?? allotment.area;
  const metaClient = (allotment.metadata?.client_name || allotment.metadata?.clientName) as
    string | undefined;
  const isStaffProfile =
    allotment.profiles?.role === 'admin' || allotment.profiles?.role === 'employee';
  const clientName =
    isStaffProfile && metaClient
      ? metaClient
      : allotment.profiles?.full_name || metaClient || 'Client';
  const clientPhone =
    (allotment.metadata?.client_phone as string) || (allotment.metadata?.phone as string);
  const clientEmail =
    allotment.profiles?.email ||
    (allotment.metadata?.client_email as string) ||
    (allotment.metadata?.email as string);
  const clientAddress =
    (allotment.metadata?.client_address as string) || (allotment.metadata?.address as string);
  const advisorName = (allotment.metadata?.advisor_name as string) || allotment.advisor_name;
  const rawTicketId =
    (allotment.metadata?.ticket_id as string) ||
    (allotment.metadata?.ticketId as string) ||
    `PL${unitNumber}`;
  const allotmentMode =
    (allotment.metadata?.allotment_mode as string) ||
    (allotment.metadata?.sale_type as string) ||
    'Direct Sell';

  const docRefId =
    (allotment.metadata?.ticket_id as string | undefined) ||
    (allotment.metadata?.ticketId as string | undefined) ||
    '';
  const docSearchQuery =
    allotment.profiles?.full_name ||
    (allotment.metadata?.client_name as string | undefined) ||
    (allotment.metadata?.ticket_id as string | undefined) ||
    '';

  const latestReceipt =
    allotment.receipts && allotment.receipts.length > 0 ? allotment.receipts[0] : null;

  if (variant === 'card') {
    return (
      <div
        className={`border p-4 transition-colors ${
          isSelected
            ? 'dark:border-brand-gold border-slate-900 bg-slate-50/50 dark:bg-white/[0.03]'
            : 'border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#0D1117]'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {onToggleSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(allotment.id)}
                className="h-3.5 w-3.5 rounded-none border-slate-300 text-slate-900 focus:ring-0 dark:border-white/20 dark:bg-black"
              />
            )}
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
              {unitNumber === '—' || unitNumber === 'Unassigned'
                ? unitNumber
                : unitNumber.startsWith('Unit')
                  ? unitNumber
                  : `Unit ${unitNumber}`}
            </span>
            <span className="font-mono text-[11px] text-slate-500">{rawTicketId}</span>
          </div>
          <span className="font-mono text-xs font-bold text-slate-900 tabular-nums dark:text-white">
            ₹{dealValue.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <div>
            <div className="font-medium text-slate-900 dark:text-white">{clientName}</div>
            <div className="text-slate-500">{propertyName}</div>
            {clientEmail && (
              <a
                href={`mailto:${clientEmail}`}
                className="mt-0.5 block truncate text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                {clientEmail}
              </a>
            )}
            {advisorName && (
              <div className="mt-1.5 flex items-center">
                {(() => {
                  const palette = getAdvisorColorPalette(advisorName);
                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                        palette?.badge ||
                        'border-slate-500/20 bg-slate-500/10 text-slate-700 dark:bg-white/5 dark:text-slate-300'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${palette?.dot || 'bg-slate-400'}`}
                      />
                      <span className="max-w-[130px] truncate">{advisorName}</span>
                    </span>
                  );
                })()}
              </div>
            )}
          </div>
          <div className="text-right font-mono">
            <div className="font-semibold text-emerald-600 dark:text-emerald-400">
              ₹{totalPaid.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400">{percentPaid}% Paid</div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-white/[0.05]">
          <button
            type="button"
            onClick={onToggleExpand}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <span>{isExpanded ? 'Hide Schedule' : 'View Schedule'}</span>
            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {onOpenLedger && (
            <button
              type="button"
              onClick={() => onOpenLedger(allotment)}
              className="text-xs font-semibold text-slate-900 underline underline-offset-2 dark:text-white"
            >
              Ledger
            </button>
          )}
        </div>
        {children}
      </div>
    );
  }

  return (
    <>
      <tr
        className={`border-b border-slate-200 text-xs transition-colors dark:border-white/[0.08] ${
          isSelected
            ? 'bg-slate-50 dark:bg-white/[0.04]'
            : 'hover:bg-slate-50/70 dark:hover:bg-white/[0.02]'
        }`}
      >
        {/* Select */}
        <td className="w-[40px] border-r border-slate-200 px-3 py-3 text-center align-middle dark:border-white/[0.08]">
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(allotment.id)}
              aria-label={`Select Unit ${unitNumber}`}
              className="h-3.5 w-3.5 rounded-none border-slate-300 text-slate-900 focus:ring-0 dark:border-white/20 dark:bg-black"
            />
          )}
        </td>

        {/* Ref / Ticket ID */}
        <td className="w-[110px] border-r border-slate-200 px-3 py-3 font-mono font-medium whitespace-nowrap text-slate-900 dark:border-white/[0.08] dark:text-white">
          {rawTicketId}
        </td>

        {/* Unit & Preference */}
        <td className="w-[100px] border-r border-slate-200 px-3 py-3 align-middle font-mono whitespace-nowrap dark:border-white/[0.08]">
          <div className="flex flex-col items-start gap-1">
            <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-900 dark:bg-white/10 dark:text-white">
              {unitNumber === '—' || unitNumber === 'Unassigned'
                ? unitNumber
                : unitNumber.startsWith('Unit')
                  ? unitNumber
                  : `Unit ${unitNumber}`}
            </span>
            {effectivePreference && (
              <span className="py-0.2 inline-flex items-center rounded bg-amber-50 px-1.5 text-[10px] font-semibold text-amber-700 capitalize dark:bg-amber-500/10 dark:text-amber-400">
                {effectivePreference === 'park'
                  ? 'Park Facing'
                  : effectivePreference === 'main-road'
                    ? 'Main Road'
                    : effectivePreference}
              </span>
            )}
          </div>
        </td>
        {/* Property */}
        <td className="border-r border-slate-200 px-3 py-3 align-middle dark:border-white/[0.08]">
          <span className="font-medium whitespace-nowrap text-slate-900 dark:text-white">
            {propertyName}
          </span>
        </td>

        {/* Size */}
        <td className="w-[90px] border-r border-slate-200 px-3 py-3 align-middle font-mono text-[11px] whitespace-nowrap text-slate-600 dark:border-white/[0.08] dark:text-slate-400">
          {area ? `${area} yd²` : '—'}
        </td>

        {/* Mode */}
        <td className="w-[95px] border-r border-slate-200 px-3 py-3 font-mono text-[11px] whitespace-nowrap text-slate-600 dark:border-white/[0.08] dark:text-slate-400">
          {allotmentMode}
        </td>

        {/* Client & Contact - Luxury High-Density Profile Card */}
        <td className="min-w-[240px] border-r border-slate-200 px-3.5 py-3 align-middle dark:border-white/[0.08]">
          <div className="flex items-start gap-2.5">
            {/* Elegant Monogram Avatar */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-bold text-slate-700 shadow-2xs dark:border-white/[0.08] dark:from-[#1E293B] dark:to-[#0F172A] dark:text-[#E2E8F0]">
              {clientName.trim().charAt(0).toUpperCase()}
            </div>

            {/* Profile Info & Interactive Contacts */}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-xs font-bold tracking-tight text-slate-900 dark:text-white">
                {clientName}
              </span>

              <div className="flex flex-col gap-0.5 text-[11px]">
                {clientPhone && (
                  <a
                    href={`tel:${clientPhone}`}
                    className="group inline-flex items-center gap-1.5 font-mono text-emerald-600 transition-colors hover:text-emerald-700 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    <Phone className="h-3 w-3 shrink-0 opacity-80 group-hover:opacity-100" />
                    <span>{clientPhone}</span>
                  </a>
                )}
                {clientEmail && (
                  <a
                    href={`mailto:${clientEmail}`}
                    title={clientEmail}
                    className="group inline-flex items-center gap-1.5 truncate text-slate-500 transition-colors hover:text-sky-600 hover:underline dark:text-slate-400 dark:hover:text-sky-300"
                  >
                    <Mail className="h-3 w-3 shrink-0 text-sky-500/80 group-hover:text-sky-500" />
                    <span className="max-w-[190px] truncate">{clientEmail}</span>
                  </a>
                )}
              </div>

              {clientAddress ? (
                <div
                  title={clientAddress}
                  className="mt-0.5 flex items-start gap-1.5 rounded-md border border-amber-500/15 bg-amber-500/[0.05] px-2 py-1 text-[10.5px] text-slate-600 dark:border-amber-400/20 dark:bg-amber-400/[0.06] dark:text-[#E2E8F0]"
                >
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-amber-500 dark:text-amber-400" />
                  <span className="line-clamp-2 leading-tight select-text">{clientAddress}</span>
                </div>
              ) : (
                <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400/80 dark:text-slate-500">
                  <MapPin className="h-2.5 w-2.5 shrink-0 opacity-40" />
                  <span className="italic">No address recorded</span>
                </div>
              )}
            </div>
          </div>
        </td>

        {/* Advisor */}
        <td className="min-w-[140px] border-r border-slate-200 px-3 py-3 align-middle whitespace-nowrap dark:border-white/[0.08]">
          {advisorName ? (
            (() => {
              const palette = getAdvisorColorPalette(advisorName);
              return (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide shadow-2xs ${
                    palette?.badge ||
                    'border-slate-500/20 bg-slate-500/10 text-slate-700 dark:bg-white/5 dark:text-slate-300'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${palette?.dot || 'bg-slate-400'}`}
                  />
                  <UserCheck className="h-3 w-3 shrink-0 opacity-80" />
                  <span className="max-w-[160px] truncate">{advisorName}</span>
                </span>
              );
            })()
          ) : (
            <span className="font-mono text-xs text-slate-300 select-none dark:text-slate-600">
              —
            </span>
          )}
        </td>

        {/* Total Amount / Deal Value */}
        <td className="min-w-[110px] border-r border-slate-200 px-3 py-3 align-middle font-mono text-xs font-bold text-slate-900 tabular-nums dark:border-white/[0.08] dark:text-white">
          {dealValue > 0
            ? `₹${dealValue.toLocaleString('en-IN')}`
            : !isNaN(totalCost) && totalCost > 0
              ? `₹${totalCost.toLocaleString('en-IN')}`
              : '—'}
        </td>

        {/* Per Square Yard Rate */}
        <td className="min-w-[110px] border-r border-slate-200 px-3 py-3 align-middle font-mono text-xs text-slate-600 tabular-nums dark:border-white/[0.08] dark:text-slate-300">
          {dealValue > 0 && Number(area) > 0 ? (
            <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-800 dark:bg-white/[0.06] dark:text-slate-200">
              ₹{Math.round(dealValue / Number(area)).toLocaleString('en-IN')}/yd²
            </span>
          ) : (
            <span className="text-slate-400 select-none dark:text-slate-600">—</span>
          )}
        </td>

        {/* Booking Date */}
        <td className="min-w-[120px] border-r border-slate-200 px-3 py-3 align-middle font-mono text-xs whitespace-nowrap text-slate-600 tabular-nums dark:border-white/[0.08] dark:text-slate-300">
          {bookingDate ? (
            <span>{bookingDate}</span>
          ) : (
            <span className="text-slate-400 select-none dark:text-slate-600">—</span>
          )}
        </td>

        {/* Received & % with Progress Bar */}
        <td className="min-w-[120px] border-r border-slate-200 px-3 py-3 align-middle dark:border-white/[0.08]">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-sm font-bold text-emerald-500 tabular-nums dark:text-[#10B981]">
                ₹{totalPaid.toLocaleString('en-IN')}
              </span>
              <span className="font-mono text-xs font-bold text-slate-800 dark:text-white">
                {percentPaid}%
              </span>
            </div>
            <div className="h-1.5 w-full max-w-[110px] min-w-[70px] overflow-hidden rounded-full bg-slate-200/80 dark:bg-[#1E293B]">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300 dark:bg-[#10B981]"
                style={{ width: `${percentPaid}%` }}
              />
            </div>
          </div>
        </td>

        {/* Balance Due */}
        <td className="min-w-[110px] border-r border-slate-200 px-3 py-3 align-middle font-mono text-sm font-bold text-amber-500 tabular-nums dark:border-white/[0.08] dark:text-[#FBBF24]">
          {dealValue > 0 ? `₹${balanceDue.toLocaleString('en-IN')}` : '—'}
        </td>

        {/* Actions: Golden Ledger Button & Deep Toggle Payments Button */}
        <td className="w-[200px] px-3 py-3 text-right align-middle whitespace-nowrap">
          <div className="relative inline-flex items-center gap-2">
            {onOpenLedger && (
              <button
                type="button"
                onClick={() => onOpenLedger(allotment)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-700 shadow-2xs transition-all hover:bg-amber-500/20 active:scale-95 dark:border-[#FBBF24]/50 dark:bg-[#251F14]/70 dark:text-[#FBBF24] dark:hover:bg-[#251F14]"
              >
                <BookOpen className="h-3.5 w-3.5 stroke-[2.2] text-amber-600 dark:text-[#FBBF24]" />
                <span>Ledger</span>
              </button>
            )}

            <button
              type="button"
              onClick={onToggleExpand}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-100/90 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-200 active:scale-95 dark:border-white/[0.08] dark:bg-[#161D2C] dark:text-[#E2E8F0] dark:hover:border-white/[0.15] dark:hover:bg-[#1E273A]"
            >
              <span>{isExpanded ? 'Hide Payments' : 'View Payments'}</span>
              {isExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              title="Actions"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
            {/* Micro Action Dropdown */}
            {showMenu && (
              <div
                className="absolute top-full right-0 z-30 mt-1 w-44 rounded-xl border border-slate-200/80 bg-white p-1.5 text-left shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-[#111622]"
                onMouseLeave={() => setShowMenu(false)}
              >
                <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                  Documents
                </div>
                <Link
                  href={`/admin/payment-receipts?refId=${encodeURIComponent(docRefId)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowMenu(false)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-700 transition-colors hover:bg-sky-500/10 hover:text-sky-600 dark:text-slate-300 dark:hover:bg-sky-500/10 dark:hover:text-sky-400"
                  title="View Payment Receipts"
                >
                  <Receipt className="h-3.5 w-3.5 text-sky-500" />
                  <span>Payment Receipts</span>
                </Link>
                <Link
                  href={`/admin/allotment-records?search=${encodeURIComponent(docSearchQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowMenu(false)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-700 transition-colors hover:bg-amber-500/10 hover:text-amber-600 dark:text-slate-300 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"
                  title="View Allotment Letter Record"
                >
                  <FileText className="h-3.5 w-3.5 text-amber-500" />
                  <span>Allotment Letter</span>
                </Link>
                <Link
                  href={`/admin/bba-records?search=${encodeURIComponent(docSearchQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowMenu(false)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-700 transition-colors hover:bg-emerald-500/10 hover:text-emerald-600 dark:text-slate-300 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                  title="View BBA Agreement"
                >
                  <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
                  <span>BBA Agreement</span>
                </Link>

                <div className="my-1 border-t border-slate-100 dark:border-white/[0.08]" />

                <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                  Actions
                </div>
                {latestReceipt && onShareWhatsApp && (
                  <button
                    type="button"
                    onClick={() => {
                      onShareWhatsApp(latestReceipt);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.05] dark:hover:text-white"
                  >
                    <Share2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>WhatsApp</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onEdit(allotment);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.05] dark:hover:text-white"
                >
                  <Edit className="h-3.5 w-3.5 text-slate-400" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDelete(allotment.id);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </td>
      </tr>
      {children}
    </>
  );
}
