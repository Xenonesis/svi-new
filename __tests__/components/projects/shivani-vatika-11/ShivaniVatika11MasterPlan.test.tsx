import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ShivaniVatika11MasterPlan } from '@/src/components/projects/shivani-vatika-11/ShivaniVatika11MasterPlan';
import type { PlotData } from '@/src/data/shivaniVatika11Plots';

const mockPlots: PlotData[] = [
  {
    plotNo: '1',
    block: 'Residential',
    sizeSqYd: 100,
    dimensions: "25' x 36'",
    facing: 'East',
    roadWidth: '30 Ft Internal',
    status: 'AVAILABLE',
    priceEstimate: 750000,
  },
  {
    plotNo: 'A-15',
    block: 'A-Block',
    sizeSqYd: 80,
    dimensions: "20' x 36'",
    facing: 'West',
    roadWidth: '30 Ft Internal',
    status: 'BOOKED',
    priceEstimate: 600000,
  },
  {
    plotNo: 'Shop-4',
    block: 'Commercial',
    sizeSqYd: 120,
    dimensions: "20' x 54'",
    facing: 'Highway',
    roadWidth: '160 Ft Highway',
    status: 'RESERVED',
    priceEstimate: 900000,
  },
];

vi.mock('@/src/lib/hooks/useLivePlotStatus', () => ({
  useLivePlotStatus: () => ({
    plots: mockPlots,
    loading: false,
    bookedCount: 1,
    availableCount: 1,
    reservedCount: 1,
  }),
}));

