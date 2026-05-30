'use client';

import { useEffect, useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  Trash2,
  Play,
  RefreshCw,
  Plus,
  Search,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Eye,
  EyeOff,
  Globe,
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase/client';
import ExcelJS from 'exceljs';
import { useAdminSession } from '@/src/components/admin/AdminSessionProvider';

interface Participant {
  name: string;
  phone?: string;
  email?: string;
  ticketNumber: string;
}

interface Lottery {
  id: string;
  title: string;
  description: string | null;
  status: 'active' | 'completed' | 'inactive';
  created_at: string;
  winner?: {
    name: string;
    ticket_number: string;
    phone?: string;
    email?: string;
  } | null;
}

export default function AdminLotteryPage() {
  const { token } = useAdminSession();
  const [isPending, startTransition] = useTransition();

  // Active views: 'list' (dashboard/history), 'create' (upload/preview), 'draw' (run live draw)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'active-draw'>('dashboard');

  // New Lottery Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Manual entry form states
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualTicket, setManualTicket] = useState('');
  const [entryMethod, setEntryMethod] = useState<'upload' | 'manual'>('upload');
  const [showInlineManualForm, setShowInlineManualForm] = useState(false);

  // Pagination for parsed data
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // DB States
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [activeLottery, setActiveLottery] = useState<Lottery | null>(null);
  const [activeParticipantsCount, setActiveParticipantsCount] = useState(0);
  const [activeWinners, setActiveWinners] = useState<any[]>([]);

  // Messages/Status
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Lottery page visibility toggle
  const [lotteryVisible, setLotteryVisible] = useState(false);
  const [visibilityLoading, setVisibilityLoading] = useState(true);
  const [visibilityPending, setVisibilityPending] = useState(false);

  // Fetch initial data from DB
  useEffect(() => {
    fetchLotteries();
    fetchLotteryVisibility();
  }, []);

  const fetchLotteryVisibility = async () => {
    try {
      const { data, error } = await supabase
        .from('portal_settings')
        .select('value')
        .eq('key', 'lottery_page_visible')
        .maybeSingle();

      if (!error && data) {
        setLotteryVisible(data.value === true);
      } else {
        setLotteryVisible(false);
      }
    } catch {
      setLotteryVisible(false);
    } finally {
      setVisibilityLoading(false);
    }
  };

  const toggleLotteryVisibility = async (newValue: boolean) => {
    setVisibilityPending(true);
    try {
      const { error } = await supabase
        .from('portal_settings')
        .upsert({ key: 'lottery_page_visible', value: newValue }, { onConflict: 'key' });

      if (error) throw error;
      setLotteryVisible(newValue);
      setSuccessMessage(
        newValue
          ? '✅ Lottery page is now VISIBLE on the public site and navbar.'
          : '🔒 Lottery page is now HIDDEN from the public site and navbar.'
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update lottery visibility.');
    } finally {
      setVisibilityPending(false);
    }
  };

  const fetchLotteries = async () => {
    try {
      // 1. Fetch all lotteries
      const { data: lotteriesData, error: lError } = await supabase
        .from('lotteries')
        .select('*')
        .order('created_at', { ascending: false });

      if (lError) throw lError;

      // 2. Fetch winners for completed lotteries
      const { data: participantsData, error: pError } = await supabase
        .from('lottery_participants')
        .select('*')
        .eq('is_winner', true);

      if (pError) throw pError;

      const formattedLotteries: Lottery[] = (lotteriesData || []).map((l) => {
        const winner = participantsData?.find((p) => p.lottery_id === l.id);
        return {
          id: l.id,
          title: l.title,
          description: l.description,
          status: l.status,
          created_at: l.created_at,
          winner: winner
            ? {
                name: winner.name,
                ticket_number: winner.ticket_number,
                phone: winner.phone,
                email: winner.email,
              }
            : null,
        };
      });

      setLotteries(formattedLotteries);

      // Find active lottery
      const active = formattedLotteries.find((l) => l.status === 'active');
      if (active) {
        setActiveLottery(active);
        // Fetch count of participants for the active lottery
        const { count, error: cError } = await supabase
          .from('lottery_participants')
          .select('*', { count: 'exact', head: true })
          .eq('lottery_id', active.id);

        if (!cError) {
          setActiveParticipantsCount(count || 0);
        }

        // Fetch winners if any are already drawn
        const { data: activeWinnersData, error: wError } = await supabase
          .from('lottery_participants')
          .select('*')
          .eq('lottery_id', active.id)
          .eq('is_winner', true);

        if (!wError) {
          setActiveWinners(activeWinnersData || []);
        }
      } else {
        setActiveLottery(null);
        setActiveParticipantsCount(0);
        setActiveWinners([]);
      }
    } catch (error: any) {
      console.error('Error fetching lottery data:', error);
      setErrorMessage(error.message || 'Failed to load lottery data.');
    }
  };

  // CSV/Excel drag & drop/upload handler
  const handleFileUpload = (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const reader = new FileReader();

    if (file.name.endsWith('.csv')) {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        parseCSVData(text);
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.onload = async (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(buffer);
          const worksheet = workbook.worksheets[0];
          if (!worksheet) {
            setErrorMessage('No worksheets found in the uploaded file.');
            return;
          }
          const jsonData: any[][] = [];
          worksheet.eachRow((row) => {
            const rowData: any[] = [];
            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
              rowData[colNumber - 1] = cell.value;
            });
            jsonData.push(rowData);
          });
          parseExcelData(jsonData);
        } catch (error) {
          setErrorMessage('Error reading Excel file. Make sure it is not corrupted.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setErrorMessage('Please upload only .csv, .xlsx, or .xls spreadsheet files.');
    }
  };

  const parseCSVData = (text: string) => {
    try {
      const lines = text.split(/\r?\n/);
      if (lines.length === 0 || !lines[0].trim()) {
        setErrorMessage('Uploaded file is empty.');
        return;
      }

      // Simple CSV header parse
      const headers = lines[0].split(',').map((h) =>
        h
          .trim()
          .replace(/^["']|["']$/g, '')
          .toLowerCase()
      );

      const nameIdx = headers.findIndex(
        (h) => h.includes('name') || h.includes('customer') || h.includes('client')
      );
      const phoneIdx = headers.findIndex(
        (h) => h.includes('phone') || h.includes('mobile') || h.includes('contact')
      );
      const emailIdx = headers.findIndex((h) => h.includes('email') || h.includes('mail'));
      const ticketIdx = headers.findIndex(
        (h) => h.includes('ticket') || h.includes('token') || h.includes('number')
      );

      if (nameIdx === -1) {
        setErrorMessage('Could not find a column named "Name" in the CSV header.');
        return;
      }

      const parsed: Participant[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Custom split that respects commas inside quotes
        const cols = line
          .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
          .map((c) => c.trim().replace(/^["']|["']$/g, ''));

        const name = cols[nameIdx];
        if (!name) continue;

        const phone = phoneIdx !== -1 ? cols[phoneIdx] : undefined;
        const email = emailIdx !== -1 ? cols[emailIdx] : undefined;
        const ticketNumber =
          ticketIdx !== -1 && cols[ticketIdx] ? cols[ticketIdx] : `SVI-${1000 + parsed.length + 1}`;

        parsed.push({ name, phone, email, ticketNumber });
      }

      setParticipants(parsed);
      setCurrentPage(1);
      setSuccessMessage(`Successfully loaded ${parsed.length} rows from CSV!`);
    } catch (err) {
      setErrorMessage('Failed to parse CSV file. Please verify CSV formatting.');
    }
  };

  const parseExcelData = (sheets: any[]) => {
    try {
      if (sheets.length === 0) {
        setErrorMessage('Spreadsheet is empty.');
        return;
      }

      const headers = sheets[0].map((h: any) => String(h).trim().toLowerCase());
      const nameIdx = headers.findIndex(
        (h: string) => h.includes('name') || h.includes('customer') || h.includes('client')
      );
      const phoneIdx = headers.findIndex(
        (h: string) => h.includes('phone') || h.includes('mobile') || h.includes('contact')
      );
      const emailIdx = headers.findIndex((h: string) => h.includes('email') || h.includes('mail'));
      const ticketIdx = headers.findIndex(
        (h: string) => h.includes('ticket') || h.includes('token') || h.includes('number')
      );

      if (nameIdx === -1) {
        setErrorMessage('Could not find a column named "Name" in the Excel headers.');
        return;
      }

      const parsed: Participant[] = [];

      for (let i = 1; i < sheets.length; i++) {
        const row = sheets[i];
        if (!row || row.length === 0) continue;

        const name = row[nameIdx] ? String(row[nameIdx]).trim() : '';
        if (!name) continue;

        const phone = phoneIdx !== -1 && row[phoneIdx] ? String(row[phoneIdx]).trim() : undefined;
        const email = emailIdx !== -1 && row[emailIdx] ? String(row[emailIdx]).trim() : undefined;
        const ticketNumber =
          ticketIdx !== -1 && row[ticketIdx]
            ? String(row[ticketIdx]).trim()
            : `SVI-${1000 + parsed.length + 1}`;

        parsed.push({ name, phone, email, ticketNumber });
      }

      setParticipants(parsed);
      setCurrentPage(1);
      setSuccessMessage(`Successfully loaded ${parsed.length} rows from Excel!`);
    } catch (err) {
      setErrorMessage('Failed to parse Excel file.');
    }
  };

  const removeParticipant = (indexToRemove: number) => {
    setParticipants(participants.filter((_, idx) => idx !== indexToRemove));
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) {
      setErrorMessage('Participant name is required.');
      return;
    }

    const newTicket = manualTicket.trim()
      ? manualTicket.trim()
      : `SVI-${1000 + participants.length + 1}`;

    // Check if ticket number is unique in current list
    if (participants.some((p) => p.ticketNumber.toLowerCase() === newTicket.toLowerCase())) {
      setErrorMessage(`Ticket number "${newTicket}" is already taken.`);
      return;
    }

    const newParticipant: Participant = {
      name: manualName.trim(),
      phone: manualPhone.trim() || undefined,
      email: manualEmail.trim() || undefined,
      ticketNumber: newTicket,
    };

    setParticipants([...participants, newParticipant]);

    // Reset form fields
    setManualName('');
    setManualPhone('');
    setManualEmail('');
    setManualTicket('');
    setErrorMessage(null);
    setSuccessMessage(`Added participant "${newParticipant.name}" manually.`);
  };

  // Submit parsed lottery and participants to DB
  const saveLotteryToDB = async () => {
    if (!title.trim()) {
      setErrorMessage('Please enter a title for the lottery.');
      return;
    }
    if (participants.length === 0) {
      setErrorMessage('Please upload a spreadsheet with participants first.');
      return;
    }

    startTransition(async () => {
      try {
        setErrorMessage(null);
        setSuccessMessage(null);

        // 1. Check if there is an active lottery. Only one active lottery is allowed at a time.
        if (activeLottery) {
          // Deactivate the current active lottery first (set to 'inactive')
          const { error: deactivateError } = await supabase
            .from('lotteries')
            .update({ status: 'inactive' })
            .eq('id', activeLottery.id);

          if (deactivateError) throw deactivateError;
        }

        // 2. Create the new lottery
        const { data: newLottery, error: createError } = await supabase
          .from('lotteries')
          .insert({
            title: title.trim(),
            description: description.trim() || null,
            status: 'active',
          })
          .select()
          .single();

        if (createError) throw createError;

        // 3. Batch insert participants
        const participantsData = participants.map((p) => ({
          lottery_id: newLottery.id,
          name: p.name,
          phone: p.phone || null,
          email: p.email || null,
          ticket_number: p.ticketNumber,
          is_winner: false,
        }));

        // Break into chunks of 100 to avoid request body limits if database is large
        const chunkSize = 100;
        for (let i = 0; i < participantsData.length; i += chunkSize) {
          const chunk = participantsData.slice(i, i + chunkSize);
          const { error: insertError } = await supabase.from('lottery_participants').insert(chunk);

          if (insertError) throw insertError;
        }

        setTitle('');
        setDescription('');
        setParticipants([]);
        setSuccessMessage(
          'New active lottery created successfully! Shuffling is now live on the homepage.'
        );
        setActiveTab('dashboard');
        fetchLotteries();
      } catch (error: any) {
        console.error('Error saving lottery:', error);
        setErrorMessage(error.message || 'Failed to save the lottery draw.');
      }
    });
  };

  // Draw Winner Randomly in DB
  const drawWinnerRandomly = async () => {
    if (!activeLottery) return;

    startTransition(async () => {
      try {
        setErrorMessage(null);
        setSuccessMessage(null);

        const response = await fetch('/api/admin/lottery/draw', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ lotteryId: activeLottery.id }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to draw winner.');
        }

        const winner = data.winner;

        setSuccessMessage(
          `Winner Drawn! Congratulations to ${winner.name} (${winner.ticket_number})!`
        );
        fetchLotteries();
      } catch (error: any) {
        console.error('Error drawing winner:', error);
        setErrorMessage(error.message || 'Failed to execute random drawing.');
      }
    });
  };

  // Reset the completed lottery back to active for testing / re-draw
  const resetDraw = async (lotteryId: string) => {
    startTransition(async () => {
      try {
        setErrorMessage(null);
        setSuccessMessage(null);

        // Reset winner status for this lottery's participants
        const { error: pResetError } = await supabase
          .from('lottery_participants')
          .update({ is_winner: false, prize_rank: null })
          .eq('lottery_id', lotteryId);

        if (pResetError) throw pResetError;

        // Set lottery status back to active
        const { error: lResetError } = await supabase
          .from('lotteries')
          .update({ status: 'active' })
          .eq('id', lotteryId);

        if (lResetError) throw lResetError;

        setSuccessMessage('Lottery reset to active state. You can draw again!');
        fetchLotteries();
      } catch (error: any) {
        console.error('Error resetting lottery:', error);
        setErrorMessage(error.message || 'Failed to reset draw.');
      }
    });
  };

  // Filter parsed items for searching in preview
  const filteredParticipants = participants.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paginatedParticipants = filteredParticipants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center dark:border-white/5">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Lottery Manager
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Upload participant databases, configure lucky draws, and announce winners live.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`cursor-pointer rounded-lg border px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-200 ${
              activeTab === 'dashboard'
                ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/20'
                : 'border-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-200 ${
              activeTab === 'create'
                ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/20'
                : 'border-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
            }`}
          >
            <Plus className="h-3.5 w-3.5" /> New Draw
          </button>
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-500 dark:border-red-500/10">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-sm text-green-500 dark:border-green-500/10">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
          {successMessage.toLowerCase().includes('created') && (
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-green-500/30 bg-green-500/15 px-3 py-1.5 text-xs font-bold text-green-500 transition-all hover:bg-green-500/20"
            >
              Open Live Draw Arena ↗
            </a>
          )}
        </div>
      )}

      {/* ─── VISIBILITY CONTROL CARD ─── */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-500 ${
          lotteryVisible
            ? 'border-brand-gold/30 bg-brand-gold/5 dark:bg-brand-gold/5'
            : 'border-gray-200 bg-white dark:border-white/5 dark:bg-[#0e0e14]/50'
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
                lotteryVisible
                  ? 'bg-brand-gold/15 text-brand-gold'
                  : 'bg-gray-100 text-gray-400 dark:bg-white/5'
              }`}
            >
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">
                Public Lottery Page Visibility
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {lotteryVisible
                  ? 'Lucky Draw is LIVE — visible on the site navbar and homepage.'
                  : 'Lucky Draw is HIDDEN — not visible to public users.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:shrink-0">
            {/* Status badge */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase ${
                lotteryVisible
                  ? 'border border-green-500/20 bg-green-500/10 text-green-500'
                  : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  lotteryVisible ? 'animate-pulse bg-green-500' : 'bg-gray-400'
                }`}
              />
              {visibilityLoading ? 'Checking…' : lotteryVisible ? 'Live' : 'Hidden'}
            </span>

            {/* Toggle button */}
            <button
              id="lottery-visibility-toggle"
              onClick={() => toggleLotteryVisibility(!lotteryVisible)}
              disabled={visibilityLoading || visibilityPending}
              className={`focus-visible:ring-brand-gold relative inline-flex h-8 w-[4.5rem] shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-300 focus:outline-none focus-visible:ring-2 disabled:opacity-50 ${
                lotteryVisible
                  ? 'border-brand-gold bg-brand-gold'
                  : 'border-gray-300 bg-gray-200 dark:border-white/10 dark:bg-white/5'
              }`}
              role="switch"
              aria-checked={lotteryVisible}
              aria-label="Toggle lottery page visibility"
            >
              <span
                className={`inline-block h-5 w-5 rounded-full shadow-md transition-all duration-300 ${
                  lotteryVisible
                    ? 'bg-brand-navy translate-x-9'
                    : 'translate-x-1 bg-white dark:bg-gray-400'
                }`}
              />
            </button>

            {/* Eye icon indicator */}
            {lotteryVisible ? (
              <Eye className="text-brand-gold h-5 w-5" />
            ) : (
              <EyeOff className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* Helper text */}
        <div className="mt-4 rounded-lg bg-black/5 p-3 text-xs text-gray-500 dark:bg-white/5 dark:text-gray-400">
          <strong className="text-gray-700 dark:text-gray-300">How it works:</strong> When{' '}
          <span className="font-semibold text-green-500">enabled</span>, the Lucky Draw link appears
          in the navbar and the homepage CTA banner is shown. When{' '}
          <span className="font-semibold text-gray-500">disabled</span>, the page is hidden from the
          public; direct URL visits will redirect to the homepage.
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Active Lottery Section */}
          {activeLottery ? (
            <div className="border-brand-gold/20 relative overflow-hidden rounded-2xl border bg-white p-6 shadow-xl dark:bg-[#0e0e14]/70">
              {/* Background gradient embellishments */}
              <div className="bg-brand-gold/5 absolute -top-16 -right-16 h-48 w-48 rounded-full blur-2xl" />
              <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div className="space-y-2">
                  <span className="bg-brand-gold/20 text-brand-gold inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                    <Clock className="h-3 w-3" /> Live Draw Ready
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">
                    {activeLottery.title}
                  </h2>
                  <p className="max-w-xl text-sm text-gray-500 dark:text-gray-400">
                    {activeLottery.description || 'No description provided.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <span className="text-brand-gold text-base font-bold">
                        {activeParticipantsCount}
                      </span>
                      <span>Total Participants</span>
                    </div>
                    <div className="h-4 w-px bg-gray-200 dark:bg-white/10" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400">Created:</span>
                      <span>{new Date(activeLottery.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="h-4 w-px bg-gray-200 dark:bg-white/10" />
                    <a
                      href="/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-gold flex items-center gap-1 font-bold hover:underline"
                    >
                      🔗 Live Page: /
                    </a>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {activeWinners.length > 0 ? (
                    <div className="border-brand-gold/15 bg-brand-gold/5 flex items-center gap-3 rounded-xl border p-4">
                      <Award className="text-brand-gold h-6 w-6" />
                      <div>
                        <div className="text-brand-gold text-[10px] font-bold tracking-widest uppercase">
                          Winner drawn
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {activeWinners[0].name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {activeWinners[0].ticket_number}
                        </div>
                      </div>
                      <button
                        onClick={() => resetDraw(activeLottery.id)}
                        disabled={isPending}
                        className="hover:text-brand-gold ml-3 cursor-pointer rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                        title="Re-draw / Reset"
                      >
                        <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={drawWinnerRandomly}
                      disabled={isPending}
                      className="shadow-gold bg-brand-gold hover:bg-brand-gold/90 text-brand-navy flex transform cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold tracking-wider uppercase transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <Play className="fill-brand-navy h-4 w-4" /> Draw Winner Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center dark:border-white/10">
              <Award className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-600" />
              <h3 className="mb-1 font-serif text-lg font-bold text-gray-900 dark:text-white">
                No Active Lottery Draw
              </h3>
              <p className="mx-auto mb-6 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                Create a new lottery draw session by uploading customer spreadsheet files.
              </p>
              <button
                onClick={() => setActiveTab('create')}
                className="bg-brand-gold hover:bg-brand-gold/90 text-brand-navy cursor-pointer rounded-lg px-5 py-2.5 text-xs font-bold tracking-wider uppercase transition-colors"
              >
                Create Lottery Draw
              </button>
            </div>
          )}

          {/* Historical draws table */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
              Draw History & Completed Lotteries
            </h3>
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-white/5 dark:bg-[#0e0e14]/50">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-gray-600 dark:text-gray-300">
                  <thead className="bg-gray-50 text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:bg-white/5 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-4">Lottery Title</th>
                      <th className="px-6 py-4">Created Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Grand Prize Winner</th>
                      <th className="px-6 py-4">Ticket Number</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {lotteries.map((l) => (
                      <tr
                        key={l.id}
                        className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
                      >
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span>{l.title}</span>
                            <a
                              href="/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-gold inline-flex items-center gap-0.5 text-[10px] hover:underline"
                              title="View drawing on main page"
                            >
                              (view) ↗
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4">{new Date(l.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                              l.status === 'active'
                                ? 'bg-green-500/10 text-green-500'
                                : l.status === 'completed'
                                  ? 'bg-brand-gold/10 text-brand-gold'
                                  : 'bg-gray-500/10 text-gray-500'
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          {l.winner ? (
                            <div className="text-brand-gold flex items-center gap-1.5 font-bold">
                              <Award className="h-4 w-4 shrink-0" />
                              {l.winner.name}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">No winner drawn</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {l.winner ? (
                            <code className="rounded bg-gray-100 px-2 py-1 font-mono text-xs font-bold dark:bg-white/5">
                              {l.winner.ticket_number}
                            </code>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => resetDraw(l.id)}
                            disabled={isPending}
                            className="hover:border-brand-gold/20 hover:bg-brand-gold/5 text-brand-gold cursor-pointer rounded-lg border border-transparent px-3 py-1.5 text-xs font-semibold tracking-wider transition-all"
                          >
                            Reset / Re-draw
                          </button>
                        </td>
                      </tr>
                    ))}
                    {lotteries.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-400 italic">
                          No history found. Create your first lucky draw!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Settings Card */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#0e0e14]/50">
              <h3 className="mb-4 font-serif text-lg font-bold text-gray-900 dark:text-white">
                Draw Configuration
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Lottery Draw Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Mega Plot Lucky Draw"
                    className="focus:border-brand-gold focus:ring-brand-gold w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-900 transition-all outline-none focus:ring-1 dark:border-white/10 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Description / Subtitle
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe prizes, eligibility terms, or timing..."
                    rows={3}
                    className="focus:border-brand-gold focus:ring-brand-gold w-full resize-none rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-900 transition-all outline-none focus:ring-1 dark:border-white/10 dark:text-white"
                  />
                </div>

                <div className="space-y-2 rounded-xl bg-gray-50 p-4 text-xs text-gray-500 dark:bg-white/5 dark:text-gray-400">
                  <div className="flex gap-2 font-semibold text-gray-800 dark:text-gray-300">
                    <HelpCircle className="text-brand-gold h-4 w-4 shrink-0" />
                    <span>Parsing Requirements</span>
                  </div>
                  <p>
                    Spreadsheet headers must contain a column named: <strong>"Name"</strong>{' '}
                    (case-insensitive).
                  </p>
                  <p>
                    Optionally supports columns: <strong>"Phone"</strong>, <strong>"Email"</strong>,
                    and <strong>"Ticket Number"</strong>.
                  </p>
                  <p>
                    If ticket numbers are missing, we will auto-generate them in sequential
                    sequence.
                  </p>
                </div>

                <button
                  onClick={saveLotteryToDB}
                  disabled={isPending || !title.trim() || participants.length === 0}
                  className="shadow-gold bg-brand-gold hover:bg-brand-gold/90 text-brand-navy flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-xs font-bold tracking-wider uppercase transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:dark:bg-white/5"
                >
                  {isPending ? 'Syncing with DB...' : 'Create & Launch Lottery'}{' '}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Upload Area & Preview */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#0e0e14]/50">
              {participants.length === 0 ? (
                <>
                  <div className="mb-6 flex border-b border-gray-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setEntryMethod('upload')}
                      className={`flex-1 cursor-pointer border-b-2 pb-3 text-center text-xs font-bold tracking-widest uppercase transition-all ${
                        entryMethod === 'upload'
                          ? 'border-brand-gold text-brand-gold'
                          : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                      }`}
                    >
                      📂 Upload Spreadsheet
                    </button>
                    <button
                      type="button"
                      onClick={() => setEntryMethod('manual')}
                      className={`flex-1 cursor-pointer border-b-2 pb-3 text-center text-xs font-bold tracking-widest uppercase transition-all ${
                        entryMethod === 'manual'
                          ? 'border-brand-gold text-brand-gold'
                          : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                      }`}
                    >
                      ✍️ Manual Entry
                    </button>
                  </div>

                  {entryMethod === 'upload' ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleFileUpload(e.dataTransfer.files[0]);
                        }
                      }}
                      className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
                        dragOver
                          ? 'border-brand-gold bg-brand-gold/5'
                          : 'hover:border-brand-gold/40 dark:hover:border-brand-gold/30 border-gray-200 dark:border-white/10'
                      }`}
                      onClick={() => {
                        const el = document.getElementById('file-upload-input');
                        if (el) el.click();
                      }}
                    >
                      <input
                        id="file-upload-input"
                        type="file"
                        accept=".csv, .xlsx, .xls"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0]);
                          }
                        }}
                      />
                      <div className="bg-brand-gold/10 text-brand-gold mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                        <Upload className="h-6 w-6" />
                      </div>
                      <h4 className="mb-1 font-semibold text-gray-900 dark:text-white">
                        Drag & drop file here
                      </h4>
                      <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                        Supports Excel (.xlsx, .xls) and CSV files up to 10MB
                      </p>
                      <span className="hover:border-brand-gold/30 inline-flex rounded-lg border border-gray-200 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-700 transition-colors dark:border-white/10 dark:text-gray-300">
                        Browse Files
                      </span>
                    </div>
                  ) : (
                    <form onSubmit={handleManualAdd} className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={manualName}
                            onChange={(e) => setManualName(e.target.value)}
                            placeholder="Enter participant name..."
                            className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-transparent px-4 py-2.5 text-xs text-gray-900 transition-all outline-none dark:border-white/10 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                            Ticket Number (Optional)
                          </label>
                          <input
                            type="text"
                            value={manualTicket}
                            onChange={(e) => setManualTicket(e.target.value)}
                            placeholder="Auto-generated if left blank"
                            className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-transparent px-4 py-2.5 text-xs text-gray-900 transition-all outline-none dark:border-white/10 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                            Phone Number (Optional)
                          </label>
                          <input
                            type="tel"
                            value={manualPhone}
                            onChange={(e) => setManualPhone(e.target.value)}
                            placeholder="e.g. +91 98765 43210"
                            className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-transparent px-4 py-2.5 text-xs text-gray-900 transition-all outline-none dark:border-white/10 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                            Email Address (Optional)
                          </label>
                          <input
                            type="email"
                            value={manualEmail}
                            onChange={(e) => setManualEmail(e.target.value)}
                            placeholder="e.g. client@example.com"
                            className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-transparent px-4 py-2.5 text-xs text-gray-900 transition-all outline-none dark:border-white/10 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          className="shadow-gold bg-brand-gold hover:bg-brand-gold/90 text-brand-navy flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold tracking-wider uppercase transition-all"
                        >
                          <Plus className="h-4 w-4" /> Add Participant
                        </button>
                      </div>
                    </form>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  {/* File status */}
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="text-brand-gold h-5 w-5" />
                      <div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white">
                          Active Participant List
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {participants.length} valid rows loaded
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowInlineManualForm(!showInlineManualForm)}
                        className="text-brand-gold hover:bg-brand-gold/10 flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" /> Manual Add
                      </button>
                      <button
                        onClick={() => {
                          setParticipants([]);
                          setShowInlineManualForm(false);
                        }}
                        className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-600"
                      >
                        Clear List
                      </button>
                    </div>
                  </div>

                  {/* Inline Manual Form inside table preview card */}
                  <AnimatePresence>
                    {showInlineManualForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-brand-gold/20 bg-brand-gold/5 space-y-3 overflow-hidden rounded-xl border p-4"
                      >
                        <h4 className="text-brand-gold text-[10px] font-bold tracking-wider uppercase">
                          Append Participant Manually
                        </h4>
                        <form
                          onSubmit={handleManualAdd}
                          className="grid grid-cols-1 gap-3 md:grid-cols-2"
                        >
                          <div>
                            <input
                              type="text"
                              required
                              value={manualName}
                              onChange={(e) => setManualName(e.target.value)}
                              placeholder="Full Name *"
                              className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 outline-none dark:border-white/10 dark:bg-[#07070b] dark:text-white"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={manualTicket}
                              onChange={(e) => setManualTicket(e.target.value)}
                              placeholder="Ticket (e.g. SVI-1005)"
                              className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 outline-none dark:border-white/10 dark:bg-[#07070b] dark:text-white"
                            />
                          </div>
                          <div>
                            <input
                              type="tel"
                              value={manualPhone}
                              onChange={(e) => setManualPhone(e.target.value)}
                              placeholder="Phone (Optional)"
                              className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 outline-none dark:border-white/10 dark:bg-[#07070b] dark:text-white"
                            />
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="email"
                              value={manualEmail}
                              onChange={(e) => setManualEmail(e.target.value)}
                              placeholder="Email (Optional)"
                              className="focus:border-brand-gold w-full flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 outline-none dark:border-white/10 dark:bg-[#07070b] dark:text-white"
                            />
                            <button
                              type="submit"
                              className="bg-brand-gold hover:bg-brand-gold/90 text-brand-navy cursor-pointer rounded-xl px-4 py-2 text-xs font-bold uppercase transition-all"
                            >
                              Add
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Search filter in preview */}
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search parsed preview names, tickets, or emails..."
                      className="focus:border-brand-gold focus:ring-brand-gold w-full rounded-xl border border-gray-200 bg-transparent py-2.5 pr-4 pl-10 text-xs text-gray-900 transition-all outline-none focus:ring-1 dark:border-white/10 dark:text-white"
                    />
                  </div>

                  {/* Preview table */}
                  <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-white/5">
                    <table className="w-full border-collapse text-left text-xs text-gray-600 dark:text-gray-300">
                      <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase dark:bg-white/5 dark:text-gray-400">
                        <tr>
                          <th className="px-4 py-3">#</th>
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Ticket</th>
                          <th className="px-4 py-3">Phone</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {paginatedParticipants.map((p, idx) => {
                          const originalIdx = (currentPage - 1) * itemsPerPage + idx;
                          return (
                            <tr
                              key={originalIdx}
                              className="hover:bg-gray-50/50 dark:hover:bg-white/5"
                            >
                              <td className="px-4 py-3.5 text-gray-400">{originalIdx + 1}</td>
                              <td className="px-4 py-3.5 font-bold text-gray-900 dark:text-white">
                                {p.name}
                              </td>
                              <td className="px-4 py-3.5">
                                <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-[10px] dark:bg-white/5">
                                  {p.ticketNumber}
                                </code>
                              </td>
                              <td className="px-4 py-3.5">{p.phone || '-'}</td>
                              <td className="px-4 py-3.5">{p.email || '-'}</td>
                              <td className="px-4 py-3.5 text-right">
                                <button
                                  onClick={() => removeParticipant(originalIdx)}
                                  className="cursor-pointer rounded p-1 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-500"
                                  title="Remove raw row"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredParticipants.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-6 text-center text-gray-400 italic">
                              No records match your search filter
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination footer */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
                      <div>
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                        {Math.min(currentPage * itemsPerPage, filteredParticipants.length)} of{' '}
                        {filteredParticipants.length} parsed items
                      </div>
                      <div className="flex gap-2">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                          className="cursor-pointer rounded-lg border border-gray-200 px-3 py-1.5 transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-white/10 dark:hover:bg-white/5"
                        >
                          Prev
                        </button>
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                          className="cursor-pointer rounded-lg border border-gray-200 px-3 py-1.5 transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-white/10 dark:hover:bg-white/5"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
