import { describe, it, expect } from 'vitest';
import {
  normalizePhoneNumber,
  formatTelLink,
  formatWhatsAppLink,
} from '@/src/components/employee/work/LeadsView';
import {
  calculateDistanceMeters,
  formatDistance,
} from '@/src/components/employee/work/SiteVisitsView';

describe('Site Visit & Lead Action Helpers', () => {
  describe('Phone Number Normalization', () => {
    it('should format clean WhatsApp direct link without spaces or special characters', () => {
      const rawPhone = '+91 98765-43210';
      const cleanPhone = normalizePhoneNumber(rawPhone);
      const waLink = formatWhatsAppLink(
        rawPhone,
        'Hello, I am contacting you from SVI Infra regarding your property inquiry.'
      );

      expect(cleanPhone).toBe('919876543210');
      expect(waLink).toContain('https://wa.me/919876543210');
      expect(waLink).toContain(
        `text=${encodeURIComponent('Hello, I am contacting you from SVI Infra regarding your property inquiry.')}`
      );
    });

    it('should normalize phone numbers by stripping all non-digits', () => {
      expect(normalizePhoneNumber('+91 (141) 234-5678')).toBe('911412345678');
      expect(normalizePhoneNumber('9876543210')).toBe('9876543210');
      expect(normalizePhoneNumber('')).toBe('');
    });

    it('should format telephone direct dial URI preserving leading plus for country code', () => {
      const rawPhone = '+91 98765 43210';
      expect(formatTelLink(rawPhone)).toBe('tel:+919876543210');
      expect(formatTelLink('98765-43210')).toBe('tel:9876543210');
      expect(formatTelLink('+1 (555) 234-5678')).toBe('tel:+15552345678');
    });

    it('should use default SVI greeting message in WhatsApp link when custom message is omitted', () => {
      const waLink = formatWhatsAppLink('+91 9876543210');
      expect(waLink).toBe(
        `https://wa.me/919876543210?text=${encodeURIComponent('Hello, I am contacting you from SVI Infra regarding your property inquiry.')}`
      );
    });

    it('should properly encode special characters in custom WhatsApp message', () => {
      const customMessage = 'Hi! Visiting Plot #42 & Villa? Price: ₹75,00,000 / 100% verified.';
      const waLink = formatWhatsAppLink('+91 9876543210', customMessage);
      expect(waLink).toContain(`text=${encodeURIComponent(customMessage)}`);
      expect(waLink).not.toContain(' ');
      expect(waLink).not.toContain('#');
      expect(waLink).not.toContain('₹');
    });
  });

  describe('Distance Calculation Helper', () => {
    it('should return 0 meters for identical coordinates', () => {
      const lat = 26.9124;
      const lon = 75.7873;
      expect(calculateDistanceMeters(lat, lon, lat, lon)).toBe(0);
    });

    it('should accurately calculate distance in meters between known locations in Jaipur', () => {
      // Statue Circle (26.9056, 75.8038) to Albert Hall Museum (26.9116, 75.8195)
      // Distance is ~1.7 km (~1680-1700 meters)
      const statueCircle = { lat: 26.9056, lon: 75.8038 };
      const albertHall = { lat: 26.9116, lon: 75.8195 };

      const distance = calculateDistanceMeters(
        statueCircle.lat,
        statueCircle.lon,
        albertHall.lat,
        albertHall.lon
      );

      expect(distance).toBeGreaterThan(1600);
      expect(distance).toBeLessThan(1800);
    });

    it('should calculate distance correctly between far points (Jaipur to Delhi)', () => {
      // Jaipur (26.9124, 75.7873) to New Delhi (28.6139, 77.2090)
      // Distance is ~235-245 km
      const distance = calculateDistanceMeters(26.9124, 75.7873, 28.6139, 77.209);
      expect(distance).toBeGreaterThan(230000);
      expect(distance).toBeLessThan(250000);
    });

    it('should format distance into readable meters or kilometers', () => {
      expect(formatDistance(45)).toBe('45m');
      expect(formatDistance(450)).toBe('450m');
      expect(formatDistance(999)).toBe('999m');
      expect(formatDistance(1000)).toBe('1.0km');
      expect(formatDistance(1500)).toBe('1.5km');
      expect(formatDistance(245600)).toBe('245.6km');
    });
  });
});
