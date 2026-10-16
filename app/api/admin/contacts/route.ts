import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { verifyEmployee } from '@/src/lib/supabase/verifyEmployee';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import type { Contact } from '@/src/components/admin/email/types';

const VALID_ROLES = ['admin', 'employee', 'client'] as const;
type DbRole = (typeof VALID_ROLES)[number];

function isDbRole(value: string | null): value is DbRole {
  return value !== null && VALID_ROLES.includes(value as DbRole);
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  real_email: string | null;
  role: string | null;
}

/**
 * GET /api/admin/contacts
 *
 * Returns all profiles that have a verified real_email.
 * Only accessible by authenticated admins.
 * Optional ?search= query param for server-side filtering.
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    const employee = !admin ? await verifyEmployee(request) : null;
    const user = admin || employee?.user;
    if (!user) throw AppError.unauthorized();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();

    // Fetch in parallel: profiles, lottery winners, allotments, registrations, hot leads
    const [profilesRes, winnersRes, allotmentsRes, registrationsRes, hotLeadsRes] =
      await Promise.all([
        supabaseAdmin
          .from('profiles')
          .select('id, full_name, email, real_email, role')
          .order('full_name'),
        supabaseAdmin
          .from('lottery_participants')
          .select('id, name, email, phone, ticket_number, is_winner')
          .eq('is_winner', true)
          .not('email', 'is', null)
          .neq('email', ''),
        supabaseAdmin
          .from('allotments')
          .select(
            'id, unit_no, allotted_date, client_email, client_name, client_phone, metadata, properties(title)'
          )
          .not('client_email', 'is', null)
          .neq('client_email', ''),
        supabaseAdmin
          .from('registrations')
          .select(
            'id, full_name, email, phone, submission_id, scheme_amount, plot_preference, advisor_name, project'
          )
          .not('email', 'is', null)
          .neq('email', ''),
        supabaseAdmin
          .from('chat_leads')
          .select('id, full_name, customer_phone, metadata, temperature')
          .eq('temperature', 'hot'),
      ]);

    if (profilesRes.error) {
      console.error('[CONTACTS] Profiles query error:', profilesRes.error);
      throw AppError.internal('Failed to fetch contacts');
    }

    const contactsMap = new Map<string, Contact>();

    // Helper to insert or merge
    const recordContact = (
      email: string,
      fullName: string,
      role: 'admin' | 'employee' | 'client',
      segment?: 'lucky_draw_winners' | 'allotment_done' | 'token_holders' | 'hot_calling_leads',
      meta?: {
        plot_no?: string;
        allotted_date?: string;
        total_cost?: number;
        pending_amount?: number;
        advisor_name?: string;
        ticket_id?: string;
        projectName?: string;
        temperature?: 'hot' | 'warm' | 'cold';
      },
      phone?: string | null,
      id?: string
    ) => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) return;

      const existing = contactsMap.get(cleanEmail);
      if (existing) {
        if (segment && !existing.segments?.includes(segment)) {
          existing.segments = [...(existing.segments || []), segment];
        }
        if (meta) {
          existing.metadata = { ...existing.metadata, ...meta };
        }
        if (phone && !existing.phone) {
          existing.phone = phone;
        }
        if (fullName && (!existing.full_name || existing.full_name === 'Unnamed Contact')) {
          existing.full_name = fullName;
        }
      } else {
        contactsMap.set(cleanEmail, {
          id: id || `contact-${cleanEmail}`,
          full_name: fullName.trim() || 'Unnamed Contact',
          email: cleanEmail,
          real_email: cleanEmail,
          role,
          segments: segment ? [segment] : [],
          phone: phone || null,
          metadata: meta || undefined,
        });
      }
    };

    // 1. Process profiles
    (profilesRes.data || []).forEach((row: ProfileRow) => {
      const primaryEmail = (row.real_email || row.email || '').trim();
      if (primaryEmail) {
        recordContact(
          primaryEmail,
          row.full_name || '',
          isDbRole(row.role) ? row.role : 'client',
          undefined,
          undefined,
          null,
          row.id
        );
      }
    });

    // 2. Process Lucky Draw Winners
    interface WinnerRow {
      id: string;
      name: string | null;
      email: string | null;
      phone: string | null;
      ticket_number: string | null;
    }
    ((winnersRes.data as unknown as WinnerRow[] | null) || []).forEach((w) => {
      if (w.email) {
        recordContact(
          w.email,
          w.name || 'Lucky Draw Winner',
          'client',
          'lucky_draw_winners',
          {
            ticket_id: w.ticket_number || undefined,
          },
          w.phone
        );
      }
    });

    // 3. Process Allotments
    interface AllotmentRow {
      id: string;
      unit_no: string | null;
      allotted_date: string | null;
      client_email: string | null;
      client_name: string | null;
      client_phone: string | null;
      metadata: Record<string, unknown> | null;
      properties: { title: string | null } | null;
    }
    ((allotmentsRes.data as unknown as AllotmentRow[] | null) || []).forEach((a) => {
      if (a.client_email) {
        const metaObj = a.metadata && typeof a.metadata === 'object' ? a.metadata : {};
        recordContact(
          a.client_email,
          a.client_name || 'Allottee Client',
          'client',
          'allotment_done',
          {
            plot_no:
              a.unit_no || (typeof metaObj.unit_no === 'string' ? metaObj.unit_no : undefined),
            allotted_date:
              a.allotted_date ||
              (typeof metaObj.allotted_date === 'string' ? metaObj.allotted_date : undefined),
            total_cost: metaObj.total_cost ? Number(metaObj.total_cost) : undefined,
            advisor_name:
              typeof metaObj.advisor_name === 'string' ? metaObj.advisor_name : undefined,
            projectName: a.properties?.title || 'Shivani Vatika',
          },
          a.client_phone,
          a.id
        );
      }
    });

    // 4. Process Registrations (Token Holders)
    interface RegistrationRow {
      id: string;
      full_name: string | null;
      email: string | null;
      phone: string | null;
      submission_id: string | null;
      scheme_amount: number | string | null;
      plot_preference: string | null;
      advisor_name: string | null;
      project: string | null;
    }
    ((registrationsRes.data as unknown as RegistrationRow[] | null) || []).forEach((r) => {
      if (r.email) {
        const isTokenHolder =
          (r.scheme_amount && Number(r.scheme_amount) > 0) || Boolean(r.submission_id);
        recordContact(
          r.email,
          r.full_name || 'Registered Client',
          'client',
          isTokenHolder ? 'token_holders' : undefined,
          {
            plot_no: r.plot_preference || undefined,
            total_cost: r.scheme_amount ? Number(r.scheme_amount) : undefined,
            advisor_name: r.advisor_name || undefined,
            projectName: r.project || undefined,
          },
          r.phone,
          r.id
        );
      }
    });

    // 5. Process Hot Telecalling Leads (Extract email from metadata if available)
    interface LeadRow {
      id: string;
      full_name: string | null;
      customer_phone: string | null;
      metadata: Record<string, unknown> | null;
      temperature: string | null;
    }
    ((hotLeadsRes.data as unknown as LeadRow[] | null) || []).forEach((lead) => {
      const leadMeta = lead.metadata && typeof lead.metadata === 'object' ? lead.metadata : {};
      const leadEmail =
        typeof leadMeta.email === 'string'
          ? leadMeta.email
          : typeof leadMeta.customer_email === 'string'
            ? leadMeta.customer_email
            : null;
      if (leadEmail && leadEmail.includes('@')) {
        recordContact(
          leadEmail,
          lead.full_name || 'Hot Lead',
          'client',
          'hot_calling_leads',
          {
            temperature: 'hot',
            advisor_name:
              typeof leadMeta.assigned_agent_name === 'string'
                ? leadMeta.assigned_agent_name
                : undefined,
          },
          lead.customer_phone,
          lead.id
        );
      }
    });

    let contacts = Array.from(contactsMap.values());

    if (search) {
      const q = search.toLowerCase();
      contacts = contacts.filter(
        (c) =>
          c.full_name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.phone && c.phone.toLowerCase().includes(q)) ||
          (c.metadata?.plot_no && c.metadata.plot_no.toLowerCase().includes(q))
      );
    }

    // Sort alphabetically by full_name
    contacts.sort((a, b) => a.full_name.localeCompare(b.full_name));

    return NextResponse.json({ contacts });
  } catch (err) {
    return handleApiError(err);
  }
}
