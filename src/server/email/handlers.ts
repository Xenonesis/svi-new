/**
 * Barrel of all action handlers, used by the POST dispatcher.
 * Each handler preserves the original response shape so the route file
 * and UI clients see no change.
 */
import type { AdminActor } from '@/src/server/http/auth';
import { sendEmail } from './actions/send';
import { cancelEmail } from './actions/cancel';
import { cancelScheduledEmail } from './actions/cancelScheduled';
import { starEmail, unstarEmail, getStarredEmailIds } from './actions/star';
import {
  deleteEmails,
  getDeletedEmailIds,
  getDeletedEmailList,
  permanentlyDeleteEmails,
  restoreEmails,
} from './actions/lifecycle';
import type {
  AdminEmailPostAction,
  CancelEmailInput,
  CancelScheduledEmailInput,
  DeleteEmailsInput,
  GetStarredEmailInput,
  GetDeletedEmailInput,
  GetDeletedEmailListInput,
  PermanentlyDeleteInput,
  RestoreEmailsInput,
  SendEmailInput,
  StarEmailInput,
  UnstarEmailInput,
} from './schemas';

type Ctx = { actor: AdminActor; request: Request };

export const postHandlers = {
  send: (ctx: Ctx, body: SendEmailInput) => sendEmail(ctx, body),
  cancel: (ctx: Ctx, body: CancelEmailInput) => cancelEmail(ctx, { id: body.id }),
  cancel_scheduled: (ctx: Ctx, body: CancelScheduledEmailInput) =>
    cancelScheduledEmail(ctx, { id: body.id }),
  star: (ctx: Ctx, body: StarEmailInput) => starEmail(ctx, { emailId: body.emailId }),
  unstar: (ctx: Ctx, body: UnstarEmailInput) => unstarEmail(ctx, { emailId: body.emailId }),
  get_starred: (ctx: Ctx, _body: GetStarredEmailInput) => getStarredEmailIds(ctx),
  get_deleted: (ctx: Ctx, _body: GetDeletedEmailInput) => getDeletedEmailIds(ctx),
  get_deleted_list: (ctx: Ctx, _body: GetDeletedEmailListInput) => getDeletedEmailList(ctx),
  delete_emails: (ctx: Ctx, body: DeleteEmailsInput) =>
    deleteEmails(ctx, { emailIds: body.emailIds, emails: body.emails }),
  restore_emails: (ctx: Ctx, body: RestoreEmailsInput) =>
    restoreEmails(ctx, { emailIds: body.emailIds }),
  permanently_delete: (ctx: Ctx, body: PermanentlyDeleteInput) =>
    permanentlyDeleteEmails(ctx, { emailIds: body.emailIds, all: body.all }),
} as const;

export type PostActionHandler = keyof typeof postHandlers;
export type AdminEmailBody = AdminEmailPostAction;
