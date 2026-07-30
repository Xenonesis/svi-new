import { z } from 'zod';

const recipientInput = z.union([z.string(), z.array(z.string())]).optional();

export const sendEmailSchema = z.object({
  action: z.literal('send'),
  to: recipientInput,
  subject: z.string().min(1),
  html: z.string().optional(),
  text: z.string().optional(),
  from: z.string().optional(),
  replyTo: z.union([z.string(), z.array(z.string())]).optional(),
  cc: recipientInput,
  bcc: recipientInput,
  attachments: z
    .array(
      z.object({
        filename: z.string(),
        content: z.string(),
        size: z.number().optional(),
      })
    )
    .optional(),
  inReplyTo: z.string().optional(),
  scheduledAt: z.string().optional(),
});
export type SendEmailInput = z.infer<typeof sendEmailSchema>;

export const cancelEmailSchema = z.object({
  action: z.literal('cancel'),
  id: z.string().min(1),
});
export type CancelEmailInput = z.infer<typeof cancelEmailSchema>;

export const cancelScheduledEmailSchema = z.object({
  action: z.literal('cancel_scheduled'),
  id: z.string().min(1),
});
export type CancelScheduledEmailInput = z.infer<typeof cancelScheduledEmailSchema>;

export const starEmailSchema = z.object({
  action: z.literal('star'),
  emailId: z.string().min(1),
});
export type StarEmailInput = z.infer<typeof starEmailSchema>;

export const unstarEmailSchema = z.object({
  action: z.literal('unstar'),
  emailId: z.string().min(1),
});
export type UnstarEmailInput = z.infer<typeof unstarEmailSchema>;

export const getStarredEmailSchema = z.object({
  action: z.literal('get_starred'),
});
export type GetStarredEmailInput = z.infer<typeof getStarredEmailSchema>;

export const getDeletedEmailSchema = z.object({
  action: z.literal('get_deleted'),
});
export type GetDeletedEmailInput = z.infer<typeof getDeletedEmailSchema>;

export const getDeletedEmailListSchema = z.object({
  action: z.literal('get_deleted_list'),
});
export type GetDeletedEmailListInput = z.infer<typeof getDeletedEmailListSchema>;

export const deleteEmailsSchema = z.object({
  action: z.literal('delete_emails'),
  emailIds: z.array(z.string()).min(1),
  emails: z.array(z.any()).optional(),
});
export type DeleteEmailsInput = z.infer<typeof deleteEmailsSchema>;

export const restoreEmailsSchema = z.object({
  action: z.literal('restore_emails'),
  emailIds: z.array(z.string()).min(1),
});
export type RestoreEmailsInput = z.infer<typeof restoreEmailsSchema>;

export const permanentlyDeleteSchema = z.object({
  action: z.literal('permanently_delete'),
  emailIds: z.array(z.string()).optional(),
  all: z.boolean().optional(),
});
export type PermanentlyDeleteInput = z.infer<typeof permanentlyDeleteSchema>;

/** Discriminated union of all POST actions. Use as the input schema for action dispatchers. */
export const adminEmailPostActionSchema = z.discriminatedUnion('action', [
  sendEmailSchema,
  cancelEmailSchema,
  cancelScheduledEmailSchema,
  starEmailSchema,
  unstarEmailSchema,
  getStarredEmailSchema,
  getDeletedEmailSchema,
  getDeletedEmailListSchema,
  deleteEmailsSchema,
  restoreEmailsSchema,
  permanentlyDeleteSchema,
]);
export type AdminEmailPostAction = z.infer<typeof adminEmailPostActionSchema>;
