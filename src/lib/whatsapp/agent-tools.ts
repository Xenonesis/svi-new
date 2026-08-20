import 'server-only';

import { tool } from 'ai';
import { z } from 'zod';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { createNotificationForAllAdmins } from '@/src/lib/supabase/notifications';

export interface AgentToolContext {
  conversationId: string;
  contactId: string;
  phoneE164: string;
  contactName?: string | null;
  leadId?: string | null;
}

interface ProjectRow {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  type: string | null;
  description: string | null;
  price: number | null;
}

function publicProject(project: ProjectRow) {
  return {
    id: project.id,
    name: project.name,
    ...(project.location ? { location: project.location } : {}),
    ...(project.type ? { type: project.type } : {}),
    ...(project.description ? { description: project.description } : {}),
    ...(project.price !== null
      ? {
          listedProjectPrice: project.price,
          priceNote: 'Project-level listed price; final rate requires human confirmation.',
        }
      : {}),
  };
}

async function activeProjects(): Promise<ProjectRow[]> {
  const { data, error } = await supabaseAdmin
    .from('properties')
    .select('id, name, slug, location, type, description, price')
    .eq('active', true)
    .limit(50);
  if (error) throw new Error('Approved project data is temporarily unavailable');
  return (data ?? []) as ProjectRow[];
}

