import { supabaseAdmin } from '@/src/lib/supabase/admin';

export interface ProjectData {
  name: string;
  location: string;
  type: string;
  description?: string;
  slug: string;
}

export interface ChatContext {
  projects: ProjectData[];
  faqs: { question: string; answer: string }[];
  todayDate: string;
}

/**
 * Fetches active properties and FAQs from Supabase to inject
 * into the chatbot's system prompt for contextual awareness.
 */
export async function getChatContext(): Promise<ChatContext> {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  try {
    const [projectsResult, faqsResult] = await Promise.allSettled([
      supabaseAdmin
        .from('properties')
        .select('name, location, type, description, slug')
        .eq('status', 'active')
        .limit(20),
      supabaseAdmin.from('faqs').select('question, answer').limit(30),
    ]);

    const projects: ProjectData[] =
      projectsResult.status === 'fulfilled' ? (projectsResult.value.data ?? []) : [];

    const faqs: { question: string; answer: string }[] =
      faqsResult.status === 'fulfilled' ? (faqsResult.value.data ?? []) : [];

    return { projects, faqs, todayDate: today };
  } catch {
    return { projects: [], faqs: [], todayDate: today };
  }
}

/**
 * Builds a system prompt section describing available projects.
 */
export function buildProjectsContext(projects: ProjectData[]): string {
  if (projects.length === 0) return '';

  return projects
    .map(
      (p) => `- ${p.name} (${p.location}) — ${p.type}${p.description ? `: ${p.description}` : ''}`
    )
    .join('\n');
}

/**
 * Builds a system prompt section with FAQs.
 */
export function buildFAQsContext(faqs: { question: string; answer: string }[]): string {
  if (faqs.length === 0) return '';

  return faqs.map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n');
}
