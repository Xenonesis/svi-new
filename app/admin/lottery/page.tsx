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
  FileSpreadsheet,
  AlertCircle,
  Globe,
  Users,
  Trophy,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Calendar,
  Timer,
  BellRing,
  XCircle,
  Edit2,
  Eye,
  Mail,
  Send,
  Zap,
  X,
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

  // Scheduled Draw State
  const [existingSchedule, setExistingSchedule] = useState<any | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  // IST datetime-local input string (e.g. "2025-06-01T14:30")
  const [scheduleInputIST, setScheduleInputIST] = useState('');
  const [preNotifyMinutes, setPreNotifyMinutes] = useState(60);
  const [showCountdown, setShowCountdown] = useState(true);
  const [includeCountdownInEmail, setIncludeCountdownInEmail] = useState(true);
  const [scheduleSaving, setScheduleSaving] = useState(false);

  // Manual Winner selection states
  const [drawMethod, setDrawMethod] = useState<'random' | 'manual'>('random');
  const [selectedPredeterminedWinners, setSelectedPredeterminedWinners] = useState<any[]>([]);
  const [dbParticipants, setDbParticipants] = useState<any[]>([]);
  const [dbParticipantsSearch, setDbParticipantsSearch] = useState('');
  const [dbParticipantsLoading, setDbParticipantsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Edit Lottery Modal ───────────────────────────────────────────────────
  const [editingLottery, setEditingLottery] = useState<Lottery | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'completed' | 'inactive'>('active');
  const [editWinnerName, setEditWinnerName] = useState('');
  const [editWinnerTicket, setEditWinnerTicket] = useState('');
  const [editWinnerPhone, setEditWinnerPhone] = useState('');
  const [editWinnerEmail, setEditWinnerEmail] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editTab, setEditTab] = useState<'details' | 'winner' | 'participants'>('details');
  // Editable participants list inside the edit modal
  const [editParticipants, setEditParticipants] = useState<any[]>([]);
  const [editPartsLoading, setEditPartsLoading] = useState(false);
  const [editPartsSearch, setEditPartsSearch] = useState('');
  // Add participant inline
  const [addPartName, setAddPartName] = useState('');
  const [addPartPhone, setAddPartPhone] = useState('');
  const [addPartEmail, setAddPartEmail] = useState('');
  const [addPartTicket, setAddPartTicket] = useState('');
  const [addPartSaving, setAddPartSaving] = useState(false);

  // ── Delete Confirm ───────────────────────────────────────────────────────
  const [deletingLotteryId, setDeletingLotteryId] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── View Participants Modal ──────────────────────────────────────────────
  const [viewingLottery, setViewingLottery] = useState<Lottery | null>(null);
  const [viewParticipants, setViewParticipants] = useState<any[]>([]);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewSearch, setViewSearch] = useState('');

  // ── Bulk Email Modal ─────────────────────────────────────────────────────
  const [emailModalLottery, setEmailModalLottery] = useState<Lottery | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSending, setEmailSending] = useState(false);

  useEffect(() => {
    fetchLotteries();
    fetchLotteryVisibility();
  }, []);

  // Fetch existing schedule whenever activeLottery changes
  useEffect(() => {
    if (activeLottery) {
      fetchSchedule(activeLottery.id);
    } else {
      setExistingSchedule(null);
    }
  }, [activeLottery]);

  const fetchSchedule = async (lotteryId: string) => {
    setScheduleLoading(true);
    try {
      const res = await fetch(`/api/admin/lottery/schedule?lotteryId=${lotteryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setExistingSchedule(json.schedule || null);
      if (json.schedule) {
        // Convert UTC ISO to IST for the input
        const utcDate = new Date(json.schedule.scheduled_at);
        // IST offset = UTC+5:30 = +330 min
        const istOffset = 330 * 60 * 1000;
        const istDate = new Date(utcDate.getTime() + istOffset);
        const iso = istDate.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
        setScheduleInputIST(iso);
        setPreNotifyMinutes(json.schedule.pre_notify_minutes ?? 60);
        setShowCountdown(json.schedule.show_countdown ?? true);
        setIncludeCountdownInEmail(json.schedule.include_countdown_in_email ?? true);
      } else {
        setScheduleInputIST('');
        setPreNotifyMinutes(60);
        setShowCountdown(true);
        setIncludeCountdownInEmail(true);
      }
    } catch {
      // ignore
    } finally {
      setScheduleLoading(false);
    }
  };

  /** Convert IST local datetime string to UTC ISO */
  const istInputToUTC = (istLocal: string): string => {
    // istLocal looks like "2025-06-01T14:30"
    const [datePart, timePart] = istLocal.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    // IST = UTC + 5:30 => UTC = IST - 5:30
    const utcDate = new Date(Date.UTC(year, month - 1, day, hour - 5, minute - 30));
    return utcDate.toISOString();
  };

  const handleSaveSchedule = async () => {
    if (!activeLottery) return;
    if (!scheduleInputIST) {
      setErrorMessage('Please select a date and time for the draw.');
      return;
    }
    const scheduledAtUTC = istInputToUTC(scheduleInputIST);
    if (new Date(scheduledAtUTC) <= new Date()) {
      setErrorMessage('Scheduled time must be in the future.');
      return;
    }
    setScheduleSaving(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/admin/lottery/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          lotteryId: activeLottery.id,
          scheduled_at: scheduledAtUTC,
          pre_notify_minutes: preNotifyMinutes,
          show_countdown: showCountdown,
          include_countdown_in_email: includeCountdownInEmail,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to schedule draw');
      setSuccessMessage(
        `✅ Draw scheduled for ${new Date(scheduledAtUTC).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST.`
      );
      setExistingSchedule(json.schedule);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setScheduleSaving(false);
    }
  };

  const handleCancelSchedule = async () => {
    if (!activeLottery || !existingSchedule) return;
    if (!confirm('Are you sure you want to cancel the scheduled draw?')) return;
    setScheduleSaving(true);
    try {
      const res = await fetch('/api/admin/lottery/schedule', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lotteryId: activeLottery.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to cancel schedule');
      setSuccessMessage('🗑️ Scheduled draw has been cancelled.');
      setExistingSchedule(null);
      setScheduleInputIST('');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setScheduleSaving(false);
    }
  };

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

  const fetchDbParticipants = async (searchQuery: string = '') => {
    if (!activeLottery) return;
    setDbParticipantsLoading(true);
    try {
      let query = supabase
        .from('lottery_participants')
        .select('id, name, ticket_number, phone, email')
        .eq('lottery_id', activeLottery.id);

      if (searchQuery.trim()) {
        query = query.or(
          `name.ilike.%${searchQuery.trim()}%,ticket_number.ilike.%${searchQuery.trim()}%`
        );
      }

      const { data, error } = await query.limit(10);
      if (error) throw error;
      setDbParticipants(data || []);
    } catch (err) {
      console.error('Error fetching participants for search:', err);
    } finally {
      setDbParticipantsLoading(false);
    }
  };

  useEffect(() => {
    if (!activeLottery || drawMethod !== 'manual') {
      setDbParticipants([]);
      return;
    }
    const timer = setTimeout(() => {
      fetchDbParticipants(dbParticipantsSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeLottery, drawMethod, dbParticipantsSearch]);

  useEffect(() => {
    setSelectedPredeterminedWinners([]);
    setDbParticipantsSearch('');
  }, [activeLottery, drawMethod]);

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
        } catch {
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
    } catch {
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
    } catch {
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

  const drawWinner = async (winnerIds?: string[]) => {
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
          body: JSON.stringify({
            lotteryId: activeLottery.id,
            winnerIds: winnerIds && winnerIds.length > 0 ? winnerIds : undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to draw winner.');
        }

        const winners = data.winners;
        const summary = winners.map((w: any) => `${w.name} (${w.ticket_number})`).join(', ');
        setSuccessMessage(
          `Winner${winners.length > 1 ? 's' : ''} Drawn! Congratulations to ${summary}!`
        );
        setSelectedPredeterminedWinners([]);
        setDbParticipantsSearch('');
        fetchLotteries();
      } catch (error: any) {
        console.error('Error drawing winner:', error);
        setErrorMessage(error.message || 'Failed to execute drawing.');
      }
    });
  };

  const resetDraw = async (lotteryId: string) => {
    startTransition(async () => {
      try {
        setErrorMessage(null);
        setSuccessMessage(null);
        setSelectedPredeterminedWinners([]);
        setDbParticipantsSearch('');

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

  /** Convert a JS Date to IST datetime-local string "YYYY-MM-DDTHH:mm" */
  const getISTString = (date: Date): string => {
    const istOffset = 330 * 60 * 1000;
    const ist = new Date(date.getTime() + istOffset);
    return ist.toISOString().slice(0, 16);
  };

  // ── Edit Lottery ──────────────────────────────────────────────────────────
  const openEditModal = async (l: Lottery) => {
    setEditingLottery(l);
    setEditTitle(l.title);
    setEditDescription(l.description || '');
    setEditStatus(l.status);
    setEditWinnerName(l.winner?.name || '');
    setEditWinnerTicket(l.winner?.ticket_number || '');
    setEditWinnerPhone(l.winner?.phone || '');
    setEditWinnerEmail(l.winner?.email || '');
    setEditTab('details');
    setEditPartsSearch('');
    // Load participants
    setEditPartsLoading(true);
    const { data } = await supabase
      .from('lottery_participants')
      .select('id, name, ticket_number, phone, email, is_winner')
      .eq('lottery_id', l.id)
      .order('is_winner', { ascending: false })
      .order('name');
    setEditParticipants(data || []);
    setEditPartsLoading(false);
  };

  const handleEditSave = async () => {
    if (!editingLottery || !editTitle.trim()) return;
    setEditSaving(true);
    try {
      const { error } = await supabase
        .from('lotteries')
        .update({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          status: editStatus,
        })
        .eq('id', editingLottery.id);
      if (error) throw error;
      setSuccessMessage('Campaign updated successfully.');
      setEditingLottery(null);
      fetchLotteries();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update campaign.');
    } finally {
      setEditSaving(false);
    }
  };

  /** Add a new participant to an existing lottery from within the edit modal */
  const handleAddParticipant = async () => {
    if (!editingLottery || !addPartName.trim() || !addPartTicket.trim()) return;
    setAddPartSaving(true);
    try {
      const { data, error } = await supabase
        .from('lottery_participants')
        .insert({
          lottery_id: editingLottery.id,
          name: addPartName.trim(),
          ticket_number: addPartTicket.trim(),
          phone: addPartPhone.trim() || null,
          email: addPartEmail.trim() || null,
          is_winner: false,
        })
        .select('id, name, ticket_number, phone, email, is_winner')
        .single();
      if (error) throw error;
      setEditParticipants((prev) => [...prev, data]);
      setAddPartName('');
      setAddPartTicket('');
      setAddPartPhone('');
      setAddPartEmail('');
      setSuccessMessage('Participant added.');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setAddPartSaving(false);
    }
  };

  /** Remove a participant from an existing lottery */
  const handleRemoveParticipant = async (participantId: string) => {
    try {
      const { error } = await supabase
        .from('lottery_participants')
        .delete()
        .eq('id', participantId);
      if (error) throw error;
      setEditParticipants((prev) => prev.filter((p) => p.id !== participantId));
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  /** Toggle winner flag on a participant */
  const handleToggleWinner = async (participantId: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from('lottery_participants')
        .update({ is_winner: !current })
        .eq('id', participantId);
      if (error) throw error;
      setEditParticipants((prev) =>
        prev.map((p) => (p.id === participantId ? { ...p, is_winner: !current } : p))
      );
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // ── Delete Lottery ────────────────────────────────────────────────────────
  const handleDeleteLottery = async () => {
    if (!deletingLotteryId || deleteConfirmText !== 'DELETE') return;
    setDeleteLoading(true);
    try {
      await supabase.from('lottery_participants').delete().eq('lottery_id', deletingLotteryId);
      await supabase.from('scheduled_draws').delete().eq('lottery_id', deletingLotteryId);
      const { error } = await supabase.from('lotteries').delete().eq('id', deletingLotteryId);
      if (error) throw error;
      setSuccessMessage('Campaign deleted permanently.');
      setDeletingLotteryId(null);
      setDeleteConfirmText('');
      fetchLotteries();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete campaign.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── View Participants ─────────────────────────────────────────────────────
  const openViewModal = async (l: Lottery) => {
    setViewingLottery(l);
    setViewSearch('');
    setViewParticipants([]);
    setViewLoading(true);
    try {
      const { data, error } = await supabase
        .from('lottery_participants')
        .select('id, name, ticket_number, phone, email, is_winner')
        .eq('lottery_id', l.id)
        .order('is_winner', { ascending: false })
        .order('name');
      if (error) throw error;
      setViewParticipants(data || []);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setViewLoading(false);
    }
  };

  // ── Bulk Email ────────────────────────────────────────────────────────────
  const openEmailModal = (l: Lottery) => {
    setEmailModalLottery(l);
    setEmailSubject(`Upcoming Lucky Draw — ${l.title}`);
    setEmailBody(
      `Dear Participant,\n\nWe are excited to inform you about the upcoming draw for "${l.title}".\n\nStay tuned for the live announcement. Best of luck!\n\n— SVI Infra Solutions Team`
    );
  };

  const handleSendBulkEmail = async () => {
    if (!emailModalLottery || !emailSubject.trim() || !emailBody.trim()) return;
    setEmailSending(true);
    try {
      // Fetch all participants with emails
      const { data: parts, error } = await supabase
        .from('lottery_participants')
        .select('email, name')
        .eq('lottery_id', emailModalLottery.id)
        .not('email', 'is', null);
      if (error) throw error;
      const emails = (parts || []).map((p: any) => p.email).filter(Boolean);
      if (emails.length === 0) {
        setErrorMessage('No participants with email addresses found.');
        setEmailSending(false);
        return;
      }
      const htmlBody = emailBody.replace(/\n/g, '<br/>');
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: 'send',
          to: emails,
          subject: emailSubject.trim(),
          html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">${htmlBody}</div>`,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to send emails');
      setSuccessMessage(`✅ Email sent to ${emails.length} participant(s).`);
      setEmailModalLottery(null);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <>
      <div className="space-y-8 pb-12 text-slate-900 transition-colors duration-300 dark:text-slate-100">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end dark:border-white/5">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Command Center: <span className="text-brand-gold italic">Lottery</span>
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
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
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:border-white/5 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
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
              key="error-banner"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 shadow-lg backdrop-blur-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMessage}</span>
              <button
                onClick={() => setErrorMessage(null)}
                className="ml-auto text-red-400 hover:text-red-600 dark:hover:text-white"
              >
                ✕
              </button>
            </motion.div>
          )}
          {successMessage && (
            <motion.div
              key="success-banner"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700 shadow-lg backdrop-blur-sm dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400"
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
                  className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-100 px-4 py-2 text-xs font-bold tracking-wide text-green-800 transition-all hover:bg-green-200 dark:border-green-500/40 dark:bg-green-500/20 dark:text-green-300 dark:hover:bg-green-500/30"
                >
                  Launch Arena ↗
                </a>
              )}
              <button
                onClick={() => setSuccessMessage(null)}
                className="ml-4 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-white"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Visibility Control Card */}
        <div
          className={`relative overflow-hidden rounded-3xl border p-6 transition-all duration-500 ${lotteryVisible ? 'border-brand-gold/40 to-brand-gold/5 bg-gradient-to-br from-white shadow-[0_0_30px_rgba(201,168,76,0.1)] dark:from-[#0e0e14]' : 'border-slate-200 bg-white dark:border-white/10 dark:bg-[#0e0e14]/50'}`}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-colors ${lotteryVisible ? 'bg-brand-gold/20 text-brand-gold' : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-gray-500'}`}
              >
                <Globe className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                  Public Live Broadcast
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
                  {lotteryVisible
                    ? 'The Lottery Arena is LIVE and broadcasting to all public visitors.'
                    : 'The Arena is offline. Public visitors cannot see the drawing.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:shrink-0">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase ${lotteryVisible ? 'border border-green-200 bg-green-50 text-green-600 dark:border-green-500/30 dark:bg-green-500/15 dark:text-green-400' : 'border border-slate-200 bg-slate-50 text-slate-500 dark:border-white/5 dark:bg-white/5 dark:text-gray-500'}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${lotteryVisible ? 'animate-pulse bg-green-500 shadow-[0_0_10px_#4ade80] dark:bg-green-400' : 'bg-slate-400 dark:bg-gray-500'}`}
                />
                {visibilityLoading ? 'Checking…' : lotteryVisible ? 'Broadcasting Live' : 'Offline'}
              </span>
              <button
                onClick={() => toggleLotteryVisibility(!lotteryVisible)}
                disabled={visibilityLoading || visibilityPending}
                className={`focus-visible:ring-brand-gold relative inline-flex h-9 w-16 shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-300 focus:outline-none focus-visible:ring-2 disabled:opacity-50 ${lotteryVisible ? 'border-brand-gold bg-brand-gold shadow-[0_0_15px_rgba(201,168,76,0.5)]' : 'border-slate-300 bg-slate-200 dark:border-white/10 dark:bg-white/5'}`}
              >
                <span
                  className={`inline-block h-6 w-6 rounded-full shadow-md transition-all duration-300 ${lotteryVisible ? 'translate-x-8 bg-white dark:bg-[#0a0a0f]' : 'translate-x-1 bg-white dark:bg-gray-500'}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ── Schedule Draw Panel ─────────────────────────────────────────── */}
        {activeLottery && activeLottery.status === 'active' && activeWinners.length === 0 && (
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#0e0e14]/60">
            {/* Subtle top-left accent */}
            <div className="pointer-events-none absolute -top-20 -left-20 h-56 w-56 rounded-full bg-violet-500/10 blur-[80px]" />
            <div className="relative">
              {/* Header row */}
              <div className="mb-6 flex flex-wrap items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                    Schedule Automated Draw
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-gray-400">
                    Set a date &amp; time and the system will run the draw, send reminders, and
                    email all participants automatically.
                  </p>
                </div>
                {existingSchedule && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold tracking-widest text-violet-600 uppercase dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-300">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-violet-500" />
                    Scheduled
                  </span>
                )}
              </div>

              {scheduleLoading ? (
                <div className="flex items-center justify-center py-8 text-sm text-slate-500 dark:text-gray-400">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Loading schedule…
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Draw Date/Time (IST) */}
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs font-bold tracking-wide text-slate-500 uppercase dark:text-gray-400">
                      Draw Date &amp; Time <span className="text-violet-500">(IST)</span>
                    </label>
                    {/* Quick Schedule Presets */}
                    <div className="mb-3 flex flex-wrap gap-2">
                      {[
                        { label: '+30 min', mins: 30 },
                        { label: '+1 hr', mins: 60 },
                        { label: '+2 hrs', mins: 120 },
                        { label: '+6 hrs', mins: 360 },
                        { label: '+1 day', mins: 1440 },
                        { label: '+2 days', mins: 2880 },
                        { label: '+1 week', mins: 10080 },
                      ].map(({ label, mins }) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() =>
                            setScheduleInputIST(getISTString(new Date(Date.now() + mins * 60000)))
                          }
                          className="cursor-pointer rounded-lg border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-bold text-violet-700 transition-all hover:border-violet-500 hover:bg-violet-500 hover:text-white dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500 dark:hover:text-white"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <Timer className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-gray-500" />
                      <input
                        type="datetime-local"
                        value={scheduleInputIST}
                        onChange={(e) => setScheduleInputIST(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-11 text-sm text-slate-900 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-violet-500 dark:focus:ring-violet-500/20"
                      />
                    </div>
                  </div>

                  {/* Pre-notify duration */}
                  <div>
                    <label className="mb-2 block text-xs font-bold tracking-wide text-slate-500 uppercase dark:text-gray-400">
                      <BellRing className="mr-1.5 inline h-3.5 w-3.5" />
                      Reminder Email — Minutes Before Draw
                    </label>
                    <select
                      value={preNotifyMinutes}
                      onChange={(e) => setPreNotifyMinutes(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-violet-500 dark:focus:ring-violet-500/20"
                    >
                      <option value={15}>15 minutes before</option>
                      <option value={30}>30 minutes before</option>
                      <option value={60}>1 hour before</option>
                      <option value={120}>2 hours before</option>
                      <option value={360}>6 hours before</option>
                      <option value={720}>12 hours before</option>
                      <option value={1440}>24 hours before</option>
                    </select>
                  </div>

                  {/* Toggles */}
                  <div className="flex flex-col gap-4">
                    {/* Show countdown on public site */}
                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                      <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                        Show Countdown on Public Site
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowCountdown((v) => !v)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none ${showCountdown ? 'border-violet-500 bg-violet-500' : 'border-slate-300 bg-slate-200 dark:border-white/10 dark:bg-white/10'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${showCountdown ? 'translate-x-5' : 'translate-x-0.5'}`}
                        />
                      </button>
                    </label>

                    {/* Include countdown in reminder email */}
                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                      <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                        Include Countdown in Reminder Email
                      </span>
                      <button
                        type="button"
                        onClick={() => setIncludeCountdownInEmail((v) => !v)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none ${includeCountdownInEmail ? 'border-violet-500 bg-violet-500' : 'border-slate-300 bg-slate-200 dark:border-white/10 dark:bg-white/10'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${includeCountdownInEmail ? 'translate-x-5' : 'translate-x-0.5'}`}
                        />
                      </button>
                    </label>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                    <button
                      onClick={handleSaveSchedule}
                      disabled={scheduleSaving || !scheduleInputIST}
                      className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-violet-700 hover:shadow-violet-400/30 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {scheduleSaving ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Calendar className="h-4 w-4" />
                      )}
                      {existingSchedule ? 'Update Schedule' : 'Schedule Draw'}
                    </button>

                    {existingSchedule && (
                      <button
                        onClick={handleCancelSchedule}
                        disabled={scheduleSaving}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-6 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-100 disabled:opacity-50 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel Schedule
                      </button>
                    )}

                    {existingSchedule && (
                      <span className="text-xs text-slate-500 dark:text-gray-400">
                        Scheduled for{' '}
                        <strong className="text-slate-700 dark:text-gray-300">
                          {new Date(existingSchedule.scheduled_at).toLocaleString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}{' '}
                          IST
                        </strong>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Active Lottery Section */}
            {activeLottery ? (
              <div className="border-brand-gold/30 relative rounded-3xl border bg-white p-8 shadow-[0_0_40px_rgba(201,168,76,0.15)] dark:bg-[#0a0a0f]">
                {/* Decorative backgrounds contained in an overflow-hidden wrapper */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                  <div className="bg-brand-gold/10 absolute -top-32 -right-32 h-96 w-96 rounded-full blur-[100px]" />
                  <div className="bg-brand-gold/5 absolute -bottom-32 -left-32 h-96 w-96 rounded-full blur-[100px]" />
                </div>

                <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold tracking-widest uppercase backdrop-blur-md">
                      <span className="bg-brand-gold h-2 w-2 animate-pulse rounded-full"></span>{' '}
                      Ready for Draw
                    </div>
                    <h2 className="font-serif text-4xl font-bold text-slate-900 dark:text-white">
                      {activeLottery.title}
                    </h2>
                    <p className="max-w-2xl text-base text-slate-600 dark:text-gray-400">
                      {activeLottery.description || 'No description provided.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-6 pt-2 text-sm font-medium text-slate-600 dark:text-gray-400">
                      <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/5 dark:bg-white/5">
                        <div className="bg-brand-gold/20 text-brand-gold flex h-10 w-10 items-center justify-center rounded-xl">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-xl font-bold text-slate-900 dark:text-white">
                            {activeParticipantsCount}
                          </div>
                          <div className="text-[10px] tracking-wider text-slate-500 uppercase dark:text-gray-500">
                            Participants
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/5 dark:bg-white/5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-white">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-xl font-bold text-slate-900 dark:text-white">
                            {new Date(activeLottery.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-[10px] tracking-wider text-slate-500 uppercase dark:text-gray-500">
                            Creation Date
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Drawing Method Selector & Manual Winner Search */}
                    {activeWinners.length === 0 && (
                      <div className="mt-6 max-w-lg space-y-4 border-t border-slate-100 pt-6 dark:border-white/5">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-gray-500">
                            Choose Drawing Method
                          </label>
                          <div className="inline-flex w-full rounded-xl bg-slate-100 p-1 dark:bg-white/5">
                            <button
                              type="button"
                              onClick={() => setDrawMethod('random')}
                              className={`flex-1 cursor-pointer rounded-lg py-2.5 text-xs font-bold transition-all ${
                                drawMethod === 'random'
                                  ? 'bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white'
                                  : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                              }`}
                            >
                              Random Draw
                            </button>
                            <button
                              type="button"
                              onClick={() => setDrawMethod('manual')}
                              className={`flex-1 cursor-pointer rounded-lg py-2.5 text-xs font-bold transition-all ${
                                drawMethod === 'manual'
                                  ? 'bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white'
                                  : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                              }`}
                            >
                              Predetermined Winner
                            </button>
                          </div>
                        </div>

                        {/* Manual Winner Lookup UI */}
                        {drawMethod === 'manual' && (
                          <div className="space-y-3">
                            <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-gray-500">
                              Search & Select Predetermined Winner
                            </label>

                            {/* Search Input Container */}
                            <div className="relative">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-4 w-4 text-slate-400 dark:text-gray-500" />
                              </div>
                              <input
                                type="text"
                                value={dbParticipantsSearch}
                                onChange={(e) => setDbParticipantsSearch(e.target.value)}
                                placeholder="Search by name or ticket number..."
                                className="focus:border-brand-gold/50 focus:ring-brand-gold/50 w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm transition-all outline-none placeholder:text-slate-400 focus:ring-1 dark:border-white/10 dark:bg-white/5 dark:text-white"
                              />
                              {dbParticipantsLoading && (
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                  <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
                                </div>
                              )}
                            </div>

                            {/* Search Results Dropdown */}
                            {dbParticipantsSearch.trim() && dbParticipants.length > 0 && (
                              <div className="relative">
                                <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-[#0c0c12]">
                                  {dbParticipants.map((participant) => (
                                    <button
                                      key={participant.id}
                                      type="button"
                                      onClick={() => {
                                        setSelectedPredeterminedWinners((prev) => {
                                          const exists = prev.find((w) => w.id === participant.id);
                                          if (exists)
                                            return prev.filter((w) => w.id !== participant.id);
                                          return [...prev, participant];
                                        });
                                        setDbParticipantsSearch('');
                                      }}
                                      className="flex w-full cursor-pointer items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                                    >
                                      <div>
                                        <div className="font-semibold text-slate-900 dark:text-white">
                                          {participant.name}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-gray-400">
                                          {participant.email ||
                                            participant.phone ||
                                            'No contact info'}
                                        </div>
                                      </div>
                                      <div className="border-brand-gold/30 text-brand-gold bg-brand-gold/5 rounded-md border px-2 py-0.5 font-mono text-xs font-bold">
                                        {participant.ticket_number}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* No Results message */}
                            {dbParticipantsSearch.trim() &&
                              dbParticipants.length === 0 &&
                              !dbParticipantsLoading && (
                                <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 dark:border-white/10 dark:text-gray-500">
                                  No participants matched your search.
                                </div>
                              )}

                            {/* Selected Winners Badge */}
                            {selectedPredeterminedWinners.length > 0 && (
                              <div className="border-brand-gold/30 bg-brand-gold/5 space-y-2 rounded-xl border p-4 backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="bg-brand-gold/20 text-brand-gold flex h-8 w-8 items-center justify-center rounded-lg">
                                      <Trophy className="h-4 w-4" />
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-gray-400">
                                      {selectedPredeterminedWinners.length} Selected Winner
                                      {selectedPredeterminedWinners.length > 1 ? 's' : ''}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedPredeterminedWinners([])}
                                    className="cursor-pointer text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300"
                                  >
                                    <XCircle className="h-5 w-5" />
                                  </button>
                                </div>
                                {selectedPredeterminedWinners.map((sw) => (
                                  <div
                                    key={sw.id}
                                    className="flex items-center justify-between pl-11"
                                  >
                                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                                      {sw.name}{' '}
                                      <span className="font-mono text-xs font-semibold text-slate-400">
                                        ({sw.ticket_number})
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSelectedPredeterminedWinners((prev) =>
                                          prev.filter((w) => w.id !== sw.id)
                                        )
                                      }
                                      className="cursor-pointer text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-4 self-center lg:mt-16 lg:self-start">
                    {activeWinners.length > 0 ? (
                      <div className="border-brand-gold/30 flex flex-col items-center justify-center gap-4 rounded-3xl border bg-gradient-to-b from-slate-50 to-white p-8 shadow-2xl dark:from-[#1a1a24] dark:to-[#0a0a0f]">
                        <div className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold flex h-16 w-16 items-center justify-center rounded-full border shadow-[0_0_20px_rgba(201,168,76,0.3)]">
                          <Trophy className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                          <div className="text-brand-gold mb-1 text-[10px] font-bold tracking-widest uppercase">
                            {activeWinners.length === 1
                              ? 'Winner Declared'
                              : `${activeWinners.length} Winners Declared`}
                          </div>
                          <div className="space-y-3">
                            {activeWinners.map((w, idx) => (
                              <div key={w.id}>
                                {activeWinners.length > 1 && (
                                  <div className="mb-0.5 text-[9px] font-medium tracking-widest text-slate-400 uppercase dark:text-slate-500">
                                    Winner #{idx + 1}
                                  </div>
                                )}
                                <div className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                                  {w.name}
                                </div>
                                <div className="mt-1 inline-block rounded bg-slate-100 px-3 py-1 font-mono text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-gray-300">
                                  {w.ticket_number}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => resetDraw(activeLottery.id)}
                          disabled={isPending}
                          className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-6 py-2.5 text-xs font-bold tracking-wider text-slate-600 uppercase transition-all hover:bg-slate-200 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
                        >
                          <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />{' '}
                          Reset Draw
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          drawWinner(
                            drawMethod === 'manual'
                              ? selectedPredeterminedWinners.map((w) => w.id)
                              : undefined
                          )
                        }
                        disabled={
                          isPending ||
                          (drawMethod === 'manual' && selectedPredeterminedWinners.length === 0)
                        }
                        className="group bg-brand-gold text-brand-navy relative flex cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-2xl px-10 py-6 text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(201,168,76,0.6)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                      >
                        <div className="absolute inset-0 flex h-full w-full [transform:skew(-12deg)_translateX(-100%)] justify-center group-hover:[transform:skew(-12deg)_translateX(100%)] group-hover:duration-1000">
                          <div className="relative h-full w-8 bg-white/30" />
                        </div>
                        <Play className="fill-brand-navy h-6 w-6" />{' '}
                        {drawMethod === 'manual' ? 'Execute Preset Draw' : 'Execute Live Draw'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-16 text-center dark:border-white/20 dark:bg-[#0e0e14]/30">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-gray-600">
                  <Award className="h-10 w-10" />
                </div>
                <h3 className="mb-2 font-serif text-2xl font-bold text-slate-900 dark:text-white">
                  No Active Campaigns
                </h3>
                <p className="mb-8 max-w-md text-sm text-slate-500 dark:text-gray-400">
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
              <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                Archive & History
              </h3>
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white backdrop-blur-md dark:border-white/10 dark:bg-[#0e0e14]/60">
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
                      {lotteries.map((l) => (
                        <tr
                          key={l.id}
                          className="transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                        >
                          <td className="px-8 py-5 font-bold text-slate-900 dark:text-white">
                            {l.title}
                          </td>
                          <td className="px-8 py-5 text-slate-500 dark:text-gray-400">
                            {new Date(l.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${
                                l.status === 'active'
                                  ? 'border-green-200 bg-green-50 text-green-600 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400'
                                  : l.status === 'completed'
                                    ? 'border-brand-gold/30 bg-brand-gold/10 text-brand-gold'
                                    : 'border-slate-200 bg-slate-100 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400'
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
                                <div className="mt-1 font-mono text-[10px] text-slate-500 dark:text-gray-500">
                                  Ticket: {l.winner.ticket_number}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic dark:text-gray-500">
                                Pending Draw
                              </span>
                            )}
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* View Participants */}
                              <button
                                title="View Participants"
                                onClick={() => openViewModal(l)}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-blue-400/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">View</span>
                              </button>
                              {/* Edit */}
                              <button
                                title="Edit Campaign"
                                onClick={() => openEditModal(l)}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-violet-400/40 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Edit</span>
                              </button>
                              {/* Send Email */}
                              <button
                                title="Send Email to Participants"
                                onClick={() => openEmailModal(l)}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-amber-400/40 dark:hover:bg-amber-500/10 dark:hover:text-amber-300"
                              >
                                <Mail className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Email</span>
                              </button>
                              {/* Re-open */}
                              <button
                                title="Re-open Draw"
                                onClick={() => resetDraw(l.id)}
                                disabled={isPending}
                                className="hover:border-brand-gold/40 hover:bg-brand-gold/10 hover:text-brand-gold inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition-all dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
                              >
                                <RefreshCw
                                  className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`}
                                />
                                <span className="hidden sm:inline">Re-open</span>
                              </button>
                              {/* Delete */}
                              <button
                                title="Delete Campaign"
                                onClick={() => {
                                  setDeletingLotteryId(l.id);
                                  setDeleteConfirmText('');
                                }}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-500 transition-all hover:border-red-400 hover:bg-red-500 hover:text-white dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {lotteries.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-8 py-12 text-center text-slate-400 italic dark:text-gray-500"
                          >
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
          <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl backdrop-blur-xl md:p-12 dark:border-white/10 dark:bg-[#0e0e14]/80 dark:shadow-2xl">
            {/* Wizard Progress Bar */}
            <div className="mb-12">
              <div className="relative flex items-center justify-between">
                <div className="absolute top-1/2 right-0 left-0 h-0.5 -translate-y-1/2 bg-slate-200 dark:bg-white/10" />
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
                          : 'border-slate-200 bg-white text-slate-400 dark:border-white/20 dark:bg-[#0e0e14] dark:text-gray-500'
                      }`}
                    >
                      {wizardStep > step ? <CheckCircle2 className="h-6 w-6" /> : step}
                    </div>
                    <span
                      className={`text-[10px] font-bold tracking-widest uppercase ${wizardStep >= step ? 'text-brand-gold' : 'text-slate-400 dark:text-gray-500'}`}
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
                      <h3 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
                        Campaign Details
                      </h3>
                      <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
                        Give your lucky draw a grand title and exciting description.
                      </p>
                    </div>

                    <div className="mx-auto max-w-2xl space-y-6">
                      {/* Campaign Preset Selector */}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                        <label className="mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-gray-400">
                          <Zap className="text-brand-gold mr-1.5 inline h-3.5 w-3.5" />
                          Quick Campaign Presets
                        </label>
                        <select
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) return;
                            const presets: Record<string, { title: string; desc: string }> = {
                              villa: {
                                title: 'SVI Grand Villa Lucky Draw',
                                desc: 'Win a premium villa in our exclusive residential community. One lucky winner gets a chance at a dream home.',
                              },
                              plot: {
                                title: 'Premium Residential Plot Giveaway',
                                desc: 'Win a fully developed residential plot. All registered customers are eligible to participate.',
                              },
                              apartment: {
                                title: 'Luxury High-Rise Apartment Lucky Draw',
                                desc: 'Exclusive token-based draw for a premium high-rise apartment in our flagship project.',
                              },
                              commercial: {
                                title: 'Commercial Space Premium Lottery',
                                desc: 'Win a commercial office/shop space in our prime business district. Limited entries only.',
                              },
                              loyalty: {
                                title: 'Investor Loyalty Reward Draw',
                                desc: 'Exclusive draw for our loyal investors. Thank you for being part of the SVI Infra family.',
                              },
                              festival: {
                                title: 'Festival Special Lucky Draw',
                                desc: 'Celebrate the festive season with an exclusive plot & villa lucky draw for all registered customers.',
                              },
                            };
                            const p = presets[val];
                            if (p) {
                              setTitle(p.title);
                              setDescription(p.desc);
                            }
                            e.target.value = '';
                          }}
                          defaultValue=""
                          className="focus:border-brand-gold/50 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-gray-300"
                        >
                          <option value="">— Select a preset to auto-fill fields —</option>
                          <option value="villa">🏡 SVI Grand Villa Lucky Draw</option>
                          <option value="plot">🌳 Premium Residential Plot Giveaway</option>
                          <option value="apartment">🏢 Luxury High-Rise Apartment Draw</option>
                          <option value="commercial">🏬 Commercial Space Premium Lottery</option>
                          <option value="loyalty">⭐ Investor Loyalty Reward Draw</option>
                          <option value="festival">🎉 Festival Special Lucky Draw</option>
                        </select>
                        <p className="mt-2 text-[10px] text-slate-400 dark:text-gray-500">
                          Selecting a preset fills the title and description. You can then edit
                          freely.
                        </p>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold tracking-wider text-slate-600 uppercase dark:text-gray-300">
                          Lottery Title <span className="text-brand-gold">*</span>
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g., Summer Villa Mega Giveaway"
                          className="focus:border-brand-gold/50 w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-lg font-bold text-slate-900 transition-all outline-none focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-bold tracking-wider text-slate-600 uppercase dark:text-gray-300">
                          Description / Prizes
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe the grand prize and rules..."
                          rows={4}
                          className="focus:border-brand-gold/50 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-900 transition-all outline-none focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10"
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
                      <h3 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
                        Load Participants
                      </h3>
                      <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
                        Upload your customer spreadsheet or add entries manually.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                      <div className="lg:col-span-2">
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/5">
                          <div className="mb-6 flex gap-2 rounded-xl bg-slate-200 p-1 dark:bg-black/40">
                            <button
                              type="button"
                              onClick={() => setEntryMethod('upload')}
                              className={`flex-1 rounded-lg py-2.5 text-[10px] font-bold tracking-widest uppercase transition-all ${entryMethod === 'upload' ? 'text-brand-gold bg-white shadow-sm dark:bg-white/10' : 'text-slate-500 hover:text-slate-900 dark:text-gray-500 dark:hover:text-white'}`}
                            >
                              Upload File
                            </button>
                            <button
                              type="button"
                              onClick={() => setEntryMethod('manual')}
                              className={`flex-1 rounded-lg py-2.5 text-[10px] font-bold tracking-widest uppercase transition-all ${entryMethod === 'manual' ? 'text-brand-gold bg-white shadow-sm dark:bg-white/10' : 'text-slate-500 hover:text-slate-900 dark:text-gray-500 dark:hover:text-white'}`}
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
                              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${dragOver ? 'border-brand-gold bg-brand-gold/10 scale-105' : 'hover:border-brand-gold/50 border-slate-300 bg-transparent hover:bg-slate-100 dark:border-white/20 dark:hover:bg-white/5'}`}
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
                              <div className="mb-1 font-bold text-slate-900 dark:text-white">
                                Click or Drop File Here
                              </div>
                              <div className="text-xs text-slate-500 dark:text-gray-500">
                                CSV, XLSX supported
                              </div>
                            </div>
                          ) : (
                            <form onSubmit={handleManualAdd} className="space-y-4">
                              <input
                                type="text"
                                required
                                value={manualName}
                                onChange={(e) => setManualName(e.target.value)}
                                placeholder="Full Name *"
                                className="focus:border-brand-gold/50 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 outline-none dark:border-white/10 dark:bg-black/40 dark:text-white"
                              />
                              <input
                                type="text"
                                value={manualTicket}
                                onChange={(e) => setManualTicket(e.target.value)}
                                placeholder="Ticket # (Auto if blank)"
                                className="focus:border-brand-gold/50 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 outline-none dark:border-white/10 dark:bg-black/40 dark:text-white"
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
                        <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/5">
                          <div className="mb-6 flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-white">
                                Participants List
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-gray-400">
                                {participants.length} valid entries
                              </p>
                            </div>
                            {participants.length > 0 && (
                              <button
                                onClick={() => setParticipants([])}
                                className="cursor-pointer rounded-lg px-3 py-1.5 text-[10px] font-bold text-red-500 uppercase transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-400/10"
                              >
                                Clear All
                              </button>
                            )}
                          </div>

                          {participants.length === 0 ? (
                            <div className="flex flex-1 flex-col items-center justify-center text-center text-slate-400 dark:text-gray-500">
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
                                  className="focus:border-brand-gold/50 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none dark:border-white/10 dark:bg-black/40 dark:text-white"
                                />
                              </div>
                              <div className="flex-1 overflow-y-auto">
                                <div className="space-y-2">
                                  {paginatedParticipants.map((p, idx) => {
                                    const originalIdx = (currentPage - 1) * itemsPerPage + idx;
                                    return (
                                      <div
                                        key={originalIdx}
                                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 hover:border-slate-300 dark:border-white/5 dark:bg-black/20 dark:hover:border-white/10"
                                      >
                                        <div>
                                          <div className="text-sm font-bold text-slate-900 dark:text-white">
                                            {p.name}
                                          </div>
                                          <div className="text-brand-gold font-mono text-[10px]">
                                            {p.ticketNumber}
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => removeParticipant(originalIdx)}
                                          className="cursor-pointer p-2 text-slate-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                              {totalPages > 1 && (
                                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-white/5">
                                  <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                                    className="cursor-pointer text-xs font-bold text-slate-500 hover:text-slate-900 disabled:opacity-30 dark:text-gray-400 dark:hover:text-white"
                                  >
                                    Prev
                                  </button>
                                  <span className="text-xs text-slate-500 dark:text-gray-500">
                                    {currentPage} / {totalPages}
                                  </span>
                                  <button
                                    disabled={currentPage === totalPages}
                                    onClick={() =>
                                      setCurrentPage((c) => Math.min(totalPages, c + 1))
                                    }
                                    className="cursor-pointer text-xs font-bold text-slate-500 hover:text-slate-900 disabled:opacity-30 dark:text-gray-400 dark:hover:text-white"
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
                      <h3 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
                        Review & Launch
                      </h3>
                      <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
                        Verify details before pushing the campaign live.
                      </p>
                    </div>

                    <div className="border-brand-gold/30 mx-auto max-w-2xl overflow-hidden rounded-3xl border bg-white shadow-[0_0_40px_rgba(201,168,76,0.15)] dark:bg-[#0a0a0f]">
                      <div className="border-b border-slate-100 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-white/5">
                        <div className="bg-brand-gold/20 text-brand-gold mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                          <Sparkles className="h-8 w-8" />
                        </div>
                        <h4 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
                          {title}
                        </h4>
                        <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
                          {description}
                        </p>
                      </div>
                      <div className="p-8">
                        <div className="flex justify-around">
                          <div className="text-center">
                            <div className="text-brand-gold text-3xl font-bold">
                              {participants.length}
                            </div>
                            <div className="mt-1 text-[10px] font-bold tracking-widest text-slate-500 uppercase dark:text-gray-500">
                              Total Entries
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-500 dark:text-green-400">
                              1
                            </div>
                            <div className="mt-1 text-[10px] font-bold tracking-widest text-slate-500 uppercase dark:text-gray-500">
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
            <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-8 dark:border-white/10">
              <button
                onClick={handlePrevWizardStep}
                disabled={wizardStep === 1}
                className="flex cursor-pointer items-center gap-2 rounded-xl px-6 py-3 text-xs font-bold tracking-wider text-slate-500 uppercase transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:invisible dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
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
                  className="group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-xl bg-green-500 px-10 py-3.5 text-xs font-bold tracking-widest text-white uppercase transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(74,222,128,0.4)] disabled:bg-slate-200 disabled:text-slate-400 dark:text-black dark:disabled:bg-gray-700 dark:disabled:text-gray-500"
                >
                  <div className="absolute inset-0 flex h-full w-full [transform:skew(-12deg)_translateX(-100%)] justify-center group-hover:[transform:skew(-12deg)_translateX(100%)] group-hover:duration-1000">
                    <div className="relative h-full w-8 bg-white/30" />
                  </div>
                  {isPending ? 'Launching...' : 'Deploy Campaign'}{' '}
                  <Play className="h-4 w-4 fill-white dark:fill-black" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────────
          EDIT CAMPAIGN MODAL
      ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editingLottery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setEditingLottery(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="flex w-full max-w-2xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0e0e14]"
              style={{ maxHeight: '90vh' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 p-6 dark:border-white/10">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                    Edit Campaign
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Full control — details, status, winner & participants.
                  </p>
                </div>
                <button
                  onClick={() => setEditingLottery(null)}
                  className="cursor-pointer rounded-xl border border-slate-200 p-2 text-slate-400 transition-colors hover:text-slate-700 dark:border-white/10 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-100 dark:border-white/10">
                {(['details', 'winner', 'participants'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setEditTab(tab)}
                    className={`flex-1 cursor-pointer py-3 text-xs font-bold tracking-wider uppercase transition-colors ${
                      editTab === tab
                        ? 'border-b-2 border-violet-500 text-violet-600 dark:text-violet-400'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab === 'details' && '📋 Details'}
                    {tab === 'winner' && '🏆 Winner'}
                    {tab === 'participants' && `👥 Participants (${editParticipants.length})`}
                  </button>
                ))}
              </div>

              {/* Tab Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* ── DETAILS TAB ──────────────────────────────────────── */}
                {editTab === 'details' && (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase dark:text-gray-400">
                        Campaign Title *
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase dark:text-gray-400">
                        Description
                      </label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={4}
                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase dark:text-gray-400">
                        Status
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as any)}
                        className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                      >
                        <option value="active">🟢 Active</option>
                        <option value="inactive">⚪ Inactive</option>
                        <option value="completed">✅ Completed</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* ── WINNER TAB ───────────────────────────────────────── */}
                {editTab === 'winner' && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-3 text-xs text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                      Manually set or override the winner details. Leave Name blank to remove any
                      existing winner record.
                    </div>
                    {[
                      {
                        label: 'Winner Name',
                        val: editWinnerName,
                        set: setEditWinnerName,
                        ph: 'Full Name',
                      },
                      {
                        label: 'Ticket Number',
                        val: editWinnerTicket,
                        set: setEditWinnerTicket,
                        ph: 'e.g. A-1042',
                      },
                      {
                        label: 'Phone',
                        val: editWinnerPhone,
                        set: setEditWinnerPhone,
                        ph: '+91 98765 43210',
                      },
                      {
                        label: 'Email',
                        val: editWinnerEmail,
                        set: setEditWinnerEmail,
                        ph: 'winner@email.com',
                      },
                    ].map(({ label, val, set, ph }) => (
                      <div key={label}>
                        <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase dark:text-gray-400">
                          {label}
                        </label>
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => set(e.target.value)}
                          placeholder={ph}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500"
                        />
                      </div>
                    ))}
                    {editWinnerName.trim() && (
                      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                        <span className="text-2xl">🏆</span>
                        <div>
                          <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                            {editWinnerName}
                          </p>
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            Ticket: {editWinnerTicket || '—'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── PARTICIPANTS TAB ─────────────────────────────────── */}
                {editTab === 'participants' && (
                  <div className="space-y-4">
                    {/* Add new participant */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                      <p className="mb-3 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-gray-400">
                        ➕ Add New Participant
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Full Name *"
                          value={addPartName}
                          onChange={(e) => setAddPartName(e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-[#0e0e14] dark:text-white dark:placeholder-gray-500"
                        />
                        <input
                          type="text"
                          placeholder="Ticket # *"
                          value={addPartTicket}
                          onChange={(e) => setAddPartTicket(e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-[#0e0e14] dark:text-white dark:placeholder-gray-500"
                        />
                        <input
                          type="text"
                          placeholder="Phone"
                          value={addPartPhone}
                          onChange={(e) => setAddPartPhone(e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-[#0e0e14] dark:text-white dark:placeholder-gray-500"
                        />
                        <input
                          type="text"
                          placeholder="Email"
                          value={addPartEmail}
                          onChange={(e) => setAddPartEmail(e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-[#0e0e14] dark:text-white dark:placeholder-gray-500"
                        />
                      </div>
                      <button
                        onClick={handleAddParticipant}
                        disabled={addPartSaving || !addPartName.trim() || !addPartTicket.trim()}
                        className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white transition hover:bg-violet-700 disabled:opacity-40"
                      >
                        {addPartSaving ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" />
                        )}
                        Add Participant
                      </button>
                    </div>

                    {/* Search */}
                    <input
                      type="text"
                      placeholder="Search name, ticket, email…"
                      value={editPartsSearch}
                      onChange={(e) => setEditPartsSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500"
                    />

                    {/* Participant list */}
                    {editPartsLoading ? (
                      <div className="flex items-center justify-center py-8 text-slate-400">
                        <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Loading…
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {editParticipants
                          .filter(
                            (p) =>
                              !editPartsSearch ||
                              p.name.toLowerCase().includes(editPartsSearch.toLowerCase()) ||
                              p.ticket_number
                                .toLowerCase()
                                .includes(editPartsSearch.toLowerCase()) ||
                              (p.email &&
                                p.email.toLowerCase().includes(editPartsSearch.toLowerCase()))
                          )
                          .map((p) => (
                            <div
                              key={p.id}
                              className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${p.is_winner ? 'border-amber-300 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10' : 'border-slate-200 bg-white dark:border-white/10 dark:bg-white/5'}`}
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                {p.is_winner && <span className="text-sm">🏆</span>}
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                                    {p.name}
                                  </p>
                                  <p className="text-[10px] text-slate-400">
                                    #{p.ticket_number}
                                    {p.email ? ` · ${p.email}` : ''}
                                  </p>
                                </div>
                              </div>
                              <div className="flex shrink-0 items-center gap-1 pl-2">
                                <button
                                  onClick={() => handleToggleWinner(p.id, p.is_winner)}
                                  title={p.is_winner ? 'Remove winner flag' : 'Mark as winner'}
                                  className={`rounded-lg px-2 py-1 text-[10px] font-bold transition ${p.is_winner ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-300' : 'bg-slate-100 text-slate-500 hover:bg-amber-100 hover:text-amber-700 dark:bg-white/10 dark:text-gray-400'}`}
                                >
                                  {p.is_winner ? '★ Winner' : '☆ Win'}
                                </button>
                                <button
                                  onClick={() => handleRemoveParticipant(p.id)}
                                  className="rounded-lg p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        {editParticipants.length === 0 && (
                          <p className="py-6 text-center text-sm text-slate-400">
                            No participants yet.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer — save & cancel (only shown on details/winner tabs) */}
              {editTab !== 'participants' && (
                <div className="flex gap-3 border-t border-slate-100 p-6 dark:border-white/10">
                  <button
                    onClick={() => setEditingLottery(null)}
                    className="flex-1 cursor-pointer rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSave}
                    disabled={editSaving || !editTitle.trim()}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
                  >
                    {editSaving ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Save Changes
                  </button>
                </div>
              )}
              {editTab === 'participants' && (
                <div className="border-t border-slate-100 p-4 text-center dark:border-white/10">
                  <p className="text-xs text-slate-400">
                    Changes to participants are saved immediately above.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ────────────────────────────────────────────────────────────
          DELETE CONFIRM MODAL
      ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {deletingLotteryId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setDeletingLotteryId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 shadow-2xl dark:border-red-500/30 dark:bg-[#0e0e14]"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                Delete Campaign?
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
                This will permanently delete the campaign, all its participants, and scheduled
                draws. This action <strong>cannot be undone</strong>.
              </p>
              <div className="mt-5">
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-gray-400">
                  Type <span className="font-mono text-red-500">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-900 focus:border-red-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setDeletingLotteryId(null)}
                  className="flex-1 cursor-pointer rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteLottery}
                  disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-bold text-white transition-all hover:bg-red-700 disabled:opacity-40"
                >
                  {deleteLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ────────────────────────────────────────────────────────────
          VIEW PARTICIPANTS MODAL
      ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {viewingLottery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setViewingLottery(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="flex h-[85vh] w-full max-w-3xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0e0e14]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5 dark:border-white/10">
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                    {viewingLottery.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {viewParticipants.length} participant(s)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      openEmailModal(viewingLottery);
                      setViewingLottery(null);
                    }}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-600 hover:bg-amber-500 hover:text-white dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white"
                  >
                    <Mail className="h-3.5 w-3.5" /> Email All
                  </button>
                  <button
                    onClick={() => setViewingLottery(null)}
                    className="cursor-pointer rounded-xl border border-slate-200 p-2 text-slate-400 hover:text-slate-600 dark:border-white/10 dark:hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {/* Search */}
              <div className="border-b border-slate-100 px-8 py-4 dark:border-white/10">
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={viewSearch}
                    onChange={(e) => setViewSearch(e.target.value)}
                    placeholder="Search by name, ticket, email, or phone…"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-9 text-sm text-slate-700 focus:border-blue-300 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
                  />
                </div>
              </div>
              {/* Table */}
              <div className="flex-1 overflow-y-auto">
                {viewLoading ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Loading participants…
                  </div>
                ) : (
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="sticky top-0 border-b border-slate-100 bg-slate-50 text-[10px] font-bold tracking-widest text-slate-500 uppercase dark:border-white/10 dark:bg-black/60 dark:text-gray-400">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Ticket #</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Phone</th>
                        <th className="px-6 py-4 text-center">Winner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                      {viewParticipants
                        .filter((p) => {
                          if (!viewSearch) return true;
                          const q = viewSearch.toLowerCase();
                          return (
                            p.name?.toLowerCase().includes(q) ||
                            p.ticket_number?.toLowerCase().includes(q) ||
                            p.email?.toLowerCase().includes(q) ||
                            p.phone?.includes(q)
                          );
                        })
                        .map((p) => (
                          <tr
                            key={p.id}
                            className={`transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${p.is_winner ? 'bg-amber-50/40 dark:bg-amber-500/5' : ''}`}
                          >
                            <td
                              className={`px-6 py-3 font-semibold ${p.is_winner ? 'text-brand-gold' : 'text-slate-800 dark:text-white'}`}
                            >
                              {p.is_winner && (
                                <Trophy className="text-brand-gold mr-1.5 inline h-3.5 w-3.5" />
                              )}
                              {p.name}
                            </td>
                            <td className="px-6 py-3 font-mono text-xs text-slate-500 dark:text-gray-400">
                              {p.ticket_number}
                            </td>
                            <td className="px-6 py-3 text-xs text-slate-500 dark:text-gray-400">
                              {p.email || '—'}
                            </td>
                            <td className="px-6 py-3 text-xs text-slate-500 dark:text-gray-400">
                              {p.phone || '—'}
                            </td>
                            <td className="px-6 py-3 text-center">
                              {p.is_winner ? (
                                <span className="text-brand-gold text-lg">🏆</span>
                              ) : (
                                <span className="text-slate-300 dark:text-white/20">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ────────────────────────────────────────────────────────────
          BULK EMAIL MODAL
      ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {emailModalLottery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setEmailModalLottery(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-white/10 dark:bg-[#0e0e14]"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                    Send Bulk Email
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Sending to all participants of{' '}
                    <span className="font-semibold text-slate-600 dark:text-gray-300">
                      {emailModalLottery.title}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setEmailModalLottery(null)}
                  className="cursor-pointer rounded-xl border border-slate-200 p-2 text-slate-400 hover:text-slate-600 dark:border-white/10 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Template chips */}
              <div className="mb-4">
                <p className="mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Quick Templates
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      label: '📢 Announcement',
                      subject: `Draw Announcement — ${emailModalLottery.title}`,
                      body: `Dear Participant,\n\nWe are excited to announce that the lucky draw for "${emailModalLottery.title}" is now live!\n\nBest of luck to all our valued participants.\n\n— SVI Infra Solutions Team`,
                    },
                    {
                      label: '⏰ Reminder',
                      subject: `Reminder: Draw Coming Up — ${emailModalLottery.title}`,
                      body: `Dear Participant,\n\nThis is a friendly reminder that the lucky draw for "${emailModalLottery.title}" is happening very soon.\n\nStay tuned for the live draw!\n\n— SVI Infra Solutions Team`,
                    },
                    {
                      label: '🏆 Winner Notice',
                      subject: `Winner Declared — ${emailModalLottery.title}`,
                      body: `Dear Participant,\n\nThe lucky draw for "${emailModalLottery.title}" has concluded. Please check the official website to view the winner details.\n\nThank you for participating!\n\n— SVI Infra Solutions Team`,
                    },
                  ].map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => {
                        setEmailSubject(t.subject);
                        setEmailBody(t.body);
                      }}
                      className="cursor-pointer rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-600 transition-all hover:bg-amber-500 hover:text-white dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase dark:text-gray-400">
                    Email Subject *
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase dark:text-gray-400">
                    Message Body *
                  </label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={8}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
                    placeholder="Write your email message here…"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setEmailModalLottery(null)}
                  className="flex-1 cursor-pointer rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 dark:border-white/10 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendBulkEmail}
                  disabled={emailSending || !emailSubject.trim() || !emailBody.trim()}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-white transition-all hover:bg-amber-600 disabled:opacity-50"
                >
                  {emailSending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {emailSending ? 'Sending…' : 'Send to All Participants'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