export function createWhatsAppAgentTools(context: AgentToolContext) {
  return {
    searchProjects: tool({
      description:
        'Find up to three active SVI projects matching a location, project type, or customer phrase.',
      inputSchema: z.object({ query: z.string().trim().min(1).max(120) }),
      execute: async ({ query }) => {
        const terms = query.toLocaleLowerCase('en-IN').split(/\s+/).filter(Boolean);
        const ranked = (await activeProjects())
          .map((project) => {
            const haystack = [project.name, project.location, project.type, project.description]
              .filter(Boolean)
              .join(' ')
              .toLocaleLowerCase('en-IN');
            return {
              project,
              score: terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0),
            };
          })
          .filter((item) => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((item) => publicProject(item.project));
        return {
          projects: ranked,
          availabilityNote:
            'These are active projects, not proof that any unit or plot is available.',
        };
      },
    }),

    getProjectDetails: tool({
      description:
        'Get approved project-level details for one active project. Never use this as unit availability.',
      inputSchema: z.object({ projectId: z.string().uuid() }),
      execute: async ({ projectId }) => {
        const project = (await activeProjects()).find((item) => item.id === projectId);
        return project
          ? {
              project: publicProject(project),
              availabilityNote: 'Confirm unit or plot availability with a salesperson.',
            }
          : { project: null, reason: 'No active approved project matched that ID.' };
      },
    }),

    getCompanyInformation: tool({
      description:
        'Return only admin-verified SVI company facts. Missing facts must be escalated, never guessed.',
      inputSchema: z.object({
        fields: z
          .array(
            z.enum([
              'company_name',
              'phone',
              'email',
              'office_address',
              'gst',
              'rera',
              'privacy_url',
            ])
          )
          .min(1)
          .max(7),
      }),
      execute: async ({ fields }) => {
        const { data, error } = await supabaseAdmin
          .from('whatsapp_company_settings')
          .select('key, value')
          .in('key', fields)
          .eq('is_verified', true);
        if (error) throw new Error('Verified company information is temporarily unavailable');
        return { verified: Object.fromEntries((data ?? []).map((row) => [row.key, row.value])) };
      },
    }),

    updateLead: tool({
      description:
        'Create or update the lead after collecting only customer-provided qualification facts.',
      inputSchema: z.object({
        name: z.string().trim().min(1).max(120).optional(),
        email: z.string().email().max(254).optional(),
        budget: z.string().trim().max(100).optional(),
        timeline: z.string().trim().max(100).optional(),
        location: z.string().trim().max(120).optional(),
        propertyType: z.string().trim().max(120).optional(),
        summary: z.string().trim().max(1000).optional(),
        temperature: z.enum(['cold', 'warm', 'hot']).optional(),
      }),
      execute: async (input) => {
        const score =
          [input.email, input.budget, input.timeline, input.location, input.propertyType].filter(
            Boolean
          ).length *
            15 +
          25;
        const { data, error } = await supabaseAdmin
          .from('chat_leads')
          .upsert(
            {
              normalized_phone: context.phoneE164,
              phone: context.phoneE164,
              name: input.name ?? context.contactName ?? 'WhatsApp lead',
              email: input.email ?? null,
              budget: input.budget ?? null,
              timeline: input.timeline ?? null,
              location: input.location ?? null,
              property_type: input.propertyType ?? null,
              source: 'whatsapp_ai',
              score: Math.min(score, 100),
              lifecycle_status: score >= 55 ? 'qualified' : 'new',
              qualification_status: score >= 55 ? 'qualified' : 'qualifying',
              temperature: input.temperature ?? (score >= 55 ? 'warm' : 'cold'),
              summary: input.summary ?? null,
            },
            { onConflict: 'normalized_phone' }
          )
          .select('id')
          .single();
        if (error || !data) throw new Error('Lead update failed');
        await supabaseAdmin
          .from('whatsapp_conversations')
          .update({ lead_id: data.id })
          .eq('id', context.conversationId);
        return { saved: true, leadId: data.id };
      },
    }),

    requestSiteVisit: tool({
      description:
        'Record a site-visit request for an active project. The request is never a confirmed appointment.',
      inputSchema: z.object({
        projectId: z.string().uuid(),
        requestedDate: z.string().date().optional(),
        requestedTime: z
          .string()
          .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
          .optional(),
        customerTimezone: z.string().trim().min(1).max(80).default('Asia/Kolkata'),
        notes: z.string().trim().max(1000).optional(),
      }),
      execute: async (input) => {
        const project = (await activeProjects()).find((item) => item.id === input.projectId);
        if (!project) return { requested: false, reason: 'Project is not active or approved.' };

        const { data: lead, error: leadError } = await supabaseAdmin
          .from('chat_leads')
          .upsert(
            {
              normalized_phone: context.phoneE164,
              phone: context.phoneE164,
              name: context.contactName ?? 'WhatsApp lead',
              source: 'whatsapp_site_visit',
              project_interest: project.name,
              preferred_date: input.requestedDate ?? null,
              lifecycle_status: 'visit_requested',
            },
            { onConflict: 'normalized_phone' }
          )
          .select('id')
          .single();
        if (leadError || !lead) throw new Error('Could not create the site-visit lead');

        const { data: visit, error: visitError } = await supabaseAdmin
          .from('whatsapp_site_visit_requests')
          .insert({
            conversation_id: context.conversationId,
            contact_id: context.contactId,
            lead_id: lead.id,
            project_id: project.id,
            requested_date: input.requestedDate ?? null,
            requested_time: input.requestedTime ?? null,
            customer_timezone: input.customerTimezone,
            notes: input.notes ?? null,
            status: 'requested',
          })
          .select('id')
          .single();
        if (visitError || !visit) throw new Error('Could not save the site-visit request');

        await supabaseAdmin
          .from('whatsapp_conversations')
          .update({ lead_id: lead.id, project_id: project.id })
          .eq('id', context.conversationId);
        await createNotificationForAllAdmins({
          title: 'WhatsApp site-visit request',
          message: `${context.contactName ?? 'A WhatsApp lead'} requested a visit for ${project.name}. Confirmation is required.`,
          type: 'info',
          action_url: '/admin/whatsapp',
          metadata: { event: 'whatsapp_site_visit_requested', visitId: visit.id },
        });
        return {
          requested: true,
          requestId: visit.id,
          status: 'requested',
          customerMessage:
            'A salesperson must confirm the date and time before the visit is booked.',
        };
      },
    }),

    scheduleFollowUp: tool({
      description:
        'Schedule one approved-template follow-up. Automation must be globally enabled and the contact opted in.',
      inputSchema: z.object({
        templateId: z.string().uuid(),
        delayHours: z.number().int().min(1).max(336),
      }),
      execute: async ({ templateId, delayHours }) => {
        if (process.env.AUTONOMOUS_OUTBOUND_ENABLED !== 'true') {
          return { scheduled: false, reason: 'Autonomous outbound is disabled.' };
        }
        const [{ data: contact }, { data: template }, { data: existing, count }] =
          await Promise.all([
            supabaseAdmin
              .from('whatsapp_contacts')
              .select('consent_status')
              .eq('id', context.contactId)
              .single(),
            supabaseAdmin
              .from('whatsapp_templates')
              .select('id, active, provider_status')
              .eq('id', templateId)
              .eq('active', true)
              .eq('provider_status', 'approved')
              .single(),
            supabaseAdmin
              .from('whatsapp_follow_ups')
              .select('sequence_number', { count: 'exact' })
              .eq('conversation_id', context.conversationId)
              .order('sequence_number', { ascending: false })
              .limit(1),
          ]);
        if (contact?.consent_status !== 'opted_in')
          return { scheduled: false, reason: 'Recorded opt-in is required.' };
        if (!template) return { scheduled: false, reason: 'Template is not active and approved.' };
        if ((count ?? 0) >= 2) return { scheduled: false, reason: 'Two-follow-up cap reached.' };

        const sequenceNumber = Number(existing?.[0]?.sequence_number ?? 0) + 1;
        const scheduledFor = new Date(Date.now() + delayHours * 60 * 60 * 1000).toISOString();
        const { error } = await supabaseAdmin.from('whatsapp_follow_ups').insert({
          conversation_id: context.conversationId,
          template_id: templateId,
          sequence_number: sequenceNumber,
          scheduled_for: scheduledFor,
          dedupe_key: `followup:${context.conversationId}:${sequenceNumber}`,
        });
        if (error) throw new Error('Could not schedule the follow-up');
        return { scheduled: true, sequenceNumber, scheduledFor };
      },
    }),

    handoffToSales: tool({
      description:
        'Pause AI replies and notify staff when the customer requests a person or needs human confirmation.',
      inputSchema: z.object({ reason: z.string().trim().min(1).max(500) }),
      execute: async ({ reason }) => {
        const { error } = await supabaseAdmin
          .from('whatsapp_conversations')
          .update({ mode: 'human', summary: reason })
          .eq('id', context.conversationId);
        if (error) throw new Error('Could not hand off the conversation');
        await createNotificationForAllAdmins({
          title: 'WhatsApp handoff requested',
          message: `${context.contactName ?? 'A WhatsApp customer'} needs a salesperson: ${reason}`,
          type: 'warning',
          action_url: '/admin/whatsapp',
          metadata: { event: 'whatsapp_handoff', conversationId: context.conversationId },
        });
        return { handedOff: true };
      },
    }),
  };
}
