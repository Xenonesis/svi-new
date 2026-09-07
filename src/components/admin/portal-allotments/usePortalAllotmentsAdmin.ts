'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { AllotmentRecord, AllotmentFormData, ProfileSummary, PropertySummary } from './types';

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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Create / Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Payment schedule expand state
  const [expandedAllotment, setExpandedAllotment] = useState<string | null>(null);

  // Form Data
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [formData, setFormData] = useState<AllotmentFormData>(INITIAL_ALLOTMENT_FORM_DATA);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: allotmentsData, error: allotmentsError },
        { data: profilesData },
        { data: propertiesData },
      ] = await Promise.all([
        supabase
          .from('allotments')
          .select('*, profiles(id, full_name, email), properties(id, name), payment_schedules(*)')
          .order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, full_name, email').order('full_name'),
        supabase.from('properties').select('id, name').eq('active', true).order('name'),
      ]);

      if (allotmentsError) throw allotmentsError;
      setAllotments((allotmentsData as unknown as AllotmentRecord[]) || []);
      setProfiles((profilesData as unknown as ProfileSummary[]) || []);
      setProperties((propertiesData as unknown as PropertySummary[]) || []);
    } catch (error: unknown) {
      toast.error(t('failedToLoad'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase.from('allotments').update(formData).eq('id', editingId);
        if (error) throw error;
        toast.success(t('allotmentUpdated'));
      } else {
        const { error } = await supabase.from('allotments').insert(formData);
        if (error) throw error;
        toast.success(t('allotmentCreated'));
      }
      setShowModal(false);
      await fetchData();
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
      await fetchData();
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
          paid_date: newStatus === 'paid' ? new Date().toISOString() : null,
        })
        .eq('id', paymentId);

      if (error) throw error;
      toast.success(t('paymentMarkedAs', { status: newStatus }));
      await fetchData();
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
      profile_id: allotment.profile_id,
      property_id: allotment.property_id,
      unit_number: allotment.unit_number || '',
      area: allotment.area?.toString() || '',
      total_cost: allotment.total_cost?.toString() || '',
      booking_date: allotment.booking_date || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const filteredAllotments = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return allotments.filter(
      (a) =>
        a.profiles?.full_name?.toLowerCase().includes(term) ||
        a.profiles?.email?.toLowerCase().includes(term) ||
        a.properties?.name?.toLowerCase().includes(term) ||
        a.unit_number?.toLowerCase().includes(term)
    );
  }, [allotments, searchTerm]);

  return {
    allotments,
    filteredAllotments,
    profiles,
    properties,
    loading,
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
    handleSave,
    handleDelete,
    togglePaymentStatus,
    openCreateModal,
    openEditModal,
    closeModal,
  };
}
