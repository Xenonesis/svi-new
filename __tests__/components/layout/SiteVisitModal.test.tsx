import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SiteVisitModal } from '@/src/components/layout/SiteVisitModal';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

describe('SiteVisitModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<SiteVisitModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders form fields when isOpen is true', () => {
    render(
      <SiteVisitModal
        isOpen={true}
        onClose={vi.fn()}
        prefilledProject="Shivani Vatika 11th"
        prefilledPlot="32"
      />
    );
    expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/10-digit mobile number/i)).toBeInTheDocument();
    expect(screen.getByText(/Plot #32/i)).toBeInTheDocument();
  });

  it('validates 10-digit Indian phone number', async () => {
    render(<SiteVisitModal isOpen={true} onClose={vi.fn()} />);
    const nameInput = screen.getByPlaceholderText(/full name/i);
    const phoneInput = screen.getByPlaceholderText(/10-digit mobile number/i);
    const submitBtn = screen.getByRole('button', { name: /confirm free cab booking/i });

    fireEvent.change(nameInput, { target: { value: 'Ramesh Sharma' } });
    fireEvent.change(phoneInput, { target: { value: '12345' } });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/please enter a valid 10-digit indian mobile number/i)
    ).toBeInTheDocument();
  });

  it('successfully submits valid booking', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, id: 'mock-lead-123' }),
    });
    global.fetch = fetchMock;

    render(
      <SiteVisitModal isOpen={true} onClose={vi.fn()} prefilledProject="Shivani Vatika 11th" />
    );
    fireEvent.change(screen.getByPlaceholderText(/full name/i), {
      target: { value: 'Ramesh Sharma' },
    });
    fireEvent.change(screen.getByPlaceholderText(/10-digit mobile number/i), {
      target: { value: '9876543210' },
    });
    fireEvent.click(screen.getByRole('button', { name: /confirm free cab booking/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/site-visit',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('9876543210'),
        })
      );
    });

    expect(await screen.findByText(/booking confirmed/i)).toBeInTheDocument();
  });
});
