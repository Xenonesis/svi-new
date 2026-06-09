import { supabaseAdmin } from './admin';

export interface CreateNotificationParams {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  user_id?: string; // Optional - if not provided, it's a global notification for all admins
  action_url?: string;
  metadata?: Record<string, any>;
}

/**
 * Create a notification in the database
 * This can be called from API routes or server actions
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const { title, message, type, user_id, action_url, metadata } = params;

    // Validate type
    const validTypes = ['info', 'success', 'warning', 'error'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid notification type. Must be one of: ${validTypes.join(', ')}`);
    }

    // Insert notification
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert([
        {
          title,
          message,
          type,
          user_id: user_id || null,
          action_url: action_url || null,
          metadata: metadata || {},
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }

    return { success: true, notification: data };
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}

/**
 * Create notifications for all admin users
 */
export async function createNotificationForAllAdmins(
  params: Omit<CreateNotificationParams, 'user_id'>
) {
  try {
    // Get all admin users
    const { data: admins, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'admin');

    if (fetchError) {
      console.error('Error fetching admins:', fetchError);
      throw fetchError;
    }

    if (!admins || admins.length === 0) {
      console.warn('No admin users found');
      return { success: true, count: 0 };
    }

    // Create notification for each admin
    const notifications = admins.map((admin) => ({
      title: params.title,
      message: params.message,
      type: params.type,
      user_id: admin.id,
      action_url: params.action_url || null,
      metadata: params.metadata || {},
    }));

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) {
      console.error('Error creating notifications for admins:', error);
      throw error;
    }

    return { success: true, count: data?.length || 0, notifications: data };
  } catch (error) {
    console.error('Failed to create notifications for admins:', error);
    throw error;
  }
}

/**
 * Helper functions for common notification types
 */
