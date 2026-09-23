import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommandPaletteModal } from '@/src/components/admin/dashboard/executive/CommandPaletteModal';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('CommandPaletteModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders spotlight input when open', () => {
    render(<CommandPaletteModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByPlaceholderText(/type a command or search/i)).toBeDefined();
  });

  it('does not render modal when closed', () => {
    render(<CommandPaletteModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByPlaceholderText(/type a command or search/i)).toBeNull();
  });

  it('filters navigation actions on search input', () => {
    render(<CommandPaletteModal isOpen={true} onClose={vi.fn()} />);
    const input = screen.getByPlaceholderText(/type a command or search/i);
    fireEvent.change(input, { target: { value: 'Leads' } });
    expect(screen.getByText('Leads Hub & Telecalling')).toBeDefined();
    expect(screen.queryByText('Workforce & Attendance Hub')).toBeNull();
  });

  it('shows empty state when no commands match query', () => {
    render(<CommandPaletteModal isOpen={true} onClose={vi.fn()} />);
    const input = screen.getByPlaceholderText(/type a command or search/i);
    fireEvent.change(input, { target: { value: 'NonexistentXYZ' } });
    expect(screen.getByText(/No commands or records found for/i)).toBeDefined();
  });

  it('navigates to route on click', () => {
    const handleClose = vi.fn();
    render(<CommandPaletteModal isOpen={true} onClose={handleClose} />);
    const action = screen.getByText('Leads Hub & Telecalling');
    fireEvent.click(action);
    expect(mockPush).toHaveBeenCalledWith('/admin/leads');
    expect(handleClose).toHaveBeenCalled();
  });

  it('navigates with keyboard ArrowDown, ArrowUp, and Enter', () => {
    const handleClose = vi.fn();
    render(<CommandPaletteModal isOpen={true} onClose={handleClose} />);

    // Arrow down from 0 (Leads Hub) to 1 (Workforce)
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    fireEvent.keyDown(window, { key: 'Enter' });

    expect(mockPush).toHaveBeenCalledWith('/admin/workforce');
    expect(handleClose).toHaveBeenCalled();
  });

  it('wraps keyboard navigation backwards with ArrowUp', () => {
    const handleClose = vi.fn();
    render(<CommandPaletteModal isOpen={true} onClose={handleClose} />);

    // Arrow up from 0 wraps to last item (User Access & Permissions -> /admin/dashboard)
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    fireEvent.keyDown(window, { key: 'Enter' });

    expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
    expect(handleClose).toHaveBeenCalled();
  });

  it('closes modal on Escape key', () => {
    const handleClose = vi.fn();
    render(<CommandPaletteModal isOpen={true} onClose={handleClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalled();
  });

  it('toggles/closes modal on Ctrl+K and Cmd+K', () => {
    const handleClose = vi.fn();
    render(<CommandPaletteModal isOpen={true} onClose={handleClose} />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('closes modal on backdrop click', () => {
    const handleClose = vi.fn();
    const { container } = render(<CommandPaletteModal isOpen={true} onClose={handleClose} />);
    const backdrop = container.querySelector('[data-testid="command-palette-backdrop"]');
    expect(backdrop).not.toBeNull();
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(handleClose).toHaveBeenCalled();
    }
  });
});
