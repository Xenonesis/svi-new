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
} from './types';
import type { SavedReceipt } from '../payment-receipts/ReceiptTypes';
import { exportToPDF, exportToImage } from '@/src/lib/utils/documentExporter';

export const INITIAL_ALLOTMENT_FORM_DATA: AllotmentFormData = {
  profile_id: '',
  property_id: '',
  unit_number: '',
  area: '',
  total_cost: '',
  booking_date: '',
};

export function usePortalAllotmentsAdmin() {
  const t = useTranslations('pages.adminPortalAllotments');
  const [allotments, setAllotments] = useState<AllotmentRecord[]>([]);
  const [candidates, setCandidates] = useState<AllotmentCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

      const [
        { data: allotmentsData, error: allotmentsError },
        { data: profilesData },
        { data: propertiesData },
        docsResult,
      ] = await Promise.all([
        supabase
          .from('allotments')
          .select(
            '*, profiles:user_id(id, full_name, email), properties:property_id(id, name), payment_schedules(*)'
          )
          .order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, full_name, email').order('full_name'),
        supabase.from('properties').select('id, name').eq('active', true).order('name'),
        fetchDocs(),
      ]);

      const allReceipts = ((docsResult?.data as unknown as SavedReceipt[]) || []).filter(
        (r) => !r.metadata?.is_trashed
      );
      const normalizeId = (id?: string | null) =>
        (id || '').trim().toUpperCase().replace(/[-\s]/g, '');

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

      // Attach matched receipts to each allotment
      const enrichedAllotments: AllotmentRecord[] = rawList.map((a) => {
        const normTicket = normalizeId(a.metadata?.ticket_id || a.metadata?.ticketId);
        const matchedReceipts = allReceipts.filter((r) => {
          const fd = r.form_data as Record<string, any> | undefined;
          const rRef = normalizeId(fd?.refId || fd?.ticketId);
          return (
            rRef &&
            (rRef === normTicket ||
              (normTicket && rRef.includes(normTicket)) ||
              (normTicket && normTicket.includes(rRef)))
          );
        });
        return {
          ...a,
          unit_number: a.unit_no || a.unit_number,
          area: a.metadata?.area ?? a.area,
          total_cost: a.metadata?.total_cost ?? a.total_cost,
          booking_date: a.allotted_date || a.booking_date,
          receipts: matchedReceipts,
        };
      });

      setAllotments(enrichedAllotments);
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchAllotments(), fetchCandidates()]);
    setLoading(false);
  }, [fetchAllotments, fetchCandidates]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      const payload = {
        user_id: formData.profile_id,
        property_id: formData.property_id,
        unit_no: formData.unit_number,
        status: 'Allotted',
        allotted_date: formData.booking_date || new Date().toISOString().split('T')[0],
        metadata: {
          area: formData.area ? Number(formData.area) || formData.area : null,
          total_cost: formData.total_cost ? Number(formData.total_cost) || null : null,
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
    });
    setShowModal(true);
  };

  const openEditModal = (allotment: AllotmentRecord) => {
    setEditingId(allotment.id);
    setFormData({
      profile_id: allotment.user_id || allotment.profile_id || '',
      property_id: allotment.property_id,
      unit_number: allotment.unit_no || allotment.unit_number || '',
      area: (allotment.metadata?.area ?? allotment.area)?.toString() || '',
      total_cost: (allotment.metadata?.total_cost ?? allotment.total_cost)?.toString() || '',
      booking_date: allotment.allotted_date || allotment.booking_date || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // Filtered active allotments
  const filteredAllotments = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return allotments;
    return allotments.filter((a) => {
      const pName = a.profiles?.full_name?.toLowerCase() || '';
      const pEmail = a.profiles?.email?.toLowerCase() || '';
      const propName = a.properties?.name?.toLowerCase() || '';
      const unit = (a.unit_no || a.unit_number || '').toLowerCase();
      const ticket = (a.metadata?.ticket_id || a.metadata?.ticketId || '').toLowerCase();
      return (
        pName.includes(term) ||
        pEmail.includes(term) ||
        propName.includes(term) ||
        unit.includes(term) ||
        ticket.includes(term)
      );
    });
  }, [allotments, searchTerm]);

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

  return {
    activeTab,
    setActiveTab,
    allotments,
    filteredAllotments,
    candidates,
    filteredCandidates,
    profiles,
    properties,
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
  };
}
