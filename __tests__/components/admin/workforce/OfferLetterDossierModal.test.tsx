import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { OfferLetterDossierModal } from '@/src/components/admin/workforce/OfferLetterDossierModal';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';
import { WorkforceDirectoryTab } from '@/src/components/admin/workforce/tabs/WorkforceDirectoryTab';
import type { EmployeeLiveStatus } from '@/src/lib/supabase/types';

const mockEmployee: Employee = {
  id: 'emp-101',
  full_name: 'Aarav Sharma',
  email: 'aarav.sharma@sviinfra.com',
  real_email: 'aarav.personal@gmail.com',
  phone: '9876543210',
  department: 'Sales',
  notes: 'Senior property advisor',
  created_at: '2026-01-15T00:00:00Z',
  is_active: true,
};

const mockMatchingOfferLetter = {
  id: 'doc-offer-99',
  document_type: 'offer_letter',
  status: 'completed',
  created_at: '2026-01-14T10:00:00Z',
  form_data: {
    name: 'Aarav Sharma',
    emailId: 'aarav.sharma@sviinfra.com',
    mobileNo: '9876543210',
    designation: 'Senior Sales Manager',
    department: 'Sales',
    salaryCtc: '65000',
    salaryType: 'CTC',
    target: '500',
    targetUnit: 'Sq. Yd.',
    appointmentDate: '2026-02-01',
    date: '2026-01-14',
    offerSlab: 'Slab Elite',
    reportingTo: 'Director of Sales',
    location: 'Head Office, Sector 63, Noida',
    workingHoursStart: '09:30 AM',
    workingHoursEnd: '06:30 PM',
    workingDays: 'Monday - Saturday',
    probationPeriod: '3 Months',
    isFixedSalary: false,
  },
};

describe('OfferLetterDossierModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loads and matches employee offer letters by work email', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/admin/documents')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ documents: [mockMatchingOfferLetter] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ value: null }),
      });
    });
    global.fetch = fetchMock;

    render(
      <OfferLetterDossierModal
        employee={mockEmployee}
        isOpen={true}
        onClose={vi.fn()}
        token="test-token"
      />
    );

    // Initial loading indicator
    expect(screen.getByText(/Scanning documents archive/i)).toBeInTheDocument();

    // After resolution: Match banner should show
    await waitFor(() => {
      expect(screen.getByText(/Matched via/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Work Email \(aarav.sharma@sviinfra.com\)/i)).toBeInTheDocument();
  });

  it('correctly displays candidate designation and compensation details', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/admin/documents')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ documents: [mockMatchingOfferLetter] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ value: null }),
      });
    });
    global.fetch = fetchMock;

    render(
      <OfferLetterDossierModal
        employee={mockEmployee}
        isOpen={true}
        onClose={vi.fn()}
        token="test-token"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Senior Sales Manager/i)).toBeInTheDocument();
    });

    // Check monthly and annual CTC
    expect(screen.getByText('₹65,000')).toBeInTheDocument();
    expect(screen.getByText('₹7,80,000')).toBeInTheDocument();

    // Check sales target
    expect(screen.getByText('500 Sq. Yd.')).toBeInTheDocument();

    // Check appointment / joining date
    expect(screen.getByText('2026-02-01')).toBeInTheDocument();

    // Check action buttons exist
    expect(screen.getByRole('button', { name: /View Live Preview/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Edit Offer/i })).toBeInTheDocument();
  });

  it('matches employee by phone number if email differs', async () => {
    const offerWithDifferentEmail = {
      ...mockMatchingOfferLetter,
      id: 'doc-offer-phone-match',
      form_data: {
        ...mockMatchingOfferLetter.form_data,
        emailId: 'old.account@otherdomain.com',
        mobileNo: '+91 98765 43210',
      },
    };

    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/admin/documents')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ documents: [offerWithDifferentEmail] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ value: null }),
      });
    });
    global.fetch = fetchMock;

    render(
      <OfferLetterDossierModal
        employee={{ ...mockEmployee, email: 'unmatched@sviinfra.com' }}
        isOpen={true}
        onClose={vi.fn()}
        token="test-token"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Matched via/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByText('₹65,000')).toBeInTheDocument();
  });

  it('renders graceful fallback when no offer letter exists yet with a quick link to /admin/offer-letter', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/admin/documents')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            documents: [
              {
                id: 'unrelated-doc',
                form_data: {
                  name: 'Completely Different Person',
                  emailId: 'someone.else@sviinfra.com',
                  mobileNo: '1122334455',
                },
              },
            ],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ value: null }),
      });
    });
    global.fetch = fetchMock;

    render(
      <OfferLetterDossierModal
        employee={mockEmployee}
        isOpen={true}
        onClose={vi.fn()}
        token="test-token"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No Offer Letter Linked')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/No generated offer letter document was found matching/i)
    ).toBeInTheDocument();

    // Check quick CTA link to /admin/offer-letter
    const generateLink = screen.getByRole('link', { name: /Generate Offer Letter/i });
    expect(generateLink).toBeInTheDocument();
    expect(generateLink.getAttribute('href')).toContain('/admin/offer-letter');
    expect(generateLink.getAttribute('href')).toContain(encodeURIComponent(mockEmployee.full_name));
    expect(generateLink.getAttribute('href')).toContain(encodeURIComponent(mockEmployee.email));
  });

  it('opens live preview modal when View Live Preview button is clicked', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/admin/documents')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ documents: [mockMatchingOfferLetter] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ value: null }),
      });
    });
    global.fetch = fetchMock;

    render(
      <OfferLetterDossierModal
        employee={mockEmployee}
        isOpen={true}
        onClose={vi.fn()}
        token="test-token"
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /View Live Preview/i })).toBeInTheDocument();
    });

    const previewBtn = screen.getByRole('button', { name: /View Live Preview/i });
    fireEvent.click(previewBtn);

    // Live preview modal title
    await waitFor(() => {
      expect(screen.getByText('Live Preview')).toBeInTheDocument();
    });
  });

  it('closes when close button or escape is triggered', async () => {
    const handleClose = vi.fn();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ documents: [] }),
    });
    global.fetch = fetchMock;

    render(
      <OfferLetterDossierModal
        employee={mockEmployee}
        isOpen={true}
        onClose={handleClose}
        token="test-token"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No Offer Letter Linked')).toBeInTheDocument();
    });

    const closeBtn = screen.getByRole('button', { name: /Close modal/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Escape key
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});

