import { describe, it, expect } from 'vitest';
import { resolveNotificationUrl } from '@/src/lib/notifications/notificationNavigation';

describe('resolveNotificationUrl', () => {
  describe('Direct action_url mapping', () => {
    it('returns direct action_url when present', () => {
      expect(
        resolveNotificationUrl({
          action_url: '/admin/chat-logs',
        })
      ).toBe('/admin/chat-logs');
    });

    it('normalizes legacy /admin/dashboard?userId=... to /admin/registrations', () => {
      expect(
        resolveNotificationUrl({
          action_url: '/admin/dashboard?userId=usr_123',
        })
      ).toBe('/admin/registrations');
    });

    it('normalizes legacy /admin/employees to /admin/workforce', () => {
      expect(
        resolveNotificationUrl({
          action_url: '/admin/employees?employee=emp_456&tab=leads',
        })
      ).toBe('/admin/workforce?employee=emp_456&tab=leads');
    });
  });

  describe('User screenshot examples (exact titles and messages)', () => {
    it('resolves item 1: "New Chat Lead"', () => {
      expect(
        resolveNotificationUrl({
          title: 'New Chat Lead',
          message: 'Ramkesh (+918058764307) shared their contact info via the AI chatbot.',
        })
      ).toBe('/admin/chat-logs');
    });

    it('resolves item 2: "Settings Updated"', () => {
      expect(
        resolveNotificationUrl({
          title: 'Settings Updated',
          message: 'System Administrator updated active advisors settings.',
        })
      ).toBe('/admin/settings');
    });

    it('resolves item 3: "New User Registered"', () => {
      expect(
        resolveNotificationUrl({
          title: 'New User Registered',
          message: 'Kajal Vishu has registered as a new user.',
        })
      ).toBe('/admin/registrations');
    });

    it('resolves item 4: "📌 New Lead: Rohan Sharma E2E_9044"', () => {
      expect(
        resolveNotificationUrl({
          title: '📌 New Lead: Rohan Sharma E2E_9044 (System Ad...',
          message:
            'Employee System Administrator added a new lead for SVI Royal Enclave. Phone: 9876501234',
        })
      ).toBe('/admin/workforce?tab=directory');
    });

    it('resolves item 4 with metadata employeeId to deep-linked leads tab', () => {
      expect(
        resolveNotificationUrl({
          title: '📌 New Lead: Rohan Sharma',
          message: 'Employee System Administrator added a new lead for SVI Royal Enclave.',
          metadata: { employeeId: 'emp_9044' },
        })
      ).toBe('/admin/workforce?employee=emp_9044&tab=leads');
    });
  });

  describe('Metadata events mapping', () => {
    it('maps email events to /admin/email', () => {
      expect(
        resolveNotificationUrl({
          title: 'Automated Email Sent',
          metadata: { event: 'email_dispatched' },
        })
      ).toBe('/admin/email');
    });

    it('maps deleted emails to /admin/email?tab=trash', () => {
      expect(
        resolveNotificationUrl({
          title: 'Emails Moved to Recycle Bin',
          metadata: { event: 'email_deleted' },
        })
      ).toBe('/admin/email?tab=trash');
    });

    it('maps attendance and teams to /admin/attendance', () => {
      expect(
        resolveNotificationUrl({
          metadata: { event: 'attendance_marked' },
        })
      ).toBe('/admin/attendance?tab=report');

      expect(
        resolveNotificationUrl({
          metadata: { event: 'team_created' },
        })
      ).toBe('/admin/attendance?tab=teams');
    });

    it('maps document types correctly', () => {
      expect(
        resolveNotificationUrl({
          metadata: { event: 'document_created', documentType: 'allotment_letter' },
        })
      ).toBe('/admin/allotment-records');

      expect(
        resolveNotificationUrl({
          metadata: { event: 'document_created', documentType: 'offer_letter' },
        })
      ).toBe('/admin/offer-letter-records');

      expect(
        resolveNotificationUrl({
          metadata: { event: 'document_created', documentType: 'bba' },
        })
      ).toBe('/admin/bba-records');
    });

    it('maps properties, lottery, site visits', () => {
      expect(
        resolveNotificationUrl({
          metadata: { event: 'property_created' },
        })
      ).toBe('/admin/properties');

      expect(
        resolveNotificationUrl({
          metadata: { event: 'lottery_scheduled' },
        })
      ).toBe('/admin/lottery');

      expect(
        resolveNotificationUrl({
          metadata: { event: 'site_visit_created' },
        })
      ).toBe('/admin/site-visits');
    });
  });

  describe('Fallback behavior', () => {
    it('falls back to /admin/notifications for unrecognized notification', () => {
      expect(
        resolveNotificationUrl({
          title: 'Unknown Title',
          message: 'Some generic unknown message',
        })
      ).toBe('/admin/notifications');
    });
  });
});
