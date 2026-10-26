import { supabaseAdmin } from '@/src/lib/supabase/admin';

export interface RecipientValidationResult {
  valid: string[];
  blocked: Array<{
    email: string;
    reason: string;
    type: 'bounced' | 'complained' | 'invalid_domain' | 'syntax_error';
  }>;
}

// Known dead or internal placeholder domains without active public MX records
const DEAD_DOMAINS: Record<string, true> = {
  'sviinfra.com': true, // Placeholder domain without MX records; official domain is sviiinfrasolutions.com
  'example.com': true,
  'test.com': true,
  'fake.com': true,
  'invalid.com': true,
};

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Validates candidate recipient emails against syntax, known dead domains,
 * and historical bounce/complaint suppression in Supabase email_messages.
 */
export async function validateEmailDeliverability(
  emails: string[]
): Promise<RecipientValidationResult> {
  const valid: string[] = [];
  const blocked: RecipientValidationResult['blocked'] = [];
  const candidateEmails: string[] = [];

  for (const raw of emails) {
    const email = raw.trim().toLowerCase();
    if (!email) continue;

    // 1. Basic syntax check
    if (!EMAIL_REGEX.test(email)) {
      blocked.push({
        email,
        reason: 'Invalid email address syntax',
        type: 'syntax_error',
      });
      continue;
    }

    // 2. Dead / non-MX domain check
    const domain = email.split('@')[1];
    if (DEAD_DOMAINS[domain]) {
      blocked.push({
        email,
        reason: `Domain @${domain} has no active mail server (MX) records. Use @sviiinfrasolutions.com or verified personal address.`,
        type: 'invalid_domain',
      });
      continue;
    }

    candidateEmails.push(email);
  }

  if (candidateEmails.length === 0) {
    return { valid, blocked };
  }

  // 3. Historical bounce & complaint suppression check
  try {
    const { data: bounceRows } = await supabaseAdmin
      .from('email_messages')
      .select('to_emails, status, last_event')
      .in('status', ['bounced', 'complained']);

    const suppressedSet = new Set<string>();
    if (bounceRows) {
      for (const row of bounceRows) {
        if (Array.isArray(row.to_emails)) {
          for (const addr of row.to_emails) {
            suppressedSet.add(String(addr).trim().toLowerCase());
          }
        }
      }
    }

    for (const email of candidateEmails) {
      if (suppressedSet.has(email)) {
        blocked.push({
          email,
          reason:
            'Recipient previously bounced or filed a complaint. Automatically suppressed to protect domain reputation.',
          type: 'bounced',
        });
      } else {
        valid.push(email);
      }
    }
  } catch (err) {
    console.warn(
      '[DELIVERABILITY-SHIELD] Failed to query suppression registry, allowing unblocked candidates:',
      err
    );
    valid.push(...candidateEmails);
  }

  return { valid, blocked };
}
