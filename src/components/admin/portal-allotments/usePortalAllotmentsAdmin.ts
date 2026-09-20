'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type {
  AllotmentRecord,
  AllotmentFormData,
  ProfileSummary,
  PropertySummary,
  AllotmentCandidate,
  AllotmentFinancials,
  SalesRevenueSummary,
  PaymentStatusFilter,
  SaleModeFilter,
  SortField,
  SortDirection,
} from './types';
import type { SavedReceipt } from '../payment-receipts/ReceiptTypes';
import { normalizeRefId } from '@/src/lib/receipt/receiptLedger';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';

export const INITIAL_ALLOTMENT_FORM_DATA: AllotmentFormData = {
  profile_id: '',
  property_id: '',
  unit_number: '',
  area: '',
  total_cost: '',
  booking_date: '',
  advisor_name: '',
};

export function getAllotmentFinancials(
  allotment: AllotmentRecord,
  dealValuesMap: Record<string, number> = {}
): AllotmentFinancials {
  const rawTicket = allotment.metadata?.ticket_id || allotment.metadata?.ticketId;
  const unitRef = allotment.unit_no ? `Plot ${allotment.unit_no}` : '';
  const ticket = rawTicket || unitRef || `SVI-${allotment.id.slice(0, 4)}`;
  const normTicket = normalizeRefId(ticket);
  const normUnit = normalizeRefId(allotment.unit_no || allotment.unit_number);

  const explicitDealVal =
    dealValuesMap[normTicket] ||
    (normUnit ? dealValuesMap[normUnit] : undefined) ||
    (normUnit ? dealValuesMap[`PLOT${normUnit}`] : undefined);
  const totalCostVal = Number(allotment.metadata?.total_cost ?? allotment.total_cost) || 0;
  const dealValue =
    typeof explicitDealVal === 'number' && explicitDealVal > 0 ? explicitDealVal : totalCostVal;

  const receiptsTotal = (allotment.receipts || []).reduce(
    (sum, r) => sum + (parseFloat(r.form_data?.amount || '0') || 0),
    0
  );

  const schedulesTotal = (allotment.payment_schedules || [])
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const totalPaid = Math.max(receiptsTotal, schedulesTotal);
  const balanceDue = dealValue > 0 ? Math.max(0, dealValue - totalPaid) : 0;
  const percentCompleted = dealValue > 0 ? Math.min(100, (totalPaid / dealValue) * 100) : 0;

  const roundedPct = Math.round(percentCompleted * 100) / 100;
  return {
    ticketId: ticket,
    normalizedTicketId: normTicket,
    dealValue,
    totalPaid,
    balanceDue,
    percentCompleted: roundedPct,
    collectionPercentage: roundedPct,
    totalCost: dealValue,
  };
}

export function getAllotmentMode(allotment: AllotmentRecord): string {
  const mode =
    (allotment.metadata?.allotment_mode as string) ||
    (allotment.metadata?.allotmentMode as string) ||
    (allotment.metadata?.sale_type as string) ||
    (allotment.metadata?.booking_type as string) ||
    (allotment.metadata?.source as string) ||
    '';
  if (mode) {
    if (mode.toLowerCase().includes('direct')) return 'Direct Sell';
    if (mode.toLowerCase().includes('draw')) return 'Draw';
    return mode;
  }
  const drawDate =
    (allotment.metadata?.draw_date as string) || (allotment.metadata?.drawDate as string) || '';
  if (drawDate) {
    if (drawDate.toLowerCase().includes('direct')) return 'Direct Sell';
    return 'Draw';
  }
  return '';
}

