import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { processClaimedFollowUp, processClaimedJob } from '@/src/lib/whatsapp/processor';

export const runtime = 'nodejs';
export const maxDuration = 60;

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get('authorization') === `Bearer ${secret}`);
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const worker = `whatsapp-cron:${randomUUID()}`;
  const [{ data: jobs, error: jobsError }, { data: followUps, error: followUpsError }] =
    await Promise.all([
      supabaseAdmin.rpc('claim_whatsapp_jobs', {
        p_limit: 10,
        p_worker: worker,
        p_lock_seconds: 120,
      }),
      supabaseAdmin.rpc('claim_whatsapp_followups', {
        p_limit: 10,
        p_worker: worker,
        p_lock_seconds: 120,
      }),
    ]);

  if (jobsError || followUpsError) {
    console.error('WhatsApp cron claim failed', {
      jobs: jobsError?.message,
      followUps: followUpsError?.message,
    });
    return NextResponse.json({ error: 'Could not claim WhatsApp work' }, { status: 500 });
  }

  const [jobResults, followUpResults] = await Promise.all([
    Promise.allSettled(
      (jobs ?? []).map((job: Parameters<typeof processClaimedJob>[0]) => processClaimedJob(job))
    ),
    Promise.allSettled(
      (followUps ?? []).map((followUp: Parameters<typeof processClaimedFollowUp>[0]) =>
        processClaimedFollowUp(followUp)
      )
    ),
  ]);

  return NextResponse.json({
    processedJobs: jobResults.length,
    processedFollowUps: followUpResults.length,
    failedJobs: jobResults.filter((result) => result.status === 'rejected').length,
    failedFollowUps: followUpResults.filter((result) => result.status === 'rejected').length,
  });
}

export const POST = GET;
