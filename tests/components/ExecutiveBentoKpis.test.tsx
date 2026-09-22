import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExecutiveBentoKpis } from '@/src/components/admin/dashboard/executive/ExecutiveBentoKpis';
import { ExecutiveBriefingBanner } from '@/src/components/admin/dashboard/executive/ExecutiveBriefingBanner';

describe('ExecutiveBentoKpis', () => {
  const mockKpis = {
    totalCollections: 4860000,
    collectionsGrowthPercent: 14.2,
    collectionsSparkline: [20, 30, 45, 60, 75],
    activeLeads: 142,
    hotLeadsCount: 18,
    leadsSparkline: [10, 15, 20, 25],
    bookedPlots: 86,
    totalPlots: 120,
    plotsSparkline: [60, 70, 80, 86],
    onDutyStaff: 24,
    totalStaff: 28,
    attendanceRate: 86,
  };

  it('renders all 4 executive pillars correctly', () => {
    render(<ExecutiveBentoKpis kpis={mockKpis} isLoading={false} />);
    expect(screen.getByText('Total Collections')).toBeDefined();
    expect(screen.getByText('Active Pipeline')).toBeDefined();
    expect(screen.getByText('Plot Inventory')).toBeDefined();
    expect(screen.getByText('Team On-Duty')).toBeDefined();
    expect(screen.getByText('86 / 120 Units')).toBeDefined();
    expect(screen.getByText('24 / 28 Present')).toBeDefined();
    expect(screen.getByText('₹ 48.60 L')).toBeDefined();
    expect(screen.getByText('+14.2% vs last cycle')).toBeDefined();
    expect(screen.getByText('142 Leads')).toBeDefined();
    expect(screen.getByText('18 hot leads priority')).toBeDefined();
    expect(screen.getByText('72% plots allotted')).toBeDefined();
    expect(screen.getByText('86% daily attendance')).toBeDefined();
  });

  it('renders loading skeletons when isLoading is true', () => {
    const { container } = render(<ExecutiveBentoKpis kpis={mockKpis} isLoading={true} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(4);
    expect(screen.queryByText('Total Collections')).toBeNull();
  });

  it('handles division by zero gracefully when totalPlots is 0', () => {
    const zeroPlotsKpis = {
      ...mockKpis,
      bookedPlots: 0,
      totalPlots: 0,
    };
    render(<ExecutiveBentoKpis kpis={zeroPlotsKpis} isLoading={false} />);
    expect(screen.getByText('0 / 0 Units')).toBeDefined();
    expect(screen.getByText('0% plots allotted')).toBeDefined();
  });
});

describe('ExecutiveBriefingBanner', () => {
  it('renders briefing summary and badges accurately', () => {
    const onOpenCommand = vi.fn();
    const onExportPdf = vi.fn();

    render(
      <ExecutiveBriefingBanner
        collectionsTotal={4860000}
        hotLeadsCount={18}
        onDutyCount={24}
        onOpenCommand={onOpenCommand}
        onExportPdf={onExportPdf}
      />
    );

    expect(screen.getByText(/AI Daily Executive Pulse/i)).toBeDefined();
    expect(screen.getByText(/₹48.6L collected this cycle/i)).toBeDefined();
    expect(screen.getByText(/18 hot leads requiring triage/i)).toBeDefined();
    expect(screen.getByText(/24 team members actively deployed today/i)).toBeDefined();
  });

  it('triggers onOpenCommand when search button is clicked', () => {
    const onOpenCommand = vi.fn();
    const onExportPdf = vi.fn();

    render(
      <ExecutiveBriefingBanner
        collectionsTotal={4860000}
        hotLeadsCount={18}
        onDutyCount={24}
        onOpenCommand={onOpenCommand}
        onExportPdf={onExportPdf}
      />
    );

    const searchBtn = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchBtn);
    expect(onOpenCommand).toHaveBeenCalledTimes(1);
  });

  it('triggers onExportPdf when export dossier button is clicked', () => {
    const onOpenCommand = vi.fn();
    const onExportPdf = vi.fn();

    render(
      <ExecutiveBriefingBanner
        collectionsTotal={4860000}
        hotLeadsCount={18}
        onDutyCount={24}
        onOpenCommand={onOpenCommand}
        onExportPdf={onExportPdf}
      />
    );

    const exportBtn = screen.getByRole('button', { name: /export dossier/i });
    fireEvent.click(exportBtn);
    expect(onExportPdf).toHaveBeenCalledTimes(1);
  });
});
