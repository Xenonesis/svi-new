import { describe, it, expect, vi } from 'vitest';
import type { Registration } from '@/src/components/admin/registrations/types';
import {
  exportRegistrationsToCsv,
  exportRegistrationsToExcel,
} from '@/src/lib/registrations/exportRegistrations';

const sampleReg: Registration = {
  id: 'reg-001',
  submission_id: 'SVI-REG-101',
  name: 'Ajeet',
  last_name: 'Kumar',
  email: 'ajeet@example.com',
  phone: '9876543210',
  so_wo_do: 'S/O Ramesh Kumar',
  preferred_date: '1990-05-15',
  aadhar_number: '567890123456',
  pan_number: 'ABCDE1234F',
  photo_url: null,
  pan_card_file_url: null,
  state: 'Rajasthan',
  city: 'Jaipur',
  address: '123, Vaishali Nagar',
  advisor_name: 'Rashmi Shakya',
  project: 'Shivani Vatika 11',
  property_size: '100 sq yd',
  property_type: 'Residential Plot',
  plot_preference: 'Corner',
  payment_plan: 'Installment',
  payment_mode: 'Cheque',
  scheme_amount: '2100',
  property_interest: null,
  message: null,
  status: 'Approved',
  is_important: true,
  created_at: '2026-10-14T10:00:00Z',
};

describe('exportRegistrations utility', () => {
  it('exports registrations to CSV without errors', () => {
    // Mock URL and document.createElement
    const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url');
    const revokeObjectURLMock = vi.fn();
    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = revokeObjectURLMock;

    const clickMock = vi.fn();
    const appendChildMock = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation((node) => node);
    const removeChildMock = vi
      .spyOn(document.body, 'removeChild')
      .mockImplementation((node) => node);
    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: clickMock,
    } as unknown as HTMLAnchorElement);

    exportRegistrationsToCsv([sampleReg], 'test.csv');

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');

    appendChildMock.mockRestore();
    removeChildMock.mockRestore();
  });

  it('exports registrations to Excel without errors', async () => {
    const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url');
    const revokeObjectURLMock = vi.fn();
    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = revokeObjectURLMock;

    const clickMock = vi.fn();
    const appendChildMock = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation((node) => node);
    const removeChildMock = vi
      .spyOn(document.body, 'removeChild')
      .mockImplementation((node) => node);
    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: clickMock,
    } as unknown as HTMLAnchorElement);

    await exportRegistrationsToExcel([sampleReg], 'test.xlsx');

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();

    appendChildMock.mockRestore();
    removeChildMock.mockRestore();
  });
});
