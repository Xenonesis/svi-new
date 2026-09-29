import { describe, it, expect, vi } from 'vitest';
import { exportAllotmentsToCSV } from '@/src/components/admin/portal-allotments/exportAllotmentsToCSV';
import type { AllotmentRecord } from '@/src/components/admin/portal-allotments/types';

describe('exportAllotmentsToCSV', () => {
  it('does nothing when no allotments are selected', () => {
    const createElementSpy = vi.spyOn(document, 'createElement');
    exportAllotmentsToCSV([], () => ({
      ticketId: 'SA-1',
      dealValue: 1000000,
      totalPaid: 200000,
      balanceDue: 800000,
    }));
    expect(createElementSpy).not.toHaveBeenCalled();
    createElementSpy.mockRestore();
  });

  it('triggers CSV download for selected allotments', () => {
    const mockAllotment: AllotmentRecord = {
      id: 'allot-1',
      property_id: 'prop-1',
      unit_no: 'P-101',
      properties: { id: 'prop-1', name: 'Shivani Vatika 11th' },
      profiles: {
        id: 'prof-1',
        full_name: 'Devotee Sharma',
        email: 'dev@test.com',
        phone: '9999999999',
      },
    };

    const link = document.createElement('a');
    const clickSpy = vi.spyOn(link, 'click').mockImplementation(() => {});
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(link);
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => link);
    const removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => link);

    exportAllotmentsToCSV([mockAllotment], () => ({
      ticketId: 'SA-11-001',
      dealValue: 1125000,
      totalPaid: 225000,
      balanceDue: 900000,
    }));

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(appendSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();

    createElementSpy.mockRestore();
    appendSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