export const NotificationHelper = {
  /**
   * User registered notification
   */
  userRegistered: async (userName: string, userId: string) => {
    return createNotificationForAllAdmins({
      title: 'New User Registered',
      message: `${userName} has registered as a new user.`,
      type: 'info',
      action_url: `/admin/dashboard?userId=${userId}`,
      metadata: { event: 'user_registered', userId },
    });
  },

  /**
   * Email automated dispatch notification
   */
  emailDispatched: async (recipient: string, subject: string, referenceId: string) => {
    let eventName = 'automated notification email';
    if (subject.includes('Registration')) {
      eventName = 'automated registration email';
    } else if (subject.includes('Contact Form')) {
      eventName = 'automated contact form alert';
    } else if (subject.includes('Grievance')) {
      eventName = 'automated grievance alert';
    }

    return createNotificationForAllAdmins({
      title: 'Automated Email Sent',
      message: `System successfully dispatched ${eventName} to ${recipient} (Reference ID: ${referenceId}).`,
      type: 'success',
      action_url: `/admin/email`,
      metadata: { event: 'email_dispatched', recipient, subject, referenceId, subType: 'email' },
    });
  },

  /**
   * Email automated dispatch failure
   */
  emailDispatchFailed: async (recipient: string, error: string, referenceId: string) => {
    let eventName = 'email';
    if (referenceId.startsWith('SVI-')) {
      eventName = 'grievance alert email';
    } else if (referenceId.startsWith('SVI2')) {
      eventName = 'registration copy email';
    } else {
      eventName = 'contact copy email';
    }

    return createNotificationForAllAdmins({
      title: 'Automated Email Failed',
      message: `Failed to deliver automated ${eventName} to ${recipient} (Reference: ${referenceId}). Error: ${error}`,
      type: 'error',
      action_url: `/admin/email`,
      metadata: {
        event: 'email_dispatch_failed',
        recipient,
        error,
        referenceId,
        subType: 'email',
      },
    });
  },

  /**
   * Document created notification
   */
  documentCreated: async (documentType: string, userName: string, userId: string) => {
    const docLabels: Record<string, string> = {
      allotment_letter: 'Allotment Letter',
      payment_receipt: 'Payment Receipt',
      payment_plan: 'Payment Plan',
      offer_letter: 'Offer Letter',
      bba: 'BBA Agreement',
    };

    return createNotificationForAllAdmins({
      title: 'Document Generated',
      message: `${docLabels[documentType] || documentType} generated for ${userName}.`,
      type: 'success',
      action_url: `/admin/${documentType.replace('_', '-')}`,
      metadata: { event: 'document_created', documentType, userId },
    });
  },

  /**
   * User deleted notification
   */
  userDeleted: async (userName: string) => {
    return createNotificationForAllAdmins({
      title: 'User Deleted',
      message: `User account "${userName}" has been deleted.`,
      type: 'warning',
      metadata: { event: 'user_deleted' },
    });
  },

  /**
   * Settings updated notification
   */
  settingsUpdated: async (settingName: string, adminName: string) => {
    return createNotificationForAllAdmins({
      title: 'Settings Updated',
      message: `${adminName} updated ${settingName} settings.`,
      type: 'info',
      metadata: { event: 'settings_updated', settingName },
    });
  },

  /**
   * Error notification
   */
  systemError: async (errorMessage: string) => {
    return createNotificationForAllAdmins({
      title: 'System Error',
      message: errorMessage,
      type: 'error',
      metadata: { event: 'system_error' },
    });
  },

  /**
   * Attendance marked notification
   */
  attendanceMarked: async (
    teamName: string,
    date: string,
    memberCount: number,
    adminName: string
  ) => {
    return createNotificationForAllAdmins({
      title: 'Attendance Marked',
      message: `${adminName} marked attendance for ${memberCount} member(s) in ${teamName} on ${date}.`,
      type: 'success',
      action_url: '/admin/attendance?tab=report',
      metadata: { event: 'attendance_marked', teamName, date },
    });
  },

  /**
   * Team created notification
   */
  teamCreated: async (teamName: string, adminName: string) => {
    return createNotificationForAllAdmins({
      title: 'Team Created',
      message: `${adminName} created a new team: "${teamName}".`,
      type: 'info',
      action_url: '/admin/attendance?tab=teams',
      metadata: { event: 'team_created', teamName },
    });
  },

  /**
   * Document updated/downloaded notification
   */
  documentUpdated: async (documentType: string, adminName: string, documentId: string) => {
    const docLabels: Record<string, string> = {
      allotment_letter: 'Allotment Letter',
      payment_receipt: 'Payment Receipt',
      payment_plan: 'Payment Plan',
      offer_letter: 'Offer Letter',
      bba: 'BBA Agreement',
    };
    return createNotificationForAllAdmins({
      title: 'Document Updated',
      message: `${adminName} updated ${docLabels[documentType] || documentType} (ID: ${documentId.slice(0, 8)}...).`,
      type: 'info',
      action_url: `/admin/documents`,
      metadata: { event: 'document_updated', documentType, documentId },
    });
  },

  /**
   * Document deleted notification
   */
  documentDeleted: async (documentType: string, adminName: string) => {
    const docLabels: Record<string, string> = {
      allotment_letter: 'Allotment Letter',
      payment_receipt: 'Payment Receipt',
      payment_plan: 'Payment Plan',
      offer_letter: 'Offer Letter',
      bba: 'BBA Agreement',
    };
    return createNotificationForAllAdmins({
      title: 'Document Deleted',
      message: `${adminName} deleted ${docLabels[documentType] || documentType}.`,
      type: 'warning',
      action_url: `/admin/documents`,
      metadata: { event: 'document_deleted', documentType },
    });
  },

  /**
   * Property created notification
   */
  propertyCreated: async (propertyName: string, adminName: string) => {
    return createNotificationForAllAdmins({
      title: 'Property Created',
      message: `${adminName} created a new property: "${propertyName}".`,
      type: 'success',
      action_url: `/admin/properties`,
      metadata: { event: 'property_created', propertyName },
    });
  },

  /**
   * Property updated notification
   */
  propertyUpdated: async (propertyName: string, adminName: string) => {
    return createNotificationForAllAdmins({
      title: 'Property Updated',
      message: `${adminName} updated property: "${propertyName}".`,
      type: 'info',
      action_url: `/admin/properties`,
      metadata: { event: 'property_updated', propertyName },
    });
  },

  /**
   * Property deleted notification
   */
  propertyDeleted: async (propertyName: string, adminName: string) => {
    return createNotificationForAllAdmins({
      title: 'Property Deleted',
      message: `${adminName} deleted property: "${propertyName}".`,
      type: 'warning',
      action_url: `/admin/properties`,
      metadata: { event: 'property_deleted', propertyName },
    });
  },

  /**
   * Registration status updated notification
   */
  registrationStatusUpdated: async (
    registrationId: string,
    newStatus: string,
    adminName: string
  ) => {
    return createNotificationForAllAdmins({
      title: 'Registration Status Updated',
      message: `${adminName} changed registration ${registrationId.slice(0, 8)}... status to "${newStatus}".`,
      type: 'info',
      action_url: `/admin/registrations`,
      metadata: { event: 'registration_status_updated', registrationId, newStatus },
    });
  },

  /**
   * Registration deleted notification
   */
  registrationDeleted: async (registrationId: string, adminName: string) => {
    return createNotificationForAllAdmins({
      title: 'Registration Deleted',
      message: `${adminName} deleted registration ${registrationId.slice(0, 8)}....`,
      type: 'warning',
      action_url: `/admin/registrations`,
      metadata: { event: 'registration_deleted', registrationId },
    });
  },

  /**
   * Lottery draw scheduled notification
   */
  lotteryScheduled: async (lotteryTitle: string, scheduledAt: string, adminName: string) => {
    return createNotificationForAllAdmins({
      title: 'Lottery Draw Scheduled',
      message: `${adminName} scheduled draw for "${lotteryTitle}" at ${new Date(scheduledAt).toLocaleString()}.`,
      type: 'info',
      action_url: `/admin/lottery`,
      metadata: { event: 'lottery_scheduled', lotteryTitle, scheduled_at: scheduledAt },
    });
  },

  /**
   * Lottery schedule cancelled notification
   */
  lotteryScheduleCancelled: async (lotteryTitle: string, adminName: string) => {
    return createNotificationForAllAdmins({
      title: 'Lottery Draw Cancelled',
      message: `${adminName} cancelled the scheduled draw for "${lotteryTitle}".`,
      type: 'warning',
      action_url: `/admin/lottery`,
      metadata: { event: 'lottery_schedule_cancelled', lotteryTitle },
    });
  },

  /**
   * Lottery draw executed notification
   */
  lotteryDrawn: async (lotteryTitle: string, winners: string[], adminName: string) => {
    return createNotificationForAllAdmins({
      title: 'Lottery Draw Executed',
      message: `${adminName} executed lottery draw for "${lotteryTitle}". Winner(s): ${winners.join(', ')}.`,
      type: 'success',
      action_url: `/admin/lottery`,
      metadata: { event: 'lottery_drawn', lotteryTitle, winners },
    });
  },

  /**
   * Campaign created notification
   */
  campaignCreated: async (campaignTitle: string, adminName: string) => {
    return createNotificationForAllAdmins({
      title: 'Campaign Created',
      message: `${adminName} created email campaign: "${campaignTitle}".`,
      type: 'info',
      action_url: `/admin/email`,
      metadata: { event: 'campaign_created', campaignTitle },
    });
  },

  /**
   * Campaign updated notification
   */
  campaignUpdated: async (campaignTitle: string, adminName: string) => {
    return createNotificationForAllAdmins({
      title: 'Campaign Updated',
      message: `${adminName} updated email campaign: "${campaignTitle}".`,
      type: 'info',
      action_url: `/admin/email`,
      metadata: { event: 'campaign_updated', campaignTitle },
    });
  },

  /**
   * Campaign deleted notification
   */
  campaignDeleted: async (campaignTitle: string, adminName: string) => {
    return createNotificationForAllAdmins({
      title: 'Campaign Deleted',
      message: `${adminName} deleted email campaign: "${campaignTitle}".`,
      type: 'warning',
      action_url: `/admin/email`,
      metadata: { event: 'campaign_deleted', campaignTitle },
    });
  },

  /**
   * Campaign sent notification
   */
  campaignSent: async (campaignTitle: string, recipientCount: number, adminName: string) => {
    return createNotificationForAllAdmins({
      title: 'Campaign Sent',
      message: `${adminName} sent campaign "${campaignTitle}" to ${recipientCount} recipient(s).`,
      type: 'success',
      action_url: `/admin/email`,
      metadata: { event: 'campaign_sent', campaignTitle, recipientCount },
    });
  },

  /**
   * Member added to team notification
   */
  memberAddedToTeam: async (teamName: string, memberName: string, adminName: string) => {
    return createNotificationForAllAdmins({
      title: 'Member Added to Team',
      message: `${adminName} added "${memberName}" to team "${teamName}".`,
      type: 'info',
      action_url: `/admin/attendance?tab=teams`,
      metadata: { event: 'member_added_to_team', teamName, memberName },
    });
  },

  /**
   * Member removed from team notification
   */
  memberRemovedFromTeam: async (teamName: string, memberName: string, adminName: string) => {
    return createNotificationForAllAdmins({
      title: 'Member Removed from Team',
      message: `${adminName} removed "${memberName}" from team "${teamName}".`,
      type: 'warning',
      action_url: `/admin/attendance?tab=teams`,
      metadata: { event: 'member_removed_from_team', teamName, memberName },
    });
  },

  /**
   * Email sent notification
   */
  emailSent: async (to: string, subject: string, adminName: string) => {
    return createNotificationForAllAdmins({
      title: 'Email Sent',
      message: `${adminName} sent email to "${to}" with subject: "${subject}".`,
      type: 'success',
      action_url: `/admin/email`,
      metadata: { event: 'email_sent', to, subject },
    });
  },

  /**
   * Email moved to recycle bin notification
   */
  emailDeleted: async (count: number, subjects: string[], adminName: string) => {
    const label = count === 1 ? `"${subjects[0]}"` : `${count} emails`;
    return createNotificationForAllAdmins({
      title: 'Emails Moved to Recycle Bin',
      message: `${adminName} moved ${label} to the recycle bin.`,
      type: 'warning',
      action_url: `/admin/email?tab=trash`,
      metadata: {
        event: 'email_deleted',
        count,
        subjects,
      },
    });
  },

  /**
   * Email restored from recycle bin notification
   */
  emailRestored: async (count: number, subjects: string[], adminName: string) => {
    const label = count === 1 ? `"${subjects[0]}"` : `${count} emails`;
    return createNotificationForAllAdmins({
      title: 'Emails Restored',
      message: `${adminName} restored ${label} from the recycle bin.`,
      type: 'info',
      action_url: `/admin/email`,
      metadata: {
        event: 'email_restored',
        count,
        subjects,
      },
    });
  },

  /**
   * Email permanently deleted notification
   */
  emailPermanentlyDeleted: async (count: number, subjects: string[], adminName: string) => {
    const label = count === 1 ? `"${subjects[0]}"` : `${count} emails`;
    return createNotificationForAllAdmins({
      title: 'Emails Permanently Deleted',
      message: `${adminName} permanently deleted ${label}.`,
      type: 'error',
      action_url: `/admin/email?tab=trash`,
      metadata: {
        event: 'email_permanently_deleted',
        count,
        subjects,
      },
    });
  },
};
