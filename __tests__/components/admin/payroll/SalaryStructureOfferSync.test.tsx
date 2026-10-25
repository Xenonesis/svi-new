import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import {
  SalaryStructureModal,
  parseOfferCompensation,
  cleanPhone,
  cleanName,
} from '@/src/components/admin/payroll/SalaryStructureModal';
import { WorkforcePayrollTab } from '@/src/components/admin/workforce/tabs/WorkforcePayrollTab';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';

const mockEmployee1: Employee = {
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

const mockEmployee2: Employee = {
  id: 'emp-102',
  full_name: 'Rohan Mehra',
  email: 'rohan.mehra@sviinfra.com',
  phone: '9811223344',
  department: 'Engineering',
  notes: null,
  created_at: '2026-02-01T00:00:00Z',
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
    offerSlab: 'Slab 4',
    conveyanceAllowanceAmount: '2000',
  },
};

const mockSecondOfferLetter = {
  id: 'doc-offer-100',
  document_type: 'offer_letter',
  status: 'completed',
  created_at: '2026-02-10T10:00:00Z',
  form_data: {
    name: 'Aarav Sharma',
    emailId: 'aarav.sharma@sviinfra.com',
    mobileNo: '9876543210',
    designation: 'Assistant Vice President',
    department: 'Sales',
    salaryCtc: '85000',
    salaryType: 'CTC',
    target: '800',
    targetUnit: 'Sq. Yd.',
    appointmentDate: '2026-03-01',
    offerSlab: 'Slab Elite',
    conveyanceAllowanceAmount: '3000',
  },
};

const mockAnnualOfferLetter = {
  id: 'doc-offer-annual',
  document_type: 'offer_letter',
  status: 'completed',
  created_at: '2026-01-10T10:00:00Z',
  form_data: {
    name: 'Rohan Mehra',
    emailId: 'rohan.mehra@sviinfra.com',
    mobileNo: '9811223344',
    designation: 'Lead Architect',
    salaryCtc: '600000',
    salaryType: 'annual',
    target: '0',
    targetUnit: 'Units',
  },
};

