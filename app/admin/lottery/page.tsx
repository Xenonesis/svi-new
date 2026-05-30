'use client';

import { useEffect, useState, useTransition, useRef } from 'react';
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
  Settings,
  Users,
  Trophy,
  ChevronRight,
  ChevronLeft,
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

  const [activeTab, setActiveTab] = useState<'dashboard' | 'create'>('dashboard');

  // Wizard State
  const [wizardStep, setWizardStep] = useState(1); // 1: Details, 2: Participants, 3: Review

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

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const { data: lotteriesData, error: lError } = await supabase
        .from('lotteries')
        .select('*')
        .order('created_at', { ascending: false });

      if (lError) throw lError;

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

      const active = formattedLotteries.find((l) => l.status === 'active');
      if (active) {
        setActiveLottery(active);
        const { count, error: cError } = await supabase
          .from('lottery_participants')
          .select('*', { count: 'exact', head: true })
          .eq('lottery_id', active.id);

        if (!cError) {
          setActiveParticipantsCount(count || 0);
        }

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
    setManualName('');
    setManualPhone('');
    setManualEmail('');
    setManualTicket('');
    setErrorMessage(null);
    setSuccessMessage(`Added participant "${newParticipant.name}" manually.`);
  };

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

        if (activeLottery) {
          const { error: deactivateError } = await supabase
            .from('lotteries')
            .update({ status: 'inactive' })
            .eq('id', activeLottery.id);
          if (deactivateError) throw deactivateError;
        }

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

        const participantsData = participants.map((p) => ({
          lottery_id: newLottery.id,
          name: p.name,
          phone: p.phone || null,
          email: p.email || null,
          ticket_number: p.ticketNumber,
          is_winner: false,
        }));

        const chunkSize = 100;
        for (let i = 0; i < participantsData.length; i += chunkSize) {
          const chunk = participantsData.slice(i, i + chunkSize);
          const { error: insertError } = await supabase.from('lottery_participants').insert(chunk);
          if (insertError) throw insertError;
        }

        setTitle('');
        setDescription('');
        setParticipants([]);
        setWizardStep(1);
        setSuccessMessage('New active lottery created successfully! Live drawing is ready.');
        setActiveTab('dashboard');
        fetchLotteries();
      } catch (error: any) {
        console.error('Error saving lottery:', error);
        setErrorMessage(error.message || 'Failed to save the lottery draw.');
      }
    });
  };

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

  const resetDraw = async (lotteryId: string) => {
    startTransition(async () => {
      try {
        setErrorMessage(null);
        setSuccessMessage(null);

        const { error: pResetError } = await supabase
          .from('lottery_participants')
          .update({ is_winner: false, prize_rank: null })
          .eq('lottery_id', lotteryId);
        if (pResetError) throw pResetError;

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

  const handleNextWizardStep = () => {
    if (wizardStep === 1 && !title.trim()) {
      setErrorMessage('Title is required to proceed.');
      return;
    }
    setErrorMessage(null);
    setWizardStep((s) => Math.min(s + 1, 3));
  };

  const handlePrevWizardStep = () => {
    setWizardStep((s) => Math.max(s - 1, 1));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-white/5 pb-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
            Command Center: <span className="text-brand-gold italic">Lottery</span>
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Launch massive lucky draws, manage high-stakes prizes, and broadcast live winner
            reveals.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`cursor-pointer rounded-xl border px-5 py-2.5 text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
              activeTab === 'dashboard'
                ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/30 shadow-[0_0_15px_rgba(201,168,76,0.1)]'
                : 'border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setActiveTab('create');
              setWizardStep(1);
            }}
            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-5 py-2.5 text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
              activeTab === 'create'
                ? 'bg-brand-gold text-brand-navy border-brand-gold shadow-[0_0_20px_rgba(201,168,76,0.3)]'
                : 'bg-brand-gold/10 text-brand-gold border-brand-gold/20 hover:bg-brand-gold/20'
            }`}
          >
            <Plus className="h-4 w-4" /> New Lottery
          </button>
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-400 shadow-lg backdrop-blur-sm"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="ml-auto text-red-400 hover:text-white"
            >
              ✕
            </button>
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-sm font-medium text-green-400 shadow-lg backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{successMessage}</span>
            </div>
            {successMessage.toLowerCase().includes('created') && (
              <a
                href="/lottery"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-green-500/40 bg-green-500/20 px-4 py-2 text-xs font-bold tracking-wide text-green-300 transition-all hover:bg-green-500/30"
              >
                Launch Arena ↗
              </a>
            )}
            <button
              onClick={() => setSuccessMessage(null)}
              className="ml-4 text-green-400 hover:text-white"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visibility Control Card */}
      <div
        className={`relative overflow-hidden rounded-3xl border p-6 transition-all duration-500 ${lotteryVisible ? 'border-brand-gold/40 to-brand-gold/5 bg-gradient-to-br from-[#0e0e14] shadow-[0_0_30px_rgba(201,168,76,0.1)]' : 'border-white/10 bg-[#0e0e14]/50'}`}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-colors ${lotteryVisible ? 'bg-brand-gold/20 text-brand-gold' : 'bg-white/5 text-gray-500'}`}
            >
              <Globe className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-white">Public Live Broadcast</h3>
              <p className="mt-1 text-sm text-gray-400">
                {lotteryVisible
                  ? 'The Lottery Arena is LIVE and broadcasting to all public visitors.'
                  : 'The Arena is offline. Public visitors cannot see the drawing.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:shrink-0">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase ${lotteryVisible ? 'border border-green-500/30 bg-green-500/15 text-green-400' : 'border border-white/5 bg-white/5 text-gray-500'}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${lotteryVisible ? 'animate-pulse bg-green-400 shadow-[0_0_10px_#4ade80]' : 'bg-gray-500'}`}
              />
              {visibilityLoading ? 'Checking…' : lotteryVisible ? 'Broadcasting Live' : 'Offline'}
            </span>
            <button
              onClick={() => toggleLotteryVisibility(!lotteryVisible)}
              disabled={visibilityLoading || visibilityPending}
              className={`focus-visible:ring-brand-gold relative inline-flex h-9 w-16 shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-300 focus:outline-none focus-visible:ring-2 disabled:opacity-50 ${lotteryVisible ? 'border-brand-gold bg-brand-gold shadow-[0_0_15px_rgba(201,168,76,0.5)]' : 'border-white/10 bg-white/5'}`}
            >
              <span
                className={`inline-block h-6 w-6 rounded-full shadow-md transition-all duration-300 ${lotteryVisible ? 'translate-x-8 bg-[#0a0a0f]' : 'translate-x-1 bg-gray-500'}`}
              />
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Active Lottery Section */}
          {activeLottery ? (
            <div className="border-brand-gold/30 relative overflow-hidden rounded-3xl border bg-[#0a0a0f] p-8 shadow-[0_0_40px_rgba(201,168,76,0.15)]">
              {/* Decorative backgrounds */}
              <div className="bg-brand-gold/10 pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full blur-[100px]" />
              <div className="bg-brand-gold/5 pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full blur-[100px]" />

              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-4">
                  <div className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold tracking-widest uppercase backdrop-blur-md">
                    <span className="bg-brand-gold h-2 w-2 animate-pulse rounded-full"></span> Ready
                    for Draw
                  </div>
                  <h2 className="font-serif text-4xl font-bold text-white">
                    {activeLottery.title}
                  </h2>
                  <p className="max-w-2xl text-base text-gray-400">
                    {activeLottery.description || 'No description provided.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 pt-4 text-sm font-medium text-gray-400">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-4">
                      <div className="bg-brand-gold/20 text-brand-gold flex h-10 w-10 items-center justify-center rounded-xl">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xl font-bold text-white">
                          {activeParticipantsCount}
                        </div>
                        <div className="text-[10px] tracking-wider text-gray-500 uppercase">
                          Participants
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xl font-bold text-white">
                          {new Date(activeLottery.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] tracking-wider text-gray-500 uppercase">
                          Creation Date
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-4">
                  {activeWinners.length > 0 ? (
                    <div className="border-brand-gold/30 flex flex-col items-center justify-center gap-4 rounded-3xl border bg-gradient-to-b from-[#1a1a24] to-[#0a0a0f] p-8 shadow-2xl">
                      <div className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold flex h-16 w-16 items-center justify-center rounded-full border shadow-[0_0_20px_rgba(201,168,76,0.3)]">
                        <Trophy className="h-8 w-8" />
                      </div>
                      <div className="text-center">
                        <div className="text-brand-gold mb-1 text-[10px] font-bold tracking-widest uppercase">
                          Winner Declared
                        </div>
                        <div className="font-serif text-3xl font-bold text-white">
                          {activeWinners[0].name}
                        </div>
                        <div className="mt-2 inline-block rounded bg-white/10 px-3 py-1 font-mono text-sm font-bold text-gray-300">
                          {activeWinners[0].ticket_number}
                        </div>
                      </div>
                      <button
                        onClick={() => resetDraw(activeLottery.id)}
                        disabled={isPending}
                        className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-xs font-bold tracking-wider text-gray-300 uppercase transition-all hover:bg-white/10 hover:text-white"
                      >
                        <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} /> Reset
                        Draw
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={drawWinnerRandomly}
                      disabled={isPending}
                      className="group bg-brand-gold text-brand-navy relative flex cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-2xl px-10 py-6 text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(201,168,76,0.6)]"
                    >
                      <div className="absolute inset-0 flex h-full w-full [transform:skew(-12deg)_translateX(-100%)] justify-center group-hover:[transform:skew(-12deg)_translateX(100%)] group-hover:duration-1000">
                        <div className="relative h-full w-8 bg-white/30" />
                      </div>
                      <Play className="fill-brand-navy h-6 w-6" /> Execute Live Draw
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-[#0e0e14]/30 p-16 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-gray-600">
                <Award className="h-10 w-10" />
              </div>
              <h3 className="mb-2 font-serif text-2xl font-bold text-white">No Active Campaigns</h3>
              <p className="mb-8 max-w-md text-sm text-gray-400">
                You don't have any active lotteries running. Start a new campaign to thrill your
                participants and award prizes.
              </p>
              <button
                onClick={() => {
                  setActiveTab('create');
                  setWizardStep(1);
                }}
                className="bg-brand-gold text-brand-navy flex cursor-pointer items-center gap-2 rounded-xl px-8 py-3.5 text-xs font-bold tracking-wider uppercase transition-transform hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(201,168,76,0.2)]"
              >
                <Plus className="h-4 w-4" /> Start New Campaign
              </button>
            </div>
          )}

          {/* Historical draws table */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-bold text-white">Archive & History</h3>
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0e0e14]/60 backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-gray-300">
                  <thead className="border-b border-white/10 bg-black/40 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    <tr>
                      <th className="px-8 py-5">Campaign Name</th>
                      <th className="px-8 py-5">Date</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5">Winner Details</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {lotteries.map((l) => (
                      <tr key={l.id} className="transition-colors hover:bg-white/5">
                        <td className="px-8 py-5 font-bold text-white">{l.title}</td>
                        <td className="px-8 py-5 text-gray-400">
                          {new Date(l.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${
                              l.status === 'active'
                                ? 'border-green-500/30 bg-green-500/10 text-green-400'
                                : l.status === 'completed'
                                  ? 'border-brand-gold/30 bg-brand-gold/10 text-brand-gold'
                                  : 'border-white/10 bg-white/5 text-gray-400'
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          {l.winner ? (
                            <div>
                              <div className="text-brand-gold flex items-center gap-2 font-bold">
                                <Award className="h-4 w-4 shrink-0" /> {l.winner.name}
                              </div>
                              <div className="mt-1 font-mono text-[10px] text-gray-500">
                                Ticket: {l.winner.ticket_number}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500 italic">Pending Draw</span>
                          )}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button
                            onClick={() => resetDraw(l.id)}
                            disabled={isPending}
                            className="hover:border-brand-gold/40 hover:bg-brand-gold/10 hover:text-brand-gold inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wider text-gray-300 transition-all"
                          >
                            <RefreshCw className="h-3 w-3" /> Re-open
                          </button>
                        </td>
                      </tr>
                    ))}
                    {lotteries.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-8 py-12 text-center text-gray-500 italic">
                          No archived campaigns.
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
        <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-[#0e0e14]/80 p-8 shadow-2xl backdrop-blur-xl md:p-12">
          {/* Wizard Progress Bar */}
          <div className="mb-12">
            <div className="relative flex items-center justify-between">
              <div className="absolute top-1/2 right-0 left-0 h-0.5 -translate-y-1/2 bg-white/10" />
              <div
                className="bg-brand-gold absolute top-1/2 left-0 h-0.5 -translate-y-1/2 transition-all duration-500"
                style={{ width: `${(wizardStep - 1) * 50}%` }}
              />

              {[1, 2, 3].map((step) => (
                <div key={step} className="relative z-10 flex flex-col items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold transition-all duration-500 ${
                      wizardStep >= step
                        ? 'border-brand-gold bg-brand-gold text-brand-navy shadow-[0_0_15px_rgba(201,168,76,0.4)]'
                        : 'border-white/20 bg-[#0e0e14] text-gray-500'
                    }`}
                  >
                    {wizardStep > step ? <CheckCircle2 className="h-6 w-6" /> : step}
                  </div>
                  <span
                    className={`text-[10px] font-bold tracking-widest uppercase ${wizardStep >= step ? 'text-brand-gold' : 'text-gray-500'}`}
                  >
                    {step === 1 ? 'Details' : step === 2 ? 'Participants' : 'Launch'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Wizard Steps */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {/* STEP 1: Details */}
              {wizardStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <h3 className="font-serif text-3xl font-bold text-white">Campaign Details</h3>
                    <p className="mt-2 text-sm text-gray-400">
                      Give your lucky draw a grand title and exciting description.
                    </p>
                  </div>

                  <div className="mx-auto max-w-2xl space-y-6">
                    <div>
                      <label className="mb-2 block text-xs font-bold tracking-wider text-gray-300 uppercase">
                        Lottery Title <span className="text-brand-gold">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Summer Villa Mega Giveaway"
                        className="focus:border-brand-gold/50 w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-lg font-bold text-white transition-all outline-none focus:bg-white/10"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold tracking-wider text-gray-300 uppercase">
                        Description / Prizes
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the grand prize and rules..."
                        rows={4}
                        className="focus:border-brand-gold/50 w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white transition-all outline-none focus:bg-white/10"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Participants */}
              {wizardStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <h3 className="font-serif text-3xl font-bold text-white">Load Participants</h3>
                    <p className="mt-2 text-sm text-gray-400">
                      Upload your customer spreadsheet or add entries manually.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                    <div className="lg:col-span-2">
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                        <div className="mb-6 flex gap-2 rounded-xl bg-black/40 p-1">
                          <button
                            type="button"
                            onClick={() => setEntryMethod('upload')}
                            className={`flex-1 rounded-lg py-2.5 text-[10px] font-bold tracking-widest uppercase transition-all ${entryMethod === 'upload' ? 'text-brand-gold bg-white/10 shadow-sm' : 'text-gray-500 hover:text-white'}`}
                          >
                            Upload File
                          </button>
                          <button
                            type="button"
                            onClick={() => setEntryMethod('manual')}
                            className={`flex-1 rounded-lg py-2.5 text-[10px] font-bold tracking-widest uppercase transition-all ${entryMethod === 'manual' ? 'text-brand-gold bg-white/10 shadow-sm' : 'text-gray-500 hover:text-white'}`}
                          >
                            Manual
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
                            onClick={() => fileInputRef.current?.click()}
                            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${dragOver ? 'border-brand-gold bg-brand-gold/10 scale-105' : 'hover:border-brand-gold/50 border-white/20 bg-transparent hover:bg-white/5'}`}
                          >
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".csv, .xlsx, .xls"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0])
                                  handleFileUpload(e.target.files[0]);
                              }}
                            />
                            <div className="bg-brand-gold/10 text-brand-gold mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                              <Upload className="h-8 w-8" />
                            </div>
                            <div className="mb-1 font-bold text-white">Click or Drop File Here</div>
                            <div className="text-xs text-gray-500">CSV, XLSX supported</div>
                          </div>
                        ) : (
                          <form onSubmit={handleManualAdd} className="space-y-4">
                            <input
                              type="text"
                              required
                              value={manualName}
                              onChange={(e) => setManualName(e.target.value)}
                              placeholder="Full Name *"
                              className="focus:border-brand-gold/50 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-white outline-none"
                            />
                            <input
                              type="text"
                              value={manualTicket}
                              onChange={(e) => setManualTicket(e.target.value)}
                              placeholder="Ticket # (Auto if blank)"
                              className="focus:border-brand-gold/50 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-white outline-none"
                            />
                            <button
                              type="submit"
                              className="bg-brand-gold/20 text-brand-gold hover:bg-brand-gold hover:text-brand-navy w-full cursor-pointer rounded-xl py-3 text-xs font-bold uppercase transition-colors"
                            >
                              Add Entry
                            </button>
                          </form>
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-3">
                      <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-6">
                        <div className="mb-6 flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-white">Participants List</h4>
                            <p className="text-xs text-gray-400">
                              {participants.length} valid entries
                            </p>
                          </div>
                          {participants.length > 0 && (
                            <button
                              onClick={() => setParticipants([])}
                              className="cursor-pointer rounded-lg px-3 py-1.5 text-[10px] font-bold text-red-400 uppercase transition-colors hover:bg-red-400/10"
                            >
                              Clear All
                            </button>
                          )}
                        </div>

                        {participants.length === 0 ? (
                          <div className="flex flex-1 flex-col items-center justify-center text-center text-gray-500">
                            <FileSpreadsheet className="mb-3 h-12 w-12 opacity-20" />
                            <p className="text-sm">No participants loaded yet.</p>
                          </div>
                        ) : (
                          <div className="flex flex-1 flex-col">
                            <div className="mb-4">
                              <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search names..."
                                className="focus:border-brand-gold/50 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs text-white outline-none"
                              />
                            </div>
                            <div className="flex-1 overflow-y-auto">
                              <div className="space-y-2">
                                {paginatedParticipants.map((p, idx) => {
                                  const originalIdx = (currentPage - 1) * itemsPerPage + idx;
                                  return (
                                    <div
                                      key={originalIdx}
                                      className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 p-3 hover:border-white/10"
                                    >
                                      <div>
                                        <div className="text-sm font-bold text-white">{p.name}</div>
                                        <div className="text-brand-gold font-mono text-[10px]">
                                          {p.ticketNumber}
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => removeParticipant(originalIdx)}
                                        className="cursor-pointer p-2 text-gray-500 hover:text-red-400"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            {totalPages > 1 && (
                              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                                <button
                                  disabled={currentPage === 1}
                                  onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                                  className="cursor-pointer text-xs font-bold text-gray-400 hover:text-white disabled:opacity-30"
                                >
                                  Prev
                                </button>
                                <span className="text-xs text-gray-500">
                                  {currentPage} / {totalPages}
                                </span>
                                <button
                                  disabled={currentPage === totalPages}
                                  onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                                  className="cursor-pointer text-xs font-bold text-gray-400 hover:text-white disabled:opacity-30"
                                >
                                  Next
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Review */}
              {wizardStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <h3 className="font-serif text-3xl font-bold text-white">Review & Launch</h3>
                    <p className="mt-2 text-sm text-gray-400">
                      Verify details before pushing the campaign live.
                    </p>
                  </div>

                  <div className="border-brand-gold/30 mx-auto max-w-2xl overflow-hidden rounded-3xl border bg-[#0a0a0f] shadow-[0_0_40px_rgba(201,168,76,0.15)]">
                    <div className="border-b border-white/10 bg-white/5 p-8 text-center">
                      <div className="bg-brand-gold/20 text-brand-gold mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                        <Sparkles className="h-8 w-8" />
                      </div>
                      <h4 className="font-serif text-3xl font-bold text-white">{title}</h4>
                      <p className="mt-2 text-sm text-gray-400">{description}</p>
                    </div>
                    <div className="p-8">
                      <div className="flex justify-around">
                        <div className="text-center">
                          <div className="text-brand-gold text-3xl font-bold">
                            {participants.length}
                          </div>
                          <div className="mt-1 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                            Total Entries
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-400">1</div>
                          <div className="mt-1 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                            Grand Prize
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Wizard Controls */}
          <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-8">
            <button
              onClick={handlePrevWizardStep}
              disabled={wizardStep === 1}
              className="flex cursor-pointer items-center gap-2 rounded-xl px-6 py-3 text-xs font-bold tracking-wider text-gray-400 uppercase transition-colors hover:bg-white/5 hover:text-white disabled:invisible"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>

            {wizardStep < 3 ? (
              <button
                onClick={handleNextWizardStep}
                className="bg-brand-gold text-brand-navy flex cursor-pointer items-center gap-2 rounded-xl px-8 py-3 text-xs font-bold tracking-wider uppercase transition-transform hover:-translate-y-1 hover:shadow-lg"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={saveLotteryToDB}
                disabled={isPending || participants.length === 0}
                className="group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-xl bg-green-500 px-10 py-3.5 text-xs font-bold tracking-widest text-black uppercase transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(74,222,128,0.4)] disabled:bg-gray-700 disabled:text-gray-500"
              >
                <div className="absolute inset-0 flex h-full w-full [transform:skew(-12deg)_translateX(-100%)] justify-center group-hover:[transform:skew(-12deg)_translateX(100%)] group-hover:duration-1000">
                  <div className="relative h-full w-8 bg-white/30" />
                </div>
                {isPending ? 'Launching...' : 'Deploy Campaign'}{' '}
                <Play className="h-4 w-4 fill-black" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Ensure Sparkles icon is imported
import { Sparkles } from 'lucide-react';
