import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ContactSchema } from '@/src/components/contact/ContactSchema';
import { ContactInfoSection } from '@/src/components/contact/ContactInfoSection';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = {
      'info.address.title': 'Corporate Office',
      'info.address.line1': 'Block E-220, 2nd Floor',
      'info.address.line2': 'Sector 63, Noida, UP 201309',
      'info.phone.title': 'Call Us',
      'info.email.title': 'Email Us',
      'info.hours.title': 'Working Hours',
      'info.hours.weekdays': 'Mon - Fri: 9:00 AM - 7:00 PM',
      'info.hours.saturday': 'Saturday: 9:00 AM - 5:00 PM',
      'info.hours.sunday': 'Sunday: 10:00 AM - 4:00 PM',
      'info.hours.open': 'Office Open Now',
      'info.hours.closed': 'Closed Now',
    };
    return messages[key] || key;
  },
}));

describe('Contact Components', () => {
  it('renders RealEstateAgent JSON-LD schema', () => {
    const { container } = render(<ContactSchema />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const data = JSON.parse(script!.textContent || '{}');
    expect(data['@type']).toBe('RealEstateAgent');
    expect(data.telephone).toBe('+91-73000-07643');
  });

  it('renders Corporate Office address and phone cards', () => {
    render(<ContactInfoSection />);
    expect(screen.getByText('Corporate Office')).toBeDefined();
    expect(screen.getByText('Call Us')).toBeDefined();
    expect(screen.getByText('+91-73000-07643')).toBeDefined();
  });
});
