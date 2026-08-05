import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import { useSearchParams } from 'next/navigation';

export interface Advisor {
  full_name: string;
  phone: string | null;
  email: string | null;
}

export function useBBAData(token: string | null) {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  const allotmentId = searchParams.get('allotmentId');

  const [savedBbas, setSavedBbas] = useState<any[]>([]);
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
    company_address: 'A-61 Sector 65 Noida Uttar Pradesh 201309',
    company_email: 'info@sviinfrasolutions.com',
    company_phone: '+91 9216014579',
    company_website: 'www.sviinfrasolutions.in | www.sviinfrasolutions.com',
    bank_account_name: 'Svi Infra Solutions Pvt. Ltd',
    bank_account_no: '0894102000013837',
    bank_name: 'IDBI BANK',
    bank_ifsc: 'IBKL0000894',
  });

  const [formData, setFormData] = useState({
    salutation: '',
    clientName: '',
    aadharNumber: '',
    fatherName: '',
    age: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    ticketId: '',
    projectName: 'Shyam Aangan',
    unitNumber: '',
    area: '',
    bsp: '',
    plc: '',
    edc: '',
    paymentPlan: '12',
    bookingDate: '',
    secondPaymentDays: '15',
    advisorName: '',
    advisorNumber: '',
    advisorEmail: '',
    onBookingPaymentRef: '',
    onBookingAmount: '',
    within15DaysPaymentRef: '',
    within15DaysAmount: '',
    bookingPaymentPercent: '10',
    showSecondInstalment: 'true',
    zeroPercentEmi: 'false',
    emiPercentage: '',
    edcInEmi: 'false',
    emiCount: '12',
    emiStartDate: '',
    language: 'en',
  });

  const [preview, setPreview] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);

  // Load BBAs
  useEffect(() => {
    if (!token) return;
    async function loadBbas() {
      try {
        const res = await fetch('/api/admin/documents?type=bba', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSavedBbas(data.documents || []);
        }
      } catch (err) {
        console.error('Error loading BBAs:', err);
      }
    }
    loadBbas();
  }, [token]);

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
          setProjects(data.map((p) => ({ value: p.name, label: p.name })));
        }
      } catch (err) {
        console.error('Error loading projects:', err);
      }
    }
    loadProjects();
  }, []);

  // Load Advisors
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
            email: p.email || '',
          }))
        );
      } catch (err) {
        console.error('Error loading advisors:', err);
      }
    }
    loadAdvisors();
  }, [token]);

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

  // Synchronize custom advisor state
  useEffect(() => {
    if (formData.advisorName && advisors.length > 0) {
      const match = advisors.some((a) => a.full_name === formData.advisorName);
      setIsCustomAdvisor(!match);
    }
  }, [advisors, formData.advisorName]);

  // Handle URL parameters (templateId)
  useEffect(() => {
    if (savedBbas.length > 0 && templateId) {
      const selected = savedBbas.find((b) => b.id === templateId);
      if (selected && selected.form_data) {
        const fd = selected.form_data;
        setFormData((prev) => ({ ...prev, ...fd }));
        if (fd.secondPaymentDays) {
          const isCustomDays = fd.secondPaymentDays !== '15' && fd.secondPaymentDays !== '28';
          setIsCustomSecondPaymentDays(isCustomDays);
        }
      }
    }
  }, [savedBbas, templateId]);

  // Handle URL parameters (allotmentId)
  useEffect(() => {
    if (!token || !allotmentId) return;

    async function loadAllotmentAsBba() {
      try {
        const res = await fetch(`/api/admin/documents/${allotmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const allotment = data.document;
          if (allotment && allotment.form_data) {
            const allotmentData = allotment.form_data;
            const cleanSalutation = allotmentData.salutation
              ? allotmentData.salutation.replace(/\.$/, '')
              : '';

            const parsedAddr = {
              addressLine1: allotmentData.addressLine1 || '',
              addressLine2: allotmentData.addressLine2 || '',
              city: allotmentData.city || '',
              state: allotmentData.state || '',
              pincode: allotmentData.pincode || '',
            };

            if (!parsedAddr.addressLine1 && allotmentData.address) {
              const parts = allotmentData.address.split(',').map((p: string) => p.trim());
              if (parts.length === 1) {
                parsedAddr.addressLine1 = parts[0];
              } else {
                const lastPart = parts[parts.length - 1];
                if (/^\d{6}$/.test(lastPart)) {
                  parsedAddr.pincode = lastPart;
                  parts.pop();
                }
                if (parts.length > 0) {
                  parsedAddr.state = parts[parts.length - 1];
                  parts.pop();
                }
                if (parts.length > 0) {
                  parsedAddr.city = parts[parts.length - 1];
                  parts.pop();
                }
                if (parts.length === 1) {
                  parsedAddr.addressLine1 = parts[0];
                } else if (parts.length > 1) {
                  const mid = Math.ceil(parts.length / 2);
                  parsedAddr.addressLine1 = parts.slice(0, mid).join(', ');
                  parsedAddr.addressLine2 = parts.slice(mid).join(', ');
                }
              }
            }

            let finalAadhar = allotmentData.aadharNumber || '';
            let finalFather = allotmentData.fatherName || '';
            let finalOnBookingRef = allotmentData.onBookingPaymentRef || '';
            let finalWithin15DaysRef = allotmentData.within15DaysPaymentRef || '';
            const ticketId = allotmentData.ticketId || '';

            if (ticketId) {
              if (!finalAadhar || !finalFather) {
                try {
                  const regRes = await fetch(
                    `/api/admin/registrations?search=${encodeURIComponent(ticketId)}`,
                    {
                      headers: { Authorization: `Bearer ${token}` },
                    }
                  );
                  if (regRes.ok) {
                    const regData = await regRes.json();
                    const match = regData.registrations?.find(
                      (r: any) => r.submission_id?.toLowerCase() === ticketId.toLowerCase()
                    );
                    if (match) {
                      if (!finalAadhar) finalAadhar = match.aadhar_number || '';
                      if (!finalFather) finalFather = match.so_wo_do || '';
                    }
                  }
                } catch (e) {
                  console.error('Failed to lookup registration for BBA prefill:', e);
                }
              }

              if (!finalOnBookingRef || !finalWithin15DaysRef) {
                try {
                  const receiptRes = await fetch(
                    `/api/admin/documents?type=payment_receipt&limit=500`,
                    {
                      headers: { Authorization: `Bearer ${token}` },
                    }
                  );
                  if (receiptRes.ok) {
                    const receiptData = await receiptRes.json();
                    const docs = receiptData.documents || [];
                    const matches = docs
                      .filter(
                        (d: any) => d.form_data?.refId?.toLowerCase() === ticketId.toLowerCase()
                      )
                      .sort(
                        (a: any, b: any) =>
                          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                      );

                    if (matches.length > 0 && !finalOnBookingRef) {
                      finalOnBookingRef = matches[0].form_data?.paymentRef || '';
                    }
                    if (matches.length > 1 && !finalWithin15DaysRef) {
                      finalWithin15DaysRef = matches[1].form_data?.paymentRef || '';
                    }
                  }
                } catch (e) {
                  console.error('Failed to lookup payment receipts for BBA prefill:', e);
                }
              }
            }

            setFormData((prev) => ({
              ...prev,
              salutation: cleanSalutation,
              clientName: allotmentData.clientName || '',
              fatherName: finalFather,
              age: allotmentData.age || '',
              aadharNumber: finalAadhar,
              addressLine1: parsedAddr.addressLine1,
              addressLine2: parsedAddr.addressLine2,
              city: parsedAddr.city,
              state: parsedAddr.state,
              pincode: parsedAddr.pincode,
              ticketId: ticketId,
              projectName: allotmentData.projectName || 'Shyam Aangan',
              unitNumber: allotmentData.unitNumber || '',
              area: allotmentData.area || '',
              bsp: allotmentData.bsp || '',
              plc: allotmentData.plc || '',
              edc: allotmentData.edc || '',
              paymentPlan: allotmentData.paymentPlan || '12',
              bookingDate: allotmentData.bookingDate || '',
              secondPaymentDays: allotmentData.secondPaymentDays || '15',
              advisorName: allotmentData.advisorName || '',
              advisorNumber: allotmentData.advisorNumber || '',
              advisorEmail: allotmentData.advisorEmail || '',
              onBookingPaymentRef: finalOnBookingRef,
              within15DaysPaymentRef: finalWithin15DaysRef,
              bookingPaymentPercent: allotmentData.bookingPaymentPercent || '10',
              showSecondInstalment:
                allotmentData.showSecondInstalment !== undefined
                  ? String(allotmentData.showSecondInstalment)
                  : 'true',
              zeroPercentEmi:
                allotmentData.zeroPercentEmi !== undefined
                  ? String(allotmentData.zeroPercentEmi)
                  : 'false',
              emiPercentage: allotmentData.emiPercentage || '',
              edcInEmi:
                allotmentData.edcInEmi !== undefined ? String(allotmentData.edcInEmi) : 'false',
              emiCount: allotmentData.emiCount || allotmentData.paymentPlan || '12',
              emiStartDate: allotmentData.emiStartDate || '',
              language: allotmentData.language || 'en',
            }));

            if (allotmentData.secondPaymentDays) {
              const isCustomDays =
                allotmentData.secondPaymentDays !== '15' &&
                allotmentData.secondPaymentDays !== '28';
              setIsCustomSecondPaymentDays(isCustomDays);
            }
          }
        }
      } catch (err) {
        console.error('Error loading allotment as template for BBA:', err);
      }
    }
    loadAllotmentAsBba();
  }, [token, allotmentId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const formatYYYYMMDD = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const parseDateLocal = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const getCustomDateValue = () => {
    if (!formData.bookingDate) return '';
    const bDate = parseDateLocal(formData.bookingDate);
    const days = parseInt(formData.secondPaymentDays) || 0;
    const targetDate = new Date(bDate);
    targetDate.setDate(targetDate.getDate() + days);
    return formatYYYYMMDD(targetDate);
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosenDateStr = e.target.value;
    if (!chosenDateStr) return;

    const bDateStr = formData.bookingDate || formatYYYYMMDD(new Date());
    const bDate = parseDateLocal(bDateStr);
    const chosenDate = parseDateLocal(chosenDateStr);

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
      const bDate = parseDateLocal(bDateStr);
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
    savedBbas,
    setSavedBbas,
    handleChange,
    getCustomDateValue,
    handleCustomDateChange,
    handleSecondPaymentDaysChange,
    handleAdvisorChange,
  };
}
