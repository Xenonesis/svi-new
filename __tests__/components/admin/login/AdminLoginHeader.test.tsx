import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminLoginHeader } from '@/src/components/admin/login/AdminLoginHeader';

describe('AdminLoginHeader', () => {
  it('renders admin portal title and restricted access pill', () => {
    render(<AdminLoginHeader />);

    // Check heading
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeDefined();
    expect(heading.textContent).toContain('Admin');
    expect(heading.textContent).toContain('Portal');

    // Check restricted access pill
    expect(screen.getByText('SVI Infra Solutions — Restricted Access')).toBeDefined();
  });
});
