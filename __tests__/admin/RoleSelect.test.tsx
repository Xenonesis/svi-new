import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoleSelect } from '@/src/components/admin/helpers/RoleSelect';

describe('RoleSelect', () => {
  it('renders with default client role and label', () => {
    render(<RoleSelect role="client" onRoleChange={vi.fn()} />);

    expect(screen.getByText('Client')).toBeDefined();
    expect(screen.getByText('Standard client / customer')).toBeDefined();
    expect(screen.getByText('Role *')).toBeDefined();
  });

  it('opens popover dropdown and switches role on selection', () => {
    const handleRoleChange = vi.fn();
    render(<RoleSelect role="client" onRoleChange={handleRoleChange} />);

    // Click trigger button
    const trigger = screen.getByRole('button', { name: /client/i });
    fireEvent.click(trigger);

    // Popover is open with "SELECT ROLE" header
    expect(screen.getByText('SELECT ROLE')).toBeDefined();
    expect(screen.getByText('Staff & employee access')).toBeDefined();
    expect(screen.getByText('Full management controls')).toBeDefined();

    // Click "Employee"
    const employeeOption = screen.getByRole('button', { name: /employee/i });
    fireEvent.click(employeeOption);

    expect(handleRoleChange).toHaveBeenCalledWith('employee');
  });

  it('displays active employee state correctly', () => {
    render(<RoleSelect role="employee" onRoleChange={vi.fn()} />);

    expect(screen.getByText('Employee')).toBeDefined();
    expect(screen.getByText('Staff & employee access')).toBeDefined();
  });

  it('displays active admin state correctly', () => {
    render(<RoleSelect role="admin" onRoleChange={vi.fn()} />);

    expect(screen.getByText('Admin')).toBeDefined();
    expect(screen.getByText('Full management controls')).toBeDefined();
  });
});
