'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Copy,
  CheckCircle2,
  MessageSquare,
  PhoneCall,
  Send,
  Pencil,
  Trash2,
  KeyRound,
  BarChart3,
  Clock,
  UserCircle2,
  Mail,
  Phone,
  Briefcase,
  Target,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Employee } from './EmployeeCard';
import { getSviEmail, getWhatsAppUrl } from './EmployeeCard';
import type { EmployeeLiveStatus } from '@/src/lib/supabase/types';

interface EmployeeTableViewProps {
  employees: Employee[];
  liveStatusMap: Map<string, EmployeeLiveStatus>;
  onEdit: (emp: Employee) => void;
  onDelete: (id: string) => void;
  onResetPassword: (emp: Employee) => void;
  onViewPerformance: (emp: Employee) => void;
}

export function EmployeeTableView({
  employees,
  liveStatusMap,
  onEdit,
  onDelete,
  onResetPassword,
  onViewPerformance,
}: EmployeeTableViewProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} copied`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (employees.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
        <UserCircle2 className="mx-auto mb-3 h-12 w-12 text-gray-400 dark:text-gray-600" />
        <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">
          No employees found
        </h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Try adjusting your search terms or filter settings.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white/80 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#111118]/80">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
          {/* Table Header */}
          <thead className="border-b border-gray-200 bg-gray-50/90 text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-400">
            <tr>
              <th scope="col" className="px-5 py-4">
                Employee
              </th>
              <th scope="col" className="px-4 py-4">
                ID / Joined
              </th>
              <th scope="col" className="px-4 py-4">
                Communication & Phone
              </th>
              <th scope="col" className="px-4 py-4">
                Live Status
              </th>
              <th scope="col" className="px-4 py-4">
                Performance
              </th>
              <th scope="col" className="px-4 py-4 text-right">
                Actions
              </th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {employees.map((emp) => {
              const live = liveStatusMap.get(emp.id);
              const sviEmail = getSviEmail(emp);
              const idCopyKey = `id-${emp.id}`;
              const emailCopyKey = `email-${emp.id}`;
              const phoneCopyKey = `phone-${emp.id}`;

              return (
                <tr
                  key={emp.id}
                  className="group transition-colors hover:bg-gray-50/80 dark:hover:bg-white/[0.02]"
                >
                  {/* Column 1: Employee Name & Emails */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="bg-brand-gold/10 text-brand-gold flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-serif text-sm font-bold">
                        {emp.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-semibold text-gray-900 dark:text-white">
                            {emp.full_name}
                          </p>
                          <span className="inline-flex items-center gap-1 rounded border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-700 dark:text-amber-300">
                            <Briefcase size={9} />
                            <span>{emp.department || 'Sales & Operations'}</span>
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px]">
                          <span
                            className="text-brand-gold truncate font-mono font-medium"
                            title={sviEmail}
                          >
                            {sviEmail}
                          </span>
                          <span className="rounded bg-amber-500/10 px-1 py-0.5 text-[9px] font-bold text-amber-600 uppercase dark:bg-amber-400/15 dark:text-amber-300">
                            SVI
                          </span>
                          <button
                            onClick={() => handleCopy(sviEmail, 'SVI Email', emailCopyKey)}
                            className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
                            title="Copy SVI Email"
                          >
                            {copiedKey === emailCopyKey ? (
                              <CheckCircle2 size={11} className="text-emerald-500" />
                            ) : (
                              <Copy size={11} />
                            )}
                          </button>
                        </div>
                        {emp.real_email &&
                          emp.real_email.toLowerCase() !== sviEmail.toLowerCase() && (
                            <p
                              className="mt-0.5 truncate text-[10px] text-gray-400"
                              title={emp.real_email}
                            >
                              Personal: {emp.real_email}
                            </p>
                          )}
                      </div>
                    </div>
                  </td>

                  {/* Column 2: ID & Joined */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="font-mono text-[11px] font-bold text-gray-600 select-all dark:text-gray-400"
                        title={emp.id}
                      >
                        {emp.id}
                      </span>
                      <button
                        onClick={() => handleCopy(emp.id, 'Employee ID', idCopyKey)}
                        className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
                        title="Copy Full ID"
                      >
                        {copiedKey === idCopyKey ? (
                          <CheckCircle2 size={11} className="text-emerald-500" />
                        ) : (
                          <Copy size={11} />
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                      {emp.created_at ? format(new Date(emp.created_at), 'dd MMM yyyy') : '-'}
                    </p>
                  </td>

                  {/* Column 3: Communication & Phone */}
                  <td className="px-4 py-3.5">
                    {emp.phone ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-gray-700 dark:text-gray-300">
                          <Phone size={12} className="text-gray-400" />
                          <span>{emp.phone}</span>
                          <button
                            onClick={() => handleCopy(emp.phone!, 'Phone Number', phoneCopyKey)}
                            className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
                            title="Copy Phone"
                          >
                            {copiedKey === phoneCopyKey ? (
                              <CheckCircle2 size={11} className="text-emerald-500" />
                            ) : (
                              <Copy size={11} />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <a
                            href={getWhatsAppUrl(emp.phone, emp.full_name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400"
                            title="WhatsApp Chat"
                          >
                            <MessageSquare size={10} />
                            <span>WhatsApp</span>
                          </a>
                          <a
                            href={`tel:${emp.phone}`}
                            className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 transition-colors hover:bg-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400"
                            title="Call"
                          >
                            <PhoneCall size={10} />
                            <span>Call</span>
                          </a>
                          <a
                            href={`mailto:${sviEmail}`}
                            className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 transition-colors hover:bg-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400"
                            title="Email"
                          >
                            <Send size={10} />
                            <span>Email</span>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  {/* Column 4: Live Status */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {!live || live.status === 'not_punched' ? (
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        <span>Not Checked In</span>
                      </div>
                    ) : live.status === 'punched_in' ? (
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        <span>
                          Punched In
                          {live.punch_in_time ? (
                            <span className="font-normal opacity-90">
                              {' '}
                              ({format(new Date(live.punch_in_time), 'hh:mm a')})
                            </span>
                          ) : null}
                        </span>
                        {live.is_late && (
                          <span className="py-0.2 rounded bg-amber-500/20 px-1 text-[9px] font-bold text-amber-700 uppercase dark:text-amber-300">
                            Late
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        <span>
                          Punched Out
                          {live.punch_out_time ? (
                            <span className="opacity-90">
                              {' '}
                              ({format(new Date(live.punch_out_time), 'hh:mm a')})
                            </span>
                          ) : null}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Column 5: Performance & Mini KPIs */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-900 dark:text-white">
                        <Target size={12} className="shrink-0 text-blue-500" />
                        <span>{emp.stats?.activeLeads ?? 0} Active</span>
                        <span className="text-[10px] font-normal text-gray-500">
                          ({emp.stats?.wonLeads ?? 0} Won)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <TrendingUp size={12} className="shrink-0" />
                        <span>{emp.stats?.attendanceRate ?? 100}% Att.</span>
                        <span className="text-[10px] font-normal text-gray-500">
                          ({emp.stats?.presentDays ?? 0}d)
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Column 6: Actions */}
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => onViewPerformance(emp)}
                        className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-700 transition-colors hover:bg-amber-500/20 active:scale-95 dark:text-amber-300"
                        title="Performance Dashboard"
                      >
                        <BarChart3 size={12} />
                        <span>Performance</span>
                      </button>
                      <button
                        onClick={() => onEdit(emp)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"
                        title="Edit Employee"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => onResetPassword(emp)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
                        title="Reset Password"
                      >
                        <KeyRound size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(emp.id)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                        title="Delete Employee"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
