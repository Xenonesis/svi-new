import { convertToModelMessages, streamText, UIMessage, tool } from 'ai';
import { groq } from '@ai-sdk/groq';
import { z } from 'zod';
import { rateLimit } from '@/src/lib/api/rateLimit';
import { getChatContext, buildProjectsContext, buildFAQsContext } from '@/src/lib/chat-context';
import { type NextRequest } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  // Rate limit: 20 chat messages per IP per minute
  const limited = rateLimit(req, { limit: 20, windowSeconds: 60 });
  if (limited) return limited;

  const { messages }: { messages: UIMessage[] } = await req.json();

  // Fetch real project data & FAQs from the database
  const ctx = await getChatContext();
  const projectsText = buildProjectsContext(ctx.projects);
  const faqsText = buildFAQsContext(ctx.faqs);

  const systemPrompt = `You are a friendly and knowledgeable real estate assistant for SVI Infra Solutions Pvt. Ltd.

ABOUT THE COMPANY:
- Premium real estate developer with 15+ years of experience
- Headquarters: A-61 Sector 65, Noida, Uttar Pradesh 201309
- Phone: +91-73000-07643 | Email: info@sviinfrasolutions.com
- Website: https://sviinfrasolutions.com , https://sviiinfrasolutions.com 

AREAS OF OPERATION:
- Jaipur (residential & commercial)
- Noida (commercial properties)
- Phulera Smart City (Rajasthan)
- DMIC/DFC corridors

SERVICES:
- Residential Flats & Apartments
- Commercial Properties
- Property Management
- Real Estate Consultancy

CURRENT PROJECTS:
${projectsText || 'No active projects listed at the moment.'}

FREQUENTLY ASKED QUESTIONS:
${faqsText || 'Refer to the website for FAQ details.'}

Today's date: ${ctx.todayDate}

YOUR ROLE:
- Answer questions about SVI Infra's projects, services, and locations using the data above when possible
- Help users find suitable properties based on their needs
- Provide general real estate guidance
- PROACTIVELY QUALIFY LEADS: If a user shows buying intent (e.g. asking for prices, layouts, or site visits), casually ask for their requirements (name, phone, budget, timeline, preferred location, property type).
- When you have gathered their name, phone, and at least one other detail (budget/timeline/location), use the 'qualifyLead' tool to save their details and inform them a sales agent will contact them.
- CRITICAL: When using the 'qualifyLead' tool, you MUST ONLY output the exact parameter keys defined in the tool: 'name', 'phone', 'budget', 'timeline', 'location', 'propertyType'. Do NOT invent or add any extra parameters (like 'timeframe' or 'preferredTime').
- Direct users to contact the team via phone (+91-73000-07643) or email (info@sviinfrasolutions.com) for site visits or detailed inquiries
- Be warm, professional, and conversational

Keep responses concise and informative. When mentioning phone numbers, always use the format +91-73000-07643. When mentioning prices or property details, only share what's in the project data above — if you don't know a specific detail, direct the user to the sales team.

LANGUAGE AUTO-DETECTION & RESPONSE (CRITICAL):
- **IMPORTANT:** Before responding, FIRST detect the language the user wrote in
- **Hindi (Devanagari script):** If user writes in Hindi (हिंदी), respond fully in Hindi using Devanagari script
- **Hinglish:** If user mixes Hindi and English (e.g., "mujhe ghar chahiye in Jaipur"), respond in Hinglish too — Hindi words with English script, natural mix
- **English:** If user writes in pure English, respond in English
- **Other languages:** If user writes in Gujarati, Punjabi, Bengali, etc., detect and respond in that language if possible, otherwise use Hinglish
- **Tone:** For Hindi/Hinglish responses, use respectful terms like "जी", "कृपया", "धन्यवाद" naturally
- **Never switch languages mid-response** — stay consistent with the user's detected language`;

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: {
      qualifyLead: tool({
        description:
          'Qualify and save a lead after extracting their contact and preference details.',
        parameters: z.object({
          name: z.string().describe("The user's full name"),
          phone: z.string().describe("The user's phone number"),
          budget: z.string().optional().describe("The user's budget range (e.g. 50L - 1Cr)"),
          timeline: z
            .string()
            .optional()
            .describe('When the user is planning to buy (e.g. next 3 months)'),
          location: z.string().optional().describe('Preferred location (e.g. Noida, Jaipur)'),
          propertyType: z
            .string()
            .optional()
            .describe('Type of property (e.g. 3BHK, Commercial Shop)'),
        }),
        execute: async ({ name, phone, budget, timeline, location, propertyType }) => {
          try {
            const supabase = await createClient();
            await supabase.from('chat_leads').insert({
              name,
              phone,
              budget,
              timeline,
              location,
              property_type: propertyType,
              source: 'chatbot_qualified',
            });
            return 'Lead successfully saved! Tell the user that a sales representative has been notified and will contact them shortly with matching properties.';
          } catch (error) {
            console.error('Failed to save lead:', error);
            return 'Failed to save lead in database. Tell the user to please call +91-73000-07643 directly.';
          }
        },
      }),
    },
    maxSteps: 3,
  });

  return result.toUIMessageStreamResponse();
}
