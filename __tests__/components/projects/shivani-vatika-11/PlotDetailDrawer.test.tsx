import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlotDetailDrawer } from '@/src/components/projects/shivani-vatika-11/PlotDetailDrawer';
import { PlotCard } from '@/src/components/projects/shivani-vatika-11/PlotCard';
import type { PlotData } from '@/src/data/shivaniVatika11Plots';

const mockPlotResidential: PlotData = {
  plotNo: '45',
  block: 'Residential',
  sizeSqYd: 100,
  dimensions: "25' x 36'",
  facing: 'Park Facing',
  roadWidth: '30 Ft Internal',
  status: 'AVAILABLE',
  priceEstimate: 750000,
};

const mockPlotABlock: PlotData = {
  plotNo: 'A-15',
  block: 'A-Block',
  sizeSqYd: 80,
  dimensions: "20' x 36'",
  facing: 'East',
  roadWidth: '40 Ft Main',
  status: 'RESERVED',
  priceEstimate: 600000,
};

const mockPlotCommercial: PlotData = {
  plotNo: 'Shop-4',
  block: 'Commercial',
  sizeSqYd: 120,
  dimensions: "30' x 36'",
  facing: 'Highway',
  roadWidth: '160 Ft Highway',
  status: 'BOOKED',
  priceEstimate: 1800000,
};