describe('ShivaniVatika11MasterPlan', () => {
  it('renders section header, view toggle buttons, and live KPI metrics', () => {
    render(<ShivaniVatika11MasterPlan />);

    // Header
    expect(
      screen.getByText(/interactive master plan & live plot availability/i)
    ).toBeInTheDocument();

    // View toggles
    expect(screen.getByRole('button', { name: /blueprint view/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /plot grid matrix/i })).toBeInTheDocument();

    // KPI Metrics
    expect(screen.getByText(/total units/i)).toBeInTheDocument();
    expect(screen.getAllByText(/available/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/booked/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/reserved/i)[0]).toBeInTheDocument();
  });

  it('renders Hindi labels when isHindi is true', () => {
    render(<ShivaniVatika11MasterPlan isHindi={true} />);

    expect(
      screen.getByText(/इंटरएक्टिव मास्टर प्लान एवं लाइव प्लॉट उपलब्धता/i)
    ).toBeInTheDocument();
  });

  it('toggles between blueprint view and plot grid matrix', () => {
    render(<ShivaniVatika11MasterPlan />);

    // Initially Blueprint view is active (or has blueprint image/elements)
    const gridBtn = screen.getByRole('button', { name: /plot grid matrix/i });
    fireEvent.click(gridBtn);

    // Grid search bar should now be visible
    expect(screen.getByPlaceholderText(/search plot #/i)).toBeInTheDocument();

    // Switch back to Blueprint view
    const blueprintBtn = screen.getByRole('button', { name: /blueprint view/i });
    fireEvent.click(blueprintBtn);

    // Download Blueprint button should be visible in blueprint view
    expect(screen.getByRole('link', { name: /download.*blueprint/i })).toBeInTheDocument();
  });

  it('filters plots in Grid view by search input', () => {
    render(<ShivaniVatika11MasterPlan />);
    const gridBtn = screen.getByRole('button', { name: /plot grid matrix/i });
    fireEvent.click(gridBtn);

    const searchInput = screen.getByPlaceholderText(/search plot #/i);

    // Search for A-15
    fireEvent.change(searchInput, { target: { value: 'A-15' } });
    expect(screen.getByText('A-15')).toBeInTheDocument();
    expect(screen.queryByText('Shop-4')).not.toBeInTheDocument();

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('Shop-4')).toBeInTheDocument();
  });

  it('filters plots in Grid view by block filter', () => {
    render(<ShivaniVatika11MasterPlan />);
    const gridBtn = screen.getByRole('button', { name: /plot grid matrix/i });
    fireEvent.click(gridBtn);

    // Click Commercial block filter
    const commBtn = screen.getByRole('button', { name: /^commercial$/i });
    fireEvent.click(commBtn);

    expect(screen.getByText('Shop-4')).toBeInTheDocument();
    expect(screen.queryByText('A-15')).not.toBeInTheDocument();
  });

  it('filters plots in Grid view by status filter', () => {
    render(<ShivaniVatika11MasterPlan />);
    const gridBtn = screen.getByRole('button', { name: /plot grid matrix/i });
    fireEvent.click(gridBtn);

    // Click Booked status filter
    const bookedFilters = screen.getAllByRole('button', { name: /^booked$/i });
    fireEvent.click(bookedFilters[0]);

    expect(screen.getByText('A-15')).toBeInTheDocument();
    expect(screen.queryByText('Shop-4')).not.toBeInTheDocument();
  });

  it('shows empty state when no plots match filters', () => {
    render(<ShivaniVatika11MasterPlan />);
    const gridBtn = screen.getByRole('button', { name: /plot grid matrix/i });
    fireEvent.click(gridBtn);

    const searchInput = screen.getByPlaceholderText(/search plot #/i);
    fireEvent.change(searchInput, { target: { value: 'NonExistentPlot999' } });

    expect(screen.getByText(/no plots found/i)).toBeInTheDocument();
  });

  it('opens PlotDetailDrawer when a plot card is clicked in Grid view', () => {
    render(<ShivaniVatika11MasterPlan />);
    const gridBtn = screen.getByRole('button', { name: /plot grid matrix/i });
    fireEvent.click(gridBtn);

    // Click Plot #1 card
    const plotCard = screen.getByRole('button', { name: /plot #1/i });
    fireEvent.click(plotCard);

    // Drawer should open with plot details
    expect(screen.getByRole('dialog', { name: /plot #1/i })).toBeInTheDocument();

    // Close drawer
    const closeBtn = screen.getByRole('button', { name: /close drawer/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog', { name: /plot #1/i })).not.toBeInTheDocument();
  });

  it('opens SiteVisitModal with correct plot number without duplicate prefix', () => {
    render(<ShivaniVatika11MasterPlan />);
    const gridBtn = screen.getByRole('button', { name: /plot grid matrix/i });
    fireEvent.click(gridBtn);

    // Click Plot #1 card to open drawer
    const plotCard = screen.getByRole('button', { name: /plot #1/i });
    fireEvent.click(plotCard);

    // Click "Visit This Plot in Free Cab" inside drawer
    const bookBtn = screen.getByRole('button', { name: /visit this plot in free cab/i });
    fireEvent.click(bookBtn);

    // Site visit modal should open and display "Plot #1" (in modal as well as card), never "Plot #Plot #1"
    expect(screen.getAllByText('Plot #1').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/selected plot:/i)).toBeInTheDocument();
    expect(screen.queryByText(/Plot #Plot #/)).not.toBeInTheDocument();
  });

  it('resets selected block when switching to grid view without block filter', () => {
    render(<ShivaniVatika11MasterPlan />);

    // In Blueprint view, click "Explore in Grid" on the Commercial sector card
    const exploreButtons = screen.getAllByRole('button', { name: /explore in grid/i });
    // First sector is Commercial in SECTORS array
    fireEvent.click(exploreButtons[0]);

    // Now in Grid view with Commercial selected
    expect(screen.getByText('Shop-4')).toBeInTheDocument();
    expect(screen.queryByText('A-15')).not.toBeInTheDocument();

    // Switch back to Blueprint view
    const blueprintBtn = screen.getByRole('button', { name: /blueprint view/i });
    fireEvent.click(blueprintBtn);

    // Click "View all 230 plots in Grid" which calls onSwitchToGrid() without argument
    const viewAllBtn = screen.getByRole('button', { name: /view all 230 plots in grid/i });
    fireEvent.click(viewAllBtn);

    // Grid view should now show all plots because block was reset to 'All'
    expect(screen.getByText('Shop-4')).toBeInTheDocument();
    expect(screen.getByText('A-15')).toBeInTheDocument();
  });
});
