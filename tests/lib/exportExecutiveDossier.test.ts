import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import {
  generateExecutiveDossierPdf,
  exportExecutiveDossier,
} from '@/src/lib/dashboard/exportExecutiveDossier';
import type { ExecutiveDashboardData } from '@/app/api/admin/dashboard/executive/route';

describe('Executive PDF Dossier Exporter', () => {
  const mockData: ExecutiveDashboardData = {
    kpis: {
      totalCollections: 5000000,
      collectionsGrowthPercent: 12,
      collectionsSparkline: [10, 20, 30],
      activeLeads: 50,
      hotLeadsCount: 10,
      leadsSparkline: [5, 10, 15],
      bookedPlots: 80,
      totalPlots: 100,
      plotsSparkline: [2, 4, 6],
      onDutyStaff: 20,
      totalStaff: 25,
      attendanceRate: 80,
    },
    target: {
      monthlyTarget: 5000000,
      currentCollections: 5000000,
      percentage: 100,
      projectedTotal: 5000000,
      status: 'ahead',
      dailyRunRateNeeded: 0,
    },
    urgentActions: {
      unverifiedReceipts: [
        {
          id: 'rec-1',
          receipt_number: 'REC-001',
          customer_name: 'Rajesh Kumar',
          amount: 50000,
          created_at: '2026-09-20',
        },
      ],
      hotLeadsPending: [
        {
          id: 'lead-1',
          name: 'Amit Sharma',
          phone: '9876543210',
          created_at: '2026-09-21',
          temperature: 'hot',
        },
      ],
      pendingLeaves: [
        {
          id: 'leave-1',
          user_name: 'Priya Singh',
          leave_type: 'Casual',
          start_date: '2026-09-24',
          end_date: '2026-09-25',
        },
      ],
    },
    paymentDues: [
      {
        id: 'due-1',
        customer_name: 'Vikram Mehta',
        plot_number: 'A-102',
        amount_due: 250000,
        due_date: '2026-09-25',
        is_overdue: false,
      },
    ],
    revenueTrend: [
      {
        date: '2026-09-01',
        collections: 1000000,
        target: 1200000,
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('instantiates jsPDF and formats report without throwing', async () => {
    const doc = await generateExecutiveDossierPdf(mockData);
    expect(doc).toBeDefined();
    expect(typeof doc.save).toBe('function');
  });

  it('generates dossier with valid output and single page', async () => {
    const doc = await generateExecutiveDossierPdf(mockData);
    expect(doc).toBeDefined();
    expect(doc.getNumberOfPages()).toBe(1);
    const pdfDataUri = doc.output('datauristring');
    expect(pdfDataUri).toContain('data:application/pdf');
  });

  it('handles zero and empty metrics gracefully', async () => {
    const emptyData: ExecutiveDashboardData = {
      kpis: {
        totalCollections: 0,
        collectionsGrowthPercent: 0,
        collectionsSparkline: [],
        activeLeads: 0,
        hotLeadsCount: 0,
        leadsSparkline: [],
        bookedPlots: 0,
        totalPlots: 0,
        plotsSparkline: [],
        onDutyStaff: 0,
        totalStaff: 0,
        attendanceRate: 0,
      },
      target: {
        monthlyTarget: 0,
        currentCollections: 0,
        percentage: 0,
        projectedTotal: 0,
        status: 'on_track',
        dailyRunRateNeeded: 0,
      },
      urgentActions: {
        unverifiedReceipts: [],
        hotLeadsPending: [],
        pendingLeaves: [],
      },
      paymentDues: [],
      revenueTrend: [],
    };

    const doc = await generateExecutiveDossierPdf(emptyData);
    expect(doc).toBeDefined();
    expect(doc.getNumberOfPages()).toBe(1);
  });

  it('invokes doc.save with expected file name pattern in exportExecutiveDossier', async () => {
    const fsSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});

    await exportExecutiveDossier(mockData);

    const todayStr = new Date().toISOString().split('T')[0];
    const expectedFilename = `SVI_Executive_Dossier_${todayStr}.pdf`;

    expect(fsSpy).toHaveBeenCalledTimes(1);
    expect(fsSpy).toHaveBeenCalledWith(expectedFilename, expect.anything());
  });
});
