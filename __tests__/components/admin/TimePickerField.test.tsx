import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TimePickerField } from '@/src/components/admin/DocumentGenerator/TimePickerField';

describe('TimePickerField Component', () => {
  it('renders input with value and clock button', () => {
    const handleChange = vi.fn();
    render(
      <TimePickerField
        label="Working Hours Start"
        name="workingHoursStart"
        value="10:30 am"
        onChange={handleChange}
        type="start"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('10:30 am');

    const clockBtn = screen.getByLabelText('Open clock picker for Working Hours Start');
    expect(clockBtn).toBeInTheDocument();
  });

  it('opens dropdown when clock icon is clicked and applies preset', () => {
    const handleChange = vi.fn();
    render(
      <TimePickerField
        label="Working Hours Start"
        name="workingHoursStart"
        value="10:30 am"
        onChange={handleChange}
        type="start"
      />
    );

    const clockBtn = screen.getByLabelText('Open clock picker for Working Hours Start');
    fireEvent.click(clockBtn);

    // Dropdown header should appear
    expect(screen.getByText('Clock Dropdown')).toBeInTheDocument();

    // Click a preset button
    const presetBtn = screen.getByText('09:30 am');
    fireEvent.click(presetBtn);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: 'workingHoursStart',
          value: '09:30 am',
        }),
      })
    );
  });

  it('allows selecting custom hour, minute and period', () => {
    const handleChange = vi.fn();
    render(
      <TimePickerField
        label="Working Hours End"
        name="workingHoursEnd"
        value="06:30 pm"
        onChange={handleChange}
        type="end"
      />
    );

    const clockBtn = screen.getByLabelText('Open clock picker for Working Hours End');
    fireEvent.click(clockBtn);

    // Select hour '07'
    const hourBtn = screen.getByRole('button', { name: '07' });
    fireEvent.click(hourBtn);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: 'workingHoursEnd',
          value: '07:30 pm',
        }),
      })
    );
  });
});
