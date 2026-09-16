import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { DashboardHeader } from '@/src/components/admin/dashboard/DashboardHeader';

describe('DashboardHeader', () => {
  it('renders dashboard heading and description', () => {
    render(<DashboardHeader />);
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
    expect(screen.getByText(/System/i)).toBeDefined();
    expect(screen.getByText('Dashboard')).toBeDefined();
    expect(
      screen.getByText(
        'Manage authorized user accounts and monitor administrative access permissions.'
      )
    ).toBeDefined();
  });
});
