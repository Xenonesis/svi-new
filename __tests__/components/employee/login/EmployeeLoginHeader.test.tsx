import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { EmployeeLoginHeader } from '@/src/components/employee/login/EmployeeLoginHeader';

describe('EmployeeLoginHeader', () => {
  it('renders "Back to Website" link with correct href', () => {
    render(<EmployeeLoginHeader onOpenHelp={vi.fn()} />);

    const link = screen.getByRole('link', { name: /back to website/i });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('/');
  });

  it('renders "Support & Access" button and calls onOpenHelp when clicked', () => {
    const handleOpenHelp = vi.fn();
    render(<EmployeeLoginHeader onOpenHelp={handleOpenHelp} />);

    const button = screen.getByRole('button', { name: /support & access/i });
    expect(button).toBeDefined();

    fireEvent.click(button);
    expect(handleOpenHelp).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenHelpModal when clicked if onOpenHelpModal is provided', () => {
    const handleOpenHelpModal = vi.fn();
    render(<EmployeeLoginHeader onOpenHelpModal={handleOpenHelpModal} />);

    const button = screen.getByRole('button', { name: /support & access/i });
    fireEvent.click(button);
    expect(handleOpenHelpModal).toHaveBeenCalledTimes(1);
  });
});
