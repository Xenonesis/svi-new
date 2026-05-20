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
};
