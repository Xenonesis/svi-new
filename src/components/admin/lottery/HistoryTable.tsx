import { useState } from 'react';
import { Award, Eye, Edit2, Mail, RefreshCw, Trash2, ChevronDown } from 'lucide-react';
import type { Lottery } from './types';

interface HistoryTableProps {
  lotteries: Lottery[];
  isPending: boolean;
  onViewParticipants: (lottery: Lottery) => void;
  onEditCampaign: (lottery: Lottery) => void;
  onEmailParticipants: (lottery: Lottery) => void;
  onResetDraw: (lotteryId: string) => void;
  onDelete: (lotteryId: string) => void;
  onStatusChange?: (lotteryId: string, newStatus: 'active' | 'completed' | 'inactive') => void;
}

export function HistoryTable({
  lotteries,
  isPending,
  onViewParticipants,
  onEditCampaign,
  onEmailParticipants,
  onResetDraw,
  onDelete,
  onStatusChange,
}: HistoryTableProps) {
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  if (!lotteries || lotteries.length === 0) {
    return (
      <div className="space-y-6">
        <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
          Archive & History
        </h3>
        <div className="dark:bg-brand-dark-surface/60 rounded-3xl border border-slate-200 bg-white p-12 text-center backdrop-blur-md dark:border-white/10">
          <p className="text-sm text-slate-400 italic dark:text-gray-500">No archived campaigns.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
        Archive & History
      </h3>
      <div className="dark:bg-brand-dark-surface/60 overflow-hidden rounded-3xl border border-slate-200 bg-white backdrop-blur-md dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-gray-300">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold tracking-widest text-slate-500 uppercase dark:border-white/10 dark:bg-black/40 dark:text-gray-400">
              <tr>
                <th className="px-8 py-5">Campaign Name</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Winner Details</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {lotteries.map((l: any) => (
                <tr
                  key={l.id}
                  className="transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  <td className="px-8 py-5 font-bold text-slate-900 dark:text-white">{l.title}</td>
                  <td className="px-8 py-5 text-slate-500 dark:text-gray-400">
                    {new Date(l.created_at).toLocaleDateString()}
                  </td>
                  <td className="relative px-8 py-5">
                    <button
                      onClick={() => setActiveDropdownId(activeDropdownId === l.id ? null : l.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold tracking-wider uppercase transition-all hover:opacity-85 ${
                        l.status === 'active'
                          ? 'border-green-200 bg-green-50 text-green-600 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400'
                          : l.status === 'completed'
                            ? 'border-brand-gold/30 bg-brand-gold/10 text-brand-gold dark:bg-brand-gold/5'
                            : 'border-slate-200 bg-slate-100 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400'
                      }`}
                    >
                      {l.status}
                      <ChevronDown className="h-3 w-3 opacity-60" />
                    </button>

                    {activeDropdownId === l.id && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setActiveDropdownId(null)}
                        />
                        <div className="absolute left-8 z-40 mt-1 w-32 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-white/10 dark:bg-[#0c0c12]">
                          {(['active', 'inactive', 'completed'] as const).map((status) => (
                            <button
                              key={status}
                              onClick={() => {
                                onStatusChange?.(l.id, status);
                                setActiveDropdownId(null);
                              }}
                              className={`flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left text-xs font-bold capitalize transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${
                                l.status === status
                                  ? 'text-brand-gold bg-brand-gold/5 font-extrabold'
                                  : 'text-slate-600 dark:text-gray-400'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    {l.winners && l.winners.length > 0 ? (
                      <div className="custom-scrollbar max-h-28 min-w-[200px] space-y-2.5 overflow-y-auto pr-1">
                        {l.winners.map((w: any, idx: number) => (
                          <div
                            key={idx}
                            className="border-b border-slate-100 pb-1.5 last:border-0 last:pb-0 dark:border-white/5"
                          >
                            <div className="text-brand-gold flex items-center gap-1.5 text-xs font-bold">
                              <Award className="h-3.5 w-3.5 shrink-0" />{' '}
                              <span className="truncate">{w.name}</span>
                            </div>
                            <div className="mt-0.5 pl-5 font-mono text-[9px] text-slate-500 dark:text-gray-400">
                              Ticket: {w.ticket_number}
                            </div>
                            {w.id && (
                              <div className="mt-0.5 flex items-center gap-1.5 pl-5 font-mono text-[8px] text-slate-400 dark:text-slate-500">
                                <span>ID: {w.id.substring(0, 8)}...</span>
                                <button
                                  onClick={() => navigator.clipboard.writeText(w.id)}
                                  className="py-0.2 cursor-pointer rounded bg-slate-100 px-1 text-[8px] transition-colors hover:bg-slate-200 active:scale-95 dark:bg-white/5 dark:hover:bg-white/10"
                                  title="Copy Full ID"
                                >
                                  Copy
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : l.winner ? (
                      <div>
                        <div className="text-brand-gold flex items-center gap-1.5 text-xs font-bold">
                          <Award className="h-3.5 w-3.5 shrink-0" /> {l.winner.name}
                        </div>
                        <div className="mt-1 font-mono text-[9px] text-slate-500 dark:text-gray-500">
                          Ticket: {l.winner.ticket_number}
                        </div>
                        {l.winner.id && (
                          <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[8px] text-slate-400 dark:text-slate-500">
                            <span>ID: {l.winner.id.substring(0, 8)}...</span>
                            <button
                              onClick={() => navigator.clipboard.writeText(l.winner.id)}
                              className="py-0.2 cursor-pointer rounded bg-slate-100 px-1 text-[8px] transition-colors hover:bg-slate-200 active:scale-95 dark:bg-white/5 dark:hover:bg-white/10"
                              title="Copy Full ID"
                            >
                              Copy
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic dark:text-gray-500">
                        Pending Draw
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        title="View Participants"
                        onClick={() => onViewParticipants(l)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-blue-400/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">View</span>
                      </button>
                      <button
                        title="Edit Campaign"
                        onClick={() => onEditCampaign(l)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-violet-400/40 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        title="Send Email to Participants"
                        onClick={() => onEmailParticipants(l)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-amber-400/40 dark:hover:bg-amber-500/10 dark:hover:text-amber-300"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Email</span>
                      </button>
                      <button
                        title="Reset Draw"
                        onClick={() => onResetDraw(l.id)}
                        disabled={isPending}
                        className="hover:border-brand-gold/40 hover:bg-brand-gold/10 hover:text-brand-gold inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition-all dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Reset Draw</span>
                      </button>
                      <button
                        title="Delete Campaign"
                        onClick={() => onDelete(l.id)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-500 transition-all hover:border-red-400 hover:bg-red-500 hover:text-white dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.25);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.45);
        }
      `}</style>
    </div>
  );
}