describe('PlotDetailDrawer', () => {
  it('renders nothing when plot is null', () => {
    const { container } = render(
      <PlotDetailDrawer plot={null} onClose={vi.fn()} onBookSiteVisit={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders plot details when plot is passed', () => {
    render(
      <PlotDetailDrawer plot={mockPlotResidential} onClose={vi.fn()} onBookSiteVisit={vi.fn()} />
    );
    expect(screen.getByText(/Plot #45/i)).toBeInTheDocument();
    expect(screen.getByText(/Residential/i)).toBeInTheDocument();
    expect(screen.getByText(/100 Sq. Yds./i)).toBeInTheDocument();
    expect(screen.getByText(/900 Sq. Ft./i)).toBeInTheDocument();
    expect(screen.getByText(/25' x 36'/i)).toBeInTheDocument();
    expect(screen.getByText(/30 Ft Internal/i)).toBeInTheDocument();
    expect(screen.getByText(/Park Facing/i)).toBeInTheDocument();
  });

  it('renders pricing estimate with formatted currency and booking token', () => {
    render(
      <PlotDetailDrawer plot={mockPlotResidential} onClose={vi.fn()} onBookSiteVisit={vi.fn()} />
    );
    const expectedFormattedPrice = `₹${mockPlotResidential.priceEstimate.toLocaleString('en-IN')}`;
    expect(screen.getByText(new RegExp(expectedFormattedPrice, 'i'))).toBeInTheDocument();
    expect(screen.getAllByText(/₹21,000/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/milestone/i).length).toBeGreaterThanOrEqual(1);
  });

  it('provides WhatsApp reservation link with exact pre-filled message', () => {
    render(
      <PlotDetailDrawer plot={mockPlotResidential} onClose={vi.fn()} onBookSiteVisit={vi.fn()} />
    );
    const waLink = screen.getByRole('link', { name: /reserve on whatsapp/i });
    expect(waLink).toBeInTheDocument();
    const href = waLink.getAttribute('href') || '';
    expect(href).toContain('wa.me/919218300589');
    expect(href).toContain('Plot%20%2345');
    expect(href).toContain('100%20Sq.Yds');
    expect(href).toContain('Shivani%20Vatika%2011th');
    expect(href).toContain('Please%20share%20allotment%20process');
    expect(waLink).toHaveAttribute('target', '_blank');
  });

  it('triggers onBookSiteVisit when Free Cab visit button is clicked', () => {
    const onBookVisitMock = vi.fn();
    render(
      <PlotDetailDrawer
        plot={mockPlotResidential}
        onClose={vi.fn()}
        onBookSiteVisit={onBookVisitMock}
      />
    );
    const visitBtn = screen.getByRole('button', { name: /visit this plot/i });
    fireEvent.click(visitBtn);
    expect(onBookVisitMock).toHaveBeenCalledTimes(1);
    expect(onBookVisitMock).toHaveBeenCalledWith(mockPlotResidential);
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = vi.fn();
    render(
      <PlotDetailDrawer
        plot={mockPlotResidential}
        onClose={onCloseMock}
        onBookSiteVisit={vi.fn()}
      />
    );
    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop overlay is clicked', () => {
    const onCloseMock = vi.fn();
    render(
      <PlotDetailDrawer
        plot={mockPlotResidential}
        onClose={onCloseMock}
        onBookSiteVisit={vi.fn()}
      />
    );
    const backdrop = screen.getByTestId('drawer-backdrop');
    fireEvent.click(backdrop);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const onCloseMock = vi.fn();
    render(
      <PlotDetailDrawer
        plot={mockPlotResidential}
        onClose={onCloseMock}
        onBookSiteVisit={vi.fn()}
      />
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('renders non-residential plot headers correctly', () => {
    const { rerender } = render(
      <PlotDetailDrawer plot={mockPlotABlock} onClose={vi.fn()} onBookSiteVisit={vi.fn()} />
    );
    expect(screen.getByText('A-15')).toBeInTheDocument();
    expect(screen.getByText(/A-Block/i)).toBeInTheDocument();

    rerender(
      <PlotDetailDrawer plot={mockPlotCommercial} onClose={vi.fn()} onBookSiteVisit={vi.fn()} />
    );
    expect(screen.getByText('Shop-4')).toBeInTheDocument();
    expect(screen.getByText(/Commercial/i)).toBeInTheDocument();
  });

  it('renders status badges with proper styles in drawer', () => {
    const { rerender } = render(
      <PlotDetailDrawer plot={mockPlotResidential} onClose={vi.fn()} onBookSiteVisit={vi.fn()} />
    );
    const availableBadge = screen.getByTestId('plot-status-badge');
    expect(availableBadge).toHaveClass('text-emerald-400');

    rerender(
      <PlotDetailDrawer plot={mockPlotCommercial} onClose={vi.fn()} onBookSiteVisit={vi.fn()} />
    );
    const bookedBadge = screen.getByTestId('plot-status-badge');
    expect(bookedBadge).toHaveClass('text-rose-400');

    rerender(
      <PlotDetailDrawer plot={mockPlotABlock} onClose={vi.fn()} onBookSiteVisit={vi.fn()} />
    );
    const reservedBadge = screen.getByTestId('plot-status-badge');
    expect(reservedBadge).toHaveClass('text-amber-400');
  });
});

describe('PlotCard', () => {
  it('renders residential plot card with Plot # prefix and block', () => {
    render(<PlotCard plot={mockPlotResidential} onSelect={vi.fn()} />);
    expect(screen.getByText(/Plot #45/i)).toBeInTheDocument();
    expect(screen.getByText(/Residential/i)).toBeInTheDocument();
    expect(screen.getByText(/100 Sq\.Yd\./i)).toBeInTheDocument();
    expect(screen.getByText(/100 Gaj/i)).toBeInTheDocument();
    expect(screen.getByText(/Park Facing/i)).toBeInTheDocument();
  });

  it('renders A-Block and Commercial plots without duplicate Plot # prefix', () => {
    const { rerender } = render(<PlotCard plot={mockPlotABlock} onSelect={vi.fn()} />);
    expect(screen.getByText('A-15')).toBeInTheDocument();
    expect(screen.getByText(/A-Block/i)).toBeInTheDocument();

    rerender(<PlotCard plot={mockPlotCommercial} onSelect={vi.fn()} />);
    expect(screen.getByText('Shop-4')).toBeInTheDocument();
    expect(screen.getByText(/Commercial/i)).toBeInTheDocument();
  });

  it('renders correct status badge styling on PlotCard', () => {
    const { rerender } = render(<PlotCard plot={mockPlotResidential} onSelect={vi.fn()} />);
    const availableBadge = screen.getByTestId('plot-card-status-badge');
    expect(availableBadge).toHaveClass('text-emerald-400');

    rerender(<PlotCard plot={mockPlotCommercial} onSelect={vi.fn()} />);
    const bookedBadge = screen.getByTestId('plot-card-status-badge');
    expect(bookedBadge).toHaveClass('text-rose-400');

    rerender(<PlotCard plot={mockPlotABlock} onSelect={vi.fn()} />);
    const reservedBadge = screen.getByTestId('plot-card-status-badge');
    expect(reservedBadge).toHaveClass('text-amber-400');
  });

  it('calls onSelect when card is clicked', () => {
    const onSelectMock = vi.fn();
    render(<PlotCard plot={mockPlotResidential} onSelect={onSelectMock} />);
    const card = screen.getByRole('button', { name: /Plot #45/i });
    fireEvent.click(card);
    expect(onSelectMock).toHaveBeenCalledTimes(1);
    expect(onSelectMock).toHaveBeenCalledWith(mockPlotResidential);
  });
});
