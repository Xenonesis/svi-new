'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Search, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';

import { ExportLeadsModal } from '@/src/components/admin/leads/ExportLeadsModal';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';
import type {
  AdvisorPerformanceMetric,
  CampaignPerformanceMetric,
  DashboardSummary,
  SortField,
  TimeRange,
} from '@/src/lib/types/telecalling';
import { formatSeconds } from '@/src/lib/types/telecalling';

import { TelecallingDashboardToolbar } from './dashboard/TelecallingDashboardToolbar';
import { TelecallingCockpitHero } from './dashboard/TelecallingCockpitHero';
import { AdvisorPodiumCard } from './dashboard/AdvisorPodiumCard';
import { AdvisorContenderCard } from './dashboard/AdvisorContenderCard';
import { TelecallingBenchDrawer } from './dashboard/TelecallingBenchDrawer';

export interface TelecallingDashboardProps {
  token?: string;
  onNavigateToLeads?: (advisorId?: string) => void;
}

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
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedExportAdvisor, setSelectedExportAdvisor] = useState<string>('all');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const employeesLoadedRef = useRef(false);

  // 60-second in-memory dashboard cache for 0ms instant tab switching
  const dashboardCacheRef = useRef<
    Map<
      string,
      {
        summary: DashboardSummary | null;
        leaderboard: AdvisorPerformanceMetric[];
        campaigns: CampaignPerformanceMetric[];
        lastUpdated: string;
        timestamp: number;
      }
    >
  >(new Map());

  useEffect(() => {
    if (!token || employeesLoadedRef.current) return;
    fetch('/api/admin/employees', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.employees) {
          setEmployees(data.employees);
          employeesLoadedRef.current = true;
        }
      })
      .catch(() => {});
  }, [token]);

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
      const cached = dashboardCacheRef.current.get(timeRange);
      const now = Date.now();

      // Return instant cached data if available and fresh (<60s)
      if (!showRefreshAnimation && cached && now - cached.timestamp < 60_000) {
        setSummary(cached.summary);
        setLeaderboard(cached.leaderboard);
        setCampaigns(cached.campaigns);
        setLastUpdated(cached.lastUpdated);
        setLoading(false);
        return;
      }

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
          const nextSummary = data.summary || null;
          const nextLeaderboard = data.leaderboard || [];
          const nextCampaigns = data.campaigns || [];
          const nextTime = new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });

          setSummary(nextSummary);
          setLeaderboard(nextLeaderboard);
          setCampaigns(nextCampaigns);
          setLastUpdated(nextTime);

          dashboardCacheRef.current.set(timeRange, {
            summary: nextSummary,
            leaderboard: nextLeaderboard,
            campaigns: nextCampaigns,
            lastUpdated: nextTime,
            timestamp: now,
          });
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
      const ExcelJS = (await import('exceljs')).default;
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
  const handleExportPdf = async () => {
    if (filteredLeaderboard.length === 0) {
      toast.error('No advisor performance records to export');
      return;
    }
    try {
      toast.info('Generating PDF report...');
      const { jsPDF } = await import('jspdf');
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
      <TelecallingDashboardToolbar
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        fetchDashboardData={fetchDashboardData}
        isRefreshing={isRefreshing}
        exportMenuRef={exportMenuRef}
        exportMenuOpen={exportMenuOpen}
        setExportMenuOpen={setExportMenuOpen}
        setSelectedExportAdvisor={setSelectedExportAdvisor}
        setIsExportModalOpen={setIsExportModalOpen}
        handleExportExcel={handleExportExcel}
        handleExportPdf={handleExportPdf}
        handleExportCsv={handleExportCsv}
      />

      {/* ── Unified Telemetry Cockpit Hero ── */}
      <TelecallingCockpitHero
        summary={summary}
        campaigns={campaigns}
        lastUpdated={lastUpdated}
        handleAdvisorLeadsClick={handleAdvisorLeadsClick}
      />

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
                style={{ colorScheme: 'dark light' }}
                className="focus:border-brand-gold rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors focus:outline-hidden dark:border-white/10 dark:bg-white/5 dark:text-gray-200 [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-[#161D2C] dark:[&>option]:text-white"
              >
                <option
                  value="answered_calls"
                  className="bg-white text-gray-900 dark:bg-[#161D2C] dark:text-white"
                >
                  Most Answered
                </option>
                <option
                  value="total_calls"
                  className="bg-white text-gray-900 dark:bg-[#161D2C] dark:text-white"
                >
                  Most Total Calls
                </option>
                <option
                  value="answer_rate"
                  className="bg-white text-gray-900 dark:bg-[#161D2C] dark:text-white"
                >
                  Highest Answer Rate
                </option>
                <option
                  value="total_talk_time_sec"
                  className="bg-white text-gray-900 dark:bg-[#161D2C] dark:text-white"
                >
                  Most Talk Time
                </option>
                <option
                  value="hot_leads"
                  className="bg-white text-gray-900 dark:bg-[#161D2C] dark:text-white"
                >
                  Most Hot Leads
                </option>
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
                  {activeAdvisors.slice(0, 3).map((advisor, index) => (
                    <AdvisorPodiumCard
                      key={advisor.advisor_id}
                      advisor={advisor}
                      index={index}
                      handleAdvisorLeadsClick={handleAdvisorLeadsClick}
                      setSelectedExportAdvisor={setSelectedExportAdvisor}
                      setIsExportModalOpen={setIsExportModalOpen}
                    />
                  ))}
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
                  {activeAdvisors.slice(3).map((advisor, index) => (
                    <AdvisorContenderCard
                      key={advisor.advisor_id}
                      advisor={advisor}
                      index={index}
                      handleAdvisorLeadsClick={handleAdvisorLeadsClick}
                      setSelectedExportAdvisor={setSelectedExportAdvisor}
                      setIsExportModalOpen={setIsExportModalOpen}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Inactive Bench Drawer (0 Calls Recorded) ── */}
            <TelecallingBenchDrawer
              benchAdvisors={benchAdvisors}
              showBench={showBench}
              setShowBench={setShowBench}
              isSearching={isSearching}
            />
          </div>
        )}
      </div>

      {/* Export Studio Modal */}
      <ExportLeadsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        token={token}
        employees={
          employees.length > 0
            ? employees
            : leaderboard.map((a) => ({ id: a.advisor_id, full_name: a.advisor_name }))
        }
        currentRecords={[]}
        totalRecordsCount={summary?.total_calls || 0}
        currentFilters={{
          advisor_id: selectedExportAdvisor,
          dial_status: 'all',
        }}
      />
    </div>
  );
}
