'use client';

import { useState, useCallback, useRef } from 'react';
import type { Participant } from '../types';

export interface UseParticipantManagementReturn {
  participants: Participant[];
  dragOver: boolean;
  searchTerm: string;
  currentPage: number;
  itemsPerPage: number;
  entryMethod: 'upload' | 'manual';
  manualName: string;
  manualPhone: string;
  manualEmail: string;
  manualTicket: string;
  setDragOver: (v: boolean) => void;
  setSearchTerm: (v: string) => void;
  setCurrentPage: (v: number) => void;
  setEntryMethod: (v: 'upload' | 'manual') => void;
  setManualName: (v: string) => void;
  setManualPhone: (v: string) => void;
  setManualEmail: (v: string) => void;
  setManualTicket: (v: string) => void;
  setParticipants: (p: Participant[]) => void;
  handleFileUpload: (
    file: File,
    onError: (msg: string | null) => void,
    onSuccess: (msg: string | null) => void
  ) => void;
  handleManualAdd: (
    onError: (msg: string | null) => void,
    onSuccess: (msg: string | null) => void
  ) => void;
  removeParticipant: (index: number) => void;
  filteredParticipants: Participant[];
  paginatedParticipants: Participant[];
  totalPages: number;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function useParticipantManagement(): UseParticipantManagementReturn {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entryMethod, setEntryMethod] = useState<'upload' | 'manual'>('upload');
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualTicket, setManualTicket] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsPerPage = 8;

  const parseCSVData = useCallback(
    (
      text: string,
      onError: (msg: string | null) => void,
      onSuccess: (msg: string | null) => void
    ) => {
      try {
        const lines = text.split(/\r?\n/);
        if (lines.length === 0 || !lines[0].trim()) {
          onError('Uploaded file is empty.');
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
          onError('Could not find a column named "Name" in the CSV header.');
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
            ticketIdx !== -1 && cols[ticketIdx]
              ? cols[ticketIdx]
              : `SVI-${1000 + parsed.length + 1}`;

          parsed.push({ name, phone, email, ticketNumber });
        }

        setParticipants(parsed);
        setCurrentPage(1);
        onSuccess(`Successfully loaded ${parsed.length} rows from CSV!`);
      } catch {
        onError('Failed to parse CSV file. Please verify CSV formatting.');
      }
    },
    []
  );

  const parseExcelData = useCallback(
    (
      sheets: any[],
      onError: (msg: string | null) => void,
      onSuccess: (msg: string | null) => void
    ) => {
      try {
        if (sheets.length === 0) {
          onError('Spreadsheet is empty.');
          return;
        }

        const headers = sheets[0].map((h: any) => String(h).trim().toLowerCase());
        const nameIdx = headers.findIndex(
          (h: string) => h.includes('name') || h.includes('customer') || h.includes('client')
        );
        const phoneIdx = headers.findIndex(
          (h: string) => h.includes('phone') || h.includes('mobile') || h.includes('contact')
        );
        const emailIdx = headers.findIndex(
          (h: string) => h.includes('email') || h.includes('mail')
        );
        const ticketIdx = headers.findIndex(
          (h: string) => h.includes('ticket') || h.includes('token') || h.includes('number')
        );

        if (nameIdx === -1) {
          onError('Could not find a column named "Name" in the Excel headers.');
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
        onSuccess(`Successfully loaded ${parsed.length} rows from Excel!`);
      } catch {
        onError('Failed to parse Excel file.');
      }
    },
    []
  );

  const handleFileUpload = useCallback(
    (
      file: File,
      onError: (msg: string | null) => void,
      onSuccess: (msg: string | null) => void
    ) => {
      onError('');
      onSuccess('');
      const reader = new FileReader();

      if (file.name.endsWith('.csv')) {
        reader.onload = (e) => {
          const text = e.target?.result as string;
          parseCSVData(text, onError, onSuccess);
        };
        reader.readAsText(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        reader.onload = async (e) => {
          try {
            const buffer = e.target?.result as ArrayBuffer;
            const { default: ExcelJS } = await import('exceljs');
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(buffer);
            const worksheet = workbook.worksheets[0];
            if (!worksheet) {
              onError('No worksheets found in the uploaded file.');
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
            parseExcelData(jsonData, onError, onSuccess);
          } catch {
            onError('Error reading Excel file. Make sure it is not corrupted.');
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        onError('Please upload only .csv, .xlsx, or .xls spreadsheet files.');
      }
    },
    [parseCSVData, parseExcelData]
  );

  const handleManualAdd = useCallback(
    (onError: (msg: string | null) => void, onSuccess: (msg: string | null) => void) => {
      if (!manualName.trim()) {
        onError('Participant name is required.');
        return;
      }

      const newTicket = manualTicket.trim()
        ? manualTicket.trim()
        : `SVI-${1000 + participants.length + 1}`;

      if (participants.some((p) => p.ticketNumber.toLowerCase() === newTicket.toLowerCase())) {
        onError(`Ticket number "${newTicket}" is already taken.`);
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
      onSuccess(`Added participant "${newParticipant.name}" manually.`);
    },
    [manualName, manualPhone, manualEmail, manualTicket, participants]
  );

  const removeParticipant = useCallback((indexToRemove: number) => {
    setParticipants((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  }, []);

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

  return {
    participants,
    dragOver,
    searchTerm,
    currentPage,
    itemsPerPage,
    entryMethod,
    manualName,
    manualPhone,
    manualEmail,
    manualTicket,
    setDragOver,
    setSearchTerm,
    setCurrentPage,
    setEntryMethod,
    setManualName,
    setManualPhone,
    setManualEmail,
    setManualTicket,
    setParticipants,
    handleFileUpload,
    handleManualAdd,
    removeParticipant,
    filteredParticipants,
    paginatedParticipants,
    totalPages,
    fileInputRef,
  };
}
