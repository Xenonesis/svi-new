-- Migration: Permanent Sent Email Archival
-- Enhances public.email_messages with body content, recipient arrays, and attachments

ALTER TABLE public.email_messages
  ADD COLUMN IF NOT EXISTS html_content TEXT,
  ADD COLUMN IF NOT EXISTS text_content TEXT,
  ADD COLUMN IF NOT EXISTS cc_emails TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS bcc_emails TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Fast index for ordering sent emails by date
CREATE INDEX IF NOT EXISTS idx_email_messages_created_at_desc ON public.email_messages(created_at DESC);

-- Fast substring search on subjects and recipients
CREATE INDEX IF NOT EXISTS idx_email_messages_subject_lower ON public.email_messages(LOWER(subject));
CREATE INDEX IF NOT EXISTS idx_email_messages_from_email_lower ON public.email_messages(LOWER(from_email));

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
