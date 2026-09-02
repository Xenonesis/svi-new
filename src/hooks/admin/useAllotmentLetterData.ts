import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import { toast } from 'sonner';

export interface Advisor {
  full_name: string;
  phone: string | null;
  email: string | null;
}

export const DRAFT_VERSION = 1;

export function useAllotmentLetterData(token: string | null) {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [isCustomAdvisor, setIsCustomAdvisor] = useState(false);
  const [isCustomSecondPaymentDays, setIsCustomSecondPaymentDays] = useState(false);
  const [projects, setProjects] = useState<{ value: string; label: string }[]>([
    { value: 'Shyam Aangan', label: 'Shyam Aangan' },
    { value: 'Shyam Aangan Farm House', label: 'Shyam Aangan Farm House' },
    { value: 'Shivani Vatika 11th', label: 'Shivani Vatika 11th' },
  ]);

  const [companyInfo, setCompanyInfo] = useState({
    company_name: 'SVI Infra Solutions Pvt. Ltd.',
    company_address: 'Block E-220, 2nd Floor, Sector 63, Noida, Uttar Pradesh 201309',
    company_email: 'info@sviinfrasolutions.com',
    company_phone: '+91 9216014579',
    company_website: 'www.sviinfrasolutions.in | www.sviinfrasolutions.com',
    bank_account_name: 'Svi Infra Solutions Pvt. Ltd',
    bank_account_no: '0894102000013837',
    bank_name: 'IDBI BANK',
    bank_ifsc: 'IBKL0000894',
  });

  const [formData, setFormData] = useState({
    clientName: '',
    salutation: 'Mr.',
    address: '',
    ticketId: '',
    aadharNumber: '',
    fatherName: '',
    onBookingPaymentRef: '',
    within15DaysPaymentRef: '',
    projectName: 'Shyam Aangan',
    unitNumber: '',
    area: '',
    bsp: '',
    plc: '',
    edc: '',
    edcInEmi: 'false',
    paymentPlan: '12',
    bookingDate: '',
    secondPaymentDays: '15',
    advisorName: '',
    advisorNumber: '',
    advisorEmail: '',
    emiCount: '12',
    emiPercentage: '',
    emiStartDate: '',
    zeroPercentEmi: 'false',
    bookingPaymentPercent: '10',
    showSecondInstalment: 'true',
  });

  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [preview, setPreview] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [duplicateRecordToOverwrite, setDuplicateRecordToOverwrite] = useState<any>(null);
  const [savedAllotments, setSavedAllotments] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState('');

  // Load Projects
  useEffect(() => {
    async function loadProjects() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('name')
          .eq('active', true)
          .order('name', { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) {
          setProjects(
            data.map((p) => ({
              value: p.name,
              label: p.name,
            }))
          );
        }
      } catch (err) {
        console.error('Error loading projects:', err);
      }
    }
    loadProjects();
  }, []);

  // Load Advisors and Saved Allotments
  useEffect(() => {
    if (!token) return;

    async function loadAdvisors() {
      try {
        const settingsRes = await fetch('/api/admin/settings?key=active_advisors', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!settingsRes.ok) throw new Error('Failed to fetch advisor settings');
        const settingsJson = await settingsRes.json();

        let advisorIds: string[] = [];
        if (settingsJson?.value?.ids && Array.isArray(settingsJson.value.ids)) {
          advisorIds = settingsJson.value.ids;
        }

        const usersRes = await fetch('/api/admin/users?limit=100', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!usersRes.ok) throw new Error('Failed to fetch profiles');
        const usersJson = await usersRes.json();
        const allProfiles: any[] = usersJson.users || [];

        const filteredProfiles = allProfiles.filter((p) => advisorIds.includes(p.id));

        setAdvisors(
          filteredProfiles.map((p) => ({
            full_name: p.full_name || '',
            phone: p.phone || '',
            email: p.real_email || p.email || '',
          }))
        );
      } catch (err) {
        console.error('Error loading advisors:', err);
      }
    }
    loadAdvisors();
  }, [token]);
  const loadSavedAllotments = useCallback(async () => {
    if (!token) return;
    setLoadingRecords(true);
    try {
      const res = await fetch('/api/admin/documents?type=allotment_letter&limit=500', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch records');
      const json = await res.json();
      const docs = json.documents || [];
      const valid = docs.filter(
        (d: any) =>
          d.form_data?.clientName ||
          d.form_data?.name ||
          d.form_data?.client_name ||
          d.form_data?.ticketId ||
          d.id
      );
      setSavedAllotments(valid);
    } catch (err) {
      console.error('Error loading allotment records:', err);
    } finally {
      setLoadingRecords(false);
    }
  }, [token]);

  useEffect(() => {
    loadSavedAllotments();
  }, [loadSavedAllotments]);

  // Load Company Info
  useEffect(() => {
    if (!token) return;
    fetch('/api/admin/settings?key=company_info', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch settings');
        return res.json();
      })
      .then((json) => {
        if (json.value) {
          setCompanyInfo(json.value);
        }
      })
      .catch((err) => console.error('Error fetching company info:', err));
  }, [token]);

  // Load draft from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDraft = localStorage.getItem('allotment_letter_form_draft');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed._v === DRAFT_VERSION) {
            const { _v, ...data } = parsed;
            setFormData((prev) => ({ ...prev, ...data }));

            const isCustomDays =
              parsed.secondPaymentDays &&
              parsed.secondPaymentDays !== '15' &&
              parsed.secondPaymentDays !== '28';
            setIsCustomSecondPaymentDays(!!isCustomDays);
          } else {
            localStorage.removeItem('allotment_letter_form_draft');
          }
        } catch (e) {
          console.error('Failed to parse form draft from localStorage', e);
        }
      }
      setIsDraftLoaded(true);
    }
  }, []);

  // Save draft to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && isDraftLoaded) {
      localStorage.setItem(
        'allotment_letter_form_draft',
        JSON.stringify({ _v: DRAFT_VERSION, ...formData })
      );
    }
  }, [formData, isDraftLoaded]);

  // Adjust isCustomAdvisor based on advisors and form data
  useEffect(() => {
    if (isDraftLoaded && advisors.length > 0 && formData.advisorName) {
      const isCustAdv =
        formData.advisorName && !advisors.some((adv) => adv.full_name === formData.advisorName);
      setIsCustomAdvisor(!!isCustAdv);
    }
  }, [advisors, isDraftLoaded, formData.advisorName]);

  const loadFromRecord = useCallback(
    async (idOrRecord: string | any) => {
      if (!idOrRecord) {
        setSelectedRecordId('');
        return;
      }

      let record: any = null;
      let targetId = '';

      if (typeof idOrRecord === 'string') {
        targetId = idOrRecord;
        record = savedAllotments.find((r) => r.id === targetId);

        // If not in local cache, fetch directly from API
        if (!record && token) {
          try {
            const res = await fetch(`/api/admin/documents/${targetId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const json = await res.json();
              record = json.document;
            }
          } catch (err) {
            console.error('Failed to fetch document by ID:', err);
          }
        }
      } else if (idOrRecord && typeof idOrRecord === 'object') {
        record = idOrRecord;
        targetId = record.id;
      }

      if (!record?.form_data) {
        toast.error('Unable to load record details');
        return;
      }

      const fd = record.form_data;
      const clientName = fd.clientName || fd.name || fd.client_name || 'Client';

      const isCustAdv = fd.advisorName && !advisors.some((adv) => adv.full_name === fd.advisorName);
      setIsCustomAdvisor(!!isCustAdv);

      const isCustomDays =
        fd.secondPaymentDays && fd.secondPaymentDays !== '15' && fd.secondPaymentDays !== '28';
      setIsCustomSecondPaymentDays(!!isCustomDays);

      setFormData({
        clientName: fd.clientName || fd.name || '',
        salutation: fd.salutation || 'Mr.',
        address: fd.address || '',
        ticketId: fd.ticketId || '',
        projectName: fd.projectName || 'Shyam Aangan',
        unitNumber: fd.unitNumber || '',
        area: fd.area || '',
        bsp: fd.bsp || '',
        plc: fd.plc || '',
        edc: fd.edc || '',
        edcInEmi: fd.edcInEmi ? String(fd.edcInEmi) : 'false',
        paymentPlan: fd.paymentPlan || '12',
        bookingDate: fd.bookingDate || '',
        secondPaymentDays: fd.secondPaymentDays || '15',
        advisorName: fd.advisorName || '',
        advisorNumber: fd.advisorNumber || '',
        advisorEmail: fd.advisorEmail || '',
        aadharNumber: fd.aadharNumber || '',
        fatherName: fd.fatherName || '',
        onBookingPaymentRef: fd.onBookingPaymentRef || '',
        within15DaysPaymentRef: fd.within15DaysPaymentRef || '',
        emiCount: fd.emiCount || '12',
        emiPercentage: fd.emiPercentage || '',
        emiStartDate: fd.emiStartDate || '',
        zeroPercentEmi: fd.zeroPercentEmi ? String(fd.zeroPercentEmi) : 'false',
        bookingPaymentPercent: fd.bookingPaymentPercent || '10',
        showSecondInstalment: fd.showSecondInstalment ? String(fd.showSecondInstalment) : 'true',
      });

      setSelectedRecordId(targetId);
      setDocumentId(targetId);
      toast.success(`Loaded allotment record for "${clientName}"`);
    },
    [savedAllotments, advisors, token]
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const templateId = searchParams.get('templateId');
      if (templateId && !selectedRecordId) {
        loadFromRecord(templateId);
      }

      const prefillRegistration = searchParams.get('prefillRegistration');
      if (prefillRegistration === 'true') {
        const storedReg = sessionStorage.getItem('allotmentPrefillRegistration');
        if (storedReg) {
          try {
            const regData = JSON.parse(storedReg);
            setFormData((prev) => {
              let proj = regData.project || regData.property_interest;
              if (proj) {
                const projectMap: Record<string, string> = {
                  'shyam-aangan': 'Shyam Aangan',
                  'shyam-aangan-phase-1': 'Shyam Aangan Phase 1',
                  'shyam-aangan-farm-house': 'Shyam Aangan Farm House',
                  'shivani-vatika': 'Shivani Vatika',
                  'phulera-smartcity': 'Phulera SmartCity',
                };
                proj = projectMap[proj.toLowerCase().trim()] || proj;
              } else {
                proj = prev.projectName;
              }

              return {
                ...prev,
                clientName: `${regData.name || ''} ${regData.last_name || ''}`.trim(),
                address: regData.address || '',
                projectName: proj,
                ticketId: regData.submission_id || prev.ticketId,
              };
            });
            sessionStorage.removeItem('allotmentPrefillRegistration');
          } catch (e) {
            console.error('Failed to parse prefill registration', e);
          }
        }
      }
    }
  }, [savedAllotments, selectedRecordId]);

  const handleAdvisorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    if (name === 'custom') {
      setIsCustomAdvisor(true);
      setFormData((prev) => ({
        ...prev,
        advisorName: '',
        advisorNumber: '',
        advisorEmail: '',
      }));
    } else {
      setIsCustomAdvisor(false);
      const selected = advisors.find((adv) => adv.full_name === name);
      setFormData((prev) => ({
        ...prev,
        advisorName: name,
        advisorNumber: selected?.phone || '',
        advisorEmail: selected?.email || '',
      }));
    }
  };

  const parseDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const formatYYYYMMDD = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getCustomDateValue = () => {
    if (!formData.bookingDate) return '';
    const bDate = parseDate(formData.bookingDate);
    const days = parseInt(formData.secondPaymentDays) || 0;
    const targetDate = new Date(bDate);
    targetDate.setDate(targetDate.getDate() + days);
    return formatYYYYMMDD(targetDate);
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosenDateStr = e.target.value;
    if (!chosenDateStr) return;

    const bDateStr = formData.bookingDate || formatYYYYMMDD(new Date());
    const bDate = parseDate(bDateStr);
    const chosenDate = parseDate(chosenDateStr);

    const diffTime = chosenDate.getTime() - bDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setFormData((prev) => ({
      ...prev,
      secondPaymentDays: String(diffDays >= 0 ? diffDays : 0),
      bookingDate: prev.bookingDate ? prev.bookingDate : bDateStr,
    }));
  };

  const handleSecondPaymentDaysChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'custom') {
      setIsCustomSecondPaymentDays(true);
      const bDateStr = formData.bookingDate || formatYYYYMMDD(new Date());
      const bDate = parseDate(bDateStr);
      const defaultTarget = new Date(bDate);
      defaultTarget.setDate(defaultTarget.getDate() + 15);

      setFormData((prev) => ({
        ...prev,
        secondPaymentDays: '15',
        bookingDate: prev.bookingDate ? prev.bookingDate : bDateStr,
      }));
    } else {
      setIsCustomSecondPaymentDays(false);
      setFormData((prev) => ({
        ...prev,
        secondPaymentDays: val,
      }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return {
    advisors,
    isCustomAdvisor,
    setIsCustomAdvisor,
    isCustomSecondPaymentDays,
    setIsCustomSecondPaymentDays,
    projects,
    companyInfo,
    formData,
    setFormData,
    preview,
    setPreview,
    documentId,
    setDocumentId,
    isSaving,
    setIsSaving,
    showSaveModal,
    setShowSaveModal,
    duplicateRecordToOverwrite,
    setDuplicateRecordToOverwrite,
    savedAllotments,
    setSavedAllotments,
    loadingRecords,
    refreshRecords: loadSavedAllotments,
    selectedRecordId,
    setSelectedRecordId,
    loadFromRecord,
    handleAdvisorChange,
    getCustomDateValue,
    handleCustomDateChange,
    handleSecondPaymentDaysChange,
    handleChange,
    parseDate,
    formatYYYYMMDD,
  };
}
