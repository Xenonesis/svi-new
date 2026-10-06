import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MobileConversionDock } from '@/src/components/layout/MobileConversionDock';

vi.mock('next/navigation', () => ({
  usePathname: () => '/projects/shivani-vatika-11th',
}));

describe('MobileConversionDock', () => {
  it('renders 3 core action buttons', () => {
    render(<MobileConversionDock />);
    expect(screen.getByRole('link', { name: /call advisor/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /whatsapp brochure/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /free cab visit/i })).toBeInTheDocument();
  });

  it('provides correct telephone deep link', () => {
    render(<MobileConversionDock />);
    const callLink = screen.getByRole('link', { name: /call advisor/i });
    expect(callLink).toHaveAttribute('href', 'tel:+919218300589');
  });

  it('provides WhatsApp deep link with contextual project message', () => {
    render(<MobileConversionDock />);
    const waLink = screen.getByRole('link', { name: /whatsapp brochure/i });
    expect(waLink.getAttribute('href')).toContain('wa.me/919218300589');
    expect(waLink.getAttribute('href')).toContain('Shivani%20Vatika%2011th');
  });

  it('opens SiteVisitModal when Free Cab Visit is clicked', () => {
    render(<MobileConversionDock />);
    const cabBtn = screen.getByRole('button', { name: /free cab visit/i });
    fireEvent.click(cabBtn);
    expect(screen.getByText(/schedule free site visit/i)).toBeInTheDocument();
  });
});
