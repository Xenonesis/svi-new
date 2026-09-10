'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Calendar, PhoneCall, Compass, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface WorkLogItem {
  id: string;
  date: string;
  summary: string;
  client_interactions_count: number;
  site_visits_conducted_count: number;
  created_at: string;
}

interface AdminEmployeeLogsViewProps {
  employeeId: string;
  employeeName: string;
  token: string;
}

export function AdminEmployeeLogsView({
  employeeId,
  employeeName,
  token,
}: AdminEmployeeLogsViewProps) {
  const [logs, setLogs] = useState<WorkLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/employees/${employeeId}/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = (await res.json()) as { logs?: WorkLogItem[] };
        setLogs(json.logs || []);
      }
    } catch {
      toast.error('Failed to load work logs');
    } finally {
      setLoading(false);
    }
  }, [employeeId, token]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Daily Shift Work Logs</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Daily performance summaries, calls, and field site visits logged by {employeeName}.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-xs text-gray-500 dark:border-white/10">
          <FileText className="mx-auto mb-2 h-6 w-6 text-gray-400" />
          No daily shift reports submitted yet by {employeeName}.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="rounded-2xl border border-gray-200 bg-white p-4.5 shadow-xs dark:border-white/10 dark:bg-slate-900/80"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 text-xs text-gray-500 dark:border-white/5 dark:text-gray-400">
                <span className="flex items-center gap-1 font-semibold text-gray-900 dark:text-white">
                  <Calendar className="h-3.5 w-3.5 text-amber-500" />
                  {log.date}
                </span>
                <span className="font-mono text-[10px]">
                  {new Date(log.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-gray-800 dark:text-gray-200">
                {log.summary || 'Shift completed.'}
              </p>

              <div className="mt-3.5 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-2.5 text-[11px] font-semibold text-gray-600 dark:border-white/5 dark:text-gray-300">
                <span className="flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-blue-600 dark:text-blue-400">
                  <PhoneCall className="h-3 w-3" />
                  {log.client_interactions_count || 0} Calls
                </span>
                <span className="flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-0.5 text-purple-600 dark:text-purple-400">
                  <Compass className="h-3 w-3" />
                  {log.site_visits_conducted_count || 0} Visits
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
