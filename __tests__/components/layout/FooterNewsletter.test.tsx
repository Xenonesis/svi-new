import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FooterNewsletter } from '@/src/components/layout/FooterNewsletter';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('FooterNewsletter', () => {
  it('renders email input and subscribe button', () => {
    render(<FooterNewsletter />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('submits valid email and displays confirmation', () => {
    render(<FooterNewsletter />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('done')).toBeInTheDocument();
  });
});
