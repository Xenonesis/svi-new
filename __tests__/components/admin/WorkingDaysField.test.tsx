import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WorkingDaysField } from '@/src/components/admin/DocumentGenerator/WorkingDaysField';

describe('WorkingDaysField Component', () => {
  it('renders input with default value and calendar button', () => {
    const handleChange = vi.fn();
    render(
      <WorkingDaysField
        label="Working Days"
        name="workingDays"
        value="Wednesday to Monday"
        onChange={handleChange}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('Wednesday to Monday');

    const btn = screen.getByLabelText('Open working days dropdown for Working Days');
    expect(btn).toBeInTheDocument();
  });

  it('opens dropdown and allows selecting preset option', () => {
    const handleChange = vi.fn();
    render(
      <WorkingDaysField
        label="Working Days"
        name="workingDays"
        value="Wednesday to Monday"
        onChange={handleChange}
      />
    );

    const btn = screen.getByLabelText('Open working days dropdown for Working Days');
    fireEvent.click(btn);

    expect(screen.getByText('Working Days Options')).toBeInTheDocument();

    const option = screen.getByText('Monday to Saturday (Sunday Off - 6 Days)');
    fireEvent.click(option);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: 'workingDays',
          value: 'Monday to Saturday',
        }),
      })
    );
  });
});