describe('SalaryStructureOfferSync', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('parseOfferCompensation utility', () => {
    it('correctly parses monthly CTC, 50% basic, 40% HRA, conveyance, and target quota', () => {
      const parsed = parseOfferCompensation({
        salaryCtc: '65000',
        salaryType: 'CTC',
        conveyanceAllowanceAmount: '2000',
        target: '500',
        targetUnit: 'Sq. Yd.',
        offerSlab: 'Slab 4',
        designation: 'Sales Manager',
      });

      expect(parsed.baseSalary).toBe(65000);
      expect(parsed.basicPay).toBe(32500); // 50% of 65000
      expect(parsed.hra).toBe(26000); // 40% of 65000
      expect(parsed.conveyanceAllowance).toBe(2000);
      expect(parsed.specialAllowance).toBe(4500); // 65000 - (32500 + 26000 + 2000)
      expect(parsed.monthlyTarget).toBe(500);
      expect(parsed.targetUnit).toBe('Sq. Yd.');
      expect(parsed.offerSlab).toBe('Slab 4');
      expect(parsed.designation).toBe('Sales Manager');
      expect(parsed.isAnnualConverted).toBe(false);
    });

    it('correctly converts annual CTC to monthly salary', () => {
      const parsed = parseOfferCompensation({
        salaryCtc: '600000',
        salaryType: 'annual',
        target: '100',
      });

      expect(parsed.isAnnualConverted).toBe(true);
      expect(parsed.baseSalary).toBe(50000); // 600,000 / 12
      expect(parsed.basicPay).toBe(25000); // 50%
      expect(parsed.hra).toBe(20000); // 40%
      expect(parsed.specialAllowance).toBe(5000); // remainder
      expect(parsed.monthlyTarget).toBe(100);
    });

    it('handles formatted numbers with commas', () => {
      const parsed = parseOfferCompensation({
        salaryCtc: '1,20,000',
        target: '1,500',
      });

      expect(parsed.baseSalary).toBe(120000);
      expect(parsed.monthlyTarget).toBe(1500);
    });
  });

  describe('Offer Letter Detection', () => {
    it('detects matching offer letter when employee is selected and displays banner', async () => {
      const fetchMock = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/admin/documents')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ documents: [mockMatchingOfferLetter] }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });
      global.fetch = fetchMock;

      render(
        <SalaryStructureModal
          isOpen={true}
          onClose={vi.fn()}
          onSaved={vi.fn()}
          employees={[mockEmployee1, mockEmployee2]}
          defaultEmployeeId="emp-101"
          token="test-token"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('offer-letter-detected-banner')).toBeInTheDocument();
      });

      expect(screen.getByText(/Active Offer Letter Detected/i)).toBeInTheDocument();
      expect(screen.getByText(/Senior Sales Manager/i)).toBeInTheDocument();
      expect(screen.getByText(/500 Sq\. Yd\./i)).toBeInTheDocument();
      expect(screen.getByTestId('sync-from-offer-letter-btn')).toBeInTheDocument();
    });

    it('allows selecting between multiple matching offer letters', async () => {
      const fetchMock = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/admin/documents')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ documents: [mockMatchingOfferLetter, mockSecondOfferLetter] }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });
      global.fetch = fetchMock;

      render(
        <SalaryStructureModal
          isOpen={true}
          onClose={vi.fn()}
          onSaved={vi.fn()}
          employees={[mockEmployee1]}
          defaultEmployeeId="emp-101"
          token="test-token"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/2 Documents Found/i)).toBeInTheDocument();
      });

      // The newest offer (Assistant Vice President, 800 Sq. Yd.) is selected by default
      expect(screen.getAllByText(/Assistant Vice President/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/800 Sq\. Yd\./i)).toBeInTheDocument();

      const offerDropdown = screen.getByLabelText(/Select Matching Offer Document/i);
      expect(offerDropdown).toBeInTheDocument();

      // Switch to the other offer (index 1: Senior Sales Manager, 500 Sq. Yd.)
      fireEvent.change(offerDropdown, { target: { value: '1' } });

      await waitFor(() => {
        expect(screen.getAllByText(/Senior Sales Manager/i).length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText(/500 Sq\. Yd\./i)).toBeInTheDocument();
      });
    });
    it('does not display offer letter sync banner when no matching offer exists', async () => {
      const fetchMock = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/admin/documents')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ documents: [] }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });
      global.fetch = fetchMock;

      render(
        <SalaryStructureModal
          isOpen={true}
          onClose={vi.fn()}
          onSaved={vi.fn()}
          employees={[mockEmployee2]}
          defaultEmployeeId="emp-102"
          token="test-token"
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('offer-letter-detected-banner')).not.toBeInTheDocument();
      });
      expect(screen.queryByTestId('sync-from-offer-letter-btn')).not.toBeInTheDocument();
    });
  });

  describe('Auto-Population and Sync from Offer Letter', () => {
    it('pre-fills base salary, basic, HRA, allowances, and sales target on 1-click sync', async () => {
      const fetchMock = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/admin/documents')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ documents: [mockMatchingOfferLetter] }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });
      global.fetch = fetchMock;

      render(
        <SalaryStructureModal
          isOpen={true}
          onClose={vi.fn()}
          onSaved={vi.fn()}
          employees={[mockEmployee1]}
          defaultEmployeeId="emp-101"
          token="test-token"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('sync-from-offer-letter-btn')).toBeInTheDocument();
      });

      // Click "Sync from Offer Letter"
      fireEvent.click(screen.getByTestId('sync-from-offer-letter-btn'));

      // Verify input values are auto-populated
      const baseSalaryInput = screen.getByTestId('base-salary-input') as HTMLInputElement;
      const basicPayInput = screen.getByTestId('basic-pay-input') as HTMLInputElement;
      const hraInput = screen.getByTestId('hra-input') as HTMLInputElement;
      const specialAllowanceInput = screen.getByTestId(
        'special-allowance-input'
      ) as HTMLInputElement;
      const conveyanceAllowanceInput = screen.getByTestId(
        'conveyance-allowance-input'
      ) as HTMLInputElement;
      const monthlyTargetInput = screen.getByTestId('monthly-target-input') as HTMLInputElement;

      expect(baseSalaryInput.value).toBe('65000');
      expect(basicPayInput.value).toBe('32500');
      expect(hraInput.value).toBe('26000');
      expect(conveyanceAllowanceInput.value).toBe('2000');
      expect(specialAllowanceInput.value).toBe('4500');
      expect(monthlyTargetInput.value).toBe('500');

      // Verify visual confirmation badge
      expect(screen.getByTestId('offer-synced-badge')).toBeInTheDocument();
      expect(screen.getByText(/Offer Synced/i)).toBeInTheDocument();
    });

    it('handles annual CTC offer letters and converts to monthly salary upon sync', async () => {
      const fetchMock = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/admin/documents')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ documents: [mockAnnualOfferLetter] }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });
      global.fetch = fetchMock;

      render(
        <SalaryStructureModal
          isOpen={true}
          onClose={vi.fn()}
          onSaved={vi.fn()}
          employees={[mockEmployee2]}
          defaultEmployeeId="emp-102"
          token="test-token"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('sync-from-offer-letter-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('sync-from-offer-letter-btn'));

      const baseSalaryInput = screen.getByTestId('base-salary-input') as HTMLInputElement;
      expect(baseSalaryInput.value).toBe('50000'); // 600,000 / 12
    });
  });

  describe('Manual Override Capability', () => {
    it('preserves manual overrides of salary and sales quota after sync', async () => {
      interface SavedPayload {
        base_salary?: number;
        monthly_target?: number;
        hra?: number;
        offer_document_id?: string;
      }
      const payloadCapture: { current: SavedPayload | null } = { current: null };
      const fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
        if (url.includes('/api/admin/documents')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ documents: [mockMatchingOfferLetter] }),
          });
        }
        if (url.includes('/api/admin/payroll/salary-structures') && init?.method === 'POST') {
          payloadCapture.current = JSON.parse(String(init.body)) as SavedPayload;
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true, message: 'Saved' }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });
      global.fetch = fetchMock;

      const onSavedMock = vi.fn();
      const onCloseMock = vi.fn();

      render(
        <SalaryStructureModal
          isOpen={true}
          onClose={onCloseMock}
          onSaved={onSavedMock}
          employees={[mockEmployee1]}
          defaultEmployeeId="emp-101"
          token="test-token"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('sync-from-offer-letter-btn')).toBeInTheDocument();
      });

      // 1. Sync from offer letter
      fireEvent.click(screen.getByTestId('sync-from-offer-letter-btn'));

      // 2. Perform manual overrides on synced values
      const baseSalaryInput = screen.getByTestId('base-salary-input') as HTMLInputElement;
      const monthlyTargetInput = screen.getByTestId('monthly-target-input') as HTMLInputElement;
      const hraInput = screen.getByTestId('hra-input') as HTMLInputElement;

      fireEvent.change(baseSalaryInput, { target: { value: '75000' } });
      fireEvent.change(monthlyTargetInput, { target: { value: '650' } });
      fireEvent.change(hraInput, { target: { value: '28000' } });

      expect(baseSalaryInput.value).toBe('75000');
      expect(monthlyTargetInput.value).toBe('650');
      expect(hraInput.value).toBe('28000');

      // 3. Submit the form
      const submitBtn = screen.getByRole('button', { name: /Save Salary Structure/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(onSavedMock).toHaveBeenCalled();
        expect(onCloseMock).toHaveBeenCalled();
      });

      const saved = payloadCapture.current;
      expect(saved).not.toBeNull();
      if (saved) {
        expect(saved.base_salary).toBe(75000);
        expect(saved.monthly_target).toBe(650);
        expect(saved.hra).toBe(28000);
        expect(saved.offer_document_id).toBe('doc-offer-99');
      }
    });
  });

  describe('WorkforcePayrollTab Integration', () => {
    it('renders Sync from Offer Letter button in payroll structures sub-tab', () => {
      const onAddNewMock = vi.fn();
      render(
        <WorkforcePayrollTab
          token="test-token"
          payrollSubTab="structures"
          onPayrollSubTabChange={vi.fn()}
          structures={[]}
          employees={[mockEmployee1]}
          loadingStructures={false}
          onAddNewStructure={onAddNewMock}
          onEditStructure={vi.fn()}
          onViewPayslip={vi.fn()}
        />
      );

      const syncBtn = screen.getByRole('button', { name: /Sync from Offer Letter/i });
      expect(syncBtn).toBeInTheDocument();

      fireEvent.click(syncBtn);
      expect(onAddNewMock).toHaveBeenCalledTimes(1);
    });
  });
});
