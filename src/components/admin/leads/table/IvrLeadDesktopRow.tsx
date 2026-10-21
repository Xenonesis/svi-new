import React from 'react';
import type { IvrRecordItem } from '@/app/api/admin/leads/ivr-records/route';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';
import {
  Phone,
  Clock,
  Flame,
  Zap,
  Snowflake,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';
import { WhatsAppTemplateDropdown } from '../WhatsAppTemplateDropdown';
import { IvrRecordingButton } from './IvrRecordingButton';

interface IvrLeadDesktopRowProps {
  record: IvrRecordItem;
  isSelected: boolean;
  toggleSelectPhone: (phone: string) => void;
  setDrawerLead: (lead: {
    phone: string;
    clientName?: string;
    advisorId?: string | null;
    advisorName?: string | null;
    temperature?: 'hot' | 'warm' | 'cold';
    stage?: string;
    recordingUrl?: string | null;
  }) => void;
  employees: Employee[];
  onReassignAdvisor: (recordId: string, phone: string, advisorId: string) => void;
  onTemperatureChange: (recordId: string, phone: string, temp: 'hot' | 'warm' | 'cold') => void;
  formatDuration: (seconds: number) => string;
}

export function IvrLeadDesktopRow({
  record,
  isSelected,
  toggleSelectPhone,
  setDrawerLead,
  employees,
  onReassignAdvisor,
  onTemperatureChange,
  formatDuration,
}: IvrLeadDesktopRowProps) {
  const isAnswered = record.dial_status === 'ANSWER';
  const durationPercent = Math.min(100, Math.round((record.call_duration / 120) * 100));

  return (
                    <tr
                      key={record.id}
                      className="transition-colors hover:bg-gray-50/80 dark:hover:bg-white/[0.02]"
                    >
                      {/* Checkbox */}
                      <td className="w-10 px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectPhone(record.customer_phone)}
                          aria-label={`Select lead ${record.customer_phone}`}
                          className="accent-brand-gold h-3.5 w-3.5 rounded border-gray-300 transition-colors"
                        />
                      </td>

                      {/* Customer Phone & Quick Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setDrawerLead({
                                phone: record.customer_phone,
                                clientName: `Lead ${record.customer_phone}`,
                                advisorId: record.assigned_agent_id,
                                advisorName: record.agent_name,
                                temperature: record.temperature,
                              })
                            }
                            className="hover:text-brand-gold dark:hover:text-brand-gold font-semibold text-gray-900 transition-colors dark:text-white"
                            title="Open Lead Timeline & Notes"
                          >
                            {record.customer_phone}
                          </button>

                          <div className="flex items-center gap-1 opacity-80 hover:opacity-100">
                            <a
                              href={`tel:${record.customer_phone}`}
                              className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-emerald-600 dark:hover:bg-white/5"
                              title="Click to Call"
                            >
                              <Phone className="h-3 w-3" />
                            </a>

                            <WhatsAppTemplateDropdown
                              phone={record.customer_phone}
                              clientName={`Lead ${record.customer_phone}`}
                              advisorName={record.agent_name}
                            />

                            <button
                              type="button"
                              onClick={() =>
                                setDrawerLead({
                                  phone: record.customer_phone,
                                  clientName: `Lead ${record.customer_phone}`,
                                  advisorId: record.assigned_agent_id,
                                  advisorName: record.agent_name,
                                  temperature: record.temperature,
                                  recordingUrl: record.recording_url,
                                })
                              }
                              className="hover:text-brand-gold rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
                              title="Lead Notes & Timeline"
                            >
                              <FileText className="h-3 w-3" />
                            </button>

                            {record.recording_url && (
                              <IvrRecordingButton
                                recordingUrl={record.recording_url}
                                variant="icon"
                                meta={{
                                  customerPhone: record.customer_phone,
                                  agentName: record.agent_name,
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 1. Attended By (Original Telecaller - Permanent / Read-Only) */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-700 dark:bg-white/10 dark:text-gray-300">
                            {record.agent_name ? record.agent_name.slice(0, 1).toUpperCase() : '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                              {record.agent_name || 'Telecaller'}
                            </p>
                            {record.agent_phone && (
                              <p className="font-mono text-[10px] text-gray-400">
                                {record.agent_phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Follow-up Advisor (Assignable Lead Closer - Dropdown) */}
                      <td className="px-4 py-3.5">
                        <select
                          value={record.assigned_agent_id || ''}
                          onChange={(e) =>
                            onReassignAdvisor(record.id, record.customer_phone, e.target.value)
                          }
                          aria-label={`Follow-up advisor for ${record.customer_phone}`}
                          style={{ colorScheme: 'dark light' }}
                          className="focus:border-brand-gold rounded-lg border border-transparent bg-transparent py-1 text-xs font-medium text-gray-800 transition-colors hover:border-gray-200 focus:bg-white focus:outline-none dark:text-gray-200 dark:hover:border-white/10 dark:focus:bg-[#1a1a24] [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-[#161622] dark:[&>option]:text-white"
                        >
                          <option
                            value=""
                            className="bg-white text-gray-900 dark:bg-[#161622] dark:text-white"
                          >
                            {record.agent_name ? `${record.agent_name} (Attended)` : 'Unassigned'}
                          </option>
                          {employees.map((emp) => (
                            <option
                              key={emp.id}
                              value={emp.id}
                              className="bg-white text-gray-900 dark:bg-[#161622] dark:text-white"
                            >
                              {emp.full_name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Prominent Dial Status Badge */}
                      <td className="px-4 py-3.5">
                        {isAnswered ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3 shrink-0" />
                            Answered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/25 bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                            <XCircle className="h-3 w-3 shrink-0" />
                            Not Answered
                          </span>
                        )}
                      </td>

                      {/* Call Duration with Visual Meter */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 font-medium text-gray-800 dark:text-gray-200">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span>{formatDuration(record.call_duration)}</span>
                            <span className="text-[10px] text-gray-400">
                              ({record.call_duration}s)
                            </span>
                          </div>
                          <div className="h-1 w-20 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                            <div
                              className={`h-full rounded-full transition-all ${
                                record.call_duration >= 60
                                  ? 'bg-rose-500'
                                  : record.call_duration >= 20
                                    ? 'bg-amber-500'
                                    : 'bg-gray-400'
                              }`}
                              style={{ width: `${durationPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Pressed Key */}
                      <td className="px-4 py-3.5">
                        {record.pressed_key ? (
                          <div className="group/dtmf relative inline-flex">
                            <span
                              className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold hover:border-brand-gold/60 hover:bg-brand-gold/20 inline-flex cursor-help items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold transition-all"
                              title={`DTMF Key ${record.pressed_key}: Caller actively pressed key ${record.pressed_key} during IVR call to express interest`}
                            >
                              Key {record.pressed_key}
                            </span>

                            {/* Sleek Hover Tooltip */}
                            <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 hidden -translate-x-1/2 rounded-lg bg-gray-950/95 px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap text-white shadow-xl backdrop-blur-md transition-all group-hover/dtmf:block dark:border dark:border-white/15 dark:bg-gray-900/95">
                              <div className="text-brand-gold flex items-center gap-1.5 font-semibold">
                                <Phone className="h-3 w-3" />
                                <span>IVR Keypad Response</span>
                              </div>
                              <p className="mt-0.5 text-[10px] font-normal text-gray-300">
                                Customer pressed{' '}
                                <strong className="text-white">Key {record.pressed_key}</strong> on
                                phone
                                <br />
                                Indicating high purchase interest
                              </p>
                              {/* Little arrow */}
                              <div className="absolute top-full left-1/2 -mt-px -translate-x-1/2 border-4 border-transparent border-t-gray-950 dark:border-t-gray-900" />
                            </div>
                          </div>
                        ) : (
                          <span
                            className="text-gray-400"
                            title="No keypad button was pressed during the call"
                          >
                            —
                          </span>
                        )}
                      </td>

                      {/* Temperature with 1-Click Interactive Selector */}
                      <td className="px-4 py-3.5">
                        <select
                          value={record.temperature}
                          onChange={(e) =>
                            onTemperatureChange(
                              record.id,
                              record.customer_phone,
                              e.target.value as 'hot' | 'warm' | 'cold'
                            )
                          }
                          aria-label={`Lead temperature for ${record.customer_phone}`}
                          style={{ colorScheme: 'dark light' }}
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase transition-all focus:outline-none [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-[#161622] dark:[&>option]:text-white ${
                            record.temperature === 'hot'
                              ? 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              : record.temperature === 'warm'
                                ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          <option
                            value="hot"
                            className="bg-white text-rose-600 dark:bg-[#161622] dark:text-rose-400"
                          >
                            Hot Lead
                          </option>
                          <option
                            value="warm"
                            className="bg-white text-amber-600 dark:bg-[#161622] dark:text-amber-400"
                          >
                            Warm Lead
                          </option>
                          <option
                            value="cold"
                            className="bg-white text-blue-600 dark:bg-[#161622] dark:text-blue-400"
                          >
                            Cold Lead
                          </option>
                        </select>
                      </td>

                      {/* Timestamp */}
                      <td className="px-5 py-3.5 text-right font-mono text-[11px] text-gray-500 dark:text-gray-400">
                        {new Date(record.dial_time).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
  );
}
