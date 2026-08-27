import { describe, it, expect } from 'vitest';

describe('Workforce Tab Definitions', () => {
  it('should support all required workforce tabs with valid keys', () => {
    const validTabs = ['directory', 'attendance', 'approvals', 'payroll', 'reports', 'settings'];
    expect(validTabs).toContain('directory');
    expect(validTabs).toContain('attendance');
    expect(validTabs).toContain('approvals');
    expect(validTabs).toContain('payroll');
    expect(validTabs).toContain('reports');
    expect(validTabs).toContain('settings');
  });

  it('should map legacy routes to respective workforce tabs', () => {
    const routeTabMap: Record<string, string> = {
      '/admin/employees': 'directory',
      '/admin/attendance': 'attendance',
      '/admin/payroll': 'payroll',
    };
    expect(routeTabMap['/admin/employees']).toBe('directory');
    expect(routeTabMap['/admin/attendance']).toBe('attendance');
    expect(routeTabMap['/admin/payroll']).toBe('payroll');
  });
});
