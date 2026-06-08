import { useAdminSession } from '@/src/components/admin/AdminSessionProvider';
import { useEffect, useState } from 'react';

interface OfferLetterData {
  id?: string;
  document_type: string;
  status: string;
  created_at?: string;
  form_data: {
    date?: string;
    name?: string;
    address?: string;
    mobileNo?: string;
    alternativeNo?: string;
    emailId?: string;
    designation?: string;
    department?: string;
    reportingTo?: string;
    appointmentDate?: string;
    location?: string;
    salaryCtc?: string;
    target?: string;
    offerSlab?: string;
    workingHoursStart?: string;
    workingHoursEnd?: string;
    workingDays?: string;
    probationPeriod?: string;
    salesCompensationType?: string;
    noSaleMonths?: string;
    customSalaryPercent?: string;
    subsistenceAllowance?: string;
  };
}

interface UseOfferLetterApiOptions {
  token?: string | null;
}

export function useOfferLetterApi({ token }: UseOfferLetterApiOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async (params?: { type?: string; limit?: number }) => {
    if (!token) return [];
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (params?.type) query.set('type', params.type);
      if (params?.limit) query.set('limit', params.limit.toString());

      const response = await fetch(`/api/admin/documents?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch documents');
      const json = await response.json();
      return json.documents || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const saveDocument = async (data: Partial<OfferLetterData>) => {
    if (!token) throw new Error('No token available');
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          document_type: 'offer_letter',
          form_data: data.form_data,
          status: data.status || 'draft',
        }),
      });
      if (!response.ok) throw new Error('Failed to save document');
      return await response.json();
    } finally {
      setLoading(false);
    }
  };

  const updateDocument = async (id: string, updates: Partial<OfferLetterData>) => {
    if (!token) throw new Error('No token available');
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/documents/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update document');
      return response.json();
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: string) => {
    if (!token) throw new Error('No token available');
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete document');
      return true;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchDocuments,
    saveDocument,
    updateDocument,
    deleteDocument,
  };
}
