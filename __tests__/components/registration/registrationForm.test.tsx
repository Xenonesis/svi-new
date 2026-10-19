import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, renderHook, act, waitFor } from '@testing-library/react';
import { saveFormDraft } from '@/src/lib/form-persistence';
import { FormSelect } from '@/src/components/registration/FormElements';
import { useRegistrationForm } from '@/src/hooks/useRegistrationForm';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const mockT = (key: string) => key;

describe('FormSelect component', () => {
  it('renders exact string values for options without converting them to slug', () => {
    const options = ['Direct / SVI Official', 'Ajeet Kumar', 'Sanjay Sharma'];
    const handleChange = vi.fn();

    render(
      <FormSelect
        name="advisorName"
        label="Advisor Name"
        value=""
        options={options}
        errors={{}}
        onChange={handleChange}
        placeholder="Select advisor"
      />
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select).toBeDefined();

    const optionElements = Array.from(select.querySelectorAll('option'));
    expect(optionElements).toHaveLength(4); // placeholder + 3 options
    expect(optionElements[1].value).toBe('Direct / SVI Official');
    expect(optionElements[1].textContent).toBe('Direct / SVI Official');
    expect(optionElements[2].value).toBe('Ajeet Kumar');
    expect(optionElements[2].textContent).toBe('Ajeet Kumar');
  });

  it('selects option correctly when value matches advisor name', () => {
    const options = ['Direct / SVI Official', 'Ajeet Kumar', 'Sanjay Sharma'];
    const handleChange = vi.fn();

    render(
      <FormSelect
        name="advisorName"
        label="Advisor Name"
        value="Ajeet Kumar"
        options={options}
        errors={{}}
        onChange={handleChange}
        placeholder="Select advisor"
      />
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('Ajeet Kumar');
  });
});

describe('useRegistrationForm hook advisor handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === '/api/registration') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              advisors: ['Direct / SVI Official', 'Ajeet Kumar', 'Sanjay Sharma'],
            }),
        });
      }
      if (url === '/api/properties') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ properties: [] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  it('preserves casing of advisorName when user selects an advisor', () => {
    const { result } = renderHook(() => useRegistrationForm(mockT));

    act(() => {
      result.current.handleChange({
        target: { name: 'advisorName', value: 'Ajeet Kumar' },
      } as React.ChangeEvent<HTMLSelectElement>);
    });

    expect(result.current.formData.advisorName).toBe('Ajeet Kumar');
  });

  it('preserves casing of state when user selects a state', () => {
    const { result } = renderHook(() => useRegistrationForm(mockT));

    act(() => {
      result.current.handleChange({
        target: { name: 'state', value: 'Rajasthan' },
      } as React.ChangeEvent<HTMLSelectElement>);
    });

    expect(result.current.formData.state).toBe('Rajasthan');
  });

  it('uppercases text inputs like firstName and panNumber', () => {
    const { result } = renderHook(() => useRegistrationForm(mockT));

    act(() => {
      result.current.handleChange({
        target: { name: 'firstName', value: 'rahul' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleChange({
        target: { name: 'panNumber', value: 'abcde1234f' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.firstName).toBe('RAHUL');
    expect(result.current.formData.panNumber).toBe('ABCDE1234F');
  });

  it('normalizes legacy slug or differing-case advisorName from draft', async () => {
    saveFormDraft({ advisorName: 'ajeet-kumar' });
    const { result } = renderHook(() => useRegistrationForm(mockT));

    await waitFor(() => {
      expect(result.current.formData.advisorName).toBe('Ajeet Kumar');
    });
  });
});
