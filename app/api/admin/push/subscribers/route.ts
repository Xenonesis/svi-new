import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export const dynamic = 'force-dynamic';

function parseUserAgent(ua: string | null): { browser: string; os: string; isMobile: boolean } {
  if (!ua) {
    return { browser: 'Unknown Browser', os: 'Unknown OS', isMobile: false };
  }

  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);

  let browser = 'Unknown Browser';
  if (/Edg\//i.test(ua)) browser = 'Microsoft Edge';
  else if (/Chrome\//i.test(ua)) browser = 'Google Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'Apple Safari';
  else if (/Firefox\//i.test(ua)) browser = 'Mozilla Firefox';
  else if (/Opera|OPR\//i.test(ua)) browser = 'Opera';

  let os = 'Unknown OS';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Macintosh|Mac OS/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return { browser, os, isMobile };
}

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { data: subscriptions, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('endpoint, user_agent, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw AppError.internal(`Failed to load subscriptions: ${error.message}`);
    }

    const items = (subscriptions || []).map((sub, idx) => {
      const parsed = parseUserAgent(sub.user_agent);
      return {
        id: `sub_${idx + 1}`,
        endpoint: sub.endpoint,
        browser: parsed.browser,
        os: parsed.os,
        isMobile: parsed.isMobile,
        createdAt: sub.created_at,
      };
    });

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const total = items.length;
    const mobileCount = items.filter((item) => item.isMobile).length;
    const desktopCount = total - mobileCount;
    const recentCount = items.filter(
      (item) => item.createdAt && new Date(item.createdAt).getTime() > sevenDaysAgo
    ).length;

    return NextResponse.json({
      success: true,
      stats: {
        total,
        mobile: mobileCount,
        desktop: desktopCount,
        recent: recentCount,
      },
      subscribers: items,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
