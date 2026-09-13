import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoleSwitcher } from '@/src/components/admin/helpers/RoleSwitcher';
import { Badge } from '@/src/components/admin/helpers/Badge';

describe('RoleSwitcher & Badge', () => {
  it('renders Badge with correct label for each role', () => {
    const { rerender } = render(<Badge role="client" />);
    expect(screen.getByText('Client')).toBeDefined();

    rerender(<Badge role="employee" />);
    expect(screen.getByText('Employee')).toBeDefined();

    rerender(<Badge role="admin" />);
    expect(screen.getByText('Admin')).toBeDefined();
  });

  it('renders RoleSwitcher with Client, Employee, and Admin options in dropdown', () => {
    const onRoleChange = vi.fn();
    render(<RoleSwitcher role="client" onRoleChange={onRoleChange} />);

    // Initially closed, only badge is visible
    expect(screen.getByText('Client')).toBeDefined();

    // Click to open dropdown
    const trigger = screen.getByTitle('Click to change role');
    fireEvent.click(trigger);

    // Dropdown items
    expect(screen.getByText('Select Role')).toBeDefined();
    expect(screen.getAllByText('Client').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Employee')).toBeDefined();
    expect(screen.getByText('Admin')).toBeDefined();

    // Select Employee
    const employeeOption = screen.getByText('Employee').closest('button');
    expect(employeeOption).toBeDefined();
    fireEvent.click(employeeOption!);

    expect(onRoleChange).toHaveBeenCalledWith('employee');
  });
});
