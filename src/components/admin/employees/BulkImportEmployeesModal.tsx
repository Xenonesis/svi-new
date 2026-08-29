'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  CheckCircle2,
  Download,
  Users,
  KeyRound,
  Copy,
} from 'lucide-react';
import ExcelJS from 'exceljs';
import { toast } from 'sonner';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';

interface ParsedEmployeeRow {
  fullName: string;
  email: string;
  realEmail?: string;
  phone?: string;
  password: string;
  notes?: string;
  isValid: boolean;
  validationError?: string;
}

interface ImportResult {
  email: string;
  name: string;
  password: string;
  success: boolean;
  error?: string;
}

interface BulkImportEmployeesModalProps {
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

function generateSecurePassword(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%';
  let p = 'Svi@';
  for (let i = 0; i < 6; i++) {
    p += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return p;
}

function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function parseCSVString(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentRow.push(currentCell.trim());
        if (currentRow.some((c) => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

export function BulkImportEmployeesModal({
  onClose,
  onSuccess,
  token,
}: BulkImportEmployeesModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedEmployeeRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Template Download: CSV
  const handleDownloadCSVTemplate = () => {
    const csvContent =
      'Full Name,Email,Personal Email,Phone,Password,Notes\r\n' +
      'Khushi Sharma,khushi@sviinfra.com,khushi.personal@gmail.com,9218300589,,Sales Executive - North Zone\r\n' +
      'Shivam Yadav,shivam@sviinfra.com,shivam.personal@gmail.com,9218300593,,Senior Manager - Operations\r\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'svi-employees-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success('Downloaded CSV Template');
  };

  // Template Download: Excel
  const handleDownloadExcelTemplate = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Template');

      worksheet.columns = [
        { header: 'Full Name', key: 'name', width: 22 },
        { header: 'Email', key: 'email', width: 26 },
        { header: 'Personal Email', key: 'personal_email', width: 26 },
        { header: 'Phone', key: 'phone', width: 16 },
        { header: 'Password', key: 'password', width: 18 },
        { header: 'Notes', key: 'notes', width: 32 },
      ];

      const headerRow = worksheet.getRow(1);
      headerRow.height = 26;
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0F172A' },
        };
        cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFD700' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      worksheet.addRow({
        name: 'Khushi Sharma',
        email: 'khushi@sviinfra.com',
        personal_email: 'khushi.personal@gmail.com',
        phone: '9218300589',
        password: '',
        notes: 'Sales Executive - North Zone',
      });

      worksheet.addRow({
        name: 'Shivam Yadav',
        email: 'shivam@sviinfra.com',
        personal_email: 'shivam.personal@gmail.com',
        phone: '9218300593',
        password: '',
        notes: 'Senior Manager - Operations',
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'svi-employees-import-template.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success('Downloaded Excel Template');
    } catch {
      toast.error('Failed to generate template.');
    }
  };

  // Process rows extracted from file
  const processRawRows = (headerRow: string[], dataRows: string[][]) => {
    const headerMap: Record<string, number> = {};
    headerRow.forEach((h, idx) => {
      const norm = normalizeHeader(h);
      if (['name', 'fullname', 'employeename'].includes(norm)) headerMap.name = idx;
      else if (['email', 'officialemail', 'sviemail', 'loginemail'].includes(norm))
        headerMap.email = idx;
      else if (['personalemail', 'realemail', 'alternateemail'].includes(norm))
        headerMap.realEmail = idx;
      else if (['phone', 'phonenumber', 'mobile', 'contact'].includes(norm)) headerMap.phone = idx;
      else if (['password', 'pass'].includes(norm)) headerMap.password = idx;
      else if (['notes', 'note', 'department', 'designation', 'role'].includes(norm))
        headerMap.notes = idx;
    });

    if (headerMap.name === undefined || headerMap.email === undefined) {
      toast.error('File must contain at least "Full Name" and "Email" column headers.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const processed: ParsedEmployeeRow[] = [];

    dataRows.forEach((row) => {
      const fullName = (row[headerMap.name] || '').trim();
      const email = (row[headerMap.email] || '').trim().toLowerCase();
      const realEmail =
        headerMap.realEmail !== undefined ? (row[headerMap.realEmail] || '').trim() : undefined;
      const phone = headerMap.phone !== undefined ? (row[headerMap.phone] || '').trim() : undefined;
      let password = headerMap.password !== undefined ? (row[headerMap.password] || '').trim() : '';
      const notes = headerMap.notes !== undefined ? (row[headerMap.notes] || '').trim() : undefined;

      if (!password || password.length < 8) {
        password = generateSecurePassword();
      }

      let isValid = true;
      let validationError: string | undefined;

      if (!fullName) {
        isValid = false;
        validationError = 'Missing Full Name';
      } else if (!email || !emailRegex.test(email)) {
        isValid = false;
        validationError = 'Invalid Email format';
      }

      processed.push({
        fullName,
        email,
        realEmail: realEmail || undefined,
        phone: phone || undefined,
        password,
        notes: notes || undefined,
        isValid,
        validationError,
      });
    });

    setParsedRows(processed);
    if (processed.length > 0) {
      const validCount = processed.filter((r) => r.isValid).length;
      toast.success(
        `Parsed ${processed.length} rows (${validCount} ready, ${processed.length - validCount} invalid)`
      );
    }
  };

  // Handle File Upload
  const handleFileUpload = async (file: File) => {
    setFileName(file.name);
    setResults(null);

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = (e.target?.result as string) || '';
        const matrix = parseCSVString(text);
        if (matrix.length < 2) {
          toast.error('CSV file has no data rows.');
          return;
        }
        processRawRows(matrix[0], matrix.slice(1));
      };
      reader.readAsText(file);
    } else if (ext === 'xlsx' || ext === 'xls') {
      try {
        const buffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
          toast.error('No sheets found in Excel file.');
          return;
        }

        const matrix: string[][] = [];
        worksheet.eachRow((row) => {
          const rowValues: string[] = [];
          row.eachCell({ includeEmpty: true }, (cell) => {
            rowValues.push(cell.text?.trim() || '');
          });
          matrix.push(rowValues);
        });

        if (matrix.length < 2) {
          toast.error('Excel file has no data rows.');
          return;
        }

        processRawRows(matrix[0], matrix.slice(1));
      } catch (err) {
        console.error('Excel parsing error:', err);
        toast.error('Failed to parse Excel file.');
      }
    } else {
      toast.error('Please upload a .csv or .xlsx / .xls file.');
    }
  };

  // Execute Batch Import
  const handleStartImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      toast.error('No valid rows to import.');
      return;
    }