export function usePortalAllotmentsAdmin() {
  const t = useTranslations('pages.adminPortalAllotments');
  const [allotments, setAllotments] = useState<AllotmentRecord[]>([]);
  const [candidates, setCandidates] = useState<AllotmentCandidate[]>([]);
  const [allReceipts, setAllReceipts] = useState<SavedReceipt[]>([]);
  const [dealValuesMap, setDealValuesMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Multi-filter and sorting state
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatusFilter>('all');
  const [selectedSaleMode, setSelectedSaleMode] = useState<SaleModeFilter>('all');
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('booking_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection(field === 'unit_number' || field === 'ref_id' ? 'asc' : 'desc');
      }
    },
    [sortField]
  );

  // Multi-select bulk actions state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelectRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedProperty('all');
    setSelectedPaymentStatus('all');
    setSelectedSaleMode('all');
    setSelectedAdvisor('all');
    setSearchTerm('');
    setSelectedIds(new Set());
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedProperty !== 'all') count++;
    if (selectedPaymentStatus !== 'all') count++;
    if (selectedSaleMode !== 'all') count++;
    if (selectedAdvisor !== 'all') count++;
    if (searchTerm.trim() !== '') count++;
    return count;
  }, [selectedProperty, selectedPaymentStatus, selectedSaleMode, selectedAdvisor, searchTerm]);

  // Customer Ledger Modal & Drawer state
  const [isLedgersModalOpen, setIsLedgersModalOpen] = useState(false);
  const [activeLedgerRefId, setActiveLedgerRefId] = useState<string | null>(null);

  // Receipt modal & actions state
  const [selectedReceipt, setSelectedReceipt] = useState<SavedReceipt | null>(null);
  const [whatsAppReceipt, setWhatsAppReceipt] = useState<SavedReceipt | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // Tabs: 'pending' (Approval Requests) | 'active' (Approved Allotments)
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');
  const [approvingTicketId, setApprovingTicketId] = useState<string | null>(null);
  const [isApprovingAll, setIsApprovingAll] = useState(false);

  // Create / Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Payment schedule expand state
  const [expandedAllotment, setExpandedAllotment] = useState<string | null>(null);

  // Form Data
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [advisors, setAdvisors] = useState<string[]>([]);
  const [formData, setFormData] = useState<AllotmentFormData>(INITIAL_ALLOTMENT_FORM_DATA);

  // Fetch approved allotments from DB along with matched payment receipts
  const fetchAllotments = useCallback(async () => {
    try {
      const fetchDocs = async () => {
        try {
          if (!supabase?.from) return { data: [] };
          const res = await supabase
            .from('documents')
            .select('*')
            .eq('document_type', 'payment_receipt')
            .order('created_at', { ascending: false });
          return res || { data: [] };
        } catch {
          return { data: [] };
        }
      };

      const fetchAdvisorDocs = async () => {
        try {
          if (!supabase?.from) return { data: [] };
          const q = supabase.from('documents').select('form_data');
          const res = typeof q?.limit === 'function' ? await q.limit(500) : await q;
          return res || { data: [] };
        } catch {
          return { data: [] };
        }
      };

      const fetchAdvisorRegs = async () => {
        try {
          if (!supabase?.from) return { data: [] };
          const q = supabase.from('registrations').select('submission_id, advisor_name');
          const res = typeof q?.limit === 'function' ? await q.limit(500) : await q;
          return res || { data: [] };
        } catch {
          return { data: [] };
        }
      };

      const [
        { data: allotmentsData, error: allotmentsError },
        { data: profilesData },
        { data: propertiesData },
        docsResult,
        advDocsResult,
        advRegsResult,
      ] = await Promise.all([
        supabase
          .from('allotments')
          .select(
            '*, profiles:user_id(id, full_name, email), properties:property_id(id, name), payment_schedules(*)'
          )
          .order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, full_name, email, role').order('full_name'),
        supabase.from('properties').select('id, name').eq('active', true).order('name'),
        fetchDocs(),
        fetchAdvisorDocs(),
        fetchAdvisorRegs(),
      ]);

      const allReceipts = ((docsResult?.data as unknown as SavedReceipt[]) || []).filter(
        (r) => !r.metadata?.is_trashed
      );
      const normalizeId = (id?: string | null) =>
        (id || '').trim().toUpperCase().replace(/[-\s]/g, '');

      // Build ticket -> advisor lookup map and known advisors list
      const ticketToAdvisor: Record<string, string> = {};
      const knownAdvisorsSet = new Set<string>();

      ((profilesData as Array<{ full_name?: string; role?: string }>) || []).forEach((p) => {
        if (p?.full_name && (p.role === 'employee' || p.role === 'admin')) {
          knownAdvisorsSet.add(p.full_name.trim());
        }
      });

      ((advDocsResult?.data as Array<{ form_data?: Record<string, any> }>) || []).forEach((d) => {
        const fd = d?.form_data || {};
        const rawTicket = fd.ticketId || fd.refId || fd.ticket_id || fd.ref_id;
        const adv = fd.advisorName || fd.advisor_name || fd.agentName || fd.agent_name;
        if (adv && typeof adv === 'string' && adv.trim()) {
          const cleanAdv = adv.trim();
          knownAdvisorsSet.add(cleanAdv);
          if (rawTicket) {
            ticketToAdvisor[normalizeId(rawTicket)] = cleanAdv;
          }
        }
      });

      (
        (advRegsResult?.data as Array<{ submission_id?: string; advisor_name?: string }>) || []
      ).forEach((r) => {
        const rawTicket = r?.submission_id;
        const adv = r?.advisor_name;
        if (adv && typeof adv === 'string' && adv.trim()) {
          const cleanAdv = adv.trim();
          knownAdvisorsSet.add(cleanAdv);
          if (rawTicket && !ticketToAdvisor[normalizeId(rawTicket)]) {
            ticketToAdvisor[normalizeId(rawTicket)] = cleanAdv;
          }
        }
      });

      setAdvisors(Array.from(knownAdvisorsSet).sort());

      let rawList: AllotmentRecord[] = [];
      if (allotmentsError) {
        console.warn('Allotments fetch fallback:', allotmentsError.message);
        const { data: rawAllotments } = await supabase
          .from('allotments')
          .select('*, payment_schedules(*)')
          .order('created_at', { ascending: false });
        rawList = (rawAllotments as unknown as AllotmentRecord[]) || [];
      } else {
        rawList = (allotmentsData as unknown as AllotmentRecord[]) || [];
      }

      // Attach matched receipts & auto-resolved advisor to each allotment
      const enrichedAllotments: AllotmentRecord[] = rawList.map((a) => {
        const normTicket = normalizeId(a.metadata?.ticket_id || a.metadata?.ticketId);
        const resolvedAdvisor =
          (a.metadata?.advisor_name as string) ||
          (a.metadata?.advisorName as string) ||
          (a.advisor_name as string) ||
          ticketToAdvisor[normTicket] ||
          null;

        const normUnit = normalizeId(a.unit_no || a.unit_number);
        const normClientName = normalizeId(
          a.profiles?.full_name || (a.metadata?.client_name as string) || ''
        );

        const matchedReceipts = allReceipts.filter((r) => {
          const fd = r.form_data as Record<string, any> | undefined;
          const rRef = normalizeId(fd?.refId || fd?.ticketId);
          const rPlot = normalizeId(fd?.plotNo || fd?.unitNumber || fd?.unit_no);
          const rName = normalizeId(fd?.clientName || fd?.name);

          // 1. Primary Match: Ticket ID / Ref ID
          if (normTicket && rRef) {
            if (rRef === normTicket || rRef.includes(normTicket) || normTicket.includes(rRef)) {
              return true;
            }
          }

          // 2. User ID Match (if both allotment and receipt link to same profile)
          if (r.user_id && a.user_id && r.user_id === a.user_id) {
            return true;
          }

          // 3. Plot Number / Unit Number Match (e.g. Unit 50 === Plot 50, Unit 65 === Plot 65)
          if (normUnit && rPlot) {
            if (normUnit === rPlot) return true;
            if (normUnit.length > 1 && (normUnit.includes(rPlot) || rPlot.includes(normUnit))) {
              if (
                !normClientName ||
                !rName ||
                normClientName.includes(rName) ||
                rName.includes(normClientName)
              ) {
                return true;
              }
            }
          }

          // 4. Receipt Ref ID has Plot Number (e.g. 'PLOT50', 'PLOT65', 'PLOT6')
          if (normUnit && rRef) {
            if (rRef === `PLOT${normUnit}` || rRef === normUnit) {
              return true;
            }
          }

          // 5. Client Name + Plot Match (cross-confirmation)
          if (
            normClientName &&
            rName &&
            (normClientName.includes(rName) || rName.includes(normClientName))
          ) {
            if (
              normUnit &&
              rPlot &&
              (normUnit === rPlot || normUnit.includes(rPlot) || rPlot.includes(normUnit))
            ) {
              return true;
            }
          }

          return false;
        });
        return {
          ...a,
          unit_number: a.unit_no || a.unit_number,
          area: a.metadata?.area ?? a.area,
          total_cost: a.metadata?.total_cost ?? a.total_cost,
          booking_date: a.allotted_date || a.booking_date,
          advisor_name: resolvedAdvisor,
          metadata: {
            ...(a.metadata || {}),
            advisor_name: resolvedAdvisor,
          },
          receipts: matchedReceipts,
        };
      });

      setAllotments(enrichedAllotments);
      setSelectedIds(
        (prev) => new Set([...prev].filter((id) => enrichedAllotments.some((a) => a.id === id)))
      );
      setAllReceipts(allReceipts);
      setProfiles((profilesData as unknown as ProfileSummary[]) || []);
      setProperties((propertiesData as unknown as PropertySummary[]) || []);
    } catch (error: unknown) {
      console.error('Failed to load allotments:', error);
    }
  }, []);

  // Fetch unapproved candidates from candidates API
  const fetchCandidates = useCallback(async () => {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    setLoadingCandidates(true);
    try {
      const sessionRes = await supabase?.auth?.getSession?.();
      const session = sessionRes?.data?.session;
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const endpoint =
        typeof window !== 'undefined' &&
        window.location?.origin &&
        window.location.origin !== 'null'
          ? `${window.location.origin}/api/admin/portal-allotments/candidates`
          : '/api/admin/portal-allotments/candidates';

      const res = await fetch(endpoint, { headers });
      if (!res.ok) throw new Error(`Candidates HTTP ${res.status}`);
      const json = await res.json();
      const list: AllotmentCandidate[] = json.candidates || [];
      setCandidates(list);

      // If no pending candidates exist but allotments exist, switch default tab to active
      if (list.length === 0) {
        setActiveTab('active');
      }
    } catch (error) {
      console.error('Failed to load approval candidates:', error);
    } finally {
      setLoadingCandidates(false);
    }
  }, []);

  const fetchDealValues = useCallback(async () => {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    try {
      const sessionRes = await supabase?.auth?.getSession?.();
      const token = sessionRes?.data?.session?.access_token;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const endpoint =
        typeof window !== 'undefined' && window.location?.origin
          ? `${window.location.origin}/api/admin/settings?key=receipt_deal_values`
          : '/api/admin/settings?key=receipt_deal_values';

      const res = await fetch(endpoint, { headers });
      if (!res.ok) return;
      const json = await res.json();
      if (json?.value && typeof json.value === 'object') {
        const mapped: Record<string, number> = {};
        Object.entries(json.value).forEach(([k, v]) => {
          const norm = normalizeRefId(k);
          if (typeof v === 'number') {
            mapped[norm] = v;
          } else if (v && typeof v === 'object' && 'dealValue' in v) {
            const val = (v as { dealValue?: number | string }).dealValue;
            mapped[norm] = typeof val === 'number' ? val : Number(val) || 0;
          }
        });
        setDealValuesMap((prev) => ({ ...mapped, ...prev }));
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchAllotments(), fetchCandidates(), fetchDealValues()]);
    setLoading(false);
  }, [fetchAllotments, fetchCandidates, fetchDealValues]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sync default deal values from allotments into dealValuesMap
  useEffect(() => {
    if (allotments.length === 0) return;
    setDealValuesMap((prev) => {
      let changed = false;
      const next = { ...prev };
      allotments.forEach((a) => {
        const ticket = a.metadata?.ticket_id || a.metadata?.ticketId || a.id;
        const norm = normalizeRefId(ticket);
        const cost = Number(a.metadata?.total_cost ?? a.total_cost) || 0;
        if (norm && cost > 0 && !(norm in next)) {
          next[norm] = cost;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [allotments]);

  // Approve a single candidate client
  const handleApproveCandidate = async (candidate: AllotmentCandidate) => {
    setApprovingTicketId(candidate.ticketId);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/admin/portal-allotments/approve', {
        method: 'POST',
        headers,
        body: JSON.stringify({ candidate }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to approve allotment');
      }

      toast.success(
        `Approved allotment for ${candidate.clientName || 'Client'} (${candidate.ticketId})`
      );

      // Remove from candidates list immediately
      setCandidates((prev) => prev.filter((c) => c.ticketId !== candidate.ticketId));
      // Refresh DB allotments to show under Active tab
      await fetchAllotments();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Approval failed');
    } finally {
      setApprovingTicketId(null);
    }
  };

  // Bulk approve all pending candidates
  const handleApproveAll = async () => {
    if (candidates.length === 0) return;
    if (!confirm(`Approve all ${candidates.length} pending client allotments?`)) return;

    setIsApprovingAll(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/admin/portal-allotments/approve', {
        method: 'POST',
        headers,
        body: JSON.stringify({ candidates }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Batch approval failed');
      }

      const resData = await res.json();
      toast.success(
        `Successfully approved ${resData.approvedCount || candidates.length} client allotments!`
      );

      setCandidates([]);
      await fetchAllotments();
      setActiveTab('active');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Batch approval failed');
    } finally {
      setIsApprovingAll(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const existingAllotment = editingId ? allotments.find((a) => a.id === editingId) : null;
      const existingMeta = (existingAllotment?.metadata as Record<string, any>) || {};

      const payload = {
        user_id: formData.profile_id,
        property_id: formData.property_id,
        unit_no: formData.unit_number,
        status: 'Allotted',
        allotted_date: formData.booking_date || new Date().toISOString().split('T')[0],
        metadata: {
          ...existingMeta,
          area: formData.area ? Number(formData.area) || formData.area : null,
          total_cost: formData.total_cost ? Number(formData.total_cost) || null : null,
          advisor_name: formData.advisor_name?.trim() || null,
        },
      };

      if (editingId) {
        const { error } = await supabase.from('allotments').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success(t('allotmentUpdated'));
      } else {
        const { error } = await supabase.from('allotments').insert(payload);
        if (error) throw error;
        toast.success(t('allotmentCreated'));
      }
      setShowModal(false);
      await fetchAllotments();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t('failedToSave'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirmation'))) return;
    try {
      const { error } = await supabase.from('allotments').delete().eq('id', id);
      if (error) throw error;
      toast.success(t('allotmentDeleted'));
      await fetchAllotments();
      await fetchCandidates();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t('failedToDelete'));
    }
  };

  const togglePaymentStatus = async (paymentId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    try {
      const { error } = await supabase
        .from('payment_schedules')
        .update({
          status: newStatus,
          paid_date: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : null,
        })
        .eq('id', paymentId);

      if (error) throw error;
      toast.success(t('paymentMarkedAs', { status: newStatus }));
      await fetchAllotments();
    } catch (error: unknown) {
      toast.error(t('failedToUpdateStatus'));
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      profile_id: '',
      property_id: '',
      unit_number: '',
      area: '',
      total_cost: '',
      booking_date: new Date().toISOString().split('T')[0],
      advisor_name: '',
    });
    setShowModal(true);
  };

  const openEditModal = (allotment: AllotmentRecord) => {
    setEditingId(allotment.id);
    const existingAdvisor =
      allotment.advisor_name ||
      (allotment.metadata?.advisor_name as string) ||
      (allotment.metadata?.advisorName as string) ||
      '';
    setFormData({
      profile_id: allotment.user_id || allotment.profile_id || '',
      property_id: allotment.property_id,
      unit_number: allotment.unit_no || allotment.unit_number || '',
      area: (allotment.metadata?.area ?? allotment.area)?.toString() || '',
      total_cost: (allotment.metadata?.total_cost ?? allotment.total_cost)?.toString() || '',
      booking_date: allotment.allotted_date || allotment.booking_date || '',
      advisor_name: existingAdvisor,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // Filtered active allotments
  const filteredAllotments = useMemo(() => {
    // 1. Search term filter
    const term = searchTerm.toLowerCase().trim();
    let result = allotments;
    if (term) {
      result = result.filter((a) => {
        const pName = a.profiles?.full_name?.toLowerCase() || '';
        const pEmail = a.profiles?.email?.toLowerCase() || '';
        const propName = a.properties?.name?.toLowerCase() || '';
        const unit = (a.unit_no || a.unit_number || '').toLowerCase();
        const rawTicket = String(
          a.metadata?.ticket_id || a.metadata?.ticketId || a.metadata?.refId || ''
        ).toLowerCase();
        const hasValidTicket =
          rawTicket && !rawTicket.startsWith('plot ') && !/^svi-[0-9a-f]{4}/.test(rawTicket);
        const isMissingMatch = !hasValidTicket && 'missing'.includes(term);
        const advisor = String(a.advisor_name || a.metadata?.advisor_name || '').toLowerCase();
        return (
          isMissingMatch ||
          pName.includes(term) ||
          pEmail.includes(term) ||
          propName.includes(term) ||
          unit.includes(term) ||
          rawTicket.includes(term) ||
          advisor.includes(term)
        );
      });
    }

    // 2. Property filter
    if (selectedProperty !== 'all') {
      result = result.filter(
        (a) => a.property_id === selectedProperty || a.properties?.id === selectedProperty
      );
    }

    // 3. Sale mode filter
    if (selectedSaleMode !== 'all') {
      result = result.filter((a) => getAllotmentMode(a) === selectedSaleMode);
    }

    // 4. Advisor filter
    if (selectedAdvisor !== 'all') {
      result = result.filter((a) => {
        const advName =
          a.advisor_name ||
          (a.metadata?.advisor_name as string) ||
          (a.metadata?.agent_name as string) ||
          '';
        return advName === selectedAdvisor;
      });
    }

    // 5. Payment status filter
    if (selectedPaymentStatus !== 'all') {
      result = result.filter((a) => {
        const fin = getAllotmentFinancials(a, dealValuesMap);
        const pct = fin.collectionPercentage ?? fin.percentCompleted;

        if (selectedPaymentStatus === 'fully_paid') {
          return (fin.balanceDue <= 0 && (fin.dealValue > 0 || fin.totalPaid > 0)) || pct >= 100;
        }
        if (selectedPaymentStatus === 'partially_paid') {
          return pct > 0 && pct < 100 && fin.balanceDue > 0;
        }
        if (selectedPaymentStatus === 'unpaid') {
          return fin.totalPaid === 0;
        }
        if (selectedPaymentStatus === 'overdue') {
          return (a.payment_schedules || []).some((p) => {
            const isPaid = (p.status || '').toLowerCase() === 'paid';
            if (isPaid) return false;
            if (!p.due_date) return false;
            const dueDate = new Date(p.due_date);
            return !isNaN(dueDate.getTime()) && dueDate.getTime() < Date.now();
          });
        }
        return true;
      });
    }

    // 6. Sorting
    return [...result].sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;

      if (sortField === 'deal_value') {
        const finA = getAllotmentFinancials(a, dealValuesMap);
        const finB = getAllotmentFinancials(b, dealValuesMap);
        const valA =
          finA.totalCost ?? finA.dealValue ?? (Number(a.metadata?.total_cost ?? a.total_cost) || 0);
        const valB =
          finB.totalCost ?? finB.dealValue ?? (Number(b.metadata?.total_cost ?? b.total_cost) || 0);
        return multiplier * (valA - valB);
      }

      if (sortField === 'balance_due') {
        const finA = getAllotmentFinancials(a, dealValuesMap);
        const finB = getAllotmentFinancials(b, dealValuesMap);
        return multiplier * (finA.balanceDue - finB.balanceDue);
      }

      if (sortField === 'collection_pct') {
        const finA = getAllotmentFinancials(a, dealValuesMap);
        const finB = getAllotmentFinancials(b, dealValuesMap);
        const pctA = finA.collectionPercentage ?? finA.percentCompleted ?? 0;
        const pctB = finB.collectionPercentage ?? finB.percentCompleted ?? 0;
        return multiplier * (pctA - pctB);
      }

      if (sortField === 'booking_date') {
        const rawDateA =
          a.booking_date ||
          a.allotted_date ||
          a.created_at ||
          (a.metadata?.booking_date as string) ||
          (a.metadata?.allotment_date as string) ||
          '';
        const rawDateB =
          b.booking_date ||
          b.allotted_date ||
          b.created_at ||
          (b.metadata?.booking_date as string) ||
          (b.metadata?.allotment_date as string) ||
          '';
        const timeA = rawDateA ? new Date(rawDateA).getTime() : 0;
        const timeB = rawDateB ? new Date(rawDateB).getTime() : 0;
        return multiplier * (timeA - timeB);
      }

      if (sortField === 'unit_number') {
        const unitA = (a.unit_no || a.unit_number || (a.metadata?.unit_no as string) || '').trim();
        const unitB = (b.unit_no || b.unit_number || (b.metadata?.unit_no as string) || '').trim();
        return (
          multiplier * unitA.localeCompare(unitB, undefined, { numeric: true, sensitivity: 'base' })
        );
      }

      if (sortField === 'ref_id') {
        const ticketA = (
          a.metadata?.ticket_id ||
          a.metadata?.ticketId ||
          a.metadata?.refId ||
          `SVI-${a.id.slice(0, 4)}`
        ).toString();
        const ticketB = (
          b.metadata?.ticket_id ||
          b.metadata?.ticketId ||
          b.metadata?.refId ||
          `SVI-${b.id.slice(0, 4)}`
        ).toString();
        return (
          multiplier *
          ticketA.localeCompare(ticketB, undefined, { numeric: true, sensitivity: 'base' })
        );
      }

      return 0;
    });
  }, [
    allotments,
    searchTerm,
    selectedProperty,
    selectedSaleMode,
    selectedAdvisor,
    selectedPaymentStatus,
    sortField,
    sortDirection,
    dealValuesMap,
  ]);

  // Selection derived states & helpers
  const isAllSelected = useMemo(() => {
    return filteredAllotments.length > 0 && filteredAllotments.every((a) => selectedIds.has(a.id));
  }, [filteredAllotments, selectedIds]);

  const isSomeSelected = useMemo(() => {
    return selectedIds.size > 0 && !isAllSelected;
  }, [selectedIds, isAllSelected]);

  const toggleSelectAll = useCallback(() => {
    if (filteredAllotments.length === 0) return;
    const allIn = filteredAllotments.every((a) => selectedIds.has(a.id));
    if (allIn) {
      setSelectedIds(new Set());
    } else {
      const next = new Set(selectedIds);
      filteredAllotments.forEach((a) => next.add(a.id));
      setSelectedIds(next);
    }
  }, [filteredAllotments, selectedIds]);

  const selectedAllotments = useMemo(() => {
    return allotments.filter((a) => selectedIds.has(a.id));
  }, [allotments, selectedIds]);

  const selectedTotalBalance = useMemo(() => {
    return selectedAllotments.reduce(
      (sum, a) => sum + getAllotmentFinancials(a, dealValuesMap).balanceDue,
      0
    );
  }, [selectedAllotments, dealValuesMap]);

  // Filtered pending candidates
  const filteredCandidates = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return candidates;
    return candidates.filter((c) => {
      const name = c.clientName.toLowerCase();
      const ticket = c.ticketId.toLowerCase();
      const email = c.email.toLowerCase();
      const phone = c.phone.toLowerCase();
      const project = c.projectName.toLowerCase();
      const unit = c.unitNo.toLowerCase();
      return (
        name.includes(term) ||
        ticket.includes(term) ||
        email.includes(term) ||
        phone.includes(term) ||
        project.includes(term) ||
        unit.includes(term)
      );
    });
  }, [candidates, searchTerm]);

  const handleDownloadPDF = async (receipt?: SavedReceipt | null) => {
    const target = receipt || selectedReceipt;
    if (!target) return;
    setPdfLoading(true);
    try {
      const clientName = (target.form_data?.name || '').trim().replace(/[^a-zA-Z0-9\s]/g, '');
      const receiptNo = (target.form_data?.receiptNo || '').trim().replace(/[^a-zA-Z0-9]/g, '');
      const filename =
        clientName && receiptNo
          ? `${clientName} ${receiptNo}.pdf`
          : clientName
            ? `${clientName}.pdf`
            : 'Receipt.pdf';

      await exportToPDF({
        elementId: 'modalReceiptPreview',
        filename,
      });
    } catch (err: unknown) {
      console.error('Error generating PDF:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadImage = async (receipt?: SavedReceipt | null) => {
    const target = receipt || selectedReceipt;
    if (!target) return;
    setImageLoading(true);
    try {
      const clientName = (target.form_data?.name || '').trim().replace(/[^a-zA-Z0-9\s]/g, '');
      const receiptNo = (target.form_data?.receiptNo || '').trim().replace(/[^a-zA-Z0-9]/g, '');
      const filename =
        clientName && receiptNo
          ? `${clientName} ${receiptNo}.png`
          : clientName
            ? `${clientName}.png`
            : 'Receipt.png';

      await exportToImage({
        elementId: 'modalReceiptPreview',
        filename,
      });
    } catch (err: unknown) {
      console.error('Error generating Image:', err);
      toast.error('Failed to generate Image');
    } finally {
      setImageLoading(false);
    }
  };

  const handleSaveDealValue = async (
    normalizedRefId: string,
    newDealValue: number,
    extra?: { area?: number; ratePerSqYd?: number }
  ) => {
    const norm = normalizeRefId(normalizedRefId);
    const updated = {
      ...dealValuesMap,
      [normalizedRefId]: newDealValue,
      [norm]: newDealValue,
    };
    setDealValuesMap(updated);

    // Update local state immediately
    setAllotments((prev) =>
      prev.map((a) => {
        const aTicket = normalizeRefId(a.metadata?.ticket_id || a.metadata?.ticketId || a.id);
        if (aTicket === norm) {
          return {
            ...a,
            total_cost: newDealValue,
            metadata: {
              ...(a.metadata || {}),
              total_cost: newDealValue,
              ...(extra?.area ? { area: String(extra.area) } : {}),
              ...(extra?.ratePerSqYd ? { rate_per_sq_yd: extra.ratePerSqYd } : {}),
            },
          };
        }
        return a;
      })
    );

    if (process.env.NODE_ENV === 'test') {
      return;
    }

    try {
      const sessionRes = await supabase?.auth?.getSession?.();
      const token = sessionRes?.data?.session?.access_token;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Persist to database via dedicated server admin API
      await fetch('/api/admin/portal-allotments/deal-value', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          refId: normalizedRefId,
          dealValue: newDealValue,
          area: extra?.area,
          ratePerSqYd: extra?.ratePerSqYd,
        }),
      });

      // Also update any allotment in the database directly as client fallback
      const matchingAllotment = allotments.find((a) => {
        const aTicket = normalizeRefId(a.metadata?.ticket_id || a.metadata?.ticketId || a.id);
        return aTicket === norm;
      });

      if (matchingAllotment && supabase?.from) {
        await supabase
          .from('allotments')
          .update({
            metadata: {
              ...(matchingAllotment.metadata || {}),
              total_cost: newDealValue,
              ...(extra?.area ? { area: String(extra.area) } : {}),
              ...(extra?.ratePerSqYd ? { rate_per_sq_yd: extra.ratePerSqYd } : {}),
            },
          })
          .eq('id', matchingAllotment.id);
      }
    } catch {
      // ignore
    }
  };

  const openClientLedger = useCallback((target?: AllotmentRecord | string) => {
    if (!target) return;
    if (typeof target === 'string') {
      setActiveLedgerRefId(target);
    } else {
      const ref =
        target.metadata?.ticket_id ||
        target.metadata?.ticketId ||
        (target.unit_no ? `Plot ${target.unit_no}` : `SVI-${target.id.slice(0, 4)}`);
      setActiveLedgerRefId(ref);
    }
  }, []);

  const getDealValueForRef = useCallback(
    (refId: string | null) => {
      if (!refId) return 0;
      const norm = normalizeRefId(refId);
      if (dealValuesMap[norm] && dealValuesMap[norm] > 0) {
        return dealValuesMap[norm];
      }
      const matching = allotments.find((a) => {
        const aRef = a.metadata?.ticket_id || a.metadata?.ticketId || a.id;
        return (
          normalizeRefId(aRef) === norm ||
          (a.unit_no && normalizeRefId(`Plot ${a.unit_no}`) === norm) ||
          (a.unit_no && normalizeRefId(a.unit_no) === norm)
        );
      });
      return Number(matching?.metadata?.total_cost ?? matching?.total_cost) || 0;
    },
    [allotments, dealValuesMap]
  );

  const getPlotAreaForRef = useCallback(
    (refId: string | null) => {
      if (!refId) return undefined;
      const norm = normalizeRefId(refId);
      const matching = allotments.find((a) => {
        const aRef = a.metadata?.ticket_id || a.metadata?.ticketId || a.id;
        return (
          normalizeRefId(aRef) === norm ||
          (a.unit_no && normalizeRefId(`Plot ${a.unit_no}`) === norm) ||
          (a.unit_no && normalizeRefId(a.unit_no) === norm)
        );
      });
      return matching?.metadata?.area;
    },
    [allotments]
  );

  const allLedgerReceipts = useMemo(() => {
    const result: SavedReceipt[] = [...allReceipts];
    const existingRefs = new Set(result.map((r) => normalizeRefId(r.form_data?.refId)));

    allotments.forEach((a) => {
      const ref = a.metadata?.ticket_id || a.metadata?.ticketId || `SVI-${a.id.slice(0, 4)}`;
      const norm = normalizeRefId(ref);

      if (!existingRefs.has(norm)) {
        const paidSchedulesTotal = (a.payment_schedules || [])
          .filter((p) => p.status === 'paid')
          .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

        result.push({
          id: `allot-synth-${a.id}`,
          document_type: 'payment_receipt',
          status: 'allotted',
          created_at: a.allotted_date || a.booking_date || a.created_at || new Date().toISOString(),
          form_data: {
            receiptNo: `ALLOT-${(a.unit_no || a.unit_number || a.id.slice(0, 4)).replace(/\s+/g, '')}`,
            date:
              (a.allotted_date || a.booking_date || '').split('T')[0] ||
              new Date().toISOString().split('T')[0],
            salutation: '',
            name: a.profiles?.full_name || (a.metadata?.client_name as string) || 'Client',
            refId: ref,
            amount: String(paidSchedulesTotal),
            amountWords: '',
            paymentRef: 'Allotment Record',
            drawnOn: '',
            plotNo: a.unit_no || a.unit_number || '',
            plotSize: String(a.metadata?.area ?? a.area ?? ''),
            account: '',
            paymentMethod: paidSchedulesTotal > 0 ? 'Milestone' : 'Pending',
          },
        });
        existingRefs.add(norm);
      }
    });

    return result;
  }, [allReceipts, allotments]);

  const salesRevenueStats: SalesRevenueSummary = useMemo(() => {
    let totalSalesRevenue = 0;
    let totalRevenueCollected = 0;
    let totalBalanceDue = 0;

    allotments.forEach((a) => {
      const fin = getAllotmentFinancials(a, dealValuesMap);
      totalSalesRevenue += fin.dealValue;
      totalRevenueCollected += fin.totalPaid;
      totalBalanceDue += fin.balanceDue;
    });

    const realizationRate =
      totalSalesRevenue > 0
        ? Math.round((totalRevenueCollected / totalSalesRevenue) * 1000) / 10
        : 0;

    const pendingPipelineRevenue = candidates.reduce(
      (sum, c) => sum + (Number(c.totalCost) || 0),
      0
    );

    return {
      totalSalesRevenue,
      totalRevenueCollected,
      totalBalanceDue,
      realizationRate,
      activeAccountsCount: allotments.length,
      pendingPipelineRevenue,
      pendingCandidatesCount: candidates.length,
    };
  }, [allotments, candidates, dealValuesMap]);

  return {
    activeTab,
    setActiveTab,
    allotments,
    filteredAllotments,
    candidates,
    filteredCandidates,
    profiles,
    properties,
    advisors,
    loading,
    loadingCandidates,
    searchTerm,
    setSearchTerm,
    showModal,
    setShowModal,
    editingId,
    setEditingId,
    expandedAllotment,
    setExpandedAllotment,
    formData,
    setFormData,
    fetchData,
    fetchAllotments,
    fetchCandidates,
    handleSave,
    handleDelete,
    togglePaymentStatus,
    openCreateModal,
    openEditModal,
    closeModal,
    handleApproveCandidate,
    handleApproveAll,
    approvingTicketId,
    isApprovingAll,
    selectedReceipt,
    setSelectedReceipt,
    whatsAppReceipt,
    setWhatsAppReceipt,
    pdfLoading,
    imageLoading,
    handleDownloadPDF,
    handleDownloadImage,
    // Ledgers & Sales Revenue exports
    allReceipts,
    allLedgerReceipts,
    dealValuesMap,
    setDealValuesMap,
    handleSaveDealValue,
    isLedgersModalOpen,
    setIsLedgersModalOpen,
    activeLedgerRefId,
    setActiveLedgerRefId,
    openClientLedger,
    getDealValueForRef,
    getPlotAreaForRef,
    salesRevenueStats,
    getAllotmentFinancials: (allotment: AllotmentRecord) =>
      getAllotmentFinancials(allotment, dealValuesMap),
    // Multi-filter and sorting
    selectedProperty,
    setSelectedProperty,
    selectedPaymentStatus,
    setSelectedPaymentStatus,
    selectedSaleMode,
    setSelectedSaleMode,
    selectedAdvisor,
    setSelectedAdvisor,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    handleSort,
    resetFilters,
    activeFilterCount,
    // Multi-select bulk actions
    selectedIds,
    setSelectedIds,
    toggleSelectRow,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
    isSomeSelected,
    selectedAllotments,
    selectedTotalBalance,
  };
}
