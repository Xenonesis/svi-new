'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  PhoneCall,
  PhoneForwarded,
  PhoneOff,
  Flame,
  Clock,
  Search,
  ArrowUpDown,
  Download,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  Phone,
  FileSpreadsheet,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import type {
  AdvisorPerformanceMetric,
  CampaignPerformanceMetric,
} from '@/src/lib/types/telecalling';
interface DashboardSummary {
  total_calls: number;
  answered_calls: number;
  missed_calls: number;
  answer_rate: number;
  total_talk_time_sec: number;
  avg_talk_time_sec: number;
  hot_leads: number;
  key1_count: number;
  active_advisors: number;
  total_roster_count: number;
}

interface TelecallingDashboardProps {
  token?: string;
  onNavigateToLeads?: (advisorId?: string) => void;
}

function formatSeconds(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

type SortField =
  'answered_calls' | 'total_calls' | 'answer_rate' | 'total_talk_time_sec' | 'hot_leads';
type TimeRange = 'all' | 'today' | 'week' | 'month';

export function TelecallingDashboard({ token, onNavigateToLeads }: TelecallingDashboardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [leaderboard, setLeaderboard] = useState<AdvisorPerformanceMetric[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignPerformanceMetric[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('answered_calls');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const fetchDashboardData = useCallback(
    async (showRefreshAnimation = false) => {
      if (showRefreshAnimation) setIsRefreshing(true);
      else setLoading(true);

      try {
        const params = new URLSearchParams();
        if (timeRange !== 'all') params.set('timeRange', timeRange);

        const res = await fetch(`/api/admin/leads/performance?${params.toString()}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.ok) {
          const data = await res.json();
          setSummary(data.summary || null);
          setLeaderboard(data.leaderboard || []);
          setCampaigns(data.campaigns || []);
          setLastUpdated(
            new Date().toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          );
        } else {
          toast.error('Failed to load telecalling analytics');
        }
      } catch (err) {
        console.error('Error loading telecalling dashboard:', err);
        toast.error('Network error loading dashboard');
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [timeRange, token]
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Filter and sort advisors
  const filteredLeaderboard = useMemo(() => {
    return leaderboard
      .filter((advisor) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
          advisor.advisor_name.toLowerCase().includes(query) ||
          (advisor.phone && advisor.phone.includes(query))
        );
      })
      .sort((a, b) => {
        if (sortBy === 'answered_calls') {
          return b.answered_calls - a.answered_calls || b.hot_leads - a.hot_leads;
        }
        if (sortBy === 'total_calls') {
          return b.total_calls - a.total_calls;
        }
        if (sortBy === 'answer_rate') {
          return b.answer_rate - a.answer_rate || b.answered_calls - a.answered_calls;
        }
        if (sortBy === 'total_talk_time_sec') {
          return b.total_talk_time_sec - a.total_talk_time_sec;
        }
        if (sortBy === 'hot_leads') {
          return b.hot_leads - a.hot_leads;
        }
        return 0;
      });
  }, [leaderboard, searchQuery, sortBy]);
  const [showBench, setShowBench] = useState(false);

  const { activeAdvisors, benchAdvisors } = useMemo(() => {
    const active: AdvisorPerformanceMetric[] = [];
    const bench: AdvisorPerformanceMetric[] = [];

    for (const a of filteredLeaderboard) {
      if (a.total_calls > 0) {
        active.push(a);
      } else {
        bench.push(a);
      }
    }
    return { activeAdvisors: active, benchAdvisors: bench };
  }, [filteredLeaderboard]);

  const isSearching = searchQuery.trim().length > 0;

  // Export Leaderboard to Excel (.xlsx)
  const handleExportExcel = async () => {
    if (filteredLeaderboard.length === 0) {
      toast.error('No advisor performance records to export');
      return;
    }
    try {
      toast.info('Generating Excel report...');
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SVI Infra Solutions Pvt. Ltd.';
      workbook.created = new Date();
      const ws = workbook.addWorksheet('Advisor Leaderboard', {
        views: [{ showGridLines: true }],
      });

      ws.columns = [
        { header: 'Rank', key: 'rank', width: 8 },
        { header: 'Advisor Name', key: 'name', width: 22 },
        { header: 'Phone', key: 'phone', width: 16 },
        { header: 'Total Calls', key: 'total_calls', width: 14 },
        { header: 'Answered Calls', key: 'answered', width: 16 },
        { header: 'Missed Calls', key: 'missed', width: 14 },
        { header: 'Answer Rate (%)', key: 'rate', width: 16 },
        { header: 'Total Talk Time', key: 'talk_time', width: 18 },
        { header: 'Avg Call Duration', key: 'avg_time', width: 18 },
        { header: 'Hot Leads', key: 'hot', width: 14 },
        { header: 'Key 1 Presses', key: 'key1', width: 14 },
      ];

      const headerRow = ws.getRow(1);
      headerRow.height = 26;
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1A1A2E' },
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

      filteredLeaderboard.forEach((a, idx) => {
        const row = ws.addRow({
          rank: idx + 1,
          name: a.advisor_name,
          phone: a.phone || '—',
          total_calls: a.total_calls,
          answered: a.answered_calls,
          missed: a.missed_calls,
          rate: `${a.answer_rate}%`,
          talk_time: formatSeconds(a.total_talk_time_sec),
          avg_time: formatSeconds(a.avg_talk_time_sec),
          hot: a.hot_leads,
          key1: a.key1_count,
        });
        row.height = 20;
        row.alignment = { vertical: 'middle' };
        if (idx % 2 === 1) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' },
          };
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `svi-advisor-performance-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Advisor performance report exported to Excel!');
    } catch {
      toast.error('Failed to export Excel report');
    }
  };

  // Export Leaderboard to PDF (.pdf)
  const handleExportPdf = () => {
    if (filteredLeaderboard.length === 0) {
      toast.error('No advisor performance records to export');
      return;
    }
    try {
      toast.info('Generating PDF report...');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Banner
      doc.setFillColor(26, 26, 46);
      doc.rect(0, 0, pageWidth, 54, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('SVI INFRA SOLUTIONS - TELECALLING ADVISOR LEADERBOARD', 30, 34);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Date: ${new Date().toLocaleDateString('en-IN')} | Advisors: ${filteredLeaderboard.length}`,
        pageWidth - 30,
        34,
        { align: 'right' }
      );

      // Table Header
      const thY = 76;
      doc.setFillColor(243, 244, 246);
      doc.rect(30, thY - 14, pageWidth - 60, 22, 'F');
      doc.setTextColor(55, 65, 81);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');

      doc.text('Rank', 40, thY);
      doc.text('Advisor Name', 85, thY);
      doc.text('Phone', 215, thY);
      doc.text('Total Calls', 305, thY);
      doc.text('Answered', 380, thY);
      doc.text('Ans Rate', 460, thY);
      doc.text('Talk Time', 535, thY);
      doc.text('Avg Duration', 625, thY);
      doc.text('Hot Leads', 720, thY);

      let currentY = 100;
      const rowHeight = 20;

      filteredLeaderboard.forEach((a, idx) => {
        if (idx % 2 === 1) {
          doc.setFillColor(249, 250, 251);
          doc.rect(30, currentY - 13, pageWidth - 60, rowHeight, 'F');
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(31, 41, 55);

        doc.text(String(idx + 1), 40, currentY);
        doc.text(a.advisor_name.slice(0, 20), 85, currentY);
        doc.text(a.phone || '—', 215, currentY);
        doc.text(String(a.total_calls), 305, currentY);

        doc.setTextColor(5, 150, 105);
        doc.setFont('helvetica', 'bold');
        doc.text(String(a.answered_calls), 380, currentY);

        doc.text(`${a.answer_rate}%`, 460, currentY);

        doc.setTextColor(31, 41, 55);
        doc.setFont('helvetica', 'normal');
        doc.text(formatSeconds(a.total_talk_time_sec), 535, currentY);
        doc.text(formatSeconds(a.avg_talk_time_sec), 625, currentY);

        doc.setTextColor(180, 83, 9);
        doc.setFont('helvetica', 'bold');
        doc.text(String(a.hot_leads), 720, currentY);

        currentY += rowHeight;
      });

      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        'Page 1 | Confidential - SVI Infra Solutions Pvt. Ltd.',
        pageWidth / 2,
        pageHeight - 15,
        { align: 'center' }
      );

      doc.save(`svi-advisor-performance-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success('Advisor performance report exported to PDF!');
    } catch {
      toast.error('Failed to export PDF report');
    }
  };

  // Export Leaderboard to CSV
  const handleExportCsv = () => {
    if (filteredLeaderboard.length === 0) {
      toast.error('No advisor performance records to export');
      return;
    }

    const headers = [
      'Rank',
      'Advisor Name',
      'Phone',
      'Total Calls',
      'Answered Calls',
      'Missed Calls',
      'Answer Rate (%)',
      'Total Talk Time (Seconds)',
      'Avg Talk Time (Seconds)',
      'Hot Leads',
      'Key 1 Presses',
    ];

    const rows = filteredLeaderboard.map((a, idx) => [
      idx + 1,
      `"${a.advisor_name}"`,
      `"${a.phone || ''}"`,
      a.total_calls,
      a.answered_calls,
      a.missed_calls,
      a.answer_rate,
      a.total_talk_time_sec,
      a.avg_talk_time_sec,
      a.hot_leads,
      a.key1_count,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `svi-advisor-performance-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Advisor performance report exported!');
  };
  const handleAdvisorLeadsClick = (advisorId: string) => {
    if (onNavigateToLeads) {
      onNavigateToLeads(advisorId);
    } else {
      router.push(`/admin/leads?tab=ivr&advisor_id=${advisorId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header & Global Controls ── */}
      <div className="dark:to-brand-gold/[0.03] flex flex-col gap-4 rounded-3xl border border-gray-200 bg-gradient-to-br from-white via-gray-50/50 to-amber-500/[0.03] p-6 shadow-sm transition-colors duration-300 lg:flex-row lg:items-center lg:justify-between dark:border-white/5 dark:from-[#0d0d14] dark:via-[#0a0a10]">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl font-bold tracking-tight text-gray-900 sm:text-2xl dark:text-white">
                  Telecalling &amp; Conversion Command Center
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Real-time telecaller productivity, connected rates, hot lead generation &amp;
                advisor conversion rankings
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Filter Pills */}
          <div className="flex items-center rounded-xl border border-gray-200 bg-white p-1 text-xs font-semibold shadow-2xs dark:border-white/10 dark:bg-[#13131c]">
            {(
              [
                { key: 'all', label: 'All Time' },
                { key: 'today', label: 'Today' },
                { key: 'week', label: '7 Days' },
                { key: 'month', label: '30 Days' },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTimeRange(item.key)}
                className={`cursor-pointer rounded-lg px-3 py-1.5 transition-all ${
                  timeRange === item.key
                    ? 'bg-brand-navy dark:bg-brand-gold dark:text-brand-navy font-bold text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-[#13131c] dark:text-gray-300 dark:hover:bg-white/5"
            title="Refresh live metrics"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? 'text-brand-gold animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export CSV */}
          {/* Export Dropdown Suite */}
          <div className="relative" ref={exportMenuRef}>
            <button
              type="button"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold shadow-2xs transition-colors"
              title="Export advisor report (Excel, PDF, CSV)"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Report</span>
              <ChevronDown
                className={`h-3 w-3 transition-transform ${exportMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {exportMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 z-40 mt-1.5 w-48 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-[#13131c]"
                >
                  <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                    Advisor Leaderboard
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleExportExcel();
                      setExportMenuOpen(false);
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:text-gray-200 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <div className="text-left">
                      <p className="leading-tight">Excel (.xlsx)</p>
                      <span className="text-[10px] font-normal text-gray-400">
                        Formatted spreadsheet
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleExportPdf();
                      setExportMenuOpen(false);
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-gray-200 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                  >
                    <FileText className="h-4 w-4 text-red-500" />
                    <div className="text-left">
                      <p className="leading-tight">PDF Document</p>
                      <span className="text-[10px] font-normal text-gray-400">
                        Printable report
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleExportCsv();
                      setExportMenuOpen(false);
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-gray-200 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"
                  >
                    <Download className="h-4 w-4 text-amber-500" />
                    <div className="text-left">
                      <p className="leading-tight">CSV Spreadsheet</p>
                      <span className="text-[10px] font-normal text-gray-400">Universal .csv</span>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Unified Telemetry Cockpit Hero ── */}
      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-white/5 dark:bg-[#0c0f18]">
        {/* 6 High-Density Metric Columns */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {/* 1. Total Calls Handled */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5 transition-colors dark:border-white/5 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span className="text-[10px] font-bold tracking-wider uppercase">Total Calls</span>
              <div className="rounded-lg bg-blue-500/10 p-1 text-blue-500">
                <PhoneCall className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-1.5 font-mono text-2xl font-bold tracking-tight text-gray-900 tabular-nums dark:text-white">
              {summary?.total_calls.toLocaleString() || '0'}
            </div>
            <div className="mt-1 text-[10px] text-gray-500">
              <span>Volume Handled</span>
            </div>
          </div>

          {/* 2. Connected / Answered */}
          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.03] p-3.5 transition-colors dark:border-emerald-500/20 dark:bg-emerald-500/[0.04]">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="text-[10px] font-bold tracking-wider uppercase">Answered Calls</span>
              <div className="rounded-lg bg-emerald-500/15 p-1 text-emerald-500">
                <PhoneForwarded className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-1.5 font-mono text-2xl font-bold tracking-tight text-emerald-600 tabular-nums dark:text-emerald-400">
              {summary?.answered_calls.toLocaleString() || '0'}
            </div>
            <div className="mt-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              {summary?.answer_rate || 0}% Connection Rate
            </div>
          </div>

          {/* 3. Missed Calls */}
          <div className="rounded-2xl border border-rose-500/15 bg-rose-500/[0.03] p-3.5 transition-colors dark:border-rose-500/20 dark:bg-rose-500/[0.04]">
            <div className="flex items-center justify-between text-rose-500 dark:text-rose-400">
              <span className="text-[10px] font-bold tracking-wider uppercase">Missed Calls</span>
              <div className="rounded-lg bg-rose-500/15 p-1 text-rose-500">
                <PhoneOff className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-1.5 font-mono text-2xl font-bold tracking-tight text-rose-600 tabular-nums dark:text-rose-400">
              {summary?.missed_calls.toLocaleString() || '0'}
            </div>
            <div className="mt-1 text-[10px] text-gray-500">
              {summary && summary.total_calls > 0
                ? Math.round((summary.missed_calls / summary.total_calls) * 100)
                : 0}
              % Unanswered
            </div>
          </div>

          {/* 4. Total Talk Time */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5 transition-colors dark:border-white/5 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span className="text-[10px] font-bold tracking-wider uppercase">
                Total Talk Time
              </span>
              <div className="rounded-lg bg-amber-500/10 p-1 text-amber-500">
                <Clock className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="dark:text-brand-gold mt-1.5 font-mono text-2xl font-bold tracking-tight text-amber-600 tabular-nums">
              {formatSeconds(summary?.total_talk_time_sec || 0)}
            </div>
            <div className="mt-1 text-[10px] text-gray-500">
              Avg {formatSeconds(summary?.avg_talk_time_sec || 0)}/call
            </div>
          </div>

          {/* 5. Hot Leads Yield */}
          <div className="border-brand-gold/30 bg-brand-gold/[0.04] dark:border-brand-gold/25 dark:bg-brand-gold/[0.04] rounded-2xl border p-3.5 transition-colors">
            <div className="text-brand-gold flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider uppercase">Hot Leads</span>
              <div className="bg-brand-gold/20 text-brand-gold rounded-lg p-1">
                <Flame className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-brand-navy dark:text-brand-gold mt-1.5 font-mono text-2xl font-bold tracking-tight tabular-nums">
              {summary?.hot_leads.toLocaleString() || '0'}
            </div>
            <div className="text-brand-gold mt-1 text-[10px] font-medium">
              {summary?.key1_count.toLocaleString() || 0} Key 1 Pressed
            </div>
          </div>

          {/* 6. Active Advisors */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5 transition-colors dark:border-white/5 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span className="text-[10px] font-bold tracking-wider uppercase">Active Roster</span>
              <div className="rounded-lg bg-indigo-500/10 p-1 text-indigo-500">
                <Trophy className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-1.5 font-mono text-2xl font-bold tracking-tight text-gray-900 tabular-nums dark:text-white">
              {summary?.active_advisors || 0}
              <span className="text-xs font-normal text-gray-400">
                /{summary?.total_roster_count || 0}
              </span>
            </div>
            <div className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400">
              100% Tracking Active
            </div>
          </div>
        </div>

        {/* Integrated Dial Momentum Strip */}
        <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-3.5 lg:flex-row lg:items-center lg:justify-between dark:border-white/5">
          {/* Dual Segmented Progress Bar */}
          <div className="flex flex-1 items-center gap-3">
            <span className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
              Dial Pulse
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
              <div className="flex h-full w-full">
                <div
                  className="bg-emerald-500 transition-all duration-700"
                  style={{ width: `${summary?.answer_rate || 0}%` }}
                  title={`${summary?.answer_rate || 0}% Connected`}
                />
                <div
                  className="bg-rose-500/60 transition-all duration-700"
                  style={{ width: `${100 - (summary?.answer_rate || 0)}%` }}
                  title={`${100 - (summary?.answer_rate || 0)}% Missed/Unanswered`}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {summary?.answer_rate || 0}% Connected
              </span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="inline-flex items-center gap-1 font-bold text-amber-500">
                <Flame className="h-3 w-3 fill-current" />
                {summary && summary.total_calls > 0
                  ? Math.round((summary.hot_leads / summary.total_calls) * 100)
                  : 0}
                % High Intent
              </span>
            </div>
          </div>

          {/* Active Campaign & Direct Link */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs lg:justify-end">
            <span className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
              {campaigns[0]?.name || 'IVR Campaign'} &bull;{' '}
              {campaigns[0]?.total_calls.toLocaleString() || summary?.total_calls.toLocaleString()}{' '}
              calls
              {lastUpdated && <span className="text-gray-400"> &bull; Sync {lastUpdated}</span>}
            </span>
            <button
              type="button"
              onClick={() => handleAdvisorLeadsClick('')}
              className="text-brand-gold hover:text-brand-gold-light flex cursor-pointer items-center gap-1 font-bold"
            >
              <span>View All Leads &rarr;</span>
            </button>
          </div>
        </div>
      </div>
      {/* ── Advisor Performance Leaderboard Section ── */}
      <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-white/5 dark:bg-[#0f0f16]">
        {/* Controls Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
              Advisor Telecalling Leaderboard
            </h2>
            <span className="bg-brand-gold/10 text-brand-gold rounded-full px-2.5 py-0.5 text-[11px] font-bold">
              {filteredLeaderboard.length} Advisors
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search advisor..."
                className="focus:border-brand-gold dark:focus:border-brand-gold w-48 rounded-xl border border-gray-200 bg-gray-50 py-1.5 pr-3 pl-8 text-xs text-gray-900 transition-colors focus:bg-white focus:outline-hidden dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortField)}
                className="focus:border-brand-gold rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors focus:outline-hidden dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
              >
                <option value="answered_calls">Most Answered</option>
                <option value="total_calls">Most Total Calls</option>
                <option value="answer_rate">Highest Answer Rate</option>
                <option value="total_talk_time_sec">Most Talk Time</option>
                <option value="hot_leads">Most Hot Leads</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leaderboard Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-2xl border border-gray-100 bg-gray-50 dark:border-white/5 dark:bg-white/[0.02]"
              />
            ))}
          </div>
        ) : filteredLeaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Trophy className="h-10 w-10 text-gray-300 dark:text-gray-600" />
            <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              No advisors match your search
            </p>
            <p className="text-xs text-gray-400">Try adjusting your search query</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* ── Podium: Top 3 High Performers ── */}
            {activeAdvisors.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Top Performers Podium
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                  {activeAdvisors.slice(0, 3).map((advisor, index) => {
                    const rank = index + 1;
                    const isGold = rank === 1;
                    const isSilver = rank === 2;
                    const isBronze = rank === 3;

                    return (
                      <motion.div
                        key={advisor.advisor_id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className={`group relative flex flex-col justify-between rounded-2xl border p-4.5 shadow-sm transition-all duration-200 hover:shadow-md ${
                          isGold
                            ? 'border-amber-400/50 bg-gradient-to-br from-amber-500/[0.08] via-amber-500/[0.02] to-transparent dark:border-amber-400/40 dark:from-amber-500/[0.08] dark:to-[#13131c]'
                            : isSilver
                              ? 'border-slate-300/50 bg-gradient-to-br from-slate-400/[0.07] via-slate-400/[0.02] to-transparent dark:border-slate-400/30 dark:from-slate-400/[0.06] dark:to-[#13131c]'
                              : isBronze
                                ? 'border-amber-700/50 bg-gradient-to-br from-amber-700/[0.07] via-amber-700/[0.02] to-transparent dark:border-amber-700/30 dark:from-amber-700/[0.06] dark:to-[#13131c]'
                                : 'border-gray-200 bg-white dark:border-white/5 dark:bg-[#13131c]'
                        }`}
                      >
                        <div>
                          {/* Header: Rank Medal, Name, Role */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2.5">
                              {isGold ? (
                                <span className="text-brand-navy flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-xs font-black shadow-md">
                                  🥇 1
                                </span>
                              ) : isSilver ? (
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-slate-300 to-slate-100 text-xs font-black text-slate-800 shadow-md">
                                  🥈 2
                                </span>
                              ) : (
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-amber-700 to-amber-600 text-xs font-black text-white shadow-md">
                                  🥉 3
                                </span>
                              )}
                              <div className="min-w-0">
                                <h4 className="truncate text-sm font-bold text-gray-900 dark:text-white">
                                  {advisor.advisor_name}
                                </h4>
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                  <span className="capitalize">{advisor.role || 'Advisor'}</span>
                                  {advisor.phone && (
                                    <>
                                      <span>&bull;</span>
                                      <span className="font-mono">{advisor.phone}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Answer Rate Badge */}
                            {/* Answer Rate Status Capsule */}
                            <div className="flex flex-col items-end gap-1">
                              <div
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-2xs transition-colors ${
                                  advisor.answer_rate >= 50
                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                                    : advisor.answer_rate >= 30
                                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400'
                                      : 'border-gray-200 bg-gray-100 text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-400'
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    advisor.answer_rate >= 50
                                      ? 'animate-pulse bg-emerald-500'
                                      : advisor.answer_rate >= 30
                                        ? 'bg-amber-500'
                                        : 'bg-gray-400'
                                  }`}
                                />
                                <span>{advisor.answer_rate}% Ans</span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                                <span className="font-bold text-gray-900 dark:text-white">
                                  {advisor.answered_calls}
                                </span>
                                <span className="text-gray-400 dark:text-gray-600">/</span>
                                <span>{advisor.total_calls} calls</span>
                              </div>
                            </div>
                          </div>

                          {/* Connection Progress Bar */}
                          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
                            <div
                              className="from-brand-gold h-full rounded-full bg-gradient-to-r to-emerald-500 transition-all duration-500"
                              style={{ width: `${Math.min(advisor.answer_rate, 100)}%` }}
                            />
                          </div>

                          {/* Key Telemetry Grid */}
                          <div className="mt-3.5 grid grid-cols-3 gap-2 rounded-xl bg-gray-50/80 p-2.5 text-center text-xs dark:bg-white/[0.03]">
                            <div>
                              <span className="text-[10px] font-semibold text-gray-400 uppercase">
                                Talk Time
                              </span>
                              <p className="font-mono font-bold text-gray-800 tabular-nums dark:text-gray-200">
                                {formatSeconds(advisor.total_talk_time_sec)}
                              </p>
                            </div>
                            <div>
                              <span className="text-[10px] font-semibold text-gray-400 uppercase">
                                Avg / Call
                              </span>
                              <p className="font-mono font-bold text-gray-800 tabular-nums dark:text-gray-200">
                                {formatSeconds(advisor.avg_talk_time_sec)}
                              </p>
                            </div>
                            <div>
                              <span className="text-brand-gold text-[10px] font-semibold uppercase">
                                Hot Leads
                              </span>
                              <p className="text-brand-gold flex items-center justify-center gap-0.5 font-mono font-bold tabular-nums">
                                <Flame className="h-3 w-3 fill-current" />
                                {advisor.hot_leads}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action Footer */}
                        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-white/5">
                          <button
                            type="button"
                            onClick={() => handleAdvisorLeadsClick(advisor.advisor_id)}
                            className="text-brand-navy dark:text-brand-gold flex cursor-pointer items-center gap-1.5 text-xs font-bold hover:underline"
                            title="Open filtered IVR leads table for this advisor"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>View Leads ({advisor.total_calls})</span>
                          </button>

                          <div className="flex items-center gap-1">
                            {advisor.phone && (
                              <>
                                <a
                                  href={`https://wa.me/91${advisor.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                    `Hello ${advisor.advisor_name}, congratulations on your telecalling ranking! You have ${advisor.answered_calls} answered calls and ${advisor.hot_leads} hot leads.`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                                  title="Message on WhatsApp"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </a>
                                <a
                                  href={`tel:${advisor.phone}`}
                                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                                  title="Direct Call"
                                >
                                  <Phone className="h-4 w-4" />
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Active Contenders (Ranks 4+) ── */}
            {activeAdvisors.length > 3 && (
              <div className="space-y-2.5 pt-2">
                <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Active Dialing Squad
                </h3>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                  {activeAdvisors.slice(3).map((advisor, index) => {
                    const rank = index + 4;

                    return (
                      <motion.div
                        key={advisor.advisor_id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-md dark:border-white/5 dark:bg-[#13131c] dark:hover:border-white/10"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 dark:bg-white/10 dark:text-gray-300">
                                {rank}
                              </span>
                              <div className="min-w-0">
                                <h4 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                  {advisor.advisor_name}
                                </h4>
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                  <span className="capitalize">{advisor.role || 'Advisor'}</span>
                                  {advisor.phone && (
                                    <>
                                      <span>&bull;</span>
                                      <span className="font-mono">{advisor.phone}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Answer Rate Status Capsule */}
                            <div className="flex flex-col items-end gap-1">
                              <div
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-2xs transition-colors ${
                                  advisor.answer_rate >= 50
                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                                    : advisor.answer_rate >= 30
                                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400'
                                      : 'border-gray-200 bg-gray-100 text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-400'
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    advisor.answer_rate >= 50
                                      ? 'animate-pulse bg-emerald-500'
                                      : advisor.answer_rate >= 30
                                        ? 'bg-amber-500'
                                        : 'bg-gray-400'
                                  }`}
                                />
                                <span>{advisor.answer_rate}% Ans</span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                                <span className="font-bold text-gray-900 dark:text-white">
                                  {advisor.answered_calls}
                                </span>
                                <span className="text-gray-400 dark:text-gray-600">/</span>
                                <span>{advisor.total_calls} calls</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
                            <div
                              className="from-brand-gold h-full rounded-full bg-gradient-to-r to-emerald-500 transition-all duration-500"
                              style={{ width: `${Math.min(advisor.answer_rate, 100)}%` }}
                            />
                          </div>

                          <div className="mt-3.5 grid grid-cols-3 gap-2 rounded-xl bg-gray-50/70 p-2 text-center text-xs dark:bg-white/[0.02]">
                            <div>
                              <span className="text-[10px] font-semibold text-gray-400 uppercase">
                                Talk Time
                              </span>
                              <p className="font-mono font-bold text-gray-800 tabular-nums dark:text-gray-200">
                                {formatSeconds(advisor.total_talk_time_sec)}
                              </p>
                            </div>
                            <div>
                              <span className="text-[10px] font-semibold text-gray-400 uppercase">
                                Avg / Call
                              </span>
                              <p className="font-mono font-bold text-gray-800 tabular-nums dark:text-gray-200">
                                {formatSeconds(advisor.avg_talk_time_sec)}
                              </p>
                            </div>
                            <div>
                              <span className="text-brand-gold text-[10px] font-semibold uppercase">
                                Hot Leads
                              </span>
                              <p className="text-brand-gold flex items-center justify-center gap-0.5 font-mono font-bold tabular-nums">
                                <Flame className="h-3 w-3 fill-current" />
                                {advisor.hot_leads}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3.5 flex items-center justify-between border-t border-gray-100 pt-2.5 dark:border-white/5">
                          <button
                            type="button"
                            onClick={() => handleAdvisorLeadsClick(advisor.advisor_id)}
                            className="text-brand-navy dark:text-brand-gold flex cursor-pointer items-center gap-1 text-[11px] font-bold hover:underline"
                            title="Open filtered IVR leads table for this advisor"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>View Leads ({advisor.total_calls})</span>
                          </button>

                          <div className="flex items-center gap-1">
                            {advisor.phone && (
                              <>
                                <a
                                  href={`https://wa.me/91${advisor.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                    `Hello ${advisor.advisor_name}, reviewing your telecalling performance: ${advisor.answered_calls} answered calls and ${advisor.hot_leads} hot leads.`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                                  title="Message on WhatsApp"
                                >
                                  <MessageCircle className="h-3.5 w-3.5" />
                                </a>
                                <a
                                  href={`tel:${advisor.phone}`}
                                  className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                                  title="Direct Call"
                                >
                                  <Phone className="h-3.5 w-3.5" />
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Inactive Bench Drawer (0 Calls Recorded) ── */}
            {benchAdvisors.length > 0 && (
              <div className="mt-4 rounded-2xl border border-gray-200/70 bg-gray-50/50 p-4 transition-colors dark:border-white/5 dark:bg-white/[0.01]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-700 dark:bg-white/10 dark:text-gray-300">
                      {benchAdvisors.length}
                    </span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Inactive Telecallers On Bench (0 Calls Recorded)
                    </span>
                    <span className="hidden text-[11px] text-gray-400 sm:inline">
                      &bull; Ready for next campaign assignment
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowBench(!showBench)}
                    className="text-brand-gold hover:text-brand-gold-light flex cursor-pointer items-center gap-1.5 text-xs font-bold"
                  >
                    <span>
                      {showBench || isSearching
                        ? 'Collapse Bench'
                        : `Show Inactive Staff (${benchAdvisors.length})`}
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${
                        showBench || isSearching ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                {(showBench || isSearching) && (
                  <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                    {benchAdvisors.map((advisor) => (
                      <div
                        key={advisor.advisor_id}
                        className="flex items-center justify-between rounded-xl border border-gray-200/60 bg-white p-3 shadow-2xs transition-colors dark:border-white/5 dark:bg-[#13131c]"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                            {advisor.advisor_name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                            <span className="capitalize">{advisor.role || 'Advisor'}</span>
                            {advisor.phone && (
                              <>
                                <span>&bull;</span>
                                <span className="font-mono">{advisor.phone}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {advisor.phone && (
                            <>
                              <a
                                href={`https://wa.me/91${advisor.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                  `Hello ${advisor.advisor_name}, checking your telecalling campaign assignment status.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                                title="Message on WhatsApp"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                              </a>
                              <a
                                href={`tel:${advisor.phone}`}
                                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                                title="Direct Call"
                              >
                                <Phone className="h-3.5 w-3.5" />
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
