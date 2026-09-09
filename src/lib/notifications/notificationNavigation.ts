export interface NotificationLike {
  id?: string;
  title?: string;
  message?: string;
  type?: string;
  action_url?: string | null;
  metadata?: Record<string, any> | null;
}

/**
 * Resolves the destination URL for a given notification based on:
 * 1. Explicit action_url (with legacy/redirect route normalization)
 * 2. Structured event metadata
 * 3. Text heuristics on title and message
 */
export function resolveNotificationUrl(notification: NotificationLike): string | null {
  // 1. Direct action_url from notification
  if (
    notification.action_url &&
    typeof notification.action_url === 'string' &&
    notification.action_url.trim() !== ''
  ) {
    const trimmed = notification.action_url.trim();

    // Map legacy dashboard URL to registrations
    if (trimmed.startsWith('/admin/dashboard?userId=')) {
      return '/admin/registrations';
    }

    // Map legacy employee URLs to workforce
    if (trimmed.startsWith('/admin/employees')) {
      return trimmed.replace('/admin/employees', '/admin/workforce');
    }

    return trimmed;
  }

  // 2. Structured event in metadata
  const event =
    notification.metadata?.event || notification.metadata?.type || notification.metadata?.subType;

  if (typeof event === 'string') {
    switch (event) {
      case 'chat_lead_created':
        return '/admin/chat-logs';

      case 'settings_updated':
        return '/admin/settings';

      case 'user_registered':
      case 'registration_status_updated':
      case 'registration_deleted':
        return '/admin/registrations';

      case 'new_employee_lead':
      case 'lead_created':
      case 'lead_updated':
      case 'lead_followup_scheduled':
      case 'follow_up_scheduled':
        if (notification.metadata?.employeeId) {
          return `/admin/workforce?employee=${notification.metadata.employeeId}&tab=leads`;
        }
        return '/admin/workforce?tab=directory';

      case 'email_dispatched':
      case 'email_dispatch_failed':
      case 'campaign_created':
      case 'campaign_updated':
      case 'campaign_sent':
      case 'email_sent':
      case 'email_restored':
        return '/admin/email';

      case 'email_deleted':
      case 'email_permanently_deleted':
        return '/admin/email?tab=trash';

      case 'attendance_marked':
        return '/admin/attendance?tab=report';

      case 'team_created':
      case 'member_added_to_team':
      case 'member_removed_from_team':
        return '/admin/attendance?tab=teams';

      case 'document_created':
      case 'document_updated':
      case 'document_deleted': {
        const docType = notification.metadata?.documentType;
        if (docType === 'allotment_letter') return '/admin/allotment-records';
        if (docType === 'offer_letter') return '/admin/offer-letter-records';
        if (docType === 'bba') return '/admin/bba-records';
        if (docType === 'payment_receipt') return '/admin/payment-receipts';
        if (docType === 'payment_plan') return '/admin/payment-plan';
        if (docType === 'quotation') return '/admin/quotation-records';
        return '/admin/allotment-records';
      }

      case 'property_created':
      case 'property_updated':
      case 'property_deleted':
        return '/admin/properties';

      case 'lottery_scheduled':
      case 'lottery_schedule_cancelled':
      case 'lottery_drawn':
        return '/admin/lottery';

      case 'site_visit_created':
      case 'site_visit_updated':
        return '/admin/site-visits';

      case 'career_applied':
      case 'job_application':
        return '/admin/careers';

      case 'ivr_call':
      case 'call_log':
        return '/admin/ivr';

      case 'whatsapp_message':
        return '/admin/whatsapp';
    }
  }

  // 3. Text Heuristics based on Title & Message
  const title = (notification.title || '').toLowerCase();
  const message = (notification.message || '').toLowerCase();

  // Chat / Chatbot Leads
  if (
    title.includes('chat') ||
    message.includes('chatbot') ||
    message.includes('chat lead') ||
    message.includes('ai chatbot')
  ) {
    return '/admin/chat-logs';
  }

  // Employee Leads
  if (
    title.includes('lead') ||
    message.includes('added a new lead') ||
    message.includes('lead for') ||
    message.includes('follow-up')
  ) {
    if (notification.metadata?.employeeId) {
      return `/admin/workforce?employee=${notification.metadata.employeeId}&tab=leads`;
    }
    return '/admin/workforce?tab=directory';
  }

  // Settings
  if (title.includes('setting') || message.includes('settings')) {
    return '/admin/settings';
  }

  // Registrations & Users
  if (
    title.includes('registration') ||
    title.includes('user registered') ||
    message.includes('registered as a new user') ||
    title.includes('user deleted')
  ) {
    return '/admin/registrations';
  }

  // Email & Campaigns
  if (
    title.includes('email') ||
    title.includes('campaign') ||
    message.includes('email') ||
    notification.metadata?.subType === 'email'
  ) {
    if (
      message.includes('recycle bin') ||
      message.includes('trash') ||
      title.includes('permanently deleted')
    ) {
      return '/admin/email?tab=trash';
    }
    return '/admin/email';
  }

  // Attendance & Teams
  if (title.includes('attendance') || message.includes('marked attendance')) {
    return '/admin/attendance?tab=report';
  }
  if (title.includes('team') || message.includes('team')) {
    return '/admin/attendance?tab=teams';
  }

  // Documents
  if (title.includes('allotment') || message.includes('allotment letter')) {
    return '/admin/allotment-records';
  }
  if (title.includes('offer letter') || message.includes('offer letter')) {
    return '/admin/offer-letter-records';
  }
  if (title.includes('bba') || message.includes('bba')) {
    return '/admin/bba-records';
  }
  if (title.includes('payment receipt') || message.includes('payment receipt')) {
    return '/admin/payment-receipts';
  }
  if (title.includes('payment plan') || message.includes('payment plan')) {
    return '/admin/payment-plan';
  }
  if (title.includes('quotation') || message.includes('quotation')) {
    return '/admin/quotation-records';
  }

  // Properties
  if (title.includes('property') || message.includes('property')) {
    return '/admin/properties';
  }

  // Lottery
  if (title.includes('lottery')) {
    return '/admin/lottery';
  }

  // Workforce & Employees
  if (title.includes('employee') || title.includes('workforce')) {
    return '/admin/workforce';
  }

  // Site visits
  if (title.includes('site visit') || message.includes('site visit')) {
    return '/admin/site-visits';
  }

  // Careers & Job applications
  if (title.includes('career') || title.includes('job') || message.includes('application')) {
    return '/admin/careers';
  }

  // IVR & Calls
  if (title.includes('ivr') || title.includes('call')) {
    return '/admin/ivr';
  }

  // WhatsApp
  if (title.includes('whatsapp')) {
    return '/admin/whatsapp';
  }

  // Fallback to notifications list
  return '/admin/notifications';
}