    setImporting(true);
    setProgress(0);
    const importResults: ImportResult[] = [];

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      try {
        const res = await fetch('/api/admin/employees', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: row.fullName,
            email: row.email,
            real_email: row.realEmail || null,
            phone: row.phone || null,
            password: row.password,
            notes: row.notes || null,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(extractApiErrorMessage(data, 'Failed to create employee.'));
        }

        importResults.push({
          email: row.email,
          name: row.fullName,
          password: row.password,
          success: true,
        });
      } catch (err: unknown) {
        importResults.push({
          email: row.email,
          name: row.fullName,
          password: row.password,
          success: false,
          error: extractApiErrorMessage(err, 'Failed to import'),
        });
      }

      setProgress(Math.round(((i + 1) / validRows.length) * 100));
    }

    setResults(importResults);
    setImporting(false);

    const successCount = importResults.filter((r) => r.success).length;
    if (successCount > 0) {
      toast.success(`Successfully imported ${successCount} of ${validRows.length} employees!`);
      onSuccess();
    } else {
      toast.error('All rows failed to import. Check details below.');
    }
  };

  const handleCopyCredentials = (res: ImportResult, index: number) => {
    const text = `Email: ${res.email}\nPassword: ${res.password}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Credentials copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!importing ? onClose : undefined}
          className="fixed inset-0 bg-black/65 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#161622]"
        >
          {/* Top Gold Accent Bar */}
          <div className="via-brand-gold absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent to-transparent opacity-60" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 p-6 pb-4 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="bg-brand-gold/10 text-brand-gold flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20">
                <UploadCloud size={20} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">
                  Bulk Import Employees
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Upload CSV or Excel (.xlsx) spreadsheet to register multiple staff accounts at
                  once.
                </p>
              </div>
            </div>

            {!importing && (
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Modal Body */}
          <div className="flex-1 space-y-5 overflow-y-auto p-6 text-xs text-gray-600 dark:text-gray-300">
            {/* Step 1: Download Templates */}
            {!results && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Need a spreadsheet template?
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Download sample file with pre-configured headers and dummy data.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadCSVTemplate}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-2xs transition-all hover:bg-amber-50 active:scale-95 dark:bg-white/5 dark:text-amber-300 dark:hover:bg-white/10"
                  >
                    <Download size={12} />
                    <span>CSV Template</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadExcelTemplate}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-2xs transition-all hover:bg-emerald-50 active:scale-95 dark:bg-white/5 dark:text-emerald-300 dark:hover:bg-white/10"
                  >
                    <Download size={12} />
                    <span>Excel (.xlsx) Template</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Upload Drop Area */}
            {!results && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
                <div
                  onClick={() => !importing && fileInputRef.current?.click()}
                  className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center transition-all hover:border-amber-500/50 hover:bg-amber-500/5 dark:border-white/15 dark:hover:border-amber-500/40"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-transform group-hover:scale-110 dark:bg-white/5 dark:text-gray-300">
                    <FileSpreadsheet size={22} className="text-brand-gold" />
                  </div>
                  <p className="mt-3 font-semibold text-gray-900 dark:text-white">
                    {fileName ? fileName : 'Click or drop your spreadsheet file here'}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-400">
                    Supports Microsoft Excel (.xlsx, .xls) and Comma-Separated Values (.csv)
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Parsed Preview Grid */}
            {!results && parsedRows.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-brand-gold" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Parsed Records ({parsedRows.length})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {validCount} Ready
                    </span>
                    {parsedRows.length - validCount > 0 && (
                      <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">
                        {parsedRows.length - validCount} Invalid
                      </span>
                    )}
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-200 dark:border-white/10">
                  <table className="w-full text-left text-[11px]">
                    <thead className="sticky top-0 border-b border-gray-200 bg-gray-50 text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
                      <tr>
                        <th className="px-3 py-2">Full Name</th>
                        <th className="px-3 py-2">Email</th>
                        <th className="px-3 py-2">Phone</th>
                        <th className="px-3 py-2">Generated Password</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                      {parsedRows.map((r, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                          <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">
                            {r.fullName || '-'}
                          </td>
                          <td className="px-3 py-2 font-mono text-gray-600 dark:text-gray-300">
                            {r.email}
                          </td>
                          <td className="px-3 py-2 font-mono text-gray-500">{r.phone || '-'}</td>
                          <td className="px-3 py-2 font-mono text-amber-600 dark:text-amber-400">
                            {r.password}
                          </td>
                          <td className="px-3 py-2">
                            {r.isValid ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 size={11} /> Ready
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-semibold text-red-500">
                                <AlertCircle size={11} /> {r.validationError}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Progress Bar while Importing */}
            {importing && (
              <div className="space-y-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-900 dark:text-white">
                  <span>Importing accounts to system...</span>
                  <span className="text-brand-gold font-mono">{progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                  <div
                    className="bg-brand-gold h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Import Results Table */}
            {results && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Import Summary ({results.filter((r) => r.success).length} created,{' '}
                    {results.filter((r) => !r.success).length} failed)
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-200 dark:border-white/10">
                  <table className="w-full text-left text-[11px]">
                    <thead className="sticky top-0 border-b border-gray-200 bg-gray-50 text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
                      <tr>
                        <th className="px-3 py-2">Employee</th>
                        <th className="px-3 py-2">Login Email</th>
                        <th className="px-3 py-2">Password</th>
                        <th className="px-3 py-2">Result</th>
                        <th className="px-3 py-2 text-right">Copy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                      {results.map((r, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                          <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">
                            {r.name}
                          </td>
                          <td className="px-3 py-2 font-mono text-gray-600 dark:text-gray-300">
                            {r.email}
                          </td>
                          <td className="px-3 py-2 font-mono text-amber-600 dark:text-amber-400">
                            {r.password}
                          </td>
                          <td className="px-3 py-2">
                            {r.success ? (
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                Created ✓
                              </span>
                            ) : (
                              <span className="font-semibold text-red-500">{r.error}</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {r.success && (
                              <button
                                onClick={() => handleCopyCredentials(r, i)}
                                className="inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                                title="Copy login credentials"
                              >
                                {copiedIndex === i ? (
                                  <CheckCircle2 size={10} className="text-emerald-500" />
                                ) : (
                                  <Copy size={10} />
                                )}
                                <span>Copy</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 p-6 pt-4 dark:border-white/10">
            {results ? (
              <button
                type="button"
                onClick={onClose}
                className="bg-brand-gold text-brand-navy hover:bg-brand-gold/90 rounded-xl px-5 py-2 text-xs font-bold shadow-md transition-all active:scale-95"
              >
                Done
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={importing}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartImport}
                  disabled={importing || validCount === 0}
                  className="bg-brand-gold text-brand-navy hover:bg-brand-gold/90 flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  <UploadCloud size={14} />
                  <span>
                    {importing
                      ? 'Importing...'
                      : `Import ${validCount > 0 ? `${validCount} Employees` : ''}`}
                  </span>
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