describe('WorkforceDirectoryTab with OfferLetterDossierModal integration', () => {
  it('renders Offer Letter button on employee cards and opens modal on click', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/admin/documents')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ documents: [mockMatchingOfferLetter] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ value: null }),
      });
    });
    global.fetch = fetchMock;

    render(
      <WorkforceDirectoryTab
        employees={[mockEmployee]}
        loadingEmployees={false}
        liveStatusMap={new Map<string, EmployeeLiveStatus>()}
        onRefresh={vi.fn()}
        onBulkImport={vi.fn()}
        onEditEmployee={vi.fn()}
        onDeleteEmployee={vi.fn()}
        onResetPassword={vi.fn()}
        onViewPerformance={vi.fn()}
      />
    );

    const offerLetterBtn = screen.getByRole('button', { name: /Offer Letter Dossier/i });
    expect(offerLetterBtn).toBeInTheDocument();

    fireEvent.click(offerLetterBtn);

    // Offer Letter Dossier modal opens
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Offer Letter Dossier/i })).toBeInTheDocument();
    });
  });

  it('renders Offer Letter button in table view and opens modal on click', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/admin/documents')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ documents: [mockMatchingOfferLetter] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ value: null }),
      });
    });
    global.fetch = fetchMock;

    render(
      <WorkforceDirectoryTab
        employees={[mockEmployee]}
        loadingEmployees={false}
        liveStatusMap={new Map<string, EmployeeLiveStatus>()}
        onRefresh={vi.fn()}
        onBulkImport={vi.fn()}
        onEditEmployee={vi.fn()}
        onDeleteEmployee={vi.fn()}
        onResetPassword={vi.fn()}
        onViewPerformance={vi.fn()}
      />
    );

    // Switch to table view
    const tableViewBtn = screen.getByTitle('Compact Table View');
    fireEvent.click(tableViewBtn);

    const tableOfferBtn = screen.getByRole('button', { name: /Offer Letter/i });
    expect(tableOfferBtn).toBeInTheDocument();

    fireEvent.click(tableOfferBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Offer Letter Dossier/i })).toBeInTheDocument();
    });
  });
});
