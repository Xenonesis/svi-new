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

interface IvrLeadMobileCardProps {
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
  onTemperatureChange: (recordId: string, phone: string, temp: 'hot' | 'warm' | 'cold') => void;
  employees: Employee[];
  onReassignAdvisor: (recordId: string, phone: string, advisorId: string) => void;
  formatDuration: (seconds: number) => string;
}

export function IvrLeadMobileCard({
  record,
  isSelected,
  toggleSelectPhone,
  setDrawerLead,
  onTemperatureChange,
  employees,
  onReassignAdvisor,
  formatDuration,
}: IvrLeadMobileCardProps) {
  const isAnswered = record.dial_status === 'ANSWER';
  const durationPercent = Math.min(100, Math.round((record.call_duration / 120) * 100));

  return (
                <div
                  key={`card-${record.id}`}
                  className={`p-4 transition-colors ${
                    isSelected
                      ? 'bg-amber-50/50 dark:bg-amber-500/[0.04]'
                      : 'hover:bg-gray-50/60 dark:hover:bg-white/[0.01]'
                  }`}
                >
                  {/* Top Bar: Checkbox + Phone + Status & Temperature Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectPhone(record.customer_phone)}
                        aria-label={`Select lead ${record.customer_phone}`}
                        className="accent-brand-gold h-4 w-4 rounded border-gray-300 transition-colors"
                      />
                      <div>
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
                          className="hover:text-brand-gold dark:hover:text-brand-gold text-left font-mono text-sm font-bold text-gray-900 transition-colors dark:text-white"
                        >
                          {record.customer_phone}
                        </button>
                        <p className="font-mono text-[10px] text-gray-400">
                          {new Date(record.dial_time).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {/* Dial Status Badge */}
                      {isAnswered ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-2.5 w-2.5 shrink-0" />
                          Answered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/25 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                          <XCircle className="h-2.5 w-2.5 shrink-0" />
                          Missed
                        </span>
                      )}

                      {/* Temperature Dropdown */}
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
                        className={`rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase transition-all focus:outline-none [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-[#161622] dark:[&>option]:text-white ${
                          record.temperature === 'hot'
                            ? 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : record.temperature === 'warm'
                              ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        <option value="hot">HOT</option>
                        <option value="warm">WARM</option>
                        <option value="cold">COLD</option>
                      </select>
                    </div>
                  </div>

                  {/* Metrics Row: Duration + DTMF Key */}
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-gray-50/80 px-3 py-2 text-xs dark:bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {formatDuration(record.call_duration)}
                      </span>
                      <span className="text-[10px] text-gray-400">({record.call_duration}s)</span>
                      {record.recording_url && (
                        <IvrRecordingButton
                          recordingUrl={record.recording_url}
                          variant="pill"
                          title="Listen to Call Recording"
                          meta={{
                            customerPhone: record.customer_phone,
                            agentName: record.agent_name,
                          }}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {record.pressed_key ? (
                        <span className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold">
                          Key {record.pressed_key}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">No Keypad Response</span>
                      )}
                    </div>
                  </div>

                  {/* Advisor Assignment */}
                  <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[9px] font-bold text-gray-700 dark:bg-white/10 dark:text-gray-300">
                        {record.agent_name ? record.agent_name.slice(0, 1).toUpperCase() : '?'}
                      </div>
                      <span className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                        Attended:{' '}
                        <strong className="text-gray-800 dark:text-gray-200">
                          {record.agent_name || 'Telecaller'}
                        </strong>
                      </span>
                    </div>

                    <select
                      value={record.assigned_agent_id || ''}
                      onChange={(e) =>
                        onReassignAdvisor(record.id, record.customer_phone, e.target.value)
                      }
                      aria-label={`Follow-up advisor for ${record.customer_phone}`}
                      style={{ colorScheme: 'dark light' }}
                      className="focus:border-brand-gold rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-800 transition-colors focus:outline-none dark:border-white/10 dark:bg-[#161622] dark:text-gray-200 [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-[#161622] dark:[&>option]:text-white"
                    >
                      <option value="">
                        {record.agent_name ? `${record.agent_name} (Attended)` : 'Unassigned'}
                      </option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Action Bar (Minimum 44px Touch Targets) */}
                  <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3 dark:border-white/5">
                    <a
                      href={`tel:${record.customer_phone}`}
                      className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-700 transition-all active:scale-95 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>Call</span>
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
                        })
                      }
                      className="hover:border-brand-gold/40 hover:text-brand-gold flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 transition-all active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
                      title="Lead Notes & Timeline"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Notes</span>
                    </button>
                  </div>
                </div>
  );
}
